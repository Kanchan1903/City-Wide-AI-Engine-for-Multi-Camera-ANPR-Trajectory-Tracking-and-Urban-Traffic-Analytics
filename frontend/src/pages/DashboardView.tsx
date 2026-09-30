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

const volumeTrendData = [
  { time: 'Jan', inbound: 10, outbound: 0 },
  { time: 'Feb', inbound: 15, outbound: 8 },
  { time: 'Mar', inbound: 12, outbound: 20 },
  { time: 'Apr', inbound: 25, outbound: 15 },
  { time: 'May', inbound: 30, outbound: 28 },
  { time: 'Jun', inbound: 18, outbound: 35 },
  { time: 'Jul', inbound: 45, outbound: 25 },
  { time: 'Aug', inbound: 30, outbound: 10 },
];

const vehicleTypeData = [
  { name: 'Cars', value: 65, color: '#764AF1' },
  { name: 'Bikes', value: 20, color: '#FF9F43' },
  { name: 'Buses', value: 10, color: '#FF6B6B' },
  { name: 'Trucks', value: 5, color: '#2D7EFF' },
];

export default function DashboardView() {
  const { stats, alerts, cameras, detections, vehicles, closeVehicleDrawer } = useStore();

  useEffect(() => {
    closeVehicleDrawer();
    return () => closeVehicleDrawer();
  }, [closeVehicleDrawer]);

  const activeAlertsCount = alerts.filter(a => !a.read).length;

  return (
    <div className="flex flex-col gap-8 h-full pb-8 max-w-[1600px] mx-auto animate-in fade-in duration-300 font-sans text-slate-800">
      
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">TRACE360 Dashboard</h1>
        
        <div className="flex items-center gap-4">
          <button className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors min-w-[140px] shadow-sm">
            <span>20-09-2026</span>
            <ChevronDown size={16} className="text-slate-400" />
          </button>
          <button className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors min-w-[140px] shadow-sm">
            <span>30-09-2026</span>
            <ChevronDown size={16} className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* 4 Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1 - Vehicles Detected (Purple) */}
        <div className="bg-[#B495FF] rounded-2xl p-6 text-white shadow-[0_8px_20px_rgba(180,149,255,0.4)] flex items-center gap-6 relative overflow-hidden group">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Car size={28} className="text-white" />
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight">{stats.vehiclesToday.toLocaleString()}</div>
            <div className="text-sm font-medium text-white/80 mt-1">Vehicles Detected</div>
          </div>
          {/* Decorative element */}
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
        </div>

        {/* Card 2 - Plates Recognized (Blue) */}
        <div className="bg-[#488CFF] rounded-2xl p-6 text-white shadow-[0_8px_20px_rgba(72,140,255,0.4)] flex items-center gap-6 relative overflow-hidden group">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <CheckCircle size={28} className="text-white" />
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight">{stats.totalScans.toLocaleString()}</div>
            <div className="text-sm font-medium text-white/80 mt-1">Plates Recognized</div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
        </div>

        {/* Card 3 - Active Cameras (Red) */}
        <div className="bg-[#FF7575] rounded-2xl p-6 text-white shadow-[0_8px_20px_rgba(255,117,117,0.4)] flex items-center gap-6 relative overflow-hidden group">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <Camera size={28} className="text-white" />
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight">{cameras.filter(c => c.status === 'online').length}</div>
            <div className="text-sm font-medium text-white/80 mt-1">Active Cameras</div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
        </div>

        {/* Card 4 - Alerts (Orange) */}
        <div className="bg-[#FF9F43] rounded-2xl p-6 text-white shadow-[0_8px_20px_rgba(255,159,67,0.4)] flex items-center gap-6 relative overflow-hidden group">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <ShieldAlert size={28} className="text-white" />
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight">{activeAlertsCount}</div>
            <div className="text-sm font-medium text-white/80 mt-1">Active Alerts</div>
          </div>
          <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
        </div>

      </div>

      {/* Middle Row: Graph and Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-[65fr_35fr] gap-6">
        
        {/* Main Chart */}
        <div className="bg-white rounded-[20px] shadow-[0_2px_15px_rgba(0,0,0,0.04)] p-6 md:p-8 flex flex-col h-full">
          
          <div className="flex flex-col md:flex-row md:items-start justify-between mb-8 gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Vehicle Activity</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">Overview of latest Month</p>
              
              <div className="mt-6">
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight">45,862</div>
                <p className="text-sm font-medium text-slate-500 mt-1">Total Scans this Month</p>
              </div>
              <div className="mt-4">
                <div className="text-xl font-bold text-slate-900 tracking-tight">82%</div>
                <p className="text-sm font-medium text-slate-500 mt-1">ANPR Confidence Avg</p>
              </div>
              
              {/* Button */}
              <button className="mt-6 bg-[#764AF1] hover:bg-[#643CD8] text-white font-semibold py-3 px-6 rounded-full shadow-[0_4px_14px_rgba(118,74,241,0.3)] transition-colors text-sm">
                View Detailed Report
              </button>
            </div>
            
            <div className="flex flex-col flex-1 max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex gap-6 text-xs font-bold text-slate-400">
                  <span className="cursor-pointer hover:text-slate-800 transition-colors">DAILY</span>
                  <span className="cursor-pointer hover:text-slate-800 transition-colors">WEEKLY</span>
                  <span className="text-[#3EE1B8] border-b-2 border-[#3EE1B8] pb-1 cursor-pointer">MONTHLY</span>
                  <span className="cursor-pointer hover:text-slate-800 transition-colors">YEARLY</span>
                </div>
                <div className="flex gap-4 text-xs font-bold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#3EE1B8]"></div>
                    Inbound
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#FF9F43]"></div>
                    Outbound
                  </div>
                </div>
              </div>
              
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={volumeTrendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3EE1B8" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3EE1B8" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF9F43" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#FF9F43" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="inbound" stroke="#3EE1B8" strokeWidth={3} fillOpacity={1} fill="url(#colorInbound)" />
                    <Area type="monotone" dataKey="outbound" stroke="#FF9F43" strokeWidth={3} fillOpacity={1} fill="url(#colorOutbound)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 mt-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 divide-x divide-slate-100">
              
              <div className="flex items-center gap-4 px-2">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <Activity size={18} className="text-red-500" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 mb-0.5">Peak Traffic Time</div>
                  <div className="text-sm font-extrabold text-slate-800">18:30 PM</div>
                </div>
              </div>

              <div className="flex items-center gap-4 px-2 md:px-6">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <Activity size={18} className="text-indigo-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 mb-0.5">Avg Speed</div>
                  <div className="text-sm font-extrabold text-slate-800">42 km/h</div>
                </div>
              </div>

              <div className="flex items-center gap-4 px-2 md:px-6">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                  <AlertCircle size={18} className="text-purple-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 mb-0.5">Wanted Vehicles</div>
                  <div className="text-sm font-extrabold text-slate-800">3 Detected</div>
                </div>
              </div>

              <div className="flex items-center gap-4 px-2 md:px-6">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <CheckCircle size={18} className="text-blue-500" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 mb-0.5">Total Scans</div>
                  <div className="text-sm font-extrabold text-slate-800">128,567</div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Analytics Donut */}
        <div className="bg-white rounded-[20px] shadow-[0_2px_15px_rgba(0,0,0,0.04)] p-6 md:p-8 flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-slate-900">Vehicle Distribution</h2>
            <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={20} /></button>
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
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <div className="text-3xl font-extrabold text-slate-800 tracking-tight">85%</div>
              <div className="text-xs font-semibold text-slate-500 mt-1">Cars & Bikes</div>
            </div>
          </div>

          <div className="w-full mt-6">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
              {vehicleTypeData.map((v) => (
                <div key={v.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-md" style={{backgroundColor: v.color}}></div>
                  <span className="text-xs font-bold text-slate-500">{v.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-[30fr_70fr] gap-6">
        
        {/* Recent Detections List */}
        <div className="bg-white rounded-[20px] shadow-[0_2px_15px_rgba(0,0,0,0.04)] p-6 md:p-8">
          <h2 className="text-sm font-bold text-slate-900 mb-8">Recent Detections</h2>
          
          <div className="flex flex-col gap-8">
            
            <div className="flex items-start gap-4">
              <div className="text-xs font-bold text-slate-400 w-[70px] pt-1">40 Mins Ago</div>
              <div className="w-10 h-10 rounded-full bg-[#FF7575]/10 flex items-center justify-center shrink-0 border border-[#FF7575]/20">
                <AlertCircle size={18} className="text-[#FF7575]" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800">Blacklisted Plate</div>
                <div className="text-xs font-medium text-slate-500 mt-1">MH12AB1234 detected at CAM_001</div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-xs font-bold text-slate-400 w-[70px] pt-1">1 hour ago</div>
              <div className="w-10 h-10 rounded-full bg-[#764AF1]/10 flex items-center justify-center shrink-0 border border-[#764AF1]/20">
                <Car size={18} className="text-[#764AF1]" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800">Speeding Ticket</div>
                <div className="text-xs font-medium text-slate-500 mt-1">DL8CA8989 over limit (85km/h)</div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="text-xs font-bold text-slate-400 w-[70px] pt-1">2 hours ago</div>
              <div className="w-10 h-10 rounded-full bg-[#488CFF]/10 flex items-center justify-center shrink-0 border border-[#488CFF]/20">
                <FileText size={18} className="text-[#488CFF]" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800">Daily Report Generated</div>
                <div className="text-xs font-medium text-slate-500 mt-1">System compiled yesterday's stats</div>
              </div>
            </div>

          </div>
        </div>

        {/* Detected Vehicles Table */}
        <div className="bg-white rounded-[20px] shadow-[0_2px_15px_rgba(0,0,0,0.04)] p-6 md:p-8 flex flex-col">
          <h2 className="text-sm font-bold text-slate-900 mb-1">Detected Vehicles</h2>
          <p className="text-xs font-medium text-slate-400 mb-6">Overview of latest hour</p>
          
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <button className="bg-[#FF6B6B] text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm">
                <Plus size={14} /> Add
              </button>
              <button className="bg-slate-100 text-slate-400 px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors">
                <Trash2 size={14} />
              </button>
              <button className="bg-slate-100 text-slate-400 px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors">
                <AlertCircle size={14} />
              </button>
              <button className="bg-slate-100 text-slate-400 px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors">
                <FileText size={14} />
              </button>
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="bg-slate-50 border-none rounded-lg pl-4 pr-10 py-2 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-[#764AF1] outline-none w-[200px]" 
                />
                <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              <button className="bg-slate-100 text-slate-400 px-3 py-2 rounded-lg hover:bg-slate-200 transition-colors">
                <FileText size={14} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="pb-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[20%]">PLATE NUMBER</th>
                  <th className="pb-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[25%]">CAMERA ID</th>
                  <th className="pb-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[20%]">TIME</th>
                  <th className="pb-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[20%]">VEHICLE TYPE</th>
                  <th className="pb-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider w-[15%]">STATUS</th>
                </tr>
              </thead>
              <tbody className="text-sm font-bold text-slate-600">
                <tr>
                  <td className="py-4">MH12AB1234</td>
                  <td className="py-4 text-slate-500 font-medium">CAM_001 (Main Gate)</td>
                  <td className="py-4 text-slate-500 font-medium">10:45 AM</td>
                  <td className="py-4">SUV (White)</td>
                  <td className="py-4">
                    <span className="bg-[#FF6B6B] text-white text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">Flagged</span>
                  </td>
                </tr>
                <tr className="border-t border-slate-50">
                  <td className="py-4">DL8CA8989</td>
                  <td className="py-4 text-slate-500 font-medium">CAM_042 (Highway)</td>
                  <td className="py-4 text-slate-500 font-medium">10:42 AM</td>
                  <td className="py-4">Sedan (Black)</td>
                  <td className="py-4">
                    <span className="bg-[#764AF1] text-white text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">Process</span>
                  </td>
                </tr>
                <tr className="border-t border-slate-50">
                  <td className="py-4">KA01HQ4567</td>
                  <td className="py-4 text-slate-500 font-medium">CAM_015 (Intersection)</td>
                  <td className="py-4 text-slate-500 font-medium">10:38 AM</td>
                  <td className="py-4">Truck (Blue)</td>
                  <td className="py-4">
                    <span className="bg-[#3EE1B8] text-white text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">Clear</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-400">Showing 1 to 3 of 50 entries</span>
            <div className="flex gap-1 items-center">
              <button className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600"><ChevronLeft size={14} /></button>
              <button className="w-6 h-6 flex items-center justify-center text-xs font-bold text-slate-500">1</button>
              <button className="w-6 h-6 flex items-center justify-center text-xs font-bold text-white bg-[#FF6B6B] rounded-full shadow-sm">2</button>
              <button className="w-6 h-6 flex items-center justify-center text-xs font-bold text-slate-500">3</button>
              <span className="text-slate-400 text-xs tracking-widest">...</span>
              <button className="w-6 h-6 flex items-center justify-center text-xs font-bold text-slate-500">10</button>
              <button className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600"><ChevronRight size={14} /></button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
