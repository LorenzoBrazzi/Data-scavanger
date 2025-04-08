import { BreachData, UserData, ApiResponse, SocialSearcherData, EmailRepData, SherlockData, SerpApiData } from "@/types";
import { checkBreaches } from "./hibpService";
import { checkSocialSearcher } from "./socialSearcherService";
import { checkSherlock } from "./sherlockService";
import { checkEmailRep } from "./emailRepService";
import { searchSerpApi } from "./serpApiService";
import { toast } from "sonner";
import { hasApiKey } from "./apiKeyService";

// This is our main service that orchestrates all API calls
export const fetchVulnerabilityData = async (userData: UserData): Promise<ApiResponse> => {
  try {
    // Step 1: Validate input (basic validation done in the UI)
    if (!userData.email || !userData.name) {
      throw new Error("Email and name are required");
    }

    console.log("Starting vulnerability scan for:", userData.email);
    toast.info("Starting comprehensive scan. This may take a moment...");
    
    const requestStartTime = performance.now();
    
    // Check which APIs are configured
    const [hasHibpKey, hasSherlockKey, hasEmailRepKey] = await Promise.all([
      hasApiKey('hibp'),
      hasApiKey('sherlock'),
      hasApiKey('emailrep')
    ]);

    // Show warning if key APIs are not configured
    if (!hasHibpKey) {
      toast.warning("Have I Been Pwned API key not configured. Some features will be limited.");
    }
    
    // Step 2: Initiate all API requests in parallel for efficiency
    const [
      breachesData, 
      socialSearcherData,
      sherlockData,
      emailRepData,
      serpApiData
    ] = await Promise.all([
      checkBreaches(userData.email).then(data => {
        console.log(`HIBP scan complete: ${data.length} breaches found`);
        return data;
      }).catch(error => {
        console.error("Error in HIBP service:", error);
        toast.error("Breach data scan failed.");
        return [];
      }),
      
      checkSocialSearcher(userData.email, userData.name).then(data => {
        console.log("Social Searcher scan complete:", !!data);
        return data;
      }).catch(error => {
        console.error("Error in Social Searcher service:", error);
        return null;
      }),
      
      // Use username derived from email for Sherlock
      userData.username ? checkSherlock(userData.username).then(data => {
        console.log("Sherlock scan complete:", !!data);
        return data;
      }).catch(error => {
        console.error("Error in Sherlock service:", error);
        return null;
      }) : Promise.resolve(null),
      
      checkEmailRep(userData.email).then(data => {
        console.log("EmailRep scan complete:", !!data);
        return data;
      }).catch(error => {
        console.error("Error in EmailRep service:", error);
        return null;
      }),
      
      // Search for username/email in search engines
      searchSerpApi(`${userData.name} ${userData.email}`).then(data => {
        console.log("SerpAPI search complete:", !!data);
        return data;
      }).catch(error => {
        console.error("Error in SerpAPI service:", error);
        return null;
      })
    ]);

    const requestEndTime = performance.now();
    console.log(`All API requests completed in ${Math.round(requestEndTime - requestStartTime)}ms`);

    // Step 3: Aggregate all responses
    const exposedDataTypes = extractAllExposedDataTypes(breachesData);
    const digitalFootprint = generateDigitalFootprint(socialSearcherData, sherlockData, serpApiData);
    const recommendedActions = generateRecommendedActions(breachesData, emailRepData);
    const riskLevel = determineOverallRiskLevel(breachesData, emailRepData, socialSearcherData);
    const riskScore = calculateTotalRiskScore(breachesData, emailRepData, socialSearcherData, exposedDataTypes);
    
    // Generate statistics with actual data for data visualization
    const stats = generateStatistics(breachesData, exposedDataTypes, digitalFootprint);

    // Step 4: Process and return aggregated data
    const aggregatedData: ApiResponse = {
      breaches: breachesData,
      socialSearcherData,
      emailRep: emailRepData,
      sherlock: sherlockData,
      serpApi: serpApiData,
      totalRiskScore: riskScore,
      riskLevel,
      exposedDataTypes,
      recommendedActions,
      digitalFootprint,
      stats
    };

    console.log("Risk assessment complete:", {
      riskLevel,
      riskScore,
      breachCount: breachesData.length,
      exposedDataCount: exposedDataTypes.length
    });

    return aggregatedData;
  } catch (error) {
    console.error("Error fetching vulnerability data:", error);
    toast.error("Failed to complete the security check. Please try again.");
    throw error;
  }
};

