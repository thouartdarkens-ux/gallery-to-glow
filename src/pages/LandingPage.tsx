import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const LandingPage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <Header />

      <div
        className="flex-1 w-full bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: 'url(/Background%20(1).jpg)' }}
      >
        <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center px-4">
          <div className="text-center space-y-8 max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
              Don't miss launch day.
            </h1>
            <p className="text-lg md:text-xl text-white/90 drop-shadow-md">
              Join our community and be the first to know about our upcoming launch and exclusive features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="text-lg px-8 bg-white text-black hover:bg-gray-100">
                <Link to="/login">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 text-white border-white hover:bg-white/20">
                <Link to="/support">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LandingPage;
