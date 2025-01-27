import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Plus, Medal, GraduationCap, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Achievement } from "@/types/achievement";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

const defaultAchievements: Achievement[] = [
  {
    id: "1",
    title: "Perfect Attendance",
    description: "Attend class for 30 consecutive days",
    type: "attendance",
    points: 100,
    icon: "clock",
    criteria: "30 consecutive days of attendance",
    earnedCount: 0
  },
  {
    id: "2",
    title: "Academic Excellence",
    description: "Achieve an A grade in any subject",
    type: "academic",
    points: 150,
    icon: "graduation-cap",
    criteria: "Grade A in any subject",
    earnedCount: 0
  },
  {
    id: "3",
    title: "Behavior Champion",
    description: "Receive 5 positive behavior points",
    type: "behavior",
    points: 75,
    icon: "medal",
    criteria: "5 positive behavior records",
    earnedCount: 0
  }
];

export const AchievementSystem = () => {
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>(defaultAchievements);
  const [newAchievement, setNewAchievement] = useState<Partial<Achievement>>({
    type: "academic",
    points: 100
  });

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "clock":
        return Clock;
      case "graduation-cap":
        return GraduationCap;
      case "medal":
        return Medal;
      default:
        return Trophy;
    }
  };

  const handleCreateAchievement = async () => {
    if (!newAchievement.title || !newAchievement.description) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill in all required fields"
      });
      return;
    }

    const achievement: Achievement = {
      id: crypto.randomUUID(),
      title: newAchievement.title,
      description: newAchievement.description,
      type: newAchievement.type || "academic",
      points: newAchievement.points || 100,
      icon: "trophy",
      earnedCount: 0
    };

    setAchievements([...achievements, achievement]);
    setNewAchievement({
      type: "academic",
      points: 100
    });

    toast({
      title: "Success",
      description: "Achievement created successfully"
    });
  };

  return (
    <Card className="p-6 glass-card">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h2 className="text-2xl font-semibold gradient-text">Achievements</h2>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" /> Create Achievement
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Achievement</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Input
                  placeholder="Achievement title"
                  value={newAchievement.title || ""}
                  onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Textarea
                  placeholder="Description"
                  value={newAchievement.description || ""}
                  onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Input
                  type="number"
                  placeholder="Points"
                  value={newAchievement.points || ""}
                  onChange={(e) => setNewAchievement({ ...newAchievement, points: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <Button onClick={handleCreateAchievement} className="w-full bg-purple-600 hover:bg-purple-700">
              Create Achievement
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement, index) => {
          const IconComponent = getIconComponent(achievement.icon);
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-4 glass-card hover:bg-purple-900/10 transition-all">
                <div className="flex items-center gap-2 mb-4">
                  <IconComponent className="w-6 h-6 text-yellow-400" />
                  <div>
                    <h3 className="font-semibold">{achievement.title}</h3>
                    <p className="text-sm text-gray-400">{achievement.points} points</p>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-4">{achievement.description}</p>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm">{achievement.earnedCount} students earned</span>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
};