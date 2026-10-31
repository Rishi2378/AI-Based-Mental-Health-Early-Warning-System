import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Assessment from './pages/Assessment';
import TextAnalysis from './pages/TextAnalysis';
import VoiceAnalysis from './pages/VoiceAnalysis';
import Questionnaire from './pages/Questionnaire';
import Result from './pages/Result';
import History from './pages/History';
import Settings from './pages/Settings';
import About from './pages/About';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-800 dark:text-slate-100 flex flex-col relative overflow-x-hidden selection:bg-indigo-500/25 selection:text-indigo-600 dark:selection:bg-cyan-500/30 dark:selection:text-cyan-200 transition-colors duration-300">
          
          {/* Ambient Spatial Background Halos */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Dark Mode Glow Halos */}
            <div className="dark:opacity-100 opacity-0 transition-opacity duration-700">
              <div className="absolute -top-[15%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.12)_0%,transparent_70%)] blur-3xl animate-pulse-glow" />
              <div className="absolute top-[25%] -right-[12%] w-[55vw] h-[55vw] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.1)_0%,transparent_65%)] blur-3xl" />
              <div className="absolute -bottom-[20%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.08)_0%,transparent_70%)] blur-3xl" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
            </div>

            {/* Light Mode Glow Halos */}
            <div className="dark:opacity-0 opacity-100 transition-opacity duration-700">
              <div className="absolute -top-[12%] -left-[8%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.1)_0%,transparent_65%)] blur-3xl" />
              <div className="absolute top-[28%] -right-[10%] w-[55vw] h-[55vw] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.12)_0%,transparent_65%)] blur-3xl" />
              <div className="absolute -bottom-[15%] left-[25%] w-[45vw] h-[45vw] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.08)_0%,transparent_65%)] blur-3xl" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(15,23,42,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.025)_1px,transparent_1px)] bg-[size:4rem_4rem]" />
            </div>
          </div>

          {/* Navigation Bar */}
          <Navbar />

          {/* Main Application Content */}
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 relative z-10">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/assessment" element={<Assessment />} />
              <Route path="/text" element={<TextAnalysis />} />
              <Route path="/voice" element={<VoiceAnalysis />} />
              <Route path="/questionnaire" element={<Questionnaire />} />
              <Route path="/result" element={<Result />} />
              <Route path="/result/:id" element={<Result />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/about" element={<About />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
