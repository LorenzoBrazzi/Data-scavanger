
import { useState, useEffect } from "react";
import UserDataForm from "@/components/UserDataForm";
import VulnerabilityReportView from "@/components/VulnerabilityReportView";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import ApiRequiredNotice from "@/components/ApiRequiredNotice";
import { UserData, VulnerabilityReport, ApiResponse } from "@/types";
import { fetchVulnerabilityData } from "@/services/apiService";
import { formatDataForDisplay, generateReport } from "@/utils/reportGenerator";
import { AlertTriangle, Shield, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { hasApiKey } from "@/services/apiKeyService";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<VulnerabilityReport | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [hasHibpApi, setHasHibpApi] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if HIBP API key is configured
    const checkApiKeys = async () => {
      try {
        const hibpConfigured = await hasApiKey('hibp');
        setHasHibpApi(hibpConfigured);
      } catch (error) {
        console.error("Error checking API keys:", error);
        setHasHibpApi(false);
      }
    };
    
    checkApiKeys();
  }, []);

  const handleSubmit = async (userData: UserData) => {
    setIsLoading(true);
    setScanError(null);
    
    try {
      console.log("Starting vulnerability scan for:", userData);
      
      // Fetch data from all APIs
      const apiResponse: ApiResponse = await fetchVulnerabilityData(userData);
      
      // Generate vulnerability report
      const generatedReport = generateReport(
        userData.name,
        userData.email,
        apiResponse
      );
      
      // Log formatted report data for debugging
      console.log("Generated report data:", formatDataForDisplay(generatedReport));
      
      setReport(generatedReport);
      
      // Show toast notification based on risk level
      if (generatedReport.riskLevel === 'high') {
        toast.error("High risk level detected! Please review the report carefully.", {
          icon: <AlertTriangle className="h-4 w-4" />,
          duration: 5000,
        });
      } else if (generatedReport.riskLevel === 'medium') {
        toast.warning("Some vulnerabilities were found. We recommend taking action.", {
          duration: 4000,
        });
      } else if (generatedReport.breachCount > 0) {
        toast.info("Minor vulnerabilities detected.", {
          duration: 3000,
        });
      } else {
        toast.success("No vulnerabilities detected. Your data appears to be secure!", {
          icon: <Shield className="h-4 w-4" />,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error generating report:", error);
      setScanError("Failed to complete the security scan. Please try again or check your connection.");
      toast.error("An error occurred while generating your report. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setReport(null);
    setScanError(null);
  };

  return (
    <div className="min-h-screen flex flex-col py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-background/95">
      <div className="flex flex-col items-center justify-center flex-grow">
        {!report ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">
                Data Risk Scavenger
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                Discover if your personal information has been exposed in data breaches and learn how to better protect your digital identity.
              </p>
            </div>
            
            <div className="mb-6 text-center">
              <div className="p-4 bg-amber-100 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-md">
                <h3 className="text-lg font-medium flex items-center justify-center gap-2 text-amber-800 dark:text-amber-300">
                  <Info className="h-5 w-5" />
                  API Keys Required
                </h3>
                <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
                  This application requires API keys to access various security services.
                </p>
                <div className="mt-4">
                  <Link to="/api-keys">
                    <Button variant="outline" size="sm">
                      Configure API Keys
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            {hasHibpApi === false && (
              <ApiRequiredNotice 
                service="Have I Been Pwned" 
                description="This service requires an API key to check if your email has been involved in data breaches." 
              />
            )}
            
            {isLoading ? (
              <div className="w-full max-w-md p-6 bg-primary/10 backdrop-blur-sm rounded-lg shadow-lg border border-primary/20 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
                <h3 className="text-lg font-semibold mb-2">Scanning Digital Footprint</h3>
                <p className="text-muted-foreground text-center text-sm">
                  We're checking multiple data sources for information about your digital exposure. This may take a moment...
                </p>
              </div>
            ) : (
              <>
                <UserDataForm onSubmit={handleSubmit} loading={isLoading} />
                
                {scanError && (
                  <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md">
                    <p className="text-sm font-medium">{scanError}</p>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <VulnerabilityReportView report={report} onReset={handleReset} />
        )}
      </div>
      
      <footer className="mt-8 text-center text-xs text-muted-foreground">
        <p>
          This application is for educational purposes only. <br />
          For more comprehensive security checks, please consult cybersecurity professionals.
        </p>
      </footer>
      
      {/* QR Code Component */}
      <QRCodeDisplay />
    </div>
  );
};

export default Index;
