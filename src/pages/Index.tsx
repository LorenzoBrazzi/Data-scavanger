
import { useState, useEffect } from "react";
import UserDataForm from "@/components/UserDataForm";
import VulnerabilityReportView from "@/components/VulnerabilityReportView";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import { UserData, VulnerabilityReport, ApiResponse } from "@/types";
import { fetchVulnerabilityData } from "@/services/apiService";
import { formatDataForDisplay, generateReport } from "@/utils/reportGenerator";
import { AlertTriangle, Shield, Loader2 } from "lucide-react";
import { hasApiKey } from "@/services/apiKeyService";

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
      console.log("Starting vulnerability scan for primary email:", userData.email);
      console.log("Additional emails to scan:", userData.additionalEmails || []);
      if (userData.location) {
        console.log("Including location in scan:", userData.location);
      }
      
      // Create a tracking array for all emails being scanned
      const allEmails = [userData.email];
      if (userData.additionalEmails && userData.additionalEmails.length > 0) {
        allEmails.push(...userData.additionalEmails);
      }
      
      console.log(`Will scan a total of ${allEmails.length} emails:`, allEmails);
      
      // Track results for all emails
      const emailResults = [];
      let combinedApiResponse: ApiResponse | null = null;
      
      // Collect all web results across emails
      const allWebResults: Array<{
        position: number;
        title: string;
        link: string;
        displayed_link: string;
        snippet: string;
        snippet_highlighted_words: string[];
        sourceEmail?: string;
        sitelinks?: {
          inline?: Array<{
            title: string;
            link: string;
          }>;
          expanded?: Array<{
            title: string;
            link: string;
            snippet: string;
          }>;
        };
        cached_page_link?: string;
        related_pages_link?: string;
      }> = [];
      
      // Process each email, one at a time
      for (let i = 0; i < allEmails.length; i++) {
        const currentEmail = allEmails[i];
        console.log(`Processing email ${i+1} of ${allEmails.length}: ${currentEmail}`);
        
        // Create userData object for current email
        const currentUserData = {
          ...userData,
          email: currentEmail,
          // Set additionalEmails to empty to prevent recursive scanning
          additionalEmails: []
        };
        
        try {
          const currentResponse = await fetchVulnerabilityData(currentUserData);
          
          emailResults.push({
            email: currentEmail,
            breachCount: currentResponse.breaches.length,
            response: currentResponse
          });
          
          console.log(`Found ${currentResponse.breaches.length} breaches for ${currentEmail}`);
          
          // Collect web results from this email
          if (currentResponse.serpApi?.organic_results) {
            console.log(`Found ${currentResponse.serpApi.organic_results.length} web results for ${currentEmail}`);
            
            // Add email information to each result to track source
            const webResultsWithSource = currentResponse.serpApi.organic_results.map(result => ({
              ...result,
              sourceEmail: currentEmail,
              // Ensure all required properties exist
              displayed_link: result.displayed_link || result.link,
              snippet: result.snippet || "",
              snippet_highlighted_words: result.snippet_highlighted_words || []
            }));
            
            allWebResults.push(...webResultsWithSource);
          }
          
          // If this is the first email, use it as the base for merging
          if (i === 0) {
            combinedApiResponse = currentResponse;
          } else if (combinedApiResponse) {
            // Merge results with previously processed emails
            
            // Create a Map of existing breaches for quick lookup
            const uniqueBreaches = new Map();
            combinedApiResponse.breaches.forEach(breach => {
              uniqueBreaches.set(breach.Name, breach);
            });
            
            // Add new unique breaches
            const breachesBeforeMerge = uniqueBreaches.size;
            currentResponse.breaches.forEach(breach => {
              if (!uniqueBreaches.has(breach.Name)) {
                uniqueBreaches.set(breach.Name, breach);
              }
            });
            
            // Update combined breaches
            combinedApiResponse.breaches = Array.from(uniqueBreaches.values());
            console.log(`Added ${uniqueBreaches.size - breachesBeforeMerge} new unique breaches from ${currentEmail}`);
            
            // Update risk score (average of all scores)
            const oldRiskScore = combinedApiResponse.totalRiskScore;
            combinedApiResponse.totalRiskScore = Math.round(
              (oldRiskScore * i + currentResponse.totalRiskScore) / (i + 1)
            );
            console.log(`Updated risk score: ${oldRiskScore} → ${combinedApiResponse.totalRiskScore}`);
            
            // Update to highest risk level found
            const oldRiskLevel = combinedApiResponse.riskLevel;
            if (riskLevelPriority(currentResponse.riskLevel) > riskLevelPriority(combinedApiResponse.riskLevel)) {
              combinedApiResponse.riskLevel = currentResponse.riskLevel;
              console.log(`Updated risk level: ${oldRiskLevel} → ${combinedApiResponse.riskLevel}`);
            }
            
            // Merge exposed data types
            const oldExposedTypesCount = combinedApiResponse.exposedDataTypes.length;
            combinedApiResponse.exposedDataTypes = [
              ...new Set([...combinedApiResponse.exposedDataTypes, ...currentResponse.exposedDataTypes])
            ];
            console.log(`Added ${combinedApiResponse.exposedDataTypes.length - oldExposedTypesCount} new exposed data types from ${currentEmail}`);
            
            // Merge recommended actions
            const oldActionsCount = combinedApiResponse.recommendedActions.length;
            combinedApiResponse.recommendedActions = [
              ...new Set([...combinedApiResponse.recommendedActions, ...currentResponse.recommendedActions])
            ];
            console.log(`Added ${combinedApiResponse.recommendedActions.length - oldActionsCount} new recommended actions from ${currentEmail}`);
          }
        } catch (emailError) {
          console.error(`Error processing email ${currentEmail}:`, emailError);
          // Removed toast notification for email error
        }
      }
      
      if (!combinedApiResponse) {
        throw new Error("Failed to get results from any email addresses");
      }
      
      // Sort all web results by position to show most relevant first
      allWebResults.sort((a, b) => a.position - b.position);
      
      // Remove duplicates based on URL to avoid showing the same result multiple times
      const uniqueWebResults = Array.from(
        new Map(allWebResults.map(item => [item.link, item])).values()
      );
      
      // Log summary of combined web results
      console.log(`Combined web results from all emails: ${uniqueWebResults.length} unique results`);
      
      // Update the combinedApiResponse with the combined web results
      if (combinedApiResponse.serpApi) {
        combinedApiResponse.serpApi.organic_results = uniqueWebResults;
        
        // Update the search_information.total_results to reflect the combined total
        if (combinedApiResponse.serpApi.search_information) {
          combinedApiResponse.serpApi.search_information.total_results = 
            uniqueWebResults.length > 0 ? 
            Math.max(uniqueWebResults.length, combinedApiResponse.serpApi.search_information.total_results) : 
            combinedApiResponse.serpApi.search_information.total_results;
        }
      }
      
      // Log summary of multi-email scan with detailed breach information
      console.log(`Multi-email scan complete. Total unique breaches found: ${combinedApiResponse.breaches.length}`);
      console.log("Results by email:");
      emailResults.forEach(result => {
        console.log(`- ${result.email}: ${result.breachCount} breaches`);
      });
      
      console.log("All aggregated breaches:", combinedApiResponse.breaches.map(b => b.Name).join(', '));
      
      // Generate vulnerability report based on combined results
      const generatedReport = generateReport(
        userData.name,
        userData.email,
        combinedApiResponse,
        userData.password,
        userData.additionalEmails,
        userData.location
      );
      
      console.log("Report generation complete:");
      console.log(`- Total breaches: ${generatedReport.breachCount}`);
      console.log(`- Risk level: ${generatedReport.riskLevel}`);
      console.log(`- Risk score: ${generatedReport.totalRiskScore}`);
      console.log(`- Exposed data types: ${generatedReport.exposedDataTypes.length}`);
      console.log(`- Primary email: ${generatedReport.email}`);
      console.log(`- Additional emails: ${generatedReport.additionalEmails?.length || 0}`);
      console.log(`- Web results: ${generatedReport.webPresence?.organicResults.length || 0}`);
      if (generatedReport.location) {
        console.log(`- Location: ${generatedReport.location}`);
      }
      
      setReport(generatedReport);
      
      // Removed all toast notifications
    } catch (error) {
      console.error("Error generating report:", error);
      setScanError("Failed to complete the security scan. Please try again or check your connection.");
      // Removed toast notification for error
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to compare risk levels
  const riskLevelPriority = (risk: 'low' | 'medium' | 'high'): number => {
    switch (risk) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
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
