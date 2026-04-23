import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Hash, Smartphone } from "lucide-react";

export default function UssdPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10"><Hash className="w-6 h-6 text-primary" /></div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">USSD Integration</h1>
            <p className="text-muted-foreground mt-1">Enable parents to interact via USSD shortcodes.</p>
          </div>
          <Badge variant="outline" className="ml-auto text-warning border-warning">Coming Soon</Badge>
        </div>

        <div className="grid gap-6">
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h2 className="font-heading font-semibold text-card-foreground mb-4">How USSD Works</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { step: "1", title: "Dial Shortcode", desc: "Parents dial your school's USSD code (e.g. *123*456#)" },
                { step: "2", title: "Navigate Menu", desc: "Select options: Check fees, View results, Contact school" },
                { step: "3", title: "Get Info", desc: "Receive real-time data without internet or smartphone" },
              ].map(s => (
                <div key={s.step} className="p-4 rounded-lg border border-border bg-muted/30 text-center">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center mx-auto mb-2">{s.step}</div>
                  <p className="font-medium text-sm text-card-foreground">{s.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h2 className="font-heading font-semibold text-card-foreground mb-4">Planned USSD Menu</h2>
            <div className="font-mono text-sm bg-muted/50 rounded-lg p-4 space-y-1 text-muted-foreground">
              <p className="text-foreground font-medium">Welcome to SchoolConnect</p>
              <p>1. Check Fee Balance</p>
              <p>2. View Exam Results</p>
              <p>3. View Upcoming Events</p>
              <p>4. Contact School</p>
              <p>5. Opt-out of SMS</p>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
            <h2 className="font-heading font-semibold text-card-foreground mb-3">Requirements</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2"><Smartphone className="w-4 h-4 text-primary" /> USSD shortcode from telecom provider (MTN, Vodafone, AirtelTigo)</li>
              <li className="flex items-center gap-2"><Smartphone className="w-4 h-4 text-primary" /> USSD gateway API integration (Africa's Talking / Hubtel)</li>
              <li className="flex items-center gap-2"><Smartphone className="w-4 h-4 text-primary" /> Session management for multi-step menus</li>
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
