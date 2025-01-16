import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      }
    };
    checkUser();
  }, [navigate]);

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold gradient-text mb-8">Dashboard</h1>
      <button
        onClick={() => supabase.auth.signOut()}
        className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded"
      >
        Sign Out
      </button>
    </div>
  );
};

export default Dashboard;