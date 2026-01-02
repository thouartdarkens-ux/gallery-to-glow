import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import logo from "@/assets/logo.jpg";
const Index = () => {
  return <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 flex items-center justify-center py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_60%,transparent_100%)]"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="flex justify-center">
              <img src={logo} alt="Hallway Logo" className="w-20 h-20 rounded-full object-cover shadow-2xl" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-foreground">The Space for Builders of Impact</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Hallway has a passion for empowering students. We provide a student-first marketplace that makes it simple to buy, sell, and support projects — all in one place.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="text-lg px-8">
                <Link to="/login">Volunteer Login</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link to="/support">Support The Project</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>;
};
export default Index;