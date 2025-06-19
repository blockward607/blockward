
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

interface AdminButton {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  permissions: any[];
  is_active: boolean;
  sort_order: number;
}

const iconMap: { [key: string]: any } = {
  Users,
  UserPlus,
  BookOpen,
  School,
  BarChart3,
  Shield,
  Settings,
  Building,
  Plus,
  Eye
};

export const AdminControlPanel = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    pendingRequests: 0
  });
  const [adminButtons, setAdminButtons] = useState<AdminButton[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Load admin buttons and stats in parallel
      const [buttonsResult, statsResult] = await Promise.all([
        loadAdminButtons(),
        loadAdminStats()
      ]);

    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load admin data"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAdminButtons = async () => {
    try {
      const { data: buttons, error } = await supabase
        .from('admin_buttons')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error loading admin buttons:', error);
        return;
      }

      setAdminButtons(buttons || []);
    } catch (error) {
      console.error('Error loading admin buttons:', error);
    }
  };

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
    }
  };

  const handleActionClick = async (button: AdminButton) => {
    console.log(`🔥 Admin button clicked: ${button.title} -> ${button.route}`);
    
    if (actionLoading) {
      console.log('⚠️ Action already in progress, ignoring click');
      return;
    }

    try {
      setActionLoading(button.title);
      
      // Direct navigation to the route stored in database
      let targetRoute = button.route;
      
      // Handle special cases for routes that don't exist yet
      switch (button.route) {
        case "/admin/teachers":
          targetRoute = "/admin";
          toast({
            title: "Teacher Management",
            description: "Opening teacher management in admin dashboard."
          });
          break;
        case "/admin/analytics":
          targetRoute = "/dashboard";
          toast({
            title: "Coming Soon",
            description: "Analytics page is coming soon. Redirecting to dashboard."
          });
          break;
        case "/admin/requests":
          targetRoute = "/admin";
          toast({
            title: "Admin Requests",
            description: "Opening admin dashboard to manage requests."
          });
          break;
        default:
          // Use the route as-is for existing pages
          break;
      }
      
      console.log(`✅ Navigating to: ${targetRoute}`);
      navigate(targetRoute);
      
      // Show navigation toast for most actions
      if (!["Teacher Management", "Coming Soon", "Admin Requests"].some(msg => 
        button.title.includes("Teacher") || button.title.includes("Analytics") || button.title.includes("Requests")
      )) {
        toast({
          title: "Navigation",
          description: `Opening ${button.title}...`
        });
      }
      
    } catch (error) {
      console.error('❌ Navigation error:', error);
      toast({
        variant: "destructive",
        title: "Navigation Error",
        description: `Failed to open ${button.title}. Please try again.`
      });
    } finally {
      setTimeout(() => setActionLoading(null), 500);
    }
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
          type="button"
          onClick={() => navigate('/admin')}
          disabled={actionLoading !== null}
          className="bg-purple-600 hover:bg-purple-700 cursor-pointer"
        >
          <Eye className="w-4 h-4 mr-2" />
          Full Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminButtons.map((button) => {
          const IconComponent = iconMap[button.icon] || Settings;
          const isLoading = actionLoading === button.title;
          
          // Get count based on button title
          let count: number | undefined;
          let isUrgent = false;
          
          switch (button.title) {
            case 'Manage Students':
              count = stats.totalStudents;
              break;
            case 'Manage Teachers':
              count = stats.totalTeachers;
              break;
            case 'Classroom Management':
              count = stats.totalClasses;
              break;
            case 'Admin Requests':
              count = stats.pendingRequests;
              isUrgent = stats.pendingRequests > 0;
              break;
          }
          
          return (
            <Card 
              key={button.id}
              className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 cursor-pointer"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${button.color}`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  {count !== undefined && (
                    <Badge 
                      variant={isUrgent ? "destructive" : "secondary"}
                      className={isUrgent ? "animate-pulse" : ""}
                    >
                      {count}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-white text-lg">
                  {button.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm mb-4">{button.description}</p>
                <Button 
                  type="button"
                  disabled={isLoading}
                  className="w-full bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 cursor-pointer"
                  onClick={() => handleActionClick(button)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isLoading ? 'Loading...' : `Access ${button.title}`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
