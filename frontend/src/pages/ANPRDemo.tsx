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

 try {
 const formData = new FormData();
 formData.append('file', selectedFile);
 formData.append('camera_id', 'CAM_005'); // default demo camera

 const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001';
 
 const controller = new AbortController();
 const timeoutId = setTimeout(() => controller.abort(), 120000); // 120s timeout for model downloads

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
  } catch (fetchErr: any) {
  clearTimeout(timeoutId);
  console.error("Backend API request timed out or unavailable.", fetchErr);
  data = [{
  processing_mode: "CONNECTION_FAILED",
  raw_ocr_text: "Backend unavailable. Is the server running?"
  }];
  }

  if (data && data.length === 0) {
     data = [{ processing_mode: "NO_PLATES", raw_ocr_text: "No license plates detected in the image." }];
  }
 setResults(data);

 // Inject into centralized Zustand store so Tracking & Search work instantly
 data.forEach((res: any) => {
 if (res.processing_mode !== 'FAILED' && res.plate_number) {
 const state = useStore.getState();
 const cam = state.cameras.find(c => c.id === res.camera_id);
 const veh = state.vehicles[res.plate_number] || { type: 'Car', color: 'White' };
 
 const newDetection: Detection = {
 id: res.detection_id,
 plate: res.plate_number,
 cameraId: res.camera_id,
 location: cam ? cam.location : 'Shivajinagar Junction',
 latitude: cam ? cam.latitude : 18.5250,
 longitude: cam ? cam.longitude : 73.8550,
 timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
 vehicleType: veh.type || 'Car',
 vehicleColor: veh.color || 'White',
 direction: 'Northbound',
 confidence: res.plate_detection_confidence || 0.95,
 plateImg: res.plate_crop_url ? `${apiBase}${res.plate_crop_url}` : '/anpr_plate_crop.png',
 vehicleImg: previewUrl || '/anpr_vehicle_match.png'
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

 const isVideo = previewUrl?.endsWith('.mp4') || (selectedFile && selectedFile.type.startsWith('video'));

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
 
 </Card>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-y-auto custom-scrollbar pb-6">
 {/* Upload Panel */}
 <Card variant="glass" className="flex flex-col h-full overflow-hidden">
 <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
 <h3 className="text-sm font-bold text-white uppercase tracking-wider">Source Input</h3>
 {selectedFile && (
 <span className="text-xs text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20 font-medium">
 {selectedFile.name}
 </span>
 )}
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
 <div className="w-full relative rounded-xl overflow-hidden border border-slate-700 bg-black group flex items-center justify-center min-h-[260px]">
 {isVideo ? (
 <video 
 src={previewUrl} 
 controls 
 autoPlay 
 loop 
 muted 
 playsInline 
 className="w-full max-h-[340px] object-contain rounded-lg"
 />
 ) : (
 <img src={previewUrl} className="w-full h-full object-contain max-h-[340px]" alt="Preview" />
 )}
 
 {isProcessing && (
 <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center z-10">
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
 className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold"
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
 
 {['FAILED', 'CONNECTION_FAILED', 'NO_PLATES'].includes(res.processing_mode) ? (
                  <div className="flex flex-col gap-6 py-4">
                    <div className="w-full flex justify-center">
                      <div className="h-24 md:h-32 bg-slate-900 rounded border border-slate-800 overflow-hidden relative inline-block">
                        <img src={previewUrl || '/anpr_plate_crop.png'} className="h-full w-auto object-contain opacity-50 grayscale" alt="Crop" />
                        <div className="absolute inset-0 border-2 border-red-500/50 m-1 rounded shadow-[0_0_15px_rgba(239,68,68,0.5)]"></div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400 font-sans tracking-normal mb-2">
                        {res.processing_mode === 'CONNECTION_FAILED' ? "Connection Error" : 
                         res.processing_mode === 'NO_PLATES' ? "No plates detected" : "Processing Failed"}
                      </div>
                      <div className="text-sm font-normal text-slate-400">
                        {res.raw_ocr_text}
                      </div>
                    </div>
                  </div>
 ) : (
                  <>
                   <div className="flex flex-col gap-6 py-4">
                     <div className="w-full flex justify-center">
                       <div className="h-24 md:h-32 bg-slate-900 rounded border border-slate-800 overflow-hidden relative inline-block">
                         {res.plate_crop_url ? (
                           <img src={`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8001'}${res.plate_crop_url}`} className="h-full w-auto object-contain opacity-90" alt="Detected Plate Crop" />
                         ) : (
                           <img src={previewUrl || '/anpr_plate_crop.png'} className="h-full w-auto object-contain opacity-90" alt="Crop" />
                         )}
                         <div className="absolute inset-0 border-2 border-blue-500/50 m-1 rounded shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
                       </div>
                     </div>
                     
                     <div className="text-center">
                       <div className="text-4xl md:text-5xl font-black text-white font-mono tracking-tight mb-2">
                         {res.plate_number === "Unable to read plate" ? (
                           <span className="text-2xl text-amber-400 font-sans tracking-normal">Unable to read plate</span>
                         ) : res.plate_number ? (
                           res.plate_number
                         ) : (
                           <span className="text-2xl text-slate-500 font-sans tracking-normal">Plate not recognized</span>
                         )}
                       </div>
                       <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                         FINAL CONFIDENCE: <span className={`${res.confidence_level === 'HIGH' ? 'text-emerald-400' : 'text-amber-400'}`}>
                           {res.final_confidence != null ? (res.final_confidence * 100).toFixed(1) : (res.ocr_confidence != null ? (res.ocr_confidence * 100).toFixed(1) : "0.0")}%
                         </span>
                       </div>
                     </div>
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