// Extract all data types exposed in breaches
const extractAllExposedDataTypes = (breaches: BreachData[]): string[] => {
  // Get unique data types from breaches
  const breachDataTypes = new Set<string>();
  if (breaches) {
    breaches.forEach(breach => {
      breach.DataClasses.forEach(dataClass => {
        breachDataTypes.add(dataClass);
      });
    });
  }
  
  return Array.from(breachDataTypes);
};

// Generate digital footprint from available data sources
const generateDigitalFootprint = (
  socialSearcherData: SocialSearcherData | null,
  sherlockData: SherlockData | null,
  serpApiData: any | null
) => {
  // Collect social profiles from Sherlock data
  const socialProfiles: Array<{
    network: string;
    username?: string;
    url?: string;
  }> = [];
  
  if (sherlockData && sherlockData.found) {
    sherlockData.found.forEach((profile: any) => {
      socialProfiles.push({
        network: profile.site,
        url: profile.url
      });
    });
  }
  
  // Add web presence from SerpAPI results
  const webPresence: Array<{
    title: string;
    url: string;
    snippet?: string;
  }> = [];
  
  if (serpApiData && serpApiData.organic_results) {
    serpApiData.organic_results.forEach((result: any) => {
      webPresence.push({
        title: result.title,
        url: result.link,
        snippet: result.snippet
      });
    });
  }
  
  return {
    socialProfiles,
    webPresence
  };
};

// Generate recommended actions based on findings
const generateRecommendedActions = (
  breaches: BreachData[],
  emailRepData: EmailRepData | null
): string[] => {
  const actions: string[] = [];
  
  // Basic recommendations for everyone
  actions.push("Use a password manager to create and store strong, unique passwords");
  actions.push("Enable two-factor authentication on all important accounts");
  
  // Recommendations based on breaches
  if (breaches && breaches.length > 0) {
    actions.push("Change passwords for all accounts associated with your email");
    
    // Check for specific data types in breaches
    const breachTypes = new Set<string>();
    breaches.forEach(breach => {
      breach.DataClasses.forEach(dataClass => {
        breachTypes.add(dataClass.toLowerCase());
      });
    });
    
    if (breachTypes.has("passwords") || breachTypes.has("password")) {
      actions.push("Immediately change passwords on all accounts, starting with financial and email accounts");
    }
    
    if (breachTypes.has("credit cards") || breachTypes.has("credit card") || breachTypes.has("payment info")) {
      actions.push("Check your credit card statements for unauthorized charges");
      actions.push("Consider requesting a new credit card from your bank");
    }
    
    if (breachTypes.has("phone numbers") || breachTypes.has("phone number")) {
      actions.push("Be cautious of unexpected calls or SMS messages that may be phishing attempts");
    }
    
    if (breachTypes.has("security questions") || breachTypes.has("security question")) {
      actions.push("Update security questions and answers on your important accounts");
    }
  }
  
  // Recommendations based on EmailRep findings
  if (emailRepData) {
    if (emailRepData.suspicious) {
      actions.push("Your email address appears suspicious. Consider using a different email address for important accounts.");
    }
    
    if (emailRepData.details && emailRepData.details.credentials_leaked) {
      actions.push("Credentials for this email have been leaked. Change all passwords immediately.");
    }
    
    if (emailRepData.details && emailRepData.details.data_breach) {
      actions.push("This email appears in data breaches. Review all account security.");
    }
  }
  
  // Add a recommendation to use the service regularly
  actions.push("Regularly scan your email for new breaches and data exposures");
  
  return actions;
};

