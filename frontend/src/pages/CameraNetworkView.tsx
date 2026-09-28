import React, { useState } from 'react';
import { useStore } from '../store/store';
import { Video, Search, MapPin, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Card, CardHeader, CardContent } from '../components/ui/Card';

export default function CameraNetworkView() {
 const { cameras, openCameraModal } = useStore();
 const [filter, setFilter] = useState('All');
 const [search, setSearch] = useState('');

 const filters = ['All', 'Online', 'Offline', 'High Traffic', 'Alert'];

 const filteredCameras = cameras.filter(c => {
 if (search && !c.id.toLowerCase().includes(search.toLowerCase()) && !c.location.toLowerCase().includes(search.toLowerCase())) return false;
 if (filter === 'Online' && c.status !== 'online') return false;
 if (filter === 'Offline' && c.status !== 'offline') return false;
 if (filter === 'High Traffic' && c.status !== 'online') return false; // Mock
 if (filter === 'Alert' && c.status !== 'online') return false; // Mock
 return true;
 });

 return (
 <div className="flex flex-col gap-6 h-full animate-in fade-in duration-300">
 <Card variant="glow" className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 shrink-0">
 <div>
 <h2 className="text-2xl font-bold text-white">Live Camera Monitoring</h2>
 <p className="text-sm text-slate-400 font-medium mt-1">Real-time CCTV feeds and traffic analysis</p>
 </div>
 
 <div className="flex flex-col sm:flex-row gap-3">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
 <input 
 type="text" 
 placeholder="Search cameras..." 
 value={search}
 onChange={e => setSearch(e.target.value)}
 className="pl-9 pr-4 py-2 border border-slate-800 rounded-lg text-sm w-full sm:w-64 focus:border-blue-500 focus:ring-1 focus:ring-[#1769FF] outline-none"
 />
 </div>
 <div className="flex bg-slate-900 rounded-lg p-1">
 {filters.map(f => (
 <button 
 key={f}
 onClick={() => setFilter(f)}
 className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${filter === f ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-300'}`}
 >
 {f}
 </button>
 ))}
 </div>
 </div>
 </Card>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6">
 {filteredCameras.map((cam, i) => (
 <Card 
 variant="glass"
 key={cam.id} 
 className="overflow-hidden hover:border-blue-500/50 transition-all group flex flex-col"
 >
 {/* Header */}
 <div className="p-4 border-b border-slate-800 flex justify-between items-start">
 <div>
 <div className="font-bold text-white text-sm flex items-center gap-2">
 {cam.id}
 {cam.status === 'online' ? (
 <Badge variant="success" className="text-[10px] px-1.5 py-0 shadow-sm">LIVE</Badge>
 ) : (
 <Badge variant="danger" className="text-[10px] px-1.5 py-0 shadow-sm">OFFLINE</Badge>
 )}
 </div>
 <div className="text-xs text-slate-400 mt-1 flex items-center">
 <MapPin className="w-3 h-3 mr-1 text-slate-400" /> {cam.location}
 </div>
 </div>
 </div>
 
 {/* Feed area */}
 <div className="relative aspect-video bg-slate-900 overflow-hidden cursor-pointer" onClick={() => openCameraModal(cam.id)}>
 <img src={cam.img} alt={cam.id} className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${cam.status === 'offline' ? 'opacity-20 grayscale' : 'opacity-80'}`} />
 
 {/* Overlay button */}
 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
 <button className="bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all">
 <Video size={14} /> View Live
 </button>
 </div>

 {cam.status === 'online' && (
 <div className="absolute top-2 left-2 flex items-center gap-2">
 <span className="flex h-2 w-2 relative">
 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
 <span className="relative inline-flex rounded-full h-2 w-2 bg-red-900/300"></span>
 </span>
 <span className="text-[10px] font-mono text-white/90 drop-shadow-md">REC</span>
 </div>
 )}
 </div>

 {/* Footer */}
 <div className="p-4 bg-slate-900/50/50 flex items-center justify-between mt-auto">
 <div className="flex items-center text-xs font-semibold text-slate-300">
 <Activity size={14} className="text-cyan-500 mr-1.5" />
 Vehicles: {cam.status === 'online' ? 42 + (i % 10) : 0}
 </div>
 <div className="flex items-center text-xs font-semibold text-emerald-400">
 <ShieldCheck size={14} className="mr-1.5" />
 ANPR: Active
 </div>
 </div>
 </Card>
 ))}
 </div>
 </div>
 );
}
