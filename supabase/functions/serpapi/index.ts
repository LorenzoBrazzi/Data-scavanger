
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = req.headers.get('Authorization')?.replace('Bearer ', '') || Deno.env.get('SERPAPI_KEY');
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'SerpAPI key not configured on the server' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request to get search parameters
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    
    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Search query is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Construct SerpAPI URL with the API key
    const url = new URL('https://serpapi.com/search');
    url.searchParams.append('q', query);
    url.searchParams.append('api_key', apiKey);
    url.searchParams.append('engine', 'google');

    // Handle location if provided
    const location = searchParams.get('location');
    if (location) {
      console.log(`Including location in search: ${location}`);
      url.searchParams.append('location', location);
    }

    // Handle any other parameters passed
    for (const [key, value] of searchParams.entries()) {
      if (key !== 'q' && key !== 'location' && !url.searchParams.has(key)) {
        url.searchParams.append(key, value);
      }
    }

    console.log(`Making SerpAPI request for query: ${query}${location ? ` in ${location}` : ''}`);
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`SerpAPI returned status ${response.status}`);
    }

    const data = await response.json();
    
    console.log(`SerpAPI request successful, found ${data.organic_results?.length || 0} results`);

    return new Response(
      JSON.stringify(data),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in SerpAPI function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
