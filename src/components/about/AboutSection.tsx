
import React from 'react';
import { motion } from "framer-motion";
import { GraduationCap, Award, BookOpen } from "lucide-react";

export const AboutSection = () => {
  return (
    <section id="about" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(155,135,245,0.1),transparent_75%)]" />
      
      <div className="container mx-auto px-4 relative">
        <motion.h2 
          className="text-4xl font-bold text-center mb-12 blockward-logo"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          About Blockward
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 text-center modern-shadow"
          >
            <div className="rounded-full bg-purple-900/40 w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="text-purple-400 w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-4 gradient-text">Revolutionary Education</h3>
            <p className="text-gray-300">
              Blockward transforms traditional classrooms with blockchain technology,
              bringing transparency and engagement to the educational experience.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6 text-center modern-shadow"
          >
            <div className="rounded-full bg-indigo-900/40 w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <Award className="text-indigo-400 w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-4 gradient-text">NFT Achievements</h3>
            <p className="text-gray-300">
              Our unique NFT-based achievement system rewards students with digital
              collectibles, creating lasting records of their academic accomplishments.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 text-center modern-shadow"
          >
            <div className="rounded-full bg-fuchsia-900/40 w-16 h-16 flex items-center justify-center mx-auto mb-6">
              <BookOpen className="text-fuchsia-400 w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-4 gradient-text">Comprehensive Toolkit</h3>
            <p className="text-gray-300">
              Blockward provides tools for attendance tracking, behavior management,
              assignment grading, and more in a secure, integrated platform.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
