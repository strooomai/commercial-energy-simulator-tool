/**
 * Component G: Peak Analyzer
 * Analyzes combined load and finds grid exceedances
 */

import {
  gridConnectionOptions,
  GridConnectionId,
  PeakLoadResult,
  EnergyDataPoint,
  HeatPumpProfileDataPoint,
} from '../types/schema';

export type { PeakLoadResult } from '../types/schema';

export interface CombinedLoadPoint {
  timestamp: Date;
  buildingLoadKw: number;
  hpLoadKw: number;
  combinedLoadKw: number;
  isExceedance: boolean;
  exceedanceKw: number;
}

export interface ExceedanceEvent {
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  peakExceedanceKw: number;
  avgExceedanceKw: number;
}

/**
 * Merge building load with heat pump profile
 */
export function mergeLoads(
  buildingData: EnergyDataPoint[],
  hpProfile: HeatPumpProfileDataPoint[],
  intervalMinutes: number = 60
): CombinedLoadPoint[] {
  const combined: CombinedLoadPoint[] = [];
  
  // Create a map of HP profile by hour
  const hpByHour = new Map<string, number>();
  hpProfile.forEach(point => {
    const date = new Date(point.timestamp);
    const key = `${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
    hpByHour.set(key, point.powerKw);
  });
  
  // Combine loads
  buildingData.forEach(point => {
    const date = new Date(point.timestamp);
    const key = `${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
    
    // Convert kWh to kW based on interval
    const intervalHours = intervalMinutes / 60;
    const buildingLoadKw = (point.offtake || 0) / intervalHours;
    const hpLoadKw = hpByHour.get(key) || 0;
    const combinedLoadKw = buildingLoadKw + hpLoadKw;
    
    combined.push({
      timestamp: date,
      buildingLoadKw,
      hpLoadKw,
      combinedLoadKw,
      isExceedance: false,
      exceedanceKw: 0,
    });
  });
  
  return combined;
}

/**
 * Analyze peak loads and exceedances
 */
export function analyzePeakLoad(
  combinedLoad: CombinedLoadPoint[],
  gridConnectionId: GridConnectionId
): PeakLoadResult {
  const connection = gridConnectionOptions[gridConnectionId];
  const connectionCapacityKw = connection.maxPowerKw;
  
  let peakPowerKw = 0;
  let totalPowerKw = 0;
  let exceedanceCount = 0;
  
  // Mark exceedances
  combinedLoad.forEach(point => {
    if (point.combinedLoadKw > connectionCapacityKw) {
      point.isExceedance = true;
      point.exceedanceKw = point.combinedLoadKw - connectionCapacityKw;
      exceedanceCount++;
    }
    
    peakPowerKw = Math.max(peakPowerKw, point.combinedLoadKw);
    totalPowerKw += point.combinedLoadKw;
  });
  
  const avgPowerKw = totalPowerKw / combinedLoad.length;
  const exceedancePercent = (exceedanceCount / combinedLoad.length) * 100;
  
  // Calculate exceedance duration statistics
  const exceedanceEvents = findExceedanceEvents(combinedLoad);
  const durations = exceedanceEvents.map(e => e.durationMinutes);
  
  const minExceedanceDurationMin = durations.length > 0 ? Math.min(...durations) : 0;
  const maxExceedanceDurationHours = durations.length > 0 ? Math.max(...durations) / 60 : 0;
  const medianExceedanceDurationMin = durations.length > 0 ? median(durations) : 0;
  const totalExceedanceTimeHours = durations.reduce((sum, d) => sum + d, 0) / 60;
  
  return {
    peakPowerKw,
    avgPowerKw,
    connectionCapacityKw,
    exceedanceCount,
    exceedancePercent,
    minExceedanceDurationMin,
    maxExceedanceDurationHours,
    medianExceedanceDurationMin,
    totalExceedanceTimeHours,
  };
}

/**
 * Find continuous exceedance events
 */
export function findExceedanceEvents(
  combinedLoad: CombinedLoadPoint[],
  intervalMinutes: number = 60
): ExceedanceEvent[] {
  const events: ExceedanceEvent[] = [];
  let currentEvent: ExceedanceEvent | null = null;
  
  combinedLoad.forEach((point) => {
    if (point.isExceedance) {
      if (!currentEvent) {
        // Start new event
        currentEvent = {
          startTime: point.timestamp,
          endTime: point.timestamp,
          durationMinutes: intervalMinutes,
          peakExceedanceKw: point.exceedanceKw,
          avgExceedanceKw: point.exceedanceKw,
        };
      } else {
        // Continue event
        currentEvent.endTime = point.timestamp;
        currentEvent.durationMinutes += intervalMinutes;
        currentEvent.peakExceedanceKw = Math.max(
          currentEvent.peakExceedanceKw,
          point.exceedanceKw
        );
      }
    } else if (currentEvent) {
      // End event
      events.push(currentEvent);
      currentEvent = null;
    }
  });
  
  // Don't forget last event
  if (currentEvent) {
    events.push(currentEvent);
  }
  
  return events;
}

/**
 * Calculate median of array
 */
function median(values: number[]): number {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Generate statistics summary for UI
 */
export function generatePeakLoadSummary(result: PeakLoadResult): { label: string; value: string }[] {
  return [
    { label: 'Meetinterval', value: '60 minuten' },
    { label: 'Minimale overschrijdingsduur', value: `${result.minExceedanceDurationMin.toFixed(1)} uur` },
    { label: 'Maximale overschrijdingsduur', value: `${result.maxExceedanceDurationHours.toFixed(1)} uur` },
    { label: 'Mediaan overschrijdingsduur', value: `${result.medianExceedanceDurationMin.toFixed(1)} uur` },
    { label: 'Totale overschrijdingstijd', value: `${result.totalExceedanceTimeHours.toFixed(1)} uur` },
  ];
}
