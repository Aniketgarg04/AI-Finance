'use client';

/**
 * Fraud Detection page — alert cards and resolution actions.
 * Fetches REAL data from the backend API.
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, AlertOctagon, Info, CheckCircle2, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

function AlertCard({ alert, onResolve }: { alert: any; onResolve: (id: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`card-glass rounded-2xl p-4 border ${alert.resolved ? 'opacity-50 border-green-500/20' : 'border-amber-500/30 bg-amber-500/5'}`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 shrink-0 ${alert.resolved ? 'text-green-400' : 'text-amber-400'}`}>
          {alert.resolved ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text-primary)] mb-1">{alert.reason}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)]">
              {new Date(alert.createdAt).toLocaleDateString()}
            </span>
            {!alert.resolved ? (
              <button
                onClick={() => onResolve(alert.id)}
                className="flex items-center gap-1 text-xs text-green-400 hover:underline"
              >
                <CheckCircle2 size={12} /> Mark safe
              </button>
            ) : (
              <span className="flex items-center gap-1 text-xs text-green-400">
                <CheckCircle2 size={12} /> Resolved
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function FraudPage() {
  const { token, _hasHydrated } = useAuthStore();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!token) { setLoading(false); return; }

    async function fetchAlerts() {
      try {
        const res = await api.get('/alerts');
        setAlerts(res.data || []);
      } catch (err) {
        console.error('Failed to fetch alerts:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAlerts();
  }, [_hasHydrated, token]);

  const resolve = async (id: string) => {
    try {
      await api.put(`/alerts/${id}`, { resolved: true });
      setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, resolved: true } : a));
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  const unresolved = alerts.filter((a) => !a.resolved).length;

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
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <Shield size={18} className="text-red-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Fraud Detection</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {unresolved} active alerts
          </p>
        </div>
      </div>

      {/* Alert list */}
      {alerts.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Alerts</h3>
          {alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} onResolve={resolve} />
          ))}
        </div>
      ) : (
        <div className="card-glass rounded-2xl p-12 text-center">
          <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={28} className="text-green-400" />
          </div>
          <p className="text-lg font-semibold text-[var(--text-primary)] mb-2">All clear!</p>
          <p className="text-sm text-[var(--text-muted)]">No fraud alerts detected. Your transactions are secure.</p>
        </div>
      )}
    </div>
  );
}
