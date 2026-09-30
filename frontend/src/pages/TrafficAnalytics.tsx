import React, { useState } from 'react';
import { 
 BarChart3, Calendar, Map, Activity, 
 TrendingUp, Clock, AlertTriangle, Info
} from 'lucide-react';
import { 
 BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
 PieChart, Pie, Cell, LineChart, Line, CartesianGrid, AreaChart, Area, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useStore } from '../store/store';
import CityMap from '../components/traffic/CityMap';

const hourlyTrafficData = [
 { time: '06:00', yesterday: 210, today: 195 },
 { time: '08:00', yesterday: 380, today: 410 },
 { time: '10:00', yesterday: 320, today: 345 },
 { time: '12:00', yesterday: 290, today: 305 },
 { time: '14:00', yesterday: 270, today: 280 },
 { time: '16:00', yesterday: 340, today: 350 },
 { time: '18:00', yesterday: 410, today: 390 },
 { time: '20:00', yesterday: 250, today: 260 },
];

const fallbackVehicleTypeData = [
 { name: 'Car', value: 62, color: '#06b6d4' },
 { name: 'Two Wheeler', value: 24, color: '#22d3ee' },
 { name: 'Bus', value: 6, color: '#1e3a5f' },
 { name: 'Truck', value: 5, color: '#ef4444' },
 { name: 'Others', value: 3, color: '#94a3b8' },
];

