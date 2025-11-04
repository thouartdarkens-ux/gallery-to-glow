import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, LogOut, LayoutDashboard, Award, Settings as SettingsIcon, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const profileSchema = z.object({
  full_name: z.string().min(1, "Name is required").max(100),
  username: z.string().min(3, "Username must be at least 3 characters").max(50).optional(),
  email: z.string().email("Invalid email address"),
  date_of_birth: z.string().optional(),
  present_address: z.string().max(200).optional(),
  permanent_address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  postal_code: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Settings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Profile fields
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [presentAddress, setPresentAddress] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  // Preferences
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("");
  const [notificationPromotional, setNotificationPromotional] = useState(true);
  const [notificationOffers, setNotificationOffers] = useState(false);
  const [notificationRecommendations, setNotificationRecommendations] = useState(true);
  
  // Security
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = localStorage.getItem("currentUser");
      if (!userData) {
        navigate("/login");
        return;
      }

      const user = JSON.parse(userData);

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setUserId(data.id);
        setFullName(data.full_name || "");
        setUsername(data.username || "");
        setEmail(data.email);
        setDateOfBirth(data.date_of_birth || "");
        setPresentAddress(data.present_address || "");
        setPermanentAddress(data.permanent_address || "");
        setCity(data.city || "");
        setPostalCode(data.postal_code || "");
        setCountry(data.country || "");
        setAvatarUrl(data.avatar_url || "");
        setCurrency(data.currency || "USD");
        setTimezone(data.timezone || "");
        setNotificationPromotional(data.notification_promotional ?? true);
        setNotificationOffers(data.notification_offers ?? false);
        setNotificationRecommendations(data.notification_recommendations ?? true);
        setTwoFactorEnabled(data.two_factor_enabled ?? false);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Failed to load user data");
    }
  };

  const handleProfileSave = async () => {
    try {
      setLoading(true);

      const profileData = {
        full_name: fullName,
        username: username || null,
        email,
        date_of_birth: dateOfBirth || null,
        present_address: presentAddress || null,
        permanent_address: permanentAddress || null,
        city: city || null,
        postal_code: postalCode || null,
        country: country || null,
      };

      profileSchema.parse(profileData);

      const { error } = await supabase
        .from("users")
        .update(profileData)
        .eq("id", userId);

      if (error) throw error;

      toast.success("Profile updated successfully");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error("Error updating profile:", error);
        toast.error("Failed to update profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSave = async () => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from("users")
        .update({
          currency,
          timezone,
          notification_promotional: notificationPromotional,
          notification_offers: notificationOffers,
          notification_recommendations: notificationRecommendations,
        })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Preferences updated successfully");
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast.error("Failed to update preferences");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    try {
      setLoading(true);

      passwordSchema.parse({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      // Verify current password
      const { data: userData } = await supabase
        .from("users")
        .select("password")
        .eq("id", userId)
        .single();

      if (userData?.password !== currentPassword) {
        toast.error("Current password is incorrect");
        return;
      }

      // Update password
      const { error } = await supabase
        .from("users")
        .update({ password: newPassword })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error("Error updating password:", error);
        toast.error("Failed to update password");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSecuritySave = async () => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from("users")
        .update({
          two_factor_enabled: twoFactorEnabled,
        })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Security settings updated successfully");
    } catch (error) {
      console.error("Error updating security settings:", error);
      toast.error("Failed to update security settings");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar - Same as Dashboard */}
      <aside className="w-64 bg-card border-r flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">H</span>
            </div>
            <span className="font-semibold">Hallway</span>
          </div>
        </div>

        <div className="px-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search" className="pl-9" />
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <div className="text-xs font-semibold text-muted-foreground mb-2 px-3">MAIN</div>
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-sidebar-accent/50"
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="text-sm font-medium">Overview</span>
          </Link>
          <Link
            to="/achievements"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-sidebar-accent/50"
          >
            <Award className="h-4 w-4" />
            <span className="text-sm font-medium">Achievements</span>
          </Link>
          <Link
            to="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground"
          >
            <SettingsIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-2">
              <LifeBuoy className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium text-sm">Need Support?</p>
                <p className="text-xs text-muted-foreground">Get in touch with our support team now</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              Contact Us
            </Button>
          </div>
        </div>

        <div className="p-4 border-t">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="bg-card border-b sticky top-0 z-10">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Welcome Back, {fullName || "User"}</h1>
              <p className="text-sm text-muted-foreground">Manage your account settings</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search for anything...." className="pl-9" />
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
              </Button>
              <Avatar>
                <AvatarImage src={avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"} />
                <AvatarFallback>{fullName?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Settings Content */}
        <div className="p-8">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList>
              <TabsTrigger value="profile">Edit Profile</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                <div className="md:col-span-2 flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop"} />
                    <AvatarFallback>{fullName?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">Profile Picture</h3>
                    <p className="text-sm text-muted-foreground">Update your profile picture</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Your Name</Label>
                  <Input 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>User Name</Label>
                  <Input 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input 
                    type="date" 
                    value={dateOfBirth} 
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Present Address</Label>
                  <Input 
                    value={presentAddress} 
                    onChange={(e) => setPresentAddress(e.target.value)}
                    placeholder="Enter your present address"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Permanent Address</Label>
                  <Input 
                    value={permanentAddress} 
                    onChange={(e) => setPermanentAddress(e.target.value)}
                    placeholder="Enter your permanent address"
                  />
                </div>

                <div className="space-y-2">
                  <Label>City</Label>
                  <Input 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter your city"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Postal Code</Label>
                  <Input 
                    value={postalCode} 
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="Enter your postal code"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input 
                    value={country} 
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Enter your country"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <Button 
                    size="lg" 
                    className="px-12"
                    onClick={handleProfileSave}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <div className="max-w-4xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Input 
                      value={currency} 
                      onChange={(e) => setCurrency(e.target.value)}
                      placeholder="Enter your currency (e.g., USD, GHS)"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Time Zone</Label>
                    <Input 
                      value={timezone} 
                      onChange={(e) => setTimezone(e.target.value)}
                      placeholder="Enter your timezone"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Notification</h3>
                  
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium">Receive promotional emails and notifications</p>
                    </div>
                    <Switch 
                      checked={notificationPromotional}
                      onCheckedChange={setNotificationPromotional}
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium">I receive promotional offers</p>
                    </div>
                    <Switch 
                      checked={notificationOffers}
                      onCheckedChange={setNotificationOffers}
                    />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium">There are recommendation for my account</p>
                    </div>
                    <Switch 
                      checked={notificationRecommendations}
                      onCheckedChange={setNotificationRecommendations}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button 
                    size="lg" 
                    className="px-12"
                    onClick={handlePreferencesSave}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <div className="max-w-4xl space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Two-factor Authentication</h3>
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium">Enable or disable two factor authentication</p>
                    </div>
                    <Switch 
                      checked={twoFactorEnabled}
                      onCheckedChange={setTwoFactorEnabled}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button 
                      size="lg" 
                      className="px-12"
                      onClick={handleSecuritySave}
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save 2FA Settings"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Change Password</h3>
                  
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input 
                      type="password" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <Input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      size="lg" 
                      className="px-12"
                      onClick={handlePasswordChange}
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Update Password"}
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Settings;
