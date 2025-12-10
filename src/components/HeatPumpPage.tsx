/**
 * Screen 2: Warmtepomp Selectie (Heat Pump Selection) Page
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Select, Table, StatCard, Alert, Badge } from './ui';
import {
  ManualEnergyData,
  HeatPumpModel,
  bivalentPointConfig,
  BivalentPointId,
  HPSelectorResult,
  heatPumpModels,
} from '../types/schema';
import { HeatDemandResult } from '../lib/heatDemandCalculator';
import { selectHeatPump, HPSelectionOutput } from '../lib/hpSelectorEngine';
import { calculateSavings, SavingsResult, formatCurrency } from '../lib/savingsCalculator';
import { useTranslation, getBivalentPointName, getBivalentPointDesc } from '../lib/i18n';

interface HeatPumpPageProps {
  energyData: ManualEnergyData;
  heatDemand: HeatDemandResult;
  onComplete: (
    model: HeatPumpModel,
    units: number,
    savings: SavingsResult,
    selection: HPSelectionOutput
  ) => void;
  onBack: () => void;
}

export function HeatPumpPage({
  energyData,
  heatDemand,
  onComplete,
  onBack,
}: HeatPumpPageProps) {
  const { t, language, locale } = useTranslation();
  const [bivalentPoint, setBivalentPoint] = useState<BivalentPointId>(energyData.bivalentPointC);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [selectedUnits, setSelectedUnits] = useState<number>(1);

  // Calculate HP selection
  const selection = useMemo(() => {
    return selectHeatPump({
      requiredPowerKw: heatDemand.requiredPowerKw,
      bivalentPoint,
      isCoastalLocation: energyData.isCoastalLocation,
    });
  }, [heatDemand.requiredPowerKw, bivalentPoint, energyData.isCoastalLocation]);

  // Auto-select recommended model
  useEffect(() => {
    if (selection.recommendations.length > 0 && !selectedModelId) {
      const rec = selection.recommendations[0];
      setSelectedModelId(rec.model.id);
      setSelectedUnits(rec.unitsNeeded);
    }
  }, [selection, selectedModelId]);

  // Get selected model details
  const selectedOption = useMemo(() => {
    if (!selectedModelId) return null;
    return selection.allOptions.find(opt => opt.model.id === selectedModelId);
  }, [selectedModelId, selection.allOptions]);

  // Calculate savings for selected model
  const savings = useMemo(() => {
    if (!selectedOption) return null;
    return calculateSavings({
      heatDemand,
      selectedModel: selectedOption.model,
      unitsNeeded: selectedUnits,
      totalPrice: selectedUnits * selectedOption.model.priceEur,
      bivalentPoint,
      gasPricePerM3: energyData.gasPricePerM3,
      electricityPricePerKwh: energyData.electricityPricePerKwh,
      currentGasConsumption: energyData.gasConsumption,
    });
  }, [selectedOption, selectedUnits, heatDemand, bivalentPoint, energyData]);

  // Handle model selection
  const handleModelSelect = (opt: HPSelectorResult) => {
    setSelectedModelId(opt.model.id);
    setSelectedUnits(opt.unitsNeeded);
  };

  // Handle continue
  const handleContinue = () => {
    if (selectedOption && savings) {
      onComplete(selectedOption.model, selectedUnits, savings, selection);
    }
  };

  // Table columns
  const columns = [
    {
      key: 'model',
      header: 'Model',
      render: (row: HPSelectorResult) => (
        <div className="flex items-center gap-2">
          <span className="font-medium dark:text-white">{row.model.name}</span>
          {row.isRecommended && <Badge variant="success">{t('hp.recommended')}</Badge>}
        </div>
      ),
    },
    {
      key: 'power',
      header: t('model.power'),
      align: 'right' as const,
      render: (row: HPSelectorResult) => `${row.model.powerKw.toFixed(1)} kW`,
    },
    {
      key: 'units',
      header: t('model.units'),
      align: 'right' as const,
      render: (row: HPSelectorResult) => row.unitsNeeded,
    },
    {
      key: 'totalCapacity',
      header: t('model.totalCapacity'),
      align: 'right' as const,
      render: (row: HPSelectorResult) => `${row.totalCapacityKw.toFixed(1)} kW`,
    },
    {
      key: 'scop',
      header: 'SCOP',
      align: 'right' as const,
      render: (row: HPSelectorResult) => row.model.scop.toFixed(2),
    },
    {
      key: 'pricePerUnit',
      header: t('model.pricePerUnit'),
      align: 'right' as const,
      render: (row: HPSelectorResult) =>
        row.model.priceEur > 0
          ? formatCurrency(row.model.priceEur)
          : t('model.onRequest'),
    },
    {
      key: 'totalPrice',
      header: t('model.totalPrice'),
      align: 'right' as const,
      render: (row: HPSelectorResult) =>
        row.totalPrice > 0
          ? formatCurrency(row.totalPrice)
          : t('model.onRequest'),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">{t('hp.title')}</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          {t('hp.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bivalent Point Selection */}
          <Card title={t('hp.bivalentConfig')}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(bivalentPointConfig).map(([id, config]) => (
                <button
                  key={id}
                  onClick={() => setBivalentPoint(id as BivalentPointId)}
                  className={`
                    p-4 rounded-lg border-2 text-left transition-all
                    ${bivalentPoint === id
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }
                  `}
                >
                  <div className="font-medium text-gray-900 dark:text-white">{getBivalentPointName(id, language)}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{getBivalentPointDesc(id, language)}</div>
                  <div className="mt-3 text-sm">
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      {config.dekkingPercent}% {t('hp.coverage')}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Capacity Summary */}
          <Card>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label={t('hp.requiredPower')}
                value={selection.benodigdVermogenKw.toFixed(1)}
                unit="kW"
                variant="primary"
              />
              <StatCard
                label={t('hp.hpCoverage')}
                value={`${selection.wpDekkingPercent}%`}
                sublabel={t('hp.annualHeatDemand')}
              />
              <StatCard
                label={t('hp.totalHeatDemand')}
                value={Math.round(heatDemand.totalHeatDemandKwh).toLocaleString(locale)}
                unit="kWh"
              />
              <StatCard
                label={t('hp.peakPower')}
                value={heatDemand.requiredPowerKw.toFixed(1)}
                unit="kW"
                sublabel={t('hp.fullCoverage')}
              />
            </div>
          </Card>

          {/* Model Selection Table */}
          <Card title={t('hp.availableModels')} subtitle={t('hp.clickToSelect')}>
            <Table
              columns={columns}
              data={selection.allOptions.filter(opt => opt.totalCapacityKw >= selection.benodigdVermogenKw)}
              keyField="model"
              highlightRow={(row) => row.model.id === selectedModelId}
              onRowClick={handleModelSelect}
            />
          </Card>

          {/* Selected Model Details */}
          {selectedOption && (
            <Card title={`${t('hp.selected')}: ${selectedOption.model.name}`}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('model.type')}</div>
                  <div className="font-medium dark:text-white">{selectedOption.model.type}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('model.maxFlowTemp')}</div>
                  <div className="font-medium dark:text-white">{selectedOption.model.maxFlowTemp}°C</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('model.refrigerant')}</div>
                  <div className="font-medium dark:text-white">{selectedOption.model.refrigerant} (GWP: {selectedOption.model.gwp})</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('model.connection')}</div>
                  <div className="font-medium dark:text-white">{selectedOption.model.connection}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t dark:border-gray-700">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('model.dimensions')}</div>
                  <div className="font-medium dark:text-white">
                    {selectedOption.model.lengthMm}×{selectedOption.model.widthMm}×{selectedOption.model.heightMm} mm
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('model.weight')}</div>
                  <div className="font-medium dark:text-white">{selectedOption.model.weightKg} kg</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('model.maxCurrent')}</div>
                  <div className="font-medium dark:text-white">{selectedOption.model.maxCurrentA} A</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('model.ecCoating')}</div>
                  <div className="font-medium dark:text-white">{selectedOption.model.isEC ? t('model.yes') : t('model.no')}</div>
                </div>
              </div>

              {/* Units Override */}
              <div className="mt-6 pt-4 border-t dark:border-gray-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('model.adjustUnits')}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={selectedUnits}
                    onChange={(e) => setSelectedUnits(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-24 h-12 px-4 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <span className="text-gray-500 dark:text-gray-400">
                    {t('model.totalLabel')}: {(selectedUnits * selectedOption.model.powerKw).toFixed(1)} kW
                    {selectedUnits * selectedOption.model.powerKw < selection.benodigdVermogenKw && (
                      <span className="text-amber-600 dark:text-amber-400 ml-2">
                        ({t('model.belowRequired')})
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar - Savings */}
        <div className="space-y-6">
          {savings && selectedOption ? (
            <>
              <Card title={t('savings.overview')} variant="success">
                <div className="space-y-4">
                  <StatCard
                    label={t('savings.annual')}
                    value={formatCurrency(savings.annualSavingsEur)}
                    sublabel={`${savings.savingsPercent.toFixed(1)}% ${t('savings.onCurrentCosts')}`}
                    variant="success"
                  />
                  <StatCard
                    label={t('savings.co2Reduction')}
                    value={Math.round(savings.co2ReductionKg).toLocaleString(locale)}
                    unit={language === 'nl' ? 'kg/jaar' : 'kg/year'}
                    variant="primary"
                  />
                  <StatCard
                    label={t('savings.payback')}
                    value={savings.paybackYears === Infinity
                      ? t('savings.notApplicable')
                      : savings.paybackYears.toFixed(1)}
                    unit={savings.paybackYears !== Infinity ? t('savings.years') : ''}
                  />
                </div>
              </Card>

              <Card title={t('heat.distribution')}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('heat.byHeatPump')}</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      {savings.heatDemandByHP.percent.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-emerald-500 h-3 rounded-full"
                      style={{ width: `${savings.heatDemandByHP.percent}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">{t('heat.byHP')}</div>
                      <div className="font-medium dark:text-white">
                        {Math.round(savings.heatDemandByHP.kWh).toLocaleString(locale)} kWh
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">{t('heat.byBoiler')}</div>
                      <div className="font-medium dark:text-white">
                        {Math.round(savings.heatDemandByBoiler.kWh).toLocaleString(locale)} kWh
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card title={t('investment.title')}>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{selectedUnits}× {selectedOption.model.name}</span>
                    <span className="font-medium dark:text-white">
                      {formatCurrency(selectedUnits * selectedOption.model.priceEur)}
                    </span>
                  </div>
                  <div className="border-t dark:border-gray-700 pt-3 flex justify-between">
                    <span className="font-medium dark:text-white">{t('investment.total')}</span>
                    <span className="font-semibold text-lg dark:text-white">
                      {formatCurrency(selectedUnits * selectedOption.model.priceEur)}
                    </span>
                  </div>
                </div>
              </Card>

              <Button onClick={handleContinue} className="w-full">
                {t('action.continueToPeakLoad')} →
              </Button>
            </>
          ) : (
            <Alert type="info" title={t('alert.selectModel')}>
              {t('alert.selectModelDesc')}
            </Alert>
          )}

          <Button variant="ghost" onClick={onBack} className="w-full">
            ← {t('action.backToEnergyData')}
          </Button>
        </div>
      </div>
    </div>
  );
}
