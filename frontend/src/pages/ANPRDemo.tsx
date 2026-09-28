import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import type { Detection } from '../store/store';
import { Upload, Image as ImageIcon, Video, Play, Loader2, Search, Map, Bell, ScanLine } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

export default function ANPRDemo() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const navigate = useNavigate();
  const { addDetection, openVehicleDrawer } = useStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setResults([]); // reset
    }
  };

  const handleProcess = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setResults([]);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('camera_id', 'CAM_005'); // default demo camera

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

      let data: any[];
      try {
        const response = await fetch(`${apiBase}/api/anpr/process-image`, {
          method: 'POST',
          body: formData,
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        data = await response.json();
      } catch (fetchErr) {
        clearTimeout(timeoutId);
        console.warn("Backend API request timed out or unavailable. Falling back to Demo Mode result.", fetchErr);
        data = [{
          detection_id: `det_${Math.random().toString(36).substring(2, 10)}`,
          camera_id: "CAM_005",
          timestamp: new Date().toISOString(),
          plate_number: "MH12AB1234",
          raw_ocr_text: "MH 12 AB 1234",
          normalized_plate_number: "MH12AB1234",
          plate_detection_confidence: 0.96,
          ocr_confidence: 0.94,
          quality_score: 85,
          overall_confidence: 0.92,
          confidence_level: "HIGH",
          vehicle_bbox: [100, 150, 400, 350],
          plate_bbox: [200, 250, 300, 280],
          format_valid: true,
          processing_mode: "DEMO",
          review_status: "PENDING"
        }];
      }

      setResults(data);

      // Inject into centralized Zustand store so Tracking & Search work instantly
      data.forEach((res: any) => {
        if (res.processing_mode !== 'FAILED' && res.plate_number) {
          const state = useStore.getState();
          const cam = state.cameras.find(c => c.id === res.camera_id);
          const veh = state.vehicles[res.plate_number] || { type: 'Unknown', color: 'Unknown' };
          
          const newDetection: Detection = {
            id: res.detection_id,
            plate: res.plate_number,
            cameraId: res.camera_id,
            location: cam ? cam.location : 'Unknown',
            latitude: cam ? cam.latitude : 0,
            longitude: cam ? cam.longitude : 0,
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            vehicleType: veh.type,
            vehicleColor: veh.color,
            direction: 'Unknown',
            confidence: res.plate_detection_confidence,
            plateImg: (selectedFile && selectedFile.type.startsWith('image')) ? (previewUrl || '/anpr_plate_crop.png') : '/anpr_plate_crop.png',
            vehicleImg: (selectedFile && selectedFile.type.startsWith('image')) ? (previewUrl || '/anpr_vehicle_match.png') : '/anpr_vehicle_match.png'
          };
          addDetection(newDetection);
        }
      });
      
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full animate-in fade-in duration-300">
      {/* Header */}
      <Card variant="glow" className="p-6 shrink-0 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ScanLine className="text-blue-500" />
            Accurate ANPR / OCR
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            End-to-end Indian number-plate detection powered by YOLOv8 and PaddleOCR.
          </p>
        </div>
        <Badge variant="warning" className="px-4 py-1 text-sm tracking-widest font-black uppercase shadow-lg">
          Demo Mode Ready
        </Badge>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-y-auto custom-scrollbar pb-6">
        {/* Upload Panel */}
        <Card variant="glass" className="flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Source Input</h3>
          </div>
          
          <div className="p-6 flex-1 flex flex-col items-center justify-center">
            {!previewUrl ? (
              <div 
                className="w-full h-64 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center hover:bg-slate-800/50 hover:border-blue-500/50 transition-all cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-10 h-10 text-slate-500 group-hover:text-blue-400 mb-3" />
                <p className="text-slate-300 font-bold">Click to upload CCTV Footage</p>
                <p className="text-slate-500 text-xs mt-1">Supports JPG, PNG, MP4</p>
              </div>
            ) : (
              <div className="w-full relative rounded-xl overflow-hidden border border-slate-700 bg-black group flex items-center justify-center">
                {(selectedFile && selectedFile.type.startsWith('image')) ? (
                  <img src={previewUrl} className="w-full h-full object-contain max-h-[400px]" alt="Preview" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-8">
                    <Video className="w-16 h-16 text-slate-700 mb-4" />
                    <span className="text-slate-400 font-bold text-center">Video Source Loaded</span>
                    <span className="text-slate-600 text-xs mt-1 text-center max-w-[80%]">Browser preview unavailable for this format. Backend will process it directly.</span>
                  </div>
                )}
                
                {isProcessing && (
                  <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                    <p className="text-white font-bold font-mono tracking-widest animate-pulse">RUNNING INFERENCE...</p>
                    <p className="text-slate-400 text-xs mt-2">YOLOv8 &gt; Quality &gt; PaddleOCR &gt; Validation</p>
                  </div>
                )}
              </div>
            )}
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,video/*"
              onChange={handleFileChange} 
            />
            
            <div className="flex gap-4 w-full mt-6">
              {previewUrl && (
                <Button 
                  variant="outline" 
                  className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                  onClick={() => { setSelectedFile(null); setPreviewUrl(null); setResults([]); }}
                  disabled={isProcessing}
                >
                  Clear
                </Button>
              )}
              <Button 
                className="flex-1 bg-[#1769FF] hover:bg-blue-600 text-white font-bold"
                onClick={handleProcess}
                disabled={!selectedFile || isProcessing}
              >
                <Play className="w-4 h-4 mr-2" />
                {isProcessing ? 'Processing...' : 'Run Pipeline'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Results Panel */}
        <Card variant="glass" className="flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Detection Results</h3>
            {results.length > 0 && <Badge variant="success">{results.length} Found</Badge>}
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
            {results.length === 0 && !isProcessing && (
              <div className="h-full flex flex-col items-center justify-center text-slate-500">
                <ImageIcon className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium">No results yet. Run the pipeline.</p>
              </div>
            )}
            
            <div className="space-y-4">
              {results.map((res, i) => (
                <Card variant="glass" key={i} className="p-4 relative overflow-hidden">
                  
                  {res.processing_mode === 'FAILED' ? (
                    <div className="text-red-400 font-bold p-4 text-center">
                      Processing Failed:<br/>
                      <span className="text-xs font-normal text-slate-400">{res.raw_ocr_text}</span>
                    </div>
                  ) : (
                    <>
                      {res.processing_mode === 'DEMO' && (
                        <div className="absolute top-0 right-0 bg-amber-500/20 text-amber-400 text-[9px] font-black uppercase px-2 py-0.5 rounded-bl-lg border-b border-l border-amber-500/30">
                          Demo Result
                        </div>
                      )}
                      
                      <div className="flex gap-4">
                        <div className="w-24 shrink-0 flex flex-col gap-2">
                          <div className="h-16 bg-slate-900 rounded border border-slate-800 overflow-hidden relative">
                             {(selectedFile && selectedFile.type.startsWith('image')) ? (
                               <img src={previewUrl || ''} className="w-full h-full object-cover opacity-80" alt="Crop" />
                             ) : (
                               <img src="/anpr_plate_crop.png" className="w-full h-full object-cover opacity-80" alt="Crop" />
                             )}
                             <div className="absolute inset-0 border border-blue-500/50 m-1 rounded-sm shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Detected Plate</div>
                              <div className="text-2xl font-black text-white font-mono tracking-tight">{res.plate_number}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Confidence</div>
                              <div className={`text-sm font-black ${res.confidence_level === 'HIGH' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {(res.overall_confidence * 100).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 mt-3 p-3 bg-slate-900/50 rounded-lg border border-slate-800/50">
                            <div>
                              <div className="text-[9px] font-bold text-slate-500 uppercase">Camera ID</div>
                              <div className="text-xs font-bold text-slate-300">{res.camera_id}</div>
                            </div>
                            <div>
                              <div className="text-[9px] font-bold text-slate-500 uppercase">Detection Time</div>
                              <div className="text-xs font-bold text-slate-300">{new Date(res.timestamp).toLocaleTimeString()}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Links */}
                      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800/50">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-slate-900 border-slate-700 hover:bg-slate-800 hover:text-white text-xs h-8"
                          onClick={() => openVehicleDrawer(res.plate_number)}
                        >
                          <Search size={14} className="mr-1.5" /> Details
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-slate-900 border-slate-700 hover:bg-slate-800 hover:text-white text-xs h-8"
                          onClick={() => navigate(`/dashboard/tracking?plate=${res.plate_number}`)}
                        >
                          <Map size={14} className="mr-1.5" /> Track
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-slate-900 border-slate-700 hover:bg-slate-800 hover:text-white text-xs h-8"
                          onClick={() => navigate(`/dashboard/alerts`)}
                        >
                          <Bell size={14} className="mr-1.5" /> Alerts
                        </Button>
                      </div>
                    </>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
