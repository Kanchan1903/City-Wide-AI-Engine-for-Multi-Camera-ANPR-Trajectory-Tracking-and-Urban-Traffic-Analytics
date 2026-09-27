import React from 'react';
import { formatTimeAgo } from '../utils/time';
import { useStore } from '../store/store';
import { AlertTriangle, ShieldAlert, Filter, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export default function AlertsView() {
  const { alerts, markAlertAsRead, markAllAlertsAsRead, detections, cameras } = useStore();

  return (
    <div className="flex flex-col gap-6 h-full animate-in fade-in duration-300">
      
      {/* Header */}
      <Card variant="glow" className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 p-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2"><ShieldAlert className="text-red-500" /> Active System Alerts</h2>
          <p className="text-sm text-slate-400 font-medium mt-1">Centralized alert management and resolution</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" className="font-bold text-slate-300 bg-slate-950 border-slate-800">
            <Filter size={16} className="mr-2" /> Filter
          </Button>
          <Button 
            onClick={markAllAlertsAsRead}
            className="font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border-none"
          >
            <CheckCircle size={16} className="mr-2" /> Resolve All
          </Button>
        </div>
      </Card>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-6 overflow-visible">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {alerts.length > 0 ? (
            alerts.map(alert => {
              const isCritical = alert.type === 'error';
              const isWarning = alert.type === 'warning';
              
              // Map to a detection record for consistent data
              let detection = alert.plate ? detections.find(d => d.plate === alert.plate && (!alert.cameraId || d.cameraId === alert.cameraId)) : null;
              if (!detection && alert.plate) {
                detection = detections.find(d => d.plate === alert.plate) || null; // fallback
              }
              const camera = alert.cameraId ? cameras.find(c => c.id === alert.cameraId) : (detection ? cameras.find(c => c.id === detection.cameraId) : null);

              const plate = detection ? detection.plate : (alert.plate || 'Unknown Vehicle');
              const timeDisplay = detection ? detection.timestamp : formatTimeAgo(alert.timestamp);
              
              let description = alert.description;
              if (detection) {
                if (alert.title.includes('Speed')) {
                  description = `Vehicle ${plate} exceeding 80km/h at ${camera?.id || detection.cameraId}.`;
                } else if (alert.title.includes('Blacklisted')) {
                  description = `Vehicle ${plate} (Stolen) detected at ${camera?.id || detection.cameraId}.`;
                } else {
                  description = `Vehicle ${plate} spotted at ${camera?.id || detection.cameraId}`;
                }
              }
              
              const locationDisplay = camera ? `${camera.id} (${camera.location})` : 'System / General';
              
              return (
                <Card 
                  variant={!alert.read ? "glow" : "glass"}
                  key={alert.id} 
                  className={`flex flex-col overflow-visible min-h-[200px] transition-colors ${
                    !alert.read 
                      ? 'border-slate-700/60' 
                      : 'opacity-70 border-slate-800/50'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-5 flex items-start gap-4">
                    <div className={`p-3 rounded-full shrink-0 shadow-inner ${
                      isCritical ? 'bg-red-900/30 text-red-500 border border-red-900/50' :
                      isWarning ? 'bg-amber-900/30 text-amber-500 border border-amber-900/50' :
                      'bg-blue-900/30 text-blue-500 border border-blue-900/50'
                    }`}>
                      <AlertTriangle size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <div className="font-bold text-white text-base leading-tight truncate">{alert.title}</div>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mb-2">{timeDisplay}</div>
                      <div className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border shadow-sm bg-slate-950 border-slate-700 text-slate-300">
                        {plate}
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="px-5 flex-1 flex flex-col">
                    <p className="text-sm text-slate-400 font-medium line-clamp-3 mb-4">
                      {description}
                    </p>
                    <div className="text-xs font-bold text-slate-500 mb-4 mt-auto">
                      Location: <span className="text-blue-400 font-mono">{locationDisplay}</span>
                    </div>
                  </div>

                  {/* Card Footer (Actions) */}
                  <div className="p-5 pt-0 mt-auto">
                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        className="flex-1 h-10 text-sm font-bold border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300"
                        onClick={() => alert.plate && useStore.getState().openVehicleDrawer(alert.plate)}
                        disabled={!alert.plate}
                      >
                        View
                      </Button>
                      {!alert.read ? (
                        <Button 
                          onClick={() => markAlertAsRead(alert.id)} 
                          className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-md"
                        >
                          Resolve
                        </Button>
                      ) : (
                        <Button 
                          disabled
                          className="flex-1 h-10 bg-slate-800 text-slate-500 text-sm font-bold border border-slate-700"
                        >
                          Resolved
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full p-12 text-center text-slate-400 font-medium bg-slate-900 rounded-xl border border-slate-800">
              No alerts at this time. All systems nominal.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
