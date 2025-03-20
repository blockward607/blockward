
import { useState } from 'react';
import { motion } from "framer-motion";
import { AccessDemoButtons } from './AccessDemoButtons';
import { DemoAccessSection } from './DemoAccessSection';

export const DemoSection = () => {
  const [activeTab, setActiveTab] = useState('access');
  
  return (
    <section className="py-24 relative overflow-hidden" id="demo">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold gradient-text mb-4">Try BlockWard Demo</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Experience BlockWard's powerful features without registration. 
            Explore our platform from both student and teacher perspectives.
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto"
        >
          <div className="space-y-8">
            <DemoAccessSection />
            <AccessDemoButtons />
          </div>
        </motion.div>
      </div>
    </section>
  );
};
