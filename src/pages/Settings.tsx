
import React from 'react';
import ApiKeySettings from '@/components/ApiKeySettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Settings = () => {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="apikeys" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="apikeys">API Keys</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>
        
        <TabsContent value="apikeys">
          <ApiKeySettings />
        </TabsContent>
        
        <TabsContent value="general">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">General Settings</h2>
            <p className="text-gray-600">
              General application settings will appear here in future updates.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
