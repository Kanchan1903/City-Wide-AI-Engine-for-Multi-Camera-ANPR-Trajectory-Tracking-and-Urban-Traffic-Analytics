import { create } from 'zustand';

export interface Camera {
  id: string;
  location: string;
  latitude: number;
  longitude: number;
  status: 'online' | 'offline';
  img: string;
}

export interface Vehicle {
  plate: string;
  make: string;
  color: string;
  type: string;
  img: string;
}

export interface Detection {
  id: string;
  plate: string;
  cameraId: string;
  location: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  vehicleType: string;
  vehicleColor: string;
  confidence: number;
  direction: string;
  plateImg: string;
  vehicleImg: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  timestamp: number;
  type: 'warning' | 'error' | 'info';
  read: boolean;
  plate?: string;
  cameraId?: string;
}

interface AppState {
  cameras: Camera[];
  vehicles: Record<string, Vehicle>;
  detections: Detection[];
  alerts: Alert[];
  globalSearchPlate: string;
  stats: {
    totalScans: number;
    activeAlerts: number;
    vehiclesToday: number;
  };
  demoModeActive: boolean;
  selectedVehicleId: string | null;
  selectedCameraId: string | null;
  selectedCameraTimestamp: string | null;
  isVehicleDrawerOpen: boolean;
  isCameraModalOpen: boolean;
  
  toggleDemoMode: () => void;
  setGlobalSearchPlate: (plate: string) => void;
  markAlertAsRead: (id: string) => void;
  markAllAlertsAsRead: () => void;
  simulateTick: () => void;
  
  openVehicleDrawer: (plate: string) => void;
  closeVehicleDrawer: () => void;
  openCameraModal: (cameraId: string, timestamp?: string) => void;
  closeCameraModal: () => void;
  addDetection: (d: Detection) => void;
}

const initialCameras: Camera[] = [
  { id: 'CAM_001', location: 'Hinjawadi', latitude: 18.559, longitude: 73.786, status: 'online', img: '/traffic_cam_sparse.png' },
  { id: 'CAM_002', location: 'Shivajinagar', latitude: 18.525, longitude: 73.855, status: 'online', img: '/traffic_cam_shivajinagar.png' },
  { id: 'CAM_003', location: 'JM Road', latitude: 18.527, longitude: 73.858, status: 'online', img: '/traffic_cam_jm_road.png' },
  { id: 'CAM_004', location: 'Wagholi', latitude: 18.580, longitude: 73.978, status: 'online', img: '/traffic_cam_wagholi.png' },
  { id: 'CAM_005', location: 'University Road', latitude: 18.532, longitude: 73.829, status: 'online', img: '/traffic_cam_university_road.png' },
  { id: 'CAM_006', location: 'Swargate', latitude: 18.501, longitude: 73.859, status: 'online', img: '/traffic_cam_swargate.png' },
  { id: 'CAM_007', location: 'Kothrud', latitude: 18.500, longitude: 73.810, status: 'online', img: '/traffic_cam_hinjawadi.png' },
  { id: 'CAM_008', location: 'Baner', latitude: 18.560, longitude: 73.780, status: 'online', img: '/traffic_cam_shivajinagar.png' },
  { id: 'CAM_009', location: 'Aundh', latitude: 18.560, longitude: 73.805, status: 'online', img: '/traffic_cam_jm_road.png' },
  { id: 'CAM_010', location: 'Viman Nagar', latitude: 18.567, longitude: 73.914, status: 'online', img: '/traffic_cam_wagholi.png' },
  { id: 'CAM_011', location: 'Magarpatta', latitude: 18.515, longitude: 73.928, status: 'online', img: '/traffic_cam_university_road.png' },
  { id: 'CAM_012', location: 'Hadapsar', latitude: 18.502, longitude: 73.925, status: 'online', img: '/traffic_cam_swargate.png' },
  { id: 'CAM_013', location: 'Kharadi', latitude: 18.552, longitude: 73.935, status: 'online', img: '/traffic_cam_hinjawadi.png' },
  { id: 'CAM_014', location: 'Koregaon Park', latitude: 18.536, longitude: 73.893, status: 'online', img: '/traffic_cam_shivajinagar.png' },
  { id: 'CAM_015', location: 'Kalyani Nagar', latitude: 18.547, longitude: 73.903, status: 'online', img: '/traffic_cam_jm_road.png' },
];

