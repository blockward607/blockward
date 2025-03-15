
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, School, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface StudentCardProps {
  id: string;
  name: string;
  school?: string;
  points: number;
  onDelete: (id: string) => void;
}

export const StudentCard = ({ id, name, school, points, onDelete }: StudentCardProps) => {
  return (
    <motion.div
      whileHover={{ 
        scale: 1.03, 
        boxShadow: "0 10px 30px -15px rgba(155, 135, 245, 0.8)" 
      }}
      className="purple-glow"
    >
      <Card className="p-6 glass-card border border-purple-500/40 bg-black/80 h-full">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600/80 to-pink-600/70 flex items-center justify-center text-white text-lg font-bold shadow-[0_0_15px_rgba(147,51,234,0.6)]">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <p className="text-xl font-semibold text-white glow-text">{name}</p>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1">
                <School className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-300">
                  {school || "No school"}
                </span>
              </div>
              <div className="px-3 py-1 rounded-full bg-purple-900/40 text-purple-300 text-sm font-semibold border border-purple-500/40 shadow-[0_0_10px_rgba(147,51,234,0.4)]">
                {points} points
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-4 gap-2">
          <Button 
            variant="outline" 
            size="icon"
            className="bg-purple-900/30 border-purple-500/40 hover:bg-purple-800/40"
          >
            <Edit className="w-4 h-4 text-purple-300" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => onDelete(id)}
            className="bg-black/50 border-red-500/40 hover:bg-red-900/30"
          >
            <Trash2 className="w-4 h-4 text-red-300" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};
