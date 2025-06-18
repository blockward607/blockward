
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Classes from "./pages/Classes";
import ClassDetails from "./pages/ClassDetails";
import Students from "./pages/Students";
import Attendance from "./pages/Attendance";
import ClassroomAttendance from "./pages/ClassroomAttendance";
import Assignments from "./pages/Assignments";
import Grades from "./pages/Grades";
import Wallet from "./pages/Wallet";
import WalletVerify from "./pages/WalletVerify";
import Settings from "./pages/Settings";
import Behavior from "./pages/Behavior";
import Rewards from "./pages/Rewards";
import Achievements from "./pages/Achievements";
import Resources from "./pages/Resources";
import Notifications from "./pages/Notifications";
import Progress from "./pages/Progress";
import ClassroomInvite from "./pages/ClassroomInvite";
import ClassroomSeating from "./pages/ClassroomSeating";
import StudentDashboard from "./pages/StudentDashboard";
import ViewTeacherDashboard from "./pages/ViewTeacherDashboard";
import AdminPortal from "./pages/AdminPortal";
import AdminDashboard from "./pages/AdminDashboard";
import SignUp from "./pages/SignUp";
import ResetPassword from "./pages/ResetPassword";
import ResetPasswordOTP from "./pages/ResetPasswordOTP";
import IntroPage from "./pages/IntroPage";
import TutorialPage from "./pages/TutorialPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password-otp" element={<ResetPasswordOTP />} />
            <Route path="/intro" element={<IntroPage />} />
            <Route path="/tutorial" element={<TutorialPage />} />
            
            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/classes" element={<Classes />} />
              <Route path="/class/:id" element={<ClassDetails />} />
              <Route path="/students" element={<Students />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/classroom-attendance/:id" element={<ClassroomAttendance />} />
              <Route path="/assignments" element={<Assignments />} />
              <Route path="/grades" element={<Grades />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/wallet-verify" element={<WalletVerify />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/behavior" element={<Behavior />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/classroom-invite/:id" element={<ClassroomInvite />} />
              <Route path="/classroom-seating/:id" element={<ClassroomSeating />} />
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              <Route path="/view-teacher-dashboard" element={<ViewTeacherDashboard />} />
              
              {/* Admin Routes */}
              <Route path="/admin-portal" element={<AdminPortal />} />
              <Route path="/admin/analytics" element={<AdminPortal />} />
              <Route path="/admin/teachers" element={<AdminPortal />} />
              <Route path="/admin/students" element={<AdminPortal />} />
              <Route path="/admin/classes" element={<AdminPortal />} />
              <Route path="/admin/announcements" element={<AdminPortal />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
