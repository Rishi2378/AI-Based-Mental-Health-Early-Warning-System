import React, { useState } from 'react';
import { FileText, Sparkles, AlertCircle, CheckCircle, Tag, ArrowRight, Zap, Terminal } from 'lucide-react';
import { analyzeText } from '../services/api';
import SafetyDisclaimer from '../components/SafetyDisclaimer';
import LoadingState from '../components/LoadingState';

const SAMPLE_TEXTS = [
  { label: "Work & Academic Pressure", text: "Overloaded with urgent work deadlines, exam pressure, and severe lack of sleep. My mind feels completely exhausted and I cannot catch a break." },
  { label: "Peaceful & Balanced", text: "Had a productive day finishing all my tasks smoothly. Enjoyed a quiet walk outside and feeling calm and grateful." },
  { label: "Anxiety & Worry", text: "I feel a constant knot of worry in my stomach and my heart is racing. Terrified about what might go wrong during tomorrow's presentation." }
];

const TextAnalysis = () => {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError("Please enter journal text to analyze.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await analyzeText(text);
      setResult(res);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete NLP text analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      <SafetyDisclaimer />

      {/* Header */}
      <div className="spatial-glass rounded-3xl p-6 sm:p-8 space-y-3 border border-black/[0.06] dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 font-mono text-[11px] font-semibold uppercase mb-2">
              <FileText className="w-3.5 h-3.5" />
              <span>Linguistic Sentiment Stream</span>
            </div>
            <h1 className="font-manrope font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-slate-100 tracking-tight">
              Text NLP Emotion & Stress Analysis
            </h1>
            <p className="font-manrope text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Enter a journal entry or free-form text to analyze linguistic emotion patterns and stress indicators using TF-IDF and Soft-Voting Ensembles.
            </p>
          </div>

          <div className="flex items-center gap-2 spatial-glass-well px-3.5 py-1.5 rounded-full shrink-0 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs text-slate-600 dark:text-slate-300 font-semibold">
              DistilRoBERTa + TF-IDF
            </span>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="spatial-glass rounded-3xl p-6 sm:p-8 space-y-5 border border-black/[0.06] dark:border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Journal Text Entry
          </span>
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">Quick Samples:</span>
            {SAMPLE_TEXTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setText(sample.text);
                  setError(null);
                }}
                className="px-3 py-1 rounded-full spatial-glass-subtle text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 border border-black/[0.06] dark:border-white/10 text-xs font-medium transition-all active:scale-95"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Area */}
        <div className="spatial-glass-well rounded-2xl p-4">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setError(null);
            }}
            placeholder="Write about what happened today, feelings, pressures, or reflections..."
            rows={6}
            className="w-full bg-transparent resize-none text-slate-900 dark:text-slate-100 font-manrope text-sm leading-relaxed focus:outline-none placeholder:text-slate-400/50"
          />
        </div>

        {/* Action Row */}
        <div className="flex items-center justify-between pt-2">
          <span className="font-mono text-xs text-cyan-600 dark:text-cyan-400">
            {text.length} characters • {text.trim() ? text.trim().split(/\s+/).length : 0} words
          </span>

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading}
            className="px-7 py-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-manrope font-bold text-xs shadow-[0_0_20px_rgba(0,245,255,0.35)] hover:shadow-[0_0_28px_rgba(0,245,255,0.55)] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Zap className="w-4 h-4" />
            <span>{loading ? "Analyzing..." : "Analyze Emotion & Stress"}</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-3 shadow-sm animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && <LoadingState message="Tokenizing text and performing soft-voting classification..." />}

      {/* Analysis Results Display */}
      {result && !loading && (
        <div className="spatial-glass rounded-3xl p-6 sm:p-8 space-y-6 border border-black/[0.06] dark:border-white/10 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-black/[0.06] dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/25 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-manrope font-bold text-lg text-slate-900 dark:text-slate-100">
                  Linguistic Analysis Output
                </h3>
                <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  Ensemble: DistilRoBERTa + TF-IDF Soft Voting
                </p>
              </div>
            </div>
            <span className="px-3.5 py-1 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-mono text-xs font-bold uppercase tracking-wider border border-cyan-500/20 self-start sm:self-auto">
              {result.primary_emotion || "Analyzed"}
            </span>
          </div>

          {/* Metric Counter & Score */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="spatial-glass-well rounded-2xl p-5 flex flex-col justify-between">
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">
                Linguistic Stress Score
              </span>
              <div className="my-3 flex items-baseline gap-2">
                <span className="font-manrope font-extrabold text-4xl sm:text-5xl text-slate-900 dark:text-slate-100">
                  {Math.round(result.stress_score || 0)}
                </span>
                <span className="font-manrope font-bold text-xl text-cyan-600 dark:text-cyan-400">%</span>
              </div>
              <p className="font-manrope text-xs text-slate-500 dark:text-slate-400">
                Composite stress index derived from cognitive distortion vectors.
              </p>
            </div>

            <div className="spatial-glass-well rounded-2xl p-5 flex flex-col justify-between">
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">
                Primary Emotion Signature
              </span>
              <div className="my-3">
                <span className="font-manrope font-extrabold text-3xl sm:text-4xl text-cyan-600 dark:text-cyan-400 uppercase">
                  {result.primary_emotion || "Neutral"}
                </span>
              </div>
              <p className="font-manrope text-xs text-slate-500 dark:text-slate-400">
                Confidence: {Math.round((result.confidence || 0.85) * 100)}%
              </p>
            </div>
          </div>

          {/* Emotion Probability Distribution */}
          {result.probabilities && Object.keys(result.probabilities).length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="font-manrope font-bold text-sm text-slate-900 dark:text-slate-100">
                Emotion Probability Spectrum
              </h4>
              <div className="space-y-2.5">
                {Object.entries(result.probabilities).map(([emotion, prob]) => {
                  const pct = Math.round(Number(prob) * 100);
                  return (
                    <div key={emotion} className="space-y-1">
                      <div className="flex justify-between font-mono text-xs text-slate-600 dark:text-slate-400">
                        <span className="capitalize">{emotion}</span>
                        <span className="font-semibold text-slate-900 dark:text-slate-200">{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-white/10 h-2 rounded-full overflow-hidden p-0.5">
                        <div
                          className="bg-gradient-to-r from-cyan-400 to-purple-400 h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.max(4, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TextAnalysis;
