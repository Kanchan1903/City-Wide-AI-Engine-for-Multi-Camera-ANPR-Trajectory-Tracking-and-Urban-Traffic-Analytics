import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/store';
import { X, Map, Camera, FileText, Flag, Clock } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useNavigate } from 'react-router-dom';
import { buildTrajectory } from '../utils/trajectory';

export default function VehicleIntelligenceDrawer() {
  const { isVehicleDrawerOpen, selectedVehicleId, closeVehicleDrawer, vehicles, detections, cameras, openCameraModal } = useStore();
  const navigate = useNavigate();
  const [isFlagged, setIsFlagged] = useState(false);

  const vehicle = selectedVehicleId ? vehicles[selectedVehicleId] : null;
  
  // Get history of this vehicle
  const history = selectedVehicleId 
    ? buildTrajectory(selectedVehicleId, detections, cameras)
    : [];

  const [selectedDetectionId, setSelectedDetectionId] = useState<string | null>(null);
  const selectedDetection = history.find(d => d.id === selectedDetectionId) || (history.length > 0 ? history[history.length - 1] : null);

  return (
    <AnimatePresence>
      {isVehicleDrawerOpen && vehicle && (
        <motion.div 
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[100]"
          onClick={closeVehicleDrawer}
        />
      )}
      
      {isVehicleDrawerOpen && vehicle && (
        <motion.div 
          key="drawer"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 h-full w-full max-w-md bg-white/90 backdrop-blur-xl border-l border-white shadow-2xl z-[101] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-white/50">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Vehicle Intelligence</div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{vehicle.plate}</h2>
            </div>
            <button 
              onClick={closeVehicleDrawer}
              className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
            
            {/* Vehicle Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
              <div className="relative flex gap-4 items-center">
                <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-white shadow-md shrink-0">
                  <img src={vehicle.img} alt={vehicle.plate} className="w-full h-full object-cover" />
                </div>
                <div>
                  <Badge variant="success" className="mb-2 shadow-sm">Target Identified</Badge>
                  <div className="font-bold text-slate-800">{vehicle.make}</div>
                  <div className="text-sm font-medium text-slate-500">{vehicle.color} • {vehicle.type}</div>
                </div>
              </div>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => { closeVehicleDrawer(); navigate(`/dashboard/tracking?plate=${vehicle.plate}`); }}
                className="w-full shadow-sm bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 font-bold justify-center" size="sm"
              >
                <Map size={16} className="mr-2" /> View Trajectory
              </Button>
              <Button 
                onClick={() => { 
                  if (selectedDetection) {
                    closeVehicleDrawer();
                    openCameraModal(selectedDetection.cameraId, selectedDetection.timestamp);
                  }
                }}
                className="w-full shadow-sm bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 font-bold justify-center" size="sm"
              >
                <Camera size={16} className="mr-2" /> View Camera
              </Button>
              <Button 
                onClick={() => { closeVehicleDrawer(); navigate('/dashboard/reports'); }}
                variant="outline" className="w-full justify-center bg-white shadow-sm font-bold text-slate-600 hover:bg-slate-50" size="sm"
              >
                <FileText size={16} className="mr-2" /> Report
              </Button>
              <Button 
                onClick={() => { 
                  setIsFlagged(true); 
                  alert(`Vehicle ${vehicle.plate} has been successfully flagged in the system.`);
                }}
                variant="outline" 
                className={`w-full justify-center shadow-sm font-bold transition-colors ${isFlagged ? 'bg-red-600 text-white border-red-600 hover:bg-red-700' : 'bg-white text-red-600 border-red-200 hover:bg-red-50'}`} 
                size="sm"
              >
                <Flag size={16} className="mr-2" /> {isFlagged ? 'Flagged' : 'Flag Vehicle'}
              </Button>
            </div>

            {/* Detection Timeline */}
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight mb-4 flex items-center">
                <Clock size={16} className="mr-2 text-blue-500" /> Detection History
              </h3>
              
              <div className="relative border-l-2 border-blue-100 ml-3 space-y-6">
                {history.length > 0 ? (
                  history.map((det, i) => {
                    const cam = cameras.find(c => c.id === det.cameraId);
                    const isSelected = selectedDetection?.id === det.id;
                    
                    return (
                      <div key={det.id} className="relative pl-6 cursor-pointer group" onClick={() => setSelectedDetectionId(det.id)}>
                        <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 border-white shadow-sm transition-colors ${isSelected ? 'bg-blue-500' : 'bg-slate-300 group-hover:bg-blue-400'}`}></div>
                        <div className={`bg-white border ${isSelected ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'} rounded-xl p-3 shadow-sm hover:shadow-md transition-all`}>
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-slate-800 text-sm">{cam?.location || det.cameraId}</span>
                            <span className={`text-xs font-mono px-2 py-0.5 rounded transition-colors ${isSelected ? 'bg-blue-100 text-blue-700' : 'text-slate-500 bg-slate-100'}`}>{det.timestamp}</span>
                          </div>
                          <div className="text-xs font-medium text-blue-600 mb-2">{det.cameraId} • {det.confidence * 100}% Confidence</div>
                          
                          {/* Full image crop preview */}
                          <div className={`w-full bg-slate-100 rounded border ${isSelected ? 'border-blue-200' : 'border-slate-200'} overflow-hidden opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1`}>
                             <img src={det.plateImg} className="w-full h-auto max-h-20 object-contain rounded-sm" />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="pl-6 text-sm text-slate-500 italic">No historical data found.</div>
                )}
              </div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
