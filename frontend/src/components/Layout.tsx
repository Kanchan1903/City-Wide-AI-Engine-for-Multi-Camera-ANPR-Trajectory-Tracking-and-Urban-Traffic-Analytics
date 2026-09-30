import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import VehicleIntelligenceDrawer from './VehicleIntelligenceDrawer';
import LiveCameraModal from './LiveCameraModal';
import { Cctv, LayoutDashboard, BarChart2, Users, FileText, Calendar, Bell, Settings, LogOut } from 'lucide-react';
import React from 'react';

const Layout = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex bg-[#020610] font-sans text-slate-300 selection:bg-cyan-500/30 relative">
      
      {/* Sidebar */}
      <aside className="w-24 bg-[#091a33] border-r border-[#1e3a5f] flex flex-col items-center py-8 shrink-0 shadow-[4px_0_24px_rgba(6,182,212,0.05)] z-50">
        <div className="w-14 h-14 bg-[#091a33] border border-[#1e3a5f] rounded-2xl flex items-center justify-center mb-12 shadow-[0_0_15px_rgba(6,182,212,0.15)] cursor-pointer" onClick={() => navigate('/landing')}>
          <Cctv className="w-7 h-7 text-cyan-400 drop-shadow-md" />
        </div>
        
        <nav className="flex flex-col gap-4 w-full px-4 flex-1">
          <SidebarIcon to="/dashboard" icon={<LayoutDashboard size={24} />} exact />
          <SidebarIcon to="/dashboard/analytics" icon={<BarChart2 size={24} />} />
          <SidebarIcon to="/dashboard/cameras" icon={<Users size={24} />} />
          <SidebarIcon to="/dashboard/reports" icon={<FileText size={24} />} />
          <SidebarIcon to="/dashboard/tracking" icon={<Calendar size={24} />} />
          <SidebarIcon to="/dashboard/alerts" icon={<Bell size={24} />} />
          <SidebarIcon to="/dashboard/settings" icon={<Settings size={24} />} />
        </nav>

        <div className="mt-auto flex flex-col gap-8 items-center">
          <div className="w-12 h-12 rounded-xl bg-slate-800 overflow-hidden border-2 border-cyan-500/50 shadow-md">
            <img src="https://i.pravatar.cc/150?img=11" alt="User" className="w-full h-full object-cover" />
          </div>
          <button onClick={() => navigate('/')} className="text-slate-500 hover:text-cyan-400 transition-colors">
            <LogOut size={24} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full h-screen overflow-y-auto overflow-x-hidden p-10 custom-scrollbar relative z-10">
        <Outlet />
      </main>

      <VehicleIntelligenceDrawer />
      <LiveCameraModal />
    </div>
  );
};

const SidebarIcon = ({ to, icon, exact = false }: { to: string, icon: React.ReactNode, exact?: boolean }) => {
  return (
    <NavLink 
      to={to} 
      end={exact}
      className={({ isActive }) => 
        `w-full aspect-square flex items-center justify-center rounded-[18px] transition-all duration-300 ${isActive ? 'bg-[#0a1f3d] text-cyan-400 border border-[#1e3a5f] shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'text-slate-500 hover:text-cyan-300 hover:bg-[#1e3a5f]/40'}`
      }
    >
      {icon}
    </NavLink>
  );
};

export default Layout;
