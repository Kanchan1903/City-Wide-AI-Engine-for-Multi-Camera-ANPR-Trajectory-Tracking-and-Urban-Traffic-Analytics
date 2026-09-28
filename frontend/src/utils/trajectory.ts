import type { Detection, Camera } from '../store/store';

export interface TrajectoryTransition {
 fromCamera: string;
 toCamera: string;
 distanceMeters: number;
 distanceKm: number;
 travelTimeSeconds: number;
 travelTimeFormatted: string;
 estimatedSpeedKmh: number;
 status: 'VALID' | 'SUSPICIOUS';
 validationReason: string;
}

export interface KalmanDetectionPoint {
 cameraId: string;
 timestamp: string;
 observedLatitude: number;
 observedLongitude: number;
 predictedLatitude: number;
 predictedLongitude: number;
 filteredLatitude: number;
 filteredLongitude: number;
 velocity: number;
 transitionStatus?: string;
 detection: Detection;
}

// Helper for Levenshtein Distance (fuzzy matching for OCR)
export function getEditDistance(a: string, b: string): number {
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

/**
 * Calculates geographic distance between two lat/lon points using the Haversine formula.
 * Input: lat1, lon1, lat2, lon2 (degrees).
 * Output: { distanceMeters, distanceKm }.
 * Do NOT use Euclidean distance.
 */
export function haversineDistance(
 lat1: number,
 lon1: number,
 lat2: number,
 lon2: number
): { distanceMeters: number; distanceKm: number } {
 const R = 6371000; // Earth's radius in meters
 const dLat = ((lat2 - lat1) * Math.PI) / 180;
 const dLon = ((lon2 - lon1) * Math.PI) / 180;
 const a =
 Math.sin(dLat / 2) * Math.sin(dLat / 2) +
 Math.cos((lat1 * Math.PI) / 180) *
 Math.cos((lat2 * Math.PI) / 180) *
 Math.sin(dLon / 2) *
 Math.sin(dLon / 2);
 const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
 const distanceMeters = R * c;
 const distanceKm = distanceMeters / 1000;
 return {
 distanceMeters: Math.round(distanceMeters * 10) / 10,
 distanceKm: Math.round(distanceKm * 100) / 100,
 };
}

export function formatTravelTime(seconds: number): string {
 const sec = Math.round(seconds);
 if (sec <= 0) return '0 sec';
 const mins = Math.floor(sec / 60);
 const remSec = sec % 60;
 if (mins > 0) {
 return `${mins} min ${remSec} sec`;
 }
 return `${remSec} sec`;
}

export function parseTimeToSeconds(timeStr: string): number {
 if (!timeStr) return 0;
 const parts = timeStr.split(':').map(Number);
 if (parts.length === 3) {
 return parts[0] * 3600 + parts[1] * 60 + parts[2];
 } else if (parts.length === 2) {
 return parts[0] * 3600 + parts[1] * 60;
 }
 return 0;
}

export function validateTransition(
 cam1Id: string,
 cam2Id: string,
 timeDiffSeconds: number,
 distanceKm: number,
 speedKmh: number,
 maxSpeedKmh: number = 120
): { status: 'VALID' | 'SUSPICIOUS'; reason: string } {
 if (timeDiffSeconds <= 0) {
 if (cam1Id === cam2Id && distanceKm === 0) {
 return { status: 'SUSPICIOUS', reason: 'Duplicate detection' };
 }
 return { status: 'SUSPICIOUS', reason: 'Temporally inconsistent' };
 }

 if (speedKmh > maxSpeedKmh || speedKmh < 0) {
 return { status: 'SUSPICIOUS', reason: 'Unrealistic travel speed' };
 }

 return { status: 'VALID', reason: 'Physically plausible transition' };
}

/**
 * Applies 2D Kalman Filter state estimation & trajectory smoothing.
 * Estimate state: [x pos, y pos, x velocity, y velocity].
 * Description: "Trajectory smoothing and state estimation from noisy multi-camera observations."
 */
export function smoothTrajectoryKalman(matchedDetections: Detection[]): KalmanDetectionPoint[] {
 if (matchedDetections.length === 0) return [];

 const results: KalmanDetectionPoint[] = [];

 let stateX = matchedDetections[0].longitude;
 let stateY = matchedDetections[0].latitude;
 let vx = 0;
 let vy = 0;

 for (let i = 0; i < matchedDetections.length; i++) {
 const det = matchedDetections[i];
 const obsLat = det.latitude;
 const obsLon = det.longitude;

 let dt = 0;
 if (i > 0) {
 const tPrev = parseTimeToSeconds(matchedDetections[i - 1].timestamp);
 const tCurr = parseTimeToSeconds(det.timestamp);
 dt = Math.max(0, tCurr - tPrev);
 }

 // Prediction step
 let predLat = stateY;
 let predLon = stateX;
 if (i > 0 && dt > 0) {
 predLon = stateX + vx * dt;
 predLat = stateY + vy * dt;
 }

 // Measurement update step
 const Kpos = i === 0 ? 1.0 : 0.8;
 const filtLon = predLon + Kpos * (obsLon - predLon);
 const filtLat = predLat + Kpos * (obsLat - predLat);

 let speedKmh = 0;
 if (i > 0 && dt > 0) {
 const prevLat = matchedDetections[i - 1].latitude;
 const prevLon = matchedDetections[i - 1].longitude;
 const distInfo = haversineDistance(prevLat, prevLon, obsLat, obsLon);
 speedKmh = Math.round((distInfo.distanceKm / (dt / 3600)) * 10) / 10;

 // Update state velocities
 vx = (obsLon - prevLon) / dt;
 vy = (obsLat - prevLat) / dt;
 }

 stateX = filtLon;
 stateY = filtLat;

 results.push({
 cameraId: det.cameraId,
 timestamp: det.timestamp,
 observedLatitude: obsLat,
 observedLongitude: obsLon,
 predictedLatitude: Math.round(predLat * 1000000) / 1000000,
 predictedLongitude: Math.round(predLon * 1000000) / 1000000,
 filteredLatitude: Math.round(filtLat * 1000000) / 1000000,
 filteredLongitude: Math.round(filtLon * 1000000) / 1000000,
 velocity: speedKmh,
 detection: det,
 });
 }

 return results;
}

export function buildTrajectory(
 targetPlate: string,
 detections: Detection[],
 cameras: Camera[]
): Detection[] {
 const normalizedTarget = targetPlate.trim().toUpperCase();

 // 1. Find all detections with exact or fuzzy matched plates
 const matchedDetections = detections.filter((d) => {
 const plate = d.plate.toUpperCase();
 if (plate === normalizedTarget) return true;

 const maxErrors = targetPlate.length > 6 ? 2 : 1;
 const distance = getEditDistance(plate, normalizedTarget);
 return distance <= maxErrors;
 });

 // 2. Sort chronologically
 matchedDetections.sort(
 (a, b) => parseTimeToSeconds(a.timestamp) - parseTimeToSeconds(b.timestamp)
 );

 // 3. Include all detections in trajectory order
 return matchedDetections;
}
