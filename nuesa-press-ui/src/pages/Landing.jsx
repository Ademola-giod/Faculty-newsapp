import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { ArrowRight } from 'lucide-react';

const Landing = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="h-screen w-full relative flex flex-col justify-end bg-black overflow-hidden">
      {/* Background with absolute positioning */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071" 
          className="w-full h-full object-cover opacity-70"
          alt="University life"
        />
        {/* Subtle gradient to make text readable but keep the image clear */}
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent"></div>
      </div>

      {/* Content Container - Locked to a max-width for desktop elegance */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-12 md:pb-20 lg:px-12">
        <div className="max-w-2xl"> {/* This 'max-w' is the secret to not looking trashy */}
            <div className="mb-4">
              <span className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                University of Ibadan
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 tracking-tight">
              Discover stories that <br /> 
              <span className="text-blue-500">shape the world</span>
            </h1>
            
            <p className="text-gray-300 text-sm md:text-lg leading-relaxed mb-8 max-w-md">
              Stay updated with reliable news, real-time insights, and stories that keep you informed every day.
            </p>

            <button 
              onClick={() => loginWithRedirect()}
              className="group w-full md:w-fit md:px-10 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-blue-600/20"
            >
              Get Started
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;