
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ContactSection = () => {
  const navigate = useNavigate();
  
  const handleSignUp = () => {
    navigate('/auth');
  };

  return (
    <section id="contact" className="container mx-auto py-16 px-4">
      <div className="glass-card modern-shadow p-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center blockward-logo">Get In Touch</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold gradient-text">Contact Information</h3>
            <p className="text-gray-300">
              We'd love to hear from you! Reach out to us with questions about Blockward and how it can transform your classroom.
            </p>
            
            <div className="space-y-3 mt-6">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-purple-400" />
                <p className="text-gray-300">blockwardcontact@gmail.com</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-purple-400" />
                <p className="text-gray-300">(123) 456-7890</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col justify-center">
            <Button
              onClick={handleSignUp}
              className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 w-full py-6 text-lg hover-scale"
            >
              Sign Up Now
            </Button>
            
            <p className="text-gray-400 mt-4 text-center text-sm">
              Join the future of educational technology
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
