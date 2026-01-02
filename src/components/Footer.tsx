import { Link } from "react-router-dom";
import { Instagram, Youtube, Linkedin } from "lucide-react";
import { SiSnapchat, SiTiktok, SiX } from "react-icons/si";
import logo from "@/assets/logo.jpg";
const Footer = () => {
  return <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logo} alt="Hallway Logo" className="w-10 h-10 rounded-full object-cover" />
              <span className="font-semibold text-xl">Hallway</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">Hallway is built by students and volunteers who believe in creating real opportunities on campus and beyond. This portal exists to support collaboration, accountability, and shared growth.</p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Home</h3>
            <nav className="space-y-2">
              <Link to="/support" className="block text-muted-foreground hover:text-foreground text-sm">
                Become a Volunteer
              </Link>
              <Link to="/vendor" className="block text-muted-foreground hover:text-foreground text-sm">
                Become A Vendor
              </Link>
              <a href="https://hallway.africa" target="_blank" rel="noopener noreferrer" className="block text-muted-foreground hover:text-foreground text-sm">
                Join The Waitlist
              </a>
            </nav>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Social Media</h3>
            <div className="flex flex-wrap gap-3">
              <a href="https://www.snapchat.com/add/hallway_ltd" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors">
                <SiSnapchat className="h-5 w-5" />
              </a>
              <a href="https://www.tiktok.com/@hallway_ltd" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors">
                <SiTiktok className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/hallway_ltd" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.x.com/hallway_ltd" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors">
                <SiX className="h-5 w-5" />
              </a>
              
              <a href="https://www.linkedin.com/company/hallwayllc" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>All rights Reserved</span>
            <span>© Hallway Technologies Ltd</span>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;