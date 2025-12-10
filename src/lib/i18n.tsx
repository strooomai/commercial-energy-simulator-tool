/**
 * Internationalization (i18n) and Theme System
 * Supports Dutch (nl) and English (en)
 * Supports light and dark themes
 */

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export type Language = 'nl' | 'en';
export type Theme = 'light' | 'dark';

export const translations = {
  // Navigation
  'nav.energyData': { nl: 'Energiedata', en: 'Energy Data' },
  'nav.heatPump': { nl: 'Warmtepomp', en: 'Heat Pump' },
  'nav.peakLoad': { nl: 'Piekbelasting', en: 'Peak Load' },

  // Summary Bar
  'summary.buildingType': { nl: 'Gebouwtype', en: 'Building Type' },
  'summary.electricityOfftake': { nl: 'Elektriciteit afname', en: 'Electricity Consumption' },
  'summary.gasConsumption': { nl: 'Gasverbruik', en: 'Gas Consumption' },
  'summary.hotWater': { nl: 'Warm tapwater', en: 'Hot Water' },

  // Energy Data Page
  'energy.title': { nl: 'Energiegegevens', en: 'Energy Data' },
  'energy.subtitle': { nl: 'Voer de energiegegevens van het gebouw in of upload slimme meter data', en: 'Enter building energy data or upload smart meter data' },
  'energy.manualInput': { nl: 'Handmatig invoeren', en: 'Manual Input' },
  'energy.fileUpload': { nl: 'Bestand uploaden', en: 'Upload File' },

  // Building Information
  'building.info': { nl: 'Gebouw informatie', en: 'Building Information' },
  'building.type': { nl: 'Gebouwtype', en: 'Building Type' },
  'building.units': { nl: 'Aantal eenheden', en: 'Number of Units' },
  'building.unitsHelper': { nl: 'Bijv. aantal appartementen, kamers, etc.', en: 'E.g. number of apartments, rooms, etc.' },
  'building.gridConnection': { nl: 'Netaansluiting', en: 'Grid Connection' },
  'building.coastalLocation': { nl: 'Kustlocatie / industriële omgeving (EC coating vereist)', en: 'Coastal / industrial location (EC coating required)' },

  // Energy Consumption
  'consumption.title': { nl: 'Energieverbruik (jaarlijks)', en: 'Energy Consumption (yearly)' },
  'consumption.electricityOfftake': { nl: 'Elektriciteit afname', en: 'Electricity Consumption' },
  'consumption.electricityFeedIn': { nl: 'Elektriciteit teruglevering', en: 'Electricity Feed-in' },
  'consumption.feedInHelper': { nl: 'Zonne-energie teruglevering', en: 'Solar energy feed-in' },
  'consumption.gas': { nl: 'Gasverbruik', en: 'Gas Consumption' },

  // Hot Water
  'hotWater.title': { nl: 'Warm tapwater', en: 'Domestic Hot Water' },
  'hotWater.consumption': { nl: 'Warm tapwater verbruik', en: 'Hot water consumption' },
  'hotWater.consumptionHelper': { nl: 'Automatisch berekend op basis van gebouwtype', en: 'Automatically calculated based on building type' },
  'hotWater.bivalentPoint': { nl: 'Bivalentiepunt', en: 'Bivalent Point' },
  'hotWater.bivalentHelper': { nl: 'Temperatuur waarbij gasketel bijschakelt', en: 'Temperature at which gas boiler activates' },

  // Energy Prices
  'prices.title': { nl: 'Energietarieven', en: 'Energy Prices' },
  'prices.gas': { nl: 'Gasprijs', en: 'Gas Price' },
  'prices.electricity': { nl: 'Elektriciteitsprijs', en: 'Electricity Price' },
  'prices.feedInTariff': { nl: 'Terugleververgoeding (na saldering)', en: 'Feed-in Tariff (after net metering)' },
  'prices.feedInPenalty': { nl: 'Terugleverkosten (boete)', en: 'Feed-in Costs (penalty)' },
  'prices.feedInPenaltyHelper': { nl: 'Bijv. Eneco transportkosten', en: 'E.g. Eneco transport costs' },
  'prices.netMetering': { nl: 'Saldering ingeschakeld (tot 2027)', en: 'Net metering enabled (until 2027)' },

  // Occupancy Hours
  'occupancy.title': { nl: 'Bezettingsuren', en: 'Occupancy Hours' },
  'occupancy.subtitle': { nl: 'Voor warmtevraag planning', en: 'For heat demand planning' },
  'occupancy.weekdayStart': { nl: 'Doordeweeks start', en: 'Weekday Start' },
  'occupancy.weekdayEnd': { nl: 'Doordeweeks eind', en: 'Weekday End' },
  'occupancy.weekendStart': { nl: 'Weekend start', en: 'Weekend Start' },
  'occupancy.weekendEnd': { nl: 'Weekend eind', en: 'Weekend End' },

  // File Upload
  'upload.title': { nl: 'Bestand uploaden', en: 'Upload File' },
  'upload.dropzone': { nl: 'Sleep een CSV of Excel bestand hierheen, of', en: 'Drop a CSV or Excel file here, or' },
  'upload.browse': { nl: 'klik om te bladeren', en: 'click to browse' },
  'upload.supported': { nl: 'Ondersteund: 15-minuten elektriciteitsdata, uurlijkse gasdata', en: 'Supported: 15-minute electricity data, hourly gas data' },

  // Buttons and Actions
  'action.calculate': { nl: 'Berekenen', en: 'Calculate' },
  'action.continue': { nl: 'Doorgaan', en: 'Continue' },
  'action.back': { nl: 'Terug', en: 'Back' },
  'action.continueToHeatPump': { nl: 'Doorgaan naar Warmtepomp Selectie', en: 'Continue to Heat Pump Selection' },
  'action.continueToPeakLoad': { nl: 'Doorgaan naar Piekbelasting Analyse', en: 'Continue to Peak Load Analysis' },
  'action.backToEnergyData': { nl: 'Terug naar Energiegegevens', en: 'Back to Energy Data' },

  // Results - Heat Demand
  'results.heatDemand': { nl: 'Warmtevraag Berekening', en: 'Heat Demand Calculation' },
  'results.totalHeatDemand': { nl: 'Totale warmtevraag', en: 'Total Heat Demand' },
  'results.spaceHeating': { nl: 'Ruimteverwarming', en: 'Space Heating' },
  'results.dhw': { nl: 'Warm tapwater', en: 'Domestic Hot Water' },
  'results.requiredPower': { nl: 'Benodigd vermogen', en: 'Required Capacity' },
  'results.fullLoadHours': { nl: 'Op basis van 1800 vollasturen', en: 'Based on 1800 full load hours' },

  // Current Energy Costs
  'costs.current': { nl: 'Huidige Energiekosten', en: 'Current Energy Costs' },
  'costs.gas': { nl: 'Gaskosten', en: 'Gas Costs' },
  'costs.electricity': { nl: 'Elektriciteitskosten', en: 'Electricity Costs' },
  'costs.total': { nl: 'Totaal', en: 'Total' },

  // Alerts
  'alert.fillData': { nl: 'Vul de gegevens in', en: 'Fill in the data' },
  'alert.fillDataDesc': { nl: 'Vul de energiegegevens in en klik op "Berekenen" om de warmtevraag te bepalen.', en: 'Fill in the energy data and click "Calculate" to determine heat demand.' },
  'alert.selectModel': { nl: 'Selecteer een model', en: 'Select a model' },
  'alert.selectModelDesc': { nl: 'Klik op een model in de tabel om de besparingen te berekenen.', en: 'Click on a model in the table to calculate savings.' },

  // Heat Pump Page
  'hp.title': { nl: 'Warmtepomp Selectie', en: 'Heat Pump Selection' },
  'hp.subtitle': { nl: 'Selecteer het juiste warmtepompmodel voor uw gebouw', en: 'Select the right heat pump model for your building' },
  'hp.bivalentConfig': { nl: 'Bivalentiepunt configuratie', en: 'Bivalent Point Configuration' },
  'hp.coverage': { nl: 'dekking', en: 'coverage' },
  'hp.requiredPower': { nl: 'Benodigd vermogen', en: 'Required Capacity' },
  'hp.hpCoverage': { nl: 'WP Dekking', en: 'HP Coverage' },
  'hp.annualHeatDemand': { nl: 'van jaarlijkse warmtevraag', en: 'of annual heat demand' },
  'hp.totalHeatDemand': { nl: 'Warmtevraag totaal', en: 'Total Heat Demand' },
  'hp.peakPower': { nl: 'Piek vermogen', en: 'Peak Power' },
  'hp.fullCoverage': { nl: '100% dekking', en: '100% coverage' },
  'hp.availableModels': { nl: 'Beschikbare modellen', en: 'Available Models' },
  'hp.clickToSelect': { nl: 'Klik op een model om te selecteren', en: 'Click on a model to select' },
  'hp.selected': { nl: 'Geselecteerd', en: 'Selected' },
  'hp.recommended': { nl: 'Aanbevolen', en: 'Recommended' },

  // Model Details
  'model.power': { nl: 'Vermogen', en: 'Capacity' },
  'model.units': { nl: 'Eenheden', en: 'Units' },
  'model.totalCapacity': { nl: 'Totaal Cap.', en: 'Total Cap.' },
  'model.pricePerUnit': { nl: 'Prijs/stuk', en: 'Price/unit' },
  'model.totalPrice': { nl: 'Totaalprijs', en: 'Total Price' },
  'model.onRequest': { nl: 'Op aanvraag', en: 'On request' },
  'model.type': { nl: 'Type', en: 'Type' },
  'model.maxFlowTemp': { nl: 'Max. aanvoertemp', en: 'Max. Flow Temp' },
  'model.refrigerant': { nl: 'Koudemiddel', en: 'Refrigerant' },
  'model.connection': { nl: 'Aansluiting', en: 'Connection' },
  'model.dimensions': { nl: 'Afmetingen (L×B×H)', en: 'Dimensions (L×W×H)' },
  'model.weight': { nl: 'Gewicht', en: 'Weight' },
  'model.maxCurrent': { nl: 'Max. stroom', en: 'Max. Current' },
  'model.ecCoating': { nl: 'EC coating', en: 'EC Coating' },
  'model.yes': { nl: 'Ja', en: 'Yes' },
  'model.no': { nl: 'Nee', en: 'No' },
  'model.adjustUnits': { nl: 'Aantal eenheden (aanpassen indien nodig)', en: 'Number of units (adjust if needed)' },
  'model.totalLabel': { nl: 'Totaal', en: 'Total' },
  'model.belowRequired': { nl: 'onder benodigd vermogen!', en: 'below required capacity!' },

  // Savings
  'savings.overview': { nl: 'Besparingsoverzicht', en: 'Savings Overview' },
  'savings.annual': { nl: 'Jaarlijkse besparing', en: 'Annual Savings' },
  'savings.onCurrentCosts': { nl: 'op huidige kosten', en: 'on current costs' },
  'savings.co2Reduction': { nl: 'CO₂ reductie', en: 'CO₂ Reduction' },
  'savings.payback': { nl: 'Terugverdientijd', en: 'Payback Period' },
  'savings.notApplicable': { nl: 'N.v.t.', en: 'N/A' },
  'savings.year': { nl: 'jaar', en: 'year' },
  'savings.years': { nl: 'jaar', en: 'years' },

  // Heat Distribution
  'heat.distribution': { nl: 'Warmteverdeling', en: 'Heat Distribution' },
  'heat.byHeatPump': { nl: 'Warmtepomp', en: 'Heat Pump' },
  'heat.byHP': { nl: 'Door WP', en: 'By HP' },
  'heat.byBoiler': { nl: 'Door ketel', en: 'By Boiler' },

  // Investment
  'investment.title': { nl: 'Investering', en: 'Investment' },
  'investment.total': { nl: 'Totaal investering', en: 'Total Investment' },

  // Peak Load Page
  'peak.title': { nl: 'Piekbelasting Analyse', en: 'Peak Load Analysis' },
  'peak.subtitle': { nl: 'Vermogenspieken ten opzichte van uw netaansluiting', en: 'Power peaks relative to your grid connection' },
  'peak.connection': { nl: 'Aansluiting', en: 'Connection' },
  'peak.peakPower': { nl: 'Piekvermogen (Gebouw + WP)', en: 'Peak Power (Building + HP)' },
  'peak.avgPower': { nl: 'Gemiddeld vermogen', en: 'Average Power' },
  'peak.connectionCapacity': { nl: 'Aansluiting capaciteit', en: 'Connection Capacity' },
  'peak.exceedances': { nl: 'Overschrijdingen', en: 'Exceedances' },

  // Exceedance Alert
  'peak.exceedanceAlert': { nl: 'Capaciteitsoverschrijding gedetecteerd', en: 'Capacity Exceedance Detected' },
  'peak.exceedanceDesc': { nl: 'De piekbelasting overschrijdt de netaansluiting', en: 'Peak load exceeds grid connection' },
  'peak.times': { nl: 'keer', en: 'times' },
  'peak.aboveLimit': { nl: 'boven de limiet', en: 'above the limit' },

  // Exceedance Statistics
  'stats.title': { nl: 'Overschrijdingsstatistieken', en: 'Exceedance Statistics' },
  'stats.statistic': { nl: 'Statistiek', en: 'Statistic' },
  'stats.value': { nl: 'Waarde', en: 'Value' },
  'stats.interval': { nl: 'Meetinterval', en: 'Measurement Interval' },
  'stats.minutes': { nl: 'minuten', en: 'minutes' },
  'stats.minDuration': { nl: 'Minimale overschrijdingsduur', en: 'Minimum Exceedance Duration' },
  'stats.maxDuration': { nl: 'Maximale overschrijdingsduur', en: 'Maximum Exceedance Duration' },
  'stats.totalTime': { nl: 'Totale overschrijdingstijd', en: 'Total Exceedance Time' },
  'stats.hour': { nl: 'uur', en: 'hour' },
  'stats.hours': { nl: 'uur', en: 'hours' },

  // Temperature Correlation
  'temp.atExceedances': { nl: 'Temperatuur bij overschrijdingen', en: 'Temperature at Exceedances' },
  'temp.min': { nl: 'Min', en: 'Min' },
  'temp.max': { nl: 'Max', en: 'Max' },
  'temp.avg': { nl: 'Gem', en: 'Avg' },

  // Hybrid Scenario
  'hybrid.title': { nl: 'Hybride Piekbelasting Scenario', en: 'Hybrid Peak Load Scenario' },
  'hybrid.desc': { nl: 'Gasketel inschakelen i.p.v. warmtepomp tijdens piekbelasting + hoge buitentemp', en: 'Switch to gas boiler instead of heat pump during peak load + high outdoor temp' },
  'hybrid.condition': { nl: 'Netoverschrijding + temp boven 0°C → gasketel', en: 'Grid exceedance + temp above 0°C → gas boiler' },
  'hybrid.hours': { nl: 'Hybride uren', en: 'Hybrid Hours' },
  'hybrid.extraGas': { nl: 'Extra gas', en: 'Extra Gas' },
  'hybrid.savedElec': { nl: 'Bespaard elec', en: 'Saved Elec' },
  'hybrid.additionalCost': { nl: 'Meerkosten', en: 'Additional Cost' },
  'hybrid.notNeeded': { nl: 'Geen hybride uren nodig', en: 'No hybrid hours needed' },
  'hybrid.notNeededDesc': { nl: 'Geen overschrijdingen bij temp boven drempel', en: 'No exceedances at temp above threshold' },

  // Feed-in Analysis
  'feedIn.title': { nl: 'Teruglevering Analyse', en: 'Feed-in Analysis' },
  'feedIn.withNetMetering': { nl: 'Met Saldering', en: 'With Net Metering' },
  'feedIn.withoutNetMetering': { nl: 'Zonder', en: 'Without' },
  'feedIn.scenario': { nl: 'Scenario', en: 'Scenario' },
  'feedIn.feedIn': { nl: 'Teruglevering', en: 'Feed-in' },
  'feedIn.revenue': { nl: 'Opbrengst', en: 'Revenue' },
  'feedIn.costs': { nl: 'Kosten', en: 'Costs' },
  'feedIn.net': { nl: 'Netto', en: 'Net' },
  'feedIn.withoutHP': { nl: 'Zonder WP', en: 'Without HP' },
  'feedIn.withHP': { nl: 'Met WP', en: 'With HP' },
  'feedIn.selfConsumption': { nl: 'Warmtepomp eigen verbruik', en: 'Heat Pump Self-consumption' },
  'feedIn.totalHP': { nl: 'Totaal WP', en: 'Total HP' },
  'feedIn.selfConsumptionLabel': { nl: 'Eigen verbruik', en: 'Self-consumption' },
  'feedIn.savings': { nl: 'besparing', en: 'savings' },

  // Dynamic Pricing
  'dynamic.title': { nl: 'Dynamisch Tarief Analyse', en: 'Dynamic Pricing Analysis' },
  'dynamic.fixedRate': { nl: 'Vast tarief', en: 'Fixed Rate' },
  'dynamic.dynamic': { nl: 'Dynamisch', en: 'Dynamic' },
  'dynamic.difference': { nl: 'Verschil', en: 'Difference' },
  'dynamic.priceRange': { nl: 'Prijsbereik', en: 'Price Range' },
  'dynamic.avg': { nl: 'gem.', en: 'avg.' },

  // Smart Steering
  'steering.title': { nl: 'Smart Steering Analyse', en: 'Smart Steering Analysis' },
  'steering.desc': { nl: 'Tot 70% verbruik verschuiven van dure naar goedkope uren', en: 'Shift up to 70% consumption from expensive to cheap hours' },
  'steering.withoutSteering': { nl: 'Zonder Sturing', en: 'Without Steering' },
  'steering.withSteering': { nl: 'Met Sturing', en: 'With Steering' },
  'steering.savings': { nl: 'Besparing', en: 'Savings' },
  'steering.shifted': { nl: 'verschoven', en: 'shifted' },

  // Chart Settings
  'chart.settings': { nl: 'Grafiek instellingen', en: 'Chart Settings' },
  'chart.timePeriod': { nl: 'Tijdsperiode', en: 'Time Period' },
  'chart.day': { nl: 'Dag', en: 'Day' },
  'chart.week': { nl: 'Week', en: 'Week' },
  'chart.month': { nl: 'Maand', en: 'Month' },
  'chart.year': { nl: 'Jaar', en: 'Year' },
  'chart.building': { nl: 'Gebouw', en: 'Building' },
  'chart.hpUnsteered': { nl: 'WP Ongestuurd', en: 'HP Unsteered' },
  'chart.total': { nl: 'Totaal', en: 'Total' },
  'chart.price': { nl: 'Prijs', en: 'Price' },
  'chart.temperature': { nl: 'Temperatuur', en: 'Temperature' },
  'chart.placeholder': { nl: 'Tijdreeks grafiek', en: 'Time Series Chart' },

  // Profile Info
  'profile.standard': { nl: 'Standaard profiel', en: 'Standard Profile' },
  'profile.basedOn': { nl: 'Gebaseerd op Liander profiel, geschaald naar', en: 'Based on Liander profile, scaled to' },

  // Building Types
  'buildingType.apartment_building': { nl: 'Appartementencomplex', en: 'Apartment Building' },
  'buildingType.care_home': { nl: 'Verzorgingshuis', en: 'Care Home' },
  'buildingType.nursing_home': { nl: 'Verpleeghuis', en: 'Nursing Home' },
  'buildingType.hospital': { nl: 'Ziekenhuis', en: 'Hospital' },
  'buildingType.hotel': { nl: 'Hotel', en: 'Hotel' },
  'buildingType.office': { nl: 'Kantoor', en: 'Office' },
  'buildingType.school_primary': { nl: 'Basisschool', en: 'Primary School' },
  'buildingType.school_secondary': { nl: 'Middelbare school', en: 'Secondary School' },
  'buildingType.swimming_pool': { nl: 'Zwembad', en: 'Swimming Pool' },
  'buildingType.sports_facility': { nl: 'Sporthal', en: 'Sports Facility' },

  // Bivalent Points
  'bivalent.hybrid0': { nl: 'Hybride 0°C', en: 'Hybrid 0°C' },
  'bivalent.hybrid0Desc': { nl: 'Hybride met omschakelpunt bij ca. 0°C', en: 'Hybrid with switchover point at approx. 0°C' },
  'bivalent.duo7': { nl: 'Duo -7°C', en: 'Duo -7°C' },
  'bivalent.duo7Desc': { nl: 'Hybride met omschakelpunt bij -7°C', en: 'Hybrid with switchover point at -7°C' },
  'bivalent.allElectric': { nl: 'All Electric -10°C', en: 'All Electric -10°C' },
  'bivalent.allElectricDesc': { nl: 'Volledig elektrisch tot -10°C', en: 'Fully electric down to -10°C' },
} as const;

