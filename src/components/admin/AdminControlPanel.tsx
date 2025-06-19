
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  BookOpen, 
  School, 
  Settings, 
  BarChart3, 
  Shield,
  Building,
  UserPlus,
  Plus,
  Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AdminStats {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  pendingRequests: number;
}

export const AdminControlPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    pendingRequests: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get admin's school
      const { data: adminProfile } = await supabase
        .from('admin_profiles')
        .select('school_id')
        .eq('user_id', session.user.id)
        .single();

      if (!adminProfile) return;

      // Load stats
      const [studentsData, teachersData, classroomsData, requestsData] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact' }).eq('school_id', adminProfile.school_id),
        supabase.from('teacher_profiles').select('id', { count: 'exact' }).eq('school_id', adminProfile.school_id),
        supabase.from('classrooms').select('id', { count: 'exact' }).eq('school_id', adminProfile.school_id),
        supabase.from('admin_requests').select('id', { count: 'exact' }).eq('status', 'pending')
      ]);

      setStats({
        totalStudents: studentsData.count || 0,
        totalTeachers: teachersData.count || 0,
        totalClasses: classroomsData.count || 0,
        pendingRequests: requestsData.count || 0
      });

    } catch (error) {
      console.error('Error loading admin stats:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load admin statistics"
      });
    } finally {
      setLoading(false);
    }
  };

  const adminActions = [
    {
      title: "Manage Students",
      description: "View and manage all students",
      icon: Users,
      route: "/admin/students",
      color: "bg-blue-500",
      count: stats.totalStudents
    },
    {
      title: "Manage Teachers", 
      description: "View and manage teacher accounts",
      icon: UserPlus,
      route: "/admin/teachers",
      color: "bg-green-500",
      count: stats.totalTeachers
    },
    {
      title: "Classroom Management",
      description: "Oversee all classrooms",
      icon: BookOpen,
      route: "/admin/classes",
      color: "bg-purple-500",
      count: stats.totalClasses
    },
    {
      title: "School Settings",
      description: "Configure school preferences",
      icon: School,
      route: "/admin/school",
      color: "bg-orange-500"
    },
    {
      title: "System Analytics",
      description: "View detailed analytics",
      icon: BarChart3,
      route: "/admin/analytics",
      color: "bg-cyan-500"
    },
    {
      title: "Admin Requests",
      description: "Review pending requests",
      icon: Shield,
      route: "/admin/requests",
      color: "bg-red-500",
      count: stats.pendingRequests,
      urgent: stats.pendingRequests > 0
    }
  ];

  const handleActionClick = (route: string, title: string) => {
    console.log(`Admin action clicked: ${title} -> ${route}`);
    navigate(route);
    toast({
      title: "Navigation",
      description: `Opening ${title}...`
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-gray-800/50 border-gray-700 animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Admin Control Panel</h2>
        <Button 
          onClick={() => navigate('/admin')}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Eye className="w-4 h-4 mr-2" />
          Full Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card 
              key={action.title}
              className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 cursor-pointer"
              onClick={() => handleActionClick(action.route, action.title)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${action.color}`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  {action.count !== undefined && (
                    <Badge 
                      variant={action.urgent ? "destructive" : "secondary"}
                      className={action.urgent ? "animate-pulse" : ""}
                    >
                      {action.count}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-white text-lg">
                  {action.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm">{action.description}</p>
                <Button 
                  className="w-full mt-4 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleActionClick(action.route, action.title);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Access {action.title}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
