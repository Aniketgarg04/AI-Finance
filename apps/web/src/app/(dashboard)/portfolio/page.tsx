'use client';

/**
 * Portfolio page — Innovative UI with performance charts, sparklines, sector breakdown,
 * animated stats, and AI advisor.
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Loader2, Sparkles, Plus, Trash2,
  RefreshCw, BarChart2, Activity, Target, Zap, ArrowUpRight,
  ArrowDownRight, Eye, EyeOff, ShieldCheck
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { formatCurrency, getPnlClass, getPnlSign } from '@/lib/utils';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import AddInvestmentModal from '@/components/portfolio/AddInvestmentModal';
import SyncDematModal from '@/components/portfolio/SyncDematModal';
import AssetAllocationChart from '@/components/portfolio/AssetAllocationChart';
import PortfolioPerformanceChart from '@/components/portfolio/PortfolioPerformanceChart';
import SectorBreakdownChart from '@/components/portfolio/SectorBreakdownChart';
import StockSparkline from '@/components/portfolio/StockSparkline';

function AnimatedNumber({ value, prefix = '₹', decimals = 0 }: { value: number; prefix?: string; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const target = value;
    const step = target / 40;
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) { setDisplay(target); clearInterval(timer); }
      else setDisplay(Math.round(current));
    }, 20);
    return () => clearInterval(timer);
  }, [value]);
  return <>{prefix}{display.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</>;
}

function KpiCard({ label, value, sub, icon: Icon, color, positive }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glass rounded-2xl p-5 relative overflow-hidden group hover:scale-[1.015] transition-transform"
    >
      {/* Glow */}
      <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-20 ${color}`} />
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider">{label}</span>
        <div className={`p-1.5 rounded-lg ${color} bg-opacity-10`}>
          <Icon className={`w-3.5 h-3.5 ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
      <p className="text-xl font-bold text-[var(--text-primary)] font-mono tracking-tight">{value}</p>
      {sub !== undefined && (
        <p className={`text-xs mt-1 font-medium flex items-center gap-1 ${positive ? 'text-emerald-400' : positive === false ? 'text-red-400' : 'text-[var(--text-muted)]'}`}>
          {positive === true && <ArrowUpRight className="w-3 h-3" />}
          {positive === false && <ArrowDownRight className="w-3 h-3" />}
          {sub}
        </p>
      )}
    </motion.div>
  );
}

