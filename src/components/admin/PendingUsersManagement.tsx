import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Clock, User, CheckCircle, X, Eye } from "lucide-react";

interface PendingUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  institution_code: string;
  status: string;
  created_at: string;
  additional_info: any;
}

interface ApiResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export const PendingUsersManagement = () => {
  const { toast } = useToast();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingUsers();
  }, []);

  const loadPendingUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('pending_users')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingUsers(data || []);
    } catch (error) {
      console.error('Error loading pending users:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load pending users"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (userId: string, action: 'approve' | 'reject') => {
    try {
      const { data, error } = await supabase.rpc('process_pending_user', {
        p_pending_user_id: userId,
        p_action: action,
        p_rejection_reason: action === 'reject' ? 'Manual rejection by admin' : null
      });

      if (error) throw error;

      // Handle the response properly - data might be boolean or object
      const success = data === true || (typeof data === 'object' && data !== null);
      
      if (success) {
        toast({
          title: action === 'approve' ? "User Approved" : "User Rejected",
          description: `User has been ${action}d successfully`
        });
        
        // Remove from pending list
        setPendingUsers(pendingUsers.filter(user => user.id !== userId));
      } else {
        throw new Error('Operation failed');
      }
    } catch (error: any) {
      console.error(`Error ${action}ing user:`, error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || `Failed to ${action} user`
      });
    }
  };

  const handleReject = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('process_pending_user', {
        p_pending_user_id: userId,
        p_action: 'reject',
        p_rejection_reason: 'Manual rejection by admin'
      });

      if (error) throw error;

      // Handle the response properly - data might be boolean or object
      const success = data === true || (typeof data === 'object' && data !== null);
      
      if (success) {
        toast({
          title: "User Rejected",
          description: "User request has been rejected"
        });
        
        setPendingUsers(pendingUsers.filter(user => user.id !== userId));
      } else {
        throw new Error('Operation failed');
      }
    } catch (error: any) {
      console.error('Error rejecting user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to reject user"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Pending User Requests</h2>
        <p className="text-gray-400">Review and approve new teacher and student signup requests</p>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Pending Requests ({pendingUsers.length})
          </CardTitle>
          <CardDescription className="text-gray-400">
            Users waiting for approval to join your institution
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No pending requests</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-300">User</TableHead>
                  <TableHead className="text-gray-300">Role</TableHead>
                  <TableHead className="text-gray-300">Institution Code</TableHead>
                  <TableHead className="text-gray-300">Requested</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-white">{user.full_name}</div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'teacher' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">{user.institution_code}</TableCell>
                    <TableCell className="text-gray-300">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproval(user.id, 'approve')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(user.id)}
                          className="border-red-600 text-red-400 hover:bg-red-600/20"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
