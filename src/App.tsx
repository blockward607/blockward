
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import StudentDashboard from "@/pages/StudentDashboard";
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
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        checkUserRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
    if (session) {
      checkUserRole(session.user.id);
    }
  };

  const checkUserRole = async (userId: string) => {
    try {
      const { data: teacherProfile } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      setUserRole(teacherProfile ? 'teacher' : 'student');
    } catch (error) {
      setUserRole('student'); // Default to student if error
    }
  };

  // Direct access to student dashboard for testing
  const viewStudentDashboard = () => {
    return <StudentDashboard />;
  };

  if (isAuthenticated === null) {
    return null; // Loading state
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/reset-password" element={<Auth />} />
        <Route path="/view-student-dashboard" element={viewStudentDashboard()} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/auth" />} />
          <Route path="/student-dashboard" element={
            isAuthenticated ? 
              (userRole === 'student' ? <StudentDashboard /> : <Navigate to="/dashboard" />) : 
              <Navigate to="/auth" />
          } />
          <Route path="/students" element={
            isAuthenticated ? 
              (userRole === 'teacher' ? <Students /> : <Navigate to="/dashboard" />) : 
              <Navigate to="/auth" />
          } />
          <Route path="/classes" element={isAuthenticated ? <Classes /> : <Navigate to="/auth" />} />
          <Route path="/assignments" element={isAuthenticated ? <Assignments /> : <Navigate to="/auth" />} />
          <Route path="/attendance" element={
            isAuthenticated ? 
              (userRole === 'teacher' ? <Attendance /> : <Navigate to="/dashboard" />) : 
              <Navigate to="/auth" />
          } />
          <Route path="/behavior" element={
            isAuthenticated ? 
              (userRole === 'teacher' ? <Behavior /> : <Navigate to="/dashboard" />) : 
              <Navigate to="/auth" />
          } />
          <Route path="/achievements" element={isAuthenticated ? <Achievements /> : <Navigate to="/auth" />} />
          <Route path="/resources" element={isAuthenticated ? <Resources /> : <Navigate to="/auth" />} />
          <Route path="/messages" element={isAuthenticated ? <Messages /> : <Navigate to="/auth" />} />
          <Route path="/analytics" element={
            isAuthenticated ? 
              (userRole === 'teacher' ? <Analytics /> : <Navigate to="/dashboard" />) : 
              <Navigate to="/auth" />
          } />
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
