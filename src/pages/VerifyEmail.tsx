import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const VerifyEmail = () => {
  const [otp, setOtp] = useState("");

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
                <h1 className="text-2xl font-bold text-foreground">
                  Check Your Inbox to Verify Your Email
                </h1>
                <p className="text-sm text-muted-foreground">
                  We've sent a verification code to your email. Please enter the code to confirm your address and reset your Hallway Volunteer password.
                </p>
              </div>
              
              <div className="w-full space-y-4">
                <div className="flex justify-center">
                  <InputOTP maxLength={5} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                
                <Button className="w-full" size="lg">
                  Verify Your Email
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

export default VerifyEmail;
