import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cctv, User as UserIcon, Lock, ArrowRight, Video, Car, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/landing');
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { type: "spring", stiffness: 250, damping: 20 }
    }
  };

  return (
    <div className="min-h-screen flex bg-[#020610] text-slate-300 font-sans selection:bg-cyan-500/30">
      
      {/* Left Pane - Branding & Visuals */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-center px-16 xl:px-24 bg-gradient-to-br from-[#051121] via-[#091a33] to-[#040d1a] overflow-hidden border-r border-[#1a2c4a]/50">
        
        {/* Background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]"></div>
          
          {/* Glowing Orbs */}
          <motion.div 
            animate={{ opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[10%] left-[-10%] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[140px]"
          />
          <motion.div 
            animate={{ opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-teal-600/10 rounded-full blur-[160px]"
          />
          
          {/* Abstract Traffic / Network Map SVG */}
          <svg className="absolute bottom-8 right-8 w-full max-w-lg h-auto opacity-[0.15]" viewBox="0 0 400 200">
             <path d="M0,150 Q50,130 100,140 T200,100 T300,120 T400,60" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="4 4"/>
             <path d="M0,170 Q60,160 120,165 T240,120 T340,145 T400,80" fill="none" stroke="#14b8a6" strokeWidth="1" />
             <circle cx="100" cy="140" r="3" fill="#06b6d4" />
             <circle cx="200" cy="100" r="4" fill="#06b6d4" />
             <circle cx="300" cy="120" r="3" fill="#06b6d4" />
             <circle cx="120" cy="165" r="2" fill="#14b8a6" />
             <circle cx="240" cy="120" r="2" fill="#14b8a6" />
             <circle cx="340" cy="145" r="3" fill="#14b8a6" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-xl">
          <motion.div
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="w-16 h-16 rounded-2xl bg-[#091a33] border border-[#1e3a5f] flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.15)] mb-8">
              <Cctv className="w-8 h-8 text-cyan-400 drop-shadow-md" />
            </div>
            
            <h1 className="text-5xl xl:text-6xl font-extrabold text-white tracking-tight mb-4">
              TRACE<span className="text-cyan-400">360</span>
            </h1>
            
            <p className="text-xl xl:text-2xl font-light text-[#94a3b8] mb-12">
              City-Wide Vehicle & Traffic Monitoring
            </p>
            
            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-[#0a1f3d]/60 border border-[#1e3a5f]/60 px-4 py-2 rounded-full text-sm font-medium text-cyan-300 backdrop-blur-sm">
                <Video size={16} /> Real-time CCTV
              </div>
              <div className="flex items-center gap-2 bg-[#0a1f3d]/60 border border-[#1e3a5f]/60 px-4 py-2 rounded-full text-sm font-medium text-teal-300 backdrop-blur-sm">
                <Car size={16} /> ANPR Tracking
              </div>
              <div className="flex items-center gap-2 bg-[#0a1f3d]/60 border border-[#1e3a5f]/60 px-4 py-2 rounded-full text-sm font-medium text-[#818cf8] backdrop-blur-sm">
                <Activity size={16} /> Urban Analytics
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Pane - Login Form */}
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center p-6 sm:p-12 relative bg-[#020610]">
        
        {/* Mobile background subtle gradient */}
        <div className="absolute inset-0 z-0 lg:hidden bg-gradient-to-b from-[#091a33]/50 to-transparent pointer-events-none"></div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
          className="w-full max-w-[420px] relative z-10"
        >
          {/* Card Container */}
          <div className="bg-[#081221] border border-[#1e3a5f]/40 rounded-[20px] p-8 sm:p-10 shadow-2xl relative">
            
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mb-10">
              <motion.div variants={itemVariants} className="lg:hidden flex justify-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#091a33] border border-[#1e3a5f] flex items-center justify-center shadow-lg">
                  <Cctv className="w-7 h-7 text-cyan-400" />
                </div>
              </motion.div>
              <motion.h2 variants={itemVariants} className="text-3xl font-bold text-white mb-2 text-center lg:text-left">Sign In</motion.h2>
              <motion.p variants={itemVariants} className="text-slate-400 text-sm text-center lg:text-left">
                Access your secure surveillance dashboard
              </motion.p>
            </motion.div>

            <form onSubmit={handleLogin} className="space-y-6">
              
              {/* Username Input */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-[13px] font-medium text-slate-300 ml-1">Username</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <UserIcon className="w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  </div>
                  <input 
                    type="text" 
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#030914] border border-[#1e3a5f]/60 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600"
                    placeholder="Enter username"
                  />
                </div>
              </motion.div>

              {/* Password Input */}
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-[13px] font-medium text-slate-300 ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                  </div>
                  <input 
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#030914] border border-[#1e3a5f]/60 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600"
                    placeholder="••••••••"
                  />
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={itemVariants} className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(6,182,212,0.15)] hover:shadow-[0_6px_16px_rgba(6,182,212,0.25)] transition-all duration-300"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
              
            </form>
          </div>
          
          {/* Footer / Prototype Text */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-10 text-center"
          >
             <p className="text-[11px] font-mono text-slate-500/70 uppercase tracking-widest">
               Prototype • SIH 2026
             </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
