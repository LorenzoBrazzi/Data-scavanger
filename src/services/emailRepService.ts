
import { toast } from "sonner";
import { getApiKey, hasApiKey } from "./apiKeyService";

interface EmailRepResult {
  email: string;
  reputation: string;
  suspicious: boolean;
  references: number;
  details: {
    blacklisted: boolean;
    malicious_activity: boolean;
    malicious_activity_recent: boolean;
    credentials_leaked: boolean;
    credentials_leaked_recent: boolean;
    data_breach: boolean;
    first_seen: string;
    last_seen: string;
    domain_exists: boolean;
    domain_reputation: string;
    new_domain: boolean;
    days_since_domain_creation: number;
    suspicious_tld: boolean;
    spam: boolean;
    free_provider: boolean;
    disposable: boolean;
    deliverable: boolean;
    accept_all: boolean;
    valid_mx: boolean;
    spoofable: boolean;
    spf_strict: boolean;
    dmarc_enforced: boolean;
  };
}

export const checkEmailRep = async (email: string): Promise<EmailRepResult | null> => {
  try {
    // Check if we have an API key for EmailRep
    const hasKey = await hasApiKey('emailrep');
    if (hasKey) {
      const apiKey = await getApiKey('emailrep');
      
      // Make API call through our proxy
      try {
        const response = await fetch(`/api/proxy/emailrep`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': apiKey || ''
          },
          body: JSON.stringify({
            email: email
          })
        });
        
        if (!response.ok) {
          throw new Error(`EmailRep.io API returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data as EmailRepResult;
      } catch (apiError) {
        console.error("API Error checking EmailRep.io data:", apiError);
        toast.error("Failed to fetch EmailRep.io data. Please try again.");
        return null;
      }
    }
    
    console.error("No EmailRep.io API key configured");
    toast.error("EmailRep.io API key not configured. Please add one in the API settings.");
    return null;
  } catch (error) {
    console.error("Error checking EmailRep.io data:", error);
    toast.error("Failed to check EmailRep.io data. Please try again.");
    return null;
  }
};
