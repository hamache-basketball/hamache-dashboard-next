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
        label: '浜っち',
        data: ourData,
        backgroundColor: 'rgba(79, 142, 247, 0.2)',
        borderColor: '#4f8ef7',
        borderWidth: 2,
        pointBackgroundColor: '#4f8ef7',
        pointBorderColor: '#fff',
      },
      {
        label: '相手',
        data: oppData,
        backgroundColor: 'rgba(240, 111, 111, 0.2)',
        borderColor: '#f06f6f',
        borderWidth: 2,
        pointBackgroundColor: '#f06f6f',
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
      legend: { position: 'bottom' as const, labels: { usePointStyle: true, boxWidth: 8 } }
    }
  };

  return <Radar data={data} options={options} />;
}
