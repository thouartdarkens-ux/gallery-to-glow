import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, LogOut, LayoutDashboard, Award, Settings, LifeBuoy, TrendingUp, TrendingDown, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("overview");

  const stats = [
    { label: "Accumulated points", value: "7235", change: "+18%", trend: "up" },
    { label: "Deducted points", value: "0", change: "0%", trend: "neutral" },
    { label: "Total points", value: "7235", change: "+25%", trend: "up" },
    { label: "Pending points", value: "17", change: "+8%", trend: "up" },
  ];

  const leaderboard = [
    { name: "Charles Oneli", points: 7500, rank: 1, verified: true },
    { name: "Sylvia Omene", points: 6500, rank: 2, verified: false },
    { name: "Hajia Husseini", points: 6000, rank: 4, verified: true },
    { name: "Jeffrey Appiah", points: 5000, rank: 5, verified: true },
    { name: "Henry Aziale", points: 4500, rank: 6, verified: true },
  ];

  const waitlistMembers = [
    { email: "gra*********@gmail.com...", joinDate: "30th June,2026", code: "HW26ZXCG" },
    { email: "be**********@gmail.com...", joinDate: "21st April,2026", code: "HW26ZXCG" },
    { email: "ju**********@gmail.com...", joinDate: "17th October,2026", code: "HW26ZXCG" },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r flex flex-col">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold">H</span>
            </div>
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
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full"></span>
              </Button>
              <Avatar>
                <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" />
                <AvatarFallback>GR</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="lg:col-span-2">
              <CardContent className="pt-6">
                <div className="flex items-start gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" />
                    <AvatarFallback>GR</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold">Grant Reese Arthur</h3>
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <img src="https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=32&h=32&fit=crop" alt="Badge" className="h-6 w-6" />
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Referral ID</p>
                        <p className="text-lg font-semibold text-primary">7201986</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Points</p>
                        <p className="text-lg font-semibold">7235</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Referrals</p>
                        <p className="text-lg font-semibold">12</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6 pt-2">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Level</p>
                        <p className="text-base font-medium">Active Volunteer</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase">Rank</p>
                        <p className="text-base font-medium">9th</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
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
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`https://images.unsplash.com/photo-${1500000000000 + index * 1000000}?w=100&h=100&fit=crop`} />
                          <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <p className="text-sm font-medium truncate">{user.name}</p>
                            {user.verified && <CheckCircle2 className="h-3 w-3 text-primary flex-shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground">{user.points} points</p>
                        </div>
                      </div>
                      <Badge variant="outline">{user.rank}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Waitlist Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>New Waitlist Members</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    A quick glance at the latest people who joined through your reference code.
                  </p>
                </div>
                <Button variant="link" className="text-primary">
                  See Full List →
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
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
                        Time Joined ↓
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {waitlistMembers.map((member, index) => (
                      <tr key={index} className="hover:bg-muted/50">
                        <td className="px-6 py-4 text-sm">{member.email}</td>
                        <td className="px-6 py-4 text-sm">{member.joinDate}</td>
                        <td className="px-6 py-4 text-sm">{member.code}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
