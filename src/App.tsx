import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<MainLayout><Index /></MainLayout>} />
          <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;