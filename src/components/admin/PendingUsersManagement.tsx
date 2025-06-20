
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Clock, CheckCircle, XCircle, Search, MessageSquare } from "lucide-react";

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

export const PendingUsersManagement = () => {
  const { toast } = useToast();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    try {
      const { data, error } = await supabase.rpc('process_pending_user', {
        p_pending_user_id: userId,
        p_action: 'approve'
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "User Approved",
          description: "User has been approved and account created successfully"
        });
        loadPendingUsers();
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "Failed to approve user"
        });
      }
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to approve user"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: string, reason: string) => {
    setActionLoading(userId);
    try {
      const { data, error } = await supabase.rpc('process_pending_user', {
        p_pending_user_id: userId,
        p_action: 'reject',
        p_rejection_reason: reason
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "User Rejected",
          description: "User request has been rejected"
        });
        loadPendingUsers();
        setSelectedUser(null);
        setRejectionReason("");
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: data.error || "Failed to reject user"
        });
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to reject user"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = pendingUsers.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Pending User Requests</h2>
          <p className="text-gray-400">Review and approve new teacher and student requests</p>
        </div>
        <Badge variant="outline" className="text-blue-400 border-blue-400">
          {filteredUsers.length} pending
        </Badge>
      </div>

      {/* Search */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search pending users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pending Users Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Pending Requests ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No pending user requests</p>
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
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium text-white">{user.full_name}</div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                        {user.additional_info?.subject && (
                          <div className="text-xs text-gray-500">Subject: {user.additional_info.subject}</div>
                        )}
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
                          onClick={() => handleApprove(user.id)}
                          disabled={actionLoading === user.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedUser(user)}
                              className="border-red-600 text-red-400 hover:bg-red-600/20"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-gray-800 border-gray-700">
                            <DialogHeader>
                              <DialogTitle className="text-white">Reject User Request</DialogTitle>
                              <DialogDescription className="text-gray-400">
                                Are you sure you want to reject {selectedUser?.full_name}'s request?
                                Please provide a reason for rejection.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Textarea
                                placeholder="Reason for rejection..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="bg-gray-700 border-gray-600 text-white"
                              />
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedUser(null);
                                  setRejectionReason("");
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => selectedUser && handleReject(selectedUser.id, rejectionReason)}
                                disabled={!rejectionReason.trim() || actionLoading === selectedUser?.id}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
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
