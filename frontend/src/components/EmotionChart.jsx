import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTheme } from '../context/ThemeContext';

const EMOTION_COLORS = {
  Neutral: '#6366f1',
  Positive: '#10b981',
  Calm: '#06b6d4',
  Happy: '#3b82f6',
  Sadness: '#8b5cf6',
  Sad: '#8b5cf6',
  Anger: '#f43f5e',
  Anxiety: '#f59e0b',
  Stress: '#ec4899',
  'Elevated Distress': '#e11d48'
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="dark:bg-[#0f172a] bg-white border dark:border-slate-700 border-slate-200 p-2.5 rounded-xl shadow-xl text-xs">
        <p className="font-semibold dark:text-white text-slate-800">{data.name}</p>
        <p className="dark:text-slate-300 text-slate-600">Count / Occurrences: <span className="font-bold text-indigo-500">{data.value}</span></p>
      </div>
    );
  }
  return null;
};

const EmotionChart = ({ data = {} }) => {
  const { isDark } = useTheme();

  const chartData = Object.keys(data).map((key) => ({
    name: key,
    value: data[key],
  }));

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs">
        No emotion distribution data recorded yet.
      </div>
    );
  }

  const strokeColor = isDark ? '#07090e' : '#ffffff';

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={EMOTION_COLORS[entry.name] || '#94a3b8'} stroke={strokeColor} strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-xs dark:text-slate-300 text-slate-600 font-medium">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EmotionChart;
