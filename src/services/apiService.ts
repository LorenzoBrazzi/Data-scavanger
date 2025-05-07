import { BreachData, UserData, ApiResponse, SocialSearcherData, EmailRepData, SherlockData, SerpApiData } from "@/types";
import { checkBreaches } from "./hibpService";
import { checkSocialSearcher } from "./socialSearcherService";
import { checkSherlock } from "./sherlockService";
import { checkEmailRep } from "./emailRepService";
import { searchSerpApi } from "./serpApiService";
import { toast } from "sonner";
import { hasApiKey } from "./apiKeyService";

export const fetchVulnerabilityData = async (userData: UserData): Promise<ApiResponse> => {
  try {
    if (!userData.email || !userData.name) {
      throw new Error("Email and name are required");
    }

    console.log(`Starting vulnerability scan for email: ${userData.email}`);
    console.log(`User data for scan: name=${userData.name}, username=${userData.username || "not provided"}`);
    toast.info("Starting comprehensive scan. This may take a moment...");

    const requestStartTime = performance.now();

    const [hasHibpKey, hasSherlockKey, hasEmailRepKey] = await Promise.all([
      hasApiKey('hibp'),
      hasApiKey('sherlock'),
      hasApiKey('emailrep')
    ]);

    if (!hasHibpKey) {
      toast.warning("Have I Been Pwned API key not configured. Some features will be limited.");
    }

    // Start each service check with specific email logging
    console.log(`Checking HIBP breaches for: ${userData.email}`);
    console.log(`Checking Social Searcher for: ${userData.email} and name: ${userData.name}`);
    if (userData.username) console.log(`Checking Sherlock for username: ${userData.username}`);
    console.log(`Checking EmailRep for: ${userData.email}`);
    console.log(`Checking SerpApi for: "${userData.name} ${userData.email}"`);

    const [
      breachesData, 
      socialSearcherData,
      sherlockData,
      emailRepData,
      serpApiData
    ] = await Promise.all([
      checkBreaches(userData.email).then(data => {
        console.log(`HIBP scan complete for ${userData.email}: ${data.length} breaches found`);
        return data;
      }).catch(error => {
        console.error(`Error in HIBP service for ${userData.email}:`, error);
        toast.error("Breach data scan failed.");
        return [];
      }),
      
      checkSocialSearcher(userData.email, userData.name).then(data => {
        console.log(`Social Searcher scan complete for ${userData.email}:`, !!data);
        return data;
      }).catch(error => {
        console.error(`Error in Social Searcher service for ${userData.email}:`, error);
        return null;
      }),
      
      userData.username ? checkSherlock(userData.username).then(data => {
        console.log(`Sherlock scan complete for username ${userData.username}:`, !!data);
        return data;
      }).catch(error => {
        console.error(`Error in Sherlock service for username ${userData.username}:`, error);
        return null;
      }) : Promise.resolve(null),
      
      checkEmailRep(userData.email).then(data => {
        console.log(`EmailRep scan complete for ${userData.email}:`, !!data);
        return data;
      }).catch(error => {
        console.error(`Error in EmailRep service for ${userData.email}:`, error);
        return null;
      }),
      
      searchSerpApi(`${userData.name} ${userData.email}`).then(data => {
        console.log(`SerpAPI search complete for "${userData.name} ${userData.email}":`, !!data);
        return data;
      }).catch(error => {
        console.error(`Error in SerpAPI service for ${userData.email}:`, error);
        return null;
      })
    ]);

    const requestEndTime = performance.now();
    console.log(`All API requests for ${userData.email} completed in ${Math.round(requestEndTime - requestStartTime)}ms`);

    const exposedDataTypes = extractAllExposedDataTypes(breachesData);
    const digitalFootprint = generateDigitalFootprint(socialSearcherData, sherlockData, serpApiData);
    const recommendedActions = generateRecommendedActions(breachesData, emailRepData);
    const riskLevel = determineOverallRiskLevel(breachesData, emailRepData, socialSearcherData, serpApiData);
    const riskScore = calculateTotalRiskScore(breachesData, emailRepData, socialSearcherData, exposedDataTypes, serpApiData);

    const stats = generateStatistics(breachesData, exposedDataTypes, digitalFootprint, serpApiData);

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

    console.log(`Risk assessment for ${userData.email} complete:`, {
      riskLevel,
      riskScore,
      breachCount: breachesData.length,
      exposedDataCount: exposedDataTypes.length,
      webResultsCount: serpApiData?.organic_results?.length || 0
    });

    return aggregatedData;
  } catch (error) {
    console.error("Error fetching vulnerability data:", error);
    toast.error("Failed to complete the security check. Please try again.");
    throw error;
  }
};

