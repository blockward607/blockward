
import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface DashboardCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  linkPath: string;
  linkText: string;
  isDemo?: boolean;
}

export const DashboardCard = ({ 
  icon, 
  title, 
  description, 
  linkPath, 
  linkText, 
  isDemo = false 
}: DashboardCardProps) => {
  return (
    <Card className="p-6 glass-card hover:bg-purple-900/10 transition-all">
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-full bg-purple-600/20">
            {icon}
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-gray-400 mb-4">{description}</p>
        <Link to={isDemo ? "/auth" : linkPath} className="mt-auto text-purple-400 hover:text-purple-300">
          {isDemo ? "Sign up to access" : linkText} →
        </Link>
      </div>
    </Card>
  );
};
