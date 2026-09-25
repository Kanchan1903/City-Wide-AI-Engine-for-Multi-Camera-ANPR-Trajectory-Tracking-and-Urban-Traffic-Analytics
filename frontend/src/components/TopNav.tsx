import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function TopNav() {
  const navigate = useNavigate();

  return (
    <nav className="relative z-50 pt-6 px-4 md:px-8 max-w-[1400px] mx-auto w-full">
      <div className="bg-[#0f172a]/80 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.2)] px-4 py-3 flex items-center justify-between border border-slate-700/60 backdrop-blur-md overflow-hidden">
        {/* Logo */}
        <div className="flex items-center justify-start shrink-0 mr-2 lg:mr-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/landing')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              TRACE360
            </span>
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center justify-start lg:justify-center gap-4 lg:gap-6 xl:gap-7 text-sm font-semibold whitespace-nowrap overflow-x-auto hide-scrollbar px-2">
          <NavLink 
            to="/landing" 
            className={({ isActive }) => 
              `transition-colors flex items-center ${isActive ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`
            }
          >
            Home
          </NavLink>
          <NavLink 
            to="/dashboard" 
            end
            className={({ isActive }) => 
              `transition-colors flex items-center ${isActive ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`
            }
          >
            Explore
          </NavLink>
          <NavLink 
            to="/dashboard/analytics" 
            className={({ isActive }) => 
              `transition-colors flex items-center ${isActive ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`
            }
          >
            Analytics
          </NavLink>
          <NavLink 
            to="/dashboard/alerts" 
            className={({ isActive }) => 
              `transition-colors flex items-center ${isActive ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`
            }
          >
            Alerts
          </NavLink>
          <NavLink 
            to="/dashboard/tracking" 
            className={({ isActive }) => 
              `transition-colors flex items-center ${isActive ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`
            }
          >
            Tracking
          </NavLink>
          <NavLink 
            to="/dashboard/search" 
            className={({ isActive }) => 
              `transition-colors flex items-center ${isActive ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`
            }
          >
            Search
          </NavLink>
          <NavLink 
            to="/dashboard/anpr" 
            className={({ isActive }) => 
              `transition-colors flex items-center ${isActive ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`
            }
          >
            ANPR Demo
          </NavLink>
          <NavLink 
            to="/dashboard/cameras" 
            className={({ isActive }) => 
              `transition-colors flex items-center ${isActive ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`
            }
          >
            Cameras
          </NavLink>
        </div>
        {/* Action Toggle / Logout */}
        <div className="flex items-center justify-end shrink-0 ml-2 lg:ml-4">
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-sm font-bold shadow-sm transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
