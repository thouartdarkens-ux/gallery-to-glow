import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_60%,transparent_100%)]"></div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="bg-card p-8 rounded-lg shadow-xl border">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-2xl">H</span>
              </div>
              
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-foreground">
                  🔐 Forgot Your Password?
                </h1>
                <p className="text-muted-foreground">
                  No worries — it happens!
                </p>
                <p className="text-sm text-muted-foreground">
                  Enter your email address below and we'll send you a secure 5 digit code to reset your password.
                </p>
              </div>
              
              <div className="w-full space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="sr-only">Your email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Your email address"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                
                <Button className="w-full" size="lg">
                  Send Code
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

export default ForgotPassword;
