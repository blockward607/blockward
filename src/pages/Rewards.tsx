
import { useEffect, useState } from "react";
import { BlockWardShowcase } from "@/components/NFTShowcase";
import { CreateNFTAward } from "@/components/nft/CreateNFTAward";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Star, ImagePlus, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

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
      <div className="flex items-center justify-center h-[80vh]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="p-4 flex items-center gap-3"
        >
          <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
          <span className="text-xl">Loading rewards...</span>
        </motion.div>
      </div>
    );
  }

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-8"
    >
      <motion.div 
        variants={itemVariants}
        className="flex items-center gap-4 mb-8"
      >
        <div className="p-4 rounded-full bg-purple-600/30 shadow-[0_0_15px_rgba(147,51,234,0.5)] animate-pulse">
          <Trophy className="w-8 h-8 text-purple-300" />
        </div>
        <h1 className="text-4xl font-bold shimmer-text">
          {userRole === 'teacher' ? 'Rewards & BlockWards' : 'My BlockWard Collection'}
        </h1>
      </motion.div>

      {userRole === 'teacher' ? (
        <Tabs defaultValue="showcase" className="space-y-6">
          <motion.div variants={itemVariants}>
            <TabsList className="p-1 bg-black/40 backdrop-blur-xl border border-purple-500/20 rounded-xl">
              <TabsTrigger value="showcase" className="flex items-center gap-2 data-[state=active]:bg-purple-600/30 data-[state=active]:text-white">
                <Star className="w-4 h-4" />
                BlockWard Showcase
              </TabsTrigger>
              <TabsTrigger value="create" className="flex items-center gap-2 data-[state=active]:bg-purple-600/30 data-[state=active]:text-white">
                <ImagePlus className="w-4 h-4" />
                Create Award
              </TabsTrigger>
            </TabsList>
          </motion.div>

          <TabsContent value="showcase">
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <Card className="p-6 glass-card border border-purple-500/30 shadow-[0_5px_25px_rgba(147,51,234,0.3)]">
                <BlockWardShowcase />
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="create">
            <motion.div variants={itemVariants}>
              <CreateNFTAward />
            </motion.div>
          </TabsContent>
        </Tabs>
      ) : (
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
        >
          <Card className="p-6 glass-card border border-purple-500/30 shadow-[0_5px_25px_rgba(147,51,234,0.3)]">
            <BlockWardShowcase />
          </Card>
        </motion.div>
      )}
      
      {/* Decorative elements */}
      <div className="hidden md:block">
        <div className="hexagon absolute top-20 right-20 w-28 h-28 bg-gradient-to-r from-purple-500/10 to-pink-500/10 -z-10"></div>
        <div className="hexagon absolute bottom-20 left-40 w-36 h-36 bg-gradient-to-r from-blue-500/10 to-purple-500/10 -z-10"></div>
      </div>
    </motion.div>
  );
};

export default Rewards;
