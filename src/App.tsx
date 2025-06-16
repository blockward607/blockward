
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
import AdminLayout from "@/components/admin/AdminLayout";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Classes from "./pages/Classes";
import Students from "./pages/Students";
import Settings from "./pages/Settings";
import Wallet from "./pages/Wallet";
import Attendance from "./pages/Attendance";
import ClassDetails from "./pages/ClassDetails";
import ClassroomAttendance from "./pages/ClassroomAttendance";
import ClassroomSeating from "./pages/ClassroomSeating";
import ClassroomInvite from "./pages/ClassroomInvite";
import SignUp from "./pages/SignUp";
import ResetPassword from "./pages/ResetPassword";
import ResetPasswordOTP from "./pages/ResetPasswordOTP";
import Assignments from "./pages/Assignments";
import Resources from "./pages/Resources";
import Grades from "./pages/Grades";
import Progress from "./pages/Progress";
import Notifications from "./pages/Notifications";
import StudentDashboard from "./pages/StudentDashboard";
import ViewTeacherDashboard from "./pages/ViewTeacherDashboard";
import IntroPage from "./pages/IntroPage";
import TutorialPage from "./pages/TutorialPage";
import WalletVerify from "./pages/WalletVerify";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Index />} />
            <Route path="home" element={<Home />} />
            <Route path="auth" element={<Auth />} />
            <Route path="signup" element={<SignUp />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="reset-password-otp" element={<ResetPasswordOTP />} />
            <Route path="intro" element={<IntroPage />} />
            <Route path="tutorial" element={<TutorialPage />} />
            <Route path="auth/wallet-verify" element={<WalletVerify />} />
            
            {/* Protected Student/Teacher Routes */}
            <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="classes" element={<ProtectedRoute><Classes /></ProtectedRoute>} />
            <Route path="students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
            <Route path="attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
            <Route path="assignments" element={<ProtectedRoute><Assignments /></ProtectedRoute>} />
            <Route path="resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
            <Route path="grades" element={<ProtectedRoute><Grades /></ProtectedRoute>} />
            <Route path="progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
            <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="student-dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
            <Route path="view-teacher-dashboard" element={<ProtectedRoute><ViewTeacherDashboard /></ProtectedRoute>} />
            
            {/* Class-specific routes */}
            <Route path="class/:id" element={<ProtectedRoute><ClassDetails /></ProtectedRoute>} />
            <Route path="class/:id/attendance" element={<ProtectedRoute><ClassroomAttendance /></ProtectedRoute>} />
            <Route path="class/:id/seating" element={<ProtectedRoute><ClassroomSeating /></ProtectedRoute>} />
            <Route path="classroom/:id/invite" element={<ProtectedRoute><ClassroomInvite /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="teachers" element={<div className="p-6 text-white">Admin Teachers Management - Coming Soon</div>} />
              <Route path="students" element={<div className="p-6 text-white">Admin Students Management - Coming Soon</div>} />
              <Route path="settings" element={<div className="p-6 text-white">Admin School Settings - Coming Soon</div>} />
              <Route path="announcements" element={<div className="p-6 text-white">Admin Announcements - Coming Soon</div>} />
              <Route path="analytics" element={<div className="p-6 text-white">Admin Analytics - Coming Soon</div>} />
              <Route path="rewards" element={<div className="p-6 text-white">Admin NFT Management - Coming Soon</div>} />
              <Route path="classes" element={<div className="p-6 text-white">Admin Classes Management - Coming Soon</div>} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
