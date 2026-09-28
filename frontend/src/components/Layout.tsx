import { Outlet } from 'react-router-dom';
import VehicleIntelligenceDrawer from './VehicleIntelligenceDrawer';
import LiveCameraModal from './LiveCameraModal';
import TopNav from './TopNav';

const Layout = () => {
 return (
 <div className="min-h-screen w-full flex flex-col font-sans bg-slate-900 text-slate-300 selection:bg-blue-500/30 relative overflow-hidden">
 
 {/* Background Texture & Circles from Landing Page */}
 <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
 <div className="absolute inset-0 opacity-[0.2]" style={{ backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
 <div className="absolute w-[600px] h-[600px] border border-slate-700 border-dashed rounded-full opacity-50 animate-[spin_120s_linear_infinite]"></div>
 <div className="absolute w-[900px] h-[900px] border border-slate-700 border-dashed rounded-full opacity-40 animate-[spin_150s_linear_infinite_reverse]"></div>
 <div className="absolute w-[1200px] h-[1200px] border border-slate-700 border-dashed rounded-full opacity-30 animate-[spin_180s_linear_infinite]"></div>
 </div>

 <TopNav />
 
 <main className="flex-1 w-full max-w-[1400px] mx-auto overflow-y-auto overflow-x-hidden p-6 mt-6 mb-6 custom-scrollbar relative z-10 bg-slate-800/60 rounded-3xl border border-slate-800 shadow-2xl">
 <Outlet />
 </main>
 <VehicleIntelligenceDrawer />
 <LiveCameraModal />
 </div>
 );
};

export default Layout;
