import React from 'react';
import { Sparkles } from 'lucide-react';

const LoadingState = ({ message = "Processing multimodal features..." }) => {
  return (
    <div className="spatial-glass p-12 rounded-3xl flex flex-col items-center justify-center text-center space-y-4 my-8 border border-black/[0.06] dark:border-white/10 transition-all">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin"></div>
        <Sparkles className="w-6 h-6 text-cyan-500 dark:text-cyan-400 absolute animate-pulse" />
      </div>
      <p className="font-manrope text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
        {message}
      </p>
      <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
        Executing calibrated multimodal inference pipeline...
      </p>
    </div>
  );
};

export default LoadingState;
