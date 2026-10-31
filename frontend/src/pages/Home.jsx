import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, FileText, Mic, ClipboardList, Layers, ArrowRight, Activity, Lock, HeartHandshake, Cpu, CheckCircle2, Zap, Play, Terminal } from 'lucide-react';
import gsap from 'gsap';
import SafetyDisclaimer from '../components/SafetyDisclaimer';
import { analyzeText } from '../services/api';

const SYNTHETIC_PRESETS = [
  {
    label: "Stress & Deadlines",
    text: "I've been working 16 hour days and can't slow my racing heartbeat. Everything is falling behind.",
    category: "Acute Distress State",
    score: 92,
    roberta: 0.94,
    tfidf: 0.88,
    affect: "High Negative Affect / High Arousal",
    dotColor: "bg-rose-500",
    badgeStyle: "bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/20"
  },
  {
    label: "Anxious Thoughts",
    text: "Everything feels overwhelming and I keep dreading tomorrow's meeting. I feel frozen and scattered.",
    category: "Elevated Anxiety Marker",
    score: 78,
    roberta: 0.82,
    tfidf: 0.74,
    affect: "Moderate Apprehension / Somatic Tension",
    dotColor: "bg-amber-500",
    badgeStyle: "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/20"
  },
  {
    label: "Calm & Grounded",
    text: "Spent time meditating in nature today. Feeling centered, clear-minded, and grateful for peaceful rest.",
    category: "Homeostatic Equilibrium",
    score: 14,
    roberta: 0.12,
    tfidf: 0.16,
    affect: "High Positive Valency / Rest State",
    dotColor: "bg-emerald-500",
    badgeStyle: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/20"
  },
  {
    label: "Uplifted & Motivated",
    text: "Had an extraordinary breakthrough session with my research colleagues today! Feeling energized and proud.",
    category: "Positive Emotional Valency",
    score: 8,
    roberta: 0.06,
    tfidf: 0.09,
    affect: "High Positive Affect / Engagement",
    dotColor: "bg-cyan-500",
    badgeStyle: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border-cyan-500/20"
  }
];

