import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Create Your Class",
    description: "Set up your virtual classroom in minutes",
  },
  {
    number: "02",
    title: "Add Students",
    description: "Invite students to join your digital learning space",
  },
  {
    number: "03",
    title: "Set Goals",
    description: "Define achievements and milestones for your students",
  },
  {
    number: "04",
    title: "Award NFTs",
    description: "Recognize and reward student progress with unique NFTs",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-20 bg-black/30">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 gradient-text">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
            >
              <div className="text-6xl font-bold text-primary/20 mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-400">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};