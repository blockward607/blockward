
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AdminAuth from "./pages/AdminAuth";
import Dashboard from "./pages/Dashboard";
import Classes from "./pages/Classes";
import Students from "./pages/Students";
import Settings from "./pages/Settings";
import Attendance from "./pages/Attendance";
import Behavior from "./pages/Behavior";
import Assignments from "./pages/Assignments";
import Resources from "./pages/Resources";
import Wallet from "./pages/Wallet";
import Grades from "./pages/Grades";
import Notifications from "./pages/Notifications";
import AdminPortal from "./pages/AdminPortal";
import ClassDetails from "./pages/ClassDetails";
import ClassroomInvite from "./pages/ClassroomInvite";
import ClassroomSeating from "./pages/ClassroomSeating";
import ClassroomAttendance from "./pages/ClassroomAttendance";
import StudentDashboard from "./pages/StudentDashboard";
import TutorialPage from "./pages/TutorialPage";
import IntroPage from "./pages/IntroPage";
import ResetPassword from "./pages/ResetPassword";
import ResetPasswordOTP from "./pages/ResetPasswordOTP";
import SchoolSetup from "./pages/SchoolSetup";
import AdminSetup from "./pages/AdminSetup";
import WalletVerify from "./pages/WalletVerify";
import ViewTeacherDashboard from "./pages/ViewTeacherDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin-auth" element={<AdminAuth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-password-otp" element={<ResetPasswordOTP />} />
          <Route path="/intro" element={<IntroPage />} />
          <Route path="/tutorial" element={<TutorialPage />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/student-dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
          <Route path="/classes" element={<ProtectedRoute><Classes /></ProtectedRoute>} />
          <Route path="/class/:id" element={<ProtectedRoute><ClassDetails /></ProtectedRoute>} />
          <Route path="/classroom/:id/invite" element={<ProtectedRoute><ClassroomInvite /></ProtectedRoute>} />
          <Route path="/classroom/:id/seating" element={<ProtectedRoute><ClassroomSeating /></ProtectedRoute>} />
          <Route path="/classroom/:id/attendance" element={<ProtectedRoute><ClassroomAttendance /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
          <Route path="/behavior" element={<ProtectedRoute><Behavior /></ProtectedRoute>} />
          <Route path="/assignments" element={<ProtectedRoute><Assignments /></ProtectedRoute>} />
          <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
          <Route path="/wallet/verify" element={<ProtectedRoute><WalletVerify /></ProtectedRoute>} />
          <Route path="/grades" element={<ProtectedRoute><Grades /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/admin-portal" element={<ProtectedRoute><AdminPortal /></ProtectedRoute>} />
          <Route path="/school-setup" element={<ProtectedRoute><SchoolSetup /></ProtectedRoute>} />
          <Route path="/admin-setup" element={<ProtectedRoute><AdminSetup /></ProtectedRoute>} />
          <Route path="/view-teacher-dashboard" element={<ProtectedRoute><ViewTeacherDashboard /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
