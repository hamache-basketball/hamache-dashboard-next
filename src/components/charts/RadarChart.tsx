'use client';

import React from 'react';
import { Radar } from 'react-chartjs-2';
import './ChartConfig';

interface RadarChartProps {
  ourData: number[];
  oppData: number[];
}

export default function RadarChart({ ourData, oppData }: RadarChartProps) {
  const data = {
    labels: ['eFG%', 'TO% (Rev)', 'OR%', 'FTR'],
    datasets: [
      {
        label: 'チーム',
        data: ourData,
        backgroundColor: 'rgba(247, 224, 79, 0.2)',
        borderColor: '#f7e04f',
        borderWidth: 2,
        pointBackgroundColor: '#f7e04f',
        pointBorderColor: '#fff',
      },
      {
        label: '相手',
        data: oppData,
        backgroundColor: 'rgba(181, 53, 246, 0.2)',
        borderColor: '#b535f6',
        borderWidth: 2,
        pointBackgroundColor: '#b535f6',
        pointBorderColor: '#fff',
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: 'rgba(255,255,255,0.1)' },
        grid: { color: 'rgba(255,255,255,0.1)' },
        pointLabels: { color: '#e8eaf0', font: { family: "'DM Mono', monospace", size: 11 } },
        ticks: { display: false } 
      }
    },
    plugins: {
      legend: { position: 'bottom' as const, labels: { usePointStyle: true, boxWidth: 8 } },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.label === 'TO% (Rev)') {
              label += (100 - context.raw).toFixed(1);
            } else {
              label += typeof context.raw === 'number' ? context.raw.toFixed(1) : context.raw;
            }
            return label;
          }
        }
      }
    }
  };

  return <Radar data={data} options={options} />;
}
