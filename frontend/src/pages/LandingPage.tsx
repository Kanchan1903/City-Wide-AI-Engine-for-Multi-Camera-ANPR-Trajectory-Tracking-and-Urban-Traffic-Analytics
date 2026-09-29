import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
 Shield, Camera, MapPin, Activity, AlertTriangle, 
 BarChart3, Play, ChevronRight, Car, Video, 
 Crosshair, Radio, CheckCircle2, AlertCircle
} from 'lucide-react';
import TopNav from '../components/TopNav';
import { useStore } from '../store/store';

export default function LandingPage() {
 const navigate = useNavigate();
 const { stats, alerts, cameras } = useStore();

 const activeAlertsCount = alerts.filter(a => !a.read).length;
 const highPriorityCount = alerts.filter(a => !a.read && a.type === 'error').length;
 const onlineCameras = cameras.filter(c => c.status === 'online').length;

 return (
 <div className="min-h-screen bg-slate-900 text-slate-300 font-sans relative selection:bg-blue-500/30 flex flex-col">
 <TopNav />

 <main className="relative z-10 w-full max-w-[1400px] mx-auto flex-1 flex flex-col px-4 py-12 md:py-8 lg:py-16">
 
 {/* Hero Section */}
 <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16 lg:mb-24">
 
 {/* Left Content (5 cols) */}
 <div className="lg:col-span-5 flex flex-col items-start z-20">
 <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 text-xs font-bold text-slate-300 mb-6 tracking-wide shadow-sm">
 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div> 
 CITY TRAFFIC MANAGEMENT PLATFORM
 </div>
 
 <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-4 drop-shadow-sm leading-tight">
 TRACE<span className="text-blue-500">360</span>
 </h1>
 
 <h2 className="text-xl md:text-2xl font-semibold text-slate-300 mb-6 leading-snug">
 City-Wide Vehicle Intelligence <br className="hidden lg:block" />& Traffic Analytics
 </h2>
 
 <p className="text-slate-400 text-lg mb-10 max-w-lg leading-relaxed">
 Monitor vehicles, track movement across cameras, and understand city-wide traffic patterns from a single, unified command platform.
 </p>
 
 <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
 <button 
 onClick={() => navigate('/dashboard')}
 className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all active:scale-95"
 >
 Open Dashboard <ChevronRight className="w-5 h-5" />
 </button>
 <button 
 onClick={() => navigate('/dashboard/anpr')}
 className="w-full sm:w-auto px-7 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95"
 >
 <Camera className="w-5 h-5" /> View ANPR Demo
 </button>
 </div>
 </div>

 {/* Right Content - Map/Dashboard Visualization (7 cols) */}
 <div className="lg:col-span-7 z-20 w-full relative">
 <div className="bg-slate-800 rounded-xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[400px] md:h-[500px] lg:h-[600px] relative">
 
 {/* Panel Header */}
 <div className="h-10 bg-slate-800 flex items-center justify-between px-4 shrink-0 border-b border-slate-800">
 <div className="flex items-center gap-3">
 <div className="flex gap-1.5">
 <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
 <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
 <div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div>
 </div>
 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden md:block">
 TRACE360 Command Operations • Sector 04
 </span>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-[10px] font-bold text-slate-400">GPS SYNC</span>
 <div className="h-3 w-px bg-slate-600 mx-1"></div>
 <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
 <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
 LIVE
 </div>
 </div>
 </div>
 
 {/* Main Visualization Stage */}
 <div className="flex-1 relative bg-slate-900 overflow-hidden">
 
 {/* SVG Map Layer */}
 <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 800 500">
 <defs>
 <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
 <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeOpacity="0.3" />
 </pattern>
 </defs>
 <rect width="100%" height="100%" fill="url(#grid)" />
 
 {/* Roads */}
 <path d="M -50 450 Q 200 400 400 250 T 850 150" fill="none" stroke="#1e293b" strokeWidth="32" strokeLinecap="round" />
 <path d="M 200 -50 L 300 200 L 250 550" fill="none" stroke="#1e293b" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" />
 <path d="M 850 400 L 500 350 L 400 250" fill="none" stroke="#1e293b" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" />

 {/* Road Centerlines */}
 <path d="M -50 450 Q 200 400 400 250 T 850 150" fill="none" stroke="#0f172a" strokeWidth="2" strokeDasharray="10 10" />
 <path d="M 200 -50 L 300 200 L 250 550" fill="none" stroke="#0f172a" strokeWidth="2" strokeDasharray="10 10" />
 
 {/* Highlighted Trajectory */}
 <path 
 d="M 120 420 Q 200 400 300 310 L 400 250 L 500 350 L 650 370" 
 fill="none" 
 stroke="#3b82f6" 
 strokeWidth="3" 
 strokeDasharray="6 6" 
 className="animate-[dash_20s_linear_infinite] opacity-70"
 />
 <style>{`
 @keyframes dash {
 to { stroke-dashoffset: -200; }
 }
 `}</style>
 </svg>

 {/* Map Elements (Overlay) */}
 
 {/* Camera 1 */}
 <div className="absolute top-[400px] left-[150px] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10">
 <div className="w-8 h-8 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center shadow-lg relative">
 <Video className="w-3.5 h-3.5 text-slate-400" />
 <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
 </div>
 <span className="text-[9px] font-bold text-slate-400 bg-slate-900/80 px-1.5 py-0.5 rounded ">CAM-01</span>
 </div>

 {/* Camera 2 (Active/Intersection) */}
 <div className="absolute top-[250px] left-[400px] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10">
 <div className="w-10 h-10 bg-blue-900/40 border border-blue-500 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)] relative">
 <Video className="w-4 h-4 text-blue-400" />
 <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-blue-400 rounded-full border-2 border-slate-900 shadow-[0_0_5px_rgba(96,165,250,0.8)]"></div>
 </div>
 <span className="text-[10px] font-bold text-blue-400 bg-slate-900/90 px-2 py-0.5 rounded border border-blue-900/50 shadow-md">CAM-02</span>
 </div>

 {/* Camera 3 */}
 <div className="absolute top-[350px] left-[500px] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 z-10">
 <div className="w-8 h-8 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center shadow-lg relative">
 <Video className="w-3.5 h-3.5 text-slate-400" />
 <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
 </div>
 <span className="text-[9px] font-bold text-slate-400 bg-slate-900/80 px-1.5 py-0.5 rounded ">CAM-03</span>
 </div>
 
 {/* Vehicle Marker 1 (Target) */}
 <motion.div 
 className="absolute z-20 flex items-center justify-center"
 animate={{
 x: ['120px', '200px', '300px', '400px', '500px', '650px'],
 y: ['420px', '400px', '310px', '250px', '350px', '370px']
 }}
 transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
 style={{ x: '400px', y: '250px' }} // Initial fallback
 >
 <div className="relative">
 {/* Reticle */}
 <div className="absolute inset-[-12px] border border-cyan-400/60 bg-cyan-400/10 rounded-sm flex items-center justify-center">
 <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400"></div>
 <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400"></div>
 <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-400"></div>
 <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400"></div>
 </div>
 {/* Car dot */}
 <div className="w-4 h-4 bg-white rounded flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,0.5)]">
 <div className="w-2 h-2 bg-blue-500 rounded-sm"></div>
 </div>
 {/* Tag */}
 <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-3 whitespace-nowrap">
 <div className="bg-slate-900 border border-cyan-800 rounded px-2 py-1 shadow-lg flex flex-col items-center">
 <div className="text-cyan-400 font-mono font-bold text-[10px] leading-none mb-0.5">MH12AB1234</div>
 <div className="text-slate-400 text-[8px] font-bold uppercase leading-none">Target Lock</div>
 </div>
 <div className="w-px h-3 bg-cyan-800 mx-auto"></div>
 </div>
 </div>
 </motion.div>

 {/* Ambient Vehicles */}
 <motion.div 
 className="absolute z-10"
 animate={{ x: ['300px', '250px'], y: ['200px', '550px'] }}
 transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
 >
 <div className="w-3 h-3 bg-slate-400 rounded-sm"></div>
 </motion.div>
 
 <motion.div 
 className="absolute z-10"
 animate={{ x: ['850px', '500px'], y: ['150px', '225px'] }}
 transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
 >
 <div className="w-3 h-3 bg-slate-500 rounded-sm"></div>
 </motion.div>


 {/* Bottom Status Bar */}
 <div className="absolute bottom-0 left-0 w-full bg-slate-800/95 border-t border-slate-800 p-2 md:px-4 md:py-2 flex justify-between items-center z-30">
 <div className="flex items-center gap-4 md:gap-6">
 <div className="flex flex-col">
 <span className="text-[8px] text-slate-500 font-bold uppercase">System Status</span>
 <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">OPTIMAL <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div></span>
 </div>
 <div className="hidden md:flex flex-col">
 <span className="text-[8px] text-slate-500 font-bold uppercase">Avg Latency</span>
 <span className="text-[10px] text-slate-300 font-bold font-mono">18ms</span>
 </div>
 <div className="hidden sm:flex flex-col">
 <span className="text-[8px] text-slate-500 font-bold uppercase">Processing Rate</span>
 <span className="text-[10px] text-slate-300 font-bold font-mono">142 frames/s</span>
 </div>
 </div>
 
 <div className="flex items-center gap-2">
 <AlertCircle size={12} className="text-amber-500" />
 <span className="text-[10px] text-amber-500 font-bold">0 ALERT QUEUE</span>
 </div>
 </div>

 </div>
 </div>
 </div>
 </div>

 {/* Compact Statistics Section */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16 relative z-20">
 <StatCard title="Cameras Online" value={onlineCameras.toLocaleString()} sub="100% Operational" icon={<Camera className="w-5 h-5 text-blue-400" />} />
 <StatCard title="Vehicles Tracked" value={stats.vehiclesToday.toLocaleString()} sub="Updated in real-time" icon={<Activity className="w-5 h-5 text-emerald-400" />} />
 <StatCard title="Active Alerts" value={activeAlertsCount.toString()} sub={`${highPriorityCount} High priority`} icon={<AlertTriangle className="w-5 h-5 text-amber-400" />} />
 <StatCard title="Traffic Zones" value="18" sub="All sectors online" icon={<MapPin className="w-5 h-5 text-purple-400" />} />
 </div>

 </main>
 </div>
 );
}

// Sub-components
function StatCard({ title, value, sub, icon }: { title: string, value: string | number, sub: string, icon: React.ReactNode }) {
 return (
 <div className="bg-slate-800 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between group hover:border-slate-700 transition-colors">
 <div className="flex justify-between items-start mb-4">
 <h3 className="text-slate-400 text-sm font-semibold">{title}</h3>
 <div className="p-2 bg-slate-800/50 rounded-lg group-hover:bg-slate-800 transition-colors">
 {icon}
 </div>
 </div>
 <div>
 <div className="text-3xl font-black text-white mb-1 tracking-tight font-mono">{value}</div>
 <div className="text-xs font-medium text-slate-500">{sub}</div>
 </div>
 </div>
 );
}
