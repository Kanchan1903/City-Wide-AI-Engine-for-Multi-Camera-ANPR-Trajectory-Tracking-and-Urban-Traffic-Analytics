import React from 'react';
import { formatTimeAgo } from '../utils/time';
import { ShieldAlert, AlertTriangle, Info } from 'lucide-react';
import type { Alert } from '../store/store';

interface AlertItemProps {
  alert: Alert;
  onClick?: () => void;
  compact?: boolean;
}

export default function AlertItem({ alert, onClick, compact = false }: AlertItemProps) {
  const isCritical = alert.type === 'error';
  const isWarning = alert.type === 'warning';
  
  const Icon = isCritical ? ShieldAlert : isWarning ? AlertTriangle : Info;
  
  const colorClass = isCritical ? 'text-red-500 bg-red-500/10 border-red-500/20' : 
                     isWarning ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' : 
                     'text-blue-500 bg-blue-500/10 border-blue-500/20';

  const badgeClass = isCritical ? 'text-red-400 bg-red-500/10 border-red-500/20' : 
                     isWarning ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 
                     'text-blue-400 bg-blue-500/10 border-blue-500/20';

  const severityText = isCritical ? 'CRITICAL' : isWarning ? 'WARNING' : 'INFO';

  return (
    <div 
      onClick={onClick}
      className={`flex items-start gap-3 transition-colors ${onClick ? 'cursor-pointer hover:bg-slate-50' : ''} ${compact ? 'p-3' : 'p-4'} ${!alert.read ? 'bg-slate-50/50' : ''}`}
    >
      <div className={`p-2 rounded-lg border shrink-0 shadow-sm ${colorClass}`}>
        <Icon className={compact ? "w-4 h-4" : "w-5 h-5"} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`font-bold truncate ${!alert.read ? 'text-slate-800' : 'text-slate-600'} ${compact ? 'text-sm' : ''}`}>
            {alert.title}
          </p>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border tracking-wider shrink-0 shadow-sm ${badgeClass}`}>
            {severityText}
          </span>
        </div>
        <p className={`font-medium mt-1 ${compact ? 'text-xs text-slate-500 line-clamp-1' : 'text-sm text-slate-500'}`}>
          {alert.description}
        </p>
        <div className={`font-mono text-slate-400 font-medium ${compact ? 'text-[9px] mt-1' : 'text-xs mt-2'}`}>
          {formatTimeAgo(alert.timestamp)}
        </div>
      </div>
    </div>
  );
}
