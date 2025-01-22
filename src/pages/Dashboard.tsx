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
import { Plus, Users, Award, Wallet, Trophy } from "lucide-react";

type Classroom = Database['public']['Tables']['classrooms']['Row'];

const Dashboard = () => {
  const { toast } = useToast();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const { data, error } = await supabase
        .from('classrooms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setClassrooms(data || []);
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

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-[#1A1F2C] to-black text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold gradient-text">Blockward Dashboard</h1>
          <WalletPanel />
        </div>

        <Tabs defaultValue="classrooms" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 gap-4">
            <TabsTrigger value="classrooms" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Classrooms
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
                <h2 className="text-2xl font-semibold gradient-text">My Classrooms</h2>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" /> New Classroom
                </Button>
              </div>
              
              {loading ? (
                <p className="text-center">Loading classrooms...</p>
              ) : (
                <div className="grid gap-4">
                  {classrooms.length === 0 ? (
                    <p className="text-center text-gray-400">No classrooms found. Create your first classroom to get started!</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {classrooms.map((classroom) => (
                        <ClassroomGrid key={classroom.id} classroom={classroom} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
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
      </div>
    </div>
  );
};

export default Dashboard;