export type TranslationKey = keyof typeof translations;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  locale: string;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
  defaultTheme?: Theme;
}

export function LanguageProvider({ children, defaultLanguage = 'nl', defaultTheme = 'light' }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(() => {
    // Try to get from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('language') as Language | null;
      if (stored === 'nl' || stored === 'en') return stored;
    }
    return defaultLanguage;
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    // Try to get from localStorage or system preference
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme') as Theme | null;
      if (stored === 'light' || stored === 'dark') return stored;
      // Check system preference
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return defaultTheme;
  });

  // Apply theme class to document
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  const handleSetLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  const t = useCallback((key: TranslationKey): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
    return translation[language];
  }, [language]);

  const locale = language === 'nl' ? 'nl-NL' : 'en-US';

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, locale, theme, setTheme, toggleTheme }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}

// Helper function to get building type name with translation
export function getBuildingTypeName(buildingTypeId: string, language: Language): string {
  const key = `buildingType.${buildingTypeId}` as TranslationKey;
  const translation = translations[key];
  return translation ? translation[language] : buildingTypeId;
}

// Helper function to get bivalent point name with translation
export function getBivalentPointName(bivalentId: string, language: Language): string {
  const nameMap: Record<string, TranslationKey> = {
    '0': 'bivalent.hybrid0',
    '-7': 'bivalent.duo7',
    '-10': 'bivalent.allElectric',
  };
  const key = nameMap[bivalentId];
  if (!key) return bivalentId;
  const translation = translations[key];
  return translation ? translation[language] : bivalentId;
}

// Helper function to get bivalent point description with translation
export function getBivalentPointDesc(bivalentId: string, language: Language): string {
  const descMap: Record<string, TranslationKey> = {
    '0': 'bivalent.hybrid0Desc',
    '-7': 'bivalent.duo7Desc',
    '-10': 'bivalent.allElectricDesc',
  };
  const key = descMap[bivalentId];
  if (!key) return '';
  const translation = translations[key];
  return translation ? translation[language] : '';
}

// Language Switcher Component
export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-full p-1">
      <button
        onClick={() => setLanguage('nl')}
        className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
          language === 'nl'
            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        NL
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
          language === 'en'
            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
        }`}
      >
        EN
      </button>
    </div>
  );
}

// Theme Switcher Component
export function ThemeSwitcher() {
  const { theme, toggleTheme } = useTranslation();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? (
        // Moon icon for light mode (click to switch to dark)
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      ) : (
        // Sun icon for dark mode (click to switch to light)
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </button>
  );
}
