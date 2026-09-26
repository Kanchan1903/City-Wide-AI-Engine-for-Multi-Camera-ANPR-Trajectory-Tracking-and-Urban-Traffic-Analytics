import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { Search, Filter, Calendar, Clock, Camera, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export default function ANPRSearch() {
  const { detections, cameras } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Group detections by plate to show unique vehicles first
  const grouped = detections.reduce((acc, curr) => {
    if (!acc[curr.plate]) acc[curr.plate] = [];
    acc[curr.plate].push(curr);
    return acc;
  }, {} as Record<string, typeof detections>);

  const uniquePlates = Object.keys(grouped).filter(p => p.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col gap-6 h-full animate-in fade-in duration-300">
      
      {/* Header & Search */}
      <Card variant="glow" className="p-6 shrink-0">
        <h2 className="text-2xl font-bold text-white mb-6">Advanced Vehicle Search</h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
            <input 
              type="text" 
              placeholder="Enter vehicle number (e.g. MH12AB1234)..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3.5 border-2 border-slate-800 rounded-lg text-lg font-bold w-full focus:border-[#1769FF] focus:ring-4 focus:ring-[#1769FF]/10 outline-none transition-all placeholder:font-normal placeholder:text-slate-400 text-white uppercase"
            />
          </div>
          <Button variant="primary" className="px-8 py-3.5 rounded-lg font-bold shadow-md text-lg h-auto">
            Search Database
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mt-5 pt-5 border-t border-slate-800">
          <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/80 rounded-md px-3 py-1.5 hover:border-slate-600 transition-colors">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <select className="bg-transparent text-xs font-bold text-slate-300 outline-none cursor-pointer pr-2">
              <option>Today</option>
              <option>Yesterday</option>
              <option>Last 7 Days</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/80 rounded-md px-3 py-1.5 hover:border-slate-600 transition-colors">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <select className="bg-transparent text-xs font-bold text-slate-300 outline-none cursor-pointer pr-2">
              <option>All Hours</option>
              <option>Morning (06-12)</option>
              <option>Evening (16-22)</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/80 rounded-md px-3 py-1.5 hover:border-slate-600 transition-colors">
            <Camera className="w-3.5 h-3.5 text-blue-400" />
            <select className="bg-transparent text-xs font-bold text-slate-300 outline-none cursor-pointer max-w-[120px] pr-2 text-ellipsis">
              <option>All Cameras</option>
              {cameras.map(c => <option key={c.id}>{c.id}</option>)}
            </select>
          </div>
          
          <div className="h-5 w-px bg-slate-700 mx-2"></div>
          
          <button className="text-xs font-bold text-blue-400 flex items-center gap-1.5 hover:text-blue-300 hover:bg-blue-500/10 px-3 py-1.5 rounded-md transition-colors">
            <Filter className="w-3.5 h-3.5" /> More Filters
          </button>
        </div>
      </Card>

      {/* Results */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
        <div className="flex items-end gap-3 mb-4 pb-2 border-b border-slate-800/50">
          <h3 className="text-[16px] font-black text-white uppercase tracking-wider leading-none">Search Results</h3>
          <span className="text-sm font-bold text-blue-400 leading-none">{uniquePlates.length} vehicles found</span>
        </div>
        
        <div className="space-y-4">
          {uniquePlates.map(plate => {
            const latest = grouped[plate].sort((a,b) => b.timestamp.localeCompare(a.timestamp))[0];
            const cam = cameras.find(c => c.id === latest.cameraId);

            return (
              <Card 
                variant="glass"
                key={plate} 
                className="p-3 hover:border-[#1769FF]/50 transition-all cursor-pointer group flex flex-col md:flex-row gap-4 items-center h-auto md:h-[120px]"
                onClick={() => navigate(`/dashboard/tracking?plate=${plate}`)}
              >
                {/* Images */}
                <div className="flex gap-[10px] shrink-0">
                  <img 
                    src={latest.vehicleImg} 
                    alt="Vehicle" 
                    className="w-[110px] h-[80px] object-cover rounded-lg border border-slate-700/50 bg-slate-900 shadow-sm" 
                  />
                  <img 
                    src={latest.plateImg} 
                    alt="Plate crop" 
                    className="w-[90px] h-[80px] object-cover rounded-lg border border-slate-700/50 bg-slate-900 shadow-sm" 
                  />
                </div>

                {/* Details */}
                <div className="flex-1 grid grid-cols-4 gap-4 w-full items-center pl-2">
                  <div className="flex flex-col justify-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Number Plate</div>
                    <div className="text-lg font-black text-white leading-none">{plate}</div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Last Seen Camera</div>
                    <div className="text-sm font-bold text-blue-400 leading-tight">{latest.cameraId}</div>
                    <div className="text-xs font-medium text-slate-400 mt-0.5">{cam?.location}</div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Timestamp</div>
                    <div className="text-sm font-bold text-slate-200 leading-tight">{latest.timestamp}</div>
                    <div className="text-[10px] font-medium text-emerald-400 mt-0.5">{(latest.confidence * 100).toFixed(1)}% Confidence</div>
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sightings</div>
                    <div className="text-sm font-bold text-slate-200 leading-none">{grouped[plate].length} Total</div>
                  </div>
                </div>

                {/* Action */}
                <div className="shrink-0 p-2.5 bg-slate-800/50 rounded-full group-hover:bg-[#1769FF] transition-colors">
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
                </div>
              </Card>
            );
          })}
          
          {uniquePlates.length === 0 && (
            <Card variant="glass" className="text-center py-12 border-dashed">
              <div className="text-slate-400 mb-2 font-medium">No vehicles found matching "{searchTerm}"</div>
              <button className="text-blue-400 font-bold text-sm hover:underline" onClick={() => setSearchTerm('')}>Clear search</button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
