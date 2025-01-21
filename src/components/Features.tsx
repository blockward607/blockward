import { Shield, Award, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Shield,
    title: "Secure & Transparent",
    description: "Built on blockchain technology for maximum security and transparency",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Award,
    title: "NFT Rewards",
    description: "Gamify learning with unique NFT rewards for student achievements",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Foster a collaborative learning environment with social features",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: Zap,
    title: "Real-time Tracking",
    description: "Monitor student progress and behavior in real-time",
    gradient: "from-green-500 to-emerald-500",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const Features = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.h2 
          className="text-4xl font-bold text-center mb-12 gradient-text"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Why Choose Blockward?
        </motion.h2>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              className="glass-card p-6 group hover:scale-105 transition-transform duration-300"
              whileHover={{
                y: -5,
                transition: { duration: 0.2 }
              }}
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} p-3 mb-4 transform group-hover:rotate-12 transition-transform duration-300`}>
                <feature.icon className="w-full h-full text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-400 transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};