
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Shield, Crown, Users, GraduationCap, User } from "lucide-react";

interface AdminUser {
  id: string;
  user_id: string;
  full_name: string;
  position: string;
  access_level: string;
}

const accessLevelConfig = {
  super_admin: { icon: Crown, color: "bg-red-500", label: "Super Admin" },
  ict_admin: { icon: Shield, color: "bg-purple-500", label: "ICT Admin" },
  head_teacher: { icon: GraduationCap, color: "bg-blue-500", label: "Head Teacher" },
  department_head: { icon: Users, color: "bg-green-500", label: "Department Head" },
  form_tutor: { icon: User, color: "bg-orange-500", label: "Form Tutor" }
};

export const AccessLevelManagement = () => {
  const { toast } = useToast();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserLevel, setCurrentUserLevel] = useState<string>("");

  useEffect(() => {
    loadAdminUsers();
  }, []);

  const loadAdminUsers = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get current user's access level
      const { data: currentUser } = await supabase
        .from('admin_profiles')
        .select('access_level')
        .eq('user_id', session.user.id)
        .single();

      setCurrentUserLevel(currentUser?.access_level || "");

      // Get all admin users
      const { data: admins } = await supabase
        .from('admin_profiles')
        .select('id, user_id, full_name, position, access_level')
        .order('access_level');

      setAdminUsers(admins || []);
    } catch (error) {
      console.error('Error loading admin users:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load admin users"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAccessLevel = async (adminId: string, newLevel: string) => {
    try {
      const { error } = await supabase
        .from('admin_profiles')
        .update({ access_level: newLevel })
        .eq('id', adminId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Access level updated successfully"
      });

      loadAdminUsers();
    } catch (error: any) {
      console.error('Error updating access level:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update access level"
      });
    }
  };

  const canModifyLevel = (userLevel: string) => {
    const hierarchy = ['form_tutor', 'department_head', 'head_teacher', 'ict_admin', 'super_admin'];
    const currentIndex = hierarchy.indexOf(currentUserLevel);
    const targetIndex = hierarchy.indexOf(userLevel);
    
    return currentIndex > targetIndex;
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Access Level Management</h2>
          <p className="text-gray-400">Manage admin access levels and permissions</p>
        </div>
      </div>

      {/* Access Level Hierarchy Info */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Access Level Hierarchy</CardTitle>
          <CardDescription className="text-gray-400">
            Higher levels can manage users below them
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(accessLevelConfig).reverse().map(([level, config]) => {
              const Icon = config.icon;
              return (
                <div key={level} className="text-center">
                  <div className={`w-12 h-12 ${config.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-medium text-white">{config.label}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Admin Users List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {adminUsers.map((admin) => {
          const levelConfig = accessLevelConfig[admin.access_level as keyof typeof accessLevelConfig];
          const Icon = levelConfig?.icon || User;
          
          return (
            <motion.div
              key={admin.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${levelConfig?.color || 'bg-gray-500'} rounded-full flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-white">
                          {admin.full_name || `Admin ${admin.id.slice(0, 8)}`}
                        </CardTitle>
                        <CardDescription className="text-gray-400">
                          {admin.position || "Administrator"}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`${levelConfig?.color || 'bg-gray-500'} text-white`}
                    >
                      {levelConfig?.label || admin.access_level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {canModifyLevel(admin.access_level) && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">Change Access Level:</label>
                      <Select 
                        value={admin.access_level} 
                        onValueChange={(value) => updateAccessLevel(admin.id, value)}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(accessLevelConfig).map(([level, config]) => (
                            <SelectItem key={level} value={level}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {!canModifyLevel(admin.access_level) && (
                    <p className="text-sm text-gray-500">
                      You cannot modify this user's access level
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {adminUsers.length === 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="text-center py-8">
            <Shield className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No Admin Users Found</h3>
            <p className="text-gray-500">Admin users will appear here once they are created</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
