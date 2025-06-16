
import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { MainLayout } from "@/components/layout/MainLayout";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AssistantBot } from "@/components/assistant/AssistantBot";
import TutorialPage from "./pages/TutorialPage";

// Import problematic components directly instead of lazy-loading
import Index from "@/pages/Index";
import ViewStudentDashboard from "@/pages/StudentDashboard";
import ViewTeacherDashboard from "@/pages/ViewTeacherDashboard";
import ClassroomInvite from "@/pages/ClassroomInvite";
import Auth from "@/pages/Auth";

// Lazy-loaded components
const Home = lazy(() => import("@/pages/Home"));
const SignUp = lazy(() => import("@/pages/SignUp"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Classes = lazy(() => import("@/pages/Classes"));
const Students = lazy(() => import("@/pages/Students")); 
const Attendance = lazy(() => import("@/pages/Attendance"));
const Rewards = lazy(() => import("@/pages/Rewards"));
const Wallet = lazy(() => import("@/pages/Wallet"));
const Settings = lazy(() => import("@/pages/Settings"));
const ProgressPage = lazy(() => import("@/pages/Progress"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const ResetPasswordOTP = lazy(() => import("@/pages/ResetPasswordOTP"));
const ClassroomSeating = lazy(() => import("@/pages/ClassroomSeating"));
const ClassDetails = lazy(() => import("@/pages/ClassDetails"));
const Grades = lazy(() => import("@/pages/Grades"));
const WalletVerify = lazy(() => import("@/pages/WalletVerify"));

// Error Boundary Component
const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="flex h-screen w-full items-center justify-center bg-gradient-to-b from-[#1A1F2C] to-black">
    <div className="flex flex-col items-center space-y-4 text-center">
      <h2 className="text-xl font-semibold text-red-400">Something went wrong</h2>
      <p className="text-gray-300 max-w-md">
        The page encountered an error. Please try refreshing or navigating to a different page.
      </p>
      <button 
        onClick={() => window.location.href = '/dashboard'}
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
      >
        Go to Dashboard
      </button>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="blockward-theme">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Index />} />
              <Route path="home" element={<Home />} />
              <Route path="auth" element={<Auth />} />
              <Route path="signup" element={<SignUp />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route path="reset-password-otp" element={<ResetPasswordOTP />} />
              <Route path="invite/:inviteToken" element={<ClassroomInvite />} />
              {/* View demo routes */}
              <Route path="view-student-dashboard" element={<ViewStudentDashboard />} />
              <Route path="view-teacher-dashboard" element={<ViewTeacherDashboard />} />
              {/* Updated join routes to properly capture and handle codes */}
              <Route path="join/:code" element={<Navigate to="/auth" replace state={{ joinCode: ':code' }} />} />
              <Route path="join" element={<Navigate to="/auth" replace />} />
            </Route>

            {/* Protected routes with sidebar */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <SidebarLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="classes" element={<Classes />} />
              <Route path="students" element={<Students />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="classroom/seating" element={<ClassroomSeating />} />
              <Route path="classroom/:classroomId/seating" element={<ClassroomSeating />} />
              <Route path="classroom/:classroomId/invite" element={<ClassroomInvite />} />
              <Route path="classroom/:classroomId/attendance" element={<Attendance />} />
              <Route path="achievements" element={<Navigate to="/wallet" replace />} />
              <Route path="rewards" element={<Rewards />} />
              <Route path="wallet" element={<Wallet />} />
              <Route path="settings" element={<Settings />} />
              <Route path="progress" element={<ProgressPage />} />
              <Route path="class/:classroomId" element={<ClassDetails />} />
              <Route path="class/:classroomId/grades" element={<Grades />} />
              <Route path="auth/wallet-verify" element={<WalletVerify />} />
              <Route path="/tutorial/:role" element={<TutorialPage />} />
            </Route>
            
            {/* Catch all route for better error handling */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
        <AssistantBot />
        <Toaster position="top-right" />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
