
import { User, Users, Medal, Star, Loader2, Trophy, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Student } from "@/hooks/use-student-management";

export const getColorForPoints = (points: number) => {
  if (points >= 800) return "text-amber-400";
  if (points >= 600) return "text-purple-400";
  if (points >= 400) return "text-blue-400";
  if (points >= 200) return "text-green-400";
  return "text-gray-400";
};

export const getBadgeForPoints = (points: number) => {
  if (points >= 800) return <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30">Elite</Badge>;
  if (points >= 600) return <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30">Expert</Badge>;
  if (points >= 400) return <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30">Advanced</Badge>;
  if (points >= 200) return <Badge className="bg-green-500/20 text-green-300 border border-green-500/30">Novice</Badge>;
  return null;
};

export const getAvatarBorderColor = (points: number) => {
  if (points >= 800) return "border-amber-500";
  if (points >= 600) return "border-purple-500";
  if (points >= 400) return "border-blue-500";
  if (points >= 200) return "border-green-500";
  return "border-gray-600";
};

export const getDemoStudents = (): Student[] => {
  return [
    { id: "1", name: "Alex Johnson", user_id: "user1", points: 750, school: "Lincoln High", created_at: new Date().toISOString() },
    { id: "2", name: "Maria Garcia", user_id: "user2", points: 520, school: "Washington Academy", created_at: new Date().toISOString() },
    { id: "3", name: "James Wilson", user_id: "user3", points: 890, school: "Jefferson Middle School", created_at: new Date().toISOString() },
    { id: "4", name: "Sophia Chen", user_id: "user4", points: 430, school: "Franklin Elementary", created_at: new Date().toISOString() },
    { id: "5", name: "Ethan Williams", user_id: "user5", points: 670, school: "Roosevelt High", created_at: new Date().toISOString() },
  ];
};
