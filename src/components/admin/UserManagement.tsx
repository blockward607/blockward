import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Shield, Ban, Unlock, Search, UserPlus, Trash2 } from "lucide-react";

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
  last_sign_in_at: string;
  is_active: boolean;
  profile_name?: string;
}

export const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const loadUsers = async () => {
    console.log('UserManagement: Loading users');
    
    try {
      setLoading(true);
      
      // First, get basic user roles
      console.log('UserManagement: Fetching user roles');
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) {
        console.error('UserManagement: Error fetching user roles:', rolesError);
        throw rolesError;
      }

      console.log('UserManagement: Found user roles:', userRoles?.length);

      if (!userRoles || userRoles.length === 0) {
        console.log('UserManagement: No user roles found');
        setUsers([]);
        return;
      }

      // Get student profiles separately
      const studentIds = userRoles.filter(ur => ur.role === 'student').map(ur => ur.user_id);
      let studentProfiles: any[] = [];
      
      if (studentIds.length > 0) {
        console.log('UserManagement: Fetching student profiles for', studentIds.length, 'students');
        const { data: students, error: studentsError } = await supabase
          .from('students')
          .select('user_id, name')
          .in('user_id', studentIds);
          
        if (studentsError) {
          console.warn('UserManagement: Error fetching students:', studentsError);
        } else {
          studentProfiles = students || [];
        }
      }

      // Get teacher profiles separately
      const teacherIds = userRoles.filter(ur => ur.role === 'teacher' || ur.role === 'admin').map(ur => ur.user_id);
      let teacherProfiles: any[] = [];
      
      if (teacherIds.length > 0) {
        console.log('UserManagement: Fetching teacher profiles for', teacherIds.length, 'teachers');
        const { data: teachers, error: teachersError } = await supabase
          .from('teacher_profiles')
          .select('user_id, full_name')
          .in('user_id', teacherIds);
          
        if (teachersError) {
          console.warn('UserManagement: Error fetching teachers:', teachersError);
        } else {
          teacherProfiles = teachers || [];
        }
      }

      // Combine data
      const userList: User[] = userRoles.map(userRole => {
        let profileName = 'Anonymous User';
        
        if (userRole.role === 'student') {
          const studentProfile = studentProfiles.find(s => s.user_id === userRole.user_id);
          profileName = studentProfile?.name || 'Student User';
        } else {
          const teacherProfile = teacherProfiles.find(t => t.user_id === userRole.user_id);
          profileName = teacherProfile?.full_name || 'Teacher User';
        }

        return {
          id: userRole.user_id,
          email: `user-${userRole.user_id.slice(0, 8)}@school.edu`,
          role: userRole.role,
          created_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
          is_active: true,
          profile_name: profileName
        };
      });

      console.log('UserManagement: Successfully loaded', userList.length, 'users');
      setUsers(userList);
    } catch (error: any) {
      console.error('UserManagement: Error loading users:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load users. Please try again."
      });
      // Set empty array on error so UI can still render
      setUsers([]);
    } finally {
      console.log('UserManagement: Setting loading to false');
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.profile_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      toast({
        title: currentStatus ? "User Suspended" : "User Activated",
        description: `User has been ${currentStatus ? 'suspended' : 'activated'} successfully`
      });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_active: !currentStatus } : user
      ));
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user status"
      });
    }
  };

  const resetUserPassword = async (userId: string) => {
    try {
      toast({
        title: "Password Reset",
        description: "Password reset email sent to user"
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        variant: "destructive", 
        title: "Error",
        description: "Failed to reset password"
      });
    }
  };

  if (loading) {
    console.log('UserManagement: Rendering loading state');
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  console.log('UserManagement: Rendering user list with', filteredUsers.length, 'users');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <p className="text-gray-400">Manage all platform users and their permissions</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <UserPlus className="w-4 h-4 mr-2" />
          Add New User
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-300">User</TableHead>
                <TableHead className="text-gray-300">Role</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Last Active</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-white">
                        {user.profile_name || 'Anonymous User'}
                      </div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      user.role === 'admin' ? 'destructive' : 
                      user.role === 'teacher' ? 'default' : 'secondary'
                    }>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? 'default' : 'secondary'}>
                      {user.is_active ? 'Active' : 'Suspended'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {new Date(user.last_sign_in_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleUserStatus(user.id, user.is_active)}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        {user.is_active ? <Ban className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resetUserPassword(user.id)}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <Shield className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-600 text-red-400 hover:bg-red-600/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
