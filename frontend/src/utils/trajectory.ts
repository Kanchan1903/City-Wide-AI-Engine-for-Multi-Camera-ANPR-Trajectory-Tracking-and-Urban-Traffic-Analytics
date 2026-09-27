import type { Detection, Camera } from '../store/store';

// Helper for Levenshtein Distance (fuzzy matching for OCR)
function getEditDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // insertion
        matrix[j - 1][i] + 1, // deletion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  return matrix[b.length][a.length];
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function parseTime(timeStr: string): number {
  const [hours, minutes, seconds] = timeStr.split(':').map(Number);
  return (hours * 3600) + (minutes * 60) + seconds;
}

export function buildTrajectory(targetPlate: string, detections: Detection[], cameras: Camera[]): Detection[] {
  const normalizedTarget = targetPlate.trim().toUpperCase();
  
  // 1. Find all detections with exact or fuzzy matched plates
  const matchedDetections = detections.filter(d => {
    const plate = d.plate.toUpperCase();
    if (plate === normalizedTarget) return true;
    
    // Fuzzy match (allow up to 2 characters difference for a 10 char plate)
    const maxErrors = targetPlate.length > 6 ? 2 : 1;
    const distance = getEditDistance(plate, normalizedTarget);
    return distance <= maxErrors;
  });

  // 2. Sort chronologically
  matchedDetections.sort((a, b) => parseTime(a.timestamp) - parseTime(b.timestamp));

  // 3. Spatio-temporal validation to prevent merging completely different vehicles
  const validatedTrajectory: Detection[] = [];
  
  for (const det of matchedDetections) {
    if (validatedTrajectory.length === 0) {
      validatedTrajectory.push(det);
      continue;
    }
    
    const prev = validatedTrajectory[validatedTrajectory.length - 1];
    
    const timeDiffSeconds = parseTime(det.timestamp) - parseTime(prev.timestamp);
    if (timeDiffSeconds <= 0) continue; // Out of order or same timestamp
    
    const distanceKm = calculateDistance(prev.latitude, prev.longitude, det.latitude, det.longitude);
    
    // Speed in km/h
    const speedKmH = distanceKm / (timeDiffSeconds / 3600);
    
    // If speed is impossible (e.g. > 200 km/h) in a city, it's likely a misread of a different vehicle
    if (speedKmH > 200) {
       continue;
    }
    
    validatedTrajectory.push(det);
  }

  return validatedTrajectory;
}
