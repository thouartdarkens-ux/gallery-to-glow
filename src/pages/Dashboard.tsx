import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, LogOut, LayoutDashboard, Award, Settings, LifeBuoy, TrendingUp, TrendingDown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.jpg";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeNav, setActiveNav] = useState("overview");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [waitlistMembers, setWaitlistMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Get current user from localStorage
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

        // Fetch leaderboard data (all users sorted by total_points)
        const { data: leaderboardData, error: leaderboardError } = await supabase
          .from('users')
          .select('*')
          .order('total_points', { ascending: false })
          .limit(10);

        if (leaderboardError) throw leaderboardError;

        // Calculate rank dynamically based on position in sorted array
        const rankedData = (leaderboardData || []).map((user, index) => ({
          ...user,
          rank: index + 1
        }));
        setLeaderboard(rankedData);

        // Find current user's rank in the full leaderboard
        if (currentUserData) {
          const userRank = rankedData.findIndex(u => u.id === currentUserData.id) + 1;
          if (userRank > 0) {
            setCurrentUser({ ...currentUserData, rank: userRank });
          } else {
            // User is not in top 10, calculate their rank
            const { count } = await supabase
              .from('users')
              .select('*', { count: 'exact', head: true })
              .gt('total_points', currentUserData.total_points);
            setCurrentUser({ ...currentUserData, rank: (count || 0) + 1 });
          }
        }

        // Fetch waitlist data - only entries that used current user's referral code
        if (currentUserData?.reference_code) {
          const { data: waitlistData, error: waitlistError } = await supabase
            .from('waitlist')
            .select('*')
            .eq('referral_code', currentUserData.reference_code)
            .order('created_at', { ascending: false })
            .limit(10);

          if (waitlistError) throw waitlistError;
          setWaitlistMembers(waitlistData || []);
        }

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

  const maskEmail = (email: string) => {
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 3) {
      return `${localPart}***@${domain}`;
    }
    return `${localPart.substring(0, 3)}${'*'.repeat(localPart.length - 3)}@${domain}`;
  };


  if (loading || !currentUser) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const stats = [
    { label: "Accumulated points", value: currentUser.accumulated_points.toString(), change: "+18%", trend: "up" },
    { label: "Deducted points", value: currentUser.deducted_points.toString(), change: "0%", trend: "neutral" },
    { label: "Total points", value: currentUser.total_points.toString(), change: "+25%", trend: "up" },
    { label: "Pending points", value: currentUser.pending_points.toString(), change: "+8%", trend: "up" },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Sidebar - hidden on mobile */}
      <aside className="hidden lg:flex w-64 bg-card border-r flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Hallway Logo" className="w-8 h-8 rounded-full object-cover" />
            <span className="font-semibold">Hallway Volunteer Portal</span>
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
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
              activeNav === "overview" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent/50"
            }`}
            onClick={() => setActiveNav("overview")}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="text-sm font-medium">Overview</span>
          </Link>
          <Link
            to="/achievements"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
              activeNav === "achievements" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent/50"
            }`}
            onClick={() => setActiveNav("achievements")}
          >
            <Award className="h-4 w-4" />
            <span className="text-sm font-medium">Achievements</span>
          </Link>
          <Link
            to="/settings"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
              activeNav === "settings" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent/50"
            }`}
            onClick={() => setActiveNav("settings")}
          >
            <Settings className="h-4 w-4" />
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
            onClick={() => {
              localStorage.removeItem('currentUser');
              navigate("/login");
            }}
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
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-foreground">Welcome Back, {currentUser.full_name?.split(' ')[0] || 'User'}</h1>
              <p className="text-xs lg:text-sm text-muted-foreground">Here's what it looks like today</p>
            </div>
            <div className="flex items-center gap-2 lg:gap-4">
              <div className="relative hidden md:block w-48 lg:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search for anything...." className="pl-9" />
              </div>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
              </Button>
              <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
                <AvatarImage src={currentUser.avatar_url} />
                <AvatarFallback>{currentUser.full_name?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 lg:p-8 space-y-6 lg:space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-3xl font-bold">{stat.value}</h3>
                      <Badge 
                        variant={stat.trend === "up" ? "default" : "secondary"}
                        className="gap-1"
                      >
                        {stat.trend === "up" ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : stat.trend === "down" ? (
                          <TrendingDown className="h-3 w-3" />
                        ) : null}
                        {stat.change}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Profile Card */}
            <Card className="lg:col-span-2">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
                  <Avatar className="h-20 w-20 md:h-24 md:w-24">
                    <AvatarImage src={currentUser.avatar_url} />
                    <AvatarFallback>{currentUser.full_name?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg md:text-xl font-bold">{currentUser.full_name}</h3>
                      {currentUser.verified && <CheckCircle2 className="h-5 w-5 text-primary" />}
                      <img src="https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=32&h=32&fit=crop" alt="Badge" className="h-6 w-6" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Referral ID</p>
                        <p className="text-lg font-semibold text-primary">{currentUser.reference_code}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Points</p>
                        <p className="text-lg font-semibold">{currentUser.total_points}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Referrals</p>
                        <p className="text-lg font-semibold">{currentUser.referrals_count}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:gap-6 pt-2">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Level</p>
                        <p className="text-base font-medium">{currentUser.level}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Rank</p>
                        <p className="text-base font-medium">{currentUser.rank}{currentUser.rank === 1 ? 'st' : currentUser.rank === 2 ? 'nd' : currentUser.rank === 3 ? 'rd' : 'th'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="hidden lg:flex flex-col items-center">
                    <img 
                      src="https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=200&h=200&fit=crop" 
                      alt="Achievement badge" 
                      className="w-32 h-32 object-contain"
                    />
                    <div className="mt-2 space-y-1 text-center text-xs">
                      <p className="flex items-center gap-1 text-accent">
                        <span className="font-medium">🏆 Top 5 : Hallway Star Volunteer</span>
                      </p>
                      <p className="text-primary">🔵 Rank 6-10 :Active Volunteer</p>
                      <p className="text-pink-500">💮 Rank 11-20 :Support Volunteer</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Current Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.slice(0, 5).map((user, index) => (
                    <div key={user.id} className="flex items-center gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>{user.full_name?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="text-sm font-medium truncate">{user.full_name}</p>
                            {user.verified && <CheckCircle2 className="h-3 w-3 text-primary flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground">{user.total_points} points</p>
                        </div>
                      </div>
                      <Badge variant="outline">#{user.rank}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Waitlist Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle>My Referrals</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {waitlistMembers.length === 0
                      ? "No one has used your referral code yet"
                      : `${waitlistMembers.length} people joined using your referral code`}
                  </p>
                </div>
                <Button variant="link" className="text-primary">
                  See Full List →
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {waitlistMembers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No one has used your referral code yet</p>
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          Email Address ↓
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          Join Date ↓
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {waitlistMembers.map((member, index) => (
                        <tr key={member.id || index} className="hover:bg-muted/50">
                          <td className="px-6 py-4 text-sm">{maskEmail(member.email)}</td>
                          <td className="px-6 py-4 text-sm">{new Date(member.created_at).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-sm">
                            <Badge variant={member.status === 'verified' ? 'default' : 'secondary'}>
                              {member.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
