// Heat Pump Models - Effenca Product Line
export const heatPumpModels = [
  {
    id: "mt20i",
    name: "Effenca MT20i",
    type: "MT",
    powerKw: 13.23,
    scop: 4.8,
    maxFlowTemp: 45,
    refrigerant: "R290",
    gwp: 3,
    lengthMm: 1200,
    widthMm: 450,
    heightMm: 1450,
    weightKg: 185,
    maxCurrentA: 18,
    connection: "400/50/3",
    priceEur: 12990,
    isEC: false,
  },
  {
    id: "mt20i-ec",
    name: "Effenca MT20i EC",
    type: "MT",
    powerKw: 13.23,
    scop: 4.8,
    maxFlowTemp: 45,
    refrigerant: "R290",
    gwp: 3,
    lengthMm: 1200,
    widthMm: 450,
    heightMm: 1450,
    weightKg: 185,
    maxCurrentA: 18,
    connection: "400/50/3",
    priceEur: 0,
    isEC: true,
    priceOnRequest: true,
  },
  {
    id: "ht20i",
    name: "Effenca HT20i",
    type: "HT",
    powerKw: 12.30,
    scop: 4.5,
    maxFlowTemp: 70,
    refrigerant: "R290",
    gwp: 3,
    lengthMm: 1200,
    widthMm: 450,
    heightMm: 1450,
    weightKg: 195,
    maxCurrentA: 20,
    connection: "400/50/3",
    priceEur: 16490,
    isEC: false,
  },
  {
    id: "ht20i-ec",
    name: "Effenca HT20i EC",
    type: "HT",
    powerKw: 12.30,
    scop: 4.5,
    maxFlowTemp: 70,
    refrigerant: "R290",
    gwp: 3,
    lengthMm: 1200,
    widthMm: 450,
    heightMm: 1450,
    weightKg: 195,
    maxCurrentA: 20,
    connection: "400/50/3",
    priceEur: 20090,
    isEC: true,
  },
  {
    id: "mt26i",
    name: "Effenca MT26i",
    type: "MT",
    powerKw: 17.50,
    scop: 4.9,
    maxFlowTemp: 45,
    refrigerant: "R290",
    gwp: 3,
    lengthMm: 1400,
    widthMm: 520,
    heightMm: 1550,
    weightKg: 220,
    maxCurrentA: 22,
    connection: "400/50/3",
    priceEur: 15490,
    isEC: false,
  },
  {
    id: "ht30i",
    name: "Effenca HT30i",
    type: "HT",
    powerKw: 15.10,
    scop: 5.17,
    maxFlowTemp: 75,
    refrigerant: "R290",
    gwp: 3,
    lengthMm: 1881,
    widthMm: 672,
    heightMm: 1806,
    weightKg: 355,
    maxCurrentA: 30,
    connection: "400/50/3",
    priceEur: 19490,
    isEC: false,
  },
  {
    id: "mt33i",
    name: "Effenca MT33i",
    type: "MT",
    powerKw: 17.90,
    scop: 5.0,
    maxFlowTemp: 45,
    refrigerant: "R290",
    gwp: 3,
    lengthMm: 1500,
    widthMm: 550,
    heightMm: 1600,
    weightKg: 245,
    maxCurrentA: 24,
    connection: "400/50/3",
    priceEur: 16990,
    isEC: false,
  },
  {
    id: "mt40i",
    name: "Effenca MT40i",
    type: "MT",
    powerKw: 20.60,
    scop: 5.1,
    maxFlowTemp: 45,
    refrigerant: "R290",
    gwp: 3,
    lengthMm: 1600,
    widthMm: 580,
    heightMm: 1650,
    weightKg: 280,
    maxCurrentA: 28,
    connection: "400/50/3",
    priceEur: 18990,
    isEC: false,
  },
  {
    id: "mt50i",
    name: "Effenca MT50i",
    type: "MT",
    powerKw: 38.00,
    scop: 5.2,
    maxFlowTemp: 45,
    refrigerant: "R290",
    gwp: 3,
    lengthMm: 1800,
    widthMm: 650,
    heightMm: 1750,
    weightKg: 320,
    maxCurrentA: 45,
    connection: "400/50/3",
    priceEur: 24990,
    isEC: false,
  },
  {
    id: "mt60i",
    name: "Effenca MT60i",
    type: "MT",
    powerKw: 43.90,
    scop: 5.15,
    maxFlowTemp: 45,
    refrigerant: "R290",
    gwp: 3,
    lengthMm: 1900,
    widthMm: 680,
    heightMm: 1800,
    weightKg: 360,
    maxCurrentA: 52,
    connection: "400/50/3",
    priceEur: 27990,
    isEC: false,
  },
  {
    id: "mt70i",
    name: "Effenca MT70i",
    type: "MT",
    powerKw: 50.00,
    scop: 5.1,
    maxFlowTemp: 45,
    refrigerant: "R290",
    gwp: 3,
    lengthMm: 2000,
    widthMm: 720,
    heightMm: 1850,
    weightKg: 400,
    maxCurrentA: 60,
    connection: "400/50/3",
    priceEur: 31990,
    isEC: false,
  },
  {
    id: "mt80i",
    name: "Effenca MT80i",
    type: "MT",
    powerKw: 56.30,
    scop: 5.0,
    maxFlowTemp: 45,
    refrigerant: "R290",
    gwp: 3,
    lengthMm: 2100,
    widthMm: 750,
    heightMm: 1900,
    weightKg: 440,
    maxCurrentA: 68,
    connection: "400/50/3",
    priceEur: 35990,
    isEC: false,
  },
] as const;

