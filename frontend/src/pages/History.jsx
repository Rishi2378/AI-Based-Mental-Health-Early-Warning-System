import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History as HistoryIcon, Trash2, Eye, Filter, RefreshCw, AlertCircle, Search, Download, CheckCircle2, Sliders, X, ArrowRight } from 'lucide-react';
import { fetchHistory, deleteAssessment, clearHistory } from '../services/api';
import SafetyDisclaimer from '../components/SafetyDisclaimer';
import LoadingState from '../components/LoadingState';

const History = () => {
  const [items, setItems] = useState([]);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchHistory(1, 100);
      setItems(res.assessments || []);
    } catch (err) {
      setError("Failed to fetch historical assessment records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteItem = async (id) => {
    if (!window.confirm(`Delete assessment record #${id}?`)) return;
    try {
      await deleteAssessment(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      alert("Failed to delete assessment record.");
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all historical assessment data? This action is permanent.")) return;
    try {
      await clearHistory();
      setItems([]);
    } catch (err) {
      alert("Failed to clear assessment history.");
    }
  };

  const exportAsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `mindguard_assessment_history_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredItems = items
    .filter((x) => filterCategory === 'ALL' || x.category === filterCategory)
    .filter((x) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const idMatch = String(x.id).includes(q);
      const catMatch = (x.category || '').toLowerCase().includes(q);
      const textEmo = (x.text_result?.emotion || '').toLowerCase().includes(q);
      const voiceEmo = (x.voice_result?.emotion || '').toLowerCase().includes(q);
      return idMatch || catMatch || textEmo || voiceEmo;
    });

  if (loading) return <LoadingState message="Fetching assessment history records..." />;

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      <SafetyDisclaimer />

      {/* Header */}
      <div className="spatial-glass rounded-3xl p-6 sm:p-8 space-y-3 border border-black/[0.06] dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 font-mono text-[11px] font-semibold uppercase mb-2">
              <HistoryIcon className="w-3.5 h-3.5" />
              <span>Audit & Telemetry Log</span>
            </div>
            <h1 className="font-manrope font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-slate-100 tracking-tight">
              Multimodal Assessment History
            </h1>
            <p className="font-manrope text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Review past early-warning indicator trends, detailed component scores, and wellness logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
            <button
              onClick={loadData}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full spatial-glass-subtle text-xs font-semibold text-slate-700 dark:text-slate-300 border border-black/[0.06] dark:border-white/10 shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>

            {items.length > 0 && (
              <>
                <button
                  onClick={exportAsJSON}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full spatial-glass-subtle text-xs font-semibold text-cyan-700 dark:text-cyan-300 border border-cyan-500/25 shadow-sm transition-all hover:scale-105 active:scale-95"
                  title="Download JSON Report"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>

                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full spatial-glass-subtle text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-500/25 shadow-sm transition-all hover:scale-105 active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="spatial-glass rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border border-black/[0.06] dark:border-white/10">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records by ID, category, or emotion..."
            className="w-full pl-10 pr-4 py-2 rounded-xl spatial-glass-well text-xs font-manrope text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="font-mono text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">Category:</span>
          {['ALL', 'LOW', 'MODERATE', 'ELEVATED'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${
                filterCategory === cat
                  ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 shadow-sm'
                  : 'spatial-glass-subtle text-slate-600 dark:text-slate-400 border border-black/[0.04] dark:border-white/5 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-3 shadow-sm animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* History Table */}
      <div className="spatial-glass rounded-3xl p-6 sm:p-7 border border-black/[0.06] dark:border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-black/[0.06] dark:border-white/10 text-slate-400 uppercase font-mono text-[10px]">
                <th className="py-3 px-3">ID</th>
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3">Text NLP</th>
                <th className="py-3 px-3">Voice Audio</th>
                <th className="py-3 px-3">Scale</th>
                <th className="py-3 px-3 font-bold text-slate-900 dark:text-slate-100">Overall</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04] dark:divide-white/5">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400 dark:text-slate-500 font-mono text-xs">
                    No matching assessment records found in history.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-black/[0.02] dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-500">#{item.id}</td>
                    <td className="py-3.5 px-3 font-mono text-slate-600 dark:text-slate-300">
                      {item.created_at ? new Date(item.created_at).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-cyan-600 dark:text-cyan-400">
                      {item.text_score !== null ? `${Math.round(item.text_score)}%` : <span className="text-slate-400">-</span>}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-purple-600 dark:text-purple-400">
                      {item.voice_score !== null ? `${Math.round(item.voice_score)}%` : <span className="text-slate-400">-</span>}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-teal-600 dark:text-teal-400">
                      {item.questionnaire_score !== null ? `${Math.round(item.questionnaire_score)}%` : <span className="text-slate-400">-</span>}
                    </td>
                    <td className="py-3.5 px-3 font-manrope font-extrabold text-sm text-slate-900 dark:text-slate-100">
                      {Math.round(item.overall_score || 0)}%
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${
                          item.category === 'ELEVATED'
                            ? 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/20'
                            : item.category === 'MODERATE'
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/20'
                            : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/20'
                        }`}
                      >
                        {item.category || 'LOW'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/result/${item.id}`}
                          className="p-1.5 rounded-xl spatial-glass-subtle text-cyan-600 dark:text-cyan-400 border border-black/[0.04] dark:border-white/10 hover:scale-105 active:scale-95 transition-all"
                          title="View Result Breakdown"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 rounded-xl spatial-glass-subtle text-slate-400 hover:text-rose-500 border border-black/[0.04] dark:border-white/10 hover:scale-105 active:scale-95 transition-all"
                          title="Delete Assessment Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
