/**
 * Application State Management
 * Centralized store for energy simulator data
 */

import { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  ManualEnergyData,
  ProcessedEnergyData,
  HeatPumpProfile,
  HeatPumpModel,
  PriceTempDataPoint,
  BivalentPointId,
} from '../types/schema';
import { HeatDemandResult } from '../lib/heatDemandCalculator';
import { HPSelectionOutput } from '../lib/hpSelectorEngine';
import { SavingsResult } from '../lib/savingsCalculator';

// State interface
export interface AppState {
  // Screen 1: Energy Data
  manualEnergyData: ManualEnergyData | null;
  processedEnergyData: ProcessedEnergyData | null;
  heatDemandResult: HeatDemandResult | null;
  
  // Screen 2: Heat Pump Selection
  selectedBivalentPoint: BivalentPointId;
  hpSelectionResult: HPSelectionOutput | null;
  selectedModel: HeatPumpModel | null;
  selectedUnits: number;
  savingsResult: SavingsResult | null;
  
  // Screen 3: Peak Load Analysis
  hpProfile: HeatPumpProfile | null;
  priceTempData: Map<string, PriceTempDataPoint>;
  
  // UI State
  currentScreen: 'energy' | 'heatpump' | 'piekbelasting';
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: AppState = {
  manualEnergyData: null,
  processedEnergyData: null,
  heatDemandResult: null,
  selectedBivalentPoint: '0',
  hpSelectionResult: null,
  selectedModel: null,
  selectedUnits: 1,
  savingsResult: null,
  hpProfile: null,
  priceTempData: new Map(),
  currentScreen: 'energy',
  isLoading: false,
  error: null,
};

// Action types
type AppAction =
  | { type: 'SET_MANUAL_ENERGY_DATA'; payload: ManualEnergyData }
  | { type: 'SET_PROCESSED_ENERGY_DATA'; payload: ProcessedEnergyData }
  | { type: 'SET_HEAT_DEMAND_RESULT'; payload: HeatDemandResult }
  | { type: 'SET_BIVALENT_POINT'; payload: BivalentPointId }
  | { type: 'SET_HP_SELECTION_RESULT'; payload: HPSelectionOutput }
  | { type: 'SET_SELECTED_MODEL'; payload: { model: HeatPumpModel; units: number } }
  | { type: 'SET_SAVINGS_RESULT'; payload: SavingsResult }
  | { type: 'SET_HP_PROFILE'; payload: HeatPumpProfile }
  | { type: 'SET_PRICE_TEMP_DATA'; payload: Map<string, PriceTempDataPoint> }
  | { type: 'SET_CURRENT_SCREEN'; payload: 'energy' | 'heatpump' | 'piekbelasting' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_MANUAL_ENERGY_DATA':
      return { ...state, manualEnergyData: action.payload };
    case 'SET_PROCESSED_ENERGY_DATA':
      return { ...state, processedEnergyData: action.payload };
    case 'SET_HEAT_DEMAND_RESULT':
      return { ...state, heatDemandResult: action.payload };
    case 'SET_BIVALENT_POINT':
      return { ...state, selectedBivalentPoint: action.payload };
    case 'SET_HP_SELECTION_RESULT':
      return { ...state, hpSelectionResult: action.payload };
    case 'SET_SELECTED_MODEL':
      return { 
        ...state, 
        selectedModel: action.payload.model,
        selectedUnits: action.payload.units,
      };
    case 'SET_SAVINGS_RESULT':
      return { ...state, savingsResult: action.payload };
    case 'SET_HP_PROFILE':
      return { ...state, hpProfile: action.payload };
    case 'SET_PRICE_TEMP_DATA':
      return { ...state, priceTempData: action.payload };
    case 'SET_CURRENT_SCREEN':
      return { ...state, currentScreen: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within AppProvider');
  }
  return context;
}

// Selector hooks for convenience
export function useEnergyData() {
  const { state } = useAppState();
  return {
    manualData: state.manualEnergyData,
    processedData: state.processedEnergyData,
    heatDemand: state.heatDemandResult,
  };
}

export function useHeatPumpSelection() {
  const { state } = useAppState();
  return {
    bivalentPoint: state.selectedBivalentPoint,
    selectionResult: state.hpSelectionResult,
    selectedModel: state.selectedModel,
    selectedUnits: state.selectedUnits,
    savings: state.savingsResult,
  };
}

export function usePeakLoadData() {
  const { state } = useAppState();
  return {
    energyData: state.processedEnergyData,
    hpProfile: state.hpProfile,
    priceTempData: state.priceTempData,
    manualData: state.manualEnergyData,
  };
}
