
import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { MainLayout } from "@/components/layout/MainLayout";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Lazy-loaded components
const Home = lazy(() => import("@/pages/Home"));
const Auth = lazy(() => import("@/pages/Auth"));
const SignUp = lazy(() => import("@/pages/SignUp"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Classes = lazy(() => import("@/pages/Classes"));
const Students = lazy(() => import("@/pages/Students")); 
const Attendance = lazy(() => import("@/pages/Attendance"));
const Rewards = lazy(() => import("@/pages/Rewards"));
const Wallet = lazy(() => import("@/pages/Wallet"));
const Messages = lazy(() => import("@/pages/Messages"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const Settings = lazy(() => import("@/pages/Settings"));
const Progress = lazy(() => import("@/pages/Progress"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const ResetPasswordOTP = lazy(() => import("@/pages/ResetPasswordOTP"));
const ClassroomInvite = lazy(() => import("@/pages/ClassroomInvite"));
const ClassroomSeating = lazy(() => import("@/pages/ClassroomSeating"));
const ClassDetails = lazy(() => import("@/pages/ClassDetails"));
const Grades = lazy(() => import("@/pages/Grades"));
const WalletVerify = lazy(() => import("@/pages/WalletVerify"));

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="blockward-theme">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="auth" element={<Auth />} />
              <Route path="signup" element={<SignUp />} />
              <Route path="reset-password" element={<ResetPassword />} />
              <Route path="reset-password-otp" element={<ResetPasswordOTP />} />
              <Route path="invite/:inviteToken" element={<ClassroomInvite />} />
            </Route>

            {/* Class details route without sidebar */}
            <Route path="class/:classroomId" element={
              <ProtectedRoute>
                <ClassDetails />
              </ProtectedRoute>
            } />

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
              {/* Classroom specific routes */}
              <Route path="classroom/:classroomId/seating" element={<ClassroomSeating />} />
              <Route path="classroom/:classroomId/invite" element={<ClassroomInvite />} />
              <Route path="classroom/:classroomId/attendance" element={<Attendance />} />
              <Route path="achievements" element={<Navigate to="/wallet" replace />} />
              <Route path="rewards" element={<Rewards />} />
              <Route path="wallet" element={<Wallet />} />
              <Route path="messages" element={<Messages />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
              <Route path="progress" element={<Progress />} />
              <Route path="class/:classroomId/grades" element={<Grades />} />
              <Route path="auth/wallet-verify" element={<WalletVerify />} />
            </Route>
          </Routes>
        </Suspense>
        <Toaster position="top-right" />
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
