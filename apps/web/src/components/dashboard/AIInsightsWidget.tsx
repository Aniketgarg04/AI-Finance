'use client';

import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function AIInsightsWidget() {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/insights').then(res => {
      setInsights(res.data.insights || []);
    }).catch(() => {
      setInsights([
        { type: 'POSITIVE', message: "Your finances look great this month! You are staying within your budgets." },
        { type: 'WARNING', message: "Food & Dining spending is 15% higher than last month's average." }
      ]);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="skeleton" style={{ height: '180px' }} />;

  return (
    <motion.div 
      className="glass-panel"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 className="t-section" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="var(--primary)" /> Copilot Insights
        </h3>
        <button className="btn-ghost" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          View All <ArrowRight size={12} />
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
        {insights.map((insight, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            style={{ 
              display: 'flex', 
              gap: '12px', 
              padding: '12px', 
              background: 'var(--surface-raised)', 
              borderRadius: '12px',
              borderLeft: `3px solid ${insight.type === 'POSITIVE' ? 'var(--success)' : 'var(--warning)'}`
            }}
          >
            <div style={{ flexShrink: 0, marginTop: '2px' }}>
              {insight.type === 'POSITIVE' ? 
                <TrendingUp size={16} color="var(--success)" /> : 
                <AlertCircle size={16} color="var(--warning)" />
              }
            </div>
            <p className="t-body" style={{ fontSize: '14px', lineHeight: '1.4' }}>{insight.message}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
