'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Download, Send, PlusCircle } from 'lucide-react';
import { useState } from 'react';

export default function QuickActionModals() {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (type: 'pdf' | 'csv') => {
    setIsExporting(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/reports/${type === 'pdf' ? 'monthly/pdf' : 'transactions/csv'}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}` // assuming token is here
        }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report.${type}`;
        a.click();
      }
    } catch (error) {
      console.error('Export failed', error);
    }
    setIsExporting(false);
    setActiveModal(null);
  };

  return (
    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
      <button className="btn btn-primary" onClick={() => setActiveModal('transfer')}>
        <Send size={16} /> Quick Transfer
      </button>
      <button className="btn btn-secondary glass-panel" onClick={() => setActiveModal('export')}>
        <Download size={16} /> Export Report
      </button>

      <AnimatePresence>
        {activeModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveModal(null)}
          >
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 className="t-section">{activeModal === 'export' ? 'Generate Report' : 'Quick Transfer'}</h3>
                <button className="btn-icon" onClick={() => setActiveModal(null)}><X size={18} /></button>
              </div>

              {activeModal === 'export' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p className="t-body">Select the format for your monthly financial summary:</p>
                  <button className="btn btn-secondary" onClick={() => handleExport('pdf')} disabled={isExporting}>
                    <FileText size={16} style={{ color: 'var(--danger)' }} /> Download PDF Report
                  </button>
                  <button className="btn btn-secondary" onClick={() => handleExport('csv')} disabled={isExporting}>
                    <FileText size={16} style={{ color: 'var(--success)' }} /> Download CSV (Transactions)
                  </button>
                </div>
              )}

              {activeModal === 'transfer' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label className="t-label">Amount</label>
                    <input type="number" placeholder="0.00" style={{ width: '100%', padding: '10px', marginTop: '4px' }} />
                  </div>
                  <div>
                    <label className="t-label">Destination</label>
                    <select style={{ width: '100%', padding: '10px', marginTop: '4px' }}>
                      <option>Savings Account</option>
                      <option>Investment Portfolio</option>
                    </select>
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Confirm Transfer
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
