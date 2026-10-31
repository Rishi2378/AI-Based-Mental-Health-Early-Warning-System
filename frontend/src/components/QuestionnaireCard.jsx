import React from 'react';
import { Check, Sparkles, RotateCcw } from 'lucide-react';

const QuestionnaireCard = ({ questions = [], answers = {}, onOptionSelect, onQuickFill, onReset }) => {
  if (!questions || questions.length === 0) {
    return <div className="text-slate-400 font-mono text-xs p-4">Loading questionnaire questions...</div>;
  }

  const completedCount = Object.keys(answers).length;
  const progressPct = Math.round((completedCount / questions.length) * 100);

  return (
    <div className="space-y-6">
      {/* Progress Header with Quick Action Helpers */}
      <div className="spatial-glass rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-black/[0.06] dark:border-white/10">
        <div>
          <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Clinical Questionnaire Progress
          </span>
          <p className="font-manrope text-xs text-slate-600 dark:text-slate-300 mt-0.5">
            {completedCount} of {questions.length} questions completed
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-32 sm:w-40 h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-400 to-cyan-400 transition-all duration-300 rounded-full"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 font-mono">{progressPct}%</span>
          </div>

          {onQuickFill && (
            <button
              type="button"
              onClick={onQuickFill}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium spatial-glass-subtle text-slate-700 dark:text-slate-300 border border-black/[0.06] dark:border-white/10 transition-all hover:scale-105 active:scale-95 shadow-sm"
              title="Autofill balanced baseline responses"
            >
              <Sparkles className="w-3 h-3 text-cyan-500" />
              <span>Sample Baseline</span>
            </button>
          )}

          {onReset && completedCount > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="p-1.5 rounded-full text-xs spatial-glass-subtle text-slate-400 hover:text-rose-500 border border-black/[0.06] dark:border-white/10 transition-all hover:scale-105 active:scale-95"
              title="Reset questionnaire"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Questions Grid */}
      <div className="grid grid-cols-1 gap-4">
        {questions.map((q, idx) => {
          const selectedValue = answers[q.id];
          return (
            <div key={q.id} className="spatial-glass rounded-3xl p-5 sm:p-6 space-y-4 border border-black/[0.06] dark:border-white/10 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="w-7 h-7 rounded-xl bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-bold text-xs flex items-center justify-center border border-cyan-500/20 shrink-0 mt-0.5 font-mono">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="font-manrope text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                      {q.text}
                    </h4>
                    <span className="inline-block mt-1 text-[10px] font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20 font-semibold">
                      {q.category || "General"}
                    </span>
                  </div>
                </div>
                {selectedValue !== undefined && (
                  <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-2 pt-1">
                {q.options.map((opt) => {
                  const isSelected = selectedValue === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => onOptionSelect(q.id, opt.value)}
                      className={`px-3 py-2.5 rounded-2xl text-xs font-manrope font-medium transition-all text-center flex flex-col items-center justify-center border ${
                        isSelected
                          ? 'bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-950 border-transparent shadow-[0_0_16px_rgba(20,184,166,0.35)] font-bold scale-[1.02]'
                          : 'spatial-glass-well text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-black/[0.04] dark:border-white/5'
                      }`}
                    >
                      <span className="leading-snug">{opt.label}</span>
                      <span className={`text-[10px] font-mono mt-1 ${isSelected ? 'text-slate-900/80 font-bold' : 'text-slate-400'}`}>
                        ({opt.value} pts)
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuestionnaireCard;
