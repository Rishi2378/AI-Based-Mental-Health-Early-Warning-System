import React, { useState, useEffect } from 'react';
import { ClipboardList, Sparkles, AlertCircle, CheckCircle, Zap } from 'lucide-react';
import { fetchQuestionnaire, analyzeQuestionnaire } from '../services/api';
import QuestionnaireCard from '../components/QuestionnaireCard';
import SafetyDisclaimer from '../components/SafetyDisclaimer';
import LoadingState from '../components/LoadingState';

const Questionnaire = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        const res = await fetchQuestionnaire();
        setQuestions(res.questions || []);
      } catch (err) {
        setError("Failed to load questionnaire questions.");
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, []);

  const handleOptionSelect = (qid, value) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const handleQuickFill = () => {
    const filled = {};
    questions.forEach((q) => {
      filled[q.id] = 1;
    });
    setAnswers(filled);
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      setError(`Please answer all ${questions.length} questions before submitting.`);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await analyzeQuestionnaire(answers);
      setResult(res.result);
    } catch (err) {
      setError("Failed to submit questionnaire answers.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState message="Loading structured self-assessment questionnaire..." />;

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      <SafetyDisclaimer />

      {/* Header */}
      <div className="spatial-glass rounded-3xl p-6 sm:p-8 space-y-3 border border-black/[0.06] dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-300 font-mono text-[11px] font-semibold uppercase mb-2">
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Standard Clinical Instruments</span>
            </div>
            <h1 className="font-manrope font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-slate-100 tracking-tight">
              Structured Self-Assessment Questionnaire
            </h1>
            <p className="font-manrope text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Complete the 10-item wellness self-assessment based on validated PHQ-9 & GAD-7 standards to calculate a non-diagnostic stress indicator across key functional domains.
            </p>
          </div>

          <div className="flex items-center gap-2 spatial-glass-well px-3.5 py-1.5 rounded-full shrink-0 self-start sm:self-auto">
            <span className="font-mono text-xs text-slate-600 dark:text-slate-300 font-semibold">
              {Object.keys(answers).length} / {questions.length} Answered
            </span>
          </div>
        </div>
      </div>

      <QuestionnaireCard
        questions={questions}
        answers={answers}
        onOptionSelect={handleOptionSelect}
        onQuickFill={handleQuickFill}
        onReset={() => setAnswers({})}
      />

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-3 shadow-sm animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={submitting || Object.keys(answers).length < questions.length}
          className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-500 hover:from-teal-300 hover:to-cyan-300 text-slate-950 font-manrope font-extrabold text-xs shadow-[0_0_24px_rgba(20,184,166,0.35)] hover:shadow-[0_0_32px_rgba(20,184,166,0.55)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none sheen-active"
        >
          <Sparkles className="w-4 h-4" />
          <span>Submit Questionnaire ({Object.keys(answers).length}/{questions.length})</span>
        </button>
      </div>

      {/* Result Display */}
      {result && (
        <div className="spatial-glass rounded-3xl p-6 sm:p-8 space-y-4 border border-black/[0.06] dark:border-white/10 animate-fadeIn">
          <div className="flex items-center justify-between pb-4 border-b border-black/[0.06] dark:border-white/10">
            <h3 className="font-manrope font-bold text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-teal-500" />
              <span>Questionnaire Result Summary</span>
            </h3>
            <span className="px-3.5 py-1 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 font-mono text-xs font-bold uppercase border border-teal-500/20">
              {result.category}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl spatial-glass-well space-y-1">
              <span className="font-mono text-xs text-slate-500 uppercase font-semibold">Normalized Scale Score</span>
              <div className="my-2 flex items-baseline gap-2">
                <span className="font-manrope font-extrabold text-4xl text-slate-900 dark:text-slate-100">
                  {Math.round(result.score || 0)}
                </span>
                <span className="font-manrope font-bold text-xl text-teal-600 dark:text-teal-400">%</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl spatial-glass-well space-y-1">
              <span className="font-mono text-xs text-slate-500 uppercase font-semibold">Raw Questionnaire Sum</span>
              <div className="my-2 flex items-baseline gap-2">
                <span className="font-manrope font-extrabold text-4xl text-slate-900 dark:text-slate-100">
                  {result.raw_score || 0}
                </span>
                <span className="font-mono text-xs text-slate-400">/ {result.max_possible_score || 30} max</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questionnaire;
