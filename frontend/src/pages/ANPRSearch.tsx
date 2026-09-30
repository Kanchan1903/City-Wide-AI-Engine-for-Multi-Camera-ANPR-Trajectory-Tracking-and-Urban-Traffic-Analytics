import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { getEditDistance } from '../utils/trajectory';
import { Search, Filter, Calendar, Clock, Camera, ChevronRight, X, AlertTriangle, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

// OCR Canonicalizer for fuzzy OCR character equivalence (A<->3<->4, I<->1, B<->8, O<->0, S<->5, Z<->2)
function toCanonicalPlate(plate: string): string {
 return plate
 .toUpperCase()
 .replace(/[^A-Z0-9]/g, '')
 .replace(/[34]/g, 'A')
 .replace(/1/g, 'I')
 .replace(/8/g, 'B')
 .replace(/0/g, 'O')
 .replace(/5/g, 'S')
 .replace(/2/g, 'Z');
}

function arePlatesFuzzyEqual(p1: string, p2: string): boolean {
 if (!p1 || !p2) return false;
 if (p1 === p2) return true;
 const c1 = toCanonicalPlate(p1);
 const c2 = toCanonicalPlate(p2);
 if (c1 === c2) return true;
 return getEditDistance(c1, c2) <= 1 || getEditDistance(p1, p2) <= 1;
}

interface VehicleGroup {
 primaryPlate: string;
 displayPlate: string;
 ocrVariants: string[];
 detections: ReturnType<typeof useStore.getState>['detections'];
 latestDetection: ReturnType<typeof useStore.getState>['detections'][0];
 maxConfidence: number;
 status: 'VERIFIED' | 'NEEDS_REVIEW' | 'BLACKLISTED';
 statusLabel: string;
}

export default function ANPRSearch() {
 const { detections, cameras } = useStore();
 const [searchTerm, setSearchTerm] = useState('');
 const [dateFilter, setDateFilter] = useState('All');
 const [timeFilter, setTimeFilter] = useState('All');
 const [cameraFilter, setCameraFilter] = useState('All');
 const [expandedPlate, setExpandedPlate] = useState<string | null>(null);
 const navigate = useNavigate();

 // 1. Filter detections based on search term, date, time window, and camera ID
 const filteredDetections = detections.filter(d => {
 // Purge legacy duplicate variant strings if lingering in cached browser state
 if (d.plate === 'MH12AB123A' || d.plate === 'MH12ABI234') {
 return false;
 }

 // Search term matching (fuzzy or partial substring match)
 if (searchTerm.trim()) {
 const q = searchTerm.trim().toUpperCase();
 const p = d.plate.toUpperCase();
 const matchesDirect = p.includes(q);
 const matchesFuzzy = arePlatesFuzzyEqual(p, q);
 if (!matchesDirect && !matchesFuzzy) return false;
 }

 // Camera filter
 if (cameraFilter !== 'All' && cameraFilter !== 'All Cameras' && d.cameraId !== cameraFilter) {
 return false;
 }

 // Time filter (Morning: 06:00-12:00, Evening: 16:00-22:00)
 if (timeFilter === 'Morning (06-12)') {
 const hour = parseInt(d.timestamp.split(':')[0], 10);
 if (isNaN(hour) || hour < 6 || hour >= 12) return false;
 } else if (timeFilter === 'Evening (16-22)') {
 const hour = parseInt(d.timestamp.split(':')[0], 10);
 if (isNaN(hour) || hour < 16 || hour >= 22) return false;
 }

 // Date filter
 if (dateFilter === 'Today') {
 const hour = parseInt(d.timestamp.split(':')[0], 10);
 if (!isNaN(hour) && hour < 10) return false;
 } else if (dateFilter === 'Yesterday') {
 const hour = parseInt(d.timestamp.split(':')[0], 10);
 if (!isNaN(hour) && hour >= 10) return false;
 }

 return true;
 });

 // 2. Fuzzy Grouping & Deduplication of Plate Readings
 const vehicleGroups: VehicleGroup[] = [];

 filteredDetections.forEach(det => {
 // Check if det matches an existing group fuzzy-wise
 let matchedGroup = vehicleGroups.find(g => arePlatesFuzzyEqual(g.primaryPlate, det.plate));

 if (!matchedGroup) {
 const isBlacklisted = det.plate === 'MH14XY9999';
 const isLowConf = det.confidence < 0.55 || det.plate.startsWith('UNCLEAR');

 let status: 'VERIFIED' | 'NEEDS_REVIEW' | 'BLACKLISTED' = 'VERIFIED';
 let statusLabel = 'High Confidence';

 if (isBlacklisted) {
 status = 'BLACKLISTED';
 statusLabel = 'ALERT: Blacklisted Vehicle';
 } else if (isLowConf) {
 status = 'NEEDS_REVIEW';
 statusLabel = 'Needs Review (Low Confidence)';
 }

 matchedGroup = {
 primaryPlate: det.plate,
 displayPlate: det.plate.startsWith('UNCLEAR') ? 'Unclear Plate' : det.plate,
 ocrVariants: [],
 detections: [det],
 latestDetection: det,
 maxConfidence: det.confidence,
 status,
 statusLabel
 };
 vehicleGroups.push(matchedGroup);
 } else {
 matchedGroup.detections.push(det);

 // Track OCR variants if different from primary
 if (det.plate !== matchedGroup.primaryPlate && !matchedGroup.ocrVariants.includes(det.plate)) {
 matchedGroup.ocrVariants.push(det.plate);
 }

 // Keep plate with highest confidence as primary
 if (det.confidence > matchedGroup.maxConfidence && !det.plate.startsWith('UNCLEAR')) {
 if (!matchedGroup.ocrVariants.includes(matchedGroup.primaryPlate) && matchedGroup.primaryPlate !== det.plate) {
 matchedGroup.ocrVariants.push(matchedGroup.primaryPlate);
 }
 matchedGroup.primaryPlate = det.plate;
 matchedGroup.displayPlate = det.plate;
 matchedGroup.maxConfidence = det.confidence;
 }

 // Update latest detection if timestamp is more recent
 if (det.timestamp.localeCompare(matchedGroup.latestDetection.timestamp) > 0) {
 matchedGroup.latestDetection = det;
 }
 }
 });

 const resetFilters = () => {
 setSearchTerm('');
 setDateFilter('All');
 setTimeFilter('All');
 setCameraFilter('All');
 };

 const hasActiveFilters = searchTerm || dateFilter !== 'All' || timeFilter !== 'All' || cameraFilter !== 'All';

 return (
 <div className="flex flex-col gap-6 h-full animate-in fade-in duration-300">
 
 {/* Header & Search */}
 <Card variant="glow" className="p-6 shrink-0">
 <h2 className="text-2xl font-bold text-white mb-6">Advanced Vehicle Search</h2>
 
 <div className="flex flex-col md:flex-row gap-4">
 <div className="flex-1 relative">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400" />
 <input 
 type="text" 
 placeholder="Enter vehicle number (e.g. MH12AB1234)..." 
 value={searchTerm}
 onChange={e => setSearchTerm(e.target.value)}
 className="bg-[#040d1a] pl-12 pr-4 py-3.5 border border-[#1e3a5f] rounded-lg text-lg font-bold w-full focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all placeholder:font-normal placeholder:text-slate-500 text-white uppercase"
 />
 {searchTerm && (
 <button 
 onClick={() => setSearchTerm('')} 
 className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
 >
 <X className="w-5 h-5" />
 </button>
 )}
 </div>
 <Button variant="primary" className="px-8 py-3.5 rounded-lg font-bold shadow-md text-lg h-auto">
 Search Database
 </Button>
 </div>

 {/* Filters */}
 <div className="flex flex-wrap items-center gap-3 mt-5 pt-5 border-t border-[#1e3a5f]">
 <div className="flex items-center gap-2 bg-[#091a33]/50 border border-[#1e3a5f] rounded-md px-3 py-1.5 hover:border-cyan-500/50 transition-colors">
 <Calendar className="w-3.5 h-3.5 text-cyan-400" />
 <select 
 value={dateFilter}
 onChange={e => setDateFilter(e.target.value)}
 className="bg-transparent text-xs font-bold text-slate-300 outline-none cursor-pointer pr-2"
 >
 <option value="All">All Dates</option>
 <option value="Today">Today</option>
 <option value="Yesterday">Yesterday</option>
 <option value="Last 7 Days">Last 7 Days</option>
 </select>
 </div>
 
 <div className="flex items-center gap-2 bg-[#091a33]/50 border border-[#1e3a5f] rounded-md px-3 py-1.5 hover:border-cyan-500/50 transition-colors">
 <Clock className="w-3.5 h-3.5 text-cyan-400" />
 <select 
 value={timeFilter}
 onChange={e => setTimeFilter(e.target.value)}
 className="bg-transparent text-xs font-bold text-slate-300 outline-none cursor-pointer pr-2"
 >
 <option value="All">All Hours</option>
 <option value="Morning (06-12)">Morning (06-12)</option>
 <option value="Evening (16-22)">Evening (16-22)</option>
 </select>
 </div>
 
 <div className="flex items-center gap-2 bg-[#091a33]/50 border border-[#1e3a5f] rounded-md px-3 py-1.5 hover:border-cyan-500/50 transition-colors">
 <Camera className="w-3.5 h-3.5 text-cyan-400" />
 <select 
 value={cameraFilter}
 onChange={e => setCameraFilter(e.target.value)}
 className="bg-transparent text-xs font-bold text-slate-300 outline-none cursor-pointer max-w-[140px] pr-2 text-ellipsis"
 >
 <option value="All">All Cameras</option>
 {cameras.map(c => <option key={c.id} value={c.id}>{c.id} - {c.location}</option>)}
 </select>
 </div>
 
 {hasActiveFilters && (
 <>
 <div className="h-5 w-px bg-[#1e3a5f] mx-2"></div>
 <button 
 onClick={resetFilters}
 className="text-xs font-bold text-red-400 flex items-center gap-1.5 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-md transition-colors"
 >
 <X className="w-3.5 h-3.5" /> Clear Filters
 </button>
 </>
 )}
 </div>
 </Card>

 {/* Results */}
 <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
 <div className="flex items-end gap-3 mb-4 pb-2 border-b border-[#1e3a5f]/50">
 <h3 className="text-[16px] font-black text-white uppercase tracking-wider leading-none">Search Results</h3>
 <span className="text-sm font-bold text-cyan-400 leading-none">{vehicleGroups.length} unique vehicles found</span>
 </div>
 
 <div className="space-y-4">
 {vehicleGroups.map(group => {
 const latest = group.latestDetection;
 const cam = cameras.find(c => c.id === latest.cameraId);
 const isExpanded = expandedPlate === group.primaryPlate;

 return (
 <Card 
 variant="glass"
 key={group.primaryPlate} 
 className="p-4 hover:border-cyan-500/50 transition-all group flex flex-col gap-3"
 >
 <div className="flex flex-col md:flex-row gap-4 items-center cursor-pointer" onClick={() => navigate(`/dashboard/tracking?plate=${group.primaryPlate}`)}>
 {/* Images */}
 <div className="flex gap-[10px] shrink-0">
 <img 
 src={latest.vehicleImg} 
 alt="Vehicle" 
 className="w-[110px] h-[80px] object-cover rounded-lg border border-[#1e3a5f]/50 bg-[#040d1a] shadow-sm" 
 />
 <img 
 src={latest.plateImg} 
 alt="Plate crop" 
 className="w-[90px] h-[80px] object-cover rounded-lg border border-[#1e3a5f]/50 bg-[#040d1a] shadow-sm" 
 />
 </div>

 {/* Details Grid */}
 <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 w-full items-center pl-2">
 <div className="flex flex-col justify-center">
 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Number Plate</div>
 <div className="text-xl font-black text-white font-mono leading-none flex items-center gap-2">
 {group.displayPlate}
 </div>
 {group.ocrVariants.length > 0 && (
 <div className="text-[10px] text-slate-400 mt-1.5 font-mono">
 Merged variants: {group.ocrVariants.join(', ')}
 </div>
 )}
 </div>

 <div className="flex flex-col justify-center">
 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Last Seen Camera</div>
 <div className="text-sm font-bold text-cyan-400 leading-tight">{latest.cameraId}</div>
 <div className="text-xs font-medium text-slate-400 mt-0.5">{cam?.location}</div>
 </div>

 <div className="flex flex-col justify-center">
 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Confidence & Status</div>
 <div className="flex items-center gap-1.5">
 {group.status === 'BLACKLISTED' && (
 <Badge variant="danger" className="flex items-center gap-1 text-[10px] px-2 py-0.5">
 <AlertCircle size={12} /> {group.statusLabel}
 </Badge>
 )}
 {group.status === 'NEEDS_REVIEW' && (
 <Badge variant="warning" className="flex items-center gap-1 text-[10px] px-2 py-0.5">
 <AlertTriangle size={12} /> {group.statusLabel}
 </Badge>
 )}
 {group.status === 'VERIFIED' && (
 <Badge variant="success" className="flex items-center gap-1 text-[10px] px-2 py-0.5">
 <ShieldCheck size={12} /> {(group.maxConfidence * 100).toFixed(1)}% Confidence
 </Badge>
 )}
 </div>
 </div>

 <div className="flex flex-col justify-center">
 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sightings History</div>
 <div className="text-sm font-bold text-slate-300 leading-none">
 {group.detections.length} Total {group.detections.length > 1 ? 'Camera Sightings' : 'Sighting'}
 </div>
 </div>
 </div>

 {/* Arrow Action */}
 <div className="shrink-0 p-2.5 bg-[#091a33] border border-[#1e3a5f] rounded-full group-hover:bg-cyan-600 group-hover:border-cyan-500 transition-colors">
 <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
 </div>
 </div>

 {/* Sighting Timeline Drawer inside Card */}
 {group.detections.length > 1 && (
 <div className="mt-2 pt-3 border-t border-[#1e3a5f]/80">
 <button 
 onClick={(e) => { e.stopPropagation(); setExpandedPlate(isExpanded ? null : group.primaryPlate); }}
 className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1"
 >
 {isExpanded ? 'Hide Sighting History' : `View All ${group.detections.length} Sightings Timeline`}
 </button>

 {isExpanded && (
 <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 bg-[#040d1a]/60 p-3 rounded-lg border border-[#1e3a5f]">
 {group.detections.map((d, i) => (
 <div key={i} className="p-2 bg-[#081221] rounded border border-[#1e3a5f] flex justify-between items-center text-xs">
 <div>
 <div className="font-bold text-cyan-400">{d.cameraId}</div>
 <div className="text-[10px] text-slate-400">{d.location}</div>
 </div>
 <div className="text-right">
 <div className="font-bold text-slate-300">{d.timestamp}</div>
 <div className="text-[10px] text-teal-400">{(d.confidence * 100).toFixed(0)}% Conf</div>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 )}
 </Card>
 );
 })}
 
 {vehicleGroups.length === 0 && (
 <Card variant="glass" className="text-center py-12 border-dashed border-[#1e3a5f]">
 <div className="text-slate-400 mb-2 font-medium">No vehicles found matching current search and filter criteria.</div>
 <button className="text-cyan-400 font-bold text-sm hover:underline" onClick={resetFilters}>Reset all filters</button>
 </Card>
 )}
 </div>
 </div>
 </div>
 );
}
