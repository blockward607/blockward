
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Activity, LogOut } from "lucide-react";
import { motion } from "framer-motion";

interface AdminHeaderProps {
  onLogout: () => void;
}

export const AdminHeader = ({ onLogout }: AdminHeaderProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mb-8"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-transparent">
            BlockWard Admin Control Center
          </h1>
          <p className="text-slate-400 mt-1">Comprehensive platform administration and management</p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Badge variant="outline" className="border-green-500 text-green-400 bg-green-500/10">
          <Activity className="w-4 h-4 mr-1" />
          System Healthy
        </Badge>
        <Button 
          variant="outline" 
          onClick={onLogout}
          className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500 transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </motion.div>
  );
};
