
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Instagram, Linkedin, Check, ChevronLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { SnapchatIcon } from "@/components/icons/SnapchatIcon";

const SecurityRecommendations = () => {
  const [completedSteps, setCompletedSteps] = useState<{
    [platform: string]: string[];
  }>({
    instagram: [],
    snapchat: [],
    linkedin: [],
  });

  const toggleStep = (platform: string, step: string) => {
    setCompletedSteps((prev) => {
      const platformSteps = prev[platform] || [];
      return {
        ...prev,
        [platform]: platformSteps.includes(step)
          ? platformSteps.filter((s) => s !== step)
          : [...platformSteps, step],
      };
    });
  };

  const SecurityStep = ({
    title,
    path,
    effect,
    platform,
    id,
  }: {
    title: string;
    path: string;
    effect: string;
    platform: string;
    id: string;
  }) => {
    const isCompleted = completedSteps[platform]?.includes(id);

    return (
      <div className="mb-6 relative">
        <div
          className={`p-4 rounded-lg border ${
            isCompleted ? "bg-green-50 border-green-200" : "bg-card border-border"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h3 className="font-medium text-lg">{title}</h3>
              <div className="space-y-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <span className="font-medium mr-2">Path:</span>
                  <span>{path}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium mr-2">Effect:</span>
                  <span>{effect}</span>
                </div>
              </div>
            </div>
            <Button
              variant={isCompleted ? "default" : "outline"}
              className={`h-9 ${isCompleted ? "bg-green-500 hover:bg-green-600" : ""}`}
              onClick={() => toggleStep(platform, id)}
            >
              {isCompleted ? (
                <>
                  <Check className="h-4 w-4 mr-1" /> Completed
                </>
              ) : (
                "Mark Complete"
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const SecurityCategory = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => {
    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Shield className="mr-2 h-5 w-5 text-primary" />
          {title}
        </h2>
        <div className="space-y-4">{children}</div>
      </div>
    );
  };

  return (
    <div className="container py-8 px-4 max-w-5xl mx-auto">
      <div className="mb-8">
        <Link to="/" className="flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Report
        </Link>
        
        <h1 className="text-3xl font-bold mb-2">Social Media Security Recommendations</h1>
        <p className="text-muted-foreground max-w-2xl">
          Follow these recommended security settings for your social media accounts to better protect your digital identity and privacy.
        </p>
      </div>

      <Tabs defaultValue="instagram" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="instagram" className="flex items-center">
            <Instagram className="h-4 w-4 mr-2" /> Instagram
          </TabsTrigger>
          <TabsTrigger value="snapchat" className="flex items-center">
            <SnapchatIcon className="h-4 w-4 mr-2" /> Snapchat
          </TabsTrigger>
          <TabsTrigger value="linkedin" className="flex items-center">
            <Linkedin className="h-4 w-4 mr-2" /> LinkedIn
          </TabsTrigger>
        </TabsList>

        {/* Instagram Content */}
        <TabsContent value="instagram">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Instagram className="h-5 w-5 mr-2" /> Instagram Security Settings
              </CardTitle>
              <CardDescription>
                Follow these recommended settings to enhance your privacy and security on Instagram.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <SecurityCategory title="General Security Measures">
                <SecurityStep
                  id="instagram-2fa"
                  platform="instagram"
                  title="Enable Two-Factor Authentication (2FA)"
                  path="Settings → Accounts Center → Password and Security → Two-Factor Authentication"
                  effect="Adds an extra layer of security by requiring a verification code during login."
                />
                <SecurityStep
                  id="instagram-device-access"
                  platform="instagram"
                  title="Secure Device Access"
                  path="Device Settings"
                  effect="Prevent unauthorized access: Utilize device-level security features such as Face ID fingerprint recognition, or strong passcodes."
                />
                <SecurityStep
                  id="instagram-private-email"
                  platform="instagram"
                  title="Use Private Email Addresses for Sign-Ups"
                  path="Account Settings"
                  effect="Apple Devices: Utilize 'Sign in with Apple' to generate a unique, private email address. Android Devices: Consider third-party services like DuckDuckGo Email Protection or Firefox Relay to mask your real email address."
                />
              </SecurityCategory>

              <Separator />

              <SecurityCategory title="Instagram-Specific Privacy Settings">
                <SecurityStep
                  id="instagram-private"
                  platform="instagram"
                  title="Set Account to Private"
                  path="Settings → Account Privacy → Private Account"
                  effect="Only approved followers can view your posts, stories, and follower list."
                />
                <SecurityStep
                  id="instagram-sharing"
                  platform="instagram"
                  title="Prevent Sharing and Reuse of Your Content"
                  path="Settings → Sharing and reuse"
                  effect="Control who/how others can share your photos and videos."
                />
                <SecurityStep
                  id="instagram-access"
                  platform="instagram"
                  title="Control Access to Your Photos, Contacts, and Location"
                  path="Settings → Device Permissions"
                  effect="Manage Instagram's access to your device's photos, contacts, and location services."
                />
                <SecurityStep
                  id="instagram-meta"
                  platform="instagram"
                  title="Manage Data Sharing with Meta"
                  path="Settings → Accounts Centre → Your Information and Permissions → Your Activity off Meta Technologies"
                  effect="Review and manage the information Instagram shares with other Meta services."
                />
              </SecurityCategory>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Snapchat Content */}
        <TabsContent value="snapchat">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <SnapchatIcon className="h-5 w-5 mr-2" /> Snapchat Security Settings
              </CardTitle>
              <CardDescription>
                Follow these recommended settings to enhance your privacy and security on Snapchat.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <SecurityCategory title="General Security Measures">
                <SecurityStep
                  id="snapchat-2fa"
                  platform="snapchat"
                  title="Enable Two-Factor Authentication (2FA)"
                  path="Profile > Settings > Two-Factor Authentication"
                  effect="Adds an extra layer of security by requiring a verification code during login."
                />
                <SecurityStep
                  id="snapchat-device-access"
                  platform="snapchat"
                  title="Secure Device Access"
                  path="Device Settings"
                  effect="Prevent unauthorized access: Utilize device-level security features such as Face ID fingerprint recognition, or strong passcodes."
                />
                <SecurityStep
                  id="snapchat-private-email"
                  platform="snapchat"
                  title="Use Private Email Addresses for Sign-Ups"
                  path="Account Settings"
                  effect="Apple Devices: Utilize 'Sign in with Apple' to generate a unique, private email address. Android Devices: Consider third-party services like DuckDuckGo Email Protection or Firefox Relay to mask your real email address."
                />
              </SecurityCategory>

              <Separator />

              <SecurityCategory title="Snapchat-Specific Privacy Settings">
                <SecurityStep
                  id="snapchat-third-party"
                  platform="snapchat"
                  title="Manage which Information is Shared with 3rd-Partie Services"
                  path="Settings → My Account → Partner Connections"
                  effect="View and manage what data is shared with third-party apps you've linked to Snapchat."
                />
                <SecurityStep
                  id="snapchat-permissions"
                  platform="snapchat"
                  title="Control Access to Your Location and Photo Library"
                  path="Settings → Additional Services → Permissions"
                  effect="Control Snapchat's access to your device's location, camera, and photos. Adjust permissions at system level if needed."
                />
                <SecurityStep
                  id="snapchat-ads"
                  platform="snapchat"
                  title="Limit the Data Being Used for Ads Inside and Outside of Snapchat"
                  path="Settings → Additional Services → Ad Preferences"
                  effect="Manage whether Snapchat can use your activity and data for personalized advertising both on and off the platform."
                />
                <SecurityStep
                  id="snapchat-story"
                  platform="snapchat"
                  title="Decide Who Can View Your Story"
                  path="Settings > Privacy Controls > View My Story"
                  effect="Determines who can see your stories."
                />
                <SecurityStep
                  id="snapchat-ai"
                  platform="snapchat"
                  title="Delete My AI Data"
                  path="Settings > Privacy Controls > Clear Data > Clear My AI Data"
                  effect="Deletes data collected by Snapchat's AI features."
                />
              </SecurityCategory>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LinkedIn Content */}
        <TabsContent value="linkedin">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Linkedin className="h-5 w-5 mr-2" /> LinkedIn Security Settings
              </CardTitle>
              <CardDescription>
                Follow these recommended settings to enhance your privacy and security on LinkedIn.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <SecurityCategory title="General Security Measures">
                <SecurityStep
                  id="linkedin-2fa"
                  platform="linkedin"
                  title="Enable Two-Factor Authentication (2FA)"
                  path="Me → Settings → Sign in & security → Two-step verification"
                  effect="Adds an extra layer of protection by requiring a verification code during login."
                />
                <SecurityStep
                  id="linkedin-device-access"
                  platform="linkedin"
                  title="Secure Device Access"
                  path="Device Settings"
                  effect="Prevent unauthorized access: Utilize device-level security features such as Face ID fingerprint recognition, or strong passcodes."
                />
                <SecurityStep
                  id="linkedin-private-email"
                  platform="linkedin"
                  title="Use Private Email Addresses for Sign-Ups"
                  path="Account Settings"
                  effect="Apple Devices: Utilize 'Sign in with Apple' to generate a unique, private email address. Android Devices: Consider third-party services like DuckDuckGo Email Protection or Firefox Relay to mask your real email address."
                />
              </SecurityCategory>

              <Separator />

              <SecurityCategory title="LinkedIn-Specific Privacy Settings">
                <SecurityStep
                  id="linkedin-email"
                  platform="linkedin"
                  title="Control Who Can See Your Email Address"
                  path="Me → Settings → Visibility → Who can see or download your email address"
                  effect="Manage who can view or download your email address from your profile."
                />
                <SecurityStep
                  id="linkedin-profile"
                  platform="linkedin"
                  title="Adjust Public Profile Visibility"
                  path="Me → Settings → Visibility → Edit your public profile"
                  effect="Control what information is visible on your public profile to people outside of LinkedIn."
                />
                <SecurityStep
                  id="linkedin-research"
                  platform="linkedin"
                  title="Limit Data Sharing with Researchers"
                  path="Me → Settings → Data privacy → How LinkedIn uses your data → Social, economic, and workplace research"
                  effect="Manage whether your data is shared with third-party researchers for studies on social, economic, and workplace trends."
                />
                <SecurityStep
                  id="linkedin-export"
                  platform="linkedin"
                  title="Limit Profile Data Export by Page Owners"
                  path="Me → Settings → Visibility → Page owners exporting your data"
                  effect="Control whether organizations that own pages you've interacted with can export your Data."
                />
                <SecurityStep
                  id="linkedin-services"
                  platform="linkedin"
                  title="Dismiss Data Sharing with 3rd-Party Services"
                  path="Me → Settings → Data privacy → Permitted services"
                  effect="Manage which services you grant access to you profile and network data."
                />
              </SecurityCategory>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-10 text-center">
        <div className="mb-4">
          <Badge variant="outline" className="mb-2">
            Security Progress
          </Badge>
          <div className="flex justify-center items-center gap-4 mt-2">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
              <span className="text-sm">
                Instagram: {completedSteps.instagram?.length || 0}/7
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
              <span className="text-sm">
                Snapchat: {completedSteps.snapchat?.length || 0}/8
              </span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
              <span className="text-sm">
                LinkedIn: {completedSteps.linkedin?.length || 0}/8
              </span>
            </div>
          </div>
        </div>
        <Button variant="default" asChild>
          <Link to="/">
            Return to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default SecurityRecommendations;
