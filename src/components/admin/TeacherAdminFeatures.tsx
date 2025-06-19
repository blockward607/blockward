
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, BarChart, Settings, FileText, Megaphone } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const TeacherAdminFeatures = () => {
  const navigate = useNavigate();

  const adminFeatures = [
    {
      title: "Manage Students",
      description: "Add, remove, and manage student accounts",
      icon: Users,
      action: () => {
        console.log("Navigating to /students");
        navigate('/students');
      },
      color: "bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20"
    },
    {
      title: "Class Management",
      description: "Create and manage your classes",
      icon: BookOpen,
      action: () => {
        console.log("Navigating to /classes");
        navigate('/classes');
      },
      color: "bg-green-500/10 border-green-500/20 hover:bg-green-500/20"
    },
    {
      title: "Analytics",
      description: "View student performance and class statistics",
      icon: BarChart,
      action: () => {
        console.log("Navigating to /dashboard");
        navigate('/dashboard');
      },
      color: "bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20"
    },
    {
      title: "Assignments",
      description: "Create and manage assignments",
      icon: FileText,
      action: () => {
        console.log("Navigating to /assignments");
        navigate('/assignments');
      },
      color: "bg-orange-500/10 border-orange-500/20 hover:bg-orange-500/20"
    },
    {
      title: "Announcements",
      description: "Send announcements to your classes",
      icon: Megaphone,
      action: () => {
        console.log("Navigating to /dashboard for announcements");
        navigate('/dashboard');
      },
      color: "bg-red-500/10 border-red-500/20 hover:bg-red-500/20"
    },
    {
      title: "Teacher Settings",
      description: "Configure your teaching preferences",
      icon: Settings,
      action: () => {
        console.log("Navigating to /settings");
        navigate('/settings');
      },
      color: "bg-gray-500/10 border-gray-500/20 hover:bg-gray-500/20"
    }
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Teacher Admin Features</h1>
        <p className="text-gray-400">Manage your classroom and students with these admin tools</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className={`p-6 ${feature.color} transition-all duration-200 cursor-pointer`}>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-3 rounded-full bg-black/20">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-300 text-sm mb-4">{feature.description}</p>
                </div>
                <Button 
                  onClick={feature.action}
                  className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20"
                >
                  Access
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
