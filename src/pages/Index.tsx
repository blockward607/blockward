
import { motion } from "framer-motion";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { EasyToUse } from "@/components/EasyToUse";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/layout/Footer";
import { NavBar } from "@/components/layout/NavBar";
import { DemoAccessSection } from "@/components/demo/DemoAccessSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A1F2C] to-black text-white">
      <NavBar />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-20"
      >
        <Hero />
        <Features />
        <HowItWorks />
        <EasyToUse />
        <DemoAccessSection />
        <CTA />
      </motion.div>
      <Footer />
    </div>
  );
};

export default Index;
