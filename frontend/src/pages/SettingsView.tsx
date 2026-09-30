import React, { useState } from 'react';
import { Settings, Save, Bell, Shield, Database, Layout, Loader2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function SettingsView() {
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6 h-full animate-in fade-in duration-300">
      
      {/* Header */}
      <Card variant="glow" className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 p-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Settings className="text-cyan-500" /> System Settings</h2>
          <p className="text-sm text-slate-400 font-medium mt-1">Manage TRACE360 configurations and parameters</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleSave}
            disabled={saving}
            className="font-bold text-white bg-cyan-600 hover:bg-cyan-500 shadow-md h-10 px-6"
          >
            {saving ? (
              <><Loader2 size={16} className="mr-2 animate-spin" /> Saving...</>
            ) : (
              <><Save size={16} className="mr-2" /> Save Changes</>
            )}
          </Button>
        </div>
      </Card>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* General Configuration */}
          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <Layout className="text-cyan-400" size={20} /> 
              General Configuration
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Platform Name</label>
                <input 
                  type="text" 
                  defaultValue="TRACE360 Command Center"
                  className="w-full bg-[#040d1a] border border-[#1e3a5f] rounded-lg px-4 py-2.5 text-slate-200 font-medium focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Default City Zone</label>
                <select className="w-full bg-[#040d1a] border border-[#1e3a5f] rounded-lg px-4 py-2.5 text-slate-200 font-medium focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none">
                  <option>Pune - All Zones</option>
                  <option>Hinjawadi IT Park</option>
                  <option>Shivajinagar</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#081221] border border-[#1e3a5f] rounded-lg">
                <div>
                  <div className="font-bold text-slate-200">Dark Mode Optimization</div>
                  <div className="text-xs text-slate-400 mt-1">Force high-contrast UI for control rooms</div>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" name="toggle" id="toggle1" defaultChecked className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-[#081221] appearance-none cursor-pointer translate-x-6" />
                  <label htmlFor="toggle1" className="toggle-label block overflow-hidden h-6 rounded-full bg-cyan-500 cursor-pointer"></label>
                </div>
              </div>
            </div>
          </Card>

          {/* ANPR Engine Settings */}
          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <Database className="text-cyan-400" size={20} /> 
              ANPR Engine Parameters
            </h3>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-slate-400">Confidence Threshold</label>
                  <span className="text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">85%</span>
                </div>
                <input 
                  type="range" 
                  min="50" max="99" 
                  defaultValue="85"
                  className="w-full h-2 bg-[#081221] rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="text-xs text-slate-500 mt-2">Plates below this threshold will be flagged for manual review.</div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Data Retention Policy</label>
                <select className="w-full bg-[#040d1a] border border-[#1e3a5f] rounded-lg px-4 py-2.5 text-slate-200 font-medium focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none">
                  <option>30 Days (Standard)</option>
                  <option>90 Days (Extended)</option>
                  <option>1 Year (Archival)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Alert Configuration */}
          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <Bell className="text-cyan-400" size={20} /> 
              Alert & Notification Rules
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#081221] border border-[#1e3a5f] rounded-lg">
                <div>
                  <div className="font-bold text-slate-200">Blacklisted Vehicle Alerts</div>
                  <div className="text-xs text-slate-400 mt-1">Instant notification on match</div>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none">
                  <input type="checkbox" name="toggle" id="toggle2" defaultChecked className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-[#081221] appearance-none cursor-pointer translate-x-6" />
                  <label htmlFor="toggle2" className="toggle-label block overflow-hidden h-6 rounded-full bg-cyan-500 cursor-pointer"></label>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#081221] border border-[#1e3a5f] rounded-lg">
                <div>
                  <div className="font-bold text-slate-200">Congestion Warnings</div>
                  <div className="text-xs text-slate-400 mt-1">Alert when flow drops &lt; 20 veh/min</div>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none">
                  <input type="checkbox" name="toggle" id="toggle3" defaultChecked className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-[#081221] appearance-none cursor-pointer translate-x-6" />
                  <label htmlFor="toggle3" className="toggle-label block overflow-hidden h-6 rounded-full bg-cyan-500 cursor-pointer"></label>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#081221] border border-[#1e3a5f] rounded-lg">
                <div>
                  <div className="font-bold text-slate-200">Camera Offline Alerts</div>
                  <div className="text-xs text-slate-400 mt-1">Notify on connection drop</div>
                </div>
                <div className="relative inline-block w-12 mr-2 align-middle select-none">
                  <input type="checkbox" name="toggle" id="toggle4" defaultChecked className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 border-[#081221] appearance-none cursor-pointer translate-x-6" />
                  <label htmlFor="toggle4" className="toggle-label block overflow-hidden h-6 rounded-full bg-cyan-500 cursor-pointer"></label>
                </div>
              </div>
            </div>
          </Card>

          {/* Security & Access */}
          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <Shield className="text-cyan-400" size={20} /> 
              Security & Access
            </h3>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-400 mb-2">Session Timeout</label>
                <select className="w-full bg-[#040d1a] border border-[#1e3a5f] rounded-lg px-4 py-2.5 text-slate-200 font-medium focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none">
                  <option>15 Minutes</option>
                  <option>30 Minutes</option>
                  <option>1 Hour</option>
                  <option>Never (Not Recommended)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-[#1e3a5f]">
                <Button variant="outline" className="w-full font-bold text-slate-300 border-[#1e3a5f] bg-[#040d1a] hover:bg-[#0a1f3d] hover:text-white h-11">
                  Manage Access Tokens
                </Button>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}
