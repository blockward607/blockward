
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const demoFeatures = [
  {
    id: "classroom",
    title: "Create Virtual Classrooms",
    description: "Easily set up and manage digital learning spaces for your students"
  },
  {
    id: "attendance",
    title: "Track Attendance",
    description: "Monitor student attendance and participation with blockchain verification"
  },
  {
    id: "rewards",
    title: "Issue NFT Rewards",
    description: "Recognize achievements with digital collectibles that students can keep forever"
  },
  {
    id: "resources",
    title: "Share Resources",
    description: "Distribute learning materials securely to your students"
  }
];

interface DemoStepProps {
  title: string;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

const DemoStep = ({ title, isActive, isCompleted, onClick }: DemoStepProps) => {
  return (
    <div 
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all",
        isActive ? "bg-purple-500/20 border border-purple-500/50" : "hover:bg-gray-800/50",
        isCompleted && "border-green-500/50"
      )}
      onClick={onClick}
    >
      <div className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center",
        isCompleted ? "bg-green-500" : isActive ? "bg-purple-500" : "bg-gray-700"
      )}>
        {isCompleted ? (
          <Check className="w-4 h-4 text-white" />
        ) : (
          <span className="text-xs text-white font-medium">
            {isCompleted ? "✓" : ""}
          </span>
        )}
      </div>
      <span className={cn(
        "font-medium",
        isActive ? "text-purple-400" : isCompleted ? "text-green-400" : "text-gray-400"
      )}>
        {title}
      </span>
    </div>
  );
};

export const DemoSection = () => {
  const [activeFeature, setActiveFeature] = useState("classroom");
  const [completedFeatures, setCompletedFeatures] = useState<string[]>([]);

  const handleFeatureClick = (id: string) => {
    setActiveFeature(id);
    if (!completedFeatures.includes(id)) {
      setCompletedFeatures([...completedFeatures, id]);
    }
  };
  
  const getFeatureContent = (id: string) => {
    switch (id) {
      case "classroom":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-purple-400">Create a New Classroom</h3>
            <div className="bg-gray-900 p-4 rounded-lg space-y-3">
              <div className="space-y-1">
                <p className="text-xs text-gray-400">Classroom Name</p>
                <div className="h-10 bg-gray-800 rounded-md px-3 flex items-center text-sm">
                  Math 101: Algebra Fundamentals
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-400">Description</p>
                <div className="h-20 bg-gray-800 rounded-md px-3 py-2 text-sm">
                  A comprehensive introduction to algebra concepts for high school students.
                </div>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" /> Create Classroom
              </Button>
            </div>
          </div>
        );
      case "attendance":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-purple-400">Record Attendance</h3>
            <div className="bg-gray-900 p-4 rounded-lg space-y-3">
              <div className="divide-y divide-gray-800">
                {["John Smith", "Sarah Johnson", "Miguel Hernandez"].map((name, i) => (
                  <div key={i} className="py-2 flex items-center justify-between">
                    <span>{name}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-7 bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:text-green-300">
                        <Check className="w-3 h-3 mr-1" /> Present
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 hover:text-gray-300">
                        Late
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300">
                        <X className="w-3 h-3 mr-1" /> Absent
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Save Attendance Record
              </Button>
            </div>
          </div>
        );
      case "rewards":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-purple-400">Create NFT Rewards</h3>
            <div className="bg-gray-900 p-4 rounded-lg space-y-3">
              <div className="aspect-square max-w-[180px] mx-auto bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">🏆</div>
                  <div className="text-sm font-bold">Top Performer</div>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-400">Award Title</p>
                <div className="h-10 bg-gray-800 rounded-md px-3 flex items-center text-sm">
                  Math Champion - April 2023
                </div>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Create NFT Award
              </Button>
            </div>
          </div>
        );
      case "resources":
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-purple-400">Share Resources</h3>
            <div className="bg-gray-900 p-4 rounded-lg space-y-3">
              <div className="space-y-1">
                <p className="text-xs text-gray-400">Resource Title</p>
                <div className="h-10 bg-gray-800 rounded-md px-3 flex items-center text-sm">
                  Chapter 3 - Quadratic Equations
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-400">Resource URL</p>
                <div className="h-10 bg-gray-800 rounded-md px-3 flex items-center text-sm">
                  https://example.com/resources/quadratic-equations.pdf
                </div>
              </div>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Upload Resource
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold gradient-text mb-4">See Blockward in Action</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Explore how Blockward can transform your classroom experience
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="p-6 col-span-1 glass-card">
            <h3 className="text-xl font-semibold mb-4">Try the Demo</h3>
            <p className="text-sm text-gray-400 mb-6">
              Click through each feature to see how Blockward works
            </p>
            
            <div className="space-y-2">
              {demoFeatures.map((feature) => (
                <DemoStep
                  key={feature.id}
                  title={feature.title}
                  isActive={activeFeature === feature.id}
                  isCompleted={completedFeatures.includes(feature.id)}
                  onClick={() => handleFeatureClick(feature.id)}
                />
              ))}
            </div>

            <div className="mt-8">
              <Button className="w-full">
                Try It For Real <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>

          <Card className="p-6 col-span-1 lg:col-span-2 glass-card">
            <div className="bg-black/40 rounded-lg p-6 h-full">
              {getFeatureContent(activeFeature)}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
