import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Sliders, Shield, Database, Cpu, Check, AlertCircle, Trash2, Sparkles, RefreshCw } from 'lucide-react';
import { fetchModelEvaluation, clearHistory, retrainModels } from '../services/api';
import SafetyDisclaimer from '../components/SafetyDisclaimer';
import LoadingState from '../components/LoadingState';

const Settings = () => {
  const [weights, setWeights] = useState({ text: 40, voice: 30, questionnaire: 30 });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [modelEval, setModelEval] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEval = async () => {
      try {
        setLoading(true);
        const res = await fetchModelEvaluation();
        setModelEval(res.models || {});
      } catch (err) {
        console.error("Failed to load model evaluation metrics:", err);
      } finally {
        setLoading(false);
      }
    };
    loadEval();

    const savedWeights = localStorage.getItem('mindguard_weights');
    if (savedWeights) {
      try {
        const parsed = JSON.parse(savedWeights);
        setWeights(parsed);
      } catch (e) {}
    }
  }, []);

  const handleSaveWeights = (e) => {
    e.preventDefault();
    const sum = Number(weights.text) + Number(weights.voice) + Number(weights.questionnaire);
    if (sum !== 100) {
      alert(`Multimodal weights must sum to exactly 100%. Current sum: ${sum}%`);
      return;
    }
    localStorage.setItem('mindguard_weights', JSON.stringify(weights));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleClearLocalData = async () => {
    if (window.confirm("Clear all historical records from database?")) {
      await clearHistory();
      alert("All assessment history cleared successfully.");
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
              <SettingsIcon className="w-3.5 h-3.5" />
              <span>System Calibration & ML Pipeline</span>
            </div>
            <h1 className="font-manrope font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-slate-100 tracking-tight">
              Settings & Model Diagnostics
            </h1>
            <p className="font-manrope text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Adjust multimodal weighting parameters, review machine learning evaluation metrics, and manage privacy controls.
            </p>
          </div>

          <div className="flex items-center gap-2 spatial-glass-well px-3.5 py-1.5 rounded-full shrink-0 self-start sm:self-auto">
            <span className="font-mono text-xs text-slate-600 dark:text-slate-300 font-semibold">
              Late Fusion Weights
            </span>
          </div>
        </div>
      </div>

      {/* Multimodal Fusion Weights Form */}
      <div className="spatial-glass rounded-3xl p-6 sm:p-8 space-y-6 border border-black/[0.06] dark:border-white/10">
        <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/10 pb-4">
          <h3 className="font-manrope font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-500" />
            <span>Configurable Multimodal Fusion Weights</span>
          </h3>
          <span className="font-mono text-xs text-slate-500 dark:text-slate-400">Sum must equal 100%</span>
        </div>

        <form onSubmit={handleSaveWeights} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">
                Text NLP Weight (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={weights.text}
                onChange={(e) => setWeights({ ...weights, text: e.target.value })}
                className="w-full p-3 rounded-2xl spatial-glass-well font-mono text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div className="space-y-2">
              <label className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">
                Voice Processing Weight (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={weights.voice}
                onChange={(e) => setWeights({ ...weights, voice: e.target.value })}
                className="w-full p-3 rounded-2xl spatial-glass-well font-mono text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div className="space-y-2">
              <label className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">
                Questionnaire Weight (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={weights.questionnaire}
                onChange={(e) => setWeights({ ...weights, questionnaire: e.target.value })}
                className="w-full p-3 rounded-2xl spatial-glass-well font-mono text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="font-mono text-xs text-slate-500">
              Total Weight: <strong className="text-cyan-600 dark:text-cyan-300 font-bold">{Number(weights.text) + Number(weights.voice) + Number(weights.questionnaire)}%</strong>
            </span>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-manrope font-bold text-xs shadow-[0_0_20px_rgba(0,245,255,0.35)] hover:shadow-[0_0_28px_rgba(0,245,255,0.55)] active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Weights</span>
            </button>
          </div>

          {savedSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs font-mono flex items-center gap-2 shadow-sm animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Multimodal weights updated successfully!</span>
            </div>
          )}
        </form>
      </div>

      {/* Machine Learning Model Performance Metrics */}
      <div className="spatial-glass rounded-3xl p-6 sm:p-8 space-y-6 border border-black/[0.06] dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/[0.06] dark:border-white/10 pb-4">
          <div>
            <h3 className="font-manrope font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-500" />
              <span>Trained Machine Learning Models & Metrics</span>
            </h3>
            <p className="font-manrope text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Evaluation performance across DistilRoBERTa NLP text & Librosa voice acoustic signal processing
            </p>
          </div>
          <button
            onClick={async () => {
              try {
                setLoading(true);
                await retrainModels();
                const updated = await fetchModelEvaluation();
                setModelEval(updated.models || {});
                alert("Models retrained and evaluated successfully!");
              } catch (err) {
                alert("Retraining failed: " + (err.response?.data?.message || err.message));
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-full spatial-glass-subtle text-slate-800 dark:text-slate-200 text-xs font-manrope font-semibold border border-black/[0.06] dark:border-white/10 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5 text-purple-500" />
            <span>Retrain & Re-evaluate</span>
          </button>
        </div>

        {loading ? (
          <LoadingState message="Fetching updated AI model metrics..." />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Text Model Specs */}
              {modelEval?.text_model && (
                <div className="spatial-glass-well rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-cyan-600 dark:text-cyan-400 font-bold">NLP Text Model</span>
                      <h4 className="font-manrope font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{modelEval.text_model.model_name}</h4>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-bold font-mono text-[11px] border border-cyan-500/20">
                      {Math.round((modelEval.text_model.metrics?.accuracy || 0) * 100)}% Acc
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                    <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/5">
                      <span className="text-slate-400 block text-[10px]">Test Accuracy</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{Math.round((modelEval.text_model.metrics?.accuracy || 0) * 100)}%</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/5">
                      <span className="text-slate-400 block text-[10px]">5-Fold CV Mean</span>
                      <span className="font-bold text-cyan-600 dark:text-cyan-400 text-sm">{Math.round((modelEval.text_model.metrics?.cv_mean_accuracy || 0) * 100)}%</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/5">
                      <span className="text-slate-400 block text-[10px]">Precision</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{Math.round((modelEval.text_model.metrics?.precision || 0) * 100)}%</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/5">
                      <span className="text-slate-400 block text-[10px]">Weighted F1</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{Math.round((modelEval.text_model.metrics?.f1 || 0) * 100)}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Voice Model Specs */}
              {modelEval?.voice_model && (
                <div className="spatial-glass-well rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-purple-600 dark:text-purple-400 font-bold">Voice Acoustic Model</span>
                      <h4 className="font-manrope font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5">{modelEval.voice_model.model_name}</h4>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 font-bold font-mono text-[11px] border border-purple-500/20">
                      {Math.round((modelEval.voice_model.metrics?.accuracy || 0) * 100)}% Acc
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                    <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/5">
                      <span className="text-slate-400 block text-[10px]">Test Accuracy</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{Math.round((modelEval.voice_model.metrics?.accuracy || 0) * 100)}%</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/5">
                      <span className="text-slate-400 block text-[10px]">5-Fold CV Mean</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400 text-sm">{Math.round((modelEval.voice_model.metrics?.cv_mean_accuracy || 0) * 100)}%</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/5">
                      <span className="text-slate-400 block text-[10px]">Precision</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{Math.round((modelEval.voice_model.metrics?.precision || 0) * 100)}%</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/[0.03] dark:bg-white/5">
                      <span className="text-slate-400 block text-[10px]">Weighted F1</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{Math.round((modelEval.voice_model.metrics?.f1 || 0) * 100)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Privacy & Storage Governance */}
      <div className="spatial-glass rounded-3xl p-6 sm:p-8 space-y-4 border border-black/[0.06] dark:border-white/10">
        <h3 className="font-manrope font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>Privacy Defaults & Local Storage</span>
        </h3>
        <p className="font-manrope text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          MindGuard AI operates under strict privacy-conscious defaults:
        </p>
        <ul className="space-y-2 text-xs font-manrope text-slate-600 dark:text-slate-300 list-disc list-inside">
          <li><strong>Raw Voice Non-Retention:</strong> Voice audio files are deleted immediately after extracting 38 acoustic signal features.</li>
          <li><strong>Local Database Storage:</strong> All assessment records remain stored locally in your SQLite instance.</li>
          <li><strong>No External Model Training:</strong> Personal entries are never uploaded or shared for external model training.</li>
        </ul>

        <div className="pt-4 border-t border-black/[0.06] dark:border-white/10 flex justify-end">
          <button
            onClick={handleClearLocalData}
            className="flex items-center gap-2 px-4 py-2 rounded-full spatial-glass-subtle text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs font-semibold shadow-sm hover:scale-105 active:scale-95 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>Clear Database History</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
