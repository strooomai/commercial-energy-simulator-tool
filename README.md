# Energy Simulator Tool

A React/TypeScript application for heat pump selection and peak load analysis for Dutch buildings.

## Features

### Screen 1: Energiegegevens (Energy Data)
- Manual input or file upload of energy consumption data
- Building type selection with pre-configured factors
- Tariff configuration (gas, electricity, feed-in, saldering)
- Heat demand calculation (space heating + hot water)

### Screen 2: Warmtepomp Selectie (Heat Pump Selection)
- Bivalent point configuration (Hybrid 0°C / Duo -7°C / All Electric -10°C)
- Automatic model recommendation based on required capacity
- Full Effenca product catalog with specifications
- Savings calculation (annual savings, CO2 reduction, payback period)

### Screen 3: Piekbelasting Analyse (Peak Load Analysis)
- Grid exceedance detection and statistics
- Temperature correlation at exceedances
- Hybride scenario (gas switching)
- Teruglevering analysis (with/without saldering)
- Dynamic pricing analysis (fixed vs hourly tariffs)
- Smart steering optimization

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **IBM Plex Sans** font (Carbon Design System)

## Project Structure

```
src/
├── components/
│   ├── EnergyDataPage.tsx    # Screen 1
│   ├── HeatPumpPage.tsx      # Screen 2
│   ├── PiekbelastingPage.tsx # Screen 3
│   ├── Navigation.tsx        # Header & nav
│   └── ui.tsx                # Shared components
├── lib/
│   ├── heatDemandCalculator.ts   # Component C
│   ├── hpSelectorEngine.ts       # Component D
│   ├── savingsCalculator.ts      # Component E
│   ├── profileGenerator.ts       # Component B
│   ├── peakAnalyzer.ts           # Component G
│   ├── temperatureCorrelator.ts  # Component H
│   ├── salderingCalculator.ts    # Component I
│   ├── dynamicPricingEngine.ts   # Component J
│   ├── smartSteeringEngine.ts    # Component K
│   └── syntheticProfileGenerator.ts # Component L
├── types/
│   └── schema.ts             # Types & constants
├── App.tsx                   # Main app
├── main.tsx                  # Entry point
└── index.css                 # Tailwind styles
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Data Requirements

The tool uses:
- **Effenca heat pump catalog** (hardcoded in schema.ts)
- **Building type factors** (gas-to-kWh conversion, hot water %)
- **Grid connection limits** (17.3 kW to 69.3 kW)
- **Historical price/temperature data** (simulated for demo)

## Notes

- All calculations run client-side (prototype phase)
- Chart visualization placeholder included (implement with Chart.js or Recharts)
- File upload parsing not yet implemented (shows dropzone UI)

## License

Internal use only - Effenca BV
