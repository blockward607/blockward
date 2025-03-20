
import React, { useEffect } from 'react';
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import StudentDashboard from "./StudentDashboard";
import { useToast } from '@/hooks/use-toast';

const ViewStudentDashboard = () => {
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Demo Mode",
      description: "You're viewing the student dashboard in demo mode"
    });
  }, [toast]);

  return (
    <div className="h-full w-full flex flex-col">
      <DashboardHeader userName="Demo Student" />
      
      <div className="flex-1 overflow-y-auto w-full p-6">
        <StudentDashboard />
      </div>
    </div>
  );
};

export default ViewStudentDashboard;
