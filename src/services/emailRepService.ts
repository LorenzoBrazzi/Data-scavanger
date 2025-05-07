
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
    if (!hasKey) {
      console.log("No EmailRep API key configured, skipping this check");
      return null;
    }
    
    const apiKey = await getApiKey('emailrep');
    
    if (!apiKey) {
      console.error("Failed to retrieve EmailRep API key");
      toast.warning("EmailRep API key not configured. Some features will be limited.");
      return null;
    }
    
    // Make API call through our proxy
    try {
      console.log("Making EmailRep API call for:", email);
      
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
        const errorText = await response.text();
        console.error(`EmailRep.io API error: ${response.status} - ${errorText}`);
        throw new Error(`EmailRep.io API returned ${response.status}: ${errorText || response.statusText}`);
      }
      
      const data = await response.json();
      console.log("EmailRep.io response:", data);
      return data as EmailRepResult;
    } catch (apiError) {
      console.error("API Error checking EmailRep.io data:", apiError);
      return null;
    }
  } catch (error) {
    console.error("Error checking EmailRep.io data:", error);
    return null;
  }
};
