import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ResetSuccess = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_60%,transparent_100%)]"></div>
        
        <div className="w-full max-w-md relative z-10">
          <div className="bg-card p-8 rounded-lg shadow-xl border">
            <div className="flex flex-col items-center space-y-6 text-center">
              <CheckCircle2 className="h-16 w-16 text-success" />
              
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  ✅ Password Reset Successfully
                </h1>
                <p className="text-muted-foreground">
                  Your new password has been saved. You can now log in to your Hallway account with your updated credentials.
                </p>
              </div>
              
              <Button asChild className="w-full" size="lg">
                <Link to="/login">Go To Login</Link>
              </Button>
              
              <div className="pt-4">
                <img 
                  src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300&h=200&fit=crop" 
                  alt="Success illustration" 
                  className="rounded-lg opacity-90"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ResetSuccess;
