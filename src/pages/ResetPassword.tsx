import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const requirements = [
    { text: "At least 8 characters", met: password.length >= 8 },
    { text: "At least one uppercase letter (A–Z)", met: /[A-Z]/.test(password) },
    { text: "At least one number (0–9)", met: /\d/.test(password) },
    { text: "At least one special character (e.g. ! @*)", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_60%,transparent_100%)]"></div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="bg-card p-8 rounded-lg shadow-xl border">
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  🔒 Set a New Password
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enter a strong new password to secure your account and get back to using Hallway.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Your Password Must Include</p>
                  <div className="space-y-2">
                    {requirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Check className={`h-4 w-4 ${req.met ? 'text-success' : 'text-muted-foreground'}`} />
                        <span className={req.met ? 'text-foreground' : 'text-muted-foreground'}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Button className="w-full" size="lg">
                  Secure My Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ResetPassword;
