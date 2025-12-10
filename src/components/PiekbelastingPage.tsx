/**
 * Screen 3: Piekbelasting Analyse (Peak Load Analysis) Page
 */

import { useState, useMemo } from 'react';
import { Card, Button, StatCard, Alert, Table, ToggleGroup, Badge } from './ui';
import {
  ManualEnergyData,
  HeatPumpModel,
  gridConnectionOptions,
} from '../types/schema';
import { HeatDemandResult } from '../lib/heatDemandCalculator';
import { SavingsResult } from '../lib/savingsCalculator';
import { HPSelectionOutput } from '../lib/hpSelectorEngine';
import { analyzePeakLoad, mergeLoads } from '../lib/peakAnalyzer';
import { correlateTemperatures } from '../lib/temperatureCorrelator';
import { calculateSaldering } from '../lib/salderingCalculator';
import { calculateDynamicPricing } from '../lib/dynamicPricingEngine';
import { applySmartSteering } from '../lib/smartSteeringEngine';
import { generateSyntheticHPProfile } from '../lib/syntheticProfileGenerator';
import { generateProfile } from '../lib/profileGenerator';
import { useTranslation } from '../lib/i18n';

interface PiekbelastingPageProps {
  energyData: ManualEnergyData;
  heatDemand: HeatDemandResult;
  selectedModel: HeatPumpModel;
  selectedUnits: number;
  savings: SavingsResult;
  selection: HPSelectionOutput;
  onBack: () => void;
}

type TimeFilter = 'dag' | 'week' | 'maand' | 'jaar' | 'alles';

