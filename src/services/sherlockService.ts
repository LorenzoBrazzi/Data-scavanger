
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
    if (!username) {
      console.log("No username provided for Sherlock check, skipping");
      return null;
    }
    
    // Check if we have an API key for Sherlock
    const hasKey = await hasApiKey('sherlock');
    
    if (!hasKey) {
      console.log("No Sherlock API key configured, skipping this check");
      return null;
    }
    
    // Make API call through our Supabase Edge Function
    try {
      const apiKey = await getApiKey('sherlock');
      
      if (!apiKey) {
        console.error("Failed to retrieve Sherlock API key");
        return null;
      }
      
      console.log("Calling Sherlock Edge Function for username:", username);
      const response = await fetch(`https://tcgzdqtdarjunpkoyyus.supabase.co/functions/v1/sherlock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          username: username
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Sherlock API error: ${response.status} - ${errorText}`);
        
        // Try to parse error if possible
        const errorData = await response.json().catch(() => ({ error: errorText || "Unknown error" }));
        const errorMessage = errorData.message || `Sherlock API returned ${response.status}: ${response.statusText || errorText}`;
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log("Sherlock API response received:", data);
      
      // Normalize the result to ensure it matches our expected interface
      const normalizedResult: SherlockResult = {
        username: data.username || username,
        found: Array.isArray(data.found) ? data.found : [],
        notFound: Array.isArray(data.notFound) ? data.notFound : []
      };
      
      console.log(`Sherlock found ${normalizedResult.found.length} profiles for username: ${username}`);
      return normalizedResult;
    } catch (apiError: any) {
      console.error("Error executing Sherlock:", apiError);
      return null;
    }
  } catch (error) {
    console.error("Error checking Sherlock data:", error);
    return null;
  }
};

// Extract username from email for Sherlock lookups
export const extractUsernameFromEmail = (email: string): string => {
  if (!email || !email.includes('@')) return '';
  return email.split('@')[0];
};

// Get potential usernames from a person's name
export const getPotentialUsernames = (name: string): string[] => {
  if (!name) return [];
  
  const usernames: string[] = [];
  const nameParts = name.toLowerCase().split(' ');
  
  // Common username patterns
  if (nameParts.length >= 2) {
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    
    usernames.push(`${firstName}${lastName}`); // johnsmith
    usernames.push(`${firstName}.${lastName}`); // john.smith
    usernames.push(`${firstName}_${lastName}`); // john_smith
    usernames.push(`${firstName}${lastName[0]}`); // johns
    usernames.push(`${firstName[0]}${lastName}`); // jsmith
  }
  
  return usernames;
};
