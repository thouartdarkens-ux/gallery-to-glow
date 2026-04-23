import AppLayout from "@/components/AppLayout";
import { Settings as SettingsIcon, Wifi, CreditCard, Shield, Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function SettingsPage() {
  const [smsProvider, setSmsProvider] = useState("arkesel");
  const [apiKey, setApiKey] = useState("");
  const [senderId, setSenderId] = useState("");
  const [configId, setConfigId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("sms_provider_config")
        .select("*")
        .eq("is_active", true)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!error && data) {
        setConfigId(data.id);
        setSmsProvider(data.provider);
        setApiKey(data.api_key);
        setSenderId(data.sender_id);
      }
      setLoading(false);
    })();
  }, []);

  const handleSaveSms = async () => {
    if (!smsProvider || !apiKey.trim() || !senderId.trim()) {
      toast.error("Please select a provider and enter API key + Sender ID");
      return;
    }
    setSaving(true);
    try {
      if (configId) {
        const { error } = await supabase
          .from("sms_provider_config")
          .update({ provider: smsProvider, api_key: apiKey.trim(), sender_id: senderId.trim(), is_active: true })
          .eq("id", configId);
        if (error) throw error;
      } else {
        // Deactivate any existing then insert
        await supabase.from("sms_provider_config").update({ is_active: false }).eq("is_active", true);
        const { data, error } = await supabase
          .from("sms_provider_config")
          .insert({ provider: smsProvider, api_key: apiKey.trim(), sender_id: senderId.trim(), is_active: true })
          .select("id")
          .single();
        if (error) throw error;
        setConfigId(data.id);
      }
      toast.success("SMS provider settings saved");
    } catch (e: any) {
      toast.error(e.message || "Failed to save SMS settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage system configuration, integrations, and preferences.</p>
        </div>

        <div className="grid gap-6">
          {/* SMS Provider Config */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Wifi className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-heading font-semibold text-card-foreground">SMS Provider</h2>
                <p className="text-sm text-muted-foreground">Connect your SMS gateway for sending messages</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select value={smsProvider} onValueChange={setSmsProvider} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="arkesel">Arkesel</SelectItem>
                    <SelectItem value="hubtel" disabled>Hubtel (coming soon)</SelectItem>
                    <SelectItem value="africas_talking" disabled>Africa's Talking (coming soon)</SelectItem>
                    <SelectItem value="twilio" disabled>Twilio (coming soon)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sender ID</Label>
                <Input
                  type="text"
                  placeholder="e.g. SchoolName (max 11 chars)"
                  value={senderId}
                  onChange={(e) => setSenderId(e.target.value)}
                  maxLength={11}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  placeholder="Enter Arkesel API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <Button onClick={handleSaveSms} disabled={loading || saving}>
              {saving ? "Saving..." : "Save SMS Config"}
            </Button>
          </div>

          {/* Payment Config */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <CreditCard className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h2 className="font-heading font-semibold text-card-foreground">Payment Integration</h2>
                <p className="text-sm text-muted-foreground">Configure Paystack or Mobile Money for wallet top-ups</p>
              </div>
              <Badge variant="outline" className="ml-auto text-warning border-warning">Coming Soon</Badge>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Gateway</Label>
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gateway" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paystack">Paystack</SelectItem>
                    <SelectItem value="momo">Mobile Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Public Key</Label>
                <Input type="password" placeholder="Enter public key" disabled />
              </div>
            </div>
            <Button variant="outline" disabled>
              Save Payment Config
            </Button>
          </div>

          {/* Roles Overview */}
          <div className="bg-card rounded-xl border border-border p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <Shield className="w-5 h-5 text-info" />
              </div>
              <div>
                <h2 className="font-heading font-semibold text-card-foreground">User Roles</h2>
                <p className="text-sm text-muted-foreground">Manage who can access what in the platform</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { role: "Super Admin", desc: "Full access to everything" },
                { role: "School Admin", desc: "Manage students, messaging" },
                { role: "Accounts", desc: "Billing & wallet access" },
                { role: "Marketing", desc: "Campaigns & contacts" },
              ].map((r) => (
                <div key={r.role} className="p-3 rounded-lg border border-border bg-muted/30">
                  <p className="text-sm font-medium text-card-foreground">{r.role}</p>
                  <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
