
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { motion } from "framer-motion";

export const SidebarLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-b from-[#1A1F2C] to-black">
        <AppSidebar />
        <SidebarInset className="p-8 mt-4 transition-all duration-300 relative flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-start mb-4"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SidebarTrigger className="bg-purple-900/80 backdrop-blur-md p-3 rounded-lg border border-purple-500/50 shadow-lg hover:bg-purple-700 transition-all duration-300" />
            </motion.div>
          </motion.div>
          
          {/* Animated background elements */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(147,51,234,0.2),transparent_40%)]"></div>
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(192,38,211,0.2),transparent_40%)]"></div>
          </div>
          
          {/* Main content with page transition animation */}
          <motion.div
            key={window.location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ 
              duration: 0.3,
              ease: "easeInOut" 
            }}
            className="w-full"
          >
            <Outlet />
          </motion.div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default SidebarLayout;
