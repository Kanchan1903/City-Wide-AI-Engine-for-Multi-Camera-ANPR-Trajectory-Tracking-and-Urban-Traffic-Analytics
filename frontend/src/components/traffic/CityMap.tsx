import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import './leaflet-setup';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import axios from 'axios';

// Fix Leaflet default icon issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const defaultCameraIcon = new L.DivIcon({
  className: 'custom-icon',
  html: `<div style="background-color: #4CD3E8; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

const HeatmapLayer = ({ points, active }: { points: any[], active: boolean }) => {
  const map = useMap();
  useEffect(() => {
    if (!active || !points || points.length === 0) return;
    const heat = (L as any).heatLayer(points, {
      radius: 20,
      blur: 15,
      max: 1.0,
      gradient: { 0.2: '#22c55e', 0.5: '#f59e0b', 0.8: '#ef4444' }
    }).addTo(map);

    return () => {
      map.removeLayer(heat);
    };
  }, [points, map, active]);
  return null;
};

const FitBounds = ({ route }: { route: [number, number][] | undefined }) => {
  const map = useMap();
  useEffect(() => {
    if (route && route.length > 1) {
      const bounds = L.latLngBounds(route);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [route, map]);
  return null;
};

// Generate deterministic but realistic clustered mock points
const generateMockHeatmapPoints = (timeOfDay?: number) => {
  const points: [number, number, number][] = [];
  const hotspots = [
    [18.525, 73.855], // Shivajinagar
    [18.559, 73.786], // Hinjawadi
    [18.515, 73.815]  // Kothrud
  ];
  
  let multiplier = 1.0;
  if (timeOfDay !== undefined) {
    if (timeOfDay >= 8 && timeOfDay <= 12) {
      // Morning rush peak at 10
      multiplier = 0.5 + 1.2 * Math.exp(-Math.pow(timeOfDay - 10, 2) / 2);
    } else if (timeOfDay >= 16 && timeOfDay <= 20) {
      // Evening rush peak at 18
      multiplier = 0.5 + 1.5 * Math.exp(-Math.pow(timeOfDay - 18, 2) / 2);
    } else if (timeOfDay > 12 && timeOfDay < 16) {
      // Midday lull
      multiplier = 0.6;
    } else {
      // Early morning / late night
      multiplier = 0.2;
    }
  }
  
  hotspots.forEach(center => {
    // High intensity near center (15%)
    for(let i=0; i<15; i++) {
      points.push([center[0] + (Math.random()-0.5)*0.005, center[1] + (Math.random()-0.5)*0.005, Math.min(1.0, (0.7 + Math.random()*0.3) * multiplier)]);
    }
    // Medium intensity (25%)
    for(let i=0; i<25; i++) {
      points.push([center[0] + (Math.random()-0.5)*0.015, center[1] + (Math.random()-0.5)*0.015, Math.min(1.0, (0.4 + Math.random()*0.2) * multiplier)]);
    }
    // Low intensity (60%)
    for(let i=0; i<60; i++) {
      points.push([center[0] + (Math.random()-0.5)*0.03, center[1] + (Math.random()-0.5)*0.03, Math.min(1.0, (0.1 + Math.random()*0.2) * multiplier)]);
    }
  });
  return points;
};

const mockCongestionData = [
  { status: 'CONGESTED', path: [[18.525, 73.855], [18.527, 73.858]] },
  { status: 'CONGESTED', path: [[18.559, 73.786], [18.562, 73.790]] }
];

import { useStore } from '../../store/store';

// Inside CityMap component (we will replace the CityMap definition block):
const CityMap = ({ layers, routePath, routeSequence, timeOfDay, routeProgress = 100 }: { layers?: any, routePath?: [number, number][], routeSequence?: any[], timeOfDay?: number, routeProgress?: number }) => {
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [congestionData, setCongestionData] = useState<any[]>([]);
  const [detailedRoute, setDetailedRoute] = useState<[number, number][] | null>(null);
  const { openCameraModal, openVehicleDrawer, cameras } = useStore();

  useEffect(() => {
    // Generate Heatmap Data
    setHeatmapData(generateMockHeatmapPoints(timeOfDay));
    
    // Generate Congestion Data based on time
    if (timeOfDay !== undefined) {
      if ((timeOfDay >= 9 && timeOfDay <= 11) || (timeOfDay >= 17 && timeOfDay <= 19)) {
        setCongestionData(mockCongestionData);
      } else {
        setCongestionData([]);
      }
    } else {
      setCongestionData(mockCongestionData);
    }
    
    // Only set jitter interval if timeOfDay is NOT actively being controlled
    if (timeOfDay === undefined) {
      const interval = setInterval(() => {
        setHeatmapData(prev => {
          const next = [...prev];
          for (let i = 0; i < 5; i++) {
            const idx = Math.floor(Math.random() * next.length);
            const p = next[idx];
            next[idx] = [p[0], p[1], Math.max(0.1, Math.min(1.0, p[2] + (Math.random() - 0.5) * 0.2))];
          }
          return next;
        });
      }, 18000);
      return () => clearInterval(interval);
    }
  }, [timeOfDay]);

  // Fetch detailed route from OSRM so line snaps to roads instead of being straight
  useEffect(() => {
    if (routePath && routePath.length > 1) {
      // OSRM expects longitude,latitude
      const coordsString = routePath.map(p => `${p[1]},${p[0]}`).join(';');
      fetch(`https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`)
        .then(res => res.json())
        .then(data => {
          if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            // Convert GeoJSON [lng, lat] back to Leaflet [lat, lng]
            const mappedRoute = data.routes[0].geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
            setDetailedRoute(mappedRoute);
          } else {
            setDetailedRoute(routePath);
          }
        })
        .catch(err => {
          console.error("OSRM Routing failed:", err);
          setDetailedRoute(routePath);
        });
    } else {
      setDetailedRoute(routePath || null);
    }
  }, [routePath]);

  // Determine center based on route if provided
  const center = routePath && routePath.length > 0 ? routePath[0] : [18.5250, 73.8550] as [number, number];

  const displayRoute = detailedRoute 
    ? detailedRoute.slice(0, Math.max(1, Math.floor((routeProgress / 100) * detailedRoute.length))) 
    : (routePath ? routePath.slice(0, Math.max(1, Math.floor((routeProgress / 100) * routePath.length))) : []);

  return (
    <div className="flex-1 z-0 relative w-full h-full">
      <MapContainer 
        center={center} 
        zoom={13} 
        className="w-full h-full"
        style={{ backgroundColor: '#0f172a' }}
        attributionControl={false}
        zoomControl={true}
      >
        <FitBounds route={routePath} />
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
          className="dark-map-tiles"
        />
        
        {heatmapData.length > 0 && <HeatmapLayer points={heatmapData} active={layers?.trafficDensity ?? true} />}

        {displayRoute && displayRoute.length > 0 && (
          <>
            <Polyline 
              positions={displayRoute} 
              color="#3b82f6" 
              weight={6} 
              opacity={0.8}
              dashArray="10, 10"
              className="animate-[dash_1s_linear_infinite]"
              eventHandlers={{
                click: () => openVehicleDrawer('MH12AB1234')
              }}
            />
            {/* Live tracking moving dot at the head of the route */}
            {routeProgress < 100 && (
              <Marker 
                position={displayRoute[displayRoute.length - 1]} 
                icon={new L.DivIcon({
                  className: 'route-head-marker',
                  html: `<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(59,130,246,0.8);"></div>`,
                  iconSize: [16, 16], iconAnchor: [8, 8]
                })}
              />
            )}
          </>
        )}

        {/* Render sequence markers if provided, otherwise fallback to start/end */}
        {routeSequence && routeSequence.length > 0 ? (
          routeSequence.map((cam, idx) => {
            const isStart = idx === 0;
            const isEnd = idx === routeSequence.length - 1;
            const color = isStart ? '#10b981' : (isEnd ? '#ef4444' : '#3b82f6');
            return (
              <Marker key={cam.id} position={[cam.lat, cam.lng]} icon={new L.DivIcon({
                className: `route-marker ${isStart ? 'start' : isEnd ? 'end' : 'mid'}`,
                html: `
                  <div style="display: flex; flex-direction: column; align-items: center;">
                    <div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px; font-family: sans-serif;">${idx + 1}</div>
                    <div style="background-color: rgba(15, 23, 42, 0.85); color: #60a5fa; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-top: 4px; white-space: nowrap; font-weight: bold; font-family: monospace; border: 1px solid rgba(59, 130, 246, 0.3);">${cam.time}</div>
                  </div>
                `,
                iconSize: [60, 50], iconAnchor: [30, 12]
              })}
              eventHandlers={{
                click: () => openCameraModal(cam.id)
              }}
              >
                <Popup className="custom-popup font-mono text-xs">
                  <div className="font-bold text-white mb-1 cursor-pointer hover:text-blue-400" onClick={() => openCameraModal(cam.id)}>{cam.id}</div>
                  <div className="text-blue-400 font-medium">Time: {cam.time}</div>
                  <div className="text-slate-300">Loc: {cam.location}</div>
                  <div className="text-slate-400 mt-1">Lat: {cam.lat.toFixed(4)}</div>
                  <div className="text-slate-400">Lng: {cam.lng.toFixed(4)}</div>
                </Popup>
              </Marker>
            );
          })
        ) : (
          routePath && routePath.length > 0 && (
            <>
              {/* Start Marker */}
              <Marker position={routePath[0]} icon={new L.DivIcon({
                className: 'route-marker start',
                html: `
                  <div style="display: flex; flex-direction: column; align-items: center;">
                    <div style="background-color: #10b981; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px; font-family: sans-serif;">1</div>
                    <div style="background-color: rgba(15, 23, 42, 0.85); color: #60a5fa; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-top: 4px; white-space: nowrap; font-weight: bold; font-family: monospace; border: 1px solid rgba(59, 130, 246, 0.3);">Start</div>
                  </div>
                `,
                iconSize: [60, 50], iconAnchor: [30, 12]
              })}>
                 <Popup className="custom-popup font-mono text-xs">Start Location</Popup>
              </Marker>
              {/* End Marker */}
              <Marker position={routePath[routePath.length - 1]} icon={new L.DivIcon({
                className: 'route-marker end',
                html: `
                  <div style="display: flex; flex-direction: column; align-items: center;">
                    <div style="background-color: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px; font-family: sans-serif;">${routePath.length}</div>
                    <div style="background-color: rgba(15, 23, 42, 0.85); color: #60a5fa; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-top: 4px; white-space: nowrap; font-weight: bold; font-family: monospace; border: 1px solid rgba(59, 130, 246, 0.3);">End</div>
                  </div>
                `,
                iconSize: [60, 50], iconAnchor: [30, 12]
              })}>
                 <Popup className="custom-popup font-mono text-xs">End Location</Popup>
              </Marker>
            </>
          )
        )}

        {(layers?.congestion ?? true) && congestionData.filter((c: any) => c.status === 'CONGESTED').map((segment: any, idx) => (
          <Polyline 
            key={idx}
            positions={segment.path} 
            color="#ef4444" 
            weight={8} 
            opacity={0.8}
            className="animate-pulse"
          />
        ))}

        {/* Render Cameras */}
        {(layers?.cameraLocations ?? true) && cameras.map(cam => (
          <Marker 
            key={cam.id} 
            position={[cam.latitude, cam.longitude]}
            icon={defaultCameraIcon}
            eventHandlers={{
              click: () => openCameraModal(cam.id)
            }}
          >
            <Popup className="custom-popup font-mono text-xs text-slate-200">
              <div className="font-bold text-blue-400 cursor-pointer hover:underline" onClick={() => openCameraModal(cam.id)}>{cam.id}</div>
              <div className="font-medium text-slate-300 mb-1">{cam.location}</div>
              <div className="text-slate-400 mt-1">Lat: {cam.latitude.toFixed(4)}</div>
              <div className="text-slate-400">Lng: {cam.longitude.toFixed(4)}</div>
              <div className="text-slate-400">Time: {new Date().toLocaleTimeString('en-US', { hour12: false })}</div>
              <div className="text-blue-500 text-[10px] mt-2 cursor-pointer hover:text-blue-400" onClick={() => openCameraModal(cam.id)}>▶ Click to view feed</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <style>{`
        .custom-popup .leaflet-popup-content-wrapper { background: #0f172a; color: #f1f5f9; border: 1px solid #1e293b; border-radius: 8px; padding: 4px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.5); }
        .custom-popup .leaflet-popup-tip { background: #0f172a; border: 1px solid #1e293b; }
        .dark-map-tiles { filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%); }
        @keyframes dash {
          to { stroke-dashoffset: -20; }
        }
      `}</style>
    </div>
  );
};

export default CityMap;
