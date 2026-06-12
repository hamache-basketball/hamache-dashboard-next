'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';
import './ChartConfig';

interface MomentumChartProps {
  labels: string[];
  dataDiff: number[];
}

export default function MomentumChart({ labels, dataDiff }: MomentumChartProps) {
  const data = {
    labels,
    datasets: [
      {
        label: '累積得失点差',
        data: dataDiff,
        fill: 'origin',
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const {ctx, chartArea, scales} = chart;
          if (!chartArea) return null;
          
          const yZero = scales.y.getPixelForValue(0);
          const chartHeight = chartArea.bottom - chartArea.top;
          
          let zeroRatio = (chartArea.bottom - yZero) / chartHeight;
          zeroRatio = Math.max(0, Math.min(1, zeroRatio));
          
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          
          if (zeroRatio <= 0) {
            gradient.addColorStop(0, 'rgba(247, 224, 79, 0.05)');
            gradient.addColorStop(1, 'rgba(247, 224, 79, 0.5)');
            return gradient;
          }
          if (zeroRatio >= 1) {
            gradient.addColorStop(0, 'rgba(181, 53, 246, 0.5)');
            gradient.addColorStop(1, 'rgba(181, 53, 246, 0.05)');
            return gradient;
          }

          gradient.addColorStop(0, 'rgba(181, 53, 246, 0.5)');
          gradient.addColorStop(zeroRatio, 'rgba(181, 53, 246, 0.05)');
          gradient.addColorStop(zeroRatio, 'rgba(247, 224, 79, 0.05)');
          gradient.addColorStop(1, 'rgba(247, 224, 79, 0.5)');
          
          return gradient;
        },
        borderColor: (context: any) => {
          const chart = context.chart;
          const {ctx, chartArea, scales} = chart;
          if (!chartArea) return null;
          
          const yZero = scales.y.getPixelForValue(0);
          const chartHeight = chartArea.bottom - chartArea.top;
          
          let zeroRatio = (chartArea.bottom - yZero) / chartHeight;
          zeroRatio = Math.max(0, Math.min(1, zeroRatio));
          
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          
          if (zeroRatio <= 0) return 'rgba(247, 224, 79, 1)';
          if (zeroRatio >= 1) return 'rgba(181, 53, 246, 1)';

          gradient.addColorStop(0, 'rgba(181, 53, 246, 1)');
          gradient.addColorStop(zeroRatio, 'rgba(181, 53, 246, 1)');
          gradient.addColorStop(zeroRatio, 'rgba(247, 224, 79, 1)');
          gradient.addColorStop(1, 'rgba(247, 224, 79, 1)');
          
          return gradient;
        },
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: (context: any) => {
          const val = context.raw;
          return val < 0 ? 'rgba(181, 53, 246, 1)' : 'rgba(247, 224, 79, 1)';
        },
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' } }
    },
    plugins: {
      legend: { display: false }
    }
  };

  return <Line data={data} options={options} />;
}