export type HeatPumpModel = typeof heatPumpModels[number];

// Building Types with conversion factors
export const buildingTypes = {
  apartment_building: {
    id: "apartment_building",
    name: "Appartementencomplex",
    gasToKwFactor: 9.769,
    hotWaterPercent: 30,
    defaultDhwLitersPerUnit: 120,
    occupancyProfile: "residential",
  },
  care_home: {
    id: "care_home",
    name: "Verzorgingshuis",
    gasToKwFactor: 9.5,
    hotWaterPercent: 35,
    defaultDhwLitersPerUnit: 100,
    occupancyProfile: "healthcare",
  },
  nursing_home: {
    id: "nursing_home",
    name: "Verpleeghuis",
    gasToKwFactor: 9.5,
    hotWaterPercent: 40,
    defaultDhwLitersPerUnit: 120,
    occupancyProfile: "healthcare",
  },
  hospital: {
    id: "hospital",
    name: "Ziekenhuis",
    gasToKwFactor: 9.3,
    hotWaterPercent: 25,
    defaultDhwLitersPerUnit: 150,
    occupancyProfile: "healthcare_24h",
  },
  hotel: {
    id: "hotel",
    name: "Hotel",
    gasToKwFactor: 9.5,
    hotWaterPercent: 45,
    defaultDhwLitersPerUnit: 150,
    occupancyProfile: "hospitality",
  },
  office: {
    id: "office",
    name: "Kantoor",
    gasToKwFactor: 9.769,
    hotWaterPercent: 10,
    defaultDhwLitersPerUnit: 10,
    occupancyProfile: "office",
  },
  school_primary: {
    id: "school_primary",
    name: "Basisschool",
    gasToKwFactor: 9.5,
    hotWaterPercent: 15,
    defaultDhwLitersPerUnit: 5,
    occupancyProfile: "school",
  },
  school_secondary: {
    id: "school_secondary",
    name: "Middelbare school",
    gasToKwFactor: 9.5,
    hotWaterPercent: 15,
    defaultDhwLitersPerUnit: 8,
    occupancyProfile: "school",
  },
  swimming_pool: {
    id: "swimming_pool",
    name: "Zwembad",
    gasToKwFactor: 9.0,
    hotWaterPercent: 60,
    defaultDhwLitersPerUnit: 500,
    occupancyProfile: "sports",
  },
  sports_facility: {
    id: "sports_facility",
    name: "Sporthal",
    gasToKwFactor: 9.3,
    hotWaterPercent: 40,
    defaultDhwLitersPerUnit: 200,
    occupancyProfile: "sports",
  },
} as const;

export type BuildingTypeId = keyof typeof buildingTypes;
export type BuildingType = typeof buildingTypes[BuildingTypeId];

// Grid Connection Options
export const gridConnectionOptions = {
  "3x25A": { id: "3x25A", name: "3x25A", maxCurrentA: 25, maxPowerKw: 17.3 },
  "3x35A": { id: "3x35A", name: "3x35A", maxCurrentA: 35, maxPowerKw: 24.2 },
  "3x40A": { id: "3x40A", name: "3x40A", maxCurrentA: 40, maxPowerKw: 27.7 },
  "3x50A": { id: "3x50A", name: "3x50A", maxCurrentA: 50, maxPowerKw: 34.6 },
  "3x63A": { id: "3x63A", name: "3x63A", maxCurrentA: 63, maxPowerKw: 43.6 },
  "3x80A": { id: "3x80A", name: "3x80A", maxCurrentA: 80, maxPowerKw: 55.4 },
  "3x100A": { id: "3x100A", name: "3x100A", maxCurrentA: 100, maxPowerKw: 69.3 },
} as const;

export type GridConnectionId = keyof typeof gridConnectionOptions;
export type GridConnection = typeof gridConnectionOptions[GridConnectionId];

