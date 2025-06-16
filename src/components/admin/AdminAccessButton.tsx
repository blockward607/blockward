
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Settings, School, Building } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const AdminAccessButton = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasSchool, setHasSchool] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return;
      }

      // Check if user is admin
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      const isUserAdmin = userRole?.role === 'admin';
      setIsAdmin(isUserAdmin);

      // Check if user has a school (admin profile)
      if (isUserAdmin) {
        const { data: adminProfile } = await supabase
          .from('admin_profiles')
          .select('school_id')
          .eq('user_id', session.user.id)
          .single();

        setHasSchool(!!adminProfile?.school_id);
      }

    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-2">
      {isAdmin ? (
        <>
          <Button 
            onClick={() => navigate('/admin')}
            className="w-full bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            Admin Dashboard
          </Button>
          <Button 
            onClick={() => navigate('/school-setup')}
            variant="outline"
            className="w-full border-blue-500/30 text-blue-300 hover:bg-blue-600/20 flex items-center gap-2"
          >
            <School className="w-4 h-4" />
            {hasSchool ? 'School Settings' : 'Setup School'}
          </Button>
        </>
      ) : (
        <>
          <Button 
            onClick={() => navigate('/school-setup')}
            className="w-full bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <Building className="w-4 h-4" />
            Setup School
          </Button>
          <Button 
            onClick={() => navigate('/admin-setup')}
            variant="outline"
            className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-600/20 flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Setup Admin Account
          </Button>
        </>
      )}
    </div>
  );
};
