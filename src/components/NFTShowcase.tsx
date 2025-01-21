import { motion } from "framer-motion";
import { Sparkles, Trophy, Star } from "lucide-react";

const nfts = [
  {
    title: "Achievement Master",
    description: "Unlock special rewards for academic excellence",
    icon: Trophy,
    gradient: "from-yellow-400 to-orange-500",
  },
  {
    title: "Star Performer",
    description: "Recognition for outstanding performance",
    icon: Star,
    gradient: "from-purple-400 to-pink-500",
  },
  {
    title: "Innovation Champion",
    description: "Rewards for creative thinking",
    icon: Sparkles,
    gradient: "from-blue-400 to-cyan-500",
  },
];

export const NFTShowcase = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(155,135,245,0.1),transparent_50%)]" />
      
      <div className="container mx-auto px-4 relative">
        <motion.h2 
          className="text-4xl font-bold text-center mb-12 gradient-text"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          NFT Rewards
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {nfts.map((nft, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ y: -10 }}
              className="glass-card p-8 text-center group cursor-pointer"
            >
              <motion.div 
                className={`w-24 h-24 rounded-full bg-gradient-to-r ${nft.gradient} mx-auto mb-6 p-5 group-hover:scale-110 transition-transform duration-300`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.8 }}
              >
                <nft.icon className="w-full h-full text-white" />
              </motion.div>
              
              <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-400 transition-colors duration-300">
                {nft.title}
              </h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                {nft.description}
              </p>

              <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <motion.button
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Learn More
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};