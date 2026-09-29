import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User as UserIcon, Lock, ArrowRight, Video, Car, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, perform auth here. For now, redirect to landing page.
    navigate('/landing');
  };

  // Animation variants
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
    <div className="min-h-screen bg-gradient-to-br from-[#061224] to-[#0a192f] text-slate-300 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Elements (Smart City Theme) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        {/* Glowing Orbs */}
        <motion.div 
          animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.05, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] bg-cyan-900/40 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-teal-900/30 rounded-full blur-[120px]"
        />

        {/* Floating Icons (CCTV, Traffic, Vehicles) */}
        <motion.div 
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[15%] text-cyan-900/20"
        >
          <Video size={120} strokeWidth={1} />
        </motion.div>
        
        <motion.div 
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-[25%] left-[10%] text-teal-900/20"
        >
          <Car size={160} strokeWidth={1} />
        </motion.div>

        <motion.div 
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[30%] right-[15%] text-blue-900/20"
        >
          <Navigation size={140} strokeWidth={1} />
        </motion.div>
      </div>

      {/* Login Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="backdrop-blur-xl bg-[#0d1f3b]/60 border border-cyan-900/30 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-8 sm:p-10">
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center mb-10"
          >
            {/* Logo with Soft Glow */}
            <motion.div variants={itemVariants} className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] mb-5" onClick={() => navigate('/')}>
              <Shield className="w-8 h-8 text-white drop-shadow-md" />
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-3xl font-bold text-white tracking-tight text-center drop-shadow-sm">
              TRACE<span className="text-cyan-400">360</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-cyan-100/70 text-sm mt-2 text-center font-medium">
              Secure city-wide intelligence & analytics.
            </motion.p>
          </motion.div>

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Username Input */}
            <motion.div variants={itemVariants} className="space-y-1.5">
              <label className="text-[11px] font-semibold text-cyan-200/60 uppercase tracking-widest ml-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="w-5 h-5 text-slate-400 group-focus-within:text-cyan-400 transition-colors duration-300" />
                </div>
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-[#071324]/80 border border-cyan-900/50 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:bg-[#0a192f] transition-all duration-300 placeholder:text-slate-500 shadow-inner"
                  placeholder="admin"
                />
              </div>
            </motion.div>

            {/* Password Input */}
            <motion.div variants={itemVariants} className="space-y-1.5">
              <label className="text-[11px] font-semibold text-cyan-200/60 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-400 group-focus-within:text-cyan-400 transition-colors duration-300" />
                </div>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#071324]/80 border border-cyan-900/50 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:bg-[#0a192f] transition-all duration-300 placeholder:text-slate-500 shadow-inner"
                  placeholder="••••••••"
                />
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={itemVariants} className="pt-2">
              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(6,182,212,0.25)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.4)] transition-all duration-300 active:scale-95 group"
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 opacity-80 group-hover:translate-x-1 group-hover:opacity-100 transition-all duration-300" />
              </button>
            </motion.div>
            
            {/* Demo Hint */}
            <motion.div variants={itemVariants} className="mt-6 flex flex-col items-center justify-center gap-1.5">
              <p className="text-[10px] text-cyan-400/70 font-semibold uppercase tracking-widest">Demo Credentials</p>
              <div className="flex gap-4 text-xs font-mono text-cyan-100/60 bg-[#071324]/50 px-4 py-2 rounded-full border border-cyan-900/30">
                <span>User: <span className="text-white">{username || 'admin'}</span></span>
                <span className="w-px h-4 bg-cyan-900/50"></span>
                <span>Pass: <span className="text-white">{password || 'admin123'}</span></span>
              </div>
            </motion.div>
            
          </form>
        </div>
      </motion.div>
    </div>
  );
}
