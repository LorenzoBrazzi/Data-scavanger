
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Check Have I Been Pwned API for breaches
async function checkHIBPBreaches(email: string, apiKey: string): Promise<any> {
  try {
    console.log(`[HIBP] Starting breach check for email: ${email}`);
    
    // Call the HIBP API with proper headers
    const response = await fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`, {
      method: 'GET',
      headers: {
        'hibp-api-key': apiKey,
        'User-Agent': 'DataRiskScavenger/1.0'
      }
    });
    
    if (response.status === 404) {
      console.log(`[HIBP] No breaches found for ${email}`);
      return [];
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[HIBP] API error: ${response.status} - ${errorText}`);
      throw new Error(`HIBP API returned ${response.status}: ${errorText}`);
    }
    
    const breachData = await response.json();
    console.log(`[HIBP] Found ${breachData.length} breaches for ${email}`);
    
    return breachData;
  } catch (error) {
    console.error(`[HIBP] API error: ${error.message}`);
    throw new Error(`HIBP API error: ${error.message}`);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body to get the email
    const { email } = await req.json();
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`[HIBP] Processing breach check for email: ${email}`);
    
    // Get the authorization from the request headers
    const auth = req.headers.get('Authorization');
    
    // Extract the API key from the Authorization header or environment variable
    const apiKey = auth ? auth.replace('Bearer ', '') : Deno.env.get('HIBP_API_KEY') || '';
    
    if (!apiKey) {
      console.error("[HIBP] Missing API key");
      return new Response(
        JSON.stringify({ 
          error: 'HIBP API key not configured on the server' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Call HIBP API and get results
    try {
      const breachResults = await checkHIBPBreaches(email, apiKey);
      
      return new Response(
        JSON.stringify(breachResults),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } catch (apiError) {
      console.error('[HIBP] Error calling HIBP API:', apiError);
      
      // Return a more descriptive error
      return new Response(
        JSON.stringify({ 
          error: apiError.message,
          message: "Failed to check breaches. Please verify your API key is valid."
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error('[HIBP] Error in HIBP function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
