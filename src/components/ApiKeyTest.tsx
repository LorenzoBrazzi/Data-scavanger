
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { checkBreaches } from '@/services/hibpService';
import { checkSocialSearcher } from '@/services/socialSearcherService';
import { checkSherlock } from '@/services/sherlockService';
import { hasApiKey } from '@/services/apiKeyService';
import { Loader2, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const ApiKeyTest = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('hibp');
  const [apiStatus, setApiStatus] = useState<{
    hibp: boolean | null;
    socialSearcher: boolean | null;
    sherlock: boolean | null;
    emailrep: boolean | null;
    serpapi: boolean | null;
  }>({
    hibp: null,
    socialSearcher: null,
    sherlock: null,
    emailrep: null,
    serpapi: null
  });

  // Check which API keys are configured
  React.useEffect(() => {
    const checkApiKeys = async () => {
      const hibpConfigured = await hasApiKey('hibp');
      const socialSearcherConfigured = await hasApiKey('socialSearcher');
      const sherlockConfigured = await hasApiKey('sherlock');
      const emailrepConfigured = await hasApiKey('emailrep');
      const serpapiConfigured = await hasApiKey('serpapi');
      
      setApiStatus({
        hibp: hibpConfigured,
        socialSearcher: socialSearcherConfigured,
        sherlock: sherlockConfigured,
        emailrep: emailrepConfigured,
        serpapi: serpapiConfigured
      });
    };
    
    checkApiKeys();
  }, []);

  const handleTestHIBP = async () => {
    if (!email) {
      toast.error('Please enter an email address');
      return;
    }
    
    setIsLoading(true);
    setResults(null);
    
    try {
      const data = await checkBreaches(email);
      setResults(data);
      if (data && data.length > 0) {
        toast.info(`Found ${data.length} breaches for this email`);
      } else {
        toast.success('No breaches found for this email');
      }
    } catch (error) {
      console.error('Error testing HIBP API:', error);
      toast.error('Failed to check breaches. See console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSocialSearcher = async () => {
    if (!email || !name) {
      toast.error('Please enter both email and name');
      return;
    }
    
    setIsLoading(true);
    setResults(null);
    
    try {
      const data = await checkSocialSearcher(email, name);
      setResults(data);
      if (data && data.posts && data.posts.length > 0) {
        toast.info(`Found ${data.posts.length} social media posts`);
      } else {
        toast.success('No social media data found');
      }
    } catch (error) {
      console.error('Error testing Social Searcher API:', error);
      toast.error('Failed to check social media. See console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSherlock = async () => {
    if (!username) {
      toast.error('Please enter a username');
      return;
    }
    
    setIsLoading(true);
    setResults(null);
    
    try {
      const data = await checkSherlock(username);
      setResults(data);
      if (data && data.found && data.found.length > 0) {
        toast.info(`Found ${data.found.length} profiles for this username`);
      } else {
        toast.success('No social profiles found for this username');
      }
    } catch (error) {
      console.error('Error testing Sherlock:', error);
      toast.error('Failed to check username. See console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = () => {
    if (activeTab === 'hibp') {
      handleTestHIBP();
    } else if (activeTab === 'socialSearcher') {
      handleTestSocialSearcher();
    } else if (activeTab === 'sherlock') {
      handleTestSherlock();
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold mb-6">API Key Test</h1>
        <Link to="/api-keys">
          <Button variant="outline">Manage API Keys</Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className={apiStatus.hibp ? "border-green-500" : "border-red-500"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Have I Been Pwned</CardTitle>
          </CardHeader>
          <CardContent>
            {apiStatus.hibp === null ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : apiStatus.hibp ? (
              <div className="flex items-center text-green-500">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                <span>Configured</span>
              </div>
            ) : (
              <div className="flex items-center text-red-500">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <span>Not configured</span>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className={apiStatus.socialSearcher ? "border-green-500" : "border-red-500"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Social Searcher</CardTitle>
          </CardHeader>
          <CardContent>
            {apiStatus.socialSearcher === null ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : apiStatus.socialSearcher ? (
              <div className="flex items-center text-green-500">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                <span>Configured</span>
              </div>
            ) : (
              <div className="flex items-center text-red-500">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <span>Not configured</span>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className={apiStatus.sherlock ? "border-green-500" : "border-red-500"}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Sherlock Project</CardTitle>
          </CardHeader>
          <CardContent>
            {apiStatus.sherlock === null ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : apiStatus.sherlock ? (
              <div className="flex items-center text-green-500">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                <span>Configured</span>
              </div>
            ) : (
              <div className="flex items-center text-red-500">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <span>Not configured</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Test API Integration</CardTitle>
          <CardDescription>
            Enter information below to test your configured API keys
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="hibp">HIBP</TabsTrigger>
              <TabsTrigger value="socialSearcher">Social Searcher</TabsTrigger>
              <TabsTrigger value="sherlock">Sherlock</TabsTrigger>
            </TabsList>
            
            <div className="space-y-4">
              {activeTab === 'hibp' && (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email to test"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              )}
              
              {activeTab === 'socialSearcher' && (
                <>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email to test"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter name to test"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </>
              )}
              
              {activeTab === 'sherlock' && (
                <div>
                  <label htmlFor="username" className="block text-sm font-medium mb-1">
                    Username
                  </label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username to test"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="default"
            onClick={handleTest}
            disabled={isLoading || 
                    (activeTab === 'hibp' && !apiStatus.hibp) || 
                    (activeTab === 'socialSearcher' && !apiStatus.socialSearcher) ||
                    (activeTab === 'sherlock' && !apiStatus.sherlock)}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              'Test API'
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {results && (
        <Card>
          <CardHeader>
            <CardTitle>API Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md overflow-auto max-h-96">
              <pre className="text-xs">{JSON.stringify(results, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Alert variant="default" className="mt-4">
        <Info className="h-4 w-4" />
        <AlertDescription>
          This test page helps you verify your API key configuration. For a full security scan, return to the <Link to="/" className="underline">home page</Link>.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ApiKeyTest;
