import { useEffect, useState } from "react";
import { BlockWardShowcase } from "@/components/NFTShowcase";
import { CreateNFTAward } from "@/components/nft/CreateNFTAward";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Star, ImagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Rewards = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        variant: "destructive",
        title: "Not authenticated",
        description: "Please log in to view rewards"
      });
      navigate('/auth');
      return;
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .single();

    setUserRole(roleData?.role || null);
  };

  if (!userRole) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="p-4">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 rounded-full bg-purple-600/20">
          <Trophy className="w-6 h-6 text-purple-400" />
        </div>
        <h1 className="text-3xl font-bold gradient-text">
          {userRole === 'teacher' ? 'Rewards & BlockWards' : 'My BlockWard Collection'}
        </h1>
      </div>

      {userRole === 'teacher' ? (
        <Tabs defaultValue="showcase" className="space-y-4">
          <TabsList>
            <TabsTrigger value="showcase" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              BlockWard Showcase
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <ImagePlus className="w-4 h-4" />
              Create Award
            </TabsTrigger>
          </TabsList>

          <TabsContent value="showcase">
            <Card className="p-6 glass-card">
              <BlockWardShowcase />
            </Card>
          </TabsContent>

          <TabsContent value="create">
            <CreateNFTAward />
          </TabsContent>
        </Tabs>
      ) : (
        <Card className="p-6 glass-card">
          <BlockWardShowcase />
        </Card>
      )}
    </div>
  );
};

export default Rewards;
