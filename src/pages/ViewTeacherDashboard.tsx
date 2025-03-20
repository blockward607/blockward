
import React, { useEffect } from 'react';
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";
import { useToast } from '@/hooks/use-toast';

const ViewTeacherDashboard = () => {
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Demo Mode",
      description: "You're viewing the teacher dashboard in demo mode"
    });
  }, [toast]);

  return (
    <div className="h-full w-full flex flex-col">
      <DashboardHeader userName="Demo Teacher" />
      
      <div className="flex-1 overflow-y-auto w-full p-6">
        <TeacherDashboard />
      </div>
    </div>
  );
};

export default ViewTeacherDashboard;
