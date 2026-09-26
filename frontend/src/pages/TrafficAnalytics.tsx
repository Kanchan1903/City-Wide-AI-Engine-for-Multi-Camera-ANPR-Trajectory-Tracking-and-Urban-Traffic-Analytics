import React, { useState } from 'react';
import { 
  BarChart3, Calendar, Map, Activity, 
  TrendingUp, Clock, AlertTriangle 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, AreaChart, Area, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useStore } from '../store/store';

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
  { name: 'Car', value: 62, color: '#1769FF' },
  { name: 'Two Wheeler', value: 24, color: '#00B8D9' },
  { name: 'Bus', value: 6, color: '#0B1730' },
  { name: 'Truck', value: 5, color: '#ef4444' },
  { name: 'Others', value: 3, color: '#94a3b8' },
];

const hotspotData = [
  { name: 'Shivajinagar Jct', delay: '12 mins', status: 'High' },
  { name: 'Hinjawadi Phase 1', delay: '18 mins', status: 'Critical' },
  { name: 'Kothrud Stand', delay: '5 mins', status: 'Normal' },
  { name: 'Swargate', delay: '9 mins', status: 'Moderate' },
];

export default function TrafficAnalytics() {
  const { vehicles } = useStore();

  const vehicleTypeData = React.useMemo(() => {
    const counts: Record<string, number> = { 'Car': 0, 'SUV': 0, 'Truck': 0, 'Two Wheeler': 0, 'Bus': 0, 'Others': 0 };
    Object.values(vehicles).forEach(v => {
      if (counts[v.type] !== undefined) counts[v.type]++;
      else counts['Others']++;
    });
    const total = Object.values(vehicles).length;
    if (total === 0) return fallbackVehicleTypeData;
    
    return [
      { name: 'Car/SUV', value: Math.round(((counts['Car'] + counts['SUV']) / total) * 100) || 62, color: '#1769FF' },
      { name: 'Two Wheeler', value: Math.round((counts['Two Wheeler'] / total) * 100) || 24, color: '#00B8D9' },
      { name: 'Bus', value: Math.round((counts['Bus'] / total) * 100) || 6, color: '#0B1730' },
      { name: 'Truck', value: Math.round((counts['Truck'] / total) * 100) || 5, color: '#ef4444' },
      { name: 'Others', value: Math.round((counts['Others'] / total) * 100) || 3, color: '#94a3b8' },
    ].filter(item => item.value > 0);
  }, [vehicles]);

  return (
    <div className="flex flex-col gap-6 h-full animate-in fade-in duration-300">
      {/* Header & Filters */}
      <Card variant="glow" className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 p-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><BarChart3 size={24} className="text-[#1769FF]" /> Traffic Analytics</h2>
          <p className="text-xs text-slate-400 font-medium mt-1">City-wide data visualization and trends</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800/60 rounded-lg px-3 py-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select className="bg-transparent text-sm font-semibold text-slate-300 outline-none w-full cursor-pointer">
              <option>Today</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800/60 rounded-lg px-3 py-2">
            <Map className="w-4 h-4 text-slate-400" />
            <select className="bg-transparent text-sm font-semibold text-slate-300 outline-none w-full cursor-pointer">
              <option>All Zones (Pune)</option>
              <option>West Zone</option>
              <option>East Zone</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 pb-6 overflow-y-auto custom-scrollbar">
        
        {/* KPI Row spanning full width */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="glass">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-900/50 text-blue-400 flex items-center justify-center shrink-0">
                <Activity size={24} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-400">Avg Travel Time</div>
                <div className="text-2xl font-black text-white">24.5 mins</div>
                <div className="text-xs font-semibold text-emerald-400 flex items-center mt-1"><TrendingUp size={12} className="mr-1" /> -2% vs avg</div>
              </div>
            </CardContent>
          </Card>
          
          <Card variant="glass">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-cyan-900/50 text-cyan-400 flex items-center justify-center shrink-0">
                <BarChart3 size={24} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-400">Total Volume</div>
                <div className="text-2xl font-black text-white">7,200</div>
                <div className="text-xs font-semibold text-emerald-400 flex items-center mt-1"><TrendingUp size={12} className="mr-1" /> +5% vs avg</div>
              </div>
            </CardContent>
          </Card>
          
          <Card variant="glass">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-900/50 text-amber-400 flex items-center justify-center shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-400">Congestion Level</div>
                <div className="text-2xl font-black text-white">Moderate</div>
                <div className="text-xs font-semibold text-amber-400 flex items-center mt-1"><Clock size={12} className="mr-1" /> Peak hours approaching</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Card variant="glass" className="lg:col-span-2 flex flex-col min-h-[400px]">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-white">Yesterday's Hourly Traffic Volume</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col">
            <div className="w-full flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyTrafficData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorYesterday" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorToday" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1769FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#1769FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 600 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }} />
                  <Area type="monotone" dataKey="yesterday" name="Yesterday" stroke="#94a3b8" strokeWidth={3} fillOpacity={1} fill="url(#colorYesterday)" />
                  <Area type="monotone" dataKey="today" name="Today" stroke="#1769FF" strokeWidth={3} fillOpacity={1} fill="url(#colorToday)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" className="flex flex-col min-h-[400px]">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-white">Vehicle Demographics</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col items-center">
            <div className="w-full flex-1 min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vehicleTypeData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {vehicleTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full space-y-3 mt-4 overflow-y-auto custom-scrollbar pr-1">
              {vehicleTypeData.map(item => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center font-semibold text-slate-300">
                    <div className="w-3 h-3 rounded-sm mr-3 shadow-sm" style={{ backgroundColor: item.color }}></div>
                    {item.name}
                  </div>
                  <div className="font-black text-white">{item.value}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Hotspots */}
        <Card variant="glass" className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-white">Current Road Hotspots</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-800">
              {hotspotData.map((spot, i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="font-bold text-slate-500 w-6">#{i+1}</div>
                    <div className="font-bold text-white">{spot.name}</div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-sm font-semibold text-slate-400">Delay: <span className="text-slate-200">{spot.delay}</span></div>
                    <div className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${spot.status === 'Critical' ? 'bg-red-900/30 text-red-400' : spot.status === 'High' ? 'bg-amber-900/30 text-amber-400' : 'bg-emerald-900/30 text-emerald-400'}`}>
                      {spot.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
