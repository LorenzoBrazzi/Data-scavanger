import { Database } from "@/integrations/supabase/types";

// Define API response types

// User data input
export interface UserData {
  name: string;
  email: string;
  additionalEmails?: string[];
  username?: string; // Added for Sherlock lookups
  password?: string;
  location?: string; // Added for geolocation search
}

// HIBP breach data
export interface BreachData {
  Name: string;
  Title: string;
  Domain: string;
  BreachDate: string;
  AddedDate: string;
  ModifiedDate: string;
  PwnCount: number;
  Description: string;
  LogoPath: string;
  DataClasses: string[];
  IsVerified: boolean;
  IsFabricated: boolean;
  IsSensitive: boolean;
  IsRetired: boolean;
  IsSpamList: boolean;
  IsMalware: boolean;
}

// Social Searcher data
export interface SocialSearcherData {
  query: string;
  posts: Array<{
    network: string;
    user: {
      id: string;
      name: string;
      url: string;
      image?: string;
    };
    text: string;
    posted: string;
    url: string;
    sentiment: 'positive' | 'negative' | 'neutral';
  }>;
  sentiment?: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

// Sherlock Project data
export interface SherlockData {
  username: string;
  found: Array<{
    site: string;
    url: string;
  }>;
  notFound: string[];
}

// EmailRep.io data
export interface EmailRepData {
  email: string;
  reputation: string;
  suspicious: boolean;
  references: number;
  details: {
    blacklisted: boolean;
    malicious_activity: boolean;
    malicious_activity_recent: boolean;
    credentials_leaked: boolean;
    credentials_leaked_recent: boolean;
    data_breach: boolean;
    first_seen: string;
    last_seen: string;
    domain_exists: boolean;
    domain_reputation: string;
    new_domain: boolean;
    days_since_domain_creation: number;
    suspicious_tld: boolean;
    spam: boolean;
    free_provider: boolean;
    disposable: boolean;
    deliverable: boolean;
    accept_all: boolean;
    valid_mx: boolean;
    spoofable: boolean;
    spf_strict: boolean;
    dmarc_enforced: boolean;
  };
}

// SerpApi data
export interface SerpApiData {
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
    sourceEmail?: string; // Add sourceEmail property
  }>;
}

// Combined API response
export interface ApiResponse {
  breaches: BreachData[];
  socialSearcherData: SocialSearcherData | null;
  emailRep?: EmailRepData | null;
  sherlock?: SherlockData | null;
  serpApi?: SerpApiData | null;
  totalRiskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  exposedDataTypes: string[];
  recommendedActions: string[];
  digitalFootprint: {
    socialProfiles: Array<{
      network: string;
      username?: string;
      url?: string;
    }>;
    webPresence?: Array<{
      title: string;
      url: string;
      snippet?: string;
      displayed_link?: string;
    }>;
    professionalInfo?: ProfessionalInfo[];
    locations?: string[];
    emailUsage?: EmailUsage;
    interests?: string[];
  };
  stats: {
    breachCount: number;
    dataExposureByCategory: Record<string, number>;
    breachTimeline: Array<{ date: string; count: number }>;
    riskByDataType: Array<{ type: string; riskScore: number }>;
    digitalPresenceScore: number;
    webPresenceScore?: number;
    webResultsCount?: number;
    totalWebResults?: number;
  };
}

// API Database Types
export type Tables = Database['public']['Tables'];

// Professional Info interface for DigitalFootprint
export interface ProfessionalInfo {
  company: string;
  title?: string;
  period?: string;
}

// Email usage interface for DigitalFootprint
export interface EmailUsage {
  services: string[];
}

// Add the VulnerabilityReport interface for the components that need it
export interface VulnerabilityReport {
  email: string;
  name: string;
  additionalEmails?: string[]; // Added property for additional emails
  location?: string; // Added property for location
  breachCount: number;
  breaches: BreachData[];
  riskLevel: 'low' | 'medium' | 'high';
  exposedDataTypes: string[];
  recommendedActions: string[];
  scanDate: string;
  totalRiskScore: number;
  stats: {
    breachCount: number;
    dataExposureByCategory: Record<string, number>;
    breachTimeline: Array<{ date: string; count: number }>;
    riskByDataType: Array<{ type: string; riskScore: number }>;
    digitalPresenceScore: number;
    webPresenceScore?: number;
    webResultsCount?: number;
    totalWebResults?: number;
  };
  digitalFootprint: {
    socialProfiles: Array<{
      network: string;
      username?: string;
      url?: string;
    }>;
    webPresence?: Array<{
      title: string;
      url: string;
      snippet?: string;
      displayed_link?: string;
    }>;
    professionalInfo?: ProfessionalInfo[];
    locations?: string[];
    emailUsage?: EmailUsage;
    interests?: string[];
  };
  webPresence?: {
    totalResults: number;
    organicResults: Array<{
      position: number;
      title: string;
      link: string;
      displayed_link?: string;
      snippet?: string;
      sourceEmail?: string; // Add sourceEmail property here
    }>;
  };
  darkWebFindings?: {
    mentions: number;
    sources: Array<{
      name: string;
      count: number;
      lastSeen?: string;
    }>;
    exposedInfo: string[];
  };
  passwordSecurity?: {
    strength: number;
    isCommon: boolean;
    compromised: boolean;
    suggestions: string[];
  };
}
