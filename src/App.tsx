
import { Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Toaster } from "@/components/ui/toaster";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import DashboardPage from "./pages/Dashboard";
import AuthPage from "./pages/Auth";
import WalletPage from "./pages/Wallet";
import AdminDashboard from "./pages/AdminDashboard";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import GuestRoute from "./components/auth/GuestRoute";

function App() {
  useAuthGuard(); // Initialize wallet generation

  return (
    <>
      <Routes>
        <Route path="/auth" element={
          <GuestRoute>
            <AuthPage />
          </GuestRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="wallet" element={<WalletPage />} />
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
