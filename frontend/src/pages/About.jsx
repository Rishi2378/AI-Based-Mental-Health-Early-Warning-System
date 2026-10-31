import React from 'react';
import { Info, ShieldAlert, Cpu, HeartHandshake, PhoneCall, ExternalLink, Code, Layers } from 'lucide-react';
import SafetyDisclaimer from '../components/SafetyDisclaimer';

const About = () => {
  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      <SafetyDisclaimer />

      {/* Header */}
      <div className="spatial-glass rounded-3xl p-6 sm:p-8 space-y-3 border border-black/[0.06] dark:border-white/10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 font-mono text-[11px] font-semibold uppercase mb-2">
          <Info className="w-3.5 h-3.5" />
          <span>Academic Specification</span>
        </div>
        <h1 className="font-manrope font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-slate-100 tracking-tight">
          About MindGuard AI & Safety Information
        </h1>
        <p className="font-manrope text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
          Complete academic methodology, architecture specifications, non-diagnostic philosophy, and crisis support resources.
        </p>
      </div>

      {/* Non-Diagnostic Philosophy Banner */}
      <div className="spatial-glass rounded-3xl p-6 sm:p-8 space-y-3 border border-cyan-500/30">
        <h3 className="font-manrope font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-cyan-500" />
          <span>Core Objective & Non-Diagnostic Principles</span>
        </h3>
        <p className="font-manrope text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          MindGuard AI is developed strictly as an academic research and early-warning demonstration system. Its objective is to explore how multimodal machine learning—combining Natural Language Processing of journal text, acoustic signal extraction of vocal recordings, and structured self-assessments—can identify patterns associated with elevated stress, anxiety-related vocabulary, and mood shifts.
        </p>
        <p className="font-mono text-xs font-semibold text-cyan-700 dark:text-cyan-300 pt-1">
          The system does NOT diagnose mental health conditions or make medical claims. Its outputs are non-diagnostic wellness indicators intended solely for informational self-reflection.
        </p>
      </div>

      {/* System Architecture Diagram */}
      <div className="spatial-glass rounded-3xl p-6 sm:p-8 space-y-4 border border-black/[0.06] dark:border-white/10">
        <h3 className="font-manrope font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-500" />
          <span>Multimodal System Architecture Topology</span>
        </h3>

        <div className="p-5 rounded-2xl spatial-glass-well text-xs font-mono text-slate-700 dark:text-slate-300 overflow-x-auto space-y-2 border border-black/[0.04] dark:border-white/5">
          <div className="text-cyan-600 dark:text-cyan-400 font-bold">User Input Layer</div>
          <div> ↓ (Text Journal, Voice Audio, Questionnaire)</div>
          <div className="text-purple-600 dark:text-purple-400 font-bold">React Frontend UI Layer (Vite + Tailwind CSS + Recharts)</div>
          <div> ↓ REST APIs (POST /api/text, /api/voice, /api/questionnaire)</div>
          <div className="text-teal-600 dark:text-teal-400 font-bold">Flask REST API Backend Layer</div>
          <div> ┌───────────────────────┬───────────────────────┬───────────────────────┐</div>
          <div> │ Text NLP Pipeline     │ Voice Signal Engine   │ Questionnaire Engine  │</div>
          <div> │ (TF-IDF + Ensembles)  │ (Librosa + RF ML)     │ (Scoring Algorithm)   │</div>
          <div> └───────────────────────┴───────────────────────┴───────────────────────┘</div>
          <div>                         ↓</div>
          <div className="text-cyan-600 dark:text-cyan-400 font-bold">Multimodal Fusion Engine: 0.40(Text) + 0.30(Voice) + 0.30(Scale)</div>
          <div>                         ↓</div>
          <div>Non-Diagnostic Indicator (LOW / MODERATE / ELEVATED) + Recommendation Engine</div>
          <div>                         ↓</div>
          <div>SQLite Database (SQLAlchemy ORM) → Analytics Dashboard & History</div>
        </div>
      </div>

      {/* Emergency Crisis Helplines */}
      <div className="spatial-glass rounded-3xl p-6 sm:p-8 space-y-4 border border-rose-500/30">
        <h3 className="font-manrope font-bold text-base text-rose-600 dark:text-rose-400 flex items-center gap-2">
          <PhoneCall className="w-5 h-5 text-rose-500" />
          <span>Immediate Emergency & Crisis Support Helplines</span>
        </h3>
        <p className="font-manrope text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          If you or someone you know is going through a severe crisis, experiencing thoughts of self-harm, or in immediate physical danger, please contact free confidential emergency support immediately:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <a
            href="https://988lifeline.org"
            target="_blank"
            rel="noreferrer"
            className="p-4 rounded-2xl spatial-glass-well border border-rose-500/20 flex items-center justify-between text-xs transition-all hover:scale-[1.02] shadow-sm"
          >
            <div>
              <span className="font-manrope font-bold text-slate-900 dark:text-slate-100 block">
                988 Suicide & Crisis Lifeline
              </span>
              <span className="text-cyan-600 dark:text-cyan-400 font-mono text-[11px]">
                Call or Text 988 (US & Canada)
              </span>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </a>

          <a
            href="https://www.crisistextline.org"
            target="_blank"
            rel="noreferrer"
            className="p-4 rounded-2xl spatial-glass-well border border-rose-500/20 flex items-center justify-between text-xs transition-all hover:scale-[1.02] shadow-sm"
          >
            <div>
              <span className="font-manrope font-bold text-slate-900 dark:text-slate-100 block">
                Crisis Text Line
              </span>
              <span className="text-cyan-600 dark:text-cyan-400 font-mono text-[11px]">
                Text HOME to 741741
              </span>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </a>

          <a
            href="https://www.iasp.info/resources/Crisis_Centres"
            target="_blank"
            rel="noreferrer"
            className="p-4 rounded-2xl spatial-glass-well border border-rose-500/20 flex items-center justify-between text-xs transition-all hover:scale-[1.02] shadow-sm"
          >
            <div>
              <span className="font-manrope font-bold text-slate-900 dark:text-slate-100 block">
                International Crisis Centres (IASP)
              </span>
              <span className="text-cyan-600 dark:text-cyan-400 font-mono text-[11px]">
                Worldwide Support Directory
              </span>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </a>

          <a
            href="https://www.thetrevorproject.org"
            target="_blank"
            rel="noreferrer"
            className="p-4 rounded-2xl spatial-glass-well border border-rose-500/20 flex items-center justify-between text-xs transition-all hover:scale-[1.02] shadow-sm"
          >
            <div>
              <span className="font-manrope font-bold text-slate-900 dark:text-slate-100 block">
                The Trevor Project
              </span>
              <span className="text-cyan-600 dark:text-cyan-400 font-mono text-[11px]">
                LGBTQ Youth Crisis Line 1-866-488-7386
              </span>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-400" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;
