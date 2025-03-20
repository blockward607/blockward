
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from "./components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/hooks/use-auth';
import { TutorialProvider } from '@/hooks/useTutorial';
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
        <Router>
          <TutorialProvider>
            {mounted && (
              <>
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
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/classroom-attendance/:id" element={
                    <ProtectedRoute>
                      <ClassroomAttendance />
                    </ProtectedRoute>
                  } />
                  <Route path="/classes" element={
                    <ProtectedRoute>
                      <Classes />
                    </ProtectedRoute>
                  } />
                  <Route path="/classes/:id" element={
                    <ProtectedRoute>
                      <ClassDetails />
                    </ProtectedRoute>
                  } />
                  <Route path="/students" element={
                    <ProtectedRoute>
                      <Students />
                    </ProtectedRoute>
                  } />
                  <Route path="/attendance" element={
                    <ProtectedRoute>
                      <Attendance />
                    </ProtectedRoute>
                  } />
                  <Route path="/classroom/seating" element={
                    <ProtectedRoute>
                      <ClassroomSeating />
                    </ProtectedRoute>
                  } />
                  <Route path="/classroom/seating/:id" element={
                    <ProtectedRoute>
                      <ClassroomSeating />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  <Route path="/messages" element={
                    <ProtectedRoute>
                      <Messages />
                    </ProtectedRoute>
                  } />
                  <Route path="/progress" element={
                    <ProtectedRoute>
                      <Progress />
                    </ProtectedRoute>
                  } />
                  <Route path="/wallet" element={
                    <ProtectedRoute>
                      <Wallet />
                    </ProtectedRoute>
                  } />
                  <Route path="/resources" element={
                    <ProtectedRoute>
                      <Resources />
                    </ProtectedRoute>
                  } />
                  <Route path="/tutorial" element={
                    <ProtectedRoute>
                      <TutorialPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/achievements" element={
                    <ProtectedRoute>
                      <Achievements />
                    </ProtectedRoute>
                  } />
                  <Route path="/rewards" element={
                    <ProtectedRoute>
                      <Rewards />
                    </ProtectedRoute>
                  } />
                  <Route path="/assignments" element={
                    <ProtectedRoute>
                      <Assignments />
                    </ProtectedRoute>
                  } />
                  <Route path="/grades" element={
                    <ProtectedRoute>
                      <Grades />
                    </ProtectedRoute>
                  } />
                  <Route path="/analytics" element={
                    <ProtectedRoute>
                      <Analytics />
                    </ProtectedRoute>
                  } />
                  <Route path="/notifications" element={
                    <ProtectedRoute>
                      <Notifications />
                    </ProtectedRoute>
                  } />
                </Routes>
                <Toaster />
              </>
            )}
          </TutorialProvider>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
