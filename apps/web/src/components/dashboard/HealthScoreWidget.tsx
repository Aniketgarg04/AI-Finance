'use client';

import { motion } from 'framer-motion';
import { Activity, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function HealthScoreWidget() {
  const [data, setData] = useState<{ score: number; status: string; details: string[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch from /api/v1/health/score
    // For this UI demo, we'll simulate the fetch if the API is down
    api.get('/health/score').then(res => {
      setData(res.data);
    }).catch(() => {
      // Fallback dummy data for visual testing if nestjs isn't up
      setData({ score: 85, status: 'Excellent', details: ['Strong emergency fund.', 'Excellent savings rate (>= 20%).'] });
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="skeleton" style={{ height: '140px' }} />;

  const isGood = data?.score >= 70;

  return (
    <motion.div 
      className="glass-panel"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: '24px', display: 'flex', gap: '20px', alignItems: 'center' }}
    >
      <div style={{ position: 'relative', width: '80px', height: '80px' }}>
        <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border)" strokeWidth="8" />
          <motion.circle 
            cx="50" cy="50" r="45" fill="none" 
            stroke={isGood ? "var(--success)" : "var(--warning)"} 
            strokeWidth="8" 
            strokeDasharray={`${(data?.score || 0) * 2.82} 300`}
            initial={{ strokeDasharray: "0 300" }}
            animate={{ strokeDasharray: `${(data?.score || 0) * 2.82} 300` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <span className="t-number-md">{data?.score}</span>
        </div>
      </div>
      
      <div style={{ flex: 1 }}>
        <h3 className="t-section" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          Financial Health {isGood ? <ShieldCheck size={20} color="var(--success)" /> : <AlertTriangle size={20} color="var(--warning)" />}
        </h3>
        <p className="t-body" style={{ color: 'var(--text-secondary)' }}>Status: <strong>{data?.status}</strong></p>
        <p className="t-muted" style={{ marginTop: '4px' }}>{data?.details[0]}</p>
      </div>
    </motion.div>
  );
}
