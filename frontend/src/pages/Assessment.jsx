import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, FileText, Mic, ClipboardList, Sparkles, AlertCircle, ArrowRight, Check, ArrowLeft, RotateCcw, Activity, ShieldCheck, Zap } from 'lucide-react';
import { analyzeText, analyzeVoice, fetchQuestionnaire, analyzeQuestionnaire, createAssessment } from '../services/api';
import VoiceRecorder from '../components/VoiceRecorder';
import SafetyDisclaimer from '../components/SafetyDisclaimer';
import LoadingState from '../components/LoadingState';

const SAMPLE_JOURNALS = [
  { label: "Stress & Deadlines", text: "Overloaded with urgent work deadlines, late night shifts, and zero sleep. My mind feels completely exhausted and I cannot catch a break." },
  { label: "Calm & Grounded", text: "Had a productive day finishing all my tasks steadily. Enjoyed a quiet walk outside and feeling calm and grateful." },
  { label: "Anxious & Apprehensive", text: "I feel a constant knot of worry in my stomach and my heart is racing. Terrified about what might go wrong during tomorrow's presentation." }
];

const STEPS = [
  { id: 1, title: "Linguistic Reflection", subtitle: "NLP Text Analysis", icon: FileText, weight: "40%" },
  { id: 2, title: "Acoustic Biomarkers", subtitle: "Speech Emotion Lab", icon: Mic, weight: "30%" },
  { id: 3, title: "Psychometric Scales", subtitle: "Clinical PHQ & GAD", icon: ClipboardList, weight: "30%" }
];

