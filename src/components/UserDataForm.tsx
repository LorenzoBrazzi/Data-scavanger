
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { UserData } from "@/types";
import { Shield, Eye, EyeOff, Plus, Mail, Search, MapPin } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

interface UserDataFormProps {
  onSubmit: (data: UserData) => void;
  loading: boolean;
}

const UserDataForm = ({ onSubmit, loading }: UserDataFormProps) => {
  const [name, setName] = useState("");
  const [emails, setEmails] = useState<string[]>([""]);
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");
  const [includePassword, setIncludePassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ 
    name?: string; 
    emails?: string[]; 
    password?: string;
    location?: string;
  }>({});

  const validateForm = (): boolean => {
    const newErrors: { 
      name?: string; 
      emails?: string[]; 
      password?: string;
      location?: string;
    } = {};
    
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    
    const emailErrors: string[] = [];
    let hasValidEmail = false;
    
    emails.forEach((email, index) => {
      if (!email.trim()) {
        emailErrors[index] = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailErrors[index] = "Please enter a valid email address";
      } else {
        hasValidEmail = true;
      }
    });
    
    if (emailErrors.length > 0) {
      newErrors.emails = emailErrors;
    }
    
    if (!hasValidEmail) {
      if (!newErrors.emails) newErrors.emails = [];
      newErrors.emails[0] = newErrors.emails[0] || "At least one valid email is required";
    }
    
    if (includePassword && !password.trim()) {
      newErrors.password = "Password is required if you want to check it";
    }
    
    // Add validation for location
    if (!location.trim()) {
      newErrors.location = "Location is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Filter out empty emails
      const validEmails = emails.filter(email => email.trim() !== "");
      
      onSubmit({ 
        name, 
        email: validEmails[0], // Main email (for backward compatibility)
        additionalEmails: validEmails.slice(1), // Additional emails
        password: includePassword && password ? password : undefined,
        location: location.trim() // Location is now required
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const addEmailField = () => {
    setEmails([...emails, ""]);
  };
  
  const removeEmailField = (index: number) => {
    if (emails.length > 1) {
      const updatedEmails = [...emails];
      updatedEmails.splice(index, 1);
      setEmails(updatedEmails);
      
      // Update errors if they exist
      if (errors.emails) {
        const updatedErrors = [...errors.emails];
        updatedErrors.splice(index, 1);
        setErrors({...errors, emails: updatedErrors});
      }
    }
  };
  
  const updateEmail = (index: number, value: string) => {
    const updatedEmails = [...emails];
    updatedEmails[index] = value;
    setEmails(updatedEmails);
  };

  return (
    <div className="w-full max-w-md p-6 bg-primary/10 backdrop-blur-sm rounded-lg shadow-lg border border-primary/20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Check Your Digital Exposure</h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name"
              placeholder="John Doe" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>
          
          <div className="space-y-3">
            <Label>Email Addresses</Label>
            {emails.map((email, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="relative flex-grow">
                  <Input 
                    id={`email-${index}`}
                    type="email" 
                    placeholder={index === 0 ? "Primary email address" : "Additional email address"} 
                    value={email}
                    onChange={(e) => updateEmail(index, e.target.value)}
                    className={errors.emails && errors.emails[index] ? "border-destructive pr-10" : "pr-10"}
                  />
                  <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                
                {emails.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeEmailField(index)}
                    className="h-9 w-9 p-0"
                  >
                    <span className="sr-only">Remove email</span>
                    <span className="text-lg">×</span>
                  </Button>
                )}
              </div>
            ))}
            
            {errors.emails && errors.emails[0] && (
              <p className="text-sm text-destructive">{errors.emails[0]}</p>
            )}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addEmailField}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              <span>Add another email</span>
            </Button>
          </div>
          
          {/* Location field (now required) */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative">
              <Input 
                id="location"
                placeholder="City, Country (e.g. New York, USA)" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={errors.location ? "border-destructive pr-10" : "pr-10"}
              />
              <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
            {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
          </div>
          
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox 
              id="include-password" 
              checked={includePassword} 
              onCheckedChange={(checked) => {
                setIncludePassword(checked as boolean);
                if (!checked) setPassword("");
              }}
            />
            <label
              htmlFor="include-password"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Include password for security check (optional)
            </label>
          </div>
          
          {includePassword && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input 
                  id="password"
                  type={showPassword ? "text" : "password"} 
                  placeholder="Your password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? "border-destructive pr-10" : "pr-10"}
                />
                <button 
                  type="button" 
                  onClick={togglePasswordVisibility}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              <p className="text-xs text-muted-foreground mt-1">
                Your password is securely processed and never stored
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? "Scanning..." : "Check My Data"}
            {!loading && <Search className="ml-2 h-4 w-4" />}
          </Button>
        </CardFooter>
      </form>
    </div>
  );
};

export default UserDataForm;
