
import { ApiResponse, BreachData, VulnerabilityReport } from "@/types";
import { format } from "date-fns";

// Function to generate report based on API response
export const generateReport = (
  name: string, 
  email: string, 
  apiResponse: ApiResponse,
  password?: string,
  additionalEmails?: string[],
  location?: string
): VulnerabilityReport => {
  const {
    breaches,
    totalRiskScore,
    riskLevel,
    exposedDataTypes,
    recommendedActions,
    digitalFootprint,
    stats,
    serpApi
  } = apiResponse;

  // Generate simple password security assessment if password was provided
  const passwordSecurity = password ? {
    strength: calculatePasswordStrength(password),
    isCommon: isCommonPassword(password),
    compromised: hasPasswordBeenCompromised(password, breaches),
    suggestions: generatePasswordSuggestions(password)
  } : undefined;

  // Create web presence data from serpApi results (now combined from all emails)
  const webPresence = serpApi ? {
    totalResults: serpApi.search_information?.total_results || 0,
    organicResults: serpApi.organic_results.map(result => ({
      position: result.position,
      title: result.title,
      link: result.link,
      displayed_link: result.displayed_link || '',
      snippet: result.snippet || '',
      sourceEmail: result.sourceEmail // Include source email if available
    }))
  } : undefined;

  // Log the number of web results included in the report
  if (webPresence) {
    console.log(`Including ${webPresence.organicResults.length} web results in the final report`);
    
    // Log the first few results to debug
    if (webPresence.organicResults.length > 0) {
      console.log("First 3 web results:", webPresence.organicResults.slice(0, 3).map(r => ({
        title: r.title,
        link: r.link,
        sourceEmail: r.sourceEmail
      })));
    }
  }

  // Create the full vulnerability report
  const report: VulnerabilityReport = {
    name,
    email,
    additionalEmails,
    location,
    breachCount: breaches.length,
    breaches,
    riskLevel,
    exposedDataTypes,
    recommendedActions,
    scanDate: new Date().toISOString(),
    totalRiskScore,
    stats,
    digitalFootprint,
    webPresence,
    darkWebFindings: {
      mentions: breaches.filter(b => b.IsVerified && !b.IsSpamList).length,
      sources: getBreachSources(breaches),
      exposedInfo: exposedDataTypes
    },
    passwordSecurity
  };

  // Log a summary of the report for debugging
  console.log(`Report generated for ${email}:`, {
    breachCount: breaches.length,
    riskLevel,
    totalRiskScore,
    exposedDataTypesCount: exposedDataTypes.length,
    webResults: webPresence ? webPresence.organicResults.length : 0,
    additionalEmailsCount: additionalEmails?.length || 0
  });

  return report;
};

// Function to calculate password strength on a scale of 0-5
const calculatePasswordStrength = (password: string): number => {
  let score = 0;
  
  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Character variety checks
  if (/[A-Z]/.test(password)) score += 1; // Has uppercase
  if (/[0-9]/.test(password)) score += 1; // Has number
  if (/[^A-Za-z0-9]/.test(password)) score += 1; // Has special character
  
  return score;
};

// Function to check if the password is a common one
// This is a simplified version - in production, you'd check against a real database of common passwords
const isCommonPassword = (password: string): boolean => {
  const commonPasswords = [
    'password', '123456', 'qwerty', 'admin', 'welcome',
    'password123', '12345678', 'abc123', 'letmein', 'monkey'
  ];
  return commonPasswords.includes(password.toLowerCase());
};

// Check if the password has been compromised in any of the breaches
const hasPasswordBeenCompromised = (password: string, breaches: BreachData[]): boolean => {
  // In a real implementation, you would use a proper password breach API like HIBP's k-anonymity model
  // This is a simplified check that just looks for password breaches in the data
  return breaches.some(breach => 
    breach.DataClasses.some(dataClass => 
      dataClass.toLowerCase().includes('password')
    )
  );
};

// Generate password improvement suggestions
const generatePasswordSuggestions = (password: string): string[] => {
  const suggestions: string[] = [];
  
  if (password.length < 12) {
    suggestions.push('Use a longer password (at least 12 characters)');
  }
  
  if (!/[A-Z]/.test(password)) {
    suggestions.push('Include uppercase letters');
  }
  
  if (!/[0-9]/.test(password)) {
    suggestions.push('Include numbers');
  }
  
  if (!/[^A-Za-z0-9]/.test(password)) {
    suggestions.push('Include special characters');
  }
  
  if (suggestions.length === 0) {
    suggestions.push('Your password has good complexity');
  }
  
  suggestions.push('Consider using a password manager to generate and store strong passwords');
  
  return suggestions;
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
      additionalEmails: report.additionalEmails || [],
      breachCount: report.breachCount,
      riskLevel: report.riskLevel,
      scanDate: new Date(report.scanDate).toLocaleDateString(),
      totalRiskScore: report.totalRiskScore,
      webPresenceCount: report.webPresence?.organicResults.length || 0,
      webPresenceTotal: report.webPresence?.totalResults || 0
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
    webPresence: report.webPresence ? {
      totalResults: report.webPresence.totalResults,
      resultCount: report.webPresence.organicResults.length,
      topResults: report.webPresence.organicResults.slice(0, 5).map(result => ({
        title: result.title,
        link: result.link,
        snippet: result.snippet || '',
        sourceEmail: result.sourceEmail // Include source email in display data
      }))
    } : null,
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

// Helper function to get breach sources
const getBreachSources = (breaches: BreachData[]): Array<{ name: string; count: number; lastSeen?: string }> => {
  // Group breaches by domain to get counts
  const domains = breaches.map(breach => breach.Domain);
  const domainCounts: Record<string, number> = {};
  
  domains.forEach(domain => {
    if (domain) {
      domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    }
  });
  
  // Convert to required format
  return Object.keys(domainCounts).map(domain => ({
    name: domain,
    count: domainCounts[domain],
    // Use the most recent breach date for this domain as lastSeen
    lastSeen: getLastSeenForDomain(breaches, domain)
  }));
};

// Helper function to get the most recent breach date for a domain
const getLastSeenForDomain = (breaches: BreachData[], domain: string): string | undefined => {
  const domainBreaches = breaches.filter(breach => breach.Domain === domain);
  if (domainBreaches.length === 0) return undefined;
  
  // Sort by breach date descending and get the most recent one
  const sortedBreaches = [...domainBreaches].sort(
    (a, b) => new Date(b.BreachDate).getTime() - new Date(a.BreachDate).getTime()
  );
  
  return sortedBreaches[0].BreachDate;
};

// Helper function to check password security
const checkPasswordSecurity = (password: string, breaches: BreachData[]): { strength: number, isCommon: boolean, compromised: boolean, suggestions: string[] } => {
  const strength = calculatePasswordStrength(password);
  const isCommon = isCommonPassword(password);
  const compromised = hasPasswordBeenCompromised(password, breaches);
  const suggestions = generatePasswordSuggestions(password);
  return { strength, isCommon, compromised, suggestions };
};