const extractAllExposedDataTypes = (breaches: BreachData[]): string[] => {
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

const generateDigitalFootprint = (
  socialSearcherData: SocialSearcherData | null,
  sherlockData: SherlockData | null,
  serpApiData: any | null
) => {
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
  
  const webPresence = serpApiData?.organic_results?.map((result: any) => ({
    title: result.title,
    url: result.link,
    snippet: result.snippet || '',
    displayed_link: result.displayed_link || ''
  })) || [];

  const professionalInfo = extractProfessionalInfo(serpApiData);
  
  const locations = extractLocations(serpApiData);
  
  return {
    socialProfiles,
    webPresence,
    professionalInfo,
    locations
  };
};

const extractProfessionalInfo = (serpApiData: any): Array<{ company: string; title?: string; period?: string }> => {
  if (!serpApiData || !serpApiData.organic_results) return [];
  
  const professionalInfo: Array<{ company: string; title?: string; period?: string }> = [];
  const companies = new Set<string>();
  
  serpApiData.organic_results.forEach((result: any) => {
    const isLinkedIn = result.link?.includes('linkedin.com') || result.displayed_link?.includes('linkedin.com');
    const title = result.title || '';
    
    if (isLinkedIn) {
      const titleMatch = title.match(/(?:–|–|at|@)\s*([^–]+)(?:\s*–|$)/i);
      const company = titleMatch ? titleMatch[1].trim() : null;
      
      if (company && !companies.has(company)) {
        companies.add(company);
        
        const jobInfo: { company: string; title?: string; period?: string } = {
          company: company
        };
        
        const jobTitleMatch = title.match(/^([^–]+)(?:\s*–|$)/i);
        if (jobTitleMatch) {
          jobInfo.title = jobTitleMatch[1].trim();
        }
        
        professionalInfo.push(jobInfo);
      }
    }
  });
  
  return professionalInfo;
};

const extractLocations = (serpApiData: any): string[] => {
  if (!serpApiData || !serpApiData.organic_results) return [];
  
  const locationSet = new Set<string>();
  
  const locationPatterns = [
    /\bin\s+([A-Za-z\s]+,\s*[A-Za-z\s]+)/i,
    /\bfrom\s+([A-Za-z\s]+,\s*[A-Za-z\s]+)/i,
    /\bliving\s+in\s+([A-Za-z\s]+(?:,\s*[A-Za-z\s]+)?)/i,
    /\bbased\s+in\s+([A-Za-z\s]+(?:,\s*[A-Za-z\s]+)?)/i
  ];
  
  serpApiData.organic_results.forEach((result: any) => {
    const textToSearch = `${result.title || ''} ${result.snippet || ''}`;
    
    locationPatterns.forEach(pattern => {
      const match = textToSearch.match(pattern);
      if (match && match[1]) {
        locationSet.add(match[1].trim());
      }
    });
  });
  
  return Array.from(locationSet);
};

const generateRecommendedActions = (
  breaches: BreachData[],
  emailRepData: EmailRepData | null
): string[] => {
  const actions: string[] = [];
  
  actions.push("Use a password manager to create and store strong, unique passwords");
  actions.push("Enable two-factor authentication on all important accounts");
  
  if (breaches && breaches.length > 0) {
    actions.push("Change passwords for all accounts associated with your email");
    
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
  
  actions.push("Regularly scan your email for new breaches and data exposures");
  
  return actions;
};

const determineOverallRiskLevel = (
  breaches: BreachData[],
  emailRepData: EmailRepData | null,
  socialSearcherData: SocialSearcherData | null,
  serpApiData: any | null
): 'low' | 'medium' | 'high' => {
  let riskScore = 0;
  let maxScore = 0;
  
  maxScore += 50;
  if (breaches && breaches.length > 0) {
    riskScore += Math.min(breaches.length * 3, 30);
    
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
  
  maxScore += 30;
  if (emailRepData) {
    if (emailRepData.suspicious) {
      riskScore += 15;
    }
    
    if (emailRepData.details && emailRepData.details.credentials_leaked) {
      riskScore += 10;
    }
    
    if (emailRepData.details && emailRepData.details.data_breach) {
      riskScore += 5;
    }
  }
  
  maxScore += 15;
  if (socialSearcherData && socialSearcherData.posts && socialSearcherData.posts.length > 0) {
    riskScore += Math.min(socialSearcherData.posts.length, 7);
    
    if (socialSearcherData.sentiment && socialSearcherData.sentiment.negative > 0) {
      riskScore += Math.min(socialSearcherData.sentiment.negative, 8);
    }
  }
  
  maxScore += 15;
  if (serpApiData && serpApiData.organic_results) {
    const webResultsCount = serpApiData.organic_results.length;
    riskScore += Math.min(Math.round(webResultsCount * 1.5), 15);
  }
  
  const normalizedScore = (riskScore / maxScore) * 100;
  
  if (normalizedScore >= 60) return 'high';
  if (normalizedScore >= 30) return 'medium';
  return 'low';
};

const calculateTotalRiskScore = (
  breaches: BreachData[],
  emailRepData: EmailRepData | null,
  socialSearcherData: SocialSearcherData | null,
  exposedDataTypes: string[],
  serpApiData: any | null
): number => {
  let score = 0;
  
  if (breaches && breaches.length > 0) {
    score += Math.min(breaches.length * 5, 40);
  }
  
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
  
  score += Math.min(criticalCount * 5, 15);
  score += Math.min(mediumCount * 2, 7);
  score += Math.min(lowCount * 0.5, 3);
  
  if (emailRepData) {
    if (emailRepData.suspicious) score += 10;
    if (emailRepData.details && emailRepData.details.credentials_leaked) score += 10;
  }
  
  if (socialSearcherData && socialSearcherData.posts) {
    const postCount = socialSearcherData.posts.length;
    score += Math.min(postCount, 7);
    
    if (socialSearcherData.sentiment && socialSearcherData.sentiment.negative > 0) {
      score += Math.min(socialSearcherData.sentiment.negative, 8);
    }
  }
  
  if (serpApiData && serpApiData.organic_results) {
    const webResultsCount = serpApiData.organic_results.length;
    score += Math.min(webResultsCount * 3, 15);
    
    const sensitiveTerms = ["personal", "contact", "address", "phone", "private", "profile", "resume", "cv"];
    let sensitiveCount = 0;
    
    serpApiData.organic_results.forEach((result: any) => {
      const resultText = `${result.title || ''} ${result.snippet || ''}`.toLowerCase();
      sensitiveTerms.forEach(term => {
        if (resultText.includes(term)) {
          sensitiveCount++;
        }
      });
    });
    
    score += Math.min(sensitiveCount, 5);
    
    const socialMediaSites = ["linkedin", "facebook", "twitter", "instagram", "github"];
    let socialMediaCount = 0;
    
    serpApiData.organic_results.forEach((result: any) => {
      if (result.link) {
        socialMediaSites.forEach(site => {
          if (result.link.toLowerCase().includes(site)) {
            socialMediaCount++;
          }
        });
      }
    });
    
    score += Math.min(socialMediaCount * 2, 10);
  }
  
  return Math.min(Math.round(score), 100);
};

const generateStatistics = (
  breaches: BreachData[],
  exposedDataTypes: string[],
  digitalFootprint: any,
  serpApiData: any | null
) => {
  const dataExposureByCategory: Record<string, number> = {};
  
  exposedDataTypes.forEach(type => {
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
  
  const breachTimelineMap = new Map<string, number>();
  
  breaches.forEach(breach => {
    const date = breach.BreachDate.substring(0, 7);
    const current = breachTimelineMap.get(date) || 0;
    breachTimelineMap.set(date, current + 1);
  });
  
  const timeline = Array.from(breachTimelineMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  const riskByDataType = exposedDataTypes.map(type => {
    const criticalDataTypes = [
      "passwords", "credit cards", "payment info", "social security numbers", 
      "government issued ids", "financial data", "bank account numbers"
    ];
    
    const mediumRiskDataTypes = [
      "phone numbers", "physical addresses", "security questions", "dates of birth"
    ];
    
    const breachesWithType = breaches.filter(breach => 
      breach.DataClasses.some(dataClass => 
        dataClass.toLowerCase() === type.toLowerCase() ||
        dataClass.toLowerCase().includes(type.toLowerCase()) ||
        type.toLowerCase().includes(dataClass.toLowerCase())
      )
    ).length;
    
    let baseRisk = 0;
    if (criticalDataTypes.some(critType => type.toLowerCase().includes(critType) || critType.includes(type.toLowerCase()))) {
      baseRisk = 70;
    } else if (mediumRiskDataTypes.some(medType => type.toLowerCase().includes(medType) || medType.includes(type.toLowerCase()))) {
      baseRisk = 40;
    } else {
      baseRisk = 10;
    }
    
    const frequencyRisk = Math.min(breachesWithType * 5, 30);
    
    return { 
      type, 
      riskScore: Math.min(baseRisk + frequencyRisk, 100) 
    };
  });
  
  let digitalPresenceScore = 0;
  
  if (digitalFootprint && digitalFootprint.socialProfiles) {
    digitalPresenceScore += Math.min(digitalFootprint.socialProfiles.length * 10, 50);
  }
  
  if (digitalFootprint && digitalFootprint.webPresence) {
    digitalPresenceScore += Math.min(digitalFootprint.webPresence.length * 5, 30);
  }
  
  if (digitalFootprint && digitalFootprint.professionalInfo) {
    digitalPresenceScore += Math.min(digitalFootprint.professionalInfo.length * 5, 10);
  }
  
  if (digitalFootprint && digitalFootprint.locations) {
    digitalPresenceScore += Math.min(digitalFootprint.locations.length * 5, 10);
  }
  
  digitalPresenceScore = Math.min(digitalPresenceScore, 100);
  
  let webPresenceScore = 0;
  let webResultsCount = 0;
  let totalWebResults = 0;
  
  if (serpApiData && serpApiData.organic_results) {
    webResultsCount = serpApiData.organic_results.length;
    totalWebResults = serpApiData.search_information?.total_results || 0;
    
    webPresenceScore = Math.min(webResultsCount * 7, 70);
    
    let qualityScore = 0;
    
    const socialMediaSites = ["linkedin", "facebook", "twitter", "instagram", "github"];
    let socialMediaCount = 0;
    
    serpApiData.organic_results.forEach((result: any) => {
      if (result.link) {
        socialMediaSites.forEach(site => {
          if (result.link.toLowerCase().includes(site)) {
            socialMediaCount++;
          }
        });
      }
    });
    
    qualityScore += Math.min(socialMediaCount * 5, 15);
    
    if (serpApiData.organic_results.some((result: any) => 
      result.link?.toLowerCase().includes('linkedin.com') ||
      result.title?.toLowerCase().includes('professional') ||
      result.title?.toLowerCase().includes('resume')
    )) {
      qualityScore += 10;
    }
    
    if (serpApiData.organic_results.some((result: any) => 
      (result.title?.toLowerCase().includes('portfolio') || 
       result.title?.toLowerCase().includes('personal') ||
       result.title?.toLowerCase().includes('blog')) &&
      !result.link?.toLowerCase().includes('templates')
    )) {
      qualityScore += 5;
    }
    
    webPresenceScore += Math.min(qualityScore, 30);
  }
  
  return {
    breachCount: breaches.length,
    dataExposureByCategory,
    breachTimeline: timeline,
    riskByDataType,
    digitalPresenceScore,
    webPresenceScore,
    webResultsCount,
    totalWebResults
  };
};
