/**
 * Component D: HP Selector Engine
 * Matches required kW to Effenca heat pump models
 */

import {
  heatPumpModels,
  HeatPumpModel,
  bivalentPointConfig,
  BivalentPointId,
  HPSelectorResult,
} from '../types/schema';

export interface HPSelectionInput {
  requiredPowerKw: number;
  bivalentPoint: BivalentPointId;
  isCoastalLocation: boolean;
  preferHT?: boolean; // Prefer high-temperature models (70°C+)
}

export interface HPSelectionOutput {
  benodigdVermogenKw: number;
  wpDekkingPercent: number;
  recommendations: HPSelectorResult[];
  allOptions: HPSelectorResult[];
}

/**
 * Select appropriate heat pump model(s) based on requirements
 */
export function selectHeatPump(input: HPSelectionInput): HPSelectionOutput {
  const bivalentConfig = bivalentPointConfig[input.bivalentPoint];
  
  // Calculate required HP capacity based on beta factor
  // Beta factor determines what percentage of peak load the HP covers
  const benodigdVermogenKw = input.requiredPowerKw * bivalentConfig.betaFactor;
  const wpDekkingPercent = bivalentConfig.dekkingPercent;
  
  // Filter models based on requirements
  let availableModels = [...heatPumpModels];
  
  // Filter for EC (coastal) models if needed
  if (input.isCoastalLocation) {
    availableModels = availableModels.filter(m => m.isEC);
  } else {
    // Prefer non-EC models for inland
    availableModels = availableModels.filter(m => !m.isEC);
  }
  
  // Filter for HT models if high temperature needed
  if (input.preferHT) {
    const htModels = availableModels.filter(m => m.type === 'HT');
    if (htModels.length > 0) {
      availableModels = htModels;
    }
  }
  
  // Calculate units needed for each model
  const allOptions: HPSelectorResult[] = availableModels.map(model => {
    const unitsNeeded = Math.ceil(benodigdVermogenKw / model.powerKw);
    const totalCapacityKw = unitsNeeded * model.powerKw;
    const totalPrice = unitsNeeded * model.priceEur;
    
    return {
      model,
      unitsNeeded,
      totalCapacityKw,
      totalPrice,
      isRecommended: false,
    };
  });
  
  // Sort by total price (cheapest first), then by efficiency
  allOptions.sort((a, b) => {
    // Prefer solutions with fewer units
    if (a.unitsNeeded !== b.unitsNeeded) {
      return a.unitsNeeded - b.unitsNeeded;
    }
    // Then by price
    if (a.totalPrice !== b.totalPrice) {
      return a.totalPrice - b.totalPrice;
    }
    // Then by SCOP (higher is better)
    return b.model.scop - a.model.scop;
  });
  
  // Find recommendations:
  // 1. Best value (lowest cost per kW that meets requirements)
  // 2. Best efficiency (highest SCOP)
  // 3. Minimum units (simplest installation)
  
  const recommendations: HPSelectorResult[] = [];
  
  // Filter valid options (capacity >= required)
  const validOptions = allOptions.filter(opt => opt.totalCapacityKw >= benodigdVermogenKw);
  
  if (validOptions.length > 0) {
    // Best value - minimum total price
    const bestValue = validOptions.reduce((best, current) => 
      current.totalPrice < best.totalPrice ? current : best
    );
    bestValue.isRecommended = true;
    recommendations.push({ ...bestValue, isRecommended: true });
    
    // Best efficiency - highest SCOP
    const bestEfficiency = validOptions.reduce((best, current) =>
      current.model.scop > best.model.scop ? current : best
    );
    if (bestEfficiency.model.id !== bestValue.model.id) {
      recommendations.push({ ...bestEfficiency, isRecommended: true });
    }
    
    // Single unit option if available
    const singleUnit = validOptions.find(opt => opt.unitsNeeded === 1);
    if (singleUnit && 
        singleUnit.model.id !== bestValue.model.id && 
        singleUnit.model.id !== bestEfficiency.model.id) {
      recommendations.push({ ...singleUnit, isRecommended: true });
    }
  }
  
  return {
    benodigdVermogenKw,
    wpDekkingPercent,
    recommendations,
    allOptions,
  };
}

/**
 * Calculate the required number of units for a specific model
 */
export function calculateUnitsNeeded(
  model: HeatPumpModel,
  requiredCapacityKw: number
): number {
  return Math.ceil(requiredCapacityKw / model.powerKw);
}

/**
 * Get model by ID
 */
export function getModelById(id: string): HeatPumpModel | undefined {
  return heatPumpModels.find(m => m.id === id);
}
