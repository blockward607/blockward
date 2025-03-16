
import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import { supabase } from './integrations/supabase/client';
import Home from '@/pages/Home';
import Classes from './pages/Classes';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/Auth';
import { Toaster } from "@/components/ui/toaster";
import { BlockwardIntro } from './components/intro/BlockwardIntro';
import TutorialPage from './pages/TutorialPage';
import ClassroomSeating from './pages/ClassroomSeating';
import ClassroomAttendance from './pages/ClassroomAttendance';
import ClassroomInvite from './pages/ClassroomInvite';

function App() {
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    // Check if the user has already seen the intro
    const hasSeenIntro = localStorage.getItem('hasSeenIntro');
    if (hasSeenIntro) {
      setShowIntro(false);
    }
  }, []);

  const handleIntroComplete = () => {
    // Set a flag in local storage so the intro is not shown again
    localStorage.setItem('hasSeenIntro', 'true');
    setShowIntro(false);
  };

  return (
    <>
      <Router>
        {showIntro ? (
          <BlockwardIntro onEnter={handleIntroComplete} />
        ) : (
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<Home />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tutorial/:role" element={<TutorialPage />} />
            <Route
              path="/classroom/:classroomId/seating"
              element={<ClassroomSeating />}
            />
            <Route
              path="/classroom/:classroomId/attendance"
              element={<ClassroomAttendance />}
            />
            <Route
              path="/classroom/:classroomId/invite"
              element={<ClassroomInvite />}
            />
          </Routes>
        )}
      </Router>
      <Toaster />
    </>
  );
}

export default App;
