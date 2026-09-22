'use client';

/**
 * Expenses page — transaction table + add button + CSV upload + summary cards.
 * Fetches REAL data from the backend API.
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Upload, ArrowUpRight, ArrowDownLeft, RefreshCcw, Loader2 } from 'lucide-react';
import TransactionTable from '@/components/expenses/TransactionTable';
import AddTransactionModal from '@/components/expenses/AddTransactionModal';
import { formatCurrency } from '@/lib/utils';
import type { Transaction } from '@/types';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export default function ExpensesPage() {
  const { token, _hasHydrated } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editTxn, setEditTxn] = useState<Partial<Transaction> | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!token) { setLoading(false); return; }

    async function fetchTransactions() {
      try {
        const res = await api.get('/transactions');
        // Map backend format to frontend format
        const mapped = (res.data || []).map((t: any) => ({
          id: t.id,
          title: t.description || t.category,
          amount: t.amount,
          type: t.type === 'INCOME' ? 'credit' : 'debit',
          category: t.category,
          date: t.date?.split('T')[0] || new Date().toISOString().split('T')[0],
          isRecurring: false,
          isFlagged: false,
        }));
        setTransactions(mapped);
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTransactions();
  }, [_hasHydrated, token]);

  const totalCredits  = transactions.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalDebits   = transactions.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
  const totalRecurring = transactions.filter((t) => t.isRecurring).length;

  const handleSave = async (data: any) => {
    try {
      const mappedData = {
        title: data.title,
        amount: data.amount,
        type: data.type,
        category: data.category as any,
        date: data.date,
        note: data.note,
      };

      if (editTxn?.id && !editTxn.id.startsWith('new-')) {
        await api.put(`/transactions/${editTxn.id}`, {
          amount: mappedData.amount,
          type: mappedData.type === 'credit' ? 'INCOME' : 'EXPENSE',
          category: mappedData.category,
          description: mappedData.title,
          date: mappedData.date,
        });
        setTransactions((prev) => prev.map((t) => t.id === editTxn.id ? { ...t, ...mappedData } : t));
      } else {
        const res = await api.post('/transactions', {
          amount: mappedData.amount,
          type: mappedData.type === 'credit' ? 'INCOME' : 'EXPENSE',
          category: mappedData.category,
          description: mappedData.title,
          date: mappedData.date,
        });
        setTransactions((prev) => [
          { id: res.data.id, ...mappedData, isFlagged: false } as Transaction,
          ...prev,
        ]);
      }
    } catch (err) {
      console.error('Failed to save transaction:', err);
    }
    setEditTxn(undefined);
  };

  const handleEdit   = (t: Transaction) => { setEditTxn(t); setShowModal(true); };
  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    }
  };

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
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Expenses</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{transactions.length} total transactions</p>
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border-default)]
                       text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] transition-colors"
          >
            <Upload size={14} /> Import CSV
          </button>
          <button
            onClick={() => { setEditTxn(undefined); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)]
                       hover:bg-[var(--primary-hover)] text-white text-sm font-semibold
                       transition-colors shadow-lg shadow-violet-900/30"
          >
            <Plus size={14} /> Add transaction
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
        {[
          { label: 'Total Credits',   value: formatCurrency(totalCredits),  icon: ArrowDownLeft, color: 'text-green-400', bg: 'rgba(34,197,94,0.1)' },
          { label: 'Total Debits',    value: formatCurrency(totalDebits),   icon: ArrowUpRight,  color: 'text-red-400',   bg: 'rgba(239,68,68,0.1)' },
          { label: 'Recurring Items', value: `${totalRecurring} items`,      icon: RefreshCcw,    color: 'text-violet-400',bg: 'rgba(124,58,237,0.1)' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card-glass rounded-2xl p-4 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
              <s.icon size={18} className={s.color} />
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
              <p className="text-base font-bold font-mono text-[var(--text-primary)]">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Transaction table */}
      {transactions.length > 0 ? (
        <TransactionTable transactions={transactions} onEdit={handleEdit} onDelete={handleDelete} />
      ) : (
        <div className="card-glass rounded-2xl p-12 text-center">
          <p className="text-lg font-semibold text-[var(--text-primary)] mb-2">No transactions yet</p>
          <p className="text-sm text-[var(--text-muted)]">Click &quot;Add transaction&quot; to record your first income or expense.</p>
        </div>
      )}

      {/* Add/Edit modal */}
      <AddTransactionModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditTxn(undefined); }}
        onSave={handleSave}
        initialData={editTxn}
      />
    </div>
  );
}
