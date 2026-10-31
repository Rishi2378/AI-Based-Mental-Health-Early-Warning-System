import React from 'react';

const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'indigo', trend, badge }) => {
  const colorStyles = {
    indigo: {
      glow: 'from-cyan-500/20 to-purple-500/10',
      badge: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/25',
      iconBox: 'bg-cyan-500/15 border-cyan-500/25 text-cyan-600 dark:text-cyan-400',
    },
    cyan: {
      glow: 'from-cyan-500/20 to-blue-500/10',
      badge: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/25',
      iconBox: 'bg-cyan-500/15 border-cyan-500/25 text-cyan-600 dark:text-cyan-400',
    },
    emerald: {
      glow: 'from-emerald-500/20 to-teal-500/10',
      badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
      iconBox: 'bg-emerald-500/15 border-emerald-500/25 text-emerald-600 dark:text-emerald-400',
    },
    amber: {
      glow: 'from-amber-500/20 to-orange-500/10',
      badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/25',
      iconBox: 'bg-amber-500/15 border-amber-500/25 text-amber-600 dark:text-amber-400',
    },
    rose: {
      glow: 'from-rose-500/20 to-red-500/10',
      badge: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/25',
      iconBox: 'bg-rose-500/15 border-rose-500/25 text-rose-600 dark:text-rose-400',
    },
  };

  const style = colorStyles[color] || colorStyles.indigo;

  return (
    <div className="spatial-glass hover-specular p-5 rounded-2xl relative overflow-hidden group border border-black/[0.06] dark:border-white/10 transition-all duration-300 hover:-translate-y-1">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${style.glow} opacity-20 rounded-full blur-2xl group-hover:opacity-35 transition-opacity pointer-events-none`} />
      
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="space-y-1 min-w-0">
          <p className="font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
            {title}
          </p>
          <div className="flex items-baseline gap-2 flex-wrap pt-0.5">
            <h3 className="font-manrope font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-slate-100 tracking-tight">
              {value}
            </h3>
            {badge && (
              <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase border ${style.badge}`}>
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="font-manrope text-xs text-slate-500 dark:text-slate-400 leading-snug">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div className={`p-3 rounded-2xl border ${style.iconBox} shadow-sm shrink-0 group-hover:scale-105 transition-transform`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-black/[0.04] dark:border-white/5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono">
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
