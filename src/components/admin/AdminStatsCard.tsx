
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

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
    <Card 
      className={`h-full bg-gradient-to-br ${color}/10 border-slate-700 hover:border-slate-500 transition-all duration-300 shadow-lg cursor-pointer group`}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg bg-gradient-to-r ${color}/20 border border-slate-600`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <Badge variant="secondary" className="bg-slate-700 text-white">
            {stats}
          </Badge>
        </div>
        
        <h3 className="text-xl font-bold text-white group-hover:text-slate-200 transition-colors mb-2">
          {title}
        </h3>
        
        <p className="text-slate-400 text-sm mb-4 group-hover:text-slate-300 transition-colors">
          {description}
        </p>
        
        <div className="space-y-1">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-1 h-1 bg-slate-400 rounded-full" />
              {feature}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
