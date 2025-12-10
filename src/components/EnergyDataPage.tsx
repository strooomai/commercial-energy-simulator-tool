/**
 * Screen 1: Energiegegevens (Energy Data) Page
 * Manual energy data input and file upload
 */

import { useState, useCallback } from 'react';
import { Card, Input, Select, Button, Alert, StatCard, ToggleGroup } from './ui';
import {
  buildingTypes,
  BuildingTypeId,
  gridConnectionOptions,
  GridConnectionId,
  ManualEnergyData,
  bivalentPointConfig,
  BivalentPointId,
} from '../types/schema';
import { calculateHeatDemand, calculateDefaultDHW, HeatDemandResult } from '../lib/heatDemandCalculator';
import { useTranslation, getBuildingTypeName, getBivalentPointName } from '../lib/i18n';

interface EnergyDataPageProps {
  onComplete: (data: ManualEnergyData, heatDemand: HeatDemandResult) => void;
  initialData?: ManualEnergyData;
}

export function EnergyDataPage({ onComplete, initialData }: EnergyDataPageProps) {
  const { t, language, locale } = useTranslation();

  // Form state
  const [formData, setFormData] = useState<Partial<ManualEnergyData>>(initialData || {
    buildingType: 'apartment_building',
    numberOfUnits: 40,
    isCoastalLocation: false,
    gridConnectionId: '3x40A',
    electricityFeedIn: 180000,
    electricityOfftake: 600000,
    gasConsumption: 50000,
    dhwLitersPerDay: 4800,
    occupancyWeekdayStart: 7,
    occupancyWeekdayEnd: 22,
    occupancyWeekendStart: 8,
    occupancyWeekendEnd: 23,
    gasPricePerM3: 1.50,
    electricityPricePerKwh: 0.35,
    feedInTariffPerKwh: 0.07,
    terugleveringboetePerKwh: 0.11,
    salderingEnabled: true,
    bivalentPointC: '0',
  });

  const [inputMode, setInputMode] = useState<'manual' | 'upload'>('manual');
  const [heatDemand, setHeatDemand] = useState<HeatDemandResult | null>(null);

  // Update form field
  const updateField = useCallback(<K extends keyof ManualEnergyData>(
    field: K,
    value: ManualEnergyData[K]
  ) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate DHW when building type or units change
      if (field === 'buildingType' || field === 'numberOfUnits') {
        const bt = (field === 'buildingType' ? value : prev.buildingType) as BuildingTypeId;
        const units = (field === 'numberOfUnits' ? value : prev.numberOfUnits) as number;
        updated.dhwLitersPerDay = calculateDefaultDHW(bt, units);
      }
      
      return updated;
    });
  }, []);

  // Calculate heat demand
  const handleCalculate = useCallback(() => {
    if (!isFormComplete(formData)) return;
    
    const data = formData as ManualEnergyData;
    const result = calculateHeatDemand(data);
    setHeatDemand(result);
  }, [formData]);

  // Submit form
  const handleSubmit = useCallback(() => {
    if (!isFormComplete(formData) || !heatDemand) return;
    onComplete(formData as ManualEnergyData, heatDemand);
  }, [formData, heatDemand, onComplete]);

  // Building type options
  const buildingTypeOptions = Object.entries(buildingTypes).map(([id]) => ({
    value: id,
    label: getBuildingTypeName(id, language),
  }));

  // Grid connection options
  const gridOptions = Object.entries(gridConnectionOptions).map(([id, gc]) => ({
    value: id,
    label: `${gc.name} (max ${gc.maxPowerKw} kW)`,
  }));

  // Bivalent point options
  const bivalentOptions = Object.entries(bivalentPointConfig).map(([id]) => ({
    value: id,
    label: getBivalentPointName(id, language),
  }));

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">{t('energy.title')}</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          {t('energy.subtitle')}
        </p>
      </div>

      {/* Input Mode Toggle */}
      <div className="mb-6">
        <ToggleGroup
          options={[
            { id: 'manual', label: t('energy.manualInput') },
            { id: 'upload', label: t('energy.fileUpload') },
          ]}
          value={inputMode}
          onChange={(v) => setInputMode(v as 'manual' | 'upload')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {inputMode === 'manual' ? (
            <>
              {/* Building Information */}
              <Card title={t('building.info')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label={t('building.type')}
                    options={buildingTypeOptions}
                    value={formData.buildingType || ''}
                    onChange={(e) => updateField('buildingType', e.target.value as BuildingTypeId)}
                  />
                  <Input
                    label={t('building.units')}
                    type="number"
                    value={formData.numberOfUnits || ''}
                    onChange={(e) => updateField('numberOfUnits', parseInt(e.target.value) || 0)}
                    helper={t('building.unitsHelper')}
                  />
                  <Select
                    label={t('building.gridConnection')}
                    options={gridOptions}
                    value={formData.gridConnectionId || ''}
                    onChange={(e) => updateField('gridConnectionId', e.target.value as GridConnectionId)}
                  />
                  <div className="flex items-center gap-3 pt-6">
                    <input
                      type="checkbox"
                      id="coastal"
                      checked={formData.isCoastalLocation || false}
                      onChange={(e) => updateField('isCoastalLocation', e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-emerald-500 focus:ring-emerald-500 dark:bg-gray-700"
                    />
                    <label htmlFor="coastal" className="text-sm text-gray-700 dark:text-gray-300">
                      {t('building.coastalLocation')}
                    </label>
                  </div>
                </div>
              </Card>

              {/* Energy Consumption */}
              <Card title={t('consumption.title')}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label={t('consumption.electricityOfftake')}
                    type="number"
                    value={formData.electricityOfftake || ''}
                    onChange={(e) => updateField('electricityOfftake', parseFloat(e.target.value) || 0)}
                    unit="kWh"
                  />
                  <Input
                    label={t('consumption.electricityFeedIn')}
                    type="number"
                    value={formData.electricityFeedIn || ''}
                    onChange={(e) => updateField('electricityFeedIn', parseFloat(e.target.value) || 0)}
                    unit="kWh"
                    helper={t('consumption.feedInHelper')}
                  />
                  <Input
                    label={t('consumption.gas')}
                    type="number"
                    value={formData.gasConsumption || ''}
                    onChange={(e) => updateField('gasConsumption', parseFloat(e.target.value) || 0)}
                    unit="m³"
                  />
                </div>
              </Card>

              {/* Hot Water */}
              <Card title={t('hotWater.title')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('hotWater.consumption')}
                    type="number"
                    value={formData.dhwLitersPerDay || ''}
                    onChange={(e) => updateField('dhwLitersPerDay', parseFloat(e.target.value) || 0)}
                    unit="L/dag"
                    helper={t('hotWater.consumptionHelper')}
                  />
                  <Select
                    label={t('hotWater.bivalentPoint')}
                    options={bivalentOptions}
                    value={formData.bivalentPointC || '0'}
                    onChange={(e) => updateField('bivalentPointC', e.target.value as BivalentPointId)}
                    helper={t('hotWater.bivalentHelper')}
                  />
                </div>
              </Card>

              {/* Energy Prices */}
              <Card title={t('prices.title')}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('prices.gas')}
                    type="number"
                    step="0.01"
                    value={formData.gasPricePerM3 || ''}
                    onChange={(e) => updateField('gasPricePerM3', parseFloat(e.target.value) || 0)}
                    unit="€/m³"
                  />
                  <Input
                    label={t('prices.electricity')}
                    type="number"
                    step="0.01"
                    value={formData.electricityPricePerKwh || ''}
                    onChange={(e) => updateField('electricityPricePerKwh', parseFloat(e.target.value) || 0)}
                    unit="€/kWh"
                  />
                  <Input
                    label={t('prices.feedInTariff')}
                    type="number"
                    step="0.01"
                    value={formData.feedInTariffPerKwh || ''}
                    onChange={(e) => updateField('feedInTariffPerKwh', parseFloat(e.target.value) || 0)}
                    unit="€/kWh"
                  />
                  <Input
                    label={t('prices.feedInPenalty')}
                    type="number"
                    step="0.01"
                    value={formData.terugleveringboetePerKwh || ''}
                    onChange={(e) => updateField('terugleveringboetePerKwh', parseFloat(e.target.value) || 0)}
                    unit="€/kWh"
                    helper={t('prices.feedInPenaltyHelper')}
                  />
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="saldering"
                    checked={formData.salderingEnabled ?? true}
                    onChange={(e) => updateField('salderingEnabled', e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-emerald-500 focus:ring-emerald-500 dark:bg-gray-700"
                  />
                  <label htmlFor="saldering" className="text-sm text-gray-700 dark:text-gray-300">
                    {t('prices.netMetering')}
                  </label>
                </div>
              </Card>

              {/* Occupancy Hours */}
              <Card title={t('occupancy.title')} subtitle={t('occupancy.subtitle')}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Input
                    label={t('occupancy.weekdayStart')}
                    type="number"
                    min="0"
                    max="23"
                    value={formData.occupancyWeekdayStart || ''}
                    onChange={(e) => updateField('occupancyWeekdayStart', parseInt(e.target.value) || 0)}
                    unit={language === 'nl' ? 'uur' : 'h'}
                  />
                  <Input
                    label={t('occupancy.weekdayEnd')}
                    type="number"
                    min="0"
                    max="23"
                    value={formData.occupancyWeekdayEnd || ''}
                    onChange={(e) => updateField('occupancyWeekdayEnd', parseInt(e.target.value) || 0)}
                    unit={language === 'nl' ? 'uur' : 'h'}
                  />
                  <Input
                    label={t('occupancy.weekendStart')}
                    type="number"
                    min="0"
                    max="23"
                    value={formData.occupancyWeekendStart || ''}
                    onChange={(e) => updateField('occupancyWeekendStart', parseInt(e.target.value) || 0)}
                    unit={language === 'nl' ? 'uur' : 'h'}
                  />
                  <Input
                    label={t('occupancy.weekendEnd')}
                    type="number"
                    min="0"
                    max="23"
                    value={formData.occupancyWeekendEnd || ''}
                    onChange={(e) => updateField('occupancyWeekendEnd', parseInt(e.target.value) || 0)}
                    unit={language === 'nl' ? 'uur' : 'h'}
                  />
                </div>
              </Card>
            </>
          ) : (
            /* File Upload */
            <Card title={t('upload.title')}>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center">
                <svg className="mx-auto w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                  {t('upload.dropzone')}{' '}
                  <button className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium">
                    {t('upload.browse')}
                  </button>
                </p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                  {t('upload.supported')}
                </p>
              </div>
            </Card>
          )}

          {/* Calculate Button */}
          <div className="flex gap-4">
            <Button onClick={handleCalculate} className="flex-1">
              {t('action.calculate')}
            </Button>
          </div>
        </div>

        {/* Results Sidebar */}
        <div className="space-y-6">
          {heatDemand ? (
            <>
              <Card title={t('results.heatDemand')} variant="success">
                <div className="space-y-4">
                  <StatCard
                    label={t('results.totalHeatDemand')}
                    value={Math.round(heatDemand.totalHeatDemandKwh).toLocaleString(locale)}
                    unit="kWh/jaar"
                    variant="primary"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard
                      label={t('results.spaceHeating')}
                      value={Math.round(heatDemand.spaceHeatingKwh).toLocaleString(locale)}
                      unit="kWh"
                      sublabel={`${heatDemand.spaceHeatingPercent.toFixed(0)}%`}
                    />
                    <StatCard
                      label={t('results.dhw')}
                      value={Math.round(heatDemand.hotWaterKwh).toLocaleString(locale)}
                      unit="kWh"
                      sublabel={`${heatDemand.hotWaterPercent.toFixed(0)}%`}
                    />
                  </div>
                  <StatCard
                    label={t('results.requiredPower')}
                    value={heatDemand.requiredPowerKw.toFixed(1)}
                    unit="kW"
                    sublabel={t('results.fullLoadHours')}
                  />
                </div>
              </Card>

              <Card title={t('costs.current')}>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('costs.gas')}</span>
                    <span className="font-medium dark:text-white">€ {heatDemand.calculatedEnergyCosts.gasCurrentEur.toLocaleString(locale, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('costs.electricity')}</span>
                    <span className="font-medium dark:text-white">€ {heatDemand.calculatedEnergyCosts.electricityCurrentEur.toLocaleString(locale, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="border-t dark:border-gray-700 pt-3 flex justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">{t('costs.total')}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      € {heatDemand.calculatedEnergyCosts.totalCurrentEur.toLocaleString(locale, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </Card>

              <Button onClick={handleSubmit} variant="primary" className="w-full">
                {t('action.continueToHeatPump')} →
              </Button>
            </>
          ) : (
            <Alert type="info" title={t('alert.fillData')}>
              {t('alert.fillDataDesc')}
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper to check if form is complete
function isFormComplete(data: Partial<ManualEnergyData>): data is ManualEnergyData {
  return !!(
    data.buildingType &&
    data.numberOfUnits &&
    data.numberOfUnits > 0 &&
    data.gridConnectionId &&
    data.electricityOfftake !== undefined &&
    data.gasConsumption !== undefined &&
    data.gasConsumption > 0
  );
}
