import { Shield, Award, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Shield,
    title: "Secure & Transparent",
    description: "Built on blockchain technology for maximum security and transparency",
  },
  {
    icon: Award,
    title: "NFT Rewards",
    description: "Gamify learning with unique NFT rewards for student achievements",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Foster a collaborative learning environment with social features",
  },
  {
    icon: Zap,
    title: "Real-time Tracking",
    description: "Monitor student progress and behavior in real-time",
  },
];

export const Features = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 gradient-text">
          Why Choose Blockward?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card p-6"
            >
              <feature.icon className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};