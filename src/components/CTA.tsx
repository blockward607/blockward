import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const CTA = () => {
  return (
    <section className="py-20 bg-black/30">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold mb-6 gradient-text">
            Ready to Transform Your Classroom?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of teachers already using Blockward to create an engaging learning environment
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            Start Free Trial
          </Button>
        </motion.div>
      </div>
    </section>
  );
};