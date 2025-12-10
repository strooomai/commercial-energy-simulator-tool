/**
 * Component B: Profile Generator
 * Creates hourly consumption breakdown from yearly totals
 * Uses Liander-style profiles for different building types
 */

import { BuildingTypeId, EnergyDataPoint, buildingTypes } from '../types/schema';

export interface ProfileGeneratorInput {
  buildingType: BuildingTypeId;
  yearlyElectricityKwh: number;
  yearlyGasM3: number;
  yearlyFeedInKwh: number;
  year: number;
}

// Building profile patterns (simplified from Liander data)
const buildingProfiles = {
  residential: {
    // Hour factors (0-23)
    hourlyFactors: [
      0.02, 0.02, 0.02, 0.02, 0.02, 0.03, // 0-5: night
      0.05, 0.07, 0.06, 0.04, 0.03, 0.03, // 6-11: morning
      0.04, 0.03, 0.03, 0.03, 0.04, 0.06, // 12-17: afternoon
      0.08, 0.09, 0.08, 0.06, 0.04, 0.03, // 18-23: evening
    ],
    weekendFactor: 1.1,
    // Monthly factors (Jan-Dec)
    monthlyFactors: [1.15, 1.10, 1.05, 0.95, 0.85, 0.80, 0.75, 0.80, 0.90, 1.00, 1.10, 1.20],
  },
  office: {
    hourlyFactors: [
      0.01, 0.01, 0.01, 0.01, 0.01, 0.02,
      0.04, 0.08, 0.10, 0.10, 0.10, 0.08,
      0.08, 0.10, 0.10, 0.10, 0.08, 0.04,
      0.02, 0.01, 0.01, 0.01, 0.01, 0.01,
    ],
    weekendFactor: 0.2,
    monthlyFactors: [1.10, 1.05, 1.00, 0.95, 0.90, 0.85, 0.85, 0.90, 0.95, 1.00, 1.05, 1.10],
  },
  healthcare: {
    hourlyFactors: [
      0.03, 0.03, 0.03, 0.03, 0.03, 0.04,
      0.05, 0.06, 0.06, 0.05, 0.05, 0.04,
      0.04, 0.04, 0.04, 0.04, 0.05, 0.05,
      0.05, 0.05, 0.04, 0.04, 0.03, 0.03,
    ],
    weekendFactor: 0.9,
    monthlyFactors: [1.05, 1.03, 1.00, 0.98, 0.95, 0.93, 0.92, 0.93, 0.96, 1.00, 1.03, 1.05],
  },
  healthcare_24h: {
    hourlyFactors: [
      0.04, 0.04, 0.04, 0.04, 0.04, 0.04,
      0.04, 0.05, 0.05, 0.05, 0.04, 0.04,
      0.04, 0.04, 0.04, 0.04, 0.04, 0.04,
      0.04, 0.04, 0.04, 0.04, 0.04, 0.04,
    ],
    weekendFactor: 1.0,
    monthlyFactors: [1.02, 1.01, 1.00, 0.99, 0.98, 0.97, 0.97, 0.98, 0.99, 1.00, 1.01, 1.02],
  },
  hospitality: {
    hourlyFactors: [
      0.02, 0.02, 0.02, 0.02, 0.02, 0.03,
      0.05, 0.08, 0.06, 0.04, 0.03, 0.04,
      0.05, 0.04, 0.04, 0.04, 0.05, 0.06,
      0.07, 0.08, 0.07, 0.05, 0.04, 0.03,
    ],
    weekendFactor: 1.3,
    monthlyFactors: [0.90, 0.85, 0.95, 1.00, 1.10, 1.15, 1.20, 1.15, 1.05, 0.95, 0.90, 0.95],
  },
  school: {
    hourlyFactors: [
      0.01, 0.01, 0.01, 0.01, 0.01, 0.02,
      0.04, 0.08, 0.12, 0.12, 0.10, 0.08,
      0.08, 0.10, 0.10, 0.08, 0.04, 0.02,
      0.01, 0.01, 0.01, 0.01, 0.01, 0.01,
    ],
    weekendFactor: 0.1,
    monthlyFactors: [1.15, 1.10, 1.05, 1.00, 0.95, 0.20, 0.10, 0.20, 0.95, 1.05, 1.10, 1.15],
  },
  sports: {
    hourlyFactors: [
      0.01, 0.01, 0.01, 0.01, 0.01, 0.02,
      0.03, 0.04, 0.05, 0.06, 0.06, 0.05,
      0.05, 0.05, 0.05, 0.06, 0.07, 0.08,
      0.09, 0.08, 0.06, 0.04, 0.02, 0.01,
    ],
    weekendFactor: 1.5,
    monthlyFactors: [1.10, 1.05, 1.00, 0.95, 0.90, 0.85, 0.80, 0.85, 1.00, 1.05, 1.10, 1.15],
  },
};

