
import React from 'react';
import { InteractiveLogo } from "@/components/logo/InteractiveLogo";

export const Footer = () => {
  return (
    <footer className="py-8 bg-black mt-8 border-t border-purple-900/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-7 h-7">
              <InteractiveLogo />
            </div>
            <h3 className="text-xl blockward-logo">Blockward</h3>
          </div>
          
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 5.16c-.94.42-1.95.7-3 .82 1.08-.65 1.9-1.68 2.3-2.9-1.01.6-2.13 1.03-3.32 1.27-2.02-2.15-5.38-2.26-7.51-.25-.97.91-1.5 2.18-1.5 3.5 0 .63.07 1.24.21 1.82-5.97-.3-11.25-3.16-14.77-7.5-.62 1.06-.94 2.28-.94 3.52 0 2.4 1.22 4.53 3.07 5.77-.35-.01-1.11-.16-2.02-.47v.05c0 3.36 2.38 6.16 5.54 6.8-.58.16-1.19.24-1.8.24-.44 0-.87-.04-1.3-.13.88 2.76 3.43 4.76 6.45 4.82-2.36 1.85-5.34 2.95-8.57 2.95-.56 0-1.11-.03-1.65-.1 3.05 1.96 6.69 3.1 10.6 3.1 12.72 0 19.67-10.54 19.67-19.67v-.9c1.35-.97 2.52-2.18 3.45-3.55z" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0C5.38 0 0 5.38 0 12c0 5.3 3.44 9.8 8.2 11.37.6.11.82-.26.82-.58l-.01-2.03c-3.34.73-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.75-1.33-1.75-1.08-.74.08-.73.08-.73 1.19.08 1.82 1.23 1.82 1.23 1.06 1.83 2.8 1.3 3.47.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.17 0 0 1-.32 3.3 1.23a11.5 11.5 0 016 0c2.3-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.77.84 1.23 1.9 1.23 3.22 0 4.6-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22l-.01 3.29c0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12c0-6.62-5.38-12-12-12z" />
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 11.5c0 6.35-5.15 11.5-11.5 11.5S1 17.85 1 11.5 6.15 0 12.5 0 24 5.15 24 11.5zm-11.5 8.5c4.7 0 8.5-3.8 8.5-8.5S17.2 3 12.5 3 4 6.8 4 11.5s3.8 8.5 8.5 8.5zm.5-10.5v-4c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1s1-.45 1-1zm0 4v-1c0-.55-.45-1-1-1s-1 .45-1 1v1c0 .55.45 1 1 1s1-.45 1-1z" />
              </svg>
            </a>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center pt-4 border-t border-purple-900/30">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">© 2023 Blockward. All rights reserved.</p>
          
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">Terms of Service</a>
            <a href="#contact" className="text-gray-400 hover:text-purple-400 transition-colors text-sm">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
