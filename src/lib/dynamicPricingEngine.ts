/**
 * Component J: Dynamic Pricing Engine
 * Calculates dynamic tariff savings vs fixed tariff
 */

import {
  DynamicPricingScenario,
  EnergyDataPoint,
  PriceTempDataPoint,
} from '../types/schema';

export interface DynamicPricingInput {
  energyData: EnergyDataPoint[];
  hpProfileKwh: Map<string, number>; // hour key -> kWh consumption
  priceTempData: Map<string, PriceTempDataPoint>;
  fixedElectricityPrice: number;
  fixedFeedInTariff: number;
  salderingEnabled: boolean;
}

export interface DynamicPricingAnalysis {
  metSaldering: {
    zonderWP: DynamicPricingScenario;
    metWP: DynamicPricingScenario;
    wpImpact: number;
  };
  zonderSaldering: {
    zonderWP: DynamicPricingScenario;
    metWP: DynamicPricingScenario;
    wpImpact: number;
  };
  priceStats: {
    minPriceCtPerKwh: number;
    maxPriceCtPerKwh: number;
    avgPriceCtPerKwh: number;
    minGasPriceEurPerM3: number;
    maxGasPriceEurPerM3: number;
    avgGasPriceEurPerM3: number;
  };
  totalHoursWithDynamicPrice: number;
  totalHours: number;
}

/**
 * Calculate dynamic pricing analysis
 */
export function calculateDynamicPricing(input: DynamicPricingInput): DynamicPricingAnalysis {
  // Calculate totals
  let totalOfftake = 0;
  let totalFeedIn = 0;
  let dynamicCostZonderWP = 0;
  let dynamicRevenueZonderWP = 0;
  let dynamicCostMetWP = 0;
  let dynamicRevenueMetWP = 0;
  let hoursWithPrice = 0;
  
  // Collect prices for stats
  const prices: number[] = [];
  const gasPrices: number[] = [];
  
  // Process each hour
  input.energyData.forEach(point => {
    const date = new Date(point.timestamp);
    const key = formatDateKey(date);
    const priceData = input.priceTempData.get(key);
    const hpKwh = input.hpProfileKwh.get(key) || 0;
    
    totalOfftake += point.offtake || 0;
    totalFeedIn += point.feedIn || 0;
    
    if (priceData) {
      hoursWithPrice++;
      const priceEurPerKwh = priceData.priceCtPerKwh / 100;
      prices.push(priceData.priceCtPerKwh);
      if (priceData.gasPriceEurPerM3) {
        gasPrices.push(priceData.gasPriceEurPerM3);
      }
      
      // Zonder WP
      dynamicCostZonderWP += (point.offtake || 0) * priceEurPerKwh;
      dynamicRevenueZonderWP += (point.feedIn || 0) * priceEurPerKwh;
      
      // Met WP - HP consumption is added to offtake
      const newOfftake = (point.offtake || 0) + hpKwh;
      const newFeedIn = Math.max(0, (point.feedIn || 0) - hpKwh);
      dynamicCostMetWP += newOfftake * priceEurPerKwh;
      dynamicRevenueMetWP += newFeedIn * priceEurPerKwh;
    }
  });
  
  // Fixed tariff calculations
  const fixedCostZonderWP = totalOfftake * input.fixedElectricityPrice;
  const fixedRevenueZonderWP = totalFeedIn * input.fixedFeedInTariff;
  
  const totalHpKwh = Array.from(input.hpProfileKwh.values()).reduce((sum, kwh) => sum + kwh, 0);
  const fixedCostMetWP = (totalOfftake + totalHpKwh) * input.fixedElectricityPrice;
  const fixedRevenueMetWP = Math.max(0, totalFeedIn - totalHpKwh) * input.fixedFeedInTariff;
  
  // Price statistics
  const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  
  const avgGasPrice = gasPrices.length > 0 ? gasPrices.reduce((a, b) => a + b, 0) / gasPrices.length : 0;
  const minGasPrice = gasPrices.length > 0 ? Math.min(...gasPrices) : 0;
  const maxGasPrice = gasPrices.length > 0 ? Math.max(...gasPrices) : 0;
  
  // Build scenarios
  const buildScenario = (
    scenario: string,
    afname: number,
    teruglevering: number,
    vastCost: number,
    vastRevenue: number,
    dynCost: number,
    dynRevenue: number,
    withSaldering: boolean
  ): DynamicPricingScenario => {
    const vastTarief = withSaldering 
      ? vastCost - Math.min(vastRevenue, vastCost)
      : vastCost - vastRevenue;
    const dynamisch = withSaldering
      ? dynCost - Math.min(dynRevenue, dynCost)
      : dynCost - dynRevenue;
    
    return {
      scenario,
      afnameKwh: afname,
      terugleveringKwh: teruglevering,
      vastTariefEur: vastTarief,
      dynamischEur: dynamisch,
      verschilEur: vastTarief - dynamisch,
    };
  };
  
  return {
    metSaldering: {
      zonderWP: buildScenario(
        'Zonder WP', totalOfftake, totalFeedIn,
        fixedCostZonderWP, fixedRevenueZonderWP,
        dynamicCostZonderWP, dynamicRevenueZonderWP,
        true
      ),
      metWP: buildScenario(
        'Met WP', totalOfftake + totalHpKwh, Math.max(0, totalFeedIn - totalHpKwh),
        fixedCostMetWP, fixedRevenueMetWP,
        dynamicCostMetWP, dynamicRevenueMetWP,
        true
      ),
      wpImpact: 0, // Calculated after
    },
    zonderSaldering: {
      zonderWP: buildScenario(
        'Zonder WP', totalOfftake, totalFeedIn,
        fixedCostZonderWP, fixedRevenueZonderWP,
        dynamicCostZonderWP, dynamicRevenueZonderWP,
        false
      ),
      metWP: buildScenario(
        'Met WP', totalOfftake + totalHpKwh, Math.max(0, totalFeedIn - totalHpKwh),
        fixedCostMetWP, fixedRevenueMetWP,
        dynamicCostMetWP, dynamicRevenueMetWP,
        false
      ),
      wpImpact: 0,
    },
    priceStats: {
      minPriceCtPerKwh: minPrice,
      maxPriceCtPerKwh: maxPrice,
      avgPriceCtPerKwh: avgPrice,
      minGasPriceEurPerM3: minGasPrice,
      maxGasPriceEurPerM3: maxGasPrice,
      avgGasPriceEurPerM3: avgGasPrice,
    },
    totalHoursWithDynamicPrice: hoursWithPrice,
    totalHours: input.energyData.length,
  };
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
 * Format currency for display
 */
export function formatEuro(amount: number, showSign: boolean = false): string {
  const sign = showSign && amount > 0 ? '+' : '';
  return `${sign}€ ${amount.toLocaleString('nl-NL', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}
