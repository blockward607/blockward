import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { ClassroomGrid } from "@/components/classroom/ClassroomGrid";
import { WalletPanel } from "@/components/wallet/WalletPanel";
import { BehaviorTracker } from "@/components/behavior/BehaviorTracker";
import { AchievementSystem } from "@/components/achievements/AchievementSystem";
import { AttendanceTracker } from "@/components/attendance/AttendanceTracker";
import { Plus, Users, Award, Wallet, Trophy, ArrowLeft, ChevronDown, ChevronUp, Bell, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";

type Classroom = Database['public']['Tables']['classrooms']['Row'];
type Notification = Database['public']['Tables']['notifications']['Row'];

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        variant: "destructive",
        title: "Not authenticated",
        description: "Please log in to access the dashboard"
      });
      navigate('/auth');
      return;
    }

    // Get user role and name
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    setUserRole(roleData?.role || null);

    // Get user name based on role
    if (roleData?.role === 'student') {
      const { data: studentData } = await supabase
        .from('students')
        .select('name')
        .eq('user_id', session.user.id)
        .single();
      setUserName(studentData?.name);
    } else {
      const { data: teacherData } = await supabase
        .from('teacher_profiles')
        .select('full_name')
        .eq('user_id', session.user.id)
        .single();
      setUserName(teacherData?.full_name);
    }
  };

  if (!userRole || !userName) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="p-4">Loading...</div>
      </div>
    );
  }

  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null);
  const [newClassroom, setNewClassroom] = useState({
    name: "",
    description: "",
  });
  const [expandedSections, setExpandedSections] = useState({
    notifications: true,
    classrooms: true,
  });

  useEffect(() => {
    fetchClassrooms();
    fetchNotifications();
  }, [userRole]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load notifications"
      });
    }
  };

  const fetchClassrooms = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: teacherProfile, error: profileError } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      
      if (!teacherProfile) {
        toast({
          variant: "destructive",
          title: "Profile not found",
          description: "Teacher profile not found. Please contact support."
        });
        return;
      }

      const { data, error } = await supabase
        .from('classrooms')
        .select('*')
        .eq('teacher_id', teacherProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setClassrooms(data || []);
      if (data && data.length > 0) {
        setSelectedClassroom(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load classrooms"
      });
    } finally {
      setLoading(false);
    }
  };

  const createClassroom = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          variant: "destructive",
          title: "Not authenticated",
          description: "Please log in to create a classroom"
        });
        return;
      }

      const { data: teacherProfile, error: profileError } = await supabase
        .from('teacher_profiles')
        .select('id')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      
      if (!teacherProfile) {
        toast({
          variant: "destructive",
          title: "Profile not found",
          description: "Teacher profile not found. Please contact support."
        });
        return;
      }

      const { data, error } = await supabase
        .from('classrooms')
        .insert([{
          name: newClassroom.name,
          description: newClassroom.description,
          teacher_id: teacherProfile.id
        }])
        .select()
        .single();

      if (error) throw error;

      setClassrooms([data, ...classrooms]);
      setNewClassroom({ name: "", description: "" });
      toast({
        title: "Success",
        description: "Classroom created successfully"
      });
    } catch (error) {
      console.error('Error creating classroom:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create classroom"
      });
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-[#1A1F2C] to-black text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/')}
              className="hover:bg-purple-900/20"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-4xl font-bold gradient-text">Blockward Dashboard</h1>
          </div>
          <WalletPanel />
        </div>

        {/* Notifications Section */}
        <Card className="p-6 glass-card">
          <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => toggleSection('notifications')}>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-semibold">Recent Notifications</h2>
            </div>
            {expandedSections.notifications ? <ChevronUp /> : <ChevronDown />}
          </div>
          
          {expandedSections.notifications && (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <Card key={notification.id} className="p-4 bg-purple-900/10 border-purple-500/20">
                  <h3 className="font-semibold text-purple-300">{notification.title}</h3>
                  <p className="text-sm text-gray-300">{notification.message}</p>
                  <span className="text-xs text-gray-400">
                    {new Date(notification.created_at!).toLocaleDateString()}
                  </span>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {userRole === 'teacher' ? (
          <Tabs defaultValue="classrooms" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5 gap-4">
              <TabsTrigger value="classrooms" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Classrooms
              </TabsTrigger>
              <TabsTrigger value="attendance" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Attendance
              </TabsTrigger>
              <TabsTrigger value="behavior" className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Behavior
              </TabsTrigger>
              <TabsTrigger value="achievements" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Achievements
              </TabsTrigger>
              <TabsTrigger value="wallet" className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                NFT Wallet
              </TabsTrigger>
            </TabsList>

            <TabsContent value="classrooms">
              <Card className="p-6 glass-card">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleSection('classrooms')}>
                    <h2 className="text-2xl font-semibold gradient-text">My Classrooms</h2>
                    {expandedSections.classrooms ? <ChevronUp /> : <ChevronDown />}
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-purple-600 hover:bg-purple-700">
                        <Plus className="w-4 h-4 mr-2" /> New Classroom
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Create New Classroom</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <Input
                          placeholder="Classroom name"
                          value={newClassroom.name}
                          onChange={(e) => setNewClassroom({ ...newClassroom, name: e.target.value })}
                        />
                        <Textarea
                          placeholder="Description"
                          value={newClassroom.description}
                          onChange={(e) => setNewClassroom({ ...newClassroom, description: e.target.value })}
                        />
                      </div>
                      <Button onClick={createClassroom} className="w-full bg-purple-600 hover:bg-purple-700">
                        Create Classroom
                      </Button>
                    </DialogContent>
                  </Dialog>
                </div>
                
                {expandedSections.classrooms && (
                  <div className="grid gap-6">
                    {loading ? (
                      <p className="text-center">Loading classrooms...</p>
                    ) : classrooms.length === 0 ? (
                      <p className="text-center text-gray-400">No classrooms found. Create your first classroom to get started!</p>
                    ) : (
                      <div className="grid grid-cols-1 gap-6">
                        {classrooms.map((classroom) => (
                          <ClassroomGrid key={classroom.id} classroom={classroom} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="attendance">
              {selectedClassroom ? (
                <AttendanceTracker classroomId={selectedClassroom} />
              ) : (
                <Card className="p-6">
                  <p className="text-center text-gray-400">Please select or create a classroom first</p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="behavior">
              <BehaviorTracker />
            </TabsContent>

            <TabsContent value="achievements">
              <AchievementSystem />
            </TabsContent>

            <TabsContent value="wallet">
              <Card className="p-6 glass-card">
                <WalletPanel expanded={true} />
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          // Student view
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6 glass-card">
              <h2 className="text-xl font-semibold mb-4">My NFT Collection</h2>
              <Link to="/rewards" className="text-purple-400 hover:text-purple-300">
                View my NFTs →
              </Link>
            </Card>
            <Card className="p-6 glass-card">
              <h2 className="text-xl font-semibold mb-4">My Classes</h2>
              <Link to="/classes" className="text-purple-400 hover:text-purple-300">
                View my classes →
              </Link>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