// Bivalent Point Configuration
export const bivalentPointConfig = {
  "0": {
    id: "0",
    name: "Hybride 0°C",
    description: "Hybride met omschakelpunt bij ca. 0°C",
    betaFactor: 0.30,
    dekkingPercent: 40,
  },
  "-7": {
    id: "-7",
    name: "Duo -7°C",
    description: "Hybride met omschakelpunt bij -7°C",
    betaFactor: 0.70,
    dekkingPercent: 70,
  },
  "-10": {
    id: "-10",
    name: "All Electric -10°C",
    description: "Volledig elektrisch tot -10°C",
    betaFactor: 0.90,
    dekkingPercent: 95,
  },
} as const;

export type BivalentPointId = keyof typeof bivalentPointConfig;

// CO2 Emission Factors
export const emissionFactors = {
  gasKgCO2PerM3: 1.88,
  electricityKgCO2PerKwh: 0.4,
} as const;

// Energy Data Types
export interface EnergyDataPoint {
  timestamp: Date;
  feedIn: number;
  offtake: number;
  gasConsumption?: number;
}

export interface ManualEnergyData {
  buildingType: BuildingTypeId;
  apartmentSize?: string;
  numberOfUnits: number;
  isCoastalLocation: boolean;
  gridConnectionId: GridConnectionId;
  electricityFeedIn: number;
  electricityOfftake: number;
  gasConsumption: number;
  dhwLitersPerDay: number;
  occupancyWeekdayStart: number;
  occupancyWeekdayEnd: number;
  occupancyWeekendStart: number;
  occupancyWeekendEnd: number;
  gasPricePerM3: number;
  electricityPricePerKwh: number;
  feedInTariffPerKwh: number;
  terugleveringboetePerKwh: number;
  salderingEnabled: boolean;
  bivalentPointC: BivalentPointId;
}

export interface ProcessedEnergyData {
  dataPoints: EnergyDataPoint[];
  summary: {
    totalFeedIn: number;
    totalOfftake: number;
    totalGasConsumption: number;
    startDate: Date;
    endDate: Date;
    intervalMinutes: number;
  };
}

// Heat Pump Profile Types
export interface HeatPumpProfileDataPoint {
  timestamp: string;
  powerKw: number;
  heatKw?: number;
  cop?: number;
}

export interface HeatPumpProfile {
  buildingType: string;
  heatPumpCapacityKw: number;
  dataPoints: HeatPumpProfileDataPoint[];
  summary: {
    totalDataPoints: number;
    peakPowerKw: number;
    avgPowerKw: number;
    minPowerKw: number;
    startDate: string;
    endDate: string;
  };
}

// Price and Temperature Data
export interface PriceTempDataPoint {
  timestamp: Date;
  priceCtPerKwh: number;
  gasPriceEurPerM3: number;
  temperature: number;
}

export interface PriceTempData {
  hourlyData: Map<string, PriceTempDataPoint>;
  summary: {
    avgPriceCtPerKwh: number;
    minPriceCtPerKwh: number;
    maxPriceCtPerKwh: number;
    avgGasPriceEurPerM3: number;
    minGasPriceEurPerM3: number;
    maxGasPriceEurPerM3: number;
    avgTemperature: number;
    minTemperature: number;
    maxTemperature: number;
    startDate: Date;
    endDate: Date;
  };
}

// Calculation Results
export interface HPSelectorResult {
  model: HeatPumpModel;
  unitsNeeded: number;
  totalCapacityKw: number;
  totalPrice: number;
  isRecommended: boolean;
}

export interface SavingsResult {
  annualSavingsEur: number;
  savingsPercent: number;
  co2ReductionKg: number;
  paybackYears: number;
  heatDemandByHP: { kWh: number; percent: number };
  heatDemandByBoiler: { m3: number; kWh: number; percent: number };
}

export interface PeakLoadResult {
  peakPowerKw: number;
  avgPowerKw: number;
  connectionCapacityKw: number;
  exceedanceCount: number;
  exceedancePercent: number;
  minExceedanceDurationMin: number;
  maxExceedanceDurationHours: number;
  medianExceedanceDurationMin: number;
  totalExceedanceTimeHours: number;
}

export interface TemperatureCorrelation {
  minTempC: number;
  maxTempC: number;
  avgTempC: number;
}

export interface SalderingScenario {
  scenario: string;
  terugleveringKwh: number;
  gesaldeerdKwh: number;
  opbrengstEur: number;
  kostenEur: number;
  nettoEur: number;
}

export interface DynamicPricingScenario {
  scenario: string;
  afnameKwh: number;
  terugleveringKwh: number;
  vastTariefEur: number;
  dynamischEur: number;
  verschilEur: number;
}

export interface SmartSteeringResult {
  zonderSturingEur: number;
  metSturingEur: number;
  besparingEur: number;
  verschovenKwh: number;
}
