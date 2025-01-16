import { motion } from "framer-motion";

export const NFTShowcase = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 gradient-text">
          NFT Rewards
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="glass-card p-6 aspect-square flex items-center justify-center"
            >
              <div className="text-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-primary to-secondary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Achievement NFT</h3>
                <p className="text-gray-400">Unlock special rewards</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};