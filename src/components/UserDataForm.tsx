
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserData } from "@/types";
import { Shield, Eye, EyeOff, Key } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";

interface UserDataFormProps {
  onSubmit: (data: UserData) => void;
  loading: boolean;
}

const UserDataForm = ({ onSubmit, loading }: UserDataFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [includePassword, setIncludePassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { name?: string; email?: string; password?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (includePassword && !password.trim()) {
      newErrors.password = "Password is required if you want to check it";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit({ 
        name, 
        email, 
        password: includePassword ? password : undefined 
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full max-w-md p-6 bg-primary/10 backdrop-blur-sm rounded-lg shadow-lg border border-primary/20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Check Your Digital Exposure</h2>
        <Link 
          to="/api-keys" 
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          <Key className="w-4 h-4 mr-1" />
          API Keys
        </Link>
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
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              type="email" 
              placeholder="john.doe@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
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
          </Button>
        </CardFooter>
      </form>
    </div>
  );
};

export default UserDataForm;
