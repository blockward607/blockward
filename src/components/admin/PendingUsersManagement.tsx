
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Clock, CheckCircle, XCircle, User, GraduationCap, Eye } from "lucide-react";

interface PendingUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  institution_code: string;
  status: string;
  created_at: string;
  additional_info?: any;
}

interface PendingUsersManagementProps {
  schoolId?: string | null;
}

export const PendingUsersManagement = ({ schoolId }: PendingUsersManagementProps) => {
  const { toast } = useToast();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    if (schoolId) {
      loadPendingUsers();
    }
  }, [schoolId]);

  const loadPendingUsers = async () => {
    if (!schoolId) {
      console.log('PendingUsersManagement: No school ID provided');
      setLoading(false);
      return;
    }

    try {
      console.log('PendingUsersManagement: Loading pending users for school:', schoolId);
      
      const { data, error } = await supabase
        .from('pending_users')
        .select('*')
        .eq('school_id', schoolId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('PendingUsersManagement: Loaded', data?.length || 0, 'pending users');
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

  const processUser = async (userId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      setProcessing(userId);
      
      const { data, error } = await supabase.rpc('process_pending_user', {
        p_pending_user_id: userId,
        p_action: action,
        p_rejection_reason: reason || null
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: action === 'approve' ? "User Approved" : "User Rejected",
          description: data.message
        });
        
        // Remove from pending list
        setPendingUsers(prev => prev.filter(user => user.id !== userId));
        setSelectedUser(null);
        setRejectionReason("");
      } else {
        throw new Error(data?.error || 'Unknown error occurred');
      }
    } catch (error: any) {
      console.error('Error processing user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to process user request"
      });
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!schoolId) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center text-gray-400">
          <p>No school assigned to admin account</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Pending User Requests</h2>
          <p className="text-gray-400">Review and approve new teacher and student signup requests</p>
        </div>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Pending Requests ({pendingUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No pending requests</p>
              <p className="text-sm mt-2">All signup requests have been processed</p>
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
                        <div className="flex items-center gap-1">
                          {user.role === 'teacher' ? <GraduationCap className="w-3 h-3" /> : <User className="w-3 h-3" />}
                          {user.role}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">{user.institution_code}</TableCell>
                    <TableCell className="text-gray-300">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedUser(user)}
                              className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-gray-800 border-gray-700">
                            <DialogHeader>
                              <DialogTitle className="text-white">Review User Request</DialogTitle>
                              <DialogDescription className="text-gray-400">
                                Review the details and approve or reject this user request
                              </DialogDescription>
                            </DialogHeader>
                            {selectedUser && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium text-gray-300">Full Name</label>
                                    <p className="text-white">{selectedUser.full_name}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-300">Email</label>
                                    <p className="text-white">{selectedUser.email}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-300">Role</label>
                                    <p className="text-white capitalize">{selectedUser.role}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-300">Institution Code</label>
                                    <p className="text-white">{selectedUser.institution_code}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-300">Requested At</label>
                                    <p className="text-white">{new Date(selectedUser.created_at).toLocaleString()}</p>
                                  </div>
                                </div>
                                
                                {selectedUser.additional_info && Object.keys(selectedUser.additional_info).length > 0 && (
                                  <div>
                                    <label className="text-sm font-medium text-gray-300">Additional Information</label>
                                    <pre className="text-white text-sm mt-1 bg-gray-700 p-2 rounded">
                                      {JSON.stringify(selectedUser.additional_info, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                
                                <div className="pt-4 border-t border-gray-600">
                                  <div className="space-y-3">
                                    <Textarea
                                      placeholder="Rejection reason (optional for rejection)"
                                      value={rejectionReason}
                                      onChange={(e) => setRejectionReason(e.target.value)}
                                      className="bg-gray-700 border-gray-600 text-white"
                                    />
                                    <div className="flex justify-end gap-2">
                                      <Button
                                        variant="outline"
                                        onClick={() => processUser(selectedUser.id, 'reject', rejectionReason)}
                                        disabled={processing === selectedUser.id}
                                        className="border-red-600 text-red-400 hover:bg-red-600/20"
                                      >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Reject
                                      </Button>
                                      <Button
                                        onClick={() => processUser(selectedUser.id, 'approve')}
                                        disabled={processing === selectedUser.id}
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Approve
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          size="sm"
                          onClick={() => processUser(user.id, 'approve')}
                          disabled={processing === user.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => processUser(user.id, 'reject')}
                          disabled={processing === user.id}
                          className="border-red-600 text-red-400 hover:bg-red-600/20"
                        >
                          <XCircle className="w-4 h-4" />
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
