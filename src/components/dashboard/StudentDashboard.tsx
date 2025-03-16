
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Award, Book, ChartBar, Grid, Mail, User } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const StudentDashboard = () => {
  const [studentEmail, setStudentEmail] = useState<string | null>(null);
  const [studentPoints, setStudentPoints] = useState<number>(0);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentInfo();
  }, []);

  const fetchStudentInfo = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Get student email
      setStudentEmail(session.user.email);

      // Get student points
      const { data: studentData, error } = await supabase
        .from('students')
        .select('points')
        .eq('user_id', session.user.id)
        .single();

      if (error) throw error;
      setStudentPoints(studentData?.points || 0);
    } catch (error) {
      console.error('Error fetching student info:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load student information"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Student Info */}
      <Card className="p-6 glass-card hover:bg-purple-900/10 transition-all">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="p-3 rounded-full bg-purple-600/20">
              <User className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">My Profile</h3>
              <p className="text-sm text-gray-400">{studentEmail || 'Loading...'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-2xl text-purple-400">{studentPoints}</span>
            <span className="text-gray-400">points</span>
          </div>
        </div>
      </Card>

      {/* Dashboard Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 glass-card hover:bg-purple-900/10 transition-all">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-purple-600/20">
                <Book className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold">My Classes</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">View your enrolled classes and assignments</p>
            <Link to="/classes" className="mt-auto text-purple-400 hover:text-purple-300">
              View classes →
            </Link>
          </div>
        </Card>

        <Card className="p-6 glass-card hover:bg-purple-900/10 transition-all">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-purple-600/20">
                <ChartBar className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold">Behavior Points</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">Track your behavior points and achievements</p>
            <Link to="/behavior" className="mt-auto text-purple-400 hover:text-purple-300">
              View points →
            </Link>
          </div>
        </Card>

        <Card className="p-6 glass-card hover:bg-purple-900/10 transition-all">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-purple-600/20">
                <Award className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold">Achievements</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">View your earned achievements and badges</p>
            <Link to="/achievements" className="mt-auto text-purple-400 hover:text-purple-300">
              View achievements →
            </Link>
          </div>
        </Card>

        <Card className="p-6 glass-card hover:bg-purple-900/10 transition-all">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-purple-600/20">
                <Grid className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold">Seating Plans</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">View your class seating arrangements</p>
            <Link to="/seating" className="mt-auto text-purple-400 hover:text-purple-300">
              View seating →
            </Link>
          </div>
        </Card>
      </div>

      {/* NFTs and Wallet */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6 glass-card hover:bg-purple-900/10 transition-all">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-purple-600/20">
                <Award className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold">My NFTs</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">View your collected achievement NFTs</p>
            <Link to="/wallet" className="mt-auto text-purple-400 hover:text-purple-300">
              View wallet →
            </Link>
          </div>
        </Card>

        <Card className="p-6 glass-card hover:bg-purple-900/10 transition-all">
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-purple-600/20">
                <Mail className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold">Messages</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">Check messages from your teachers</p>
            <Link to="/messages" className="mt-auto text-purple-400 hover:text-purple-300">
              View messages →
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
