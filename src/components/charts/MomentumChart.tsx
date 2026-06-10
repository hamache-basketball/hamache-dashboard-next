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
        fill: true,
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(240, 111, 111, 0.3)'); 
          gradient.addColorStop(0.5, 'rgba(122, 128, 153, 0)'); 
          gradient.addColorStop(1, 'rgba(56, 217, 169, 0.3)'); 
          return gradient;
        },
        borderColor: (context: any) => {
          // 最後の値などで色を変える場合は工夫が必要ですが、今回は固定色かグラデーションで対応
          return '#4f8ef7';
        },
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#4f8ef7',
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
