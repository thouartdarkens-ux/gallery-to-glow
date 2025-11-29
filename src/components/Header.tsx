import { Link } from "react-router-dom";
import { Twitter, Facebook, Instagram, Youtube } from "lucide-react";
import logo from "@/assets/logo.jpg";

const Header = () => {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-2 text-sm">
          <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm">
            <Link to="/about" className="text-muted-foreground hover:text-foreground">About</Link>
            <span className="text-muted-foreground hidden sm:inline">/</span>
            <Link to="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link>
            <span className="text-muted-foreground hidden sm:inline">/</span>
            <Link to="/login" className="text-muted-foreground hover:text-foreground">Account</Link>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <span className="bg-accent text-accent-foreground px-2 md:px-3 py-1 rounded text-xs font-medium">
              COMING SOON
            </span>
            <a href="#" className="text-muted-foreground hover:text-foreground hidden sm:block">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground hidden sm:block">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground hidden sm:block">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground hidden sm:block">
              <Youtube className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Hallway Logo" className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover" />
              <span className="font-semibold text-lg md:text-xl">Hallway</span>
            </Link>
            <nav className="hidden lg:flex items-center gap-8">
              <Link to="/" className="text-foreground hover:text-primary font-medium">
                Home
              </Link>
              <Link to="/support" className="text-foreground hover:text-primary font-medium">
                Support The Project
              </Link>
              <Link to="/vendor" className="text-foreground hover:text-primary font-medium">
                Become A Vendor
              </Link>
              <Link to="/" className="text-foreground hover:text-primary font-medium">
                Volunteer Portal
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
