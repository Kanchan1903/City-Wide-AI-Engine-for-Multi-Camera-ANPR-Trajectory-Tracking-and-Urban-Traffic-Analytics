import React, { useEffect, useState } from 'react';
import { useStore } from '../store/store';
import { 
  Car, Camera, ShieldAlert, CheckCircle, ChevronDown, 
  Activity, MoreHorizontal, Plus, Trash2, AlertCircle, FileText,
  Search, ChevronLeft, ChevronRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Area, AreaChart
} from 'recharts';

const volumeTrendDataMap = {
  DAILY: [
    { time: '00:00', inbound: 15, outbound: 10 },
    { time: '04:00', inbound: 8, outbound: 5 },
    { time: '08:00', inbound: 85, outbound: 70 },
    { time: '12:00', inbound: 65, outbound: 60 },
    { time: '16:00', inbound: 90, outbound: 85 },
    { time: '20:00', inbound: 45, outbound: 40 },
    { time: '23:59', inbound: 20, outbound: 15 },
  ],
  WEEKLY: [
    { time: 'Mon', inbound: 120, outbound: 110 },
    { time: 'Tue', inbound: 135, outbound: 125 },
    { time: 'Wed', inbound: 140, outbound: 130 },
    { time: 'Thu', inbound: 130, outbound: 120 },
    { time: 'Fri', inbound: 160, outbound: 150 },
    { time: 'Sat', inbound: 90, outbound: 85 },
    { time: 'Sun', inbound: 75, outbound: 70 },
  ],
  MONTHLY: [
    { time: 'Jan', inbound: 10, outbound: 0 },
    { time: 'Feb', inbound: 15, outbound: 8 },
    { time: 'Mar', inbound: 12, outbound: 20 },
    { time: 'Apr', inbound: 25, outbound: 15 },
    { time: 'May', inbound: 30, outbound: 28 },
    { time: 'Jun', inbound: 18, outbound: 35 },
    { time: 'Jul', inbound: 45, outbound: 25 },
    { time: 'Aug', inbound: 30, outbound: 10 },
  ],
  YEARLY: [
    { time: '2022', inbound: 300, outbound: 280 },
    { time: '2023', inbound: 450, outbound: 410 },
    { time: '2024', inbound: 520, outbound: 490 },
    { time: '2025', inbound: 610, outbound: 580 },
    { time: '2026', inbound: 700, outbound: 650 },
  ]
};

const vehicleTypeData = [
  { name: 'Cars', value: 65, color: '#06b6d4' },
  { name: 'Bikes', value: 20, color: '#14b8a6' },
  { name: 'Buses', value: 10, color: '#3b82f6' },
  { name: 'Trucks', value: 5, color: '#6366f1' },
];

const getTimeAgo = (ts: number) => {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 60) return `${mins} Mins Ago`;
  if (mins < 120) return `1 hour ago`;
  return `${Math.floor(mins/60)} hours ago`;
};

