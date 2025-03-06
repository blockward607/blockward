
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";

const Index = () => {
  const navigate = useNavigate();
  
  const handleDirectAccess = () => {
    navigate('/view-student-dashboard');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A1F2C] to-black text-white">
      {/* Simple header */}
      <header className="container mx-auto py-4 px-4">
        <h1 className="text-2xl font-bold text-purple-400">Blockward</h1>
      </header>
      
      {/* Add this button somewhere visible near the top, after the header */}
      <div className="container mx-auto mt-4 px-4 text-center">
        <button
          onClick={handleDirectAccess}
          className="px-6 py-3 bg-purple-600 rounded-full text-white font-medium hover:bg-purple-700 transition-colors"
        >
          View Student Dashboard Demo
        </button>
      </div>
      
      <Hero />
      <Features />
      
      {/* Simple testimonials section */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-purple-900/20 p-6 rounded-lg">
            <p className="italic mb-4">
              "Blockward has transformed how I manage my classroom. The students love the NFT rewards!"
            </p>
            <p className="font-semibold">- Sarah T., 5th Grade Teacher</p>
          </div>
          <div className="bg-purple-900/20 p-6 rounded-lg">
            <p className="italic mb-4">
              "The engagement in my class has increased significantly since implementing this platform."
            </p>
            <p className="font-semibold">- Mark J., High School Science</p>
          </div>
          <div className="bg-purple-900/20 p-6 rounded-lg">
            <p className="italic mb-4">
              "My students are excited about learning and collecting achievements. It's been a game-changer!"
            </p>
            <p className="font-semibold">- Lisa R., Middle School Math</p>
          </div>
        </div>
      </section>
      
      {/* Simple footer */}
      <footer className="py-8 bg-black/50 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2023 Blockward. All rights reserved.</p>
          <div className="flex justify-center gap-4 mt-4">
            <a href="#" className="text-purple-400 hover:text-purple-300">Terms</a>
            <a href="#" className="text-purple-400 hover:text-purple-300">Privacy</a>
            <a href="#" className="text-purple-400 hover:text-purple-300">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
