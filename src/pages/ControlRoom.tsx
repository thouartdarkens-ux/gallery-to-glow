import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Plus, Pencil, Trash2, LogOut, Search, Users, Trophy, Mail, ChevronDown, ChevronUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const userSchema = z.object({
  full_name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  reference_code: z.string().min(1, "Reference code is required"),
});

const ControlRoom = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [waitlistSearchQuery, setWaitlistSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  
  // Collapsible states
  const [isCredentialsOpen, setIsCredentialsOpen] = useState(false);
  const [isUsersOpen, setIsUsersOpen] = useState(true);
  
  // Admin credentials states
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [newAdminUsername, setNewAdminUsername] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Form states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referenceCode, setReferenceCode] = useState("");
  const [username, setUsername] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [presentAddress, setPresentAddress] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [level, setLevel] = useState("Support Volunteer");
  const [verified, setVerified] = useState(false);
  const [accumulatedPoints, setAccumulatedPoints] = useState(0);
  const [deductedPoints, setDeductedPoints] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [pendingPoints, setPendingPoints] = useState(0);

  useEffect(() => {
    // Check authentication
    const auth = localStorage.getItem("controlRoomAuth");
    if (auth !== "authenticated") {
      navigate("/controlroomlogin");
      return;
    }
    
    loadUsers();
    loadWaitlist();
    loadAdminCredentials();
  }, [navigate]);

  const loadAdminCredentials = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_credentials")
        .select("*")
        .single();

      if (error) throw error;
      if (data) {
        setAdminUsername(data.username);
        setNewAdminUsername(data.username);
      }
    } catch (error) {
      console.error("Error loading admin credentials:", error);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const loadWaitlist = async () => {
    try {
      const { data, error } = await supabase
        .from("waitlist")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWaitlist(data || []);
    } catch (error) {
      console.error("Error loading waitlist:", error);
      toast.error("Failed to load waitlist");
    }
  };

  // Get leaderboard sorted by total_points
  const leaderboard = [...users].sort((a, b) => (b.total_points || 0) - (a.total_points || 0));

  // Filter waitlist
  const filteredWaitlist = waitlist.filter(entry =>
    entry.email?.toLowerCase().includes(waitlistSearchQuery.toLowerCase()) ||
    entry.referral_code?.toLowerCase().includes(waitlistSearchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPassword("");
    setReferenceCode("");
    setUsername("");
    setDateOfBirth("");
    setPresentAddress("");
    setPermanentAddress("");
    setCity("");
    setPostalCode("");
    setCountry("");
    setLevel("Support Volunteer");
    setVerified(false);
    setAccumulatedPoints(0);
    setDeductedPoints(0);
    setTotalPoints(0);
    setPendingPoints(0);
    setEditingUser(null);
  };

  const openEditDialog = (user: any) => {
    setEditingUser(user);
    setFullName(user.full_name || "");
    setEmail(user.email);
    setPassword("");
    setReferenceCode(user.reference_code);
    setUsername(user.username || "");
    setDateOfBirth(user.date_of_birth || "");
    setPresentAddress(user.present_address || "");
    setPermanentAddress(user.permanent_address || "");
    setCity(user.city || "");
    setPostalCode(user.postal_code || "");
    setCountry(user.country || "");
    setLevel(user.level || "Support Volunteer");
    setVerified(user.verified);
    setAccumulatedPoints(user.accumulated_points || 0);
    setDeductedPoints(user.deducted_points || 0);
    setTotalPoints(user.total_points || 0);
    setPendingPoints(user.pending_points || 0);
  };

  const handleAddUser = async () => {
    try {
      const userData = {
        full_name: fullName,
        email,
        password,
        reference_code: referenceCode,
      };

      userSchema.parse(userData);

      const { error } = await supabase
        .from("users")
        .insert([{
          ...userData,
          username: username || null,
          date_of_birth: dateOfBirth || null,
          present_address: presentAddress || null,
          permanent_address: permanentAddress || null,
          city: city || null,
          postal_code: postalCode || null,
          country: country || null,
          level,
          verified,
        }]);

      if (error) throw error;

      toast.success("User added successfully");
      setIsAddDialogOpen(false);
      resetForm();
      loadUsers();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        console.error("Error adding user:", error);
        toast.error("Failed to add user");
      }
    }
  };

  const handleUpdateUser = async () => {
    try {
      const updateData: any = {
        full_name: fullName,
        email,
        reference_code: referenceCode,
        username: username || null,
        date_of_birth: dateOfBirth || null,
        present_address: presentAddress || null,
        permanent_address: permanentAddress || null,
        city: city || null,
        postal_code: postalCode || null,
        country: country || null,
        level,
        verified,
        accumulated_points: accumulatedPoints,
        deducted_points: deductedPoints,
        total_points: totalPoints,
        pending_points: pendingPoints,
      };

      if (password) {
        updateData.password = password;
      }

      const { error } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", editingUser.id);

      if (error) throw error;

      toast.success("User updated successfully");
      setEditingUser(null);
      resetForm();
      loadUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const { error } = await supabase
        .from("users")
        .delete()
        .eq("id", userId);

      if (error) throw error;

      toast.success("User deleted successfully");
      loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleUpdateCredentials = async () => {
    try {
      if (!newAdminPassword || !confirmPassword) {
        toast.error("Please fill in both password fields");
        return;
      }

      if (newAdminPassword !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      if (newAdminPassword.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }

      const { error } = await supabase
        .from("admin_credentials")
        .update({
          username: newAdminUsername,
          password: newAdminPassword,
        })
        .eq("username", adminUsername);

      if (error) throw error;

      setAdminUsername(newAdminUsername);
      setNewAdminPassword("");
      setConfirmPassword("");
      toast.success("Credentials updated successfully");
      
      // Update localStorage to reflect new authentication
      localStorage.setItem("controlRoomAuth", "authenticated");
    } catch (error) {
      console.error("Error updating credentials:", error);
      toast.error("Failed to update credentials");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("controlRoomAuth");
    navigate("/controlroomlogin");
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.reference_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Control Room</h1>
              <p className="text-sm text-muted-foreground">User Management System</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Admin Credentials Management */}
        <Collapsible open={isCredentialsOpen} onOpenChange={setIsCredentialsOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle>Update Control Room Credentials</CardTitle>
                  {isCredentialsOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="max-w-md space-y-4">
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input 
                      value={newAdminUsername} 
                      onChange={(e) => setNewAdminUsername(e.target.value)}
                      placeholder="Enter new username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input 
                      type="password" 
                      value={newAdminPassword} 
                      onChange={(e) => setNewAdminPassword(e.target.value)}
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
                  <Button onClick={handleUpdateCredentials} className="w-full">
                    Update Credentials
                  </Button>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Search and Add */}
        <Collapsible open={isUsersOpen} onOpenChange={setIsUsersOpen}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Users ({filteredUsers.length})
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={(e) => { e.stopPropagation(); resetForm(); }} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add User
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Add New User</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Full Name *</Label>
                            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Email *</Label>
                            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Password *</Label>
                            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Reference Code *</Label>
                            <Input value={referenceCode} onChange={(e) => setReferenceCode(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Username</Label>
                            <Input value={username} onChange={(e) => setUsername(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Date of Birth</Label>
                            <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Present Address</Label>
                            <Input value={presentAddress} onChange={(e) => setPresentAddress(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Permanent Address</Label>
                            <Input value={permanentAddress} onChange={(e) => setPermanentAddress(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>City</Label>
                            <Input value={city} onChange={(e) => setCity(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Postal Code</Label>
                            <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Country</Label>
                            <Input value={country} onChange={(e) => setCountry(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Level</Label>
                            <Input value={level} onChange={(e) => setLevel(e.target.value)} />
                          </div>
                        </div>
                        <Button onClick={handleAddUser} className="w-full mt-4">Add User</Button>
                      </DialogContent>
                    </Dialog>
                    {isUsersOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or reference code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <ScrollArea className="h-[400px] border rounded-lg">
                  <div className="overflow-x-auto min-w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background z-10">Actions</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="hidden md:table-cell">Reference Code</TableHead>
                    <TableHead className="hidden md:table-cell">Level</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead className="hidden sm:table-cell">Verified</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="sticky left-0 bg-background z-10">
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(user)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Edit User</DialogTitle>
                              </DialogHeader>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Full Name</Label>
                                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                  <Label>Email</Label>
                                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                  <Label>Password (leave blank to keep current)</Label>
                                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" />
                                </div>
                                <div className="space-y-2">
                                  <Label>Reference Code</Label>
                                  <Input value={referenceCode} onChange={(e) => setReferenceCode(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                  <Label>Username</Label>
                                  <Input value={username} onChange={(e) => setUsername(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                  <Label>Date of Birth</Label>
                                  <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                  <Label>Present Address</Label>
                                  <Input value={presentAddress} onChange={(e) => setPresentAddress(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                  <Label>Permanent Address</Label>
                                  <Input value={permanentAddress} onChange={(e) => setPermanentAddress(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                  <Label>City</Label>
                                  <Input value={city} onChange={(e) => setCity(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                  <Label>Postal Code</Label>
                                  <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                  <Label>Country</Label>
                                  <Input value={country} onChange={(e) => setCountry(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                  <Label>Level</Label>
                                  <Input value={level} onChange={(e) => setLevel(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                  <Label>Accumulated Points</Label>
                                  <Input type="number" value={accumulatedPoints} onChange={(e) => setAccumulatedPoints(Number(e.target.value))} />
                                </div>
                                <div className="space-y-2">
                                  <Label>Deducted Points</Label>
                                  <Input type="number" value={deductedPoints} onChange={(e) => setDeductedPoints(Number(e.target.value))} />
                                </div>
                                <div className="space-y-2">
                                  <Label>Total Points</Label>
                                  <Input type="number" value={totalPoints} onChange={(e) => setTotalPoints(Number(e.target.value))} />
                                </div>
                                <div className="space-y-2">
                                  <Label>Pending Points</Label>
                                  <Input type="number" value={pendingPoints} onChange={(e) => setPendingPoints(Number(e.target.value))} />
                                </div>
                              </div>
                              <Button onClick={handleUpdateUser} className="w-full mt-4">Update User</Button>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className="hidden md:table-cell">{user.reference_code}</TableCell>
                      <TableCell className="hidden md:table-cell">{user.level}</TableCell>
                      <TableCell>{user.total_points}</TableCell>
                      <TableCell className="hidden sm:table-cell">{user.verified ? "✓" : "✗"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
                  </div>
                </ScrollArea>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Waitlist & Leaderboard Tabs */}
        <Tabs defaultValue="waitlist" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="waitlist" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Waitlist ({waitlist.length})
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          {/* Waitlist Tab */}
          <TabsContent value="waitlist">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Waitlist Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by email or referral code..."
                    value={waitlistSearchQuery}
                    onChange={(e) => setWaitlistSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <ScrollArea className="h-[400px] border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Referral Code Used</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredWaitlist.map((entry, index) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>{entry.email}</TableCell>
                          <TableCell>{entry.referral_code || "-"}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              entry.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {entry.status || 'pending'}
                            </span>
                          </TableCell>
                          <TableCell>
                            {entry.created_at 
                              ? new Date(entry.created_at).toLocaleDateString() 
                              : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredWaitlist.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No waitlist entries found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Complete Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Rank</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Reference Code</TableHead>
                        <TableHead>Referrals</TableHead>
                        <TableHead>Level</TableHead>
                        <TableHead className="text-right">Total Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaderboard.map((user, index) => (
                        <TableRow key={user.id} className={index < 3 ? "bg-muted/30" : ""}>
                          <TableCell className="font-bold">
                            {index === 0 && <span className="text-yellow-500">🥇</span>}
                            {index === 1 && <span className="text-gray-400">🥈</span>}
                            {index === 2 && <span className="text-amber-600">🥉</span>}
                            {index > 2 && <span className="text-muted-foreground">{index + 1}</span>}
                          </TableCell>
                          <TableCell className="font-medium">{user.full_name || "-"}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.reference_code}</TableCell>
                          <TableCell>{user.referrals_count || 0}</TableCell>
                          <TableCell>{user.level || "-"}</TableCell>
                          <TableCell className="text-right font-bold">{user.total_points || 0}</TableCell>
                        </TableRow>
                      ))}
                      {leaderboard.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            No users found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ControlRoom;
