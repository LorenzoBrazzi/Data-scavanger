
import { toast } from "sonner";
import { getApiKey } from "./apiKeyService";

// This service is responsible for directing API calls to the appropriate endpoints
// We're using Supabase Edge Functions for all API calls that require secret keys

export const setupProxyService = () => {
  console.log("Proxy service initialized - using Supabase Edge Functions for API calls");
  
  // All API calls now go through dedicated Supabase Edge Functions:
  // - HIBP: /functions/v1/hibp
  // - Sherlock: /functions/v1/sherlock
  // - EmailRep: /functions/v1/emailrep
  // - Social Searcher: /functions/v1/social-searcher
  // - SerpAPI: /functions/v1/serpapi
};
