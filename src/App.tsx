
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MainLayout } from "@/components/layout/MainLayout";
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
import SchoolSetup from "./pages/SchoolSetup";
import Behavior from "./pages/Behavior";
import AdminDashboard from "./pages/AdminDashboard";
import CreateNFT from "./pages/CreateNFT";

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
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
                <Route path="school-setup" element={<ProtectedRoute><SchoolSetup /></ProtectedRoute>} />
                
                {/* Admin Dashboard Route */}
                <Route path="admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
                
                {/* Protected Routes for all authenticated users */}
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
                <Route path="behavior" element={<ProtectedRoute><Behavior /></ProtectedRoute>} />
                <Route path="create-nft" element={<ProtectedRoute><CreateNFT /></ProtectedRoute>} />
                
                {/* Class-specific routes */}
                <Route path="class/:id" element={<ProtectedRoute><ClassDetails /></ProtectedRoute>} />
                <Route path="class/:id/attendance" element={<ProtectedRoute><ClassroomAttendance /></ProtectedRoute>} />
                <Route path="class/:id/seating" element={<ProtectedRoute><ClassroomSeating /></ProtectedRoute>} />
                <Route path="classroom/:id/invite" element={<ProtectedRoute><ClassroomInvite /></ProtectedRoute>} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
