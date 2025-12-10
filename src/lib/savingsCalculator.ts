/**
 * Component E: Savings Calculator
 * Calculates financial benefits of heat pump installation
 */

import {
  bivalentPointConfig,
  BivalentPointId,
  emissionFactors,
  HeatPumpModel,
  SavingsResult,
} from '../types/schema';

export type { SavingsResult } from '../types/schema';
import { HeatDemandResult } from './heatDemandCalculator';

export interface SavingsInput {
  heatDemand: HeatDemandResult;
  selectedModel: HeatPumpModel;
  unitsNeeded: number;
  totalPrice: number;
  bivalentPoint: BivalentPointId;
  gasPricePerM3: number;
  electricityPricePerKwh: number;
  currentGasConsumption: number;
}

/**
 * Calculate annual savings from heat pump installation
 */
export function calculateSavings(input: SavingsInput): SavingsResult {
  const bivalentConfig = bivalentPointConfig[input.bivalentPoint];
  const wpDekking = bivalentConfig.dekkingPercent / 100;
  
  // Heat demand split between HP and boiler
  const heatByHPKwh = input.heatDemand.spaceHeatingKwh * wpDekking;
  const heatByBoilerKwh = input.heatDemand.spaceHeatingKwh * (1 - wpDekking);
  
  // Hot water still by boiler (unless full electric)
  const hotWaterByBoilerKwh = input.bivalentPoint === '-10' 
    ? 0 
    : input.heatDemand.hotWaterKwh;
  const hotWaterByHPKwh = input.heatDemand.hotWaterKwh - hotWaterByBoilerKwh;
  
  // Total heat by HP and boiler
  const totalHeatByHPKwh = heatByHPKwh + hotWaterByHPKwh;
  const totalHeatByBoilerKwh = heatByBoilerKwh + hotWaterByBoilerKwh;
  
  // Calculate electricity needed for HP (heat / SCOP)
  const hpElectricityKwh = totalHeatByHPKwh / input.selectedModel.scop;
  
  // Calculate gas needed for remaining heat
  const GAS_ENERGY_CONTENT = 9.769;
  const BOILER_EFFICIENCY = 0.90;
  const gasForBoilerM3 = totalHeatByBoilerKwh / (GAS_ENERGY_CONTENT * BOILER_EFFICIENCY);
  
  // Current costs
  const currentGasCost = input.currentGasConsumption * input.gasPricePerM3;
  
  // New costs
  const newGasCost = gasForBoilerM3 * input.gasPricePerM3;
  const newElectricityCost = hpElectricityKwh * input.electricityPricePerKwh;
  
  // Savings
  const annualSavingsEur = currentGasCost - newGasCost - newElectricityCost;
  const savingsPercent = (annualSavingsEur / currentGasCost) * 100;
  
  // Payback period
  const paybackYears = annualSavingsEur > 0 
    ? input.totalPrice / annualSavingsEur 
    : Infinity;
  
  // CO2 reduction
  const currentCO2 = input.currentGasConsumption * emissionFactors.gasKgCO2PerM3;
  const newGasCO2 = gasForBoilerM3 * emissionFactors.gasKgCO2PerM3;
  const newElectricityCO2 = hpElectricityKwh * emissionFactors.electricityKgCO2PerKwh;
  const co2ReductionKg = currentCO2 - newGasCO2 - newElectricityCO2;
  
  return {
    annualSavingsEur,
    savingsPercent,
    co2ReductionKg,
    paybackYears,
    heatDemandByHP: {
      kWh: totalHeatByHPKwh,
      percent: (totalHeatByHPKwh / input.heatDemand.totalHeatDemandKwh) * 100,
    },
    heatDemandByBoiler: {
      m3: gasForBoilerM3,
      kWh: totalHeatByBoilerKwh,
      percent: (totalHeatByBoilerKwh / input.heatDemand.totalHeatDemandKwh) * 100,
    },
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format percentage for display
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