// Gas heating profile (temperature-dependent)
const gasHeatingProfile = {
  // Monthly factors based on heating degree days
  monthlyFactors: [0.18, 0.15, 0.12, 0.06, 0.02, 0.01, 0.00, 0.00, 0.02, 0.08, 0.14, 0.18],
  // Daily variation
  hourlyFactors: [
    0.03, 0.02, 0.02, 0.02, 0.02, 0.04,
    0.06, 0.07, 0.05, 0.04, 0.04, 0.04,
    0.04, 0.04, 0.04, 0.04, 0.05, 0.06,
    0.06, 0.05, 0.05, 0.04, 0.04, 0.03,
  ],
};

// Solar generation profile
const solarProfile = {
  // Monthly factors (relative solar irradiance)
  monthlyFactors: [0.03, 0.05, 0.08, 0.11, 0.13, 0.14, 0.14, 0.12, 0.10, 0.06, 0.03, 0.02],
  // Hourly factors (sunrise to sunset bell curve)
  hourlyFactors: [
    0.00, 0.00, 0.00, 0.00, 0.00, 0.01,
    0.03, 0.07, 0.11, 0.14, 0.15, 0.15,
    0.14, 0.11, 0.07, 0.03, 0.01, 0.00,
    0.00, 0.00, 0.00, 0.00, 0.00, 0.00,
  ],
};

/**
 * Generate hourly profile from yearly totals
 */
export function generateProfile(input: ProfileGeneratorInput): EnergyDataPoint[] {
  const building = buildingTypes[input.buildingType];
  const profile = buildingProfiles[building.occupancyProfile as keyof typeof buildingProfiles] 
    || buildingProfiles.residential;
  
  const dataPoints: EnergyDataPoint[] = [];
  
  // Calculate total weights for normalization
  let totalElecWeight = 0;
  let totalGasWeight = 0;
  let totalSolarWeight = 0;
  
  // First pass: calculate total weights
  const startDate = new Date(input.year, 0, 1);
  const endDate = new Date(input.year, 11, 31, 23);
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const month = current.getMonth();
    const hour = current.getHours();
    const isWeekend = current.getDay() === 0 || current.getDay() === 6;
    
    const elecWeight = profile.hourlyFactors[hour] 
      * profile.monthlyFactors[month]
      * (isWeekend ? profile.weekendFactor : 1);
    
    const gasWeight = gasHeatingProfile.hourlyFactors[hour]
      * gasHeatingProfile.monthlyFactors[month];
    
    const solarWeight = solarProfile.hourlyFactors[hour]
      * solarProfile.monthlyFactors[month];
    
    totalElecWeight += elecWeight;
    totalGasWeight += gasWeight;
    totalSolarWeight += solarWeight;
    
    current.setHours(current.getHours() + 1);
  }
  
  // Second pass: generate data points
  current.setTime(startDate.getTime());
  
  while (current <= endDate) {
    const month = current.getMonth();
    const hour = current.getHours();
    const isWeekend = current.getDay() === 0 || current.getDay() === 6;
    
    const elecWeight = profile.hourlyFactors[hour]
      * profile.monthlyFactors[month]
      * (isWeekend ? profile.weekendFactor : 1);
    
    const gasWeight = gasHeatingProfile.hourlyFactors[hour]
      * gasHeatingProfile.monthlyFactors[month];
    
    const solarWeight = solarProfile.hourlyFactors[hour]
      * solarProfile.monthlyFactors[month];
    
    // Calculate hourly values
    const offtake = totalElecWeight > 0 
      ? (elecWeight / totalElecWeight) * input.yearlyElectricityKwh 
      : 0;
    
    const gasConsumption = totalGasWeight > 0
      ? (gasWeight / totalGasWeight) * input.yearlyGasM3
      : 0;
    
    const feedIn = totalSolarWeight > 0
      ? (solarWeight / totalSolarWeight) * input.yearlyFeedInKwh
      : 0;
    
    dataPoints.push({
      timestamp: new Date(current),
      offtake,
      feedIn,
      gasConsumption,
    });
    
    current.setHours(current.getHours() + 1);
  }
  
  return dataPoints;
}

/**
 * Get profile type for building
 */
export function getProfileType(buildingType: BuildingTypeId): string {
  const building = buildingTypes[buildingType];
  return building.occupancyProfile;
}
