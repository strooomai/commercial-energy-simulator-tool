/**
 * Component H: Temperature Correlator
 * Matches temperatures to exceedance times
 */

import { TemperatureCorrelation, PriceTempDataPoint } from '../types/schema';
import { CombinedLoadPoint } from './peakAnalyzer';

export interface TemperatureAtExceedances extends TemperatureCorrelation {
  count: number;
  temperatures: number[];
}

/**
 * Correlate temperatures with exceedance events
 */
export function correlateTemperatures(
  combinedLoad: CombinedLoadPoint[],
  priceTempData: Map<string, PriceTempDataPoint>
): TemperatureAtExceedances {
  const temperatures: number[] = [];
  
  // Find exceedance points and get their temperatures
  combinedLoad.forEach(point => {
    if (point.isExceedance) {
      const date = new Date(point.timestamp);
      const key = formatDateKey(date);
      const tempData = priceTempData.get(key);
      
      if (tempData && tempData.temperature !== undefined) {
        temperatures.push(tempData.temperature);
      }
    }
  });
  
  if (temperatures.length === 0) {
    return {
      minTempC: 0,
      maxTempC: 0,
      avgTempC: 0,
      count: 0,
      temperatures: [],
    };
  }
  
  const minTempC = Math.min(...temperatures);
  const maxTempC = Math.max(...temperatures);
  const avgTempC = temperatures.reduce((sum, t) => sum + t, 0) / temperatures.length;
  
  return {
    minTempC,
    maxTempC,
    avgTempC,
    count: temperatures.length,
    temperatures,
  };
}

/**
 * Analyze temperature distribution at exceedances
 */
export function analyzeTemperatureDistribution(
  temperatures: number[]
): { range: string; count: number }[] {
  const ranges = [
    { min: -15, max: -10, label: '-15 tot -10°C' },
    { min: -10, max: -5, label: '-10 tot -5°C' },
    { min: -5, max: 0, label: '-5 tot 0°C' },
    { min: 0, max: 5, label: '0 tot 5°C' },
    { min: 5, max: 10, label: '5 tot 10°C' },
    { min: 10, max: 15, label: '10 tot 15°C' },
    { min: 15, max: 20, label: '15 tot 20°C' },
    { min: 20, max: 35, label: '20 tot 35°C' },
  ];
  
  return ranges.map(range => ({
    range: range.label,
    count: temperatures.filter(t => t >= range.min && t < range.max).length,
  }));
}

/**
 * Format date as key for lookup (YYYY-MM-DD-HH)
 */
function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  return `${year}-${month}-${day}-${hour}`;
}

/**
 * Get exceedance summary text
 */
export function getExceedanceSummaryText(temps: TemperatureAtExceedances): string {
  if (temps.count === 0) {
    return 'Geen overschrijdingen gevonden.';
  }
  
  return `Overschrijdingen vinden plaats bij temperaturen tussen ${temps.minTempC.toFixed(1)}°C en ${temps.maxTempC.toFixed(1)}°C (gemiddeld ${temps.avgTempC.toFixed(1)}°C)`;
}
