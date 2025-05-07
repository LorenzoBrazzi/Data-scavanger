
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
import { ExternalLink, Key, AlertTriangle, Check, Code } from 'lucide-react';

const ApiKeySettings = () => {
  const [apiKeys, setApiKeys] = useState<Record<ApiServiceName, string>>({} as Record<ApiServiceName, string>);
  const [configuredCount, setConfiguredCount] = useState(0);

  useEffect(() => {
    // Load all API keys on component mount
    const fetchApiKeys = async () => {
      const storedKeys = await getAllApiKeys();
      
      setApiKeys(storedKeys);
      
      // Count configured API keys
      const configured = Object.values(storedKeys).filter(val => val && val.trim() !== '').length;
      setConfiguredCount(configured);
    };
    
    fetchApiKeys();
  }, []);

  const handleApiKeyChange = (service: ApiServiceName, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [service]: value
    }));
  };

  const handleSaveApiKey = (service: ApiServiceName) => {
    const keyValue = apiKeys[service] || '';
    saveApiKey(service, keyValue);
    
    // Update configured count
    const newKeys = {...apiKeys};
    const configured = Object.values(newKeys).filter(val => val && val.trim() !== '').length;
    setConfiguredCount(configured);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">API Key Settings</h1>
      
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
              No API keys configured. Some features will be limited.
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
                  {service.isCliTool ? <Code className="h-5 w-5 mr-2" /> : <Key className="h-5 w-5 mr-2" />}
                  {service.displayName}
                </CardTitle>
                <CardDescription>{service.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col space-y-2">
                    <label htmlFor={`api-key-${serviceName}`} className="text-sm font-medium">
                      {service.isCliTool ? "Integration Token" : "API Key"}
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        id={`api-key-${serviceName}`}
                        type="password"
                        value={apiKeys[serviceName] || ''}
                        onChange={(e) => handleApiKeyChange(serviceName, e.target.value)}
                        placeholder={`Enter ${service.isCliTool ? 'integration token' : 'API key'}`}
                        className="flex-grow"
                      />
                      <Button 
                        onClick={() => handleSaveApiKey(serviceName)}
                        variant="outline"
                      >
                        Save
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
                      {service.isCliTool ? "Project Documentation" : "API Documentation"}
                    </a>
                  )}
                  
                  {service.isCliTool && (
                    <Alert className="mt-2">
                      <AlertDescription>
                        This is a CLI tool that requires server-side integration. Contact your administrator for setup details.
                      </AlertDescription>
                    </Alert>
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

export default ApiKeySettings;
