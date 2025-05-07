import { toast } from "sonner";
import { getApiKey, hasApiKey } from "./apiKeyService";

interface SerpApiResult {
  search_metadata: {
    id: string;
    status: string;
    json_endpoint: string;
    created_at: string;
    processed_at: string;
    google_url: string;
    raw_html_file: string;
    total_time_taken: number;
  };
  search_parameters: {
    engine: string;
    q: string;
    location_requested: string;
    location_used: string;
    google_domain: string;
    hl: string;
    gl: string;
    device: string;
  };
  search_information: {
    organic_results_state: string;
    query_displayed: string;
    total_results: number;
    time_taken_displayed: number;
  };
  organic_results: Array<{
    position: number;
    title: string;
    link: string;
    displayed_link: string;
    snippet: string;
    snippet_highlighted_words: string[];
    sitelinks?: {
      inline?: Array<{
        title: string;
        link: string;
      }>;
      expanded?: Array<{
        title: string;
        link: string;
        snippet: string;
      }>;
    };
    cached_page_link?: string;
    related_pages_link?: string;
  }>;
}

export const searchSerpApi = async (query: string, params?: Record<string, string>): Promise<SerpApiResult | null> => {
  try {
    // Check if we have an API key for SerpAPI
    const hasKey = await hasApiKey('serpapi');
    if (hasKey) {
      const apiKey = await getApiKey('serpapi');
      
      // Make API call through our Edge Function
      try {
        console.log("Calling SerpAPI with query:", query);
        
        const searchParams = new URLSearchParams({
          q: query,
          ...params
        }).toString();
        
        const response = await fetch(`https://tcgzdqtdarjunpkoyyus.supabase.co/functions/v1/serpapi?${searchParams}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`SerpAPI error: ${response.status} - ${errorText}`);
          throw new Error(`SerpAPI returned ${response.status}: ${response.statusText || errorText}`);
        }
        
        const data = await response.json();
        
        // Enhanced logging and validation of results
        if (data.organic_results && data.organic_results.length > 0) {
          console.log(`SerpAPI found ${data.organic_results.length} results for query "${query}"`);
          
          // Filter out low-quality or irrelevant results
          data.organic_results = data.organic_results
            .filter(result => {
              // Keep results that are likely relevant to people search
              const relevanceScore = calculateRelevanceScore(result, query);
              return relevanceScore > 0.3; // Arbitrary threshold that can be adjusted
            })
            .slice(0, 15); // Limit to top 15 most relevant results
            
          console.log(`After filtering, keeping ${data.organic_results.length} relevant results`);
        } else {
          console.log("SerpAPI returned no results");
        }
        
        return data as SerpApiResult;
      } catch (apiError) {
        console.error("API Error using SerpAPI:", apiError);
        toast.error("Failed to fetch SerpAPI data. Please try again.");
        return null;
      }
    }
    
    console.error("No SerpAPI key configured");
    return null;
  } catch (error) {
    console.error("Error using SerpAPI:", error);
    return null;
  }
};

// Helper function to calculate relevance score of search results based on the query
const calculateRelevanceScore = (result: any, query: string): number => {
  const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
  let score = 0;
  
  // Check title
  if (result.title) {
    const titleLower = result.title.toLowerCase();
    searchTerms.forEach(term => {
      if (titleLower.includes(term)) score += 0.4;
    });
  }
  
  // Check snippet
  if (result.snippet) {
    const snippetLower = result.snippet.toLowerCase();
    searchTerms.forEach(term => {
      if (snippetLower.includes(term)) score += 0.3;
    });
  }
  
  // Check URL
  if (result.link) {
    const linkLower = result.link.toLowerCase();
    // Higher score for social media or profile sites
    if (linkLower.includes('linkedin.com')) score += 0.5;
    if (linkLower.includes('twitter.com') || linkLower.includes('x.com')) score += 0.5;
    if (linkLower.includes('facebook.com')) score += 0.5;
    if (linkLower.includes('github.com')) score += 0.5;
    if (linkLower.includes('instagram.com')) score += 0.5;
    if (linkLower.includes('profile')) score += 0.3;
    if (linkLower.includes('about')) score += 0.2;
  }
  
  return Math.min(score, 1); // Cap at 1.0
};
