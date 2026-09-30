import React, { useState } from 'react';
import { FileText, Download, Calendar, Filter, FileSpreadsheet, FileIcon, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';

const reportTypes = [
 { id: 'daily', name: 'Daily Traffic Report', desc: 'Summary of total volume, peak hours, and category breakdown.' },
 { id: 'movement', name: 'Vehicle Movement Report', desc: 'OD pairs, common routes, and tracking analytics.' },
 { id: 'anpr', name: 'ANPR Accuracy Report', desc: 'Read accuracy, failure rates, and camera performance.' },
 { id: 'congestion', name: 'Congestion & Hotspot Report', desc: 'Delay durations, affected zones, and heatmaps.' },
 { id: 'alerts', name: 'Security & Alert Report', desc: 'Flagged vehicles, blacklisted matches, and response times.' }
];

export default function ReportsView() {
 const [generating, setGenerating] = useState<string | null>(null);

 const handleGenerate = (type: string) => {
 setGenerating(type);
 setTimeout(() => {
 setGenerating(null);
 }, 2000);
 };

 return (
 <div className="flex flex-col gap-6 h-full animate-in fade-in duration-300">
 
 {/* Header */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 bg-[#081221] p-6 rounded-xl border border-[#1e3a5f] shadow-sm">
 <div>
 <h2 className="text-2xl font-bold text-white flex items-center gap-2"><FileText className="text-cyan-500" /> Automated Reporting</h2>
 <p className="text-sm text-slate-400 font-medium mt-1">Generate and export system analytics</p>
 </div>
 
 <div className="flex items-center gap-3">
 <div className="flex items-center gap-2 bg-[#040d1a] border border-[#1e3a5f] rounded-lg px-3 py-2 h-10">
 <Calendar className="w-4 h-4 text-slate-400" />
 <span className="text-sm font-semibold text-slate-300">Last 7 Days</span>
 </div>
 <Button variant="outline" className="font-bold text-slate-300 bg-[#040d1a] border-[#1e3a5f] h-10">
 <Filter size={16} className="mr-2" /> Filters
 </Button>
 </div>
 </div>

 {/* Main Content */}
 <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {reportTypes.map(report => (
 <div key={report.id} className="bg-[#081221] rounded-xl border border-[#1e3a5f] shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow">
 
 <div className="w-12 h-12 rounded-xl bg-cyan-900/30 text-cyan-400 flex items-center justify-center mb-4">
 <FileText size={24} />
 </div>
 
 <h3 className="text-lg font-bold text-white mb-2">{report.name}</h3>
 <p className="text-sm text-slate-400 font-medium mb-6 flex-1">{report.desc}</p>
 
 <div className="flex flex-col gap-3">
 <Button 
 onClick={() => handleGenerate(report.id)}
 disabled={generating !== null}
 className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold h-11"
 >
 {generating === report.id ? (
 <><Loader2 size={18} className="mr-2 animate-spin" /> Generating...</>
 ) : (
 'Generate Report'
 )}
 </Button>
 
 <div className="grid grid-cols-2 gap-3">
 <Button variant="outline" className="w-full font-bold text-slate-300 border-[#1e3a5f] bg-[#040d1a] hover:bg-[#0a1f3d] hover:text-white" disabled={generating !== null}>
 <FileIcon size={16} className="mr-2 text-red-500" /> PDF
 </Button>
 <Button variant="outline" className="w-full font-bold text-slate-300 border-[#1e3a5f] bg-[#040d1a] hover:bg-[#0a1f3d] hover:text-white" disabled={generating !== null}>
 <FileSpreadsheet size={16} className="mr-2 text-emerald-500" /> CSV
 </Button>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}
