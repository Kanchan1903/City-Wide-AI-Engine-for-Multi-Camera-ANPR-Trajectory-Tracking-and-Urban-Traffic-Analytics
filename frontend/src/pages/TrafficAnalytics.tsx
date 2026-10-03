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

 const getCameraZone = React.useCallback((cameraId: string) => {
   const cam = cameras.find(c => c.id === cameraId);
   if (!cam) return 'Unknown';
   return cam.longitude > 73.85 ? 'East Zone' : 'West Zone';
 }, [cameras]);

 // Filter detections by time AND zone
 const validDets = React.useMemo(() => {
   return detections.filter(d => {
     // 1. Time Filter
     const parts = d.timestamp.split(':');
     if (parts.length !== 3) return false;
     const detSeconds = parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
     const inTimeWindow = detSeconds >= (parsedTimeFilter.now - parsedTimeFilter.window) && detSeconds <= parsedTimeFilter.now;
     
     if (!inTimeWindow) return false;

     // 2. Zone Filter
     if (zoneFilter !== 'All Zones (Pune)') {
       const zone = getCameraZone(d.cameraId);
       if (zone !== zoneFilter) return false;
     }

     return true;
   });
 }, [detections, parsedTimeFilter, zoneFilter, getCameraZone]);

 // Calculate Heatmap and Analytics based strictly on real detections
 const { heatmapData, hotspotDataList, vehiclesDetected, avgFlow, maxDensityZone } = React.useMemo(() => {
   const cameraCounts: Record<string, number> = {};
   validDets.forEach(d => {
     cameraCounts[d.cameraId] = (cameraCounts[d.cameraId] || 0) + 1;
   });

   const hmd: [number, number, number][] = [];
   const spots: any[] = [];
   let highestDensityLocation = 'No congestion detected';
   let highestDensityValue = 0;

   // Threshold based on raw counts
   const CONGESTION_THRESHOLD = 3;

   cameras.forEach(cam => {
     if (zoneFilter !== 'All Zones (Pune)' && getCameraZone(cam.id) !== zoneFilter) return;

     const count = cameraCounts[cam.id] || 0;
     if (count > 0) {
       const intensity = Math.min(1.0, count / 5);
       
       // Exact real data point only
       hmd.push([cam.latitude, cam.longitude, intensity]);

       let status = 'Normal';
       if (count >= CONGESTION_THRESHOLD) {
         if (intensity > 0.8) status = 'Critical';
         else status = 'High';
         
         spots.push({
           name: cam.location,
           delay: `${count * 2} mins delay`,
           status,
           intensity
         });

         if (intensity > highestDensityValue) {
           highestDensityValue = intensity;
           highestDensityLocation = cam.location;
         }
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
 }, [validDets, cameras, zoneFilter, getCameraZone]);

 const vehicleTypeData = React.useMemo(() => {
   const counts: Record<string, number> = { 'Car': 0, 'SUV': 0, 'Truck': 0, 'Two Wheeler': 0, 'Bus': 0, 'Others': 0 };
   validDets.forEach(d => {
     const v = vehicles[d.vehicleId] || Object.values(vehicles).find(veh => veh.plate === d.plate);
     if (v && counts[v.type] !== undefined) {
       counts[v.type]++;
     } else {
       counts['Others']++;
     }
   });
   
   return [
     { name: 'Car', value: counts['Car'] + counts['SUV'], color: '#06b6d4' },
     { name: 'Motorcycle', value: counts['Two Wheeler'], color: '#22d3ee' },
     { name: 'Bus', value: counts['Bus'], color: '#1e3a5f' },
     { name: 'Truck', value: counts['Truck'], color: '#ef4444' },
     { name: 'Others', value: counts['Others'], color: '#94a3b8' },
   ].filter(item => item.value > 0);
 }, [validDets, vehicles]);

 const historicalVolumeData = React.useMemo(() => {
   const hourlyCounts = new Array(24).fill(0);
   
   const zoneFilteredDets = detections.filter(d => {
     if (zoneFilter !== 'All Zones (Pune)' && getCameraZone(d.cameraId) !== zoneFilter) return false;
     return true;
   });

   zoneFilteredDets.forEach(d => {
     const parts = d.timestamp.split(':');
     if (parts.length > 0) {
       const hour = parseInt(parts[0], 10);
       if (hour >= 0 && hour < 24) {
         hourlyCounts[hour]++;
       }
     }
   });

   const data = [];
   for (let i = 0; i < 24; i++) {
     if (i % 2 === 0 || hourlyCounts[i] > 0) {
       data.push({
         time: `${i.toString().padStart(2, '0')}:00`,
         today: hourlyCounts[i]
       });
     }
   }
   return data;
 }, [detections, zoneFilter, getCameraZone]);

 const CustomTooltip = ({ active, payload, label }: any) => {
   if (active && payload && payload.length) {
     return (
       <div className="bg-[#081221] border border-[#1e3a5f] p-3 rounded-lg shadow-xl">
         <p className="text-white font-bold text-sm mb-1">{`${payload[0].payload.name}`}</p>
         <p className="text-cyan-400 font-bold text-xs">{`${payload[0].value} Detected`}</p>
       </div>
     );
   }
   return null;
 };

 const renderCustomLegend = (props: any) => {
   const { payload } = props;
   return (
     <div className="flex flex-col gap-2 justify-center">
       {payload.map((entry: any, index: number) => (
         <div key={`item-${index}`} className="flex items-center justify-between w-32">
           <div className="flex items-center gap-2">
             <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
             <span className="text-slate-300 font-bold text-sm">{entry.value}</span>
           </div>
           <span className="text-white font-bold text-sm">{entry.payload.value}</span>
         </div>
       ))}
     </div>
   );
 };

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
 <span className="font-bold text-white">Data Note:</span> Heatmap is generated exclusively from live ANPR detection counts.
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
 <div className="p-8 text-center text-slate-500 font-medium text-sm h-full flex flex-col items-center justify-center">
 <AlertTriangle size={32} className="text-slate-600 mb-3" />
 No congestion hotspots detected in this time window.
 </div>
 ) : (
 <div className="divide-y divide-[#1e3a5f]">
 {hotspotDataList.map((spot: any, i: number) => (
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
 {historicalVolumeData.every(d => d.today === 0) ? (
   <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-500 font-medium text-sm h-[200px]">
     <BarChart3 size={32} className="text-slate-600 mb-3" />
     No historical data available for selected zone.
   </div>
 ) : (
 <div className="w-full flex-1 min-h-[200px]">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={historicalVolumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
 <defs>
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
 <Area type="linear" dataKey="today" name="Today" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorToday)" />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 )}
 </CardContent>
 </Card>

 <Card variant="glass" className="flex flex-col min-h-[300px]">
 <CardHeader>
 <CardTitle className="text-sm font-bold text-white">Fleet Composition</CardTitle>
 </CardHeader>
 <CardContent className="p-4 flex-1 flex flex-col items-center justify-center">
 {vehicleTypeData.length === 0 ? (
   <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-500 font-medium text-sm">
     <AlertTriangle size={32} className="text-slate-600 mb-3" />
     No data available for this time period.
   </div>
 ) : (
 <div className="w-full flex-1 min-h-[200px] flex items-center justify-center gap-8">
 <div className="w-[160px] h-[160px]">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie data={vehicleTypeData} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none" cx="50%" cy="50%">
 {vehicleTypeData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color} />
 ))}
 </Pie>
 <Tooltip content={<CustomTooltip />} />
 </PieChart>
 </ResponsiveContainer>
 </div>
 <div>
   {renderCustomLegend({ payload: vehicleTypeData })}
 </div>
 </div>
 )}
 </CardContent>
 </Card>
 </div>

 </div>
 );
}
