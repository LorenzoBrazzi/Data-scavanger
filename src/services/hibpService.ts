
import { BreachData } from "@/types";
import { toast } from "sonner";
import { getApiKey, hasApiKey } from "./apiKeyService";

export const checkBreaches = async (email: string): Promise<BreachData[]> => {
  try {
    console.log(`[HIBP Service] Starting breach scan for: ${email}`);

    // Check if we have an API key for HIBP
    const hasKey = await hasApiKey('hibp');
    if (!hasKey) {
      console.error("[HIBP Service] No HIBP API key configured");
      toast.error("HIBP API key not configured. Please add one in the API settings.");
      return [];
    }
    
    console.log("[HIBP Service] HIBP API key found, proceeding with breach check");
    const apiKey = await getApiKey('hibp');
    
    if (!apiKey) {
      console.error("[HIBP Service] Failed to retrieve HIBP API key");
      toast.error("Could not retrieve HIBP API key. Please check your API settings.");
      return [];
    }
    
    // Make API call through our Supabase Edge Function
    try {
      // Enhanced logging for debugging
      console.log(`[HIBP Service] Calling HIBP edge function for email: ${email}`);
      
      const response = await fetch(`https://tcgzdqtdarjunpkoyyus.supabase.co/functions/v1/hibp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ email })
      });
      
      // Add debug log for response status
      console.log(`[HIBP Service] API response status for ${email}: ${response.status}`);
      
      if (response.status === 404) {
        // 404 means no breaches found
        console.log(`[HIBP Service] No breaches found for ${email}`);
        return [];
      }
      
      // Handle rate limiting specifically
      if (response.status === 429) {
        console.error(`[HIBP Service] Rate limited when checking ${email}. Waiting to retry is recommended.`);
        toast.warning(`Rate limited by HIBP API. This email (${email}) will be skipped.`);
        return [];
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[HIBP Service] API error for ${email}: ${response.status} - ${errorText}`);
        
        // If we get a 401 Unauthorized error, it's likely an API key issue
        if (response.status === 401) {
          console.error("[HIBP Service] Authentication failed. Possible API key issue.");
          toast.error("Authentication failed with HIBP API. Please check your API key.");
          return [];
        }
        
        let errorMessage = `HIBP API returned ${response.status}`;
        
        // Try to parse error as JSON if possible
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || `${errorMessage}: ${errorData.error || "Unknown error"}`;
        } catch (jsonError) {
          // If parsing fails, use the raw error text
          errorMessage = `${errorMessage}: ${errorText || "Unknown error"}`;
        }
        
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log(`[HIBP Service] Found ${data.length} breaches for ${email}`);
      
      // Log the breach domains for debugging
      if (data.length > 0) {
        const breachDomains = data.map((breach: BreachData) => breach.Domain).join(', ');
        console.log(`[HIBP Service] Breach domains for ${email}: ${breachDomains}`);
      }
      
      return data as BreachData[];
    } catch (apiError) {
      console.error(`[HIBP Service] API Error checking breaches for ${email}:`, apiError);
      toast.error(`Failed to check breaches for ${email}. Will continue with other emails if available.`);
      return [];
    }
  } catch (error) {
    console.error(`[HIBP Service] Error checking breaches for ${email}:`, error);
    toast.error(`Failed to check breaches for ${email}. Will continue with other emails if available.`);
    return [];
  }
};
