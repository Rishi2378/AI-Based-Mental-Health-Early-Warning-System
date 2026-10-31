import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layers, ArrowLeft, CheckCircle, AlertTriangle, Lightbulb, Sliders, Calendar, Sparkles, Activity } from 'lucide-react';
import { getAssessmentById } from '../services/api';
import StressIndicator from '../components/StressIndicator';
import RecommendationCard from '../components/RecommendationCard';
import SafetyDisclaimer from '../components/SafetyDisclaimer';
import LoadingState from '../components/LoadingState';

const Result = () => {
  const { id } = useParams();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadResult = async () => {
      try {
        setLoading(true);
        const res = await getAssessmentById(id);
        setAssessment(res.assessment);
      } catch (err) {
        setError("Assessment record not found.");
      } finally {
        setLoading(false);
      }
    };
    if (id) loadResult();
  }, [id]);

  if (loading) return <LoadingState message={`Fetching Assessment #${id} results...`} />;

  if (error || !assessment) {
    return (
      <div className="spatial-glass p-8 rounded-3xl text-center space-y-4 my-6 border border-rose-500/30">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="font-manrope font-bold text-lg text-slate-900 dark:text-slate-100">Assessment Record Not Found</h3>
        <p className="font-mono text-xs text-slate-500 dark:text-slate-400">{error || "The requested assessment record could not be found."}</p>
        <Link to="/history" className="inline-block px-5 py-2 rounded-full bg-slate-900 dark:bg-white text-xs font-semibold text-white dark:text-slate-900">
          Back to History
        </Link>
      </div>
    );
  }

  const recs = assessment.recommendations?.items || [];

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      <SafetyDisclaimer />

      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link to="/history" className="flex items-center gap-1.5 text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assessment History</span>
        </Link>

        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-cyan-500" />
          {new Date(assessment.created_at).toLocaleString()}
        </span>
      </div>

      {/* Main Stress Gauge Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <StressIndicator score={assessment.overall_score} category={assessment.category} isCrisis={assessment.is_crisis} />
        </div>

        {/* Fusion Mathematical Contribution Breakdown */}
        <div className="lg:col-span-2 spatial-glass rounded-3xl p-6 sm:p-7 space-y-4 border border-black/[0.06] dark:border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="font-manrope font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-500" />
              <span>Multimodal Late-Fusion Synthesis</span>
            </h3>
            <span className="font-mono text-xs text-cyan-600 dark:text-cyan-400 font-bold">
              ID #{assessment.id}
            </span>
          </div>

          <p className="font-manrope text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Composite score calculated using soft-voting fusion: NLP Text (40%), Acoustic Voice (30%), and Clinical Scale (30%).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-4 rounded-2xl spatial-glass-well space-y-1">
              <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">
                Text NLP (40%)
              </span>
              <span className="font-manrope text-xl font-extrabold text-cyan-600 dark:text-cyan-400 block">
                {assessment.text_score !== null ? `${Math.round(assessment.text_score)}%` : 'Omitted'}
              </span>
              <span className="font-mono text-[10px] text-slate-400 block">
                Contrib: {assessment.text_score !== null ? `${(assessment.text_score * 0.4).toFixed(1)} pts` : '0 pts'}
              </span>
            </div>

            <div className="p-4 rounded-2xl spatial-glass-well space-y-1">
              <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">
                Voice Lab (30%)
              </span>
              <span className="font-manrope text-xl font-extrabold text-purple-600 dark:text-purple-400 block">
                {assessment.voice_score !== null ? `${Math.round(assessment.voice_score)}%` : 'Omitted'}
              </span>
              <span className="font-mono text-[10px] text-slate-400 block">
                Contrib: {assessment.voice_score !== null ? `${(assessment.voice_score * 0.3).toFixed(1)} pts` : '0 pts'}
              </span>
            </div>

            <div className="p-4 rounded-2xl spatial-glass-well space-y-1">
              <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">
                Clinical Scale (30%)
              </span>
              <span className="font-manrope text-xl font-extrabold text-teal-600 dark:text-teal-400 block">
                {assessment.questionnaire_score !== null ? `${Math.round(assessment.questionnaire_score)}%` : 'Omitted'}
              </span>
              <span className="font-mono text-[10px] text-slate-400 block">
                Contrib: {assessment.questionnaire_score !== null ? `${(assessment.questionnaire_score * 0.3).toFixed(1)} pts` : '0 pts'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl spatial-glass-well font-mono text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span className="text-slate-500">Multimodal Result:</span>
            <span className="font-bold text-cyan-600 dark:text-cyan-300">
              {assessment.overall_score} / 100 • {assessment.category}
            </span>
          </div>
        </div>
      </div>

      {/* Individual Modality Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Text Result Detail */}
        {assessment.text_result && (
          <div className="spatial-glass rounded-3xl p-6 space-y-3 border border-black/[0.06] dark:border-white/10">
            <h4 className="font-manrope font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-cyan-500" />
              <span>Text NLP Model Output</span>
            </h4>
            <div className="text-xs space-y-1.5 font-manrope text-slate-600 dark:text-slate-300">
              <p>Emotion: <strong className="text-cyan-600 dark:text-cyan-400 uppercase font-mono">{assessment.text_result.emotion}</strong></p>
              <p>Sentiment: <strong className="text-purple-600 dark:text-purple-400 uppercase font-mono">{assessment.text_result.sentiment}</strong></p>
              <p>Confidence: <strong className="font-mono">{Math.round((assessment.text_result.confidence || 0) * 100)}%</strong></p>
            </div>
            {assessment.text_result.top_features?.length > 0 && (
              <div className="pt-2">
                <span className="font-mono text-[10px] uppercase text-slate-400">TF-IDF Extracted Terms:</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {assessment.text_result.top_features.map((f, i) => (
                    <span key={i} className="px-2.5 py-0.5 rounded-full spatial-glass-subtle text-[11px] font-mono text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Voice Result Detail */}
        {assessment.voice_result && (
          <div className="spatial-glass rounded-3xl p-6 space-y-3 border border-black/[0.06] dark:border-white/10">
            <h4 className="font-manrope font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-purple-500" />
              <span>Voice Signal Processing Output</span>
            </h4>
            <div className="text-xs space-y-1.5 font-manrope text-slate-600 dark:text-slate-300">
              <p>Speech Emotion: <strong className="text-purple-600 dark:text-purple-400 uppercase font-mono">{assessment.voice_result.emotion}</strong></p>
              <p>Confidence: <strong className="font-mono">{Math.round((assessment.voice_result.confidence || 0) * 100)}%</strong></p>
            </div>
            {assessment.voice_result.features_summary && (
              <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400 space-y-1 pt-2 border-t border-black/[0.06] dark:border-white/10">
                <p>Pitch F0: {assessment.voice_result.features_summary.estimated_pitch_hz} Hz</p>
                <p>RMS Energy: {assessment.voice_result.features_summary.rms_energy_mean}</p>
                <p>Spectral Centroid: {assessment.voice_result.features_summary.spectral_centroid_hz} Hz</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Wellness Suggestions */}
      <RecommendationCard recommendations={recs} isCrisis={assessment.is_crisis} />
    </div>
  );
};

export default Result;
