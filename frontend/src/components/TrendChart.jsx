import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '../context/ThemeContext';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="dark:bg-[#0f172a]/95 bg-white/95 dark:border-slate-700 border-slate-200 p-3 rounded-xl shadow-2xl text-xs space-y-1 backdrop-blur-md">
        <p className="font-semibold dark:text-slate-200 text-slate-800 border-b dark:border-slate-700/60 border-slate-200 pb-1 mb-1">{label}</p>
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <span className="capitalize font-medium" style={{ color: item.color }}>{item.name}:</span>
            <span className="font-bold dark:text-white text-slate-900">{item.value} / 100</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const TrendChart = ({ data = [] }) => {
  const { isDark } = useTheme();

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs">
        No assessment trends available yet. Complete your first assessment to track changes.
      </div>
    );
  }

  const gridColor = isDark ? '#1e293b' : '#e2e8f0';
  const textColor = isDark ? '#64748b' : '#94a3b8';

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorText" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="date" stroke={textColor} tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} stroke={textColor} tick={{ fontSize: 11 }} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="overall" name="Multimodal Overall" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOverall)" />
          <Area type="monotone" dataKey="text" name="Text NLP" stroke="#06b6d4" strokeWidth={1.5} fillOpacity={1} fill="url(#colorText)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;
