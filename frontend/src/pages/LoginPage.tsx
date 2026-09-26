import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User as UserIcon, Lock, ArrowRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, perform auth here. For now, redirect to landing page.
    navigate('/landing');
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 flex items-center justify-center p-4 relative overflow-hidden selection:bg-blue-500/30">
      
      {/* Background Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.2]" style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      
      {/* Animated glow orbs */}
      <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md bg-[#0f172a]/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl p-8"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/50 mb-4 cursor-pointer" onClick={() => navigate('/')}>
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Welcome to TRACE360</h1>
          <p className="text-slate-400 text-sm mt-2 text-center">Secure city-wide intelligence and analytics.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Username</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                placeholder="admin"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]"
          >
            Sign In <ArrowRight className="w-5 h-5" />
          </button>
        </form>

      </motion.div>
    </div>
  );
}
