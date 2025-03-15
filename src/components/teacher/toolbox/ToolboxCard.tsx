
import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

interface ToolboxCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  action: ReactNode;
}

export const ToolboxCard = ({ icon, title, description, action }: ToolboxCardProps) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Card className="p-4 hover:bg-navy-700/30 transition-all border border-purple-500/20 backdrop-blur-sm bg-black/80">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-purple-600/20">
              {icon}
            </div>
            <h3 className="font-semibold text-white">{title}</h3>
          </div>
          <p className="text-sm text-gray-300 mb-4">{description}</p>
          <div className="mt-auto">
            {action}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
