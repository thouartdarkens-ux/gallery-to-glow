import { Link } from "react-router-dom";
import { Twitter, Facebook, Instagram, Youtube } from "lucide-react";

const Header = () => {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-2 text-sm">
          <div className="flex items-center gap-4">
            <Link to="/about" className="text-muted-foreground hover:text-foreground">About</Link>
            <span className="text-muted-foreground">/</span>
            <Link to="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link>
            <span className="text-muted-foreground">/</span>
            <Link to="/login" className="text-muted-foreground hover:text-foreground">Account</Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-accent text-accent-foreground px-3 py-1 rounded text-xs font-medium">
              COMING SOON
            </span>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              <Youtube className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">H</span>
              </div>
              <span className="font-semibold text-xl">Hallway</span>
            </Link>
            <nav className="flex items-center gap-8">
              <Link to="/" className="text-foreground hover:text-primary font-medium">
                Home
              </Link>
              <Link to="/support" className="text-foreground hover:text-primary font-medium">
                Support The Project
              </Link>
              <Link to="/vendor" className="text-foreground hover:text-primary font-medium">
                Become A Vendor
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
