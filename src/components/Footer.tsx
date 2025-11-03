import { Link } from "react-router-dom";
import { Instagram, Facebook, Youtube, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">H</span>
              </div>
              <span className="font-semibold text-xl">Hallway</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Hallway has a passion for empowering students. We provide a student-first marketplace that makes it simple to buy, sell, and support projects — all in one place.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Home</h3>
            <nav className="space-y-2">
              <Link to="/support" className="block text-muted-foreground hover:text-foreground text-sm">
                Support The Project
              </Link>
              <Link to="/vendor" className="block text-muted-foreground hover:text-foreground text-sm">
                Become A Vendor
              </Link>
              <Link to="/waitlist" className="block text-muted-foreground hover:text-foreground text-sm">
                Join The Waitlist
              </Link>
            </nav>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Social Media</h3>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Hallway</span>
            <span>© Grant Reese Arthur HW2025</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
