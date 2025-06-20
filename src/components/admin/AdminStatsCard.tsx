
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface AdminStatsCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  stats: string | number;
  color: string;
  features: string[];
  onClick: () => void;
}

export const AdminStatsCard = ({
  title,
  description,
  icon: Icon,
  stats,
  color,
  features,
  onClick
}: AdminStatsCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card 
        className={`h-full bg-gradient-to-br from-slate-800/60 to-slate-900/80 border-slate-700/50 hover:border-purple-500/40 transition-all duration-300 shadow-lg cursor-pointer group backdrop-blur-sm`}
        onClick={onClick}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
        
        <CardContent className="p-6 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <motion.div 
              className={`p-3 rounded-xl bg-gradient-to-r ${color} shadow-lg group-hover:shadow-xl transition-all duration-300`}
              whileHover={{ rotate: 5, scale: 1.1 }}
            >
              <Icon className="w-6 h-6 text-white drop-shadow-sm" />
            </motion.div>
            <Badge variant="secondary" className="bg-slate-700/80 text-purple-200 border-slate-600">
              {stats}
            </Badge>
          </div>
          
          <h3 className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors mb-2">
            {title}
          </h3>
          
          <p className="text-slate-400 text-sm mb-4 group-hover:text-slate-300 transition-colors leading-relaxed">
            {description}
          </p>
          
          <div className="space-y-2">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-slate-500 group-hover:text-slate-400 transition-colors">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
                {feature}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
