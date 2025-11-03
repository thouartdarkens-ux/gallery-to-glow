import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, LogOut, LayoutDashboard, Award, Settings as SettingsIcon, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const profileSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  avatar_url: z.string().url("Invalid URL").optional().or(z.literal("")),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeNav, setActiveNav] = useState("settings");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Preferences state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [promotionalOffers, setPromotionalOffers] = useState(false);
  const [recommendations, setRecommendations] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = localStorage.getItem('currentUser');
        if (!userData) {
          navigate("/login");
          return;
        }

        const user = JSON.parse(userData);

        // Fetch updated user data from database
        const { data: currentUserData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (userError) throw userError;
        
        setCurrentUser(currentUserData);
        setFullName(currentUserData.full_name || "");
        setEmail(currentUserData.email || "");
        setAvatarUrl(currentUserData.avatar_url || "");

      } catch (error: any) {
        console.error('Error loading data:', error);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate, toast]);

  const handleProfileSave = async () => {
    try {
      setSaving(true);
      
      // Validate profile data
      const validatedData = profileSchema.parse({
        full_name: fullName,
        email: email,
        avatar_url: avatarUrl || "",
      });

      // Update user in database
      const { error } = await supabase
        .from('users')
        .update({
          full_name: validatedData.full_name,
          email: validatedData.email,
          avatar_url: validatedData.avatar_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      // Update localStorage
      const updatedUser = { ...currentUser, full_name: validatedData.full_name, email: validatedData.email, avatar_url: validatedData.avatar_url };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to update profile",
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    try {
      setSaving(true);

      // Validate password data
      const validatedData = passwordSchema.parse({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      // Verify current password
      const { data: userData } = await supabase
        .from('users')
        .select('password')
        .eq('id', currentUser.id)
        .single();

      if (userData?.password !== validatedData.currentPassword) {
        throw new Error("Current password is incorrect");
      }

      // Update password
      const { error } = await supabase
        .from('users')
        .update({
          password: validatedData.newPassword,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentUser.id);

      if (error) throw error;

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast({
        title: "Success",
        description: "Password changed successfully",
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to change password",
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate("/login");
  };

  if (loading || !currentUser) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

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
            onClick={() => navigate("/login")}
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
              <h1 className="text-2xl font-bold text-foreground">Welcome Back, Reese</h1>
              <p className="text-sm text-muted-foreground">Here's what it looks like today</p>
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
                <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" />
                <AvatarFallback>GR</AvatarFallback>
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
                    <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" />
                    <AvatarFallback>GR</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">Profile Picture</h3>
                    <p className="text-sm text-muted-foreground">Update your profile picture</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Your Name</Label>
                  <Input defaultValue="Grant Reese" />
                </div>

                <div className="space-y-2">
                  <Label>User Name</Label>
                  <Input defaultValue="grantreese" />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" defaultValue="orggrantarthur@gmail.com" />
                </div>

                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" defaultValue="**********" />
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <Button size="lg" className="px-12" onClick={handleProfileSave} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <div className="max-w-4xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Input defaultValue="GHS" />
                  </div>

                  <div className="space-y-2">
                    <Label>Time Zone</Label>
                    <Input defaultValue="(GMT-12:00) International Date Line West" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Notification</h3>
                  
                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium">Receive promotional emails and notifications</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium">I receive promotional offers</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <div>
                      <p className="font-medium">There are recommendation for my account</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button size="lg" className="px-12">Save</Button>
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
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Change Password</h3>
                  
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input type="password" defaultValue="**********" />
                  </div>

                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input type="password" defaultValue="**********" />
                  </div>

                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <Input type="password" defaultValue="**********" />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button size="lg" className="px-12">Save</Button>
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
