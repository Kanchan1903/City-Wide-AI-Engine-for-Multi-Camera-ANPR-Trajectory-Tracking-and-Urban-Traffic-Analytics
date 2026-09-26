import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatTimeAgo } from '../utils/time';
import { useStore } from '../store/store';
import { 
  AlertTriangle, Activity, Camera, TrendingUp, Video, MapPin, 
  Car, ShieldAlert, BarChart2, Bell, Map, Flag
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { AnimatedCounter } from '../components/ui/AnimatedCounter';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

const volumeTrendData = [
  { time: '00:00', today: 400, yesterday: 300 },
  { time: '04:00', today: 300, yesterday: 200 },
  { time: '08:00', today: 2800, yesterday: 2600 },
  { time: '12:00', today: 2100, yesterday: 1900 },
  { time: '16:00', today: 2500, yesterday: 2300 },
  { time: '20:00', today: 1800, yesterday: 2000 },
];

const vehicleTypeData = [
  { name: 'Car', value: 62, color: '#1769FF' },
  { name: 'Two Wheeler', value: 24, color: '#00B8D9' },
  { name: 'Bus', value: 6, color: '#0B1730' },
  { name: 'Truck', value: 5, color: '#ef4444' },
  { name: 'Others', value: 3, color: '#94a3b8' },
];

const cameraPerformanceData = [
  { name: 'CAM_001', scans: 4500, accuracy: 98 },
  { name: 'CAM_002', scans: 3200, accuracy: 95 },
  { name: 'CAM_003', scans: 2800, accuracy: 92 },
  { name: 'CAM_004', scans: 3800, accuracy: 96 },
];

export default function DashboardView() {
  const { stats, alerts, cameras, detections, vehicles, openVehicleDrawer, closeVehicleDrawer } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Reset drawer state on mount and unmount to prevent it from being stuck open
    closeVehicleDrawer();
    return () => closeVehicleDrawer();
  }, [closeVehicleDrawer]);
  const activeAlertsCount = alerts.filter(a => !a.read).length;
  const errorCount = alerts.filter(a => a.type === 'error').length;
  const warningCount = alerts.filter(a => a.type === 'warning' || a.type === 'info').length;

  const targetVehiclePlate = 'MH12AB1234';
  const targetVehicle = vehicles[targetVehiclePlate];
  const trackingHistory = detections
    .filter(d => d.plate === targetVehiclePlate)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  return (
    <div className="flex flex-col gap-8 h-full animate-in fade-in duration-300 relative pb-8">
      
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0 relative z-20">
        <Card variant="glass" className="flex-1">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ACTIVE CAMERAS</p>
                <div className="text-3xl font-bold text-white mt-1 font-mono">
                  <AnimatedCounter value={cameras.filter(c => c.status === 'online').length} />
                </div>
              </div>
              <div className="p-3 bg-[#1769FF]/10 rounded-lg border border-[#1769FF]/20 text-[#1769FF]">
                <Video className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-emerald-400">
              <Activity className="w-3.5 h-3.5 mr-1" /> 100% Operational
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" className="flex-1">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">VEHICLES DETECTED</p>
                <div className="text-3xl font-bold text-white mt-1 font-mono">
                  <AnimatedCounter value={stats.vehiclesToday} />
                </div>
              </div>
              <div className="p-3 bg-[#00B8D9]/10 rounded-lg border border-[#00B8D9]/20 text-[#00B8D9]">
                <Car className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +4.2% vs yesterday
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" className="flex-1">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">TOTAL ANPR SCANS</p>
                <div className="text-3xl font-bold text-white mt-1 font-mono">
                  <AnimatedCounter value={stats.totalScans} />
                </div>
              </div>
              <div className="p-3 bg-indigo-900/30 rounded-lg border border-indigo-900/50 text-indigo-400">
                <BarChart2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> High throughput
            </div>
          </CardContent>
        </Card>

        <Card variant={activeAlertsCount > 0 ? "glow" : "glass"} className={activeAlertsCount > 0 ? "border-red-500/30" : ""}>
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ACTIVE ALERTS</p>
                <div className="text-3xl font-bold text-red-400 mt-1 font-mono">
                  <AnimatedCounter value={activeAlertsCount} />
                </div>
              </div>
              <div className={`p-3 rounded-lg border ${activeAlertsCount > 0 ? 'bg-red-900/30 border-red-900/50 text-red-400 animate-pulse' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
            <div className={`mt-4 flex items-center text-xs font-semibold ${activeAlertsCount > 0 ? 'text-red-400' : 'text-slate-400'}`}>
              {activeAlertsCount > 0 ? 'Action required immediately' : 'No active alerts'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Intelligence Grid - 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[35fr_35fr_30fr] gap-6 relative z-20">
        
        {/* Left: Live Cameras */}
        <div className="flex flex-col h-full">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center mb-3 shrink-0">
            <Video size={16} className="mr-2 text-blue-500" /> LIVE CAMERAS
          </h3>
          <div className="grid grid-cols-2 grid-rows-2 gap-4 flex-1 min-h-[350px]">
            {cameras.slice(0, 4).map(cam => (
              <Card 
                variant="glass"
                key={cam.id} 
                className="overflow-hidden group cursor-pointer hover:border-[#1769FF] transition-colors flex flex-col" 
                onClick={() => navigate('/dashboard/cameras')}
              >
                <div className="relative flex-1 bg-black">
                   <img src={cam.img} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                   <div className="absolute top-2 right-2 flex items-center gap-1">
                     <span className="flex h-1.5 w-1.5 relative">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                     </span>
                   </div>
                </div>
                <div className="p-3 bg-slate-900/50 shrink-0">
                  <div className="text-xs font-bold text-white mb-0.5">{cam.id}</div>
                  <div className="text-[10px] text-slate-400 font-medium truncate">{cam.location}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Center: Vehicle Tracking */}
        <div className="flex flex-col h-full">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center mb-3 shrink-0">
            <Map size={16} className="mr-2 text-[#00B8D9]" /> VEHICLE TRACKING
          </h3>
          <Card variant="glow" className="p-5 flex flex-col flex-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[#1769FF]/5 to-transparent pointer-events-none"></div>
            
            <div className="flex gap-4 items-center relative z-10 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm cursor-pointer hover:border-blue-500/50 transition-colors shrink-0" onClick={() => openVehicleDrawer(targetVehiclePlate)}>
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-700 shrink-0">
                <img src={targetVehicle?.img} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-xl font-black text-white tracking-tight leading-none mb-1">{targetVehicle?.plate}</div>
                <div className="text-xs font-medium text-slate-400 mb-2">{targetVehicle?.make} • {targetVehicle?.color}</div>
                <Badge variant="success" className="text-[9px] shadow-sm">ANPR CONFIDENCE: 96%</Badge>
              </div>
            </div>

            <div className="relative z-10 flex-1 flex flex-col justify-center py-6 px-2">
              <div className="flex justify-between items-start relative">
                {/* Connecting Line */}
                <div className="absolute top-[11px] left-8 right-8 h-0.5 bg-slate-800"></div>
                
                {trackingHistory.map((det, i) => {
                  const cam = cameras.find(c => c.id === det.cameraId);
                  return (
                    <div key={det.id} className="flex flex-col items-center relative z-10 group cursor-pointer hover:-translate-y-1 transition-transform" onClick={() => navigate('/dashboard/tracking?plate=MH12AB1234')}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 shadow-lg transition-colors ${i === trackingHistory.length - 1 ? 'bg-[#1769FF] border-blue-300 text-white shadow-blue-900/50' : 'bg-slate-800 border-slate-600 text-slate-300 group-hover:bg-slate-700'}`}>
                        {i + 1}
                      </div>
                      <div className="mt-3 text-center">
                        <div className="text-[10px] font-bold text-white mb-0.5">{det.cameraId}</div>
                        <div className="text-[9px] font-medium text-slate-500 leading-tight max-w-[60px]">{cam?.location}</div>
                        <div className="text-[9px] font-mono text-[#00B8D9] mt-1.5">{det.timestamp}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <Button 
              className="w-full font-bold bg-[#1769FF] hover:bg-blue-600 text-white relative z-10 shadow-lg shadow-blue-900/20 py-2.5 h-auto text-sm shrink-0" 
              onClick={() => navigate('/dashboard/tracking?plate=MH12AB1234')}
            >
              <MapPin size={16} className="mr-2" /> View Full Trajectory
            </Button>
          </Card>
        </div>

        {/* Right: Live Alerts */}
        <div className="flex flex-col h-full">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center mb-3 shrink-0">
            <ShieldAlert size={16} className="mr-2 text-red-500" /> LIVE ALERTS
          </h3>
          
          <div className="flex-1 flex flex-col gap-4">
            
            <Card variant="glass" className="p-4 flex gap-4 items-center cursor-pointer hover:border-slate-700 transition-colors shadow-sm shrink-0" onClick={() => navigate('/dashboard/alerts')}>
               <div className="w-10 h-10 shrink-0 rounded-full bg-red-900/30 text-red-500 flex items-center justify-center border border-red-900/50 shadow-inner">
                 <Flag size={18} />
               </div>
               <div>
                 <div className="text-sm font-bold text-white mb-0.5">{errorCount} Critical Alerts</div>
                 <div className="text-[10px] font-medium text-slate-400">High severity security & system events.</div>
               </div>
            </Card>
            
            <Card variant="glass" className="p-4 flex gap-4 items-center cursor-pointer hover:border-slate-700 transition-colors shadow-sm shrink-0" onClick={() => navigate('/dashboard/alerts')}>
               <div className="w-10 h-10 shrink-0 rounded-full bg-amber-900/30 text-amber-500 flex items-center justify-center border border-amber-900/50 shadow-inner">
                 <AlertTriangle size={18} />
               </div>
               <div>
                 <div className="text-sm font-bold text-white mb-0.5">{warningCount} Active Warnings</div>
                 <div className="text-[10px] font-medium text-slate-400">Traffic violations and system notices.</div>
               </div>
            </Card>

            <Card variant="glass" className="p-5 flex flex-col flex-1 cursor-pointer hover:border-slate-700 transition-colors shadow-sm overflow-hidden" onClick={() => navigate('/dashboard/alerts')}>
               <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 shrink-0">Recent Security Alerts</div>
               <div className="space-y-3 overflow-y-auto custom-scrollbar">
                  {alerts.slice(0, 3).map(alert => (
                    <div key={alert.id} className="flex gap-3">
                       <div className={`w-1.5 rounded-full shrink-0 ${alert.type === 'error' ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                       <div>
                         <div className="text-xs font-bold text-white leading-tight mb-1 line-clamp-1">{alert.title}</div>
                         <div className="text-[9px] font-mono text-slate-500">{formatTimeAgo(alert.timestamp)}</div>
                       </div>
                    </div>
                  ))}
               </div>
            </Card>

          </div>
        </div>

      </div>

      {/* Bottom Intelligence Section */}
      <div className="mt-4 relative z-20">
        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center">
          <Activity size={16} className="mr-2 text-indigo-500" /> CITY TRAFFIC INTELLIGENCE
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Traffic Flow */}
          <Card variant="glass" className="cursor-pointer hover:border-[#1769FF]/50 transition-colors" onClick={() => navigate('/dashboard/analytics')}>
            <CardHeader className="py-4 border-b border-slate-800 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-white flex items-center">Traffic Flow</CardTitle>
            </CardHeader>
            <CardContent className="p-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={volumeTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(val) => `${val/1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="today" stroke="#00B8D9" strokeWidth={3} dot={{ r: 4, fill: '#00B8D9', strokeWidth: 2, stroke: '#0f172a' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Vehicle Types */}
          <Card variant="glass" className="cursor-pointer hover:border-[#1769FF]/50 transition-colors" onClick={() => navigate('/dashboard/analytics')}>
            <CardHeader className="py-4 border-b border-slate-800 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-white flex items-center">Vehicle Types</CardTitle>
            </CardHeader>
            <CardContent className="p-4 h-48 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={vehicleTypeData} innerRadius={55} outerRadius={75} paddingAngle={2} dataKey="value" stroke="none">
                    {vehicleTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
              {/* Overlay labels next to chart */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2">
                 {vehicleTypeData.slice(0,3).map(v => (
                   <div key={v.name} className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full" style={{backgroundColor: v.color}}></div>
                     <span className="text-[10px] font-bold text-slate-300">{v.name}</span>
                   </div>
                 ))}
              </div>
            </CardContent>
          </Card>

          {/* Camera Performance */}
          <Card variant="glass" className="cursor-pointer hover:border-[#1769FF]/50 transition-colors" onClick={() => navigate('/dashboard/cameras')}>
            <CardHeader className="py-4 border-b border-slate-800 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-white flex items-center">Camera Performance</CardTitle>
            </CardHeader>
            <CardContent className="p-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cameraPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(val) => `${val/1000}k`} width={30} />
                  <YAxis yAxisId="right" orientation="right" domain={[80, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#10b981', fontWeight: 'bold' }} tickFormatter={(val) => `${val}%`} width={30} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }} />
                  <Bar yAxisId="left" dataKey="scans" fill="#1769FF" radius={[4, 4, 0, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
