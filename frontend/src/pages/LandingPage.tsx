import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Camera, MapPin, Activity, AlertTriangle, 
  BarChart3, Play, ChevronRight, Car 
} from 'lucide-react';
import TopNav from '../components/TopNav';

export default function LandingPage() {
  const navigate = useNavigate();

  const stickerCamera = (
    <Sticker className="rotate-[-10deg] delay-100 hover:rotate-0">
      <Camera size={40} className="text-indigo-400" />
      <div className="text-xs font-bold text-slate-300 mt-1">ANPR Feed</div>
    </Sticker>
  );

  const stickerPlate = (
    <Sticker className="rotate-[5deg] delay-200 hover:rotate-0">
      <div className="bg-yellow-500 border-2 border-black rounded px-3 py-1 font-mono font-bold text-lg text-black shadow-inner">
        MH12AB1234
      </div>
    </Sticker>
  );

  const stickerAnalytics = (
    <Sticker className="rotate-[12deg] delay-300 hover:rotate-0">
      <BarChart3 size={40} className="text-blue-400" />
      <div className="text-xs font-bold text-slate-300 mt-1">Analytics</div>
    </Sticker>
  );

  const stickerTracking = (
    <Sticker className="rotate-[-8deg] delay-500 hover:rotate-0">
      <MapPin size={40} className="text-red-400" />
      <div className="text-xs font-bold text-slate-300 mt-1">Live Tracking</div>
    </Sticker>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 overflow-hidden font-sans relative selection:bg-blue-500/30">
      
      {/* Background Texture & Circles */}
      <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {/* Subtle noise/texture */}
        <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        
        {/* Concentric Dotted Circles */}
        <div className="absolute w-[600px] h-[600px] border border-slate-700 border-dashed rounded-full opacity-50 animate-[spin_120s_linear_infinite]"></div>
        <div className="absolute w-[900px] h-[900px] border border-slate-700 border-dashed rounded-full opacity-40 animate-[spin_150s_linear_infinite_reverse]"></div>
        <div className="absolute w-[1200px] h-[1200px] border border-slate-700 border-dashed rounded-full opacity-30 animate-[spin_180s_linear_infinite]"></div>
      </div>

      <TopNav />

      {/* Main Content Area */}
      <main className="relative z-10 w-full max-w-[1400px] mx-auto min-h-[calc(100vh-100px)] flex flex-col items-center justify-center px-4 py-12 md:py-0">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-stretch w-full min-h-[600px]">
          
          {/* Left: Title & Team */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left z-20 order-2 lg:order-1 justify-center py-4 lg:py-0 relative">
            <div className="hidden lg:flex flex-1 w-full items-start justify-start pt-4">
              {stickerCamera}
            </div>
            
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-none py-4"
            >
              <h3 className="text-sm md:text-base font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
                TEAM INVARIANTS PRESENTS
              </h3>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none text-white drop-shadow-sm pb-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-500">TRACE</span><br/>
                360
              </h1>
            </motion.div>
            
            <div className="hidden lg:flex flex-1 w-full items-end justify-center pb-4 pl-12">
              {stickerPlate}
            </div>
          </div>

          {/* Center: Device Mockup */}
          <div className="relative flex justify-center items-center z-20 order-1 lg:order-2 h-[400px] md:h-[600px]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, type: 'spring' }}
              className="relative w-full max-w-[320px] md:max-w-[420px] lg:max-w-[500px] aspect-[4/3] bg-slate-900 rounded-2xl border-4 md:border-8 border-slate-800 shadow-2xl overflow-hidden flex flex-col group"
            >
              {/* Browser window header */}
              <div className="h-6 md:h-8 bg-slate-800 flex items-center px-3 md:px-4 gap-1.5 shrink-0 border-b border-slate-700">
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500"></div>
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500"></div>
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500"></div>
                <div className="mx-auto bg-slate-700 rounded text-[10px] text-slate-400 px-4 py-0.5 font-mono hidden md:block">trace360.gov.in</div>
              </div>
              
              {/* App Content */}
              <div className="flex-1 relative bg-slate-100 overflow-hidden cursor-pointer" onClick={() => navigate('/dashboard')}>
                {/* Mock Map Background */}
                <div className="absolute inset-0 bg-[#e5e7eb] flex items-center justify-center overflow-hidden">
                   {/* CSS Grid to simulate map roads */}
                   <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(0,0,0,0.5)_2px,transparent_2px),linear-gradient(90deg,rgba(0,0,0,0.5)_2px,transparent_2px)] bg-[size:40px_40px]"></div>
                   
                   {/* Trajectory Mockup */}
                   <svg className="absolute inset-0 w-full h-full" style={{ filter: 'drop-shadow(0 4px 6px rgba(59,130,246,0.3))' }}>
                    <path 
                      d="M 50,250 Q 150,150 250,200 T 400,100" 
                      fill="transparent" 
                      stroke="#3b82f6" 
                      strokeWidth="4"
                      strokeDasharray="8 8"
                      className="animate-[dash_10s_linear_infinite]"
                    />
                  </svg>
                  <div className="absolute top-[242px] left-[42px] w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-md"></div>
                  <div className="absolute top-[92px] left-[392px] w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-md"></div>
                </div>

                {/* Floating UI Elements inside mockup */}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-lg shadow-md p-2 w-32 border border-slate-200">
                  <div className="w-full h-2 bg-slate-200 rounded mb-1"></div>
                  <div className="w-2/3 h-2 bg-slate-200 rounded"></div>
                </div>
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur rounded-lg shadow-md p-3 w-40 border border-slate-200">
                  <div className="flex items-end gap-1 h-12">
                    <div className="w-1/4 h-full bg-blue-500 rounded-t"></div>
                    <div className="w-1/4 h-2/3 bg-blue-400 rounded-t"></div>
                    <div className="w-1/4 h-5/6 bg-blue-600 rounded-t"></div>
                    <div className="w-1/4 h-1/2 bg-blue-300 rounded-t"></div>
                  </div>
                </div>

                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/10 group-hover:bg-slate-900/20 transition-colors">
                  <div className="w-16 h-12 md:w-20 md:h-14 bg-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-red-500 transition-all">
                    <Play className="text-white fill-white w-6 h-6 md:w-8 md:h-8" />
                  </div>
                </div>

                {/* Bottom Bar Info */}
                <div className="absolute bottom-0 inset-x-0 bg-slate-900/80 backdrop-blur-md p-3">
                  <p className="text-white text-xs md:text-sm font-medium">Pune City Traffic Network is currently tracking <span className="text-cyan-400 font-bold">14,302</span> vehicles.</p>
                </div>
              </div>
            </motion.div>

            {/* Hand-drawn arrow (SVG) */}
            <div className="absolute -bottom-12 right-12 md:-bottom-16 md:right-0 lg:-bottom-20 lg:-right-16 z-30 flex flex-col items-center">
              <svg className="w-16 h-16 md:w-24 md:h-24 text-red-500 -rotate-12" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M 20 80 Q 50 20 80 40" />
                <path d="M 80 40 L 70 25 M 80 40 L 60 45" />
              </svg>
              <span className="font-['Comic_Sans_MS',cursive] text-red-500 font-bold text-lg md:text-xl -rotate-12 drop-shadow-sm mt-[-10px] ml-12">
                check out<br/>live dashboard!
              </span>
            </div>
          </div>

          {/* Right: Description */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left z-40 order-3 p-4 justify-center relative">
            <div className="hidden lg:flex flex-1 w-full items-start justify-end pt-4 pr-8">
              {stickerAnalytics}
            </div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-none py-4"
            >
              <p className="text-slate-300 text-lg md:text-xl font-medium leading-relaxed max-w-md">
                Our urban mobility faces the constant threat of congestion and crime. We introduce TRACE360, it secures 
                the city using accurate AI models. It offers 
                immersive on-site trajectory tracking and traffic analytics, truly 
                "bringing city-wide intelligence to life forever".
              </p>
            </motion.div>
            
            <div className="hidden lg:flex flex-1 w-full items-end justify-start pb-4 pl-8">
              {stickerTracking}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Stickers Row */}
        <div className="flex lg:hidden flex-wrap justify-center items-center gap-4 mt-8 w-full order-4 z-30 px-4 pb-12">
          {stickerCamera}
          {stickerPlate}
          {stickerAnalytics}
          {stickerTracking}
          <Sticker className="rotate-[15deg] hover:rotate-0">
            <Car size={32} className="text-emerald-400" />
          </Sticker>
        </div>

      </main>

      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -100; }
        }
      `}</style>
    </div>
  );
}

// Sticker Component
function Sticker({ children, className }: { children: React.ReactNode, className: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1, rotate: 0 }}
      transition={{ duration: 0.5, type: 'spring', bounce: 0.5 }}
      className={`relative z-30 inline-flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur p-3 md:p-4 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border-[2px] border-slate-700 cursor-pointer ${className}`}
      onClick={() => window.location.href = '/dashboard'}
    >
      {children}
    </motion.div>
  );
}
