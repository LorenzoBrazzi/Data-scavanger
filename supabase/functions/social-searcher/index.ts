
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
    const apiKey = Deno.env.get('SOCIAL_SEARCHER_KEY');
    
    if (!apiKey) {
      console.error("Social Searcher API key not configured on the server");
      return new Response(
        JSON.stringify({ error: 'Social Searcher API key not configured on the server' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body and log for debugging
    try {
      const body = await req.json();
      const { email, name, query } = body;
      console.log(`Social Searcher received request for name: ${name}, email: ${email}`);
      
      if (!email || !name) {
        console.error("Email or name missing in request");
        return new Response(
          JSON.stringify({ error: 'Email and name are required' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Extract username from email for better search
      const username = email.split('@')[0];
      
      // Create a search query that works well with Social Searcher API
      // Remove special characters that might cause issues with the API
      const searchName = name.replace(/[^\w\s]/gi, '');
      const cleanUsername = username.replace(/[^\w\s]/gi, '');
      
      // Use the provided query if available, otherwise build our own
      const searchQuery = query || 
        (searchName && cleanUsername ? 
          `${searchName} OR ${cleanUsername}` :
          searchName || cleanUsername);
      
      console.log(`Making Social Searcher API request for: "${searchQuery}"`);

      // Construct Social Searcher API URL with the API key
      const url = new URL('https://api.social-searcher.com/v2/search');
      url.searchParams.append('q', searchQuery);
      url.searchParams.append('key', apiKey);
      url.searchParams.append('network', 'web,twitter,facebook,instagram,youtube,reddit,pinterest,vk');
      url.searchParams.append('limit', '20'); // Get more results

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Social Searcher API error: ${response.status} - ${errorText}`);
        throw new Error(`Social Searcher API returned status ${response.status}`);
      }

      const data = await response.json();
      
      console.log(`Social Searcher API request successful, found ${data.posts?.length || 0} posts from ${new Set(data.posts?.map(p => p.network) || []).size} networks`);

      return new Response(
        JSON.stringify(data),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error('Error in Social Searcher function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
