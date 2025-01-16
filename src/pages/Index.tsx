import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { HowItWorks } from "@/components/HowItWorks";
import { NFTShowcase } from "@/components/NFTShowcase";
import { CTA } from "@/components/CTA";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <HowItWorks />
      <NFTShowcase />
      <CTA />
    </div>
  );
};

export default Index;