
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Grid, Calendar } from "lucide-react";

export const TeacherDashboard = () => {
  const navigate = useNavigate();

  const handleNavigateToAttendance = () => {
    console.log("Navigating to attendance page");
    navigate('/attendance');
  };

  const handleNavigateToSeating = () => {
    console.log("Navigating to seating page");
    navigate('/classroom/seating');
  };

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-6 gradient-text">Teacher Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance Card */}
        <Card 
          className="p-6 bg-gradient-to-br from-blue-900/30 to-black border-blue-500/30 hover:shadow-lg transition-all cursor-pointer" 
          onClick={handleNavigateToAttendance}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-blue-600/30 flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-blue-300" />
            </div>
            <h3 className="text-xl font-bold mb-2">Attendance</h3>
            <p className="text-gray-300 mb-4">Track and manage student attendance</p>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={(e) => {
                e.stopPropagation();
                handleNavigateToAttendance();
              }}
            >
              Take Attendance
            </Button>
          </div>
        </Card>

        {/* Seating Plan Card */}
        <Card 
          className="p-6 bg-gradient-to-br from-green-900/30 to-black border-green-500/30 hover:shadow-lg transition-all cursor-pointer" 
          onClick={handleNavigateToSeating}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-green-600/30 flex items-center justify-center mb-4">
              <Grid className="h-8 w-8 text-green-300" />
            </div>
            <h3 className="text-xl font-bold mb-2">Seating Plan</h3>
            <p className="text-gray-300 mb-4">Create and manage classroom seating arrangements</p>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={(e) => {
                e.stopPropagation();
                handleNavigateToSeating();
              }}
            >
              View Seating Plans
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
