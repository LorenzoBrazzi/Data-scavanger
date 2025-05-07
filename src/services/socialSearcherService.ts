
import { SocialSearcherData } from "@/types";
import { toast } from "sonner";
import { getApiKey, hasApiKey } from "./apiKeyService";

export const checkSocialSearcher = async (email: string, name: string): Promise<SocialSearcherData | null> => {
  try {
    // Check if we have an API key for Social-Searcher
    const hasKey = await hasApiKey('socialSearcher');
    if (hasKey) {
      const apiKey = await getApiKey('socialSearcher');
      
      // Generate a better query for social media search
      const query = generateSocialSearchQuery(email, name);
      console.log("Using Social Searcher query:", query);
      
      // Make API call through our Edge Function
      try {
        const response = await fetch(`https://tcgzdqtdarjunpkoyyus.supabase.co/functions/v1/social-searcher`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            email: email,
            name: name,
            query: query
          })
        });
        
        if (!response.ok) {
          throw new Error(`Social-Searcher API returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("Social-Searcher data received:", {
          postCount: data.posts?.length || 0,
          networks: data.posts?.map(p => p.network).filter((v, i, a) => a.indexOf(v) === i) || []
        });
        
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

// Generate a more effective query for social media search
const generateSocialSearchQuery = (email: string, name: string): string => {
  // Extract username from email
  const emailUsername = email.split('@')[0];
  
  // Clean and normalize name
  const cleanName = name.trim().replace(/\s+/g, ' ');
  const nameParts = cleanName.split(' ');
  
  // Build query components
  const queryParts: string[] = [];
  
  // Add name variations
  queryParts.push(`"${cleanName}"`); // Full name in quotes
  
  if (nameParts.length > 1) {
    // Add first and last name separately if multi-word name
    queryParts.push(nameParts[0]); // First name
    queryParts.push(nameParts[nameParts.length - 1]); // Last name
  }
  
  // Add email username if it's not just numbers
  if (!/^\d+$/.test(emailUsername)) {
    queryParts.push(emailUsername);
  }
  
  // Join with OR for broader search
  return queryParts.join(' OR ');
};

// Update the Supabase Edge Function to support the new query parameter
