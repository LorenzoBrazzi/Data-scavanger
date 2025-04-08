
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { AlertTriangle, Info } from "lucide-react";
import { Link } from "react-router-dom";

interface ApiRequiredNoticeProps {
  service: string;
  description: string;
}

const ApiRequiredNotice = ({ service, description }: ApiRequiredNoticeProps) => {
  return (
    <Card className="border-amber-400/50 bg-amber-50/50 dark:bg-amber-950/20 my-4">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-amber-600">
          <AlertTriangle className="h-5 w-5" />
          {service} API Key Required
        </CardTitle>
        <CardDescription className="text-amber-700 dark:text-amber-400">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          This application uses external APIs to provide comprehensive security checks.
          To enable full functionality, please configure your API keys.
        </p>
      </CardContent>
      <CardFooter>
        <div className="flex gap-3">
          <Link to="/api-keys">
            <Button variant="outline" size="sm">
              <Info className="mr-2 h-4 w-4" />
              Manage API Keys
            </Button>
          </Link>
          <Link to="/api-test">
            <Button variant="outline" size="sm">
              Test API
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ApiRequiredNotice;