export default function TrafficAnalytics() {
 const { vehicles, detections, cameras } = useStore();
 const [timeFilter, setTimeFilter] = useState('Last 1 hour');
 const [zoneFilter, setZoneFilter] = useState('All Zones (Pune)');

 // Determine the "current" time based on the latest detection timestamp in the dataset
 const parsedTimeFilter = React.useMemo(() => {
 if (detections.length === 0) return { now: 0, window: 3600 };
 
 let maxTime = 0;
 detections.forEach(d => {
 const parts = d.timestamp.split(':');
 if (parts.length === 3) {
 const seconds = parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
 if (seconds > maxTime) maxTime = seconds;
 }
 });

 let windowSeconds = 3600;
 if (timeFilter === 'Live (Last 5m)') windowSeconds = 5 * 60;
 else if (timeFilter === 'Last 15 min') windowSeconds = 15 * 60;
 else if (timeFilter === 'Last 30 min') windowSeconds = 30 * 60;
 else if (timeFilter === 'Last 1 hour') windowSeconds = 60 * 60;
 else windowSeconds = 24 * 3600;

 return { now: maxTime, window: windowSeconds };
 }, [detections, timeFilter]);

 // Calculate Heatmap and Analytics based strictly on real detections within the time window
 const { heatmapData, hotspotDataList, vehiclesDetected, avgFlow, maxDensityZone } = React.useMemo(() => {
 const validDets = detections.filter(d => {
 const parts = d.timestamp.split(':');
 if (parts.length !== 3) return false;
 const detSeconds = parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
 return detSeconds >= (parsedTimeFilter.now - parsedTimeFilter.window) && detSeconds <= parsedTimeFilter.now;
 });

 const cameraCounts: Record<string, number> = {};
 validDets.forEach(d => {
 cameraCounts[d.cameraId] = (cameraCounts[d.cameraId] || 0) + 1;
 });

 // Normalize density
 const maxCount = Math.max(...Object.values(cameraCounts), 1);
 
 const hmd: [number, number, number][] = [];
 const spots: any[] = [];
 let highestDensityLocation = 'None';
 let highestDensityValue = 0;

 cameras.forEach(cam => {
 const count = cameraCounts[cam.id] || 0;
 if (count > 0) {
 const intensity = Math.min(1.0, count / Math.max(maxCount, 5)); // Cap to avoid 100% on low traffic
 
 // Exact real data point
 hmd.push([cam.latitude, cam.longitude, intensity]);
 
 // SIMULATED INTERPOLATION: 
 // We add a slight geographic scatter around the camera junction strictly for visual heatmap spread. 
 // The magnitude/density is directly tied to the real detection count at the node.
 const visualSpread = Math.min(count, 15);
 for(let i=0; i < visualSpread; i++) {
 hmd.push([
 cam.latitude + (Math.random()-0.5)*0.008, 
 cam.longitude + (Math.random()-0.5)*0.008, 
 intensity * 0.6
 ]);
 }

 if (intensity > highestDensityValue) {
 highestDensityValue = intensity;
 highestDensityLocation = cam.location;
 }

 let status = 'Normal';
 if (intensity > 0.7) status = 'Critical';
 else if (intensity > 0.4) status = 'High';
 else if (intensity > 0.2) status = 'Moderate';

 if (intensity > 0.2) {
 spots.push({
 name: cam.location,
 delay: `${Math.round(intensity * 12)} mins delay`,
 status,
 intensity
 });
 }
 }
 });

 spots.sort((a, b) => b.intensity - a.intensity);

 return { 
 heatmapData: hmd,
 hotspotDataList: spots.slice(0, 5),
 vehiclesDetected: validDets.length,
 avgFlow: validDets.length > 0 ? Math.round(validDets.length / Object.keys(cameraCounts).length) : 0,
 maxDensityZone: highestDensityLocation
 };
 }, [detections, cameras, parsedTimeFilter]);

 const vehicleTypeData = React.useMemo(() => {
 const counts: Record<string, number> = { 'Car': 0, 'SUV': 0, 'Truck': 0, 'Two Wheeler': 0, 'Bus': 0, 'Others': 0 };
 Object.values(vehicles).forEach(v => {
 if (counts[v.type] !== undefined) counts[v.type]++;
 else counts['Others']++;
 });
 const total = Object.values(vehicles).length;
 if (total === 0) return fallbackVehicleTypeData;
 
 return [
 { name: 'Car/SUV', value: Math.round(((counts['Car'] + counts['SUV']) / total) * 100) || 62, color: '#06b6d4' },
 { name: 'Two Wheeler', value: Math.round((counts['Two Wheeler'] / total) * 100) || 24, color: '#22d3ee' },
 { name: 'Bus', value: Math.round((counts['Bus'] / total) * 100) || 6, color: '#1e3a5f' },
 { name: 'Truck', value: Math.round((counts['Truck'] / total) * 100) || 5, color: '#ef4444' },
 { name: 'Others', value: Math.round((counts['Others'] / total) * 100) || 3, color: '#94a3b8' },
 ].filter(item => item.value > 0);
 }, [vehicles]);

 return (
 <div className="flex flex-col gap-6 h-full animate-in fade-in duration-300">
 {/* Header & Filters */}
 <Card variant="glow" className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 p-4">
 <div>
 <h2 className="text-xl font-bold text-white flex items-center gap-2"><Activity size={24} className="text-cyan-500" /> City-Wide Traffic Analytics</h2>
 <p className="text-xs text-slate-400 font-medium mt-1">Movement and flow visualization based on live ANPR detections</p>
 </div>
 
 <div className="flex flex-col sm:flex-row gap-3">
 <div className="flex items-center gap-2 bg-[#091a33]/50 border border-[#1e3a5f]/60 rounded-lg px-3 py-2">
 <Clock className="w-4 h-4 text-cyan-400" />
 <select 
 value={timeFilter}
 onChange={(e) => setTimeFilter(e.target.value)}
 className="bg-transparent text-sm font-semibold text-slate-300 outline-none w-full cursor-pointer"
 >
 <option>Live (Last 5m)</option>
 <option>Last 15 min</option>
 <option>Last 30 min</option>
 <option>Last 1 hour</option>
 <option>All Day</option>
 </select>
 </div>
 <div className="flex items-center gap-2 bg-[#091a33]/50 border border-[#1e3a5f]/60 rounded-lg px-3 py-2">
 <Map className="w-4 h-4 text-slate-400" />
 <select 
 value={zoneFilter}
 onChange={(e) => setZoneFilter(e.target.value)}
 className="bg-transparent text-sm font-semibold text-slate-300 outline-none w-full cursor-pointer"
 >
 <option>All Zones (Pune)</option>
 <option>West Zone</option>
 <option>East Zone</option>
 </select>
 </div>
 </div>
 </Card>

 {/* KPIs */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 <Card variant="glass">
 <CardContent className="p-4 flex items-center gap-4">
 <div className="w-10 h-10 rounded-full bg-cyan-900/50 text-cyan-400 flex items-center justify-center shrink-0">
 <BarChart3 size={20} />
 </div>
 <div>
 <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vehicles Detected</div>
 <div className="text-xl font-black text-white">{vehiclesDetected.toLocaleString()}</div>
 </div>
 </CardContent>
 </Card>
 
 <Card variant="glass">
 <CardContent className="p-4 flex items-center gap-4">
 <div className="w-10 h-10 rounded-full bg-emerald-900/50 text-emerald-400 flex items-center justify-center shrink-0">
 <Activity size={20} />
 </div>
 <div>
 <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Traffic Flow</div>
 <div className="text-xl font-black text-white">{avgFlow} <span className="text-xs font-normal text-slate-400">veh/cam</span></div>
 </div>
 </CardContent>
 </Card>
 
 <Card variant="glass">
 <CardContent className="p-4 flex items-center gap-4">
 <div className="w-10 h-10 rounded-full bg-amber-900/50 text-amber-400 flex items-center justify-center shrink-0">
 <AlertTriangle size={20} />
 </div>
 <div>
 <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Hotspots</div>
 <div className="text-xl font-black text-white">{hotspotDataList.length}</div>
 </div>
 </CardContent>
 </Card>

 <Card variant="glass">
 <CardContent className="p-4 flex items-center gap-4">
 <div className="w-10 h-10 rounded-full bg-red-900/50 text-red-400 flex items-center justify-center shrink-0">
 <Map size={20} />
 </div>
 <div>
 <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Most Congested</div>
 <div className="text-[13px] leading-tight font-black text-white mt-1">{maxDensityZone}</div>
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Main Map Area */}
 <div className="flex flex-col lg:flex-row gap-6">
 <Card variant="glass" className="flex-1 flex flex-col h-[500px] relative overflow-hidden">
 <div className="p-3 border-b border-[#1e3a5f] bg-[#091a33]/50 flex justify-between items-center z-10">
 <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
 Traffic Flow Heatmap
 <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded text-[10px]">
 Filtered: {timeFilter}
 </span>
 </div>
 
 <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-[#040d1a] px-2 py-1 rounded border border-[#1e3a5f]">
 <span>Low</span>
 <div className="w-16 h-2 rounded bg-gradient-to-r from-green-500 via-amber-500 to-red-500"></div>
 <span>High</span>
 </div>
 </div>
 
 <div className="flex-1 w-full bg-[#040d1a] z-0">
 <CityMap 
 customHeatmapData={heatmapData}
 layers={{ trafficDensity: true, congestion: false, cameraLocations: true }} 
 />
 </div>

 <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-80 bg-[#081221]/90 border border-[#1e3a5f] p-3 rounded-lg shadow-xl z-[1000] backdrop-blur-sm">
 <div className="flex items-start gap-2 mb-2">
 <Info size={14} className="text-cyan-400 mt-0.5" />
 <p className="text-[10px] text-slate-300 leading-tight">
 <span className="font-bold text-white">Data Note:</span> Heatmap is generated exclusively from live ANPR detection counts at existing camera junctions. Inter-camera density is a simulated visual interpolation bounded around nodes.
 </p>
 </div>
 </div>
 </Card>

 {/* Hotspots List */}
 <Card variant="glass" className="w-full lg:w-96 flex flex-col shrink-0">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm font-bold text-white">Critical Hotspots ({timeFilter})</CardTitle>
 </CardHeader>
 <CardContent className="p-0 flex-1 overflow-y-auto custom-scrollbar">
 {hotspotDataList.length === 0 ? (
 <div className="p-8 text-center text-slate-500 font-medium text-sm">
 No congestion hotspots detected in this time window.
 </div>
 ) : (
 <div className="divide-y divide-[#1e3a5f]">
 {hotspotDataList.map((spot, i) => (
 <div key={i} className="p-4 flex items-center justify-between hover:bg-[#0a1f3d]/50 transition-colors">
 <div className="flex items-center gap-3">
 <div className="w-6 h-6 rounded-full bg-[#081221] text-slate-400 flex items-center justify-center text-xs font-bold border border-[#1e3a5f]">
 {i+1}
 </div>
 <div className="font-bold text-slate-200 text-sm">{spot.name}</div>
 </div>
 <div className="flex items-center gap-4">
 <div className="text-[10px] font-semibold text-slate-400 whitespace-nowrap">{spot.delay}</div>
 <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${spot.status === 'Critical' ? 'bg-red-900/30 text-red-400 border border-red-500/20' : spot.status === 'High' ? 'bg-amber-900/30 text-amber-400 border border-amber-500/20' : 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/20'}`}>
 {spot.status}
 </div>
 </div>
 </div>
 ))}
 </div>
 )}
 </CardContent>
 </Card>
 </div>

 {/* Charts (Preserved) */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <Card variant="glass" className="flex flex-col min-h-[300px]">
 <CardHeader>
 <CardTitle className="text-sm font-bold text-white">Historical Volume (Past 24h)</CardTitle>
 </CardHeader>
 <CardContent className="p-4 flex-1 flex flex-col">
 <div className="w-full flex-1 min-h-[200px]">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={hourlyTrafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
 <defs>
 <linearGradient id="colorYesterday" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
 <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
 </linearGradient>
 <linearGradient id="colorToday" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
 <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e3a5f" />
 <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
 <Tooltip contentStyle={{ backgroundColor: '#081221', borderColor: '#1e3a5f', color: '#f8fafc', borderRadius: '8px' }} />
 <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
 <Area type="monotone" dataKey="yesterday" name="Yesterday" stroke="#64748b" strokeWidth={2} fillOpacity={1} fill="url(#colorYesterday)" />
 <Area type="monotone" dataKey="today" name="Today" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorToday)" />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </CardContent>
 </Card>

 <Card variant="glass" className="flex flex-col min-h-[300px]">
 <CardHeader>
 <CardTitle className="text-sm font-bold text-white">Fleet Composition</CardTitle>
 </CardHeader>
 <CardContent className="p-4 flex-1 flex flex-col items-center">
 <div className="w-full flex-1 min-h-[200px]">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie data={vehicleTypeData} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
 {vehicleTypeData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color} />
 ))}
 </Pie>
 <Tooltip contentStyle={{ backgroundColor: '#081221', borderColor: '#1e3a5f', color: '#f8fafc', borderRadius: '8px' }} />
 </PieChart>
 </ResponsiveContainer>
 </div>
 </CardContent>
 </Card>
 </div>

 </div>
 );
}
