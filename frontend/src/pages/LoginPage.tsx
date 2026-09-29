import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User as UserIcon, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-slate-300 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        {/* Animated Orbs */}
        <motion.div 
          animate={{ 
            x: [0, 50, -50, 0], 
            y: [0, -50, 50, 0],
            scale: [1, 1.1, 0.9, 1] 
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-cyan-600/30 rounded-full blur-[120px]"
        />
        <motion.div 
          animate={{ 
            x: [0, -70, 70, 0], 
            y: [0, 70, -70, 0],
            scale: [1, 1.2, 0.8, 1] 
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[10%] right-[20%] w-[600px] h-[600px] bg-blue-700/20 rounded-full blur-[150px]"
        />
      </div>

      {/* Login Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="backdrop-blur-2xl bg-white/[0.03] border border-white/[0.08] rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] p-8 sm:p-10">
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center mb-10"
          >
            <motion.div variants={itemVariants} className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.3)] mb-6 cursor-pointer hover:scale-105 transition-transform duration-300" onClick={() => navigate('/')}>
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight text-center">
              TRACE360
            </motion.h1>
            <motion.p variants={itemVariants} className="text-slate-400 text-sm mt-3 text-center font-medium">
              Secure city-wide intelligence & analytics.
            </motion.p>
          </motion.div>

          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Username Input */}
            <motion.div variants={itemVariants} className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon className="w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors duration-300" />
                </div>
                <input 
                  type="text" 
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 text-white rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:bg-black/40 transition-all placeholder:text-slate-600 backdrop-blur-md"
                  placeholder="admin"
                />
              </div>
            </motion.div>

            {/* Password Input */}
            <motion.div variants={itemVariants} className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-500 group-focus-within:text-cyan-400 transition-colors duration-300" />
                </div>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 text-white rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 focus:bg-black/40 transition-all placeholder:text-slate-600 backdrop-blur-md"
                  placeholder="••••••••"
                />
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div variants={itemVariants} className="pt-4">
              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 group"
              >
                <span>Authenticate</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </motion.div>
            
            {/* Demo Hint */}
            <motion.div variants={itemVariants} className="mt-6 flex flex-col items-center justify-center gap-1.5">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Demo Credentials</p>
              <div className="flex gap-4 text-xs font-mono text-slate-400 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                <span>User: <span className="text-white">{username || 'admin'}</span></span>
                <span className="w-px h-4 bg-white/10"></span>
                <span>Pass: <span className="text-white">{password || 'admin123'}</span></span>
              </div>
            </motion.div>
            
          </form>
        </div>
      </motion.div>
    </div>
  );
}
