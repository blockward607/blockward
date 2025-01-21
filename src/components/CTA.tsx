import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Rocket, ArrowRight } from "lucide-react";

export const CTA = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-black/30" />
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            className="flex justify-center mb-6"
          >
            <Rocket className="w-16 h-16 text-purple-400" />
          </motion.div>

          <h2 className="text-4xl font-bold mb-6 gradient-text">
            Ready to Transform Your Classroom?
          </h2>
          
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of teachers already using Blockward to create an engaging learning environment
          </p>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="lg" 
              className="bg-purple-600 hover:bg-purple-700 transition-all duration-300 px-8 py-6 text-lg flex items-center gap-2"
            >
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-sm text-gray-400"
          >
            No credit card required • 14-day free trial • Cancel anytime
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};