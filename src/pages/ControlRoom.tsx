import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Plus, Pencil, Trash2, LogOut, Search } from "lucide-react";
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
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  
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

  useEffect(() => {
    // Check authentication
    const auth = localStorage.getItem("controlRoomAuth");
    if (auth !== "authenticated") {
      navigate("/controlroomlogin");
      return;
    }
    
    loadUsers();
  }, [navigate]);

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

        {/* Search and Add */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Users ({filteredUsers.length})</CardTitle>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
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
            </div>
          </CardHeader>
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

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Reference Code</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.reference_code}</TableCell>
                      <TableCell>{user.level}</TableCell>
                      <TableCell>{user.total_points}</TableCell>
                      <TableCell>{user.verified ? "✓" : "✗"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
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
                              <div className="grid grid-cols-2 gap-4">
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ControlRoom;
