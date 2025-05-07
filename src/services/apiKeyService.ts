import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ApiServiceName = 'hibp' | 'socialSearcher' | 'sherlock' | 'emailrep' | 'serpapi';

interface ApiServiceMetadata {
  name: string;
  description: string;
  url: string;
  docUrl?: string;
  displayName: string;
  isCliTool?: boolean;
}

// API service metadata for UI display
export const apiServices: Record<ApiServiceName, ApiServiceMetadata> = {
  hibp: {
    name: 'hibp',
    displayName: 'Have I Been Pwned',
    description: 'Check if your email or username has been compromised in a data breach.',
    url: 'https://haveibeenpwned.com/API/v3',
    docUrl: 'https://haveibeenpwned.com/API/v3'
  },
  socialSearcher: {
    name: 'socialSearcher',
    displayName: 'Social Searcher',
    description: 'Search for social media mentions across platforms.',
    url: 'https://www.social-searcher.com/api-v2/',
    docUrl: 'https://www.social-searcher.com/api-v2/'
  },
  sherlock: {
    name: 'sherlock',
    displayName: 'Sherlock Project',
    description: 'CLI tool to find usernames across social networks. Requires server-side integration.',
    url: 'https://github.com/sherlock-project/sherlock',
    docUrl: 'https://github.com/sherlock-project/sherlock',
    isCliTool: true
  },
  emailrep: {
    name: 'emailrep',
    displayName: 'EmailRep.io',
    description: 'Check email reputation and risk.',
    url: 'https://emailrep.io/docs/',
    docUrl: 'https://emailrep.io/docs/'
  },
  serpapi: {
    name: 'serpapi',
    displayName: 'SerpAPI',
    description: 'Search engine results API.',
    url: 'https://serpapi.com/',
    docUrl: 'https://serpapi.com/'
  }
};

// Get an array of all API services for mapping in components
export const getApiServicesList = (): ApiServiceName[] => {
  return Object.keys(apiServices) as ApiServiceName[];
};

// Store an API key in the database
export const storeApiKey = async (service: ApiServiceName, key: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .upsert({ service: service, key_value: key }, { onConflict: 'service' });
    
    if (error) {
      console.error("Error storing API key:", error);
      toast.error(`Failed to store API key for ${service}: ${error.message}`);
      return false;
    }
    
    toast.success(`API key stored successfully for ${service}`);
    return true;
  } catch (error) {
    console.error("Error storing API key:", error);
    toast.error(`Failed to store API key for ${service}`);
    return false;
  }
};

// Alias for storeApiKey to match component naming
export const saveApiKey = storeApiKey;

// Retrieve an API key from the database
export const getApiKey = async (service: ApiServiceName): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('key_value')
      .eq('service', service)
      .single();
    
    if (error) {
      console.error("Error retrieving API key:", error);
      return null;
    }
    
    return data ? data.key_value : null;
  } catch (error) {
    console.error("Error retrieving API key:", error);
    return null;
  }
};

// Check if we have a key for a specific service
export const hasApiKey = async (service: ApiServiceName): Promise<boolean> => {
  try {
    const apiKey = await getApiKey(service);
    return !!apiKey;
  } catch (error) {
    console.error("Error checking API key:", error);
    return false;
  }
};

// Delete an API key from the database
export const deleteApiKey = async (service: ApiServiceName): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .delete()
      .eq('service', service);
    
    if (error) {
      console.error("Error deleting API key:", error);
      toast.error(`Failed to delete API key for ${service}: ${error.message}`);
      return false;
    }
    
    toast.success(`API key deleted successfully for ${service}`);
    return true;
  } catch (error) {
    console.error("Error deleting API key:", error);
    toast.error(`Failed to delete API key for ${service}`);
    return false;
  }
};

// List all stored API keys
export const listApiKeys = async (): Promise<Array<{ service: ApiServiceName }>> => {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('service');
    
    if (error) {
      console.error("Error listing API keys:", error);
      toast.error(`Failed to list API keys: ${error.message}`);
      return [];
    }
    
    return data ? data.map(item => ({ service: item.service as ApiServiceName })) : [];
  } catch (error) {
    console.error("Error listing API keys:", error);
    toast.error("Failed to list API keys");
    return [];
  }
};

// Get all API keys with their values
export const getAllApiKeys = async (): Promise<Record<ApiServiceName, string>> => {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('service, key_value');
    
    if (error) {
      console.error("Error retrieving all API keys:", error);
      return {} as Record<ApiServiceName, string>;
    }
    
    const result: Record<string, string> = {};
    if (data) {
      data.forEach(item => {
        result[item.service as ApiServiceName] = item.key_value;
      });
    }
    
    // Initialize undefined services with empty strings
    Object.keys(apiServices).forEach(service => {
      if (!(service in result)) {
        result[service] = '';
      }
    });
    
    return result as Record<ApiServiceName, string>;
  } catch (error) {
    console.error("Error retrieving all API keys:", error);
    return {} as Record<ApiServiceName, string>;
  }
};