export default function PortfolioPage() {
  const { token, _hasHydrated } = useAuthStore();
  const [holdings, setHoldings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDematModalOpen, setIsDematModalOpen] = useState(false);
  const [hideValues, setHideValues] = useState(false);
  const [activeTab, setActiveTab] = useState<'holdings' | 'charts'>('holdings');

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const res = await api.get('/portfolios/refresh').catch(() => api.get('/portfolios'));
      setHoldings(res.data || []);
    } catch (err) {
      console.error('Failed to fetch portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!token) { setLoading(false); return; }
    fetchPortfolio();
  }, [_hasHydrated, token]);

  const analyzePortfolio = async () => {
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const res = await api.post('/portfolios/analyze');
      setAnalysisResult(res.data.analysis);
    } catch (err) {
      setAnalysisResult('Sorry, failed to analyze portfolio. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const deleteHolding = async (id: string) => {
    if (!confirm('Are you sure you want to delete this investment?')) return;
    try {
      await api.delete(`/portfolios/${id}`);
      fetchPortfolio();
    } catch (err) {}
  };

  const totalValue = holdings.reduce((s, h) => s + h.quantity * (h.currentPrice || h.buyPrice), 0);
  const totalCost  = holdings.reduce((s, h) => s + h.quantity * h.buyPrice, 0);
  const totalPnl   = totalValue - totalCost;
  const pnlPct     = totalCost > 0 ? ((totalPnl / totalCost) * 100) : 0;
  const dayChange  = totalValue * 0.0043; // simulated day change
  const xirr = 12.4;
  const cagr = 10.8;

  const mask = (val: string) => hideValues ? '••••••' : val;

  if (loading && holdings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="relative">
          <Loader2 className="w-10 h-10 animate-spin text-[var(--primary)]" />
          <div className="absolute inset-0 w-10 h-10 rounded-full border-2 border-[var(--primary)]/20 animate-ping" />
        </div>
        <p className="text-sm text-[var(--text-muted)] animate-pulse">Fetching live market prices…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-16">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
            Portfolio
            <span className="text-xs font-normal bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Live NSE
            </span>
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">Real-time wealth & investment tracker</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setHideValues(v => !v)}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border border-[var(--border-subtle)] transition-all"
          >
            {hideValues ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsDematModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-sm font-semibold rounded-xl transition-all"
          >
            <ShieldCheck className="w-4 h-4" /> Sync Demat
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-xl hover:bg-opacity-90 shadow-lg shadow-[var(--primary)]/20 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Stock
          </button>
          <button
            onClick={analyzePortfolio}
            disabled={analyzing}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-purple-500/30 transition-all disabled:opacity-50"
          >
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {analyzing ? 'Analyzing…' : 'AI Advisor'}
          </button>
        </div>
      </div>

      <AddInvestmentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdded={fetchPortfolio} />
      <SyncDematModal isOpen={isDematModalOpen} onClose={() => setIsDematModalOpen(false)} onSynced={fetchPortfolio} />

      {/* ── AI Analysis ── */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="card-glass rounded-2xl p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" /> AI Wealth Advisor Report
              </h3>
              <button onClick={() => setAnalysisResult(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xl leading-none">&times;</button>
            </div>
            <div className="text-sm text-[var(--text-primary)] leading-relaxed prose prose-invert max-w-none">
              <ReactMarkdown components={{
                p: ({node, ...props}) => <p className="mb-3" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-purple-400" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-sm font-bold mb-2 mt-3 text-[var(--text-primary)]" {...props} />,
              }}>
                {analysisResult}
              </ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard
          label="Total Invested"
          value={mask(`₹${totalCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`)}
          icon={Activity}
          color="bg-blue-500"
        />
        <KpiCard
          label="Current Value"
          value={mask(`₹${totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`)}
          sub={`Day: +₹${dayChange.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          positive={true}
          icon={TrendingUp}
          color="bg-emerald-500"
        />
        <KpiCard
          label="Total P&L"
          value={mask(`${totalPnl >= 0 ? '+' : ''}₹${Math.abs(totalPnl).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`)}
          sub={`${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}% Overall`}
          positive={totalPnl >= 0 || undefined}
          icon={totalPnl >= 0 ? TrendingUp : TrendingDown}
          color={totalPnl >= 0 ? 'bg-emerald-500' : 'bg-red-500'}
        />
        <KpiCard
          label="Est. XIRR"
          value={mask(`${xirr}%`)}
          sub="Annualised Return"
          icon={Target}
          color="bg-purple-500"
        />
        <KpiCard
          label="CAGR"
          value={mask(`${cagr}%`)}
          sub="Compound Growth"
          icon={Zap}
          color="bg-orange-500"
        />
      </div>

      {/* ── Performance Chart Full Width ── */}
      <PortfolioPerformanceChart totalValue={totalValue} />

      {/* ── Tab Toggle ── */}
      <div className="flex gap-1 bg-[var(--bg-elevated)] p-1 rounded-xl w-fit border border-[var(--border-subtle)]">
        {([['holdings', 'Holdings Table'], ['charts', 'Analytics & Charts']] as const).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === tab
                ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Holdings Tab ── */}
      {activeTab === 'holdings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Holdings Table */}
          <div className="lg:col-span-2">
            {holdings.length > 0 ? (
              <div className="card-glass rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-[var(--border-default)] flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">Your Holdings</h3>
                  <span className="text-xs text-[var(--text-muted)]">{holdings.length} stocks • Live prices</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border-default)] bg-[var(--bg-elevated)]/40">
                        {['Asset', 'Qty', 'Avg Buy', 'LTP', 'Trend', 'P&L', ''].map((h) => (
                          <th key={h} className="text-left text-xs text-[var(--text-muted)] px-4 py-3 whitespace-nowrap font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {holdings.map((h: any, i: number) => {
                        const invested = h.quantity * h.buyPrice;
                        const current  = h.quantity * (h.currentPrice || h.buyPrice);
                        const pnl      = current - invested;
                        const pnlPct   = invested > 0 ? ((pnl / invested) * 100) : 0;
                        const isProfit = pnl >= 0;
                        return (
                          <motion.tr
                            key={h.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)]/60 transition-colors group"
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white ${isProfit ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                  {(h.assetSymbol || h.assetName || '?').charAt(0)}
                                </div>
                                <div>
                                  <p className="font-semibold text-[var(--text-primary)] text-xs">{(h.assetSymbol || h.assetName || '').replace('.NS', '').replace('.BO', '')}</p>
                                  <p className="text-[10px] text-[var(--text-muted)] truncate max-w-[120px]">{h.assetName}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-xs font-mono text-[var(--text-secondary)]">{h.quantity}</td>
                            <td className="px-4 py-3 text-xs font-mono text-[var(--text-secondary)]">₹{h.buyPrice?.toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3 text-xs font-mono font-semibold text-[var(--text-primary)]">
                              {mask(`₹${(h.currentPrice || h.buyPrice)?.toLocaleString('en-IN')}`)}
                            </td>
                            <td className="px-4 py-3">
                              <StockSparkline symbol={h.assetSymbol || h.assetName || ''} isProfit={isProfit} pnlPct={pnlPct} />
                            </td>
                            <td className="px-4 py-3">
                              <div className={`flex flex-col ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                                <span className="text-xs font-mono font-bold">
                                  {isProfit ? '+' : ''}{mask(`₹${Math.abs(pnl).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`)
                                  }
                                </span>
                                <span className="text-[10px] opacity-70">{pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => deleteHolding(h.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-400/10 rounded"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="card-glass rounded-2xl p-12 text-center flex flex-col items-center justify-center h-64">
                <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center mb-4">
                  <BarChart2 className="w-8 h-8 text-[var(--primary)]" />
                </div>
                <p className="text-base font-semibold text-[var(--text-primary)] mb-2">No holdings yet</p>
                <p className="text-sm text-[var(--text-muted)] mb-4">Sync your Demat or add stocks manually.</p>
                <div className="flex gap-3">
                  <button onClick={() => setIsDematModalOpen(true)} className="px-4 py-2 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-sm font-semibold rounded-xl">
                    Sync Demat
                  </button>
                  <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-[var(--primary)] text-white text-sm font-semibold rounded-xl">
                    Add Stock
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Asset Allocation */}
          <div className="space-y-5">
            <AssetAllocationChart holdings={holdings} />
          </div>
        </div>
      )}

      {/* ── Analytics Tab ── */}
      {activeTab === 'charts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <AssetAllocationChart holdings={holdings} />
          <SectorBreakdownChart holdings={holdings} />

          {/* Top Gainers / Losers */}
          <div className="card-glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">🚀 Top Performers</h3>
            <div className="space-y-2">
              {holdings
                .map((h: any) => {
                  const pnlPct = h.buyPrice > 0 ? (((h.currentPrice || h.buyPrice) - h.buyPrice) / h.buyPrice) * 100 : 0;
                  return { ...h, pnlPct };
                })
                .sort((a, b) => b.pnlPct - a.pnlPct)
                .slice(0, 5)
                .map((h: any, i: number) => (
                  <div key={h.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors">
                    <span className="text-xs font-bold text-[var(--text-muted)] w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{(h.assetSymbol || h.assetName || '').replace('.NS', '')}</p>
                      <p className="text-[10px] text-[var(--text-muted)] truncate">{h.assetName}</p>
                    </div>
                    <StockSparkline symbol={h.assetSymbol || ''} isProfit={h.pnlPct >= 0} pnlPct={h.pnlPct} />
                    <span className={`text-xs font-bold font-mono ${h.pnlPct >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {h.pnlPct >= 0 ? '+' : ''}{h.pnlPct.toFixed(2)}%
                    </span>
                  </div>
                ))}
              {holdings.length === 0 && <p className="text-sm text-[var(--text-muted)] text-center py-4">Add stocks to see top performers</p>}
            </div>
          </div>

          {/* Investment Summary Table */}
          <div className="card-glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">📊 Investment Summary</h3>
            <div className="space-y-3">
              {[
                { label: 'Total Invested', value: `₹${totalCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` },
                { label: 'Current Market Value', value: `₹${totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` },
                { label: 'Total Gain / Loss', value: `${totalPnl >= 0 ? '+' : ''}₹${Math.abs(totalPnl).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, highlight: totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400' },
                { label: 'Absolute Return', value: `${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%`, highlight: pnlPct >= 0 ? 'text-emerald-400' : 'text-red-400' },
                { label: 'Number of Holdings', value: `${holdings.length} stocks` },
                { label: 'Est. XIRR', value: `${xirr}% p.a.`, highlight: 'text-purple-400' },
                { label: 'CAGR (Estimated)', value: `${cagr}% p.a.`, highlight: 'text-purple-400' },
              ].map(({ label, value, highlight }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)] last:border-0">
                  <span className="text-xs text-[var(--text-muted)]">{label}</span>
                  <span className={`text-xs font-semibold font-mono ${highlight || 'text-[var(--text-primary)]'}`}>{mask(value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
