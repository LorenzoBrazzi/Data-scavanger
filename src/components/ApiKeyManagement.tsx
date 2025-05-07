
import React, { useState, useEffect } from 'react';
import { 
  apiServices, 
  getAllApiKeys, 
  saveApiKey, 
  ApiServiceName,
  getApiServicesList
} from '@/services/apiKeyService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ExternalLink, Key, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ApiKeyManagement = () => {
  const [apiKeys, setApiKeys] = useState<Record<ApiServiceName, string>>({} as Record<ApiServiceName, string>);
  const [configuredCount, setConfiguredCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<ApiServiceName | null>(null);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    setLoading(true);
    try {
      // Load all API keys on component mount
      const storedKeys = await getAllApiKeys();
      
      setApiKeys(storedKeys);
      
      // Count configured API keys
      const configured = Object.values(storedKeys).filter(val => val && val.trim() !== '').length;
      setConfiguredCount(configured);
    } catch (error) {
      console.error("Error loading API keys:", error);
      toast.error("Failed to load API keys. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  const handleApiKeyChange = (service: ApiServiceName, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [service]: value
    }));
  };

  const handleSaveApiKey = async (service: ApiServiceName) => {
    setSaving(service);
    try {
      const keyValue = apiKeys[service] || '';
      const success = await saveApiKey(service, keyValue);
      
      if (success) {
        // Reload keys to get updated configuration
        await loadApiKeys();
      }
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading API keys...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">API Key Management</h1>
      
      <Alert variant={configuredCount > 0 ? "default" : "destructive"} className="mb-6">
        <AlertDescription className="flex items-center">
          {configuredCount > 0 ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              {configuredCount} API {configuredCount === 1 ? 'key' : 'keys'} configured. Your scans will use available APIs.
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 mr-2" />
              No API keys configured. The application will use mock data for demonstration.
            </>
          )}
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {getApiServicesList().map((serviceName) => {
          const service = apiServices[serviceName];
          return (
            <Card key={serviceName} className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="h-5 w-5 mr-2" />
                  {service.displayName}
                </CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col space-y-2">
                    <label htmlFor={`api-key-${serviceName}`} className="text-sm font-medium">
                      API Key
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        id={`api-key-${serviceName}`}
                        type="password"
                        value={apiKeys[serviceName] || ''}
                        onChange={(e) => handleApiKeyChange(serviceName, e.target.value)}
                        placeholder={`Enter ${service.displayName} API Key`}
                        className="flex-grow"
                      />
                      <Button 
                        onClick={() => handleSaveApiKey(serviceName)}
                        variant="outline"
                        disabled={saving === serviceName}
                      >
                        {saving === serviceName ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : 'Save'}
                      </Button>
                    </div>
                  </div>
                  
                  {service.docUrl && (
                    <a 
                      href={service.docUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      API Documentation
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ApiKeyManagement;
