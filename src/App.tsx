
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import ResetPassword from '@/pages/ResetPassword';
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
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen antialiased App">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/classes" element={
            <ProtectedRoute>
              <Classes />
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
          <Route path="/behavior" element={
            <ProtectedRoute>
              <Behavior />
            </ProtectedRoute>
          } />
          <Route path="/assignments" element={
            <ProtectedRoute>
              <Assignments />
            </ProtectedRoute>
          } />
          <Route path="/rewards" element={
            <ProtectedRoute>
              <Rewards />
            </ProtectedRoute>
          } />
          <Route path="/achievements" element={
            <ProtectedRoute>
              <Achievements />
            </ProtectedRoute>
          } />
          <Route path="/wallet" element={
            <ProtectedRoute>
              <Wallet />
            </ProtectedRoute>
          } />
          <Route path="/messages" element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/resources" element={
            <ProtectedRoute>
              <Resources />
            </ProtectedRoute>
          } />
          <Route path="/progress" element={
            <ProtectedRoute>
              <Progress />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/view-student-dashboard" element={<StudentDashboard />} />
          <Route path="/view-teacher-dashboard" element={<ViewTeacherDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
