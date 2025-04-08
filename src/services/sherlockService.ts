
import { toast } from "sonner";
import { getApiKey, hasApiKey } from "./apiKeyService";

interface SherlockResult {
  username: string;
  found: {
    site: string;
    url: string;
  }[];
  notFound: string[];
}

export const checkSherlock = async (username: string): Promise<SherlockResult | null> => {
  try {
    // Check if we have an API key for Sherlock
    const hasKey = await hasApiKey('sherlock');
    if (hasKey) {
      const apiKey = await getApiKey('sherlock');
      
      // Make API call through our proxy
      try {
        const response = await fetch(`/api/proxy/sherlock`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': apiKey || ''
          },
          body: JSON.stringify({
            username: username
          })
        });
        
        if (!response.ok) {
          throw new Error(`Sherlock API returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data as SherlockResult;
      } catch (apiError) {
        console.error("API Error checking Sherlock data:", apiError);
        toast.error("Failed to fetch Sherlock data. Please try again.");
        return null;
      }
    }
    
    console.error("No Sherlock API key configured");
    toast.error("Sherlock API key not configured. Please add one in the API settings.");
    return null;
  } catch (error) {
    console.error("Error checking Sherlock data:", error);
    toast.error("Failed to check Sherlock data. Please try again.");
    return null;
  }
};
