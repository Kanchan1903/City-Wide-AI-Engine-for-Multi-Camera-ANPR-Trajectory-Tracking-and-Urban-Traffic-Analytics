import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardView from './pages/DashboardView';
import CameraNetworkView from './pages/CameraNetworkView';
import ANPRSearch from './pages/ANPRSearch';
import VehicleRoutes from './pages/VehicleRoutes';
import TrafficAnalytics from './pages/TrafficAnalytics';
import AlertsView from './pages/AlertsView';
import ReportsView from './pages/ReportsView';
import ANPRDemo from './pages/ANPRDemo';
import { AuthProvider } from './context/AuthContext';
import { useStore } from './store/store';

function App() {
 const simulateTick = useStore((state) => state.simulateTick);
 const demoModeActive = useStore((state) => state.demoModeActive);

 useEffect(() => {
 if (!demoModeActive) return;
 
 const interval = setInterval(() => {
 simulateTick();
 }, 3000); // Tick every 3 seconds for demo mode
 return () => clearInterval(interval);
 }, [simulateTick, demoModeActive]);

 const theme = useStore((state) => state.theme);
 useEffect(() => {
   if (theme === 'light') {
     document.documentElement.classList.remove('dark');
     document.documentElement.classList.add('light');
   } else {
     document.documentElement.classList.remove('light');
     document.documentElement.classList.add('dark');
   }
 }, [theme]);

 return (
 <AuthProvider>
 <Router>
 <Routes>
 {/* Login Page is root */}
 <Route path="/" element={<LoginPage />} />
 <Route path="/login" element={<Navigate to="/" replace />} />
 <Route path="/landing" element={<LandingPage />} />
 
 {/* Command Center routes inside Layout */}
 <Route path="/dashboard" element={<Layout />}>
 <Route index element={<DashboardView />} />
 <Route path="cameras" element={<CameraNetworkView />} />
 <Route path="search" element={<ANPRSearch />} />
 <Route path="anpr" element={<ANPRDemo />} />
 <Route path="tracking" element={<VehicleRoutes />} />
 <Route path="analytics" element={<TrafficAnalytics />} />
 <Route path="alerts" element={<AlertsView />} />
 <Route path="reports" element={<ReportsView />} />
 <Route path="area" element={<div className="p-6 text-xl text-slate-500 font-medium">Area Search Under Construction</div>} />
 <Route path="settings" element={<div className="p-6 text-xl text-slate-500 font-medium">System Settings Under Construction</div>} />
 <Route path="*" element={<Navigate to="/dashboard" replace />} />
 </Route>

 {/* Global Catch-all */}
 <Route path="*" element={<Navigate to="/" replace />} />
 </Routes>
 </Router>
 </AuthProvider>
 );
}

export default App;
