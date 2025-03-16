
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "./types";

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const { toast } = useToast();

  const checkUserRole = async () => {
    try {
      console.log("Checking user session...");
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No active session found");
        return null;
      }

      console.log("Session found, checking user role");
      // Get user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (roleError) {
        console.error("Error fetching user role:", roleError);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to get user role"
        });
        return null;
      }

      const role = roleData?.role as UserRole || null;
      console.log("User role:", role);
      setUserRole(role);
      return { role, userId: session.user.id };
    } catch (error) {
      console.error("Error in checkUserRole:", error);
      return null;
    }
  };

  return {
    userRole,
    setUserRole,
    checkUserRole
  };
};
