import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Login = () => {
  const [referenceCode, setReferenceCode] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First, get the email associated with the reference code
      const { data: profileData, error: profileError } = await supabase
        .rpc('get_user_by_reference_code', { ref_code: referenceCode });

      if (profileError || !profileData || profileData.length === 0) {
        toast({
          title: "Invalid credentials",
          description: "The reference code you entered is incorrect.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const email = profileData[0].email;

      // Sign in with email and password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        toast({
          title: "Login failed",
          description: signInError.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Session persistence is handled automatically by Supabase
      // The rememberMe state is already handled by the auth client config
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });

      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_60%,transparent_100%)]"></div>
        
        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6">
            <div className="flex justify-center md:justify-start">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-2xl">H</span>
              </div>
            </div>
            
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-3xl font-bold text-foreground">
                Welcome to the Volunteer Portal – For Verified Volunteers Only.
              </h1>
              <p className="text-muted-foreground">
                Enter your reference code to log in and track your impact.
              </p>
            </div>
            
            <div className="hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=300&fit=crop" 
                alt="Volunteer illustration" 
                className="rounded-lg shadow-xl w-full max-w-sm opacity-90"
              />
            </div>
          </div>
          
          <div className="bg-card p-8 rounded-lg shadow-xl border">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Login</h2>
                <p className="text-sm text-muted-foreground">
                  Enter your credentials to access your account
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="referenceCode">Volunteer Reference Code</Label>
                  <Input
                    id="referenceCode"
                    placeholder="Enter your reference code"
                    value={referenceCode}
                    onChange={(e) => setReferenceCode(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me
                  </label>
                </div>
                
                <Button className="w-full" size="lg" type="submit" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                
                <p className="text-center text-sm text-muted-foreground">
                  Together, we build something greater ✨
                </p>
                
                <p className="text-center text-xs text-muted-foreground pt-4">
                  By signing in, you agree to our{" "}
                  <Link to="/terms" className="underline hover:text-foreground">
                    Terms of Service
                  </Link>{" "}
                   and{" "}
                   <Link to="/privacy" className="underline hover:text-foreground">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Login;
