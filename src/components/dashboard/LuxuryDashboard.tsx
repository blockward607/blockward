
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { 
  Award, Book, ChartBar, Grid, Mail, User, 
  Crown, Diamond, GraduationCap, Gem
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const LuxuryDashboard = () => {
  const [studentEmail, setStudentEmail] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string | null>(null);
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

      // Get student points and name
      const { data: studentData, error } = await supabase
        .from('students')
        .select('points, name')
        .eq('user_id', session.user.id)
        .single();

      if (error) throw error;
      setStudentPoints(studentData?.points || 0);
      setStudentName(studentData?.name || session.user.email?.split('@')[0] || 'Student');
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

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: (i: number) => ({ 
      y: 0, 
      opacity: 1,
      transition: { 
        delay: i * 0.1,
        duration: 0.5
      }
    }),
    hover: { 
      y: -5,
      boxShadow: "0 20px 25px -5px rgba(147, 51, 234, 0.3)",
      backgroundColor: "rgba(147, 51, 234, 0.1)"
    }
  };

  return (
    <div className="space-y-8">
      {/* Luxury Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-8 relative overflow-hidden bg-gradient-to-br from-purple-900/40 via-black/80 to-purple-800/30 backdrop-blur-lg border border-purple-500/30 shadow-[0_10px_30px_-5px_rgba(147,51,234,0.3)]">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full filter blur-[50px]"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/10 rounded-full filter blur-[40px]"></div>
            
            {/* Sparkle elements */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-purple-300 rounded-full"
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.9,
                  repeatDelay: Math.random() * 2,
                }}
              />
            ))}
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4 mb-6 md:mb-0">
              <div className="p-4 rounded-full bg-gradient-to-br from-purple-600/30 to-purple-900/40 border border-purple-500/30 shadow-lg">
                <Crown className="w-8 h-8 text-amber-300" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-1 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-purple-500">
                  Welcome, {studentName}
                </h2>
                <p className="text-gray-400">{studentEmail || 'Loading...'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-black/30 px-6 py-3 rounded-full backdrop-blur-sm border border-purple-500/30">
              <Diamond className="w-5 h-5 text-amber-300" />
              <span className="font-bold text-3xl bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-amber-500">{studentPoints}</span>
              <span className="text-gray-400 font-medium">premium points</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Main Dashboard Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {[
            {
              icon: <GraduationCap className="w-6 h-6 text-purple-400" />,
              title: "Elite Classes",
              description: "Access your exclusive enrolled classes and premium assignments",
              link: "/classes",
              linkText: "View classes"
            },
            {
              icon: <ChartBar className="w-6 h-6 text-purple-400" />,
              title: "Performance Metrics",
              description: "Track your exceptional behavior points and achievements",
              link: "/behavior",
              linkText: "View metrics"
            },
            {
              icon: <Crown className="w-6 h-6 text-amber-400" />,
              title: "Prestige Rewards",
              description: "Browse your earned prestigious achievements and accolades",
              link: "/wallet",
              linkText: "View rewards"
            },
            {
              icon: <Grid className="w-6 h-6 text-purple-400" />,
              title: "Premium Seating",
              description: "Access your VIP class seating arrangements",
              link: "/seating",
              linkText: "View seating"
            },
            {
              icon: <Diamond className="w-6 h-6 text-amber-400" />,
              title: "Digital Assets",
              description: "Manage your valuable NFT collection and achievements",
              link: "/wallet",
              linkText: "View assets"
            },
            {
              icon: <Mail className="w-6 h-6 text-purple-400" />,
              title: "Exclusive Messaging",
              description: "Private communications with your instructors",
              link: "/messages",
              linkText: "View messages"
            }
          ].map((card, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              className="h-full"
            >
              <Card className="p-6 h-full flex flex-col bg-black/60 backdrop-blur-lg border border-purple-500/20 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-full bg-gradient-to-br from-purple-900/40 to-purple-700/20 border border-purple-500/30">
                    {card.icon}
                  </div>
                  <h3 className="text-lg font-semibold">{card.title}</h3>
                </div>
                <p className="text-sm text-gray-400 mb-4">{card.description}</p>
                <Link to={card.link} className="mt-auto text-purple-400 hover:text-purple-300 flex items-center gap-1 group">
                  {card.linkText} 
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </Link>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Achievements Showcase */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Card className="p-6 bg-black/60 backdrop-blur-lg border border-purple-500/20">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-700/20 border border-amber-500/30">
              <Gem className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-xl font-semibold">Latest Achievements</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-amber-500/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-black/40 border border-purple-500/30 rounded-lg p-4 h-32 flex flex-col items-center justify-center text-center transition-all duration-300 group-hover:border-amber-500/50">
                  <Award className="w-8 h-8 text-amber-400 mb-2" />
                  <p className="text-sm font-medium">Premium Achievement {i+1}</p>
                  <p className="text-xs text-gray-500 mt-1">Unlocked recently</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-right">
            <Link to="/achievements" className="text-purple-400 hover:text-purple-300 text-sm">
              View all achievements →
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
