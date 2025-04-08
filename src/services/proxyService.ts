
import { toast } from "sonner";
import { getApiKey } from "./apiKeyService";

// This service simulates server-side proxies in a client-only environment
export const setupProxyService = () => {
  // Override fetch to intercept API calls to our proxy endpoints
  const originalFetch = window.fetch;
  
  window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
    const url = input instanceof Request ? input.url : String(input);
    
    // Check if this is a request to our proxy endpoints
    if (url.startsWith('/api/proxy/')) {
      console.log("Intercepting proxy request:", url);
      
      // Extract the service from the URL
      const service = url.split('/api/proxy/')[1].split('?')[0];
      
      // For HIBP API
      if (service === 'hibp') {
        try {
          const apiKey = await getApiKey('hibp');
          if (!apiKey) {
            throw new Error("HIBP API key is not configured");
          }
          
          console.error("HIBP API calls require server-side proxy which isn't set up yet");
          toast.error("HIBP API calls require server-side proxy which isn't set up yet");
          
          return new Response(JSON.stringify([]), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.error("Error in HIBP proxy:", error);
          toast.error("Error processing HIBP request");
          return new Response(JSON.stringify({ error: "Failed to process HIBP request" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      } else if (service === 'sherlock') {
        try {
          // Check if we have an API key first (for GitHub integration)
          const apiKey = await getApiKey('sherlock');
          
          if (!apiKey) {
            throw new Error("Sherlock API key is not configured");
          }
          
          console.error("Sherlock API calls require server-side proxy which isn't set up yet");
          toast.error("Sherlock API calls require server-side proxy which isn't set up yet");
          
          return new Response(JSON.stringify({ error: "Sherlock API calls require server-side proxy" }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.error("Error in Sherlock proxy:", error);
          toast.error("Error processing Sherlock request");
          return new Response(JSON.stringify({ error: "Failed to process Sherlock request" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      } else if (service === 'emailrep') {
        try {
          const apiKey = await getApiKey('emailrep');
          
          if (!apiKey) {
            throw new Error("EmailRep.io API key is not configured");
          }
          
          console.error("EmailRep.io API calls require server-side proxy which isn't set up yet");
          toast.error("EmailRep.io API calls require server-side proxy which isn't set up yet");
          
          return new Response(JSON.stringify({ error: "EmailRep.io API calls require server-side proxy" }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.error("Error in EmailRep.io proxy:", error);
          toast.error("Error processing EmailRep.io request");
          return new Response(JSON.stringify({ error: "Failed to process EmailRep.io request" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      } else if (service === 'serpapi') {
        try {
          const apiKey = await getApiKey('serpapi');
          
          if (!apiKey) {
            throw new Error("SerpAPI key is not configured");
          }
          
          console.error("SerpAPI calls require server-side proxy which isn't set up yet");
          toast.error("SerpAPI calls require server-side proxy which isn't set up yet");
          
          return new Response(JSON.stringify({ error: "SerpAPI calls require server-side proxy" }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.error("Error in SerpAPI proxy:", error);
          toast.error("Error processing SerpAPI request");
          return new Response(JSON.stringify({ error: "Failed to process SerpAPI request" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      } else if (service === 'socialsearcher') {
        try {
          const apiKey = await getApiKey('socialSearcher');
          
          if (!apiKey) {
            throw new Error("Social-Searcher API key is not configured");
          }
          
          console.error("Social-Searcher API calls require server-side proxy which isn't set up yet");
          toast.error("Social-Searcher API calls require server-side proxy which isn't set up yet");
          
          return new Response(JSON.stringify({ error: "Social-Searcher API calls require server-side proxy" }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.error("Error in Social-Searcher proxy:", error);
          toast.error("Error processing Social-Searcher request");
          return new Response(JSON.stringify({ error: "Failed to process Social-Searcher request" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
      
      // Default fallback for unhandled proxy endpoints
      console.error("Unhandled proxy service:", service);
      return new Response(JSON.stringify({ error: "Proxy service not implemented" }), {
        status: 501,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // For all other requests, use the original fetch
    return originalFetch.call(window, input, init);
  };
};
