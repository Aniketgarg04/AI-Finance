'use client';

/**
 * TransactionTable — filterable, searchable table of all transactions.
 */
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowUpRight, ArrowDownLeft, Flag, RefreshCcw } from 'lucide-react';
import CategoryBadge from './CategoryBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CATEGORIES } from '@/lib/constants';
import type { Transaction, ExpenseCategory } from '@/types';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit?: (t: Transaction) => void;
  onDelete?: (id: string) => void;
}

export default function TransactionTable({ transactions }: TransactionTableProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<'all' | 'debit' | 'credit'>('all');

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [transactions, search, categoryFilter, typeFilter]);

  return (
    <div className="card-glass rounded-2xl overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b border-[var(--border-default)] flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="flex items-center gap-2 bg-[var(--bg-elevated)] border border-[var(--border-default)]
                        rounded-xl px-3 py-2 flex-1 min-w-[200px]">
          <Search size={14} className="text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search transactions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none
                       placeholder:text-[var(--text-muted)] border-none shadow-none"
          />
        </div>

        {/* Category filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as ExpenseCategory | 'All')}
          className="text-sm px-3 py-2 rounded-xl cursor-pointer"
        >
          <option value="All">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.label} value={c.label}>{c.emoji} {c.label}</option>
          ))}
        </select>

        {/* Type filter */}
        <div className="flex gap-1 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl p-1">
          {(['all', 'debit', 'credit'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150
                ${typeFilter === t
                  ? 'bg-[var(--primary)] text-white shadow'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
            >
              {t === 'all' ? 'All' : t === 'debit' ? 'Debits' : 'Credits'}
            </button>
          ))}
        </div>

        <span className="text-xs text-[var(--text-muted)] ml-auto">
          {filtered.length} transactions
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-default)]">
              {['Transaction', 'Category', 'Date', 'Type', 'Amount'].map((h) => (
                <th key={h} className="text-left text-xs font-medium text-[var(--text-muted)] px-4 py-3 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((txn, i) => {
              const isCredit = txn.type === 'credit';
              return (
                <motion.tr
                  key={txn.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)]
                             transition-colors duration-100 group"
                >
                  {/* Title */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[var(--text-primary)] whitespace-nowrap">{txn.title}</p>
                      {txn.isFlagged && <Flag size={11} className="text-red-400" />}
                      {txn.isRecurring && (
                        <span title="Recurring"><RefreshCcw size={10} className="text-violet-400" /></span>
                      )}
                    </div>
                    {txn.note && <p className="text-xs text-[var(--text-muted)]">{txn.note}</p>}
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3">
                    <CategoryBadge category={txn.category} />
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 text-xs text-[var(--text-muted)] whitespace-nowrap">
                    {formatDate(txn.date)}
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3">
                    <div className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full
                      ${isCredit ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {isCredit ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
                      {isCredit ? 'Credit' : 'Debit'}
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="px-4 py-3">
                    <span className={`font-mono font-semibold whitespace-nowrap
                      ${isCredit ? 'text-green-400' : 'text-[var(--text-primary)]'}`}>
                      {isCredit ? '+' : '-'}{formatCurrency(txn.amount)}
                    </span>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-[var(--text-muted)] text-sm">
            No transactions match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