const Assessment = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Stream States
  const [textInput, setTextInput] = useState('');
  const [textResult, setTextResult] = useState(null);

  const [voiceBlob, setVoiceBlob] = useState(null);
  const [voiceResult, setVoiceResult] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [questionnaireResult, setQuestionnaireResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const res = await fetchQuestionnaire();
        setQuestions(res.questions || []);
      } catch (err) {
        console.error("Failed to load questionnaire:", err);
      }
    };
    loadQuestions();
  }, []);

  // Step 1: Text submission
  const handleProceedFromText = async () => {
    if (!textInput.trim()) {
      setError("Please write your journal entry or click 'Skip' to evaluate without text.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await analyzeText(textInput);
      setTextResult(res);
      setCurrentStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Text analysis failed. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Voice recorded
  const handleAudioRecorded = async (blob) => {
    setVoiceBlob(blob);
    setError(null);
    setLoading(true);
    try {
      const res = await analyzeVoice(blob);
      setVoiceResult(res);
    } catch (err) {
      setError(err.response?.data?.message || "Voice analysis failed. Please record for at least 1-2 seconds.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Multimodal Synthesis Calculation
  const handleFinalFusionSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      let qRes = questionnaireResult;
      if (!qRes && Object.keys(answers).length > 0) {
        const analyzed = await analyzeQuestionnaire(answers);
        qRes = analyzed.result;
        setQuestionnaireResult(qRes);
      }

      let customWeights = null;
      const savedWeights = localStorage.getItem('mindguard_weights');
      if (savedWeights) {
        try {
          const parsed = JSON.parse(savedWeights);
          customWeights = {
            text: Number(parsed.text) / 100,
            voice: Number(parsed.voice) / 100,
            questionnaire: Number(parsed.questionnaire) / 100,
          };
        } catch (e) {}
      }

      const payload = {
        text_result: textResult,
        voice_result: voiceResult,
        questionnaire_result: qRes,
        custom_weights: customWeights,
        raw_text_sample: textInput
      };

      const finalRes = await createAssessment(payload);
      if (finalRes.status === "success") {
        navigate(`/result/${finalRes.assessment_id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to execute multimodal fusion calculation.");
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const isQuestionnaireComplete = questions.length > 0 && answeredCount === questions.length;

  const handleQuickFill = () => {
    const filled = {};
    questions.forEach((q) => {
      filled[q.id] = 1; // Mild/low baseline
    });
    setAnswers(filled);
  };

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      <SafetyDisclaimer />

      {/* Header & Wizard Progress Tracker */}
      <div className="spatial-glass rounded-3xl p-6 sm:p-8 space-y-6 border border-black/[0.06] dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 font-mono text-[11px] font-semibold uppercase mb-2">
              <Zap className="w-3.5 h-3.5" />
              <span>Multimodal Diagnostic Sequence</span>
            </div>
            <h1 className="font-manrope font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-slate-100 tracking-tight">
              Guided Assessment Wizard
            </h1>
            <p className="font-manrope text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Synchronize text, vocal harmonics, and clinical surveys into a holistic wellness index.
            </p>
          </div>

          <div className="flex items-center gap-2 spatial-glass-well px-4 py-2 rounded-full self-start sm:self-auto">
            <span className="font-mono text-xs text-slate-600 dark:text-slate-300 font-semibold">
              Step {currentStep} of 3
            </span>
          </div>
        </div>

        {/* Step Track */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isDone = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div
                key={step.id}
                onClick={() => {
                  if (isDone) setCurrentStep(step.id);
                }}
                className={`p-4 rounded-2xl flex items-center gap-3.5 transition-all border ${
                  isCurrent
                    ? 'spatial-glass border-cyan-400 ring-1 ring-cyan-400 shadow-sm'
                    : isDone
                    ? 'spatial-glass-subtle cursor-pointer border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'spatial-glass-subtle opacity-60 border-black/[0.04] dark:border-white/5'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    isDone
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                      : isCurrent
                      ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-400/40'
                      : 'bg-black/[0.04] dark:bg-white/5 text-slate-400'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4 text-emerald-500" /> : <Icon className="w-4 h-4" />}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-manrope font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {step.title}
                    </span>
                    <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold">
                      ({step.weight})
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {step.subtitle}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-3 shadow-sm animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Text NLP Reflection */}
      {currentStep === 1 && (
        <div className="spatial-glass rounded-3xl p-6 sm:p-8 space-y-6 border border-black/[0.06] dark:border-white/10 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-black/[0.06] dark:border-white/10">
            <div>
              <h2 className="font-manrope font-bold text-lg text-slate-900 dark:text-slate-100">
                Step 1: Linguistic Reflection
              </h2>
              <p className="font-manrope text-xs text-slate-500 dark:text-slate-400">
                Write down how you've felt recently or pick a sample scenario to evaluate.
              </p>
            </div>
            <span className="font-mono text-xs text-cyan-600 dark:text-cyan-400">
              {textInput.length} characters
            </span>
          </div>

          {/* Quick Preset Samples */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
              Sample Prompts:
            </span>
            {SAMPLE_JOURNALS.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setTextInput(s.text);
                  setError(null);
                }}
                className="px-3 py-1 rounded-full spatial-glass-subtle text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 border border-black/[0.06] dark:border-white/10 text-xs font-medium transition-all active:scale-95"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Text Area */}
          <div className="spatial-glass-well rounded-2xl p-4">
            <textarea
              value={textInput}
              onChange={(e) => {
                setTextInput(e.target.value);
                setError(null);
              }}
              rows={6}
              placeholder="Take a deep breath and describe your current mental or physical state, thoughts, worries, or highlights from your week..."
              className="w-full bg-transparent resize-none text-slate-900 dark:text-slate-100 font-manrope text-sm leading-relaxed focus:outline-none placeholder:text-slate-400/50"
            />
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                setTextResult(null);
                setCurrentStep(2);
              }}
              className="text-xs font-mono text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Skip text modality →
            </button>
            <button
              type="button"
              onClick={handleProceedFromText}
              disabled={loading}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-manrope font-bold text-xs shadow-[0_0_20px_rgba(0,245,255,0.35)] hover:shadow-[0_0_28px_rgba(0,245,255,0.55)] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? "Analyzing NLP..." : "Proceed to Voice Step"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Voice Acoustic Recording */}
      {currentStep === 2 && (
        <div className="spatial-glass rounded-3xl p-6 sm:p-8 space-y-6 border border-black/[0.06] dark:border-white/10 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-black/[0.06] dark:border-white/10">
            <div>
              <h2 className="font-manrope font-bold text-lg text-slate-900 dark:text-slate-100">
                Step 2: Voice Acoustic Biomarker
              </h2>
              <p className="font-manrope text-xs text-slate-500 dark:text-slate-400">
                Record your voice or generate an instant synthetic acoustic clip to extract 38 acoustic features.
              </p>
            </div>
            {voiceResult && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Audio Captured</span>
              </span>
            )}
          </div>

          {/* Voice Recorder Component */}
          <VoiceRecorder onAudioRecorded={handleAudioRecorded} isAnalyzing={loading} />

          {/* Audio Result Summary Pill */}
          {voiceResult && (
            <div className="spatial-glass-well rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-manrope font-bold text-slate-900 dark:text-slate-100">
                  Detected Vocal State: {voiceResult.primary_emotion?.toUpperCase() || "ANALYZED"}
                </span>
                <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Stress Intensity Score: {Math.round(voiceResult.stress_score || 0)}%
                </p>
              </div>
              <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400">
                Librosa 38-Feature Vector Validated
              </span>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Text</span>
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setVoiceResult(null);
                  setCurrentStep(3);
                }}
                className="text-xs font-mono text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Skip voice modality →
              </button>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-manrope font-bold text-xs shadow-[0_0_20px_rgba(0,245,255,0.35)] hover:shadow-[0_0_28px_rgba(0,245,255,0.55)] active:scale-95 transition-all flex items-center gap-2"
              >
                <span>Proceed to Questionnaire</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Clinical Questionnaire */}
      {currentStep === 3 && (
        <div className="spatial-glass rounded-3xl p-6 sm:p-8 space-y-6 border border-black/[0.06] dark:border-white/10 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-black/[0.06] dark:border-white/10">
            <div>
              <h2 className="font-manrope font-bold text-lg text-slate-900 dark:text-slate-100">
                Step 3: Clinical Questionnaire (PHQ & GAD)
              </h2>
              <p className="font-manrope text-xs text-slate-500 dark:text-slate-400">
                Over the last 2 weeks, how often have you been bothered by any of the following problems?
              </p>
            </div>
            <button
              type="button"
              onClick={handleQuickFill}
              className="px-3.5 py-1.5 rounded-full spatial-glass-subtle text-cyan-600 dark:text-cyan-300 text-xs font-mono font-semibold border border-cyan-500/20 hover:scale-105 active:scale-95 transition-all self-start sm:self-auto"
            >
              Auto-Fill Mild Baseline
            </button>
          </div>

          {/* Question List */}
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="spatial-glass-well rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <span className="font-manrope text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {idx + 1}. {q.text}
                  </span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-slate-200/50 dark:bg-white/10 text-slate-500 dark:text-slate-400 uppercase font-semibold">
                    {q.category || "General"}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { val: 0, text: "Not at all" },
                    { val: 1, text: "Several days" },
                    { val: 2, text: "More than half" },
                    { val: 3, text: "Nearly every day" },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setAnswers({ ...answers, [q.id]: opt.val })}
                      className={`px-3 py-2 rounded-xl text-xs font-medium transition-all text-center border ${
                        answers[q.id] === opt.val
                          ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold border-transparent shadow-sm'
                          : 'spatial-glass-subtle text-slate-600 dark:text-slate-300 border-black/[0.04] dark:border-white/5 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Modality Completion Summary */}
          <div className="spatial-glass-well rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-mono text-slate-500 dark:text-slate-400">
              Survey Progress: {answeredCount} / {questions.length} Answered
            </span>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${textResult ? 'bg-emerald-400' : 'bg-slate-400'}`} />
              <span className="font-mono text-[11px] text-slate-500">NLP ({textResult ? 'Ready' : 'Skipped'})</span>
              <span className={`w-2 h-2 rounded-full ${voiceResult ? 'bg-emerald-400' : 'bg-slate-400'} ml-2`} />
              <span className="font-mono text-[11px] text-slate-500">Voice ({voiceResult ? 'Ready' : 'Skipped'})</span>
            </div>
          </div>

          {/* Final Multimodal Fusion Submission */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Voice</span>
            </button>
            <button
              type="button"
              onClick={handleFinalFusionSubmit}
              disabled={submitting}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-purple-500 hover:scale-105 active:scale-95 text-slate-950 font-manrope font-extrabold text-xs shadow-[0_0_24px_rgba(0,245,255,0.45)] hover:shadow-[0_0_32px_rgba(0,245,255,0.7)] transition-all flex items-center gap-2 sheen-active disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{submitting ? "Computing Late Fusion..." : "Compute Multimodal Synthesis"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assessment;