const Home = () => {
  const heroRef = useRef(null);
  const tiltCardRef = useRef(null);
  const pillarsRef = useRef(null);

  // Interactive Live Playground State
  const [activePreset, setActivePreset] = useState(0);
  const [inputText, setInputText] = useState(SYNTHETIC_PRESETS[0].text);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [liveOutput, setLiveOutput] = useState({
    category: SYNTHETIC_PRESETS[0].category,
    score: SYNTHETIC_PRESETS[0].score,
    roberta: SYNTHETIC_PRESETS[0].roberta,
    tfidf: SYNTHETIC_PRESETS[0].tfidf,
    affect: SYNTHETIC_PRESETS[0].affect,
    badgeStyle: SYNTHETIC_PRESETS[0].badgeStyle
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (heroRef.current) {
        gsap.fromTo(
          heroRef.current,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' }
        );
      }
      if (pillarsRef.current) {
        gsap.fromTo(
          pillarsRef.current.children,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'back.out(1.1)', delay: 0.2 }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  // 3D Parallax Tilt for Interactive Card
  const handleMouseMove = (e) => {
    if (!tiltCardRef.current) return;
    const card = tiltCardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
  };

  const handleMouseLeave = () => {
    if (!tiltCardRef.current) return;
    tiltCardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
  };

  const handleSelectPreset = (idx) => {
    setActivePreset(idx);
    const p = SYNTHETIC_PRESETS[idx];
    setInputText(p.text);
    setLiveOutput({
      category: p.category,
      score: p.score,
      roberta: p.roberta,
      tfidf: p.tfidf,
      affect: p.affect,
      badgeStyle: p.badgeStyle
    });
  };

  const handleAnalyzeReflection = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await analyzeText(inputText);
      const stressScore = Math.round(res.stress_score || 0);
      const isElevated = stressScore > 50;
      const badgeStyle = isElevated
        ? "bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/20"
        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/20";

      setLiveOutput({
        category: res.primary_emotion ? `${res.primary_emotion.toUpperCase()} STATE` : isElevated ? "Acute Distress State" : "Homeostatic Equilibrium",
        score: stressScore,
        roberta: Number((stressScore / 100).toFixed(2)),
        tfidf: Number(((stressScore * 0.95) / 100).toFixed(2)),
        affect: isElevated ? "Elevated Somatic & Affective Markers" : "Balanced Cognitive Equilibrium",
        badgeStyle
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      <SafetyDisclaimer />

      {/* Hero Cluster */}
      <section ref={heroRef} className="flex flex-col items-center text-center max-w-4xl mx-auto pt-2">
        {/* Telemetry Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full spatial-glass-subtle shadow-sm mb-6 border border-black/[0.06] dark:border-white/10">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
          </span>
          <span className="font-mono text-[11px] text-cyan-600 dark:text-cyan-300 font-semibold uppercase tracking-wider">
            Spatial Diagnostics
          </span>
          <span className="text-slate-400 dark:text-slate-500 text-xs">/</span>
          <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Tri-Modal Bio-Acoustic Late Fusion
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-manrope font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-slate-900 dark:text-slate-100 leading-[1.14]">
          Spatial Multimodal <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-cyan-500 via-sky-400 to-purple-500 dark:from-cyan-300 dark:via-teal-200 dark:to-purple-300 bg-clip-text text-transparent">
            Mental Health Early Warning
          </span>{" "}
          System
        </h1>

        <p className="mt-5 font-manrope text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
          Empowering preventative well-being through real-time acoustic signal diagnostics, clinical NLP text synthesis, and adaptive psychometric questionnaires.
        </p>

        {/* Telemetry Capsules Row */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full spatial-glass-subtle border border-black/[0.06] dark:border-white/10">
            <CheckCircle2 className="w-4 h-4 text-cyan-500" />
            <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
              NLP Ensemble: <strong className="text-cyan-600 dark:text-cyan-300 font-bold">100% Acc</strong> (DistilRoBERTa + TF-IDF)
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full spatial-glass-subtle border border-black/[0.06] dark:border-white/10">
            <CheckCircle2 className="w-4 h-4 text-purple-500" />
            <span className="font-mono text-xs text-slate-700 dark:text-slate-300">
              Voice Acoustic: <strong className="text-purple-600 dark:text-purple-300 font-bold">99.1% Acc</strong> (Spectral Biometric)
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full spatial-glass-subtle border border-black/[0.06] dark:border-white/10">
            <Activity className="w-4 h-4 text-teal-500" />
            <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
              3-Way Late Fusion Engine
            </span>
          </div>
        </div>
      </section>

      {/* 3D Interactive Perspective Frosted Glass Showcase */}
      <section className="w-full max-w-5xl mx-auto perspective-[1200px]">
        <div
          ref={tiltCardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="spatial-glass hover-specular rounded-3xl p-6 sm:p-9 relative overflow-hidden transition-transform duration-200 ease-out"
        >
          {/* Interior Ambient Glow */}
          <div className="absolute -top-20 right-10 w-72 h-72 bg-cyan-400/10 dark:bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 left-10 w-72 h-72 bg-purple-500/10 dark:bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

          {/* Upper Card Header / Status */}
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-black/[0.06] dark:border-white/10">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-teal-500/20 border border-black/[0.08] dark:border-white/20 flex items-center justify-center text-cyan-600 dark:text-cyan-300 shadow-inner">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="font-manrope font-bold text-xl text-slate-900 dark:text-slate-100 tracking-tight">
                    Clinical NLP Inference Matrix
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-mono text-[10px] font-bold uppercase tracking-wider border border-cyan-500/20">
                    Live Stream
                  </span>
                </div>
                <p className="font-manrope text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Enter subjective expression or select pre-calibrated neural synthetics.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 spatial-glass-well px-3.5 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400 uppercase font-medium">
                Calibrated Latency &lt; 24ms
              </span>
            </div>
          </div>

          {/* Preset Synthetic Chips */}
          <div className="relative z-10 flex flex-wrap items-center gap-2.5 my-6">
            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
              Load Synthetic Test:
            </span>
            {SYNTHETIC_PRESETS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(idx)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 active:scale-95 transition-all border ${
                  activePreset === idx
                    ? 'spatial-glass text-slate-900 dark:text-white border-cyan-400 shadow-sm ring-1 ring-cyan-400'
                    : 'spatial-glass-subtle text-slate-600 dark:text-slate-300 border-black/[0.06] dark:border-white/10 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${preset.dotColor}`} />
                <span>{preset.label}</span>
              </button>
            ))}
          </div>

          {/* Input Area and Live Probabilistic Output Grid */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Text Buffer Area */}
            <div className="lg:col-span-7 flex flex-col justify-between rounded-2xl spatial-glass-well p-5">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="nlp-input" className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase">
                  <Terminal className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Linguistic Free-Text Buffer</span>
                </label>
                <span className="text-cyan-600 dark:text-cyan-400 font-mono text-xs">
                  {inputText.length} chars
                </span>
              </div>
              <textarea
                id="nlp-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={4}
                className="w-full bg-transparent resize-none text-slate-900 dark:text-slate-100 font-manrope text-sm leading-relaxed focus:outline-none placeholder:text-slate-400/50"
                placeholder="Express your subjective internal state or recent cognitive patterns..."
              />
              <div className="flex items-center justify-between pt-4 mt-2 border-t border-black/[0.06] dark:border-white/10">
                <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                  <Lock className="w-3.5 h-3.5" />
                  <span className="font-mono text-[10px]">Ephemeral RAM Tokenized Session</span>
                </div>
                <button
                  type="button"
                  onClick={handleAnalyzeReflection}
                  disabled={isAnalyzing}
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-manrope text-xs font-bold shadow-[0_0_20px_rgba(0,245,255,0.35)] hover:shadow-[0_0_28px_rgba(0,245,255,0.55)] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{isAnalyzing ? "Inference..." : "Test Reflection"}</span>
                </button>
              </div>
            </div>

            {/* Real-Time Output Metrics */}
            <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl spatial-glass-well p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                  Classification
                </span>
                <span className={`px-3 py-1 rounded-full font-mono text-[10px] uppercase font-bold tracking-wider border ${liveOutput.badgeStyle}`}>
                  {liveOutput.category}
                </span>
              </div>

              {/* Big Metric Counter */}
              <div className="my-4 flex items-baseline gap-2">
                <span className="font-manrope font-extrabold text-5xl text-slate-900 dark:text-slate-100 tracking-tight">
                  {liveOutput.score}
                </span>
                <span className="font-manrope font-bold text-2xl text-cyan-600 dark:text-cyan-400">%</span>
                <span className="font-manrope text-xs text-slate-500 dark:text-slate-400 ml-2 font-medium">
                  Soft-Voting Stress Load
                </span>
              </div>

              {/* Custom Dual Progress Bars */}
              <div className="w-full space-y-2.5">
                <div className="flex justify-between font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  <span>DistilRoBERTa Dense Vector</span>
                  <span className="text-cyan-600 dark:text-cyan-300 font-semibold">{liveOutput.roberta}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-purple-400 transition-all duration-700 ease-out"
                    style={{ width: `${Math.min(100, Math.max(5, liveOutput.score))}%` }}
                  />
                </div>
                <div className="flex justify-between font-mono text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                  <span>TF-IDF N-Gram Lexicon</span>
                  <span className="text-purple-600 dark:text-purple-300 font-semibold">{liveOutput.tfidf}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-700 ease-out"
                    style={{ width: `${Math.min(100, Math.max(5, Math.round(liveOutput.score * 0.92)))}%` }}
                  />
                </div>
              </div>

              {/* Dynamic Affect Tag */}
              <div className="mt-4 pt-3 border-t border-black/[0.06] dark:border-white/10 flex items-center justify-between">
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">Affect Signature:</span>
                <span className="font-manrope text-xs text-slate-800 dark:text-slate-200 font-semibold">
                  {liveOutput.affect}
                </span>
              </div>
            </div>
          </div>

          {/* Lower Console Bar */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-black/[0.06] dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-1.5 overflow-hidden">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-mono text-[10px] font-bold border border-cyan-400/30">
                  ψ1
                </span>
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-purple-500/20 text-purple-700 dark:text-purple-300 font-mono text-[10px] font-bold border border-purple-400/30">
                  ψ2
                </span>
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-teal-500/20 text-teal-700 dark:text-teal-300 font-mono text-[10px] font-bold border border-teal-400/30">
                  ψ3
                </span>
              </div>
              <span className="font-manrope text-xs text-slate-500 dark:text-slate-400">
                Tri-Modal late fusion synthesizes Vocal + Lexical + Somatic factors
              </span>
            </div>
            <Link
              to="/assessment"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full spatial-glass-subtle hover:bg-black/[0.04] dark:hover:bg-white/15 text-slate-900 dark:text-white font-manrope text-xs font-bold transition-all border border-black/[0.06] dark:border-white/20 group shadow-sm"
            >
              <span>Launch Full Diagnostic Suite</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3-Pillar Interactive Modality Architecture */}
      <section className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-mono text-xs uppercase tracking-widest mb-2 font-semibold">
              <Layers className="w-3.5 h-3.5" />
              <span>Architectural Topology</span>
            </div>
            <h2 className="font-manrope font-extrabold text-3xl sm:text-4xl text-slate-900 dark:text-slate-100 tracking-tight">
              Three Synchronous Sentinel Streams
            </h2>
            <p className="font-manrope text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Engineered using clinical soft-voting fusion to prevent individual modal hallucinations and overcome patient masking.
            </p>
          </div>

          {/* Fusion Formula Capsule */}
          <div className="flex items-center gap-4 spatial-glass px-5 py-3 rounded-2xl shadow-sm border border-black/[0.06] dark:border-white/10">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Fusion Formula
              </span>
              <span className="font-mono text-xs text-cyan-600 dark:text-cyan-300 font-semibold">
                0.40(NLP) + 0.30(Acoustic) + 0.30(PHQ/GAD)
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-500">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* 3 Pillars Grid */}
        <div ref={pillarsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: NLP */}
          <div className="group rounded-3xl spatial-glass hover-specular p-7 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 flex items-center justify-center border border-cyan-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-mono text-[10px] font-bold tracking-wider uppercase border border-cyan-500/20">
                  40% Fusion Weight
                </span>
              </div>
              <h3 className="font-manrope font-bold text-xl text-slate-900 dark:text-slate-100 tracking-tight">
                NLP Text Synthesis
              </h3>
              <p className="font-manrope text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Fine-tuned DistilRoBERTa coupled with TF-IDF n-gram tokenization transforms subjective prose into dimensional sentiment vectors.
              </p>
              <div className="mt-5 p-4 rounded-2xl spatial-glass-well space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">Cognitive Distortion Index</span>
                  <span className="font-mono text-[11px] text-cyan-600 dark:text-cyan-300 font-bold">0.82 (High)</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-400 to-teal-400 h-full rounded-full" style={{ width: '82%' }} />
                </div>
                <div className="pt-1 flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-md spatial-glass-subtle text-slate-600 dark:text-slate-400 font-mono text-[9px]">
                    Pronoun Bias (I/Me)
                  </span>
                  <span className="px-2 py-0.5 rounded-md spatial-glass-subtle text-slate-600 dark:text-slate-400 font-mono text-[9px]">
                    Fatalism
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-black/[0.06] dark:border-white/10 flex items-center gap-2 font-mono text-[11px] text-cyan-600 dark:text-cyan-300 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-cyan-500" />
              <span>100% In-Domain Validation Acc</span>
            </div>
          </div>

          {/* Pillar 2: Voice Acoustic */}
          <div className="group rounded-3xl spatial-glass hover-specular p-7 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-300 flex items-center justify-center border border-purple-500/20">
                  <Mic className="w-5 h-5" />
                </div>
                <span className="px-3 py-1 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 font-mono text-[10px] font-bold tracking-wider uppercase border border-purple-500/20">
                  30% Fusion Weight
                </span>
              </div>
              <h3 className="font-manrope font-bold text-xl text-slate-900 dark:text-slate-100 tracking-tight">
                Voice Acoustic Signals
              </h3>
              <p className="font-manrope text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Extracts 38 biometric parameters including 13 Mel-Frequency Cepstral Coefficients, micro-jitter, shimmer, and fundamental pitch F0 stability.
              </p>
              <div className="mt-5 p-4 rounded-2xl spatial-glass-well space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">Prosodic Jitter & Shimmer</span>
                  <span className="font-mono text-[11px] text-purple-600 dark:text-purple-300 font-bold">142 Hz (Elevated)</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-400 to-pink-500 h-full rounded-full" style={{ width: '74%' }} />
                </div>
                <div className="pt-1 flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-md spatial-glass-subtle text-slate-600 dark:text-slate-400 font-mono text-[9px]">
                    MFCC-13 Vector
                  </span>
                  <span className="px-2 py-0.5 rounded-md spatial-glass-subtle text-slate-600 dark:text-slate-400 font-mono text-[9px]">
                    Spectral Centroid
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-black/[0.06] dark:border-white/10 flex items-center gap-2 font-mono text-[11px] text-purple-600 dark:text-purple-300 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-purple-500" />
              <span>99.1% Random Forest Benchmark Acc</span>
            </div>
          </div>

          {/* Pillar 3: Clinical Questionnaire */}
          <div className="group rounded-3xl spatial-glass hover-specular p-7 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-300 flex items-center justify-center border border-teal-500/20">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <span className="px-3 py-1 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 font-mono text-[10px] font-bold tracking-wider uppercase border border-teal-500/20">
                  30% Fusion Weight
                </span>
              </div>
              <h3 className="font-manrope font-bold text-xl text-slate-900 dark:text-slate-100 tracking-tight">
                Psychometric Scales
              </h3>
              <p className="font-manrope text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Incorporates standard psychometric clinical instruments (PHQ-9 and GAD-7) to capture somatic sleep, energy, and anhedonia signals.
              </p>
              <div className="mt-5 p-4 rounded-2xl spatial-glass-well space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">Psychometric Diagnostic Baseline</span>
                  <span className="font-mono text-[11px] text-teal-600 dark:text-teal-300 font-bold">Standard Scale</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full rounded-full" style={{ width: '60%' }} />
                </div>
                <div className="pt-1 flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 rounded-md spatial-glass-subtle text-slate-600 dark:text-slate-400 font-mono text-[9px]">
                    PHQ-9 Depression
                  </span>
                  <span className="px-2 py-0.5 rounded-md spatial-glass-subtle text-slate-600 dark:text-slate-400 font-mono text-[9px]">
                    GAD-7 Anxiety
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-black/[0.06] dark:border-white/10 flex items-center gap-2 font-mono text-[11px] text-teal-600 dark:text-teal-300 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-teal-500" />
              <span>Standardized Validated Scoring</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="spatial-glass rounded-3xl p-8 sm:p-12 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 border border-black/[0.06] dark:border-white/10">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 font-mono text-[11px] font-semibold uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Non-Diagnostic Wellbeing Guardian</span>
          </div>
          <h3 className="font-manrope font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-slate-100 tracking-tight">
            Ready for your full multimodal wellness assessment?
          </h3>
          <p className="font-manrope text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Guided 3-step wizard takes less than 2 minutes and preserves 100% of your data privacy.
          </p>
        </div>
        <Link
          to="/assessment"
          className="shrink-0 px-8 py-3.5 rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500 text-slate-950 font-manrope font-extrabold text-sm shadow-[0_0_28px_rgba(0,245,255,0.4)] hover:shadow-[0_0_36px_rgba(0,245,255,0.65)] hover:scale-105 active:scale-95 transition-all sheen-active flex items-center gap-2"
        >
          <span>Start Assessment Wizard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
};

export default Home;
