
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from "react-router-dom";
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import Classes from '@/pages/Classes';
import Students from '@/pages/Students';
import Resources from '@/pages/Resources';
import Attendance from '@/pages/Attendance';
import Rewards from '@/pages/Rewards';
import Wallet from '@/pages/Wallet';
import Messages from '@/pages/Messages';
import Notifications from '@/pages/Notifications';
import Settings from '@/pages/Settings';
import Analytics from '@/pages/Analytics';
import ClassroomSeating from '@/pages/ClassroomSeating';
import Behavior from '@/pages/Behavior';
import Progress from '@/pages/Progress';
import Assignments from '@/pages/Assignments';
import Grades from "@/pages/Grades";
import { useAuth } from "@/hooks/use-auth";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/auth" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/classes" element={<ProtectedRoute><Classes /></ProtectedRoute>} />
        <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
        <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
        <Route path="/rewards" element={<ProtectedRoute><Rewards /></ProtectedRoute>} />
        <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/seating" element={<ProtectedRoute><ClassroomSeating /></ProtectedRoute>} />
        <Route path="/behavior" element={<ProtectedRoute><Behavior /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
        <Route path="/assignments" element={<ProtectedRoute><Assignments /></ProtectedRoute>} />
        <Route path="/grades" element={<ProtectedRoute><Grades /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
