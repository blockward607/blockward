
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Award, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string;
  type: string;
  created_at: string;
}

const Achievements = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('points', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load achievements"
      });
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="p-4 flex items-center gap-3"
        >
          <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
          <span className="text-xl">Loading achievements...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-8"
    >
      <motion.div 
        variants={itemVariants}
        className="flex items-center gap-4"
      >
        <div className="p-4 rounded-full bg-purple-600/30 shadow-[0_0_15px_rgba(147,51,234,0.5)] animate-pulse">
          <Trophy className="w-8 h-8 text-purple-300" />
        </div>
        <h1 className="text-4xl font-bold shimmer-text">
          Achievements
        </h1>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {achievements.map((achievement) => (
          <motion.div
            key={achievement.id}
            variants={itemVariants}
            whileHover={{ 
              scale: 1.03, 
              boxShadow: "0 10px 30px -15px rgba(155, 135, 245, 0.6)" 
            }}
            className="h-full"
          >
            <Card className="p-6 h-full glass-card border border-purple-500/30 shadow-[0_5px_15px_rgba(147,51,234,0.3)] transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-gradient-to-br from-purple-600/40 to-pink-600/40 backdrop-blur-sm">
                  <Award className="w-8 h-8 text-purple-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold gradient-text mb-1">{achievement.title}</h3>
                  <p className="text-gray-300 mb-3">{achievement.description}</p>
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-purple-500/20">
                    <span className="text-sm font-medium text-purple-400">
                      <Trophy className="w-4 h-4 inline mr-1" />
                      {achievement.type}
                    </span>
                    <span className="text-lg font-bold text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full">
                      {achievement.points} points
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Decorative elements */}
      <div className="hidden md:block">
        <div className="hexagon absolute top-40 right-40 w-32 h-32 bg-gradient-to-r from-purple-500/10 to-pink-500/10 -z-10"></div>
        <div className="hexagon absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-r from-blue-500/10 to-purple-500/10 -z-10"></div>
      </div>
    </motion.div>
  );
};

export default Achievements;
