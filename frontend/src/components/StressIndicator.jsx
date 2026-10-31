import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

const StressIndicator = ({ score = 0, category = 'LOW', isCrisis = false }) => {
  const getCategoryConfig = () => {
    if (isCrisis || category === 'ELEVATED' || score > 65) {
      return {
        label: 'ELEVATED',
        color: 'text-rose-600 dark:text-rose-400',
        bgColor: 'bg-rose-500/15',
        borderColor: 'border-rose-500/25',
        strokeColor: '#f43f5e',
        icon: AlertTriangle,
        desc: 'Elevated stress-associated linguistic & acoustic patterns detected.'
      };
    }
    if (category === 'MODERATE' || score > 35) {
      return {
        label: 'MODERATE',
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-500/15',
        borderColor: 'border-amber-500/25',
        strokeColor: '#f59e0b',
        icon: ShieldAlert,
        desc: 'Moderate stress indicators identified across multimodal channels.'
      };
    }
    return {
      label: 'LOW',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/15',
      borderColor: 'border-emerald-500/25',
      strokeColor: '#10b981',
      icon: ShieldCheck,
      desc: 'Overall balanced patterns reflecting homeostatic wellness.'
    };
  };

  const config = getCategoryConfig();
  const Icon = config.icon;

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="spatial-glass rounded-3xl p-6 sm:p-7 flex flex-col items-center justify-center text-center relative w-full border border-black/[0.06] dark:border-white/10 transition-all">
      <div className="relative flex items-center justify-center my-2">
        <svg viewBox="0 0 144 144" className="w-40 h-40 transform -rotate-90">
          <circle
            cx="72"
            cy="72"
            r={radius}
            className="stroke-slate-200/80 dark:stroke-white/10 transition-colors"
            strokeWidth="9"
            fill="transparent"
          />
          <circle
            cx="72"
            cy="72"
            r={radius}
            stroke={config.strokeColor}
            strokeWidth="9"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-manrope font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-slate-100 tracking-tight leading-none">
            {Math.round(score)}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-mono tracking-wider mt-1">
            Score / 100
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-col items-center space-y-2">
        <div className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-wide border ${config.bgColor} ${config.borderColor} ${config.color}`}>
          <Icon className="w-3.5 h-3.5 shrink-0" />
          <span>{config.label} STRESS INDICATOR</span>
        </div>
        <p className="font-manrope text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
          {config.desc}
        </p>
      </div>
    </div>
  );
};

export default StressIndicator;