// Determine the overall risk level based on all findings
const determineOverallRiskLevel = (
  breaches: BreachData[],
  emailRepData: EmailRepData | null,
  socialSearcherData: SocialSearcherData | null
): 'low' | 'medium' | 'high' => {
  let riskScore = 0;
  let maxScore = 0;
  
  // Risk from breaches (0-50 points)
  maxScore += 50;
  if (breaches && breaches.length > 0) {
    // Up to 30 points based on number of breaches
    riskScore += Math.min(breaches.length * 3, 30);
    
    // Up to 20 additional points based on sensitive data exposure
    const sensitiveDataTypes = [
      "passwords", "credit cards", "social security numbers", "financial data", 
      "security questions", "phone numbers", "addresses"
    ];
    
    let sensitiveBreach = false;
    breaches.forEach(breach => {
      breach.DataClasses.forEach(dataClass => {
        if (sensitiveDataTypes.includes(dataClass.toLowerCase())) {
          sensitiveBreach = true;
        }
      });
    });
    
    if (sensitiveBreach) {
      riskScore += 20;
    }
  }
  
  // Risk from EmailRep findings (0-30 points)
  maxScore += 30;
  if (emailRepData) {
    // 15 points if email is suspicious
    if (emailRepData.suspicious) {
      riskScore += 15;
    }
    
    // 10 points if credentials leaked
    if (emailRepData.details && emailRepData.details.credentials_leaked) {
      riskScore += 10;
    }
    
    // 5 points if data breach
    if (emailRepData.details && emailRepData.details.data_breach) {
      riskScore += 5;
    }
  }
  
  // Risk from social media exposure (0-20 points)
  maxScore += 20;
  if (socialSearcherData && socialSearcherData.posts && socialSearcherData.posts.length > 0) {
    // Up to 10 points based on number of posts
    riskScore += Math.min(socialSearcherData.posts.length, 10);
    
    // Up to 10 points based on negative sentiment
    if (socialSearcherData.sentiment && socialSearcherData.sentiment.negative > 0) {
      riskScore += Math.min(socialSearcherData.sentiment.negative, 10);
    }
  }
  
  // Normalize to a 0-100 scale
  const normalizedScore = (riskScore / maxScore) * 100;
  
  if (normalizedScore >= 60) return 'high';
  if (normalizedScore >= 30) return 'medium';
  return 'low';
};

// Calculate a total risk score based on all inputs
const calculateTotalRiskScore = (
  breaches: BreachData[],
  emailRepData: EmailRepData | null,
  socialSearcherData: SocialSearcherData | null,
  exposedDataTypes: string[]
): number => {
  let score = 0;
  
  // Score from number of breaches (0-40 points)
  if (breaches && breaches.length > 0) {
    score += Math.min(breaches.length * 5, 40);
  }
  
  // Score from types of exposed data (0-25 points)
  const criticalDataTypes = [
    "passwords", "credit cards", "payment info", "social security numbers", 
    "government issued ids", "financial data", "bank account numbers"
  ];
  
  const mediumRiskDataTypes = [
    "phone numbers", "physical addresses", "security questions", "dates of birth"
  ];
  
  const lowRiskDataTypes = [
    "email addresses", "names", "usernames", "employers", "job titles", "genders"
  ];
  
  let criticalCount = 0;
  let mediumCount = 0;
  let lowCount = 0;
  
  exposedDataTypes.forEach(type => {
    if (criticalDataTypes.includes(type.toLowerCase())) {
      criticalCount++;
    } else if (mediumRiskDataTypes.includes(type.toLowerCase())) {
      mediumCount++;
    } else if (lowRiskDataTypes.includes(type.toLowerCase())) {
      lowCount++;
    }
  });
  
  score += Math.min(criticalCount * 5, 15); // Up to 15 points for critical data
  score += Math.min(mediumCount * 2, 7); // Up to 7 points for medium risk data
  score += Math.min(lowCount * 0.5, 3); // Up to 3 points for low risk data
  
  // Score from EmailRep findings (0-20 points)
  if (emailRepData) {
    if (emailRepData.suspicious) score += 10;
    if (emailRepData.details && emailRepData.details.credentials_leaked) score += 10;
  }
  
  // Score from social media exposure (0-15 points)
  if (socialSearcherData && socialSearcherData.posts) {
    const postCount = socialSearcherData.posts.length;
    score += Math.min(postCount, 7);
    
    if (socialSearcherData.sentiment && socialSearcherData.sentiment.negative > 0) {
      score += Math.min(socialSearcherData.sentiment.negative, 8);
    }
  }
  
  return Math.min(Math.round(score), 100); // Cap at 100
};

