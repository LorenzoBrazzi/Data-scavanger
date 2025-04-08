
import { BreachData } from "@/types";
import { toast } from "sonner";
import { getApiKey, hasApiKey } from "./apiKeyService";

export const checkBreaches = async (email: string): Promise<BreachData[]> => {
  try {
    console.log("Starting HIBP breach scan for:", email);

    // Check if we have an API key for HIBP
    const hasKey = await hasApiKey('hibp');
    if (hasKey) {
      console.log("Using HIBP API");
      const apiKey = await getApiKey('hibp');
      
      // Make API call through our proxy
      try {
        const response = await fetch(`/api/proxy/hibp?email=${encodeURIComponent(email)}`, {
          headers: {
            'X-Api-Key': apiKey || ''
          }
        });
        
        if (response.status === 404) {
          // 404 means no breaches found
          console.log("No breaches found in HIBP");
          return [];
        }
        
        if (!response.ok) {
          throw new Error(`HIBP API returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`HIBP found ${data.length} breaches`);
        return data as BreachData[];
      } catch (apiError) {
        console.error("API Error checking breaches:", apiError);
        toast.error("Failed to check breaches. Please try again.");
        return [];
      }
    } else {
      console.error("No HIBP API key configured");
      toast.error("HIBP API key not configured. Please add one in the API settings.");
      return [];
    }
  } catch (error) {
    console.error("Error checking breaches:", error);
    toast.error("Failed to check for breaches. Please try again.");
    return [];
  }
};
