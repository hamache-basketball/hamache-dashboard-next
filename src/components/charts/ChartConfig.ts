'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
  LineController,
  BarController,
  ScatterController,
  RadarController
} from 'chart.js';

// Chart.jsのコンポーネントをグローバル登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale,
  LineController,
  BarController,
  ScatterController,
  RadarController
);

// グローバルなデフォルト設定（ダークテーマに合わせる）
ChartJS.defaults.color = '#7a8099';
ChartJS.defaults.font.family = "'Noto Sans JP', sans-serif";
ChartJS.defaults.plugins.tooltip.backgroundColor = 'rgba(24, 28, 39, 0.9)';
ChartJS.defaults.plugins.tooltip.titleColor = '#e8eaf0';
ChartJS.defaults.plugins.tooltip.bodyColor = '#e8eaf0';
ChartJS.defaults.plugins.tooltip.borderColor = 'rgba(255,255,255,0.08)';
ChartJS.defaults.plugins.tooltip.borderWidth = 1;
ChartJS.defaults.plugins.tooltip.padding = 10;
ChartJS.defaults.plugins.tooltip.displayColors = true;
ChartJS.defaults.plugins.tooltip.cornerRadius = 8;
