/**
 * Navigation Header Component
 * Top app bar with logo and navigation tabs
 */

import React from 'react';
import { useTranslation, LanguageSwitcher, ThemeSwitcher } from '../lib/i18n';

interface NavigationProps {
  currentScreen: 'energy' | 'heatpump' | 'piekbelasting';
  onNavigate: (screen: 'energy' | 'heatpump' | 'piekbelasting') => void;
  energyDataComplete: boolean;
  heatPumpSelected: boolean;
}

export function Navigation({
  currentScreen,
  onNavigate,
  energyDataComplete,
  heatPumpSelected,
}: NavigationProps) {
  const { t } = useTranslation();

  const steps = [
    { id: 'energy', label: t('nav.energyData'), number: 1, enabled: true },
    { id: 'heatpump', label: t('nav.heatPump'), number: 2, enabled: energyDataComplete },
    { id: 'piekbelasting', label: t('nav.peakLoad'), number: 3, enabled: heatPumpSelected },
  ] as const;

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Energy Simulator Tool</span>
          </div>

          {/* Navigation Steps */}
          <nav className="flex items-center gap-2">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => step.enabled && onNavigate(step.id)}
                  disabled={!step.enabled}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                    transition-all duration-200
                    ${currentScreen === step.id
                      ? 'bg-emerald-500 text-white'
                      : step.enabled
                        ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        : 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  <span className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${currentScreen === step.id
                      ? 'bg-white/20'
                      : step.enabled
                        ? 'bg-gray-200 dark:bg-gray-600'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }
                  `}>
                    {step.number}
                  </span>
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 ${step.enabled ? 'bg-gray-300 dark:bg-gray-600' : 'bg-gray-100 dark:bg-gray-700'}`} />
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Language and Theme Switchers */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
}

/**
 * Summary Bar Component
 * Shows key data from previous screens
 */
interface SummaryBarProps {
  buildingType?: string;
  electricityKwh?: number;
  gasM3?: number;
  dhwLiters?: number;
}

export function SummaryBar({ buildingType, electricityKwh, gasM3, dhwLiters }: SummaryBarProps) {
  const { t, locale } = useTranslation();

  if (!buildingType) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3">
        <div className="flex items-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">{t('summary.buildingType')}</span>
            <span className="font-medium text-gray-900 dark:text-white">{buildingType}</span>
          </div>
          {electricityKwh !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">⚡ {t('summary.electricityOfftake')}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {electricityKwh.toLocaleString(locale)} kWh
              </span>
            </div>
          )}
          {gasM3 !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">🔥 {t('summary.gasConsumption')}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {gasM3.toLocaleString(locale)} m³
              </span>
            </div>
          )}
          {dhwLiters !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">💧 {t('summary.hotWater')}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {dhwLiters.toLocaleString(locale)} L/dag
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
