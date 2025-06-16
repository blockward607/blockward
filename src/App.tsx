
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import SignUp from "./pages/SignUp";
import ResetPassword from "./pages/ResetPassword";
import ResetPasswordOTP from "./pages/ResetPasswordOTP";
import Dashboard from "./pages/Dashboard";
import StudentDashboard from "./pages/StudentDashboard";
import Achievements from "./pages/Achievements";
import Progress from "./pages/Progress";
import Wallet from "./pages/Wallet";
import WalletVerify from "./pages/WalletVerify";
import Rewards from "./pages/Rewards";
import Classes from "./pages/Classes";
import ClassDetails from "./pages/ClassDetails";
import Students from "./pages/Students";
import Attendance from "./pages/Attendance";
import ClassroomAttendance from "./pages/ClassroomAttendance";
import Grades from "./pages/Grades";
import Assignments from "./pages/Assignments";
import Resources from "./pages/Resources";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import ClassroomInvite from "./pages/ClassroomInvite";
import ClassroomSeating from "./pages/ClassroomSeating";
import IntroPage from "./pages/IntroPage";
import TutorialPage from "./pages/TutorialPage";
import ViewTeacherDashboard from "./pages/ViewTeacherDashboard";
import SchoolAdmin from "./pages/SchoolAdmin";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/reset-password-otp" element={<ResetPasswordOTP />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/student-dashboard" element={<StudentDashboard />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/wallet-verify" element={<WalletVerify />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/classes" element={<Classes />} />
              <Route path="/classes/:id" element={<ClassDetails />} />
              <Route path="/students" element={<Students />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/attendance/:classroomId" element={<ClassroomAttendance />} />
              <Route path="/grades" element={<Grades />} />
              <Route path="/assignments" element={<Assignments />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/invite/:inviteCode" element={<ClassroomInvite />} />
              <Route path="/seating/:classroomId" element={<ClassroomSeating />} />
              <Route path="/intro" element={<IntroPage />} />
              <Route path="/tutorial" element={<TutorialPage />} />
              <Route path="/view-teacher-dashboard" element={<ViewTeacherDashboard />} />
              <Route path="/school-admin" element={<SchoolAdmin />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
