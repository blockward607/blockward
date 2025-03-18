
import { motion } from "framer-motion";
import { GraduationCap, Award, Calendar, Users } from "lucide-react";

interface HowItWorksProps {
  id?: string;
}

export const HowItWorks = ({ id }: HowItWorksProps) => {
  const steps = [
    {
      icon: <Users className="w-10 h-10 text-purple-400" />,
      title: "Create Your Classroom",
      description: "Set up your virtual classroom and invite students to join via email or class code."
    },
    {
      icon: <Calendar className="w-10 h-10 text-purple-400" />,
      title: "Track Attendance",
      description: "Easily mark attendance for your class with our intuitive attendance tracker."
    },
    {
      icon: <Award className="w-10 h-10 text-purple-400" />,
      title: "Award Achievements",
      description: "Recognize student excellence with digital NFT achievements that are securely stored."
    },
    {
      icon: <GraduationCap className="w-10 h-10 text-purple-400" />,
      title: "Monitor Progress",
      description: "Track student progress and engagement with detailed analytics and reports."
    }
  ];

  return (
    <section id={id || "how-it-works"} className="py-20 px-4 bg-black">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
            How Blockward Works
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Our simple process helps you create engaging classroom experiences in just a few steps
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass-card p-6 rounded-lg text-center hover:bg-purple-900/10 transition-colors duration-300"
            >
              <div className="flex justify-center mb-4">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">{step.title}</h3>
              <p className="text-gray-300">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
