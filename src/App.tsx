/**
 * Energy Simulator Tool - Main Application
 */

import { useState, useCallback } from 'react';
import { Navigation, SummaryBar } from './components/Navigation';
import { EnergyDataPage } from './components/EnergyDataPage';
import { HeatPumpPage } from './components/HeatPumpPage';
import { PiekbelastingPage } from './components/PiekbelastingPage';
import { ManualEnergyData, HeatPumpModel } from './types/schema';
import { HeatDemandResult } from './lib/heatDemandCalculator';
import { SavingsResult } from './lib/savingsCalculator';
import { HPSelectionOutput } from './lib/hpSelectorEngine';
import { LanguageProvider, useTranslation, getBuildingTypeName } from './lib/i18n';

type Screen = 'energy' | 'heatpump' | 'piekbelasting';

interface AppState {
  screen: Screen;
  energyData: ManualEnergyData | null;
  heatDemand: HeatDemandResult | null;
  selectedModel: HeatPumpModel | null;
  selectedUnits: number;
  savings: SavingsResult | null;
  selection: HPSelectionOutput | null;
}

function AppContent() {
  const { language } = useTranslation();
  const [state, setState] = useState<AppState>({
    screen: 'energy',
    energyData: null,
    heatDemand: null,
    selectedModel: null,
    selectedUnits: 1,
    savings: null,
    selection: null,
  });

  const handleEnergyComplete = useCallback((data: ManualEnergyData, heatDemand: HeatDemandResult) => {
    setState(prev => ({ ...prev, screen: 'heatpump', energyData: data, heatDemand }));
  }, []);

  const handleHeatPumpComplete = useCallback((
    model: HeatPumpModel, units: number, savings: SavingsResult, selection: HPSelectionOutput
  ) => {
    setState(prev => ({ ...prev, screen: 'piekbelasting', selectedModel: model, selectedUnits: units, savings, selection }));
  }, []);

  const handleNavigate = useCallback((screen: Screen) => {
    setState(prev => ({ ...prev, screen }));
  }, []);

  const energyDataComplete = state.energyData !== null && state.heatDemand !== null;
  const heatPumpSelected = state.selectedModel !== null && state.savings !== null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation
        currentScreen={state.screen}
        onNavigate={handleNavigate}
        energyDataComplete={energyDataComplete}
        heatPumpSelected={heatPumpSelected}
      />
      {state.energyData && (
        <SummaryBar
          buildingType={getBuildingTypeName(state.energyData.buildingType, language)}
          electricityKwh={state.energyData.electricityOfftake}
          gasM3={state.energyData.gasConsumption}
          dhwLiters={state.energyData.dhwLitersPerDay}
        />
      )}
      <main>
        {state.screen === 'energy' && (
          <EnergyDataPage onComplete={handleEnergyComplete} initialData={state.energyData || undefined} />
        )}
        {state.screen === 'heatpump' && state.energyData && state.heatDemand && (
          <HeatPumpPage
            energyData={state.energyData}
            heatDemand={state.heatDemand}
            onComplete={handleHeatPumpComplete}
            onBack={() => setState(prev => ({ ...prev, screen: 'energy' }))}
          />
        )}
        {state.screen === 'piekbelasting' && state.energyData && state.heatDemand && state.selectedModel && state.savings && state.selection && (
          <PiekbelastingPage
            energyData={state.energyData}
            heatDemand={state.heatDemand}
            selectedModel={state.selectedModel}
            selectedUnits={state.selectedUnits}
            savings={state.savings}
            selection={state.selection}
            onBack={() => setState(prev => ({ ...prev, screen: 'heatpump' }))}
          />
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
