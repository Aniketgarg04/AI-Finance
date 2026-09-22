'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GoalModal({ isOpen, onClose, onSuccess }: GoalModalProps) {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Reset form whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setTargetAmount('');
      setDeadline('');
      setError('');
      setSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !targetAmount || parseFloat(targetAmount) <= 0) {
      setError('Please enter a valid name and target amount greater than 0');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await api.post('/goals', {
        name,
        targetAmount: parseFloat(targetAmount),
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 800);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else if (Array.isArray(msg)) {
        setError(msg.join(', '));
      } else {
        setError(msg || 'Failed to save goal. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Set New Goal</h3>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {success ? (
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            <CheckCircle2 size={40} className="text-green-400" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">Goal saved!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Goal Name</label>
              <input 
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. New Car, Vacation"
                className="w-full px-4 py-2.5 text-sm rounded-xl outline-none bg-[var(--bg-overlay)] border border-[var(--border-default)] text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Target Amount (₹)</label>
              <input 
                type="number"
                required
                min="1"
                step="any"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="e.g. 500000"
                className="w-full px-4 py-2.5 text-sm rounded-xl outline-none bg-[var(--bg-overlay)] border border-[var(--border-default)] text-[var(--text-primary)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1.5">Target Date (Optional)</label>
              <input 
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl outline-none bg-[var(--bg-overlay)] border border-[var(--border-default)] text-[var(--text-primary)]"
              />
            </div>
            <button 
              type="submit"
              disabled={loading || !targetAmount || !name}
              className="w-full flex items-center justify-center py-2.5 rounded-xl bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Save Goal'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
