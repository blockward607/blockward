
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const EasyToUse = () => {
  return (
    <section id="easy-to-use" className="py-16 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
            Simple & Powerful Tools for Education
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Blockward makes classroom management, attendance tracking, and student rewards effortless with an intuitive interface.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h3 className="text-2xl font-bold text-purple-400 mb-4">
              Quick Start, Powerful Results
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="mt-1 p-1 rounded-full bg-green-500/20">
                  <Check className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-gray-300">
                  <span className="font-bold text-white">One-click setup</span>: Create a classroom in seconds
                </p>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="mt-1 p-1 rounded-full bg-green-500/20">
                  <Check className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-gray-300">
                  <span className="font-bold text-white">Simple attendance tracking</span>: Mark present/absent with a single tap
                </p>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="mt-1 p-1 rounded-full bg-green-500/20">
                  <Check className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-gray-300">
                  <span className="font-bold text-white">Instant rewards</span>: Award points and NFTs to motivate students
                </p>
              </div>
              
              <div className="flex items-start gap-2">
                <div className="mt-1 p-1 rounded-full bg-green-500/20">
                  <Check className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-gray-300">
                  <span className="font-bold text-white">Guided onboarding</span>: Tutorial walks you through all features
                </p>
              </div>
            </div>
            
            <div className="pt-4">
              <Link to="/auth">
                <Button 
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-6 rounded-lg flex items-center gap-2"
                >
                  Try Blockward Now <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="glass-card p-4 rounded-lg overflow-hidden shadow-xl"
          >
            <img 
              src="/lovable-uploads/7ec67536-e04a-4363-90ac-c6a0d76c4811.png" 
              alt="Blockward interface" 
              className="w-full rounded-lg shadow-lg border border-purple-500/30"
            />
            <div className="mt-4 text-center">
              <h4 className="text-lg font-semibold text-purple-400">Clean, Intuitive Interface</h4>
              <p className="text-sm text-gray-400">Focused on what matters - your students and their progress</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
