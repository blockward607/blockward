
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Database, Lock } from "lucide-react";
import { motion } from "framer-motion";

export const AdminSystemStatus = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="mt-12"
    >
      <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="text-slate-300 font-medium">System Status: Online</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span className="text-slate-400">Last Updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="border-blue-500 text-blue-400 bg-blue-500/10">
                <Database className="w-3 h-3 mr-1" />
                Database: Healthy
              </Badge>
              <Badge variant="outline" className="border-green-500 text-green-400 bg-green-500/10">
                <Lock className="w-3 h-3 mr-1" />
                Security: Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
