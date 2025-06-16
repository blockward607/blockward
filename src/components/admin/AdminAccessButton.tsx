
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Shield, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const AdminAccessButton = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
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

      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      setIsAdmin(userRole?.role === 'admin');
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
        <Button 
          onClick={() => navigate('/admin')}
          className="w-full bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
        >
          <Shield className="w-4 h-4" />
          Admin Dashboard
        </Button>
      ) : (
        <Button 
          onClick={() => navigate('/admin-setup')}
          variant="outline"
          className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-600/20 flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Setup Admin Account
        </Button>
      )}
    </div>
  );
};
