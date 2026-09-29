import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/store';
import { X, MapPin, Activity, Video } from 'lucide-react';
import { Badge } from './ui/Badge';

export default function LiveCameraModal() {
 const { isCameraModalOpen, selectedCameraId, selectedCameraTimestamp, closeCameraModal, cameras, detections, vehicles, openVehicleDrawer } = useStore();

 const camera = selectedCameraId ? cameras.find(c => c.id === selectedCameraId) : null;
 const isHistorical = !!selectedCameraTimestamp;

 const getDynamicDetections = () => {
 if (!camera) return [];
 
 // Filter by camera
 let camDets = detections.filter(d => d.cameraId === camera.id);
 // If playback, filter by timestamp
 if (isHistorical) {
 camDets = camDets.filter(d => d.timestamp === selectedCameraTimestamp);
 }
 
 // Map to bounding boxes with deterministic pseudo-random positions based on ID
 return camDets.map((d, i) => {
 const v = vehicles[d.plate];
 const type = v ? v.type : 'CAR';
 // simple deterministic positions to avoid overlapping completely
 const top = 35 + ((i * 17) % 30);
 const left = 20 + ((i * 23) % 60);
 return {
 id: d.id,
 plate: d.plate,
 type: type,
 conf: Math.round(d.confidence * 100) + '%',
 top: `${top}%`,
 left: `${left}%`,
 width: type === 'TRUCK' || type === 'BUS' ? '18%' : '12%',
 height: type === 'TRUCK' || type === 'BUS' ? '20%' : '15%',
 color: type === 'TRUCK' || type === 'BUS' ? 'border-amber-500' : 'border-blue-500',
 bg: type === 'TRUCK' || type === 'BUS' ? 'bg-amber-500' : 'bg-blue-500'
 };
 });
 };

 return (
 <AnimatePresence>
 {isCameraModalOpen && camera && (
 <>
 <motion.div 
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 bg-slate-900/40 z-[100] flex items-center justify-center p-4 md:p-8"
 onClick={closeCameraModal}
 >
 <motion.div 
 initial={{ scale: 0.95, opacity: 0, y: 20 }}
 animate={{ scale: 1, opacity: 1, y: 0 }}
 exit={{ scale: 0.95, opacity: 0, y: 20 }}
 transition={{ type: 'spring', damping: 25, stiffness: 300 }}
 className="bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-full border border-slate-800"
 onClick={e => e.stopPropagation()}
 >
 {/* Header */}
 <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-800 bg-slate-900/50">
 <div className="flex items-center gap-4">
 <div className="w-10 h-10 rounded-xl bg-blue-900/30 flex items-center justify-center border border-blue-800 text-blue-400 shadow-sm">
 <Video size={20} />
 </div>
 <div>
 <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
 <span className={isHistorical ? "text-blue-400" : "text-white"}>{isHistorical ? 'Historical Feed:' : ''} {camera.id}</span>
 {!isHistorical && <Badge variant={camera.status === 'online' ? 'success' : 'danger'}>{camera.status.toUpperCase()}</Badge>}
 {isHistorical && <Badge variant="info">PLAYBACK</Badge>}
 </h2>
 <div className="text-sm font-medium text-slate-400 flex items-center mt-0.5">
 <MapPin size={14} className="mr-1 text-slate-500" /> {camera.location}
 </div>
 </div>
 </div>
 <button 
 onClick={closeCameraModal}
 className="p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors"
 >
 <X size={20} />
 </button>
 </div>

 {/* Video Feed Area */}
 <div className="bg-slate-900 w-full flex items-center justify-center relative overflow-hidden h-[65vh]">
 
 {/* Image Container with masking bars to hide baked-in AI text */}
 <div className="relative h-full aspect-square max-w-full">
 <div className="absolute top-0 left-0 w-full h-[8%] bg-slate-900 z-10 border-b border-white/5"></div>
 <div className="absolute bottom-0 left-0 w-full h-[8%] bg-slate-900 z-10 border-t border-white/5"></div>
 
 <img src={camera.img} alt="Camera Feed" className="w-full h-full object-contain opacity-80" />
 
 {/* Simulated tracking bounding boxes */}
 {camera.status === 'online' && getDynamicDetections().map(box => (
 <div 
 key={box.id}
 onClick={(e) => { e.stopPropagation(); openVehicleDrawer(box.plate); }}
 className={`absolute border-2 ${box.color} ${box.bg}/10 rounded shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-all duration-300 cursor-pointer hover:border-white hover:scale-105 z-30`}
 style={{ top: box.top, left: box.left, width: box.width, height: box.height }}
 >
 <div className={`absolute -top-6 left-[-2px] ${box.bg} text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm flex items-center gap-1.5 whitespace-nowrap shadow-md`}>
 <span className="tracking-widest">{box.plate}</span>
 <span className="opacity-60">|</span>
 <span>{box.type}</span> 
 <span className="opacity-80">{box.conf}</span>
 </div>
 </div>
 ))}
 </div>
 
 {/* Mock Overlay UI on video */}
 <div className="absolute top-4 left-4 bg-black/80 text-white text-xs font-mono px-3 py-1.5 rounded z-20 border border-white/10">
 {isHistorical ? 'PLAYBACK' : 'REC'} • {camera.location}
 </div>
 <div className="absolute top-4 right-4 bg-black/80 text-blue-400 text-xs font-bold font-mono px-3 py-1.5 rounded text-right z-20 border border-white/10">
 {isHistorical ? (
 <>
 {new Date().toISOString().split('T')[0]}<br/>
 {selectedCameraTimestamp}
 </>
 ) : (
 <>
 {new Date().toISOString().split('T')[0]}<br/>
 {new Date().toLocaleTimeString()}
 </>
 )}
 </div>
 </div>

 {/* Footer Stats */}
 <div className="p-4 bg-slate-900/50 border-t border-slate-800 flex items-center justify-between">
 <div className="flex items-center gap-6">
 <div className="flex items-center gap-2">
 <Activity size={16} className="text-blue-400" />
 <div>
 <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Traffic Flow</div>
 <div className="text-sm font-bold text-slate-200">42 veh/min</div>
 </div>
 </div>
 <div className="h-8 w-px bg-slate-700"></div>
 <div>
 <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Detections</div>
 <div className="text-sm font-bold text-slate-200">1,204 Today</div>
 </div>
 </div>
 </div>

 </motion.div>
 </motion.div>
 </>
 )}
 </AnimatePresence>
 );
}
