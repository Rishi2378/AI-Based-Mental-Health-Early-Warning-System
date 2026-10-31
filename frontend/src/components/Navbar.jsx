import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Sparkles, Menu, X, LayoutDashboard, FileText, Mic, ClipboardList, Layers, History, Settings, Info, Home, Sun, Moon, CheckCircle2 } from 'lucide-react';
import SafetyDisclaimer from './SafetyDisclaimer';
import API from '../services/api';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { path: '/', label: 'Overview', icon: Home },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/assessment', label: 'Assessment Wizard', icon: Layers, highlight: true },
  { path: '/text', label: 'Text NLP', icon: FileText },
  { path: '/voice', label: 'Voice Lab', icon: Mic },
  { path: '/questionnaire', label: 'Questionnaire', icon: ClipboardList },
  { path: '/history', label: 'History', icon: History },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/about', label: 'About', icon: Info },
];

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(null);
  const location = useLocation();
  const { theme, toggleTheme, isDark } = useTheme();

  useEffect(() => {
    let isMounted = true;
    const checkHealth = async () => {
      try {
        await API.get('/health');
        if (isMounted) setBackendOnline(true);
      } catch (e) {
        if (isMounted) setBackendOnline(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 25000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 h-16 z-50 backdrop-blur-2xl transition-all duration-300 border-b border-black/[0.05] dark:border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.4)]"
      style={{ background: 'var(--nav-glass)' }}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo Emblem */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-white/20 dark:border-white/10 shadow-inner group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-manrope font-extrabold text-base tracking-tight leading-none text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              MindGuard <span className="bg-gradient-to-r from-cyan-500 via-sky-400 to-purple-500 dark:from-cyan-300 dark:via-teal-200 dark:to-purple-300 bg-clip-text text-transparent">AI</span>
            </span>
            <span className="font-mono text-[10px] text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mt-0.5 font-medium">
              v2.4 Multimodal
            </span>
          </div>
        </Link>

        {/* Center Desktop Navigation Capsule */}
        <nav className="hidden lg:flex items-center p-1 rounded-full spatial-glass-subtle shadow-sm border border-black/[0.05] dark:border-white/[0.08]">
          {navItems.slice(0, 6).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-sm border border-black/[0.04] dark:border-white/10'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/5'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Controls: Theme Slider + Telemetry + CTA */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Apple Vision Pro Interactive Theme Switcher Toggle */}
          <div
            onClick={toggleTheme}
            className="relative flex items-center p-1 rounded-full spatial-glass-subtle cursor-pointer border border-black/[0.08] dark:border-white/10 shadow-inner select-none transition-all hover:scale-105 active:scale-95"
            title={isDark ? "Switch to Light Theme" : "Switch to Spatial Dark Theme"}
          >
            {/* Sliding indicator pill */}
            <div
              className={`absolute top-1 bottom-1 w-7 rounded-full bg-white dark:bg-white/15 shadow-sm transition-transform duration-300 ease-out ${
                isDark ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
            {/* Sun Button */}
            <div className={`relative z-10 w-7 h-7 flex items-center justify-center rounded-full transition-colors duration-200 ${!isDark ? 'text-amber-500' : 'text-slate-400'}`}>
              <Sun className="w-4 h-4" />
            </div>
            {/* Moon Button */}
            <div className={`relative z-10 w-7 h-7 flex items-center justify-center rounded-full transition-colors duration-200 ${isDark ? 'text-cyan-400' : 'text-slate-400'}`}>
              <Moon className="w-4 h-4" />
            </div>
          </div>

          {/* Backend Telemetry Health Pill */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[11px] border transition-all ${
              backendOnline === true
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                : backendOnline === false
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                : 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            <span className="font-medium">{backendOnline ? "API Live" : backendOnline === false ? "Offline" : "Connecting"}</span>
          </div>

          {/* Start Assessment CTA Button */}
          <Link
            to="/assessment"
            className="relative group flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500 text-slate-950 font-manrope text-xs font-bold tracking-wide shadow-[0_0_24px_rgba(0,245,255,0.4)] hover:shadow-[0_0_32px_rgba(0,245,255,0.65)] hover:scale-[1.02] active:scale-95 transition-all sheen-active"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Launch Assessment</span>
            <span className="sm:hidden">Start</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl spatial-glass-subtle text-slate-700 dark:text-slate-200 border border-black/[0.08] dark:border-white/10"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <nav className="lg:hidden px-4 pt-3 pb-5 border-t border-black/[0.06] dark:border-white/[0.08] backdrop-blur-3xl bg-[var(--nav-glass)] shadow-2xl grid grid-cols-2 gap-2 animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/25'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-black/[0.04] dark:hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
};

export default Navbar;
