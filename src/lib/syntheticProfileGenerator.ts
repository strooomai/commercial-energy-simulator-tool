/**
 * Component L: Synthetic HP Profile Generator
 * Generates estimated HP load profile when real data unavailable
 */

import {
  HeatPumpProfileDataPoint,
  HeatPumpProfile,
  ManualEnergyData,
  bivalentPointConfig,
  HeatPumpModel,
} from '../types/schema';

export interface SyntheticProfileInput {
  energyData: ManualEnergyData;
  selectedModel: HeatPumpModel;
  temperatureData: Map<string, number>; // hour key -> temperature °C
  startDate: Date;
  endDate: Date;
}

// Design outdoor temperature for Netherlands
const BASE_TEMP = 15; // °C - below this, heating is needed

/**
 * Generate synthetic HP profile based on temperature and building parameters
 */
export function generateSyntheticHPProfile(input: SyntheticProfileInput): HeatPumpProfile {
  const dataPoints: HeatPumpProfileDataPoint[] = [];
  const bivalentConfig = bivalentPointConfig[input.energyData.bivalentPointC];
  
  // Calculate annual heat demand
  const GAS_ENERGY_CONTENT = 9.769;
  const BOILER_EFFICIENCY = 0.90;
  const annualHeatKwh = input.energyData.gasConsumption * GAS_ENERGY_CONTENT * BOILER_EFFICIENCY;
  
  // HP covers portion based on bivalent point
  const hpAnnualHeatKwh = annualHeatKwh * (bivalentConfig.dekkingPercent / 100);
  
  // Calculate degree-hours for the year
  let totalDegreeHours = 0;
  const hourlyDegreeHours: { date: Date; dh: number; temp: number }[] = [];
  
  const current = new Date(input.startDate);
  while (current <= input.endDate) {
    const key = formatDateKey(current);
    const temp = input.temperatureData.get(key) ?? 10;
    
    // Degree hours: how much heating is needed
    const dh = Math.max(0, BASE_TEMP - temp);
    totalDegreeHours += dh;
    hourlyDegreeHours.push({ date: new Date(current), dh, temp });
    
    current.setHours(current.getHours() + 1);
  }
  
  // Distribute heat demand based on degree hours
  let peakPowerKw = 0;
  let totalPowerKw = 0;
  let minPowerKw = Infinity;
  
  hourlyDegreeHours.forEach(({ date, dh, temp }) => {
    // Heat demand for this hour
    const heatKwh = totalDegreeHours > 0 
      ? (dh / totalDegreeHours) * hpAnnualHeatKwh 
      : 0;
    
    // Apply occupancy pattern
    const hour = date.getHours();
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const occupancyFactor = getOccupancyFactor(hour, isWeekend, input.energyData);
    
    const adjustedHeatKwh = heatKwh * occupancyFactor;
    
    // Calculate COP based on temperature
    const cop = calculateCOP(temp, input.selectedModel.scop);
    
    // Electrical power = heat / COP
    const powerKw = cop > 0 ? adjustedHeatKwh / cop : 0;
    
    // Check if above bivalent point
    const bivalentTemp = parseInt(input.energyData.bivalentPointC);
    const isActive = temp <= bivalentTemp || temp <= BASE_TEMP;
    
    const finalPowerKw = isActive ? powerKw : 0;
    
    dataPoints.push({
      timestamp: date.toISOString(),
      powerKw: finalPowerKw,
      heatKw: isActive ? adjustedHeatKwh : 0,
      cop: isActive ? cop : undefined,
    });
    
    if (finalPowerKw > 0) {
      peakPowerKw = Math.max(peakPowerKw, finalPowerKw);
      minPowerKw = Math.min(minPowerKw, finalPowerKw);
    }
    totalPowerKw += finalPowerKw;
  });
  
  const avgPowerKw = totalPowerKw / dataPoints.length;
  
  return {
    buildingType: input.energyData.buildingType,
    heatPumpCapacityKw: input.selectedModel.powerKw,
    dataPoints,
    summary: {
      totalDataPoints: dataPoints.length,
      peakPowerKw,
      avgPowerKw,
      minPowerKw: minPowerKw === Infinity ? 0 : minPowerKw,
      startDate: input.startDate.toISOString(),
      endDate: input.endDate.toISOString(),
    },
  };
}

/**
 * Calculate COP based on outdoor temperature
 * COP decreases as temperature drops
 */
function calculateCOP(outdoorTemp: number, nominalScop: number): number {
  // Nominal SCOP is at A7/W35 (7°C outdoor, 35°C water)
  // COP drops approximately 2-3% per degree below 7°C
  const referenceTemp = 7;
  const copDropPerDegree = 0.025;
  
  if (outdoorTemp >= referenceTemp) {
    // Above reference, slight improvement
    return nominalScop * (1 + (outdoorTemp - referenceTemp) * 0.01);
  } else {
    // Below reference, COP drops
    const drop = (referenceTemp - outdoorTemp) * copDropPerDegree;
    return Math.max(2.0, nominalScop * (1 - drop)); // Minimum COP of 2.0
  }
}

/**
 * Get occupancy factor for hour
 */
function getOccupancyFactor(hour: number, isWeekend: boolean, data: ManualEnergyData): number {
  const start = isWeekend ? data.occupancyWeekendStart : data.occupancyWeekdayStart;
  const end = isWeekend ? data.occupancyWeekendEnd : data.occupancyWeekdayEnd;
  
  // During occupied hours: full heating
  if (hour >= start && hour <= end) {
    return 1.0;
  }
  
  // Night setback: reduced heating
  if (hour >= 0 && hour < 6) {
    return 0.3;
  }
  
  // Pre-heat before occupied hours
  if (hour >= start - 2 && hour < start) {
    return 1.2; // Extra heating to warm up
  }
  
  // Post-occupied: gradual reduction
  if (hour > end && hour <= end + 2) {
    return 0.7;
  }
  
  return 0.5;
}

/**
 * Format date as key (YYYY-MM-DD-HH)
 */
function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  return `${year}-${month}-${day}-${hour}`;
}

/**
 * Scale profile to different number of units
 */
export function scaleHPProfile(
  profile: HeatPumpProfile,
  scaleFactor: number
): HeatPumpProfile {
  return {
    ...profile,
    dataPoints: profile.dataPoints.map(point => ({
      ...point,
      powerKw: point.powerKw * scaleFactor,
      heatKw: point.heatKw ? point.heatKw * scaleFactor : undefined,
    })),
    summary: {
      ...profile.summary,
      peakPowerKw: profile.summary.peakPowerKw * scaleFactor,
      avgPowerKw: profile.summary.avgPowerKw * scaleFactor,
      minPowerKw: profile.summary.minPowerKw * scaleFactor,
    },
  };
}
