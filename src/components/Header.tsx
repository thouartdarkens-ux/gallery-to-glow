import { Link } from "react-router-dom";
import { Twitter, Facebook, Instagram, Youtube } from "lucide-react";
import logo from "@/assets/logo.png";
const Header = () => {
  return <header className="border-b bg-card">
      <div className="container mx-auto px-4">
        
      </div>
      <div className="border-t">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Hallway Logo" className="w-10 h-10 rounded-full object-cover" />
              <span className="font-semibold text-xl">Hallway</span>
            </Link>
            <nav className="flex items-center gap-8">
              <a href="https://forms.gle/CSJiZBA4dSaFSjJJA" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary font-medium">Become a Volunteer</a>
              <a href="https://forms.gle/z1RdD9P7Rc6oNq2C7" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary font-medium">
                Become A Vendor
              </a>
            </nav>
          </div>
        </div>
      </div>
    </header>;
};
export default Header;