export function PiekbelastingPage({
  energyData,
  heatDemand,
  selectedModel,
  selectedUnits,
  savings: _savings,
  selection,
  onBack,
}: PiekbelastingPageProps) {
  const { t, language, locale } = useTranslation();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('maand');
  const [salderingTab, setSalderingTab] = useState<'met' | 'zonder'>('met');
  const [dynamicTab, setDynamicTab] = useState<'met' | 'zonder'>('met');

  // Generate synthetic data
  const analysisData = useMemo(() => {
    const buildingData = generateProfile({
      buildingType: energyData.buildingType,
      yearlyElectricityKwh: energyData.electricityOfftake,
      yearlyGasM3: energyData.gasConsumption,
      yearlyFeedInKwh: energyData.electricityFeedIn,
      year: 2024,
    });

    const tempMap = new Map<string, number>();
    const priceMap = new Map<string, any>();
    
    buildingData.forEach(point => {
      const date = new Date(point.timestamp);
      const month = date.getMonth();
      const hour = date.getHours();
      const key = formatDateKey(date);
      
      const baseTemp = 10 + 8 * Math.sin((month - 3) * Math.PI / 6);
      const hourlyVar = 3 * Math.sin((hour - 14) * Math.PI / 12);
      const temp = baseTemp + hourlyVar + (Math.random() - 0.5) * 4;
      tempMap.set(key, temp);
      
      const basePrice = 22;
      const priceVar = hour >= 7 && hour <= 9 ? 15 : hour >= 17 && hour <= 20 ? 20 : 0;
      const price = basePrice + priceVar + (Math.random() - 0.5) * 10;
      
      priceMap.set(key, {
        timestamp: date,
        priceCtPerKwh: price,
        gasPriceEurPerM3: 1.40 + (Math.random() - 0.5) * 0.2,
        temperature: temp,
      });
    });

    const startDate = new Date(2024, 0, 1);
    const endDate = new Date(2024, 11, 31, 23);
    
    const hpProf = generateSyntheticHPProfile({
      energyData,
      selectedModel,
      temperatureData: tempMap,
      startDate,
      endDate,
    });

    const scaledHpProfile = {
      ...hpProf,
      dataPoints: hpProf.dataPoints.map(p => ({
        ...p,
        powerKw: p.powerKw * selectedUnits,
        heatKw: p.heatKw ? p.heatKw * selectedUnits : undefined,
      })),
    };

    const combined = mergeLoads(buildingData, scaledHpProfile.dataPoints, 60);
    const peakResult = analyzePeakLoad(combined, energyData.gridConnectionId);
    const tempCorr = correlateTemperatures(combined, priceMap);

    const hpElecKwh = heatDemand.totalHeatDemandKwh * (selection.wpDekkingPercent / 100) / selectedModel.scop;
    
    const saldering = calculateSaldering({
      energyData: buildingData,
      hpExtraConsumptionKwh: hpElecKwh,
      electricityPricePerKwh: energyData.electricityPricePerKwh,
      feedInTariffPerKwh: energyData.feedInTariffPerKwh,
      terugleveringboetePerKwh: energyData.terugleveringboetePerKwh,
    });

    const hpKwhMap = new Map<string, number>();
    scaledHpProfile.dataPoints.forEach(point => {
      const key = point.timestamp.substring(0, 13).replace('T', '-');
      hpKwhMap.set(key, point.powerKw);
    });

    const dynamic = calculateDynamicPricing({
      energyData: buildingData,
      hpProfileKwh: hpKwhMap,
      priceTempData: priceMap,
      fixedElectricityPrice: energyData.electricityPricePerKwh,
      fixedFeedInTariff: energyData.feedInTariffPerKwh,
      salderingEnabled: energyData.salderingEnabled,
    });

    const steering = applySmartSteering({
      hpProfileKwh: hpKwhMap,
      priceTempData: priceMap,
      maxShiftHours: 4,
      maxShiftRatio: 0.7,
      bufferCapacityKwh: 50,
    });

    const exceedanceHours = combined.filter(p => p.isExceedance).length;
    const extraGasM3 = exceedanceHours > 0 
      ? (exceedanceHours * peakResult.avgPowerKw * 0.5) / 9.769 / 0.9
      : 0;

    const totalHpKwh = scaledHpProfile.dataPoints.reduce((sum, p) => sum + p.powerKw, 0);
    const eigenVerbruikKwh = Math.min(totalHpKwh, energyData.electricityFeedIn);
    const eigenVerbruikValue = eigenVerbruikKwh * 
      (energyData.electricityPricePerKwh - energyData.feedInTariffPerKwh + energyData.terugleveringboetePerKwh);

    return {
      buildingProfile: buildingData,
      hpProfile: scaledHpProfile,
      combinedLoad: combined,
      peakLoadResult: peakResult,
      tempCorrelation: tempCorr,
      salderingAnalysis: saldering,
      dynamicPricing: dynamic,
      smartSteering: steering,
      hybrideScenario: {
        switchHours: exceedanceHours,
        extraGasM3: extraGasM3.toFixed(1),
        reducedElecKwh: (exceedanceHours * peakResult.avgPowerKw * 0.3).toFixed(1),
        extraCost: (extraGasM3 * energyData.gasPricePerM3).toFixed(2),
      },
      eigenVerbruik: {
        totalWpKwh: totalHpKwh.toFixed(0),
        eigenVerbruikKwh: eigenVerbruikKwh.toFixed(0),
        benefit: eigenVerbruikValue.toFixed(2),
      },
    };
  }, [energyData, selectedModel, selectedUnits, heatDemand, selection]);

  const gridConnection = gridConnectionOptions[energyData.gridConnectionId];
  const { peakLoadResult, tempCorrelation, salderingAnalysis, dynamicPricing, smartSteering, hybrideScenario, eigenVerbruik } = analysisData;

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">{t('peak.title')}</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">{t('peak.subtitle')}</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded">
            <span className="text-gray-500 dark:text-gray-400">{t('peak.connection')}:</span>
            <span className="font-medium ml-2 dark:text-white">{gridConnection.name}</span>
          </div>
          <div className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded font-medium dark:text-white">{gridConnection.maxPowerKw} kW</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label={t('peak.peakPower')} value={peakLoadResult.peakPowerKw.toFixed(1)} unit="kW" variant="primary" />
        <StatCard label={t('peak.avgPower')} value={peakLoadResult.avgPowerKw.toFixed(1)} unit="kW" />
        <StatCard label={t('peak.connectionCapacity')} value={peakLoadResult.connectionCapacityKw.toFixed(1)} unit="kW"
          variant={peakLoadResult.peakPowerKw > peakLoadResult.connectionCapacityKw ? 'warning' : 'success'} />
        <StatCard label={t('peak.exceedances')} value={peakLoadResult.exceedanceCount.toLocaleString(locale)}
          sublabel={`${peakLoadResult.exceedancePercent.toFixed(1)}%`}
          variant={peakLoadResult.exceedanceCount > 0 ? 'danger' : 'success'} />
      </div>

      {peakLoadResult.exceedanceCount > 0 && (
        <Alert type="warning" title={t('peak.exceedanceAlert')} className="mb-6">
          {t('peak.exceedanceDesc')} {peakLoadResult.exceedanceCount} {t('peak.times')},
          {language === 'nl' ? ' met max ' : ' with max '}{(peakLoadResult.peakPowerKw - peakLoadResult.connectionCapacityKw).toFixed(1)} kW {t('peak.aboveLimit')}.
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title={t('stats.title')}>
            <Table
              columns={[
                { key: 'stat', header: t('stats.statistic') },
                { key: 'value', header: t('stats.value'), align: 'right' },
              ]}
              data={[
                { stat: t('stats.interval'), value: `60 ${t('stats.minutes')}`, id: '1' },
                { stat: t('stats.minDuration'), value: `${peakLoadResult.minExceedanceDurationMin.toFixed(1)} ${t('stats.hours')}`, id: '2' },
                { stat: t('stats.maxDuration'), value: `${peakLoadResult.maxExceedanceDurationHours.toFixed(1)} ${t('stats.hours')}`, id: '3' },
                { stat: t('stats.totalTime'), value: `${peakLoadResult.totalExceedanceTimeHours.toFixed(1)} ${t('stats.hours')}`, id: '5' },
              ]}
              keyField="id"
              compact
            />
            {tempCorrelation.count > 0 && (
              <div className="mt-4 pt-4 border-t dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">🌡 {t('temp.atExceedances')}</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div><span className="text-gray-500 dark:text-gray-400">{t('temp.min')}: </span><span className="font-medium dark:text-white">{tempCorrelation.minTempC.toFixed(1)}°C</span></div>
                  <div><span className="text-gray-500 dark:text-gray-400">{t('temp.max')}: </span><span className="font-medium dark:text-white">{tempCorrelation.maxTempC.toFixed(1)}°C</span></div>
                  <div><span className="text-gray-500 dark:text-gray-400">{t('temp.avg')}: </span><span className="font-medium dark:text-white">{tempCorrelation.avgTempC.toFixed(1)}°C</span></div>
                </div>
              </div>
            )}
          </Card>

          <Card title={`⚡ ${t('hybrid.title')}`}>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('hybrid.desc')}</p>
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="primary">Hybride 0°C</Badge>
              <span className="text-xs text-gray-500 dark:text-gray-400">{t('hybrid.condition')}</span>
            </div>
            {hybrideScenario.switchHours > 0 ? (
              <div className="grid grid-cols-4 gap-4">
                <StatCard label={t('hybrid.hours')} value={hybrideScenario.switchHours} />
                <StatCard label={t('hybrid.extraGas')} value={`+${hybrideScenario.extraGasM3}`} unit="m³" />
                <StatCard label={t('hybrid.savedElec')} value={`-${hybrideScenario.reducedElecKwh}`} unit="kWh" />
                <StatCard label={t('hybrid.additionalCost')} value={`+€ ${hybrideScenario.extraCost}`} />
              </div>
            ) : (
              <Alert type="success" title={t('hybrid.notNeeded')}>{t('hybrid.notNeededDesc')}</Alert>
            )}
          </Card>

          <Card title={`⚡ ${t('feedIn.title')}`} headerAction={
            <ToggleGroup options={[{ id: 'met', label: t('feedIn.withNetMetering') }, { id: 'zonder', label: t('feedIn.withoutNetMetering') }]}
              value={salderingTab} onChange={(v) => setSalderingTab(v as 'met' | 'zonder')} size="sm" />
          }>
            <Table
              columns={[
                { key: 'scenario', header: t('feedIn.scenario') },
                { key: 'teruglevering', header: t('feedIn.feedIn'), align: 'right' },
                { key: 'opbrengst', header: t('feedIn.revenue'), align: 'right' },
                { key: 'kosten', header: t('feedIn.costs'), align: 'right' },
                { key: 'netto', header: t('feedIn.net'), align: 'right' },
              ]}
              data={salderingTab === 'met' ? [
                { scenario: t('feedIn.withoutHP'), teruglevering: `${Math.round(salderingAnalysis.metSaldering.zonderWP.terugleveringKwh).toLocaleString(locale)} kWh`,
                  opbrengst: `+€ ${salderingAnalysis.metSaldering.zonderWP.opbrengstEur.toFixed(2)}`,
                  kosten: `-€ ${Math.abs(salderingAnalysis.metSaldering.zonderWP.kostenEur).toFixed(2)}`,
                  netto: `€ ${salderingAnalysis.metSaldering.zonderWP.nettoEur.toFixed(2)}`, id: '1' },
                { scenario: t('feedIn.withHP'), teruglevering: `${Math.round(salderingAnalysis.metSaldering.metWP.terugleveringKwh).toLocaleString(locale)} kWh`,
                  opbrengst: `+€ ${salderingAnalysis.metSaldering.metWP.opbrengstEur.toFixed(2)}`,
                  kosten: `-€ ${Math.abs(salderingAnalysis.metSaldering.metWP.kostenEur).toFixed(2)}`,
                  netto: `€ ${salderingAnalysis.metSaldering.metWP.nettoEur.toFixed(2)}`, id: '2' },
              ] : [
                { scenario: t('feedIn.withoutHP'), teruglevering: `${Math.round(salderingAnalysis.zonderSaldering.zonderWP.terugleveringKwh).toLocaleString(locale)} kWh`,
                  opbrengst: `+€ ${salderingAnalysis.zonderSaldering.zonderWP.opbrengstEur.toFixed(2)}`,
                  kosten: `-€ ${Math.abs(salderingAnalysis.zonderSaldering.zonderWP.kostenEur).toFixed(2)}`,
                  netto: `€ ${salderingAnalysis.zonderSaldering.zonderWP.nettoEur.toFixed(2)}`, id: '1' },
                { scenario: t('feedIn.withHP'), teruglevering: `${Math.round(salderingAnalysis.zonderSaldering.metWP.terugleveringKwh).toLocaleString(locale)} kWh`,
                  opbrengst: `+€ ${salderingAnalysis.zonderSaldering.metWP.opbrengstEur.toFixed(2)}`,
                  kosten: `-€ ${Math.abs(salderingAnalysis.zonderSaldering.metWP.kostenEur).toFixed(2)}`,
                  netto: `€ ${salderingAnalysis.zonderSaldering.metWP.nettoEur.toFixed(2)}`, id: '2' },
              ]}
              keyField="id"
              compact
            />
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-medium text-green-800 dark:text-green-300">💡 {t('feedIn.selfConsumption')}</h4>
              <p className="text-sm text-green-700 dark:text-green-400 mt-1">{t('feedIn.totalHP')}: {eigenVerbruik.totalWpKwh} kWh/{language === 'nl' ? 'jaar' : 'year'} | {t('feedIn.selfConsumptionLabel')}: {eigenVerbruik.eigenVerbruikKwh} kWh</p>
              <div className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">+€ {eigenVerbruik.benefit} <span className="text-sm font-normal">{t('feedIn.savings')}</span></div>
            </div>
          </Card>

          <Card title={`↗ ${t('dynamic.title')}`} headerAction={
            <ToggleGroup options={[{ id: 'met', label: t('feedIn.withNetMetering') }, { id: 'zonder', label: t('feedIn.withoutNetMetering') }]}
              value={dynamicTab} onChange={(v) => setDynamicTab(v as 'met' | 'zonder')} size="sm" />
          }>
            <Table
              columns={[
                { key: 'scenario', header: t('feedIn.scenario') },
                { key: 'vastTarief', header: t('dynamic.fixedRate'), align: 'right' },
                { key: 'dynamisch', header: t('dynamic.dynamic'), align: 'right' },
                { key: 'verschil', header: t('dynamic.difference'), align: 'right' },
              ]}
              data={dynamicTab === 'met' ? [
                { scenario: t('feedIn.withoutHP'), vastTarief: `€ ${dynamicPricing.metSaldering.zonderWP.vastTariefEur.toFixed(2)}`,
                  dynamisch: `€ ${dynamicPricing.metSaldering.zonderWP.dynamischEur.toFixed(2)}`,
                  verschil: `+€ ${dynamicPricing.metSaldering.zonderWP.verschilEur.toFixed(2)}`, id: '1' },
                { scenario: t('feedIn.withHP'), vastTarief: `€ ${dynamicPricing.metSaldering.metWP.vastTariefEur.toFixed(2)}`,
                  dynamisch: `€ ${dynamicPricing.metSaldering.metWP.dynamischEur.toFixed(2)}`,
                  verschil: `+€ ${dynamicPricing.metSaldering.metWP.verschilEur.toFixed(2)}`, id: '2' },
              ] : [
                { scenario: t('feedIn.withoutHP'), vastTarief: `€ ${dynamicPricing.zonderSaldering.zonderWP.vastTariefEur.toFixed(2)}`,
                  dynamisch: `€ ${dynamicPricing.zonderSaldering.zonderWP.dynamischEur.toFixed(2)}`,
                  verschil: `+€ ${dynamicPricing.zonderSaldering.zonderWP.verschilEur.toFixed(2)}`, id: '1' },
                { scenario: t('feedIn.withHP'), vastTarief: `€ ${dynamicPricing.zonderSaldering.metWP.vastTariefEur.toFixed(2)}`,
                  dynamisch: `€ ${dynamicPricing.zonderSaldering.metWP.dynamischEur.toFixed(2)}`,
                  verschil: `+€ ${dynamicPricing.zonderSaldering.metWP.verschilEur.toFixed(2)}`, id: '2' },
              ]}
              keyField="id"
              compact
            />
            <div className="mt-4 pt-4 border-t dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
              {t('dynamic.priceRange')}: {dynamicPricing.priceStats.minPriceCtPerKwh.toFixed(1)} - {dynamicPricing.priceStats.maxPriceCtPerKwh.toFixed(1)} ct/kWh
              ({t('dynamic.avg')} {dynamicPricing.priceStats.avgPriceCtPerKwh.toFixed(1)} ct/kWh)
            </div>
          </Card>

          <Card title={`↗ ${t('steering.title')}`}>
            <Badge variant="primary">{language === 'nl' ? 'Dynamisch tarief' : 'Dynamic pricing'}</Badge>
            <p className="text-sm text-gray-600 dark:text-gray-400 my-4">{t('steering.desc')}</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('steering.withoutSteering')}</div>
                <div className="text-xl font-semibold mt-1 dark:text-white">€ {smartSteering.zonderSturingEur.toFixed(2)}</div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('steering.withSteering')}</div>
                <div className="text-xl font-semibold mt-1 text-emerald-600 dark:text-emerald-400">€ {smartSteering.metSturingEur.toFixed(2)}</div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="text-sm text-green-700 dark:text-green-300">{t('steering.savings')}</div>
                <div className="text-xl font-semibold mt-1 text-green-600 dark:text-green-400">+€ {smartSteering.besparingEur.toFixed(2)}</div>
                <div className="text-xs text-green-600 dark:text-green-400">{smartSteering.verschovenKwh.toFixed(0)} kWh {t('steering.shifted')}</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Badge>SBI-55</Badge>
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('profile.standard')}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500">{t('profile.basedOn')} {energyData.electricityOfftake.toLocaleString(locale)} kWh/{language === 'nl' ? 'jaar' : 'year'}</p>
          </Card>

          <Card title={t('chart.settings')}>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">{t('chart.timePeriod')}</label>
                <ToggleGroup
                  options={[
                    { id: 'dag', label: t('chart.day') },
                    { id: 'week', label: t('chart.week') },
                    { id: 'maand', label: t('chart.month') },
                    { id: 'jaar', label: t('chart.year') },
                  ]}
                  value={timeFilter}
                  onChange={(v) => setTimeFilter(v as TimeFilter)}
                  size="sm"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {[t('chart.building'), t('chart.hpUnsteered'), t('chart.total'), t('chart.price'), t('chart.temperature')].map((label, idx) => (
                  <span key={idx} className={`px-3 py-1.5 text-xs rounded-full border
                    ${idx === 0 ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300' :
                      idx === 2 ? 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300' :
                      'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'}`}>
                    ● {label}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="h-48 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-600">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <svg className="w-10 h-10 mx-auto mb-2 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-sm">{t('chart.placeholder')}</p>
              </div>
            </div>
          </Card>

          <Button variant="ghost" onClick={onBack} className="w-full">← {t('action.back')}</Button>
        </div>
      </div>
    </div>
  );
}

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  return `${y}-${m}-${d}-${h}`;
}
