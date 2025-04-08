
import { ApiResponse, BreachData, VulnerabilityReport } from "@/types";

export const generateReport = (name: string, email: string, apiResponse: ApiResponse): VulnerabilityReport => {
  const {
    breaches,
    totalRiskScore,
    riskLevel,
    exposedDataTypes,
    recommendedActions,
    digitalFootprint,
    stats
  } = apiResponse;

  // Create the full vulnerability report
  const report: VulnerabilityReport = {
    email,
    name,
    breachCount: breaches.length,
    breaches,
    riskLevel,
    exposedDataTypes,
    recommendedActions,
    scanDate: new Date().toISOString(),
    totalRiskScore,
    stats,
    digitalFootprint
  };

  // Log a summary of the report for debugging
  console.log(`Report generated for ${email}:`, {
    breachCount: breaches.length,
    riskLevel,
    totalRiskScore,
    exposedDataTypesCount: exposedDataTypes.length
  });

  return report;
};

// Helper function to calculate severity based on risk score
export const calculateSeverity = (riskScore: number): 'low' | 'medium' | 'high' => {
  if (riskScore >= 70) return 'high';
  if (riskScore >= 40) return 'medium';
  return 'low';
};

// Helper function to format data for display
export const formatDataForDisplay = (report: VulnerabilityReport): any => {
  // Create a formatted version of the report for display purposes
  return {
    summary: {
      email: report.email,
      name: report.name,
      breachCount: report.breachCount,
      riskLevel: report.riskLevel,
      scanDate: new Date(report.scanDate).toLocaleDateString(),
      totalRiskScore: report.totalRiskScore
    },
    breaches: report.breaches.map(breach => ({
      name: breach.Title,
      domain: breach.Domain,
      date: new Date(breach.BreachDate).toLocaleDateString(),
      dataExposed: breach.DataClasses.join(', '),
      description: breach.Description
    })),
    exposedData: report.exposedDataTypes,
    actions: report.recommendedActions,
    passwordInfo: report.passwordSecurity ? {
      strength: report.passwordSecurity.strength,
      isCommon: report.passwordSecurity.isCommon ? 'Yes' : 'No',
      compromised: report.passwordSecurity.compromised ? 'Yes' : 'No',
      suggestions: report.passwordSecurity.suggestions
    } : null,
    darkWebInfo: report.darkWebFindings ? {
      mentions: report.darkWebFindings.mentions,
      sources: report.darkWebFindings.sources.map(source => ({
        name: source.name,
        count: source.count,
        lastSeen: source.lastSeen ? new Date(source.lastSeen).toLocaleDateString() : 'Unknown'
      })),
      exposedInfo: report.darkWebFindings.exposedInfo
    } : null
  };
};
