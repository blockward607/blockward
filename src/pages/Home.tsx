
import React from 'react';
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { EasyToUse } from '@/components/EasyToUse';
import { HowItWorks } from '@/components/HowItWorks';
import { NFTShowcase } from '@/components/NFTShowcase';
import { CTA } from '@/components/CTA';
import { Footer } from '@/components/layout/Footer';
import { NavBar } from '@/components/layout/NavBar';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-purple-950">
      <NavBar />
      <Hero />
      <Features />
      <EasyToUse />
      <HowItWorks id="about" />
      <NFTShowcase />
      <CTA />
      <Footer />
    </div>
  );
};

export default Home;
