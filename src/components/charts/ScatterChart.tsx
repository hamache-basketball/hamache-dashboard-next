'use client';

import React from 'react';
import { Scatter } from 'react-chartjs-2';
import './ChartConfig';

interface ScatterPoint {
  x: number;
  y: number;
  r: number;
  name: string;
  pts: number;
}

interface ScatterChartProps {
  points: ScatterPoint[];
  xLabel: string;
  yLabel: string;
  color?: string;
}

export default function ScatterChart({ points, xLabel, yLabel, color = 'var(--accent)' }: ScatterChartProps) {
  const data = {
    datasets: [
      {
        label: '選手',
        data: points,
        backgroundColor: color.startsWith('#') ? color + '99' : color, 
        borderColor: color,
        borderWidth: 1,
        pointRadius: (context: any) => context.raw?.r || 4,
        pointHoverRadius: (context: any) => (context.raw?.r || 4) + 2,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: { display: true, text: xLabel, color: '#7a8099', font: { family: "'DM Mono', monospace" } },
        grid: { color: 'rgba(255,255,255,0.05)' }
      },
      y: {
        title: { display: true, text: yLabel, color: '#7a8099', font: { family: "'DM Mono', monospace" } },
        grid: { color: 'rgba(255,255,255,0.05)' }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const pt = context.raw as ScatterPoint;
            return `${pt.name} (得点: ${pt.pts})`;
          }
        }
      }
    }
  };

  return <Scatter data={data} options={options} />;
}
