'use client';

/**
 * Dashboard Home — AI Finance Copilot Phase 4 Redesign
 *
 * Layout:
 *   ROW 1  → Health Score | Portfolio panel | AI Insights
 *   ROW 2  → Spending Trend | Cash Flow
 *   ROW 3  → Expense Breakdown | Recent Transactions | Upcoming Bills
 */
import { motion } from 'framer-motion';
import {
  ArrowUpRight, ArrowDownLeft, AlertCircle, Plus,
  Receipt, CalendarClock, ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import { useAuthStore } from '@/store/auth.store';
import { formatCurrency, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Phase 4 New Components
import QuickActionModals from '@/components/dashboard/QuickActionModals';
import HealthScoreWidget from '@/components/dashboard/HealthScoreWidget';
import AIInsightsWidget from '@/components/dashboard/AIInsightsWidget';

// Existing Components
import PortfolioPanel  from './PortfolioPanel';
import BalanceTrendChart   from '@/components/dashboard/BalanceChart';
import IncomeVsExpenseBar  from '@/components/dashboard/IncomeVsExpenseBar';
import CategoryDonutChart  from '@/components/dashboard/CategoryDonutChart';
import AddTransactionModal from '@/components/expenses/AddTransactionModal';
import api from '@/lib/api';

/* ── helpers ─────────────────────────────────────────────── */
function SectionTitle({ title, href, action }: { title: string; href?: string; action?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
      <p className="t-section" style={{ fontSize: 16, fontWeight: 600 }}>{title}</p>
      {href && action && (
        <Link href={href} className="flex items-center gap-1"
          style={{ fontSize: 12, fontWeight: 500, color: 'var(--primary)', textDecoration: 'none' }}
        >
          {action} <ArrowRight size={11} />
        </Link>
      )}
    </div>
  );
}

/* ── Skeleton ────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className="dash-hero" style={{ minHeight: 280 }}>
        <div className="skeleton" style={{ borderRadius: 14 }} />
        <div className="skeleton" style={{ borderRadius: 14 }} />
        <div className="skeleton" style={{ borderRadius: 14 }} />
      </div>
      <div className="dash-charts">
        {[0, 1].map((i) => <div key={i} className="skeleton" style={{ borderRadius: 14, height: 240 }} />)}
      </div>
    </div>
  );
}

/* ── Transactions list ───────────────────────────────────── */
function TxnList({ transactions }: { transactions: any[] }) {
  if (!transactions?.length) return (
    <div style={{ textAlign: 'center', padding: '32px 0' }}>
      <Receipt size={20} style={{ color: 'var(--text-faint)', margin: '0 auto 8px' }} />
      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No transactions yet</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {transactions.slice(0, 6).map((t: any) => {
        const isIncome = t.type === 'INCOME';
        return (
          <div
            key={t.id}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 0',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: isIncome ? 'var(--success-subtle)' : 'var(--bg)',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              color: isIncome ? 'var(--success)' : 'var(--text-muted)',
            }}>
              {isIncome
                ? <ArrowDownLeft size={14} />
                : <ArrowUpRight size={14} />
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {t.description || t.category}
              </p>
              <p style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 1 }}>
                {formatDate(t.date, 'dd MMM')} · {t.category}
              </p>
            </div>
            <p style={{
              fontSize: 13, fontWeight: 600, flexShrink: 0,
              fontVariantNumeric: 'tabular-nums',
              color: isIncome ? 'var(--success)' : 'var(--text)',
            }}>
              {isIncome ? '+' : '−'}{formatCurrency(t.amount)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/* ── Bills list ──────────────────────────────────────────── */
function BillsList({ bills }: { bills: any[] }) {
  if (!bills?.length) return (
    <div style={{ textAlign: 'center', padding: '32px 0' }}>
      <CalendarClock size={20} style={{ color: 'var(--text-faint)', margin: '0 auto 8px' }} />
      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No upcoming bills</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {bills.slice(0, 5).map((b: any) => {
        const due    = new Date(b.dueDate);
        const today  = new Date();
        const daysLeft = Math.ceil((due.getTime() - today.getTime()) / 86400000);
        const urgent   = daysLeft <= 3;
        return (
          <div
            key={b.id}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 0', borderBottom: '1px solid var(--border)',
            }}
          >
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{b.name}</p>
              <p style={{ fontSize: 11, color: urgent ? 'var(--danger)' : 'var(--text-faint)', marginTop: 1 }}>
                {urgent ? `Due in ${daysLeft}d` : formatDate(b.dueDate, 'dd MMM')}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
                {formatCurrency(b.amount)}
              </p>
              <span className={cn('badge', b.isPaid ? 'badge-green' : urgent ? 'badge-red' : 'badge-gray')}>
                {b.isPaid ? 'Paid' : urgent ? 'Due soon' : 'Upcoming'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { user, _hasHydrated }                 = useAuthStore();
  const { summary, isLoading, isError, mutate } = useDashboardSummary();
  const [showModal, setShowModal]               = useState(false);

  const handleSave = async (data: any) => {
    try {
      await api.post('/transactions', {
        amount:      data.amount,
        type:        data.type === 'credit' ? 'INCOME' : 'EXPENSE',
        category:    data.category,
        description: data.title,
        date:        data.date,
      });
      mutate();
    } catch (e) { console.error(e); }
  };

  if (!_hasHydrated) return null;
  if (isLoading)     return <Skeleton />;

  if (isError || !summary) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', gap: 12 }}>
        <AlertCircle size={28} style={{ color: 'var(--text-faint)' }} />
        <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Failed to load dashboard.</p>
        <button onClick={() => mutate()} className="btn btn-secondary" style={{ fontSize: 13 }}>Retry</button>
      </div>
    );
  }

  /* Category breakdown */
  const catMap: Record<string, number> = {};
  summary.recentTransactions
    .filter((t: any) => t.type === 'EXPENSE')
    .forEach((t: any) => { catMap[t.category] = (catMap[t.category] ?? 0) + t.amount; });
  const catData = Object.entries(catMap)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value }));

  return (
    <>
      <div className="mesh-bg" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
        
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="t-heading">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
            <p className="t-body" style={{ color: 'var(--text-secondary)' }}>Here is your financial summary for {formatDate(new Date(), 'MMMM yyyy')}</p>
          </div>
          <QuickActionModals />
        </div>

        {/* ── ROW 1: Hero Widgets ─────── */}
        <div className="dash-hero" style={{ gridTemplateColumns: '1fr 340px 1fr', minHeight: 'auto' }}>
          
          {/* Health Score */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <HealthScoreWidget />
          </motion.div>

          {/* Portfolio Panel — middle */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel" style={{ overflow: 'hidden' }}>
            <PortfolioPanel
              netWorth={summary.netWorth}
              totalInvestments={summary.totalInvestments}
              cashBalance={summary.cashBalance}
              emergencyFund={summary.emergencyFund}
              monthlySavings={summary.monthlySavings}
              activeBudgets={summary.activeBudgetsCount}
            />
          </motion.div>

          {/* AI Insights Widget */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <AIInsightsWidget />
          </motion.div>

        </div>

        {/* ── ROW 2: Charts ────────────────────────────── */}
        <div className="dash-charts" style={{ gridTemplateColumns: '2fr 1fr' }}>

          {/* Spending Trend */}
          <motion.div
            className="glass-panel animate-in d-3"
            style={{ display: 'flex', flexDirection: 'column', padding: 24 }}
          >
            <SectionTitle title="Net Worth Trend" href="/reports" action="Report" />
            <div style={{ flex: 1, minHeight: 180 }}>
              <BalanceTrendChart />
            </div>
          </motion.div>

          {/* Monthly Cash Flow */}
          <motion.div
            className="glass-panel animate-in d-4"
            style={{ display: 'flex', flexDirection: 'column', padding: 24 }}
          >
            <SectionTitle title="Cash Flow" href="/reports" action="Details" />
            <div style={{ flex: 1, minHeight: 180 }}>
              <IncomeVsExpenseBar />
            </div>
          </motion.div>
        </div>

        {/* ── ROW 3: Secondary Data ────── */}
        <div className="dash-data">
          
          {/* Expense Breakdown */}
          <motion.div
            className="glass-panel animate-in d-5"
            style={{ display: 'flex', flexDirection: 'column', padding: 24 }}
          >
            <SectionTitle title="Expense Breakdown" href="/expenses" action="View all" />
            <div style={{ flex: 1, minHeight: 180 }}>
              {catData.length > 0
                ? <CategoryDonutChart data={catData} />
                : (
                  <div style={{ textAlign: 'center', padding: '48px 0' }}>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>No expense data yet</p>
                  </div>
                )
              }
            </div>
          </motion.div>

          {/* Recent Transactions */}
          <motion.div className="glass-panel animate-in d-5" style={{ display: 'flex', flexDirection: 'column', padding: 24 }}>
            <SectionTitle title="Transactions" href="/expenses" action="View all" />
            <TxnList transactions={summary.recentTransactions} />
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-secondary"
              style={{ marginTop: 16, fontSize: 13, gap: 6, width: '100%', justifyContent: 'center' }}
            >
              <Plus size={13} /> Add Transaction
            </button>
          </motion.div>

          {/* Upcoming Bills */}
          <motion.div className="glass-panel animate-in d-5" style={{ padding: 24 }}>
            <SectionTitle title="Upcoming Bills" />
            <BillsList bills={summary.recentBills} />
          </motion.div>

        </div>
      </div>

      <AddTransactionModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
      />
    </>
  );
}
