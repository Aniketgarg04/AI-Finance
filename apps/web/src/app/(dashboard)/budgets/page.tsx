'use client';

/**
 * Budgets page — budget cards grid + savings goals.
 * Fetches REAL data from the backend API.
 */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Loader2 } from 'lucide-react';
import BudgetCard from '@/components/budgets/BudgetCard';
import GoalTracker from '@/components/budgets/GoalTracker';
import BudgetModal from '@/components/budgets/BudgetModal';
import GoalModal from '@/components/budgets/GoalModal';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export default function BudgetsPage() {
  const { token, _hasHydrated } = useAuthStore();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [budgetRes, goalRes, txnRes] = await Promise.all([
        api.get('/budgets'),
        api.get('/goals'),
        api.get('/transactions'),
      ]);
      setBudgets(budgetRes.data || []);
      setTransactions(txnRes.data || []);
      const mappedGoals = (goalRes.data || []).map((g: any) => ({
        id: g.id,
        title: g.name,
        targetAmount: g.targetAmount,
        savedAmount: g.currentAmount,
        targetDate: g.deadline || '',
        icon: '🎯',
      }));
      setGoals(mappedGoals);
    } catch (err) {
      console.error('Failed to fetch budget data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!token) { setLoading(false); return; }
    fetchData();
  }, [_hasHydrated, token]);

  const totalBudget = budgets.reduce((s: number, b: any) => s + b.limit, 0);
  
  // Calculate spent from transactions in the current month
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  
  const currentMonthTxns = transactions.filter(t => {
    if (t.type !== 'EXPENSE') return false;
    const date = new Date(t.date);
    return date.getMonth() + 1 === currentMonth && date.getFullYear() === currentYear;
  });

  const totalSpent = currentMonthTxns.reduce((s: number, t: any) => s + t.amount, 0);
  const overBudget = Math.max(0, totalSpent - totalBudget);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Smart Budgeting</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {budgets.length} budget categories configured
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)]
                           hover:bg-[var(--primary-hover)] text-white text-sm font-semibold
                           transition-colors shadow-lg shadow-violet-900/30">
          <Plus size={14} /> Set budget
        </button>
      </div>

      {/* Summary strip */}
      <div className="card-glass rounded-2xl p-4 flex flex-wrap gap-6 items-center">
        <div>
          <p className="text-xs text-[var(--text-muted)]">Total Budget</p>
          <p className="text-lg font-bold font-mono text-[var(--text-primary)]">{formatCurrency(totalBudget)}</p>
        </div>
        <div className="w-px h-8 bg-[var(--border-default)]" />
        <div>
          <p className="text-xs text-[var(--text-muted)]">Categories</p>
          <p className="text-lg font-bold font-mono text-[var(--text-primary)]">{budgets.length}</p>
        </div>
      </div>

      {/* Budget cards grid */}
      {budgets.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {budgets.map((budget: any, i: number) => {
            const spent = currentMonthTxns
              .filter(t => t.category === budget.category)
              .reduce((s, t) => s + t.amount, 0);
            return (
              <BudgetCard key={budget.id} budget={{
                id: budget.id,
                category: budget.category,
                limit: budget.limit,
                spent: spent,
                month: `${budget.year}-${String(budget.month).padStart(2, '0')}`,
              }} delay={i * 0.05} />
            );
          })}
        </div>
      ) : (
        <div className="card-glass rounded-2xl p-12 text-center">
          <p className="text-lg font-semibold text-[var(--text-primary)] mb-2">No budgets set</p>
          <p className="text-sm text-[var(--text-muted)]">Click &quot;Set budget&quot; to create your first budget category.</p>
        </div>
      )}

      {/* Goals */}
      {goals.length > 0 ? (
        <GoalTracker goals={goals} onAddGoal={() => setIsGoalModalOpen(true)} />
      ) : (
        <div className="card-glass rounded-2xl p-8 text-center flex flex-col items-center justify-center">
          <p className="text-sm text-[var(--text-muted)] mb-4">No savings goals yet. Create one to start tracking your progress.</p>
          <button 
            onClick={() => setIsGoalModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold transition-colors shadow-lg shadow-[var(--primary)]/20"
          >
            <Plus size={14} /> Create Goal
          </button>
        </div>
      )}

      <BudgetModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchData} 
      />
      <GoalModal 
        isOpen={isGoalModalOpen} 
        onClose={() => setIsGoalModalOpen(false)} 
        onSuccess={fetchData} 
      />
    </div>
  );
}
