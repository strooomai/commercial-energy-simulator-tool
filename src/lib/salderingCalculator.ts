/**
 * Component I: Saldering Calculator
 * Compares net metering scenarios (met/zonder saldering)
 */

import { SalderingScenario, EnergyDataPoint } from '../types/schema';

export interface SalderingInput {
  energyData: EnergyDataPoint[];
  hpExtraConsumptionKwh: number;
  electricityPricePerKwh: number;
  feedInTariffPerKwh: number;
  terugleveringboetePerKwh: number;
}

export interface SalderingAnalysis {
  metSaldering: {
    zonderWP: SalderingScenario;
    metWP: SalderingScenario;
    impact: number;
  };
  zonderSaldering: {
    zonderWP: SalderingScenario;
    metWP: SalderingScenario;
    impact: number;
  };
  eigenVerbruikBenefit: number;
  totalSurplusKwh: number;
  totalConsumptionKwh: number;
}

/**
 * Calculate saldering analysis for all scenarios
 */
export function calculateSaldering(input: SalderingInput): SalderingAnalysis {
  // Calculate totals from energy data
  let totalFeedIn = 0;
  let totalOfftake = 0;
  
  input.energyData.forEach(point => {
    totalFeedIn += point.feedIn || 0;
    totalOfftake += point.offtake || 0;
  });
  
  // With HP: extra consumption reduces net export
  const hpExtraKwh = input.hpExtraConsumptionKwh;
  
  // ==================
  // MET SALDERING
  // ==================
  
  // Zonder WP - met saldering
  const msZonderWP_gesaldeerd = Math.min(totalFeedIn, totalOfftake);
  const msZonderWP_overschot = Math.max(0, totalFeedIn - totalOfftake);
  const msZonderWP_opbrengst = msZonderWP_overschot * input.feedInTariffPerKwh;
  const msZonderWP_kosten = msZonderWP_overschot * input.terugleveringboetePerKwh;
  const msZonderWP_netto = msZonderWP_opbrengst - msZonderWP_kosten;
  
  // Met WP - met saldering
  // HP consumption is first covered by solar surplus
  const wpConsumptionFromSolar = Math.min(hpExtraKwh, totalFeedIn);
  const newTotalOfftake = totalOfftake + hpExtraKwh - wpConsumptionFromSolar;
  const newTotalFeedIn = totalFeedIn - wpConsumptionFromSolar;
  
  const msMetWP_gesaldeerd = Math.min(newTotalFeedIn, newTotalOfftake);
  const msMetWP_overschot = Math.max(0, newTotalFeedIn - newTotalOfftake);
  const msMetWP_opbrengst = msMetWP_overschot * input.feedInTariffPerKwh;
  const msMetWP_kosten = msMetWP_overschot * input.terugleveringboetePerKwh;
  const msMetWP_netto = msMetWP_opbrengst - msMetWP_kosten;
  
  // ==================
  // ZONDER SALDERING
  // ==================
  
  // Zonder WP - zonder saldering
  const zsZonderWP_opbrengst = totalFeedIn * input.feedInTariffPerKwh;
  const zsZonderWP_kosten = totalFeedIn * input.terugleveringboetePerKwh;
  const zsZonderWP_netto = zsZonderWP_opbrengst - zsZonderWP_kosten;
  
  // Met WP - zonder saldering
  const zsMetWP_teruglevering = newTotalFeedIn;
  const zsMetWP_opbrengst = zsMetWP_teruglevering * input.feedInTariffPerKwh;
  const zsMetWP_kosten = zsMetWP_teruglevering * input.terugleveringboetePerKwh;
  const zsMetWP_netto = zsMetWP_opbrengst - zsMetWP_kosten;
  
  // Eigen verbruik benefit
  // Value of solar energy consumed directly instead of exported
  const eigenVerbruikKwh = wpConsumptionFromSolar;
  const eigenVerbruikBenefit = eigenVerbruikKwh * 
    (input.electricityPricePerKwh - input.feedInTariffPerKwh + input.terugleveringboetePerKwh);
  
  return {
    metSaldering: {
      zonderWP: {
        scenario: 'Zonder WP',
        terugleveringKwh: totalFeedIn,
        gesaldeerdKwh: msZonderWP_gesaldeerd,
        opbrengstEur: msZonderWP_opbrengst,
        kostenEur: msZonderWP_kosten,
        nettoEur: msZonderWP_netto,
      },
      metWP: {
        scenario: 'Met WP',
        terugleveringKwh: newTotalFeedIn,
        gesaldeerdKwh: msMetWP_gesaldeerd,
        opbrengstEur: msMetWP_opbrengst,
        kostenEur: msMetWP_kosten,
        nettoEur: msMetWP_netto,
      },
      impact: msMetWP_netto - msZonderWP_netto,
    },
    zonderSaldering: {
      zonderWP: {
        scenario: 'Zonder WP',
        terugleveringKwh: totalFeedIn,
        gesaldeerdKwh: 0,
        opbrengstEur: zsZonderWP_opbrengst,
        kostenEur: zsZonderWP_kosten,
        nettoEur: zsZonderWP_netto,
      },
      metWP: {
        scenario: 'Met WP',
        terugleveringKwh: zsMetWP_teruglevering,
        gesaldeerdKwh: 0,
        opbrengstEur: zsMetWP_opbrengst,
        kostenEur: zsMetWP_kosten,
        nettoEur: zsMetWP_netto,
      },
      impact: zsMetWP_netto - zsZonderWP_netto,
    },
    eigenVerbruikBenefit,
    totalSurplusKwh: totalFeedIn,
    totalConsumptionKwh: totalOfftake,
  };
}

/**
 * Format saldering table for display
 */
export function formatSalderingTable(scenario: SalderingScenario): {
  teruglevering: string;
  gesaldeerd: string;
  opbrengst: string;
  kosten: string;
  netto: string;
} {
  return {
    teruglevering: `${scenario.terugleveringKwh.toLocaleString('nl-NL')} kWh`,
    gesaldeerd: `${scenario.gesaldeerdKwh.toLocaleString('nl-NL')} kWh`,
    opbrengst: `+€ ${scenario.opbrengstEur.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`,
    kosten: `-€ ${Math.abs(scenario.kostenEur).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`,
    netto: `€ ${scenario.nettoEur.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`,
  };
}