const initialVehicles: Record<string, Vehicle> = {
  'MH12AB1234': { plate: 'MH12AB1234', make: 'Hyundai i20', color: 'White', type: 'Car', img: '/anpr_vehicle_match.png' },
  'MH14XY9999': { plate: 'MH14XY9999', make: 'Honda City', color: 'Silver', type: 'Car', img: '/veh_mh14.png' },
  'DL8CX4321': { plate: 'DL8CX4321', make: 'Toyota Fortuner', color: 'Black', type: 'SUV', img: '/veh_dl8c.png' },
  'KA01HQ1122': { plate: 'KA01HQ1122', make: 'Tata Nexon', color: 'Blue', type: 'SUV', img: '/veh_ka01.png' },
};

const initialDetections: Detection[] = [
  // MH12AB1234 (Route: CAM_001 -> CAM_002 -> CAM_003 -> CAM_004)
  { id: 'd1', plate: 'MH12AB1234', cameraId: 'CAM_001', location: 'Hinjawadi', latitude: 18.559, longitude: 73.786, timestamp: '10:00:12', vehicleType: 'Car', vehicleColor: 'White', confidence: 0.96, direction: 'Eastbound', plateImg: '/anpr_plate_crop.png', vehicleImg: '/anpr_vehicle_match.png' },
  { id: 'd2', plate: 'MH12AB123A', cameraId: 'CAM_002', location: 'Shivajinagar', latitude: 18.525, longitude: 73.855, timestamp: '10:05:14', vehicleType: 'Car', vehicleColor: 'White', confidence: 0.73, direction: 'Eastbound', plateImg: '/anpr_plate_crop.png', vehicleImg: '/anpr_vehicle_match.png' },
  { id: 'd3', plate: 'MH12AB1234', cameraId: 'CAM_003', location: 'JM Road', latitude: 18.527, longitude: 73.858, timestamp: '10:12:30', vehicleType: 'Car', vehicleColor: 'White', confidence: 0.91, direction: 'Eastbound', plateImg: '/anpr_plate_crop.png', vehicleImg: '/anpr_vehicle_match.png' },
  { id: 'd4', plate: 'MH12ABI234', cameraId: 'CAM_004', location: 'Wagholi', latitude: 18.580, longitude: 73.978, timestamp: '10:18:45', vehicleType: 'Car', vehicleColor: 'White', confidence: 0.89, direction: 'Eastbound', plateImg: '/anpr_plate_crop.png', vehicleImg: '/anpr_vehicle_match.png' },

  // MH14XY9999 (Route: CAM_006 -> CAM_003 -> CAM_002)
  { id: 'd5', plate: 'MH14XY9999', cameraId: 'CAM_006', location: 'Swargate', latitude: 18.501, longitude: 73.859, timestamp: '08:15:00', vehicleType: 'Car', vehicleColor: 'Silver', confidence: 0.94, direction: 'Northbound', plateImg: '/plate_mh14.png', vehicleImg: '/veh_mh14.png' },
  { id: 'd6', plate: 'MH14XY9999', cameraId: 'CAM_003', location: 'JM Road', latitude: 18.527, longitude: 73.858, timestamp: '08:25:30', vehicleType: 'Car', vehicleColor: 'Silver', confidence: 0.88, direction: 'Northbound', plateImg: '/plate_mh14.png', vehicleImg: '/veh_mh14.png' },
  { id: 'd7', plate: 'MH14XY9999', cameraId: 'CAM_002', location: 'Shivajinagar', latitude: 18.525, longitude: 73.855, timestamp: '08:31:10', vehicleType: 'Car', vehicleColor: 'Silver', confidence: 0.91, direction: 'Northbound', plateImg: '/plate_mh14.png', vehicleImg: '/veh_mh14.png' },

  // DL8CX4321 (Route: CAM_005 -> CAM_002 -> CAM_001)
  { id: 'd8', plate: 'DL8CX4321', cameraId: 'CAM_005', location: 'University Road', latitude: 18.532, longitude: 73.829, timestamp: '14:30:00', vehicleType: 'SUV', vehicleColor: 'Black', confidence: 0.98, direction: 'Westbound', plateImg: '/plate_dl8c.png', vehicleImg: '/veh_dl8c.png' },
  { id: 'd9', plate: 'DL8CX4321', cameraId: 'CAM_002', location: 'Shivajinagar', latitude: 18.525, longitude: 73.855, timestamp: '14:38:20', vehicleType: 'SUV', vehicleColor: 'Black', confidence: 0.95, direction: 'Westbound', plateImg: '/plate_dl8c.png', vehicleImg: '/veh_dl8c.png' },
  { id: 'd10', plate: 'DL8CX4321', cameraId: 'CAM_001', location: 'Hinjawadi', latitude: 18.559, longitude: 73.786, timestamp: '15:02:15', vehicleType: 'SUV', vehicleColor: 'Black', confidence: 0.92, direction: 'Westbound', plateImg: '/plate_dl8c.png', vehicleImg: '/veh_dl8c.png' },

  // KA01HQ1122 (Route: CAM_004 -> CAM_006)
  { id: 'd11', plate: 'KA01HQ1122', cameraId: 'CAM_004', location: 'Wagholi', latitude: 18.580, longitude: 73.978, timestamp: '18:45:00', vehicleType: 'SUV', vehicleColor: 'Blue', confidence: 0.85, direction: 'Southbound', plateImg: '/plate_ka01.png', vehicleImg: '/veh_ka01.png' },
  { id: 'd12', plate: 'KA01HQ1122', cameraId: 'CAM_006', location: 'Swargate', latitude: 18.501, longitude: 73.859, timestamp: '19:20:10', vehicleType: 'SUV', vehicleColor: 'Blue', confidence: 0.81, direction: 'Southbound', plateImg: '/plate_ka01.png', vehicleImg: '/veh_ka01.png' },
];

