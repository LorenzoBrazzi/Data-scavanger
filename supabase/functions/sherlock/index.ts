
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// This function calls the actual Sherlock project via a container service
async function runSherlockCommand(username: string): Promise<any> {
  try {
    console.log(`[SHERLOCK] Starting real Sherlock search for username: ${username}`);
    
    // Get the Sherlock API URL from environment variables
    const sherlockApiUrl = Deno.env.get('SHERLOCK_API_URL');
    const sherlockApiKey = Deno.env.get('SHERLOCK_TOKEN');
    
    if (!sherlockApiUrl) {
      throw new Error("SHERLOCK_API_URL environment variable not configured");
    }
    
    console.log(`[SHERLOCK] Calling external Sherlock API at ${sherlockApiUrl}`);
    
    // Call the container service that runs the actual Sherlock tool
    const response = await fetch(`${sherlockApiUrl}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sherlockApiKey || ''}`,
      },
      body: JSON.stringify({
        username: username,
        // Optional parameters to control Sherlock behavior
        timeout: 60, // seconds
        max_sites: 100, // Limit to top 100 sites for faster results
        print_found_only: true, // Only return found results
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Sherlock API returned ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`[SHERLOCK] Completed search. Results received.`);
    
    // Format the response to match our expected structure
    return {
      username,
      found: data.found || [],
      notFound: data.not_found || []
    };
  } catch (error) {
    console.error(`[SHERLOCK] Execution error: ${error.message}`);
    throw new Error(`Failed to execute Sherlock: ${error.message}`);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization from the request headers
    const auth = req.headers.get('Authorization');
    
    // Extract the API key from the Authorization header
    const apiKey = auth ? auth.replace('Bearer ', '') : Deno.env.get('SHERLOCK_TOKEN') || '';
    const apiUrl = Deno.env.get('SHERLOCK_API_URL');
    
    if (!apiKey || !apiUrl) {
      console.error("Missing Sherlock configuration");
      return new Response(
        JSON.stringify({ 
          error: 'Sherlock integration not fully configured on the server',
          missing: !apiKey ? 'SHERLOCK_TOKEN' : 'SHERLOCK_API_URL',
          message: 'Please configure both SHERLOCK_API_URL and SHERLOCK_TOKEN secrets in your Supabase project'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    const { username } = await req.json();
    
    if (!username) {
      return new Response(
        JSON.stringify({ error: 'Username is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Processing Sherlock request for username: ${username}`);
    
    // Execute Sherlock and get results
    try {
      const sherlockResults = await runSherlockCommand(username);
      
      return new Response(
        JSON.stringify(sherlockResults),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } catch (apiError) {
      console.error('Error in Sherlock API call:', apiError);
      
      return new Response(
        JSON.stringify({ 
          error: apiError.message,
          message: "Failed to execute Sherlock. Please check your container service is running."
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error('Error in Sherlock function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
