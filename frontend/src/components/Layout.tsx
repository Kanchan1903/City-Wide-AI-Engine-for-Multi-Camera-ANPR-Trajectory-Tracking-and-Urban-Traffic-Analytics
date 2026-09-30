import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import VehicleIntelligenceDrawer from './VehicleIntelligenceDrawer';
import LiveCameraModal from './LiveCameraModal';
import { Shield, LayoutDashboard, BarChart2, Users, FileText, Calendar, Bell, Settings, LogOut } from 'lucide-react';
import React from 'react';

const Layout = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex bg-[#F4F6F9] font-sans text-slate-800 selection:bg-purple-500/30">
      
      {/* Sidebar */}
      <aside className="w-24 bg-[#764AF1] flex flex-col items-center py-8 shrink-0 shadow-[4px_0_24px_rgba(118,74,241,0.2)] z-50">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-12 shadow-lg cursor-pointer" onClick={() => navigate('/landing')}>
          <Shield className="w-6 h-6 text-[#764AF1]" />
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
          <div className="w-12 h-12 rounded-xl bg-indigo-300 overflow-hidden border-2 border-white shadow-md">
            <img src="https://i.pravatar.cc/150?img=11" alt="User" className="w-full h-full object-cover" />
          </div>
          <button onClick={() => navigate('/')} className="text-white/70 hover:text-white transition-colors">
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
        `w-full aspect-square flex items-center justify-center rounded-[18px] transition-all duration-300 ${isActive ? 'bg-[#5B33C9] text-white shadow-inner' : 'text-white/60 hover:text-white hover:bg-[#6841D6]'}`
      }
    >
      {icon}
    </NavLink>
  );
};

export default Layout;
