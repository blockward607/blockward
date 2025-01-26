import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import Rewards from "@/pages/Rewards";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/achievements" element={<Dashboard />} />
          <Route path="/students" element={<Dashboard />} />
          <Route path="/classes" element={<Dashboard />} />
          <Route path="/behavior" element={<Dashboard />} />
          <Route path="/attendance" element={<Dashboard />} />
          <Route path="/notifications" element={<Dashboard />} />
          <Route path="/settings" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;