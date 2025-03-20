import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/hooks/use-auth';
import { TutorialProvider } from '@/contexts/TutorialContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Index from './pages/Index';
import Home from './pages/Home';
import IntroPage from './pages/IntroPage';
import Auth from './pages/Auth';
import SignUp from './pages/SignUp';
import ResetPassword from './pages/ResetPassword';
import ResetPasswordOTP from './pages/ResetPasswordOTP';
import WalletVerify from './pages/WalletVerify';
import ClassroomInvite from './pages/ClassroomInvite';
import Dashboard from './pages/Dashboard';
import ClassroomAttendance from './pages/ClassroomAttendance';
import Classes from './pages/Classes';
import ClassDetails from './pages/ClassDetails';
import Students from './pages/Students';
import Attendance from './pages/Attendance';
import ClassroomSeating from './pages/ClassroomSeating';
import Settings from './pages/Settings';
import Messages from './pages/Messages';
import Progress from './pages/Progress';
import Wallet from './pages/Wallet';
import Resources from './pages/Resources';
import TutorialPage from './pages/TutorialPage';
import Achievements from './pages/Achievements';
import Rewards from './pages/Rewards';
import Assignments from './pages/Assignments';
import Grades from './pages/Grades';
import Analytics from './pages/Analytics';
import Notifications from './pages/Notifications';
import ViewStudentDashboard from './pages/ViewStudentDashboard';
import ViewTeacherDashboard from './pages/ViewTeacherDashboard';

function App() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <TutorialProvider>
          {mounted && (
            <>
              <Router>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/intro" element={<IntroPage />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/reset-password-otp" element={<ResetPasswordOTP />} />
                  <Route path="/wallet-verify" element={<WalletVerify />} />
                  <Route path="/classroom/:id/invite" element={<ClassroomInvite />} />
                  
                  {/* Demo Routes - Direct Access */}
                  <Route path="/view-student-dashboard" element={<ViewStudentDashboard />} />
                  <Route path="/view-teacher-dashboard" element={<ViewTeacherDashboard />} />
                  
                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/classroom-attendance/:id" element={<ClassroomAttendance />} />
                    <Route path="/classes" element={<Classes />} />
                    <Route path="/classes/:id" element={<ClassDetails />} />
                    <Route path="/students" element={<Students />} />
                    <Route path="/attendance" element={<Attendance />} />
                    <Route path="/classroom/seating" element={<ClassroomSeating />} />
                    <Route path="/classroom/seating/:id" element={<ClassroomSeating />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/progress" element={<Progress />} />
                    <Route path="/wallet" element={<Wallet />} />
                    <Route path="/resources" element={<Resources />} />
                    <Route path="/tutorial" element={<TutorialPage />} />
                    <Route path="/achievements" element={<Achievements />} />
                    <Route path="/rewards" element={<Rewards />} />
                    <Route path="/assignments" element={<Assignments />} />
                    <Route path="/grades" element={<Grades />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/notifications" element={<Notifications />} />
                  </Route>
                </Routes>
              </Router>
              <Toaster />
            </>
          )}
        </TutorialProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
