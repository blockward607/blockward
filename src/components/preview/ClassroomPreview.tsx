
import React from 'react';
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";

export const ClassroomPreview = () => {
  // Example screenshots - in a real implementation these would be actual screenshots
  const screenshots = [
    {
      title: "Classroom Management",
      description: "Easily manage your virtual classrooms with intuitive tools",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
      alt: "Screenshot of classroom management interface"
    },
    {
      title: "Achievement System",
      description: "Track and reward student achievements with BlockWard tokens",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
      alt: "Screenshot of achievement system"
    },
    {
      title: "Student Progress",
      description: "Monitor student progress with detailed analytics",
      image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81",
      alt: "Screenshot of student progress dashboard"
    }
  ];

  return (
    <div className="container mx-auto py-16 px-4" id="preview">
      <div className="text-center mb-12">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold mb-4 gradient-text"
        >
          Platform Preview
        </motion.h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Get a glimpse of how Blockward transforms educational achievement tracking and rewards
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {screenshots.map((screenshot, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
          >
            <Card className="overflow-hidden h-full glass-card hover:shadow-purple-500/10 hover:shadow-lg transition-all duration-300">
              <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={screenshot.image} 
                  alt={screenshot.alt}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-5">
                <h3 className="text-xl font-semibold mb-2">{screenshot.title}</h3>
                <p className="text-gray-400 text-sm">{screenshot.description}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        viewport={{ once: true }}
        className="mt-12 text-center"
      >
        <div className="inline-flex items-center gap-2 bg-purple-900/20 px-4 py-2 rounded-full text-purple-300 text-sm">
          <Info className="w-4 h-4" />
          <span>Create an account to explore the full platform</span>
        </div>
      </motion.div>
    </div>
  );
};
