import React from 'react';
import { Lightbulb, CheckCircle2, PhoneCall, ExternalLink } from 'lucide-react';

const RecommendationCard = ({ recommendations = [], isCrisis = false, crisisDetails = null }) => {
  return (
    <div className="spatial-glass rounded-3xl p-6 sm:p-7 space-y-4 border border-black/[0.06] dark:border-white/10">
      <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-amber-500/15 border border-amber-500/25 text-amber-500">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-manrope font-bold text-base text-slate-900 dark:text-slate-100">
              Personalized Wellness Suggestions
            </h3>
            <p className="font-manrope text-xs text-slate-500 dark:text-slate-400">
              Non-diagnostic action steps based on detected linguistic & acoustic patterns
            </p>
          </div>
        </div>
      </div>

      {isCrisis && crisisDetails && (
        <div className="p-5 rounded-2xl bg-rose-500/15 border border-rose-500/30 space-y-3">
          <h4 className="font-manrope font-bold text-sm text-rose-600 dark:text-rose-300 flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-rose-500" />
            <span>{crisisDetails.warning_title || "Immediate Support Resources"}</span>
          </h4>
          <p className="font-manrope text-xs text-slate-700 dark:text-slate-200">{crisisDetails.message}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {crisisDetails.helplines?.map((line, idx) => (
              <a
                key={idx}
                href={line.url}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl spatial-glass-well border border-rose-500/30 flex items-center justify-between text-xs transition-all hover:scale-[1.02]"
              >
                <div>
                  <p className="font-manrope font-bold text-slate-900 dark:text-slate-100">{line.name}</p>
                  <p className="text-[11px] font-mono text-rose-600 dark:text-rose-400">{line.contact}</p>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-rose-500" />
              </a>
            ))}
          </div>
        </div>
      )}

      <ul className="space-y-2.5 pt-1">
        {recommendations.map((rec, idx) => (
          <li key={idx} className="flex items-start gap-3 p-4 rounded-2xl spatial-glass-well border border-black/[0.04] dark:border-white/5 text-xs sm:text-sm font-manrope text-slate-700 dark:text-slate-200 leading-relaxed shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecommendationCard;
