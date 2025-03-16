
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { motion } from "framer-motion";

export const SidebarLayout = () => {
  return (
    <SidebarProvider>
      <div className="h-screen flex w-full bg-gradient-to-b from-[#1A1F2C] to-black overflow-hidden">
        <AppSidebar />
        <SidebarInset className="ml-0 md:ml-64 transition-all duration-300 flex-1 flex flex-col overflow-hidden">
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
            className="w-full h-full p-8 overflow-y-auto"
          >
            <Outlet />
          </motion.div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default SidebarLayout;