export const useStore = create<AppState>((set, get) => ({
  cameras: initialCameras,
  vehicles: initialVehicles,
  detections: initialDetections,
  alerts: [
    { id: 'a1', title: 'Suspicious Vehicle Detected', description: 'Vehicle MH12AB1234 spotted at CAM_004', timestamp: Date.now() - 10 * 60 * 1000, type: 'warning', read: false, plate: 'MH12AB1234', cameraId: 'CAM_004' }
  ],
  globalSearchPlate: 'MH12AB1234',
  demoModeActive: false,
  selectedVehicleId: null,
  selectedCameraId: null,
  selectedCameraTimestamp: null,
  isVehicleDrawerOpen: false,
  isCameraModalOpen: false,
  stats: {
    totalScans: 124592,
    activeAlerts: 1,
    vehiclesToday: 42105,
  },
  
  toggleDemoMode: () => set((state) => ({ demoModeActive: !state.demoModeActive })),
  setGlobalSearchPlate: (plate) => set({ globalSearchPlate: plate.trim().toUpperCase() }),
  
  openVehicleDrawer: (plate) => set({ selectedVehicleId: plate, isVehicleDrawerOpen: true }),
  closeVehicleDrawer: () => set({ isVehicleDrawerOpen: false }),
  openCameraModal: (cameraId, timestamp) => set({ selectedCameraId: cameraId, selectedCameraTimestamp: timestamp || null, isCameraModalOpen: true }),
  closeCameraModal: () => set({ isCameraModalOpen: false, selectedCameraTimestamp: null }),
  addDetection: (d) => set((state) => ({ detections: [d, ...state.detections] })),
  
  markAlertAsRead: (id) => set((state) => ({
    alerts: state.alerts.map(a => a.id === id ? { ...a, read: true } : a)
  })),

  markAllAlertsAsRead: () => set((state) => ({
    alerts: state.alerts.map(a => ({ ...a, read: true }))
  })),

  simulateTick: () => set((state) => {
    // Randomly update stats to make dashboard alive
    const newScans = state.stats.totalScans + Math.floor(Math.random() * 5);
    const newVehicles = state.stats.vehiclesToday + Math.floor(Math.random() * 2);
    
    let updatedCameras = [...state.cameras];
    let updatedAlerts = [...state.alerts];
    
    // In Demo Mode, simulate more activity
      if (state.demoModeActive && Math.random() < 0.1) {
      const alertTypes: ('warning' | 'error' | 'info')[] = ['warning', 'error', 'info'];
      const randomType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      
      const newAlert: Alert = {
        id: `alert_${Date.now()}`,
        title: randomType === 'error' ? 'Blacklisted Vehicle Detected' : randomType === 'warning' ? 'Speed Violation' : 'Traffic Congestion',
        description: randomType === 'error' ? 'Vehicle MH14XY9999 (Stolen) detected at CAM_002.' : randomType === 'warning' ? 'Vehicle KA01HQ1122 exceeding 80km/h at CAM_006.' : 'Heavy traffic detected at Junction #4.',
        timestamp: Date.now(),
        type: randomType,
        read: false,
        plate: randomType === 'error' ? 'MH14XY9999' : randomType === 'warning' ? 'KA01HQ1122' : undefined,
        cameraId: randomType === 'error' ? 'CAM_002' : randomType === 'warning' ? 'CAM_006' : undefined
      };
      
      updatedAlerts = [newAlert, ...updatedAlerts].slice(0, 50); // Keep max 50
    }

    return {
      stats: { ...state.stats, totalScans: newScans, vehiclesToday: newVehicles },
      cameras: updatedCameras,
      alerts: updatedAlerts
    };
  })
}));
