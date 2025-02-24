
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import Rewards from "@/pages/Rewards";
import Attendance from "@/pages/Attendance";
import Settings from "@/pages/Settings";
import Students from "@/pages/Students";
import Classes from "@/pages/Classes";
import Behavior from "@/pages/Behavior";
import Achievements from "@/pages/Achievements";
import Assignments from "@/pages/Assignments";
import Resources from "@/pages/Resources";
import Progress from "@/pages/Progress";
import Messages from "@/pages/Messages";
import Analytics from "@/pages/Analytics";
import Notifications from "@/pages/Notifications";
import Wallet from "@/pages/Wallet";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return null; // Loading state
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />} />
          <Route path="/students" element={isAuthenticated ? <Students /> : <Navigate to="/auth" />} />
          <Route path="/classes" element={isAuthenticated ? <Classes /> : <Navigate to="/auth" />} />
          <Route path="/assignments" element={isAuthenticated ? <Assignments /> : <Navigate to="/auth" />} />
          <Route path="/attendance" element={isAuthenticated ? <Attendance /> : <Navigate to="/auth" />} />
          <Route path="/behavior" element={isAuthenticated ? <Behavior /> : <Navigate to="/auth" />} />
          <Route path="/achievements" element={isAuthenticated ? <Achievements /> : <Navigate to="/auth" />} />
          <Route path="/resources" element={isAuthenticated ? <Resources /> : <Navigate to="/auth" />} />
          <Route path="/messages" element={isAuthenticated ? <Messages /> : <Navigate to="/auth" />} />
          <Route path="/analytics" element={isAuthenticated ? <Analytics /> : <Navigate to="/auth" />} />
          <Route path="/rewards" element={isAuthenticated ? <Rewards /> : <Navigate to="/auth" />} />
          <Route path="/wallet" element={isAuthenticated ? <Wallet /> : <Navigate to="/auth" />} />
          <Route path="/notifications" element={isAuthenticated ? <Notifications /> : <Navigate to="/auth" />} />
          <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/auth" />} />
          <Route path="/progress" element={isAuthenticated ? <Progress /> : <Navigate to="/auth" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
