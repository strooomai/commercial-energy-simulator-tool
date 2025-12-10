/**
 * Component K: Smart Steering Engine
 * Optimizes HP consumption based on dynamic electricity prices
 */

import { SmartSteeringResult, PriceTempDataPoint } from '../types/schema';

export interface SmartSteeringInput {
  hpProfileKwh: Map<string, number>; // hour key -> kWh consumption
  priceTempData: Map<string, PriceTempDataPoint>;
  maxShiftHours: number; // Maximum hours to shift consumption
  maxShiftRatio: number; // Maximum percentage to shift per hour (0-1)
  bufferCapacityKwh: number; // Thermal storage capacity
}

export interface SteeredHourData {
  hour: string;
  originalKwh: number;
  steeredKwh: number;
  priceCtPerKwh: number;
  originalCostEur: number;
  steeredCostEur: number;
}

export interface SmartSteeringOutput extends SmartSteeringResult {
  hourlyData: SteeredHourData[];
  steeredProfile: Map<string, number>;
}

/**
 * Apply smart steering to HP profile
 * Strategy: Shift consumption from expensive hours to cheaper hours
 */
export function applySmartSteering(input: SmartSteeringInput): SmartSteeringOutput {
  const hourlyData: SteeredHourData[] = [];
  const steeredProfile = new Map<string, number>();
  
  // Convert HP profile to array for processing
  const hours = Array.from(input.hpProfileKwh.keys()).sort();
  
  // Process each day
  const dayGroups = groupByDay(hours);
  
  let totalOriginalCost = 0;
  let totalSteeredCost = 0;
  let totalShiftedKwh = 0;
  
  dayGroups.forEach(dayHours => {
    const dayResult = steerDay(
      dayHours,
      input.hpProfileKwh,
      input.priceTempData,
      input.maxShiftRatio,
      input.bufferCapacityKwh
    );
    
    dayResult.hourlyData.forEach(hour => {
      hourlyData.push(hour);
      steeredProfile.set(hour.hour, hour.steeredKwh);
      totalOriginalCost += hour.originalCostEur;
      totalSteeredCost += hour.steeredCostEur;
      totalShiftedKwh += Math.abs(hour.originalKwh - hour.steeredKwh);
    });
  });
  
  return {
    zonderSturingEur: totalOriginalCost,
    metSturingEur: totalSteeredCost,
    besparingEur: totalOriginalCost - totalSteeredCost,
    verschovenKwh: totalShiftedKwh / 2, // Divide by 2 because we count both add and remove
    hourlyData,
    steeredProfile,
  };
}

/**
 * Group hours by day for daily optimization
 */
function groupByDay(hours: string[]): string[][] {
  const days = new Map<string, string[]>();
  
  hours.forEach(hour => {
    const dayKey = hour.substring(0, 10); // YYYY-MM-DD
    if (!days.has(dayKey)) {
      days.set(dayKey, []);
    }
    days.get(dayKey)!.push(hour);
  });
  
  return Array.from(days.values());
}

/**
 * Optimize one day's consumption
 */
function steerDay(
  hours: string[],
  originalProfile: Map<string, number>,
  priceTempData: Map<string, PriceTempDataPoint>,
  maxShiftRatio: number,
  bufferCapacityKwh: number
): { hourlyData: SteeredHourData[] } {
  const hourlyData: SteeredHourData[] = [];
  
  // Get prices and consumption for each hour
  const dayData = hours.map(hour => {
    const kwh = originalProfile.get(hour) || 0;
    const priceData = priceTempData.get(hour);
    const priceCtPerKwh = priceData?.priceCtPerKwh || 22.5; // Default average
    return { hour, kwh, priceCtPerKwh };
  });
  
  // Calculate average price for the day
  const avgPrice = dayData.reduce((sum, d) => sum + d.priceCtPerKwh, 0) / dayData.length;
  
  // Identify cheap and expensive hours
  const cheapHours = dayData.filter(d => d.priceCtPerKwh < avgPrice * 0.8).sort((a, b) => a.priceCtPerKwh - b.priceCtPerKwh);
  const expensiveHours = dayData.filter(d => d.priceCtPerKwh > avgPrice * 1.2).sort((a, b) => b.priceCtPerKwh - a.priceCtPerKwh);
  
  // Create steered profile
  const steeredKwh = new Map<string, number>();
  dayData.forEach(d => steeredKwh.set(d.hour, d.kwh));
  
  // Track buffer state
  let bufferKwh = 0;
  
  // Shift from expensive to cheap
  expensiveHours.forEach(expensive => {
    const maxShift = expensive.kwh * maxShiftRatio;
    let toShift = Math.min(maxShift, bufferCapacityKwh - bufferKwh);
    
    if (toShift > 0) {
      // Find cheapest hour with capacity
      for (const cheap of cheapHours) {
        if (cheap.hour < expensive.hour) {
          // Pre-heat: move consumption earlier
          const currentCheap = steeredKwh.get(cheap.hour) || 0;
          steeredKwh.set(cheap.hour, currentCheap + toShift);
          steeredKwh.set(expensive.hour, (steeredKwh.get(expensive.hour) || 0) - toShift);
          bufferKwh += toShift;
          break;
        }
      }
    }
  });
  
  // Build output
  dayData.forEach(d => {
    const steered = steeredKwh.get(d.hour) || 0;
    hourlyData.push({
      hour: d.hour,
      originalKwh: d.kwh,
      steeredKwh: steered,
      priceCtPerKwh: d.priceCtPerKwh,
      originalCostEur: (d.kwh * d.priceCtPerKwh) / 100,
      steeredCostEur: (steered * d.priceCtPerKwh) / 100,
    });
  });
  
  return { hourlyData };
}

/**
 * Format smart steering summary for display
 */
export function formatSteeringSummary(result: SmartSteeringResult): {
  zonderSturing: string;
  metSturing: string;
  besparing: string;
  verschoven: string;
} {
  return {
    zonderSturing: `€ ${result.zonderSturingEur.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`,
    metSturing: `€ ${result.metSturingEur.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`,
    besparing: `+€ ${result.besparingEur.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`,
    verschoven: `${result.verschovenKwh.toLocaleString('nl-NL', { minimumFractionDigits: 1 })} kWh`,
  };
}
