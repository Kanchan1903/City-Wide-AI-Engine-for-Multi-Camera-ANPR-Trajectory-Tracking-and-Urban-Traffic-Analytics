import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useStore } from '../store/store';
import CityMap from '../components/traffic/CityMap';
import { Search, Map as MapIcon, Route, Clock, Navigation } from 'lucide-react';
import { buildTrajectory } from '../utils/trajectory';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

const CITY_AREAS: Record<string, [number, number]> = {
 hinjawadi: [18.5905, 73.7389],
 shivajinagar: [18.5309, 73.8472],
 kothrud: [18.5074, 73.8077],
 viman_nagar: [18.5665, 73.9122],
 baner: [18.5590, 73.7868],
 kalyani_nagar: [18.5475, 73.9033],
 hadapsar: [18.5089, 73.9259],
 pimpri: [18.6279, 73.7997],
 koregaon_park: [18.5362, 73.8939]
};

export default function VehicleRoutes() {
 const { vehicles, detections, cameras } = useStore();
 const [searchParams] = useSearchParams();
 
 // Read plate from URL, fallback to default
 const [searchTerm, setSearchTerm] = useState(searchParams.get('plate') || 'MH12AB1234');
 const [routeProgress, setRouteProgress] = useState(100);
 const [selectedArea, setSelectedArea] = useState<string>('all');

 // If the URL changes while we are on the page, update the tracking
 useEffect(() => {
 const plate = searchParams.get('plate');
 if (plate) {
 setSearchTerm(plate);
 }
 }, [searchParams]);

 const normalizedSearch = searchTerm.trim().toUpperCase();
 const vehicle = vehicles[normalizedSearch];
 const history = vehicle || searchTerm 
 ? buildTrajectory(normalizedSearch, detections, cameras)
 : [];

 const routePath = history.map(h => {
 const cam = cameras.find(c => c.id === h.cameraId);
 return cam ? [cam.latitude, cam.longitude] as [number, number] : null;
 }).filter(Boolean) as [number, number][];

 const routeSequence = history.map(h => {
 const cam = cameras.find(c => c.id === h.cameraId);
 return cam ? { id: cam.id, lat: cam.latitude, lng: cam.longitude, time: h.timestamp, location: cam.location } : null;
 }).filter(Boolean);

 return (
 <div className="flex flex-col gap-6 h-full animate-in fade-in duration-300">
 
 {/* Header */}
 <Card variant="glow" className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 p-4">
 <div>
 <h2 className="text-xl font-bold text-white flex items-center gap-2"><MapIcon size={24} className="text-blue-400" /> GIS City Tracking</h2>
 <p className="text-xs text-slate-400 font-medium mt-1">Multi-camera trajectory reconstruction</p>
 </div>
 
 <div className="flex gap-3 relative w-full md:w-auto">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
 <input 
 type="text" 
 placeholder="Search vehicle to track..." 
 value={searchTerm}
 onChange={e => setSearchTerm(e.target.value)}
 className="pl-9 pr-4 py-2 border border-slate-800 rounded-lg text-sm w-full md:w-64 focus:border-blue-500 focus:ring-1 focus:ring-[#1769FF] outline-none uppercase font-bold text-white"
 />
 </div>
 </Card>

 <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-[500px]">
 {/* Left/Center: Map */}
 <Card variant="glass" className="flex-1 flex flex-col overflow-hidden">
 <div className="p-3 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
 <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Trajectory Map</div>
 <div className="flex gap-2 items-center">
 <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/80 rounded px-2 py-1 hidden md:flex">
 <MapIcon size={12} className="text-blue-400" />
 <select 
 value={selectedArea}
 onChange={(e) => setSelectedArea(e.target.value)}
 className="bg-transparent text-[10px] font-bold text-slate-300 outline-none cursor-pointer max-w-[120px]"
 >
 <option value="all">Search City Area</option>
 <option value="hinjawadi">Hinjawadi IT Park</option>
 <option value="shivajinagar">Shivajinagar</option>
 <option value="kothrud">Kothrud</option>
 <option value="viman_nagar">Viman Nagar</option>
 <option value="baner">Baner</option>
 <option value="kalyani_nagar">Kalyani Nagar</option>
 <option value="hadapsar">Hadapsar</option>
 <option value="pimpri">Pimpri-Chinchwad</option>
 <option value="koregaon_park">Koregaon Park</option>
 </select>
 </div>
 <Badge variant="info">Live Tracking</Badge>
 </div>
 </div>
 <div className="flex-1 relative bg-slate-900">
 <CityMap 
 layers={{ trafficDensity: false, congestion: false, cameraLocations: true }} 
 routePath={routePath}
 routeSequence={routeSequence}
 routeProgress={routeProgress}
 focusLocation={selectedArea !== 'all' ? CITY_AREAS[selectedArea] : undefined}
 />
 
 {/* Playback Slider Overlay */}
 {routePath && routePath.length > 0 && (
 <Card variant="glow" className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md p-4 z-[1000] flex flex-col gap-3">
 <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
 <span>Start</span>
 <span className="text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">Scrub Timeline</span>
 <span>End</span>
 </div>
 <input 
 type="range" 
 min="0" max="100" 
 value={routeProgress} 
 onChange={(e) => setRouteProgress(Number(e.target.value))}
 className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#1769FF]"
 />
 </Card>
 )}
 </div>
 </Card>

 {/* Right: Details & Timeline */}
 <div className="w-full lg:w-96 flex flex-col gap-6 shrink-0 overflow-y-auto custom-scrollbar">
 {vehicle ? (
 <>
 {/* Vehicle Summary */}
 <Card variant="glass" className="overflow-hidden">
 <div className="p-4 border-b border-slate-800 bg-slate-800 text-white flex justify-between items-start">
 <div>
 <div className="text-[10px] font-bold text-cyan-500 uppercase tracking-wider mb-1">Target Tracked</div>
 <div className="text-2xl font-black">{vehicle.plate}</div>
 </div>
 <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white/20">
 <img src={vehicle.img} alt="Vehicle" className="w-full h-full object-cover" />
 </div>
 </div>
 <div className="p-4 bg-slate-900/50 grid grid-cols-2 gap-4">
 <div>
 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Make/Model</div>
 <div className="text-sm font-bold text-slate-200">{vehicle.make}</div>
 </div>
 <div>
 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type / Color</div>
 <div className="text-sm font-bold text-slate-200">{vehicle.type} • {vehicle.color}</div>
 </div>
 </div>
 </Card>

 {/* Timeline */}
 <Card variant="glass" className="flex-1 p-4">
 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center">
 <Clock size={14} className="mr-2" /> Detection Timeline
 </h3>
 
 <div className="relative border-l-2 border-blue-500/20 ml-3 space-y-6">
 {history.map((det, i) => {
 const cam = cameras.find(c => c.id === det.cameraId);
 return (
 <div key={det.id} className="relative pl-6 group">
 <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm transition-colors ${i === history.length - 1 ? 'bg-blue-500' : 'bg-slate-300 group-hover:bg-cyan-500'}`}></div>
 <Card variant="glass" className="p-3 group-hover:border-blue-500/30 transition-colors shadow-none">
 <div className="flex justify-between items-start mb-1">
 <span className="font-bold text-white text-sm flex items-center">
 {cam?.id || det.cameraId} 
 {i === history.length - 1 && <span className="ml-2 text-[9px] bg-red-900/30 text-red-400 px-1 py-0.5 rounded font-black uppercase">Last Seen</span>}
 </span>
 <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{det.timestamp}</span>
 </div>
 <div className="text-xs font-medium text-slate-300 mb-2 flex flex-col gap-1">
 <div className="flex items-center"><Navigation size={10} className="mr-1 text-slate-400" /> {det.location}</div>
 <div className="flex gap-2 mt-1">
 <Badge variant="success" className="text-[9px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Conf: {(det.confidence * 100).toFixed(0)}%</Badge>
 <Badge variant="info" className="text-[9px] bg-blue-500/10 text-blue-400 border-blue-500/20">{det.direction}</Badge>
 </div>
 </div>
 </Card>
 </div>
 );
 })}
 </div>
 </Card>
 </>
 ) : (
 <Card variant="glass" className="border-dashed p-8 text-center h-full flex flex-col justify-center items-center">
 <Route className="w-12 h-12 text-slate-300 mb-4" />
 <div className="text-slate-400 font-medium">Search for a vehicle to view its trajectory history on the map.</div>
 </Card>
 )}
 </div>
 </div>
 </div>
 );
}

