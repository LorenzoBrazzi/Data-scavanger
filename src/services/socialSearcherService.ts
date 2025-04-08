
import { SocialSearcherData } from "@/types";
import { toast } from "sonner";
import { getApiKey, hasApiKey } from "./apiKeyService";

export const checkSocialSearcher = async (email: string, name: string): Promise<SocialSearcherData | null> => {
  try {
    // Check if we have an API key for Social-Searcher
    const hasKey = await hasApiKey('socialSearcher');
    if (hasKey) {
      const apiKey = await getApiKey('socialSearcher');
      
      // Make API call through our proxy
      try {
        const response = await fetch(`/api/proxy/socialsearcher`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': apiKey || ''
          },
          body: JSON.stringify({
            email: email,
            name: name
          })
        });
        
        if (!response.ok) {
          throw new Error(`Social-Searcher API returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data as SocialSearcherData;
      } catch (apiError) {
        console.error("API Error checking Social-Searcher data:", apiError);
        toast.error("Failed to fetch social media mentions. Please try again.");
        return null;
      }
    }
    
    console.error("No Social-Searcher API key configured");
    toast.error("Social-Searcher API key not configured. Please add one in the API settings.");
    return null;
  } catch (error) {
    console.error("Error checking Social-Searcher data:", error);
    toast.error("Failed to check social media mentions. Please try again.");
    return null;
  }
};
