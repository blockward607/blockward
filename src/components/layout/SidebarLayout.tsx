
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";

export const SidebarLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-b from-[#1A1F2C] to-black">
        <AppSidebar />
        <SidebarInset className="p-8 mt-4">
          <div className="flex items-center justify-start mb-4">
            <SidebarTrigger />
          </div>
          <Outlet />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default SidebarLayout;
