
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import ResetPassword from '@/pages/ResetPassword';
import ResetPasswordOTP from '@/pages/ResetPasswordOTP';
import SignUp from '@/pages/SignUp';
import Dashboard from '@/pages/Dashboard';
import Classes from '@/pages/Classes';
import Students from '@/pages/Students';
import Attendance from '@/pages/Attendance';
import Behavior from '@/pages/Behavior';
import Assignments from '@/pages/Assignments';
import Rewards from '@/pages/Rewards';
import Achievements from '@/pages/Achievements';
import Wallet from '@/pages/Wallet';
import Messages from '@/pages/Messages';
import Notifications from '@/pages/Notifications';
import Analytics from '@/pages/Analytics';
import Resources from '@/pages/Resources';
import Progress from '@/pages/Progress';
import Settings from '@/pages/Settings';
import StudentDashboard from '@/pages/StudentDashboard';
import ViewTeacherDashboard from '@/pages/ViewTeacherDashboard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen antialiased App">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/reset-password-otp" element={<ResetPasswordOTP />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/signup" element={<SignUp />} />
          
          {/* Protected routes with sidebar layout */}
          <Route element={<ProtectedRoute><SidebarLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/students" element={<Students />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/behavior" element={<Behavior />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          
          <Route path="/view-student-dashboard" element={<StudentDashboard />} />
          <Route path="/view-teacher-dashboard" element={<ViewTeacherDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
