
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
      
      // Make API call through our proxy
      try {
        const searchParams = new URLSearchParams({
          q: query,
          ...params
        }).toString();
        
        const response = await fetch(`/api/proxy/serpapi?${searchParams}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': apiKey || ''
          }
        });
        
        if (!response.ok) {
          throw new Error(`SerpAPI returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data as SerpApiResult;
      } catch (apiError) {
        console.error("API Error using SerpAPI:", apiError);
        toast.error("Failed to fetch SerpAPI data. Please try again.");
        return null;
      }
    }
    
    console.error("No SerpAPI key configured");
    toast.error("SerpAPI key not configured. Please add one in the API settings.");
    return null;
  } catch (error) {
    console.error("Error using SerpAPI:", error);
    toast.error("Failed to search with SerpAPI. Please try again.");
    return null;
  }
};
