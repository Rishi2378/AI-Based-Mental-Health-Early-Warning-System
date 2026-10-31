import React, { useState } from 'react';
import { Mic, Activity, CheckCircle, AlertCircle, Sparkles, Sliders, Volume2, ShieldCheck, Zap } from 'lucide-react';
import { analyzeVoice } from '../services/api';
import VoiceRecorder from '../components/VoiceRecorder';
import SafetyDisclaimer from '../components/SafetyDisclaimer';
import LoadingState from '../components/LoadingState';

const VoiceAnalysis = () => {
  const [audioBlob, setAudioBlob] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAudioRecorded = async (blob) => {
    setAudioBlob(blob);
    setError(null);
    setLoading(true);
    try {
      const res = await analyzeVoice(blob);
      setResult(res);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to analyze audio recording.");
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-300 font-mono text-[11px] font-semibold uppercase mb-2">
              <Mic className="w-3.5 h-3.5" />
              <span>Bio-Acoustic Spectral Lab</span>
            </div>
            <h1 className="font-manrope font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-slate-100 tracking-tight">
              Voice Signal & Speech Emotion Processing
            </h1>
            <p className="font-manrope text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Analyzes acoustic speech features (MFCCs, ZCR, RMS Energy, Spectral Centroid, Pitch F0) using Librosa signal processing and Random Forest ML.
            </p>
          </div>

          <div className="flex items-center gap-2 spatial-glass-well px-3.5 py-1.5 rounded-full shrink-0 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono text-xs text-slate-600 dark:text-slate-300 font-semibold">
              44.1 kHz • RIFF Mono
            </span>
          </div>
        </div>
      </div>

      {/* Voice Recorder Component */}
      <VoiceRecorder onAudioRecorded={handleAudioRecorded} isAnalyzing={loading} />

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-3 shadow-sm animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && <LoadingState message="Extracting Librosa 38-feature acoustic vector & classifying speech emotion..." />}

      {/* Analysis Results Display */}
      {result && !loading && (
        <div className="spatial-glass rounded-3xl p-6 sm:p-8 space-y-6 border border-black/[0.06] dark:border-white/10 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-black/[0.06] dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-manrope font-bold text-lg text-slate-900 dark:text-slate-100">
                  Acoustic Speech Analysis Output
                </h3>
                <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                  Processed via Random Forest Biometric Classifier
                </p>
              </div>
            </div>
            <span className="px-3.5 py-1 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 font-mono text-xs font-bold uppercase tracking-wider border border-purple-500/20 self-start sm:self-auto">
              {result.primary_emotion || "Analyzed"}
            </span>
          </div>

          {/* Metric Counter & Score */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="spatial-glass-well rounded-2xl p-5 flex flex-col justify-between">
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">
                Speech Stress Score
              </span>
              <div className="my-3 flex items-baseline gap-2">
                <span className="font-manrope font-extrabold text-4xl sm:text-5xl text-slate-900 dark:text-slate-100">
                  {Math.round(result.stress_score || 0)}
                </span>
                <span className="font-manrope font-bold text-xl text-purple-600 dark:text-purple-400">%</span>
              </div>
              <p className="font-manrope text-xs text-slate-500 dark:text-slate-400">
                Calculated from prosodic micro-tremors, jitter variance, and pitch tension.
              </p>
            </div>

            <div className="spatial-glass-well rounded-2xl p-5 flex flex-col justify-between">
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold">
                Dominant Affective Valency
              </span>
              <div className="my-3">
                <span className="font-manrope font-extrabold text-3xl sm:text-4xl text-cyan-600 dark:text-cyan-400 uppercase">
                  {result.primary_emotion || "Neutral"}
                </span>
              </div>
              <p className="font-manrope text-xs text-slate-500 dark:text-slate-400">
                Random forest multi-class classification based on 38 Librosa acoustic features.
              </p>
            </div>
          </div>

          {/* Biometric Feature Vector Cards */}
          {result.features && (
            <div className="space-y-3">
              <h4 className="font-manrope font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-500" />
                <span>Extracted Acoustic Signal Descriptors</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(result.features).map(([key, val]) => (
                  <div key={key} className="spatial-glass-well rounded-2xl p-3.5 flex flex-col justify-between">
                    <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                      {typeof val === 'number' ? val.toFixed(3) : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emotion Probability Distribution */}
          {result.probabilities && Object.keys(result.probabilities).length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="font-manrope font-bold text-sm text-slate-900 dark:text-slate-100">
                Multi-Class Emotion Distribution
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
                          className="bg-gradient-to-r from-purple-400 to-cyan-400 h-full rounded-full transition-all duration-700"
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

export default VoiceAnalysis;
