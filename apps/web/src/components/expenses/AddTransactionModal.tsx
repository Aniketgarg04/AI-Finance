'use client';

/**
 * AddTransactionModal — dialog for adding/editing a transaction.
 */
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';
import type { Transaction } from '@/types';

const schema = z.object({
  title:    z.string().min(2, 'Title required'),
  amount:   z.coerce.number().positive('Amount must be positive'),
  type:     z.enum(['debit', 'credit']),
  category: z.string(),
  date:     z.string().min(1, 'Date required'),
  note:     z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

interface AddTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: FormValues) => void;
  initialData?: Partial<Transaction>;
}

export default function AddTransactionModal({ open, onClose, onSave, initialData }: AddTransactionModalProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<FormValues>({
      resolver: zodResolver(schema) as any,
      defaultValues: {
        type: 'debit',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
      },
    });

  useEffect(() => {
    if (initialData) {
      reset({
        title:    initialData.title ?? '',
        amount:   initialData.amount ?? 0,
        type:     initialData.type ?? 'debit',
        category: initialData.category ?? 'Food',
        date:     initialData.date ?? new Date().toISOString().split('T')[0],
        note:     initialData.note ?? '',
      });
    }
  }, [initialData, reset]);

  const onSubmit = async (data: FormValues) => {
    await new Promise((r) => setTimeout(r, 300));
    onSave(data);
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          >
            <div className="card-glass rounded-2xl w-full max-w-md p-6 shadow-[var(--shadow-elevated)]">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  {initialData?.id ? 'Edit Transaction' : 'Add Transaction'}
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-xl flex items-center justify-center
                             text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]
                             transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Title</label>
                  <input {...register('title')} placeholder="e.g. Grocery Shopping" className="w-full px-4 py-2.5 text-sm rounded-xl outline-none" />
                  {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
                </div>

                {/* Amount + Type row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Amount (₹)</label>
                    <input {...register('amount')} type="number" step="0.01" placeholder="0.00" className="w-full px-4 py-2.5 text-sm rounded-xl outline-none" />
                    {errors.amount && <p className="mt-1 text-xs text-red-400">{errors.amount.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Type</label>
                    <select {...register('type')} className="w-full px-4 py-2.5 text-sm rounded-xl cursor-pointer">
                      <option value="debit">💸 Debit</option>
                      <option value="credit">💰 Credit</option>
                    </select>
                  </div>
                </div>

                {/* Category + Date row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Category</label>
                    <select {...register('category')} className="w-full px-4 py-2.5 text-sm rounded-xl cursor-pointer">
                      {CATEGORIES.map((c) => (
                        <option key={c.label} value={c.label}>{c.emoji} {c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Date</label>
                    <input {...register('date')} type="date" className="w-full px-4 py-2.5 text-sm rounded-xl outline-none" />
                    {errors.date && <p className="mt-1 text-xs text-red-400">{errors.date.message}</p>}
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="text-xs font-medium text-[var(--text-secondary)] mb-1.5 block">Note (optional)</label>
                  <input {...register('note')} placeholder="Add a short note…" className="w-full px-4 py-2.5 text-sm rounded-xl outline-none" />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button" onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl border border-[var(--border-default)] text-sm
                               text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit" disabled={isSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)]
                               text-white text-sm font-semibold transition-colors disabled:opacity-60"
                  >
                    {isSubmitting ? 'Saving…' : 'Save transaction'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
