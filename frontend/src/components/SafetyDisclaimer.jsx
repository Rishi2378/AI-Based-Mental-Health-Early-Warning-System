import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

const SafetyDisclaimer = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1 rounded-full spatial-glass-subtle border border-cyan-500/20 text-xs text-slate-600 dark:text-cyan-300 shadow-sm">
        <ShieldCheck className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
        <span className="font-mono text-[10px] uppercase font-semibold">Non-Diagnostic Research System</span>
      </div>
    );
  }

  return (
    <div className="spatial-glass-subtle p-4 sm:p-5 rounded-2xl border border-amber-500/25 mb-6 transition-all">
      <div className="flex items-start gap-3.5">
        <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="space-y-1 text-xs">
          <div className="font-manrope font-bold text-slate-900 dark:text-amber-200 flex items-center gap-2">
            Important Academic Safety & Non-Diagnostic Notice
          </div>
          <p className="font-manrope text-slate-600 dark:text-slate-300 leading-relaxed text-xs">
            MindGuard AI identifies non-diagnostic linguistic and acoustic patterns associated with stress and emotional shifts. 
            <strong className="text-amber-700 dark:text-amber-300 font-semibold"> It does NOT diagnose mental health conditions or provide medical advice.</strong> If you are experiencing distress, please reach out to a certified healthcare professional or call the 988 Suicide & Crisis Lifeline.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SafetyDisclaimer;