export default function DashboardView() {
  const { stats, alerts, cameras, detections, vehicles, closeVehicleDrawer } = useStore();
  const [activeTab, setActiveTab] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'>('MONTHLY');

  useEffect(() => {
    closeVehicleDrawer();
    return () => closeVehicleDrawer();
  }, [closeVehicleDrawer]);

  const activeAlertsCount = alerts.filter(a => !a.read).length;

  return (
    <div className="flex flex-col gap-8 h-full pb-8 max-w-[1600px] mx-auto animate-in fade-in duration-300 font-sans text-slate-300">
      
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white tracking-tight">TRACE360 Dashboard</h1>
        
        <div className="flex items-center gap-4">
          <button className="flex items-center justify-between bg-[#091a33] border border-[#1e3a5f] rounded-lg px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-[#0a1f3d] transition-colors min-w-[140px] shadow-sm">
            <span>20-09-2026</span>
            <ChevronDown size={16} className="text-slate-500" />
          </button>
          <button className="flex items-center justify-between bg-[#091a33] border border-[#1e3a5f] rounded-lg px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-[#0a1f3d] transition-colors min-w-[140px] shadow-sm">
            <span>30-09-2026</span>
            <ChevronDown size={16} className="text-slate-500" />
          </button>
        </div>
      </div>

      {/* 4 Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1 - Vehicles Detected */}
        <div className="bg-[#081221] border border-[#1e3a5f]/60 rounded-2xl p-6 text-white shadow-lg flex items-center gap-6 relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
          <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <Car size={28} className="text-cyan-400" />
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-white">{stats.vehiclesToday.toLocaleString()}</div>
            <div className="text-sm font-medium text-slate-400 mt-1">Vehicles Detected</div>
          </div>
        </div>

        {/* Card 2 - Plates Recognized */}
        <div className="bg-[#081221] border border-[#1e3a5f]/60 rounded-2xl p-6 text-white shadow-lg flex items-center gap-6 relative overflow-hidden group hover:border-teal-500/30 transition-colors">
          <div className="w-16 h-16 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
            <CheckCircle size={28} className="text-teal-400" />
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-white">{stats.totalScans.toLocaleString()}</div>
            <div className="text-sm font-medium text-slate-400 mt-1">Plates Recognized</div>
          </div>
        </div>

        {/* Card 3 - Active Cameras */}
        <div className="bg-[#081221] border border-[#1e3a5f]/60 rounded-2xl p-6 text-white shadow-lg flex items-center gap-6 relative overflow-hidden group hover:border-blue-500/30 transition-colors">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Camera size={28} className="text-blue-400" />
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-white">{cameras.filter(c => c.status === 'online').length}</div>
            <div className="text-sm font-medium text-slate-400 mt-1">Active Cameras</div>
          </div>
        </div>

        {/* Card 4 - Alerts */}
        <div className="bg-[#081221] border border-[#1e3a5f]/60 rounded-2xl p-6 text-white shadow-lg flex items-center gap-6 relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
          <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <ShieldAlert size={28} className="text-indigo-400" />
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-white">{activeAlertsCount}</div>
            <div className="text-sm font-medium text-slate-400 mt-1">Active Alerts</div>
          </div>
        </div>

      </div>

      {/* Middle Row: Graph and Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-6">
        
        {/* Main Chart */}
        <div className="bg-[#081221] border border-[#1e3a5f]/60 rounded-[20px] shadow-lg p-6 md:p-8 flex flex-col h-full">
          
          <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Vehicle Activity</h2>
              <p className="text-sm font-medium text-slate-400 mt-1">Overview of latest Month</p>
              
              <div className="mt-6">
                <div className="text-3xl font-extrabold text-white tracking-tight">45,862</div>
                <p className="text-sm font-medium text-slate-400 mt-1">Total Scans this Month</p>
              </div>
              <div className="mt-4">
                <div className="text-xl font-bold text-white tracking-tight">82%</div>
                <p className="text-sm font-medium text-slate-400 mt-1">ANPR Confidence Avg</p>
              </div>
              
            </div>
            
            <div className="flex flex-col flex-1 max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-6 text-xs font-bold text-slate-500">
                  {(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'] as const).map(tab => (
                    <span 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`cursor-pointer transition-colors ${activeTab === tab ? 'text-cyan-400 border-b-2 border-cyan-400 pb-1' : 'hover:text-white'}`}
                    >
                      {tab}
                    </span>
                  ))}
                </div>
                <div className="flex gap-4 text-xs font-bold text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                    Inbound
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                    Outbound
                  </div>
                </div>
              </div>
              
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={volumeTrendDataMap[activeTab]} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e3a5f" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #1e3a5f', backgroundColor: '#091a33', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }} />
                    <Area type="monotone" dataKey="inbound" stroke="#22d3ee" strokeWidth={3} fillOpacity={1} fill="url(#colorInbound)" />
                    <Area type="monotone" dataKey="outbound" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorOutbound)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="border-t border-[#1e3a5f] pt-6 mt-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 divide-x divide-[#1e3a5f]">
              
              <div className="flex items-center gap-4 px-2">
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0">
                  <Activity size={18} className="text-cyan-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 mb-0.5">Peak Traffic Time</div>
                  <div className="text-sm font-extrabold text-white">18:30 PM</div>
                </div>
              </div>

              <div className="flex items-center gap-4 px-2 md:px-6">
                <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center shrink-0">
                  <Activity size={18} className="text-teal-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 mb-0.5">Avg Speed</div>
                  <div className="text-sm font-extrabold text-white">42 km/h</div>
                </div>
              </div>

              <div className="flex items-center gap-4 px-2 md:px-6">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <AlertCircle size={18} className="text-indigo-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 mb-0.5">Wanted Vehicles</div>
                  <div className="text-sm font-extrabold text-white">3 Detected</div>
                </div>
              </div>

              <div className="flex items-center gap-4 px-2 md:px-6">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <CheckCircle size={18} className="text-blue-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 mb-0.5">Total Scans</div>
                  <div className="text-sm font-extrabold text-white">128,567</div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Analytics Donut */}
        <div className="bg-[#081221] border border-[#1e3a5f]/60 rounded-[20px] shadow-lg p-6 md:p-8 flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white">Vehicle Distribution</h2>
            <button className="text-slate-500 hover:text-cyan-400"><MoreHorizontal size={20} /></button>
          </div>
          
          <div className="relative w-full h-[250px] flex items-center justify-center flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={vehicleTypeData} 
                  innerRadius={75} 
                  outerRadius={100} 
                  paddingAngle={5} 
                  dataKey="value" 
                  stroke="none"
                  cornerRadius={10}
                >
                  {vehicleTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #1e3a5f', backgroundColor: '#091a33', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-3xl font-extrabold text-white tracking-tight">85%</div>
              <div className="text-xs font-semibold text-slate-400 mt-1">Cars & Bikes</div>
            </div>
          </div>

          <div className="w-full mt-6">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
              {vehicleTypeData.map((v) => (
                <div key={v.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-md" style={{backgroundColor: v.color}}></div>
                  <span className="text-xs font-bold text-slate-400">{v.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-[30fr_70fr] gap-6">
        
        {/* Recent Detections List */}
        <div className="bg-[#081221] border border-[#1e3a5f]/60 rounded-[20px] shadow-lg p-6 md:p-8">
          <h2 className="text-sm font-bold text-white mb-8">Recent Detections</h2>
          
          <div className="flex flex-col gap-8">
            {alerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex items-start gap-4">
                <div className="text-xs font-bold text-slate-500 w-[70px] pt-1">{getTimeAgo(alert.timestamp)}</div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                  alert.type === 'error' ? 'bg-red-500/10 border-red-500/20' : 
                  alert.type === 'warning' ? 'bg-cyan-500/10 border-cyan-500/20' : 
                  'bg-indigo-500/10 border-indigo-500/20'
                }`}>
                  {alert.type === 'error' ? <AlertCircle size={18} className="text-red-400" /> :
                   alert.type === 'warning' ? <Car size={18} className="text-cyan-400" /> :
                   <FileText size={18} className="text-indigo-400" />}
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{alert.title}</div>
                  <div className="text-xs font-medium text-slate-400 mt-1">{alert.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detected Vehicles Table */}
        <div className="bg-[#081221] border border-[#1e3a5f]/60 rounded-[20px] shadow-lg p-6 md:p-8 flex flex-col">
          <h2 className="text-sm font-bold text-white mb-1">Detected Vehicles</h2>
          <p className="text-xs font-medium text-slate-400 mb-6">Overview of latest hour</p>
          
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <button className="bg-cyan-600 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm hover:bg-cyan-500 transition-colors">
                <Plus size={14} /> Add
              </button>
              <button className="bg-[#091a33] border border-[#1e3a5f] text-slate-400 px-3 py-2 rounded-lg hover:bg-[#0a1f3d] hover:text-cyan-400 transition-colors">
                <Trash2 size={14} />
              </button>
              <button className="bg-[#091a33] border border-[#1e3a5f] text-slate-400 px-3 py-2 rounded-lg hover:bg-[#0a1f3d] hover:text-cyan-400 transition-colors">
                <AlertCircle size={14} />
              </button>
              <button className="bg-[#091a33] border border-[#1e3a5f] text-slate-400 px-3 py-2 rounded-lg hover:bg-[#0a1f3d] hover:text-cyan-400 transition-colors">
                <FileText size={14} />
              </button>
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="bg-[#091a33] border border-[#1e3a5f] rounded-lg pl-4 pr-10 py-2 text-xs font-bold text-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none w-[200px] placeholder:text-slate-500" 
                />
                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
              </div>
              <button className="bg-[#091a33] border border-[#1e3a5f] text-slate-400 px-3 py-2 rounded-lg hover:bg-[#0a1f3d] hover:text-cyan-400 transition-colors">
                <FileText size={14} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left">
              <thead>
                <tr className="border-b border-[#1e3a5f]">
                  <th className="pb-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[20%]">PLATE NUMBER</th>
                  <th className="pb-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[25%]">CAMERA ID</th>
                  <th className="pb-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[20%]">TIME</th>
                  <th className="pb-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[20%]">VEHICLE TYPE</th>
                  <th className="pb-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[15%]">STATUS</th>
                </tr>
              </thead>
              <tbody className="text-sm font-bold text-slate-300">
                <tr>
                  <td className="py-4 text-white">MH12AB1234</td>
                  <td className="py-4 text-slate-400 font-medium">CAM_001 (Main Gate)</td>
                  <td className="py-4 text-slate-400 font-medium">10:45 AM</td>
                  <td className="py-4">SUV (White)</td>
                  <td className="py-4">
                    <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">Flagged</span>
                  </td>
                </tr>
                <tr className="border-t border-[#1e3a5f]/50">
                  <td className="py-4 text-white">DL8CA8989</td>
                  <td className="py-4 text-slate-400 font-medium">CAM_042 (Highway)</td>
                  <td className="py-4 text-slate-400 font-medium">10:42 AM</td>
                  <td className="py-4">Sedan (Black)</td>
                  <td className="py-4">
                    <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">Process</span>
                  </td>
                </tr>
                <tr className="border-t border-[#1e3a5f]/50">
                  <td className="py-4 text-white">KA01HQ4567</td>
                  <td className="py-4 text-slate-400 font-medium">CAM_015 (Intersection)</td>
                  <td className="py-4 text-slate-400 font-medium">10:38 AM</td>
                  <td className="py-4">Truck (Blue)</td>
                  <td className="py-4">
                    <span className="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">Clear</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-[#1e3a5f]">
            <span className="text-xs font-bold text-slate-500">Showing 1 to 3 of 50 entries</span>
            <div className="flex gap-1 items-center">
              <button className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-cyan-400"><ChevronLeft size={14} /></button>
              <button className="w-6 h-6 flex items-center justify-center text-xs font-bold text-slate-400 hover:text-cyan-400">1</button>
              <button className="w-6 h-6 flex items-center justify-center text-xs font-bold text-white bg-cyan-600 rounded-full shadow-sm">2</button>
              <button className="w-6 h-6 flex items-center justify-center text-xs font-bold text-slate-400 hover:text-cyan-400">3</button>
              <span className="text-slate-600 text-xs tracking-widest">...</span>
              <button className="w-6 h-6 flex items-center justify-center text-xs font-bold text-slate-400 hover:text-cyan-400">10</button>
              <button className="w-6 h-6 flex items-center justify-center text-slate-500 hover:text-cyan-400"><ChevronRight size={14} /></button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
