/**
 * LoadChart Component
 * Visualizes combined load, HP profile, and grid connection limit
 */

import React, { useMemo } from 'react';
import { CombinedLoadPoint } from '../lib/peakAnalyzer';

interface LoadChartProps {
  combinedLoad: CombinedLoadPoint[];
  connectionLimitKw: number;
  showBuilding?: boolean;
  showHP?: boolean;
  showSteered?: boolean;
  height?: number;
}

export function LoadChart({
  combinedLoad,
  connectionLimitKw,
  showBuilding = true,
  showHP = true,
  showSteered = false,
  height = 300,
}: LoadChartProps) {
  // Aggregate data for display (show daily averages for year view)
  const chartData = useMemo(() => {
    if (combinedLoad.length === 0) return [];
    
    // Group by day and calculate averages
    const dailyData = new Map<string, {
      date: Date;
      buildingKw: number[];
      hpKw: number[];
      combinedKw: number[];
      count: number;
    }>();
    
    combinedLoad.forEach(point => {
      const date = new Date(point.timestamp);
      const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      
      if (!dailyData.has(dayKey)) {
        dailyData.set(dayKey, {
          date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          buildingKw: [],
          hpKw: [],
          combinedKw: [],
          count: 0,
        });
      }
      
      const day = dailyData.get(dayKey)!;
      day.buildingKw.push(point.buildingLoadKw);
      day.hpKw.push(point.hpLoadKw);
      day.combinedKw.push(point.combinedLoadKw);
      day.count++;
    });
    
    // Convert to array with max values (for peak visualization)
    return Array.from(dailyData.values()).map(day => ({
      date: day.date,
      buildingPeakKw: Math.max(...day.buildingKw),
      hpPeakKw: Math.max(...day.hpKw),
      combinedPeakKw: Math.max(...day.combinedKw),
      buildingAvgKw: day.buildingKw.reduce((a, b) => a + b, 0) / day.count,
      hpAvgKw: day.hpKw.reduce((a, b) => a + b, 0) / day.count,
      combinedAvgKw: day.combinedKw.reduce((a, b) => a + b, 0) / day.count,
    }));
  }, [combinedLoad]);

  // Calculate max value for scaling
  const maxKw = useMemo(() => {
    if (chartData.length === 0) return connectionLimitKw * 1.5;
    const maxCombined = Math.max(...chartData.map(d => d.combinedPeakKw));
    return Math.max(maxCombined, connectionLimitKw) * 1.1;
  }, [chartData, connectionLimitKw]);

  // Y-axis labels
  const yLabels = useMemo(() => {
    const step = Math.ceil(maxKw / 4 / 7) * 7; // Round to nearest 7
    return [0, step, step * 2, step * 3, Math.ceil(maxKw / 7) * 7].reverse();
  }, [maxKw]);

  if (chartData.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 rounded-lg"
        style={{ height }}
      >
        <p className="text-gray-500">Geen data beschikbaar</p>
      </div>
    );
  }

  const chartWidth = 800;
  const chartHeight = height - 40;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  // Scale functions
  const xScale = (index: number) => paddingLeft + (index / (chartData.length - 1)) * plotWidth;
  const yScale = (value: number) => paddingTop + plotHeight - (value / maxKw) * plotHeight;

  // Generate path for area/line
  const generatePath = (values: number[], closed: boolean = false) => {
    if (values.length === 0) return '';
    
    const points = values.map((v, i) => `${xScale(i)},${yScale(v)}`);
    const path = `M ${points.join(' L ')}`;
    
    if (closed) {
      return `${path} L ${xScale(values.length - 1)},${yScale(0)} L ${xScale(0)},${yScale(0)} Z`;
    }
    return path;
  };

  // Connection limit line y-position
  const limitY = yScale(connectionLimitKw);

  return (
    <div className="relative overflow-hidden">
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        className="w-full"
        style={{ height }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background grid */}
        {yLabels.map((label, i) => {
          const y = yScale(label);
          return (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 8}
                y={y + 4}
                textAnchor="end"
                className="text-xs fill-gray-500"
              >
                {label} kW
              </text>
            </g>
          );
        })}

        {/* Connection limit line */}
        <line
          x1={paddingLeft}
          y1={limitY}
          x2={chartWidth - paddingRight}
          y2={limitY}
          stroke="#ef4444"
          strokeWidth="2"
          strokeDasharray="8,4"
        />
        <text
          x={chartWidth - paddingRight + 5}
          y={limitY + 4}
          className="text-xs fill-red-500 font-medium"
        >
          Max {connectionLimitKw} kW
        </text>

        {/* Building load area (gray) */}
        {showBuilding && (
          <path
            d={generatePath(chartData.map(d => d.buildingPeakKw), true)}
            fill="rgba(156, 163, 175, 0.3)"
            stroke="rgba(156, 163, 175, 0.8)"
            strokeWidth="1"
          />
        )}

        {/* HP load area (stacked on top of building) */}
        {showHP && (
          <path
            d={generatePath(chartData.map(d => d.combinedPeakKw), true)}
            fill="rgba(239, 68, 68, 0.2)"
            stroke="rgba(239, 68, 68, 0.8)"
            strokeWidth="1.5"
          />
        )}

        {/* Combined peak line */}
        <path
          d={generatePath(chartData.map(d => d.combinedPeakKw))}
          fill="none"
          stroke="#ef4444"
          strokeWidth="2"
        />

        {/* X-axis labels (months) */}
        {['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'].map((month, i) => {
          const x = paddingLeft + (i / 11) * plotWidth;
          return (
            <text
              key={month}
              x={x}
              y={chartHeight - 8}
              textAnchor="middle"
              className="text-xs fill-gray-500"
            >
              {month}
            </text>
          );
        })}

        {/* Temperature axis on right (if showing) */}
        <g>
          {[-10, 0, 10, 20, 30].map(temp => {
            // Map temperature to y position (right axis)
            const tempY = paddingTop + plotHeight - ((temp + 10) / 45) * plotHeight;
            return (
              <text
                key={temp}
                x={chartWidth - 5}
                y={tempY + 4}
                textAnchor="end"
                className="text-xs fill-blue-400"
              >
                {temp}°C
              </text>
            );
          })}
        </g>
      </svg>

      {/* Hover tooltip would go here */}
    </div>
  );
}

/**
 * Mini sparkline chart for stat cards
 */
interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}

export function Sparkline({ 
  data, 
  color = '#10b981', 
  height = 40, 
  width = 100 
}: SparklineProps) {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
