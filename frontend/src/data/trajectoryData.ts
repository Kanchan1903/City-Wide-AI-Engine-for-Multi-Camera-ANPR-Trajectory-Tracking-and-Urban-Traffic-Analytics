export const demoTrajectory = [
  {
    cameraId: "CAM-001",
    timestamp: "10:05:00",
    latitude: 18.5204,
    longitude: 73.8567,
    plate: "MH12AB1234",
    confidence: 0.94
  },
  {
    cameraId: "CAM-002",
    timestamp: "10:11:15",
    latitude: 18.5254,
    longitude: 73.8600,
    plate: "MH12AB1234",
    confidence: 0.91
  },
  {
    cameraId: "CAM-004",
    timestamp: "10:18:45",
    latitude: 18.5220,
    longitude: 73.8450,
    plate: "MH12AB1234",
    confidence: 0.95
  },
  {
    cameraId: "CAM-003",
    timestamp: "10:25:21",
    latitude: 18.5300,
    longitude: 73.8650,
    plate: "MH12AB1234",
    confidence: 0.96
  },
  {
    cameraId: "CAM-005",
    timestamp: "10:36:32",
    latitude: 18.541067,
    longitude: 73.869852,
    plate: "MH12AB1234",
    confidence: 0.88
  }
];

import osrmData from './osrmRoute.json';

// Map OSRM [lon, lat] coordinates to Leaflet [lat, lon] coordinates
export const demoRouteGeoJSON = (osrmData.routes[0].geometry.coordinates as [number, number][]).map(
  (coord) => [coord[1], coord[0]] as [number, number]
);