// Generate statistics for data visualization
const generateStatistics = (
  breaches: BreachData[],
  exposedDataTypes: string[],
  digitalFootprint: any
) => {
  // Count breaches by data category
  const dataExposureByCategory: Record<string, number> = {};
  
  exposedDataTypes.forEach(type => {
    // Count how many breaches contain this data type
    let count = 0;
    breaches.forEach(breach => {
      if (breach.DataClasses.some(dataClass => 
        dataClass.toLowerCase() === type.toLowerCase() ||
        dataClass.toLowerCase().includes(type.toLowerCase()) ||
        type.toLowerCase().includes(dataClass.toLowerCase())
      )) {
        count++;
      }
    });
    dataExposureByCategory[type] = count;
  });
  
  // Create breach timeline data using actual breach dates
  const breachTimelineMap = new Map<string, number>();
  
  breaches.forEach(breach => {
    // Format date as YYYY-MM
    const date = breach.BreachDate.substring(0, 7);
    const current = breachTimelineMap.get(date) || 0;
    breachTimelineMap.set(date, current + 1);
  });
  
  // Sort timeline data by date
  const timeline = Array.from(breachTimelineMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  // Calculate risk score by data type based on actual breach data
  const riskByDataType = exposedDataTypes.map(type => {
    // Assign risk scores based on data sensitivity and actual breach frequency
    const criticalDataTypes = [
      "passwords", "credit cards", "payment info", "social security numbers", 
      "government issued ids", "financial data", "bank account numbers"
    ];
    
    const mediumRiskDataTypes = [
      "phone numbers", "physical addresses", "security questions", "dates of birth"
    ];
    
    // Count breaches that exposed this data type
    const breachesWithType = breaches.filter(breach => 
      breach.DataClasses.some(dataClass => 
        dataClass.toLowerCase() === type.toLowerCase() ||
        dataClass.toLowerCase().includes(type.toLowerCase()) ||
        type.toLowerCase().includes(dataClass.toLowerCase())
      )
    ).length;
    
    // Base risk on data type sensitivity and breach frequency
    let baseRisk = 0;
    if (criticalDataTypes.some(critType => type.toLowerCase().includes(critType) || critType.includes(type.toLowerCase()))) {
      baseRisk = 70; // Critical data starts at high risk
    } else if (mediumRiskDataTypes.some(medType => type.toLowerCase().includes(medType) || medType.includes(type.toLowerCase()))) {
      baseRisk = 40; // Medium risk data starts at medium risk
    } else {
      baseRisk = 10; // Low risk data starts at low risk
    }
    
    // Add additional risk based on actual breach frequency (up to 30 additional points)
    const frequencyRisk = Math.min(breachesWithType * 5, 30);
    
    return { 
      type, 
      riskScore: Math.min(baseRisk + frequencyRisk, 100) 
    };
  });
  
  // Calculate digital presence score based on actual profile data
  let digitalPresenceScore = 0;
  
  // Base score on social profile count (actual data)
  if (digitalFootprint && digitalFootprint.socialProfiles) {
    digitalPresenceScore += Math.min(digitalFootprint.socialProfiles.length * 10, 50);
  }
  
  // Add score for web presence (actual data)
  if (digitalFootprint && digitalFootprint.webPresence) {
    digitalPresenceScore += Math.min(digitalFootprint.webPresence.length * 2, 30);
  }
  
  // Cap at 100
  digitalPresenceScore = Math.min(digitalPresenceScore, 100);
  
  return {
    breachCount: breaches.length,
    dataExposureByCategory,
    breachTimeline: timeline,
    riskByDataType,
    digitalPresenceScore
  };
};
