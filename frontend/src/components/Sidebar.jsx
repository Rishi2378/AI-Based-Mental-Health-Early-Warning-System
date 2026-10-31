import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Mic,
  ClipboardList,
  Layers,
  History,
  Settings,
  Info,
  Home
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/assessment', label: 'Multimodal Assessment', icon: Layers, highlight: true },
  { path: '/text', label: 'Text NLP', icon: FileText },
  { path: '/voice', label: 'Voice Processing', icon: Mic },
  { path: '/questionnaire', label: 'Questionnaire', icon: ClipboardList },
  { path: '/history', label: 'Analysis History', icon: History },
  { path: '/settings', label: 'Settings & Privacy', icon: Settings },
  { path: '/about', label: 'About & Safety', icon: Info },
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-[#090d16]/90 border-r border-slate-800/60 p-4 hidden md:flex flex-col justify-between shrink-0 min-h-[calc(100vh-61px)]">
      <div className="space-y-1.5">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
          System Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? item.highlight
                      ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-glow-indigo'
                      : 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="pt-4 border-t border-slate-800/60 text-xs text-slate-400 space-y-2">
        <div className="flex items-center justify-between px-2">
          <span>Engine Status</span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Ready
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/50 text-[11px] text-slate-400">
          Non-diagnostic academic demonstration version v1.0.
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
