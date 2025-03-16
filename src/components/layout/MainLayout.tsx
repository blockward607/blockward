
import React from 'react';
import { NavBar } from "@/components/layout/NavBar";
import { TutorialManager } from "@/components/tutorial/TutorialManager";

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  
  return (
    <div className="min-h-screen bg-black">
      <NavBar />
      <main className="pt-16">
        {children}
      </main>
      <TutorialManager />
    </div>
  );
};
