import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Layers, TrendingUp, Calendar, Eye, RefreshCw, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';
import { fetchDashboardData } from '../services/api';
import MetricCard from '../components/MetricCard';
import StressIndicator from '../components/StressIndicator';
import EmotionChart from '../components/EmotionChart';
import TrendChart from '../components/TrendChart';
import SafetyDisclaimer from '../components/SafetyDisclaimer';
import LoadingState from '../components/LoadingState';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchDashboardData();
      setData(res);
    } catch (err) {
      setError("Failed to load dashboard statistics from backend API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) return <LoadingState message="Loading MindGuard AI analytics..." />;

  if (error) {
    return (
      <div className="spatial-glass p-8 rounded-3xl text-center space-y-4 my-6 border border-rose-500/30">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="text-lg font-bold font-manrope text-slate-900 dark:text-slate-100">Dashboard Unavailable</h3>
        <p className="text-xs text-rose-600 dark:text-rose-300 font-mono">{error}</p>
        <button
          onClick={loadDashboard}
          className="px-5 py-2 rounded-full bg-slate-900 dark:bg-white text-xs font-semibold text-white dark:text-slate-900 shadow-sm"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const currentScore = data?.current_indicator?.score || 0;
  const currentCategory = data?.current_indicator?.category || 'LOW';
  const isCrisis = data?.current_indicator?.is_crisis || false;

  return (
    <div className="space-y-8 pb-16">
      <SafetyDisclaimer />

      {/* Header */}
      <div className="spatial-glass rounded-3xl p-6 sm:p-8 space-y-3 border border-black/[0.06] dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-300 font-mono text-[11px] font-semibold uppercase mb-2">
              <Activity className="w-3.5 h-3.5" />
              <span>Real-Time Clinical Telemetry</span>
            </div>
            <h1 className="font-manrope font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-slate-100 tracking-tight">
              Wellness Analytics Dashboard
            </h1>
            <p className="font-manrope text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Real-time multimodal early warning indicator monitoring, stress trajectories, and emotion distribution.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto">
            <button
              onClick={loadDashboard}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full spatial-glass-subtle text-xs font-semibold text-slate-700 dark:text-slate-300 border border-black/[0.06] dark:border-white/10 shadow-sm transition-all hover:scale-105 active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
            <Link
              to="/assessment"
              className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-manrope font-bold text-xs shadow-[0_0_20px_rgba(0,245,255,0.35)] hover:shadow-[0_0_28px_rgba(0,245,255,0.55)] transition-all hover:scale-105 active:scale-95 sheen-active"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Assessment</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Assessments"
          value={data?.total_assessments || 0}
          subtitle="Recorded in database"
          icon={Layers}
          color="indigo"
        />
        <MetricCard
          title="Current Overall Score"
          value={`${currentScore}/100`}
          subtitle="Weighted Multimodal Index"
          icon={Activity}
          color={currentCategory === 'ELEVATED' ? 'rose' : currentCategory === 'MODERATE' ? 'amber' : 'emerald'}
          badge={currentCategory}
        />
        <MetricCard
          title="Elevated Indicators"
          value={data?.category_counts?.ELEVATED || 0}
          subtitle="Historical elevated count"
          icon={AlertTriangle}
          color="rose"
        />
        <MetricCard
          title="Balanced State Count"
          value={data?.category_counts?.LOW || 0}
          subtitle="Homeostatic assessments"
          icon={TrendingUp}
          color="emerald"
        />
      </div>

      {/* Main Grid: Stress Indicator Gauge + Emotion Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <StressIndicator score={currentScore} category={currentCategory} isCrisis={isCrisis} />
        </div>

        <div className="lg:col-span-2 spatial-glass rounded-3xl p-6 sm:p-7 space-y-4 border border-black/[0.06] dark:border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="font-manrope font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-500" />
              <span>Multimodal Stress Indicator Trajectory</span>
            </h3>
            <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
              Chronological History
            </span>
          </div>
          <TrendChart data={data?.trend_data || []} />
        </div>
      </div>

      {/* Emotion Distribution + Recent Assessments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="spatial-glass rounded-3xl p-6 sm:p-7 space-y-4 border border-black/[0.06] dark:border-white/10">
          <h3 className="font-manrope font-bold text-base text-slate-900 dark:text-slate-100">
            Emotion Distribution
          </h3>
          <p className="font-manrope text-xs text-slate-500 dark:text-slate-400">
            Aggregated from text & speech acoustic neural models
          </p>
          <EmotionChart data={data?.emotion_distribution || {}} />
        </div>

        {/* Recent Assessments Table */}
        <div className="lg:col-span-2 spatial-glass rounded-3xl p-6 sm:p-7 space-y-4 border border-black/[0.06] dark:border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="font-manrope font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-500" />
              <span>Recent Assessment Records</span>
            </h3>
            <Link
              to="/history"
              className="text-xs font-mono font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>View Full History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-black/[0.06] dark:border-white/10 text-slate-400 uppercase font-mono text-[10px]">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04] dark:divide-white/5">
                {data?.recent_assessments && data.recent_assessments.length > 0 ? (
                  data.recent_assessments.map((item) => (
                    <tr key={item.id} className="hover:bg-black/[0.02] dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500">#{item.id}</td>
                      <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-300">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
                      </td>
                      <td className="py-3 px-3 font-manrope font-bold text-slate-900 dark:text-slate-100">
                        {Math.round(item.overall_score || 0)}%
                      </td>
                      <td className="py-3 px-3">
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
                      <td className="py-3 px-3 text-right">
                        <Link
                          to={`/result/${item.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full spatial-glass-subtle text-cyan-600 dark:text-cyan-400 font-mono text-[11px] font-semibold border border-black/[0.04] dark:border-white/10 hover:scale-105 active:scale-95 transition-all"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-slate-400 font-mono text-xs">
                      No assessment records found. Run an assessment to generate analytics.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
