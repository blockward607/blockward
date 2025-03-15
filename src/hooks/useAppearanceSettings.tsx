
import { useState, useEffect } from "react";

export const useAppearanceSettings = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [compactView, setCompactView] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
      document.documentElement.classList.toggle('dark', savedDarkMode === 'true');
    }
    
    const savedCompactView = localStorage.getItem('compactView');
    if (savedCompactView !== null) {
      setCompactView(savedCompactView === 'true');
    }
  }, []);

  const handleToggleDarkMode = (enabled: boolean) => {
    setDarkMode(enabled);
    localStorage.setItem('darkMode', String(enabled));
    document.documentElement.classList.toggle('dark', enabled);
    
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleToggleCompactView = (enabled: boolean) => {
    setCompactView(enabled);
    localStorage.setItem('compactView', String(enabled));
    
    document.body.classList.toggle('compact-view', enabled);
  };

  return {
    darkMode,
    compactView,
    handleToggleDarkMode,
    handleToggleCompactView
  };
};
