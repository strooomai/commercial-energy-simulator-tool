/**
 * Component C: Heat Demand Calculator
 * Calculates total heat demand from gas consumption and building factors
 */

import { buildingTypes, BuildingTypeId, ManualEnergyData } from '../types/schema';

export interface HeatDemandResult {
  totalHeatDemandKwh: number;
  spaceHeatingKwh: number;
  spaceHeatingPercent: number;
  hotWaterKwh: number;
  hotWaterPercent: number;
  requiredPowerKw: number;
  calculatedEnergyCosts: {
    gasCurrentEur: number;
    electricityCurrentEur: number;
    totalCurrentEur: number;
  };
}

// Gas energy content: 9.769 kWh per m³ (Dutch groningen gas average)
const GAS_ENERGY_CONTENT_KWH_PER_M3 = 9.769;

// Boiler efficiency (typical for older CV ketel)
const BOILER_EFFICIENCY = 0.90;

// Full load hours for Dutch climate (typical for heating)
const FULL_LOAD_HOURS = 1800;

/**
 * Calculate heat demand from gas consumption
 */
export function calculateHeatDemand(data: ManualEnergyData): HeatDemandResult {
  const buildingType = buildingTypes[data.buildingType];
  
  // Calculate total heat from gas
  // Gas consumption × energy content × boiler efficiency = useful heat
  const totalHeatDemandKwh = data.gasConsumption * GAS_ENERGY_CONTENT_KWH_PER_M3 * BOILER_EFFICIENCY;
  
  // Split into space heating and hot water based on building type
  const hotWaterPercent = buildingType.hotWaterPercent;
  const spaceHeatingPercent = 100 - hotWaterPercent;
  
  const hotWaterKwh = totalHeatDemandKwh * (hotWaterPercent / 100);
  const spaceHeatingKwh = totalHeatDemandKwh * (spaceHeatingPercent / 100);
  
  // Calculate required power (kW) from annual demand
  // Using full load hours method
  const requiredPowerKw = spaceHeatingKwh / FULL_LOAD_HOURS;
  
  // Calculate current energy costs
  const gasCurrentEur = data.gasConsumption * data.gasPricePerM3;
  const electricityCurrentEur = (data.electricityOfftake - data.electricityFeedIn) * data.electricityPricePerKwh;
  const totalCurrentEur = gasCurrentEur + Math.max(0, electricityCurrentEur);
  
  return {
    totalHeatDemandKwh,
    spaceHeatingKwh,
    spaceHeatingPercent,
    hotWaterKwh,
    hotWaterPercent,
    requiredPowerKw,
    calculatedEnergyCosts: {
      gasCurrentEur,
      electricityCurrentEur,
      totalCurrentEur,
    },
  };
}

/**
 * Calculate DHW (Domestic Hot Water) demand in liters per day
 * Based on building type and number of units
 */
export function calculateDefaultDHW(buildingType: BuildingTypeId, numberOfUnits: number): number {
  const building = buildingTypes[buildingType];
  return building.defaultDhwLitersPerUnit * numberOfUnits;
}

/**
 * Calculate heat demand from DHW liters
 * Formula: Q = m × c × ΔT
 * Where: m = mass (liters), c = 4.186 kJ/kg·K, ΔT = typically 45°C (from 10°C to 55°C)
 */
export function calculateDHWHeatDemand(litersPerDay: number): number {
  const deltaT = 45; // Temperature rise in °C
  const specificHeat = 4.186; // kJ/kg·K
  const kJperKwh = 3600;
  
  // Daily heat demand in kWh
  const dailyKwh = (litersPerDay * specificHeat * deltaT) / kJperKwh;
  
  // Annual heat demand (365 days)
  return dailyKwh * 365;
}
