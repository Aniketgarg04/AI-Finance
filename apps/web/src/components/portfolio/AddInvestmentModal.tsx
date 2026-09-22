'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface AddInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export default function AddInvestmentModal({ isOpen, onClose, onAdded }: AddInvestmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [assetType, setAssetType] = useState('STOCK');
  const [assetSymbol, setAssetSymbol] = useState('');
  const [assetName, setAssetName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  
  // Dynamic fields
  const [nav, setNav] = useState('');
  const [sipAmount, setSipAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [maturityDate, setMaturityDate] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload: any = {
        assetType,
        assetSymbol,
        assetName,
        quantity: parseFloat(quantity),
        buyPrice: parseFloat(buyPrice),
      };

      if (assetType === 'MF') {
        if (nav) payload.nav = parseFloat(nav);
        if (sipAmount) payload.sipAmount = parseFloat(sipAmount);
      } else if (assetType === 'FD') {
        if (interestRate) payload.interestRate = parseFloat(interestRate);
        if (maturityDate) payload.maturityDate = maturityDate;
      }

      await api.post('/portfolios', payload);
      onAdded();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add investment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[var(--surface)] border border-[var(--border)] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
            <h3 className="font-semibold text-[var(--text-primary)]">Add Investment</h3>
            <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {error && <p className="text-red-400 text-sm">{error}</p>}
            
            <div>
              <label className="block text-xs text-[var(--text-muted)] mb-1">Asset Type</label>
              <select 
                value={assetType}
                onChange={(e) => setAssetType(e.target.value)}
                className="w-full bg-black/20 border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)]"
                required
              >
                <option value="STOCK">Stock</option>
                <option value="MF">Mutual Fund</option>
                <option value="FD">Fixed Deposit</option>
                <option value="GOLD">Gold</option>
                <option value="CRYPTO">Cryptocurrency</option>
                <option value="REAL_ESTATE">Real Estate</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Asset Symbol</label>
                <input 
                  type="text" value={assetSymbol} onChange={(e) => setAssetSymbol(e.target.value)}
                  placeholder="e.g. AAPL"
                  className="w-full bg-black/20 border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Asset Name</label>
                <input 
                  type="text" value={assetName} onChange={(e) => setAssetName(e.target.value)}
                  placeholder="e.g. Apple Inc" required
                  className="w-full bg-black/20 border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Quantity</label>
                <input 
                  type="number" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)}
                  required min="0"
                  className="w-full bg-black/20 border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)]"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--text-muted)] mb-1">Buy Price</label>
                <input 
                  type="number" step="any" value={buyPrice} onChange={(e) => setBuyPrice(e.target.value)}
                  required min="0"
                  className="w-full bg-black/20 border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)]"
                />
              </div>
            </div>

            {/* Dynamic Fields */}
            {assetType === 'MF' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">NAV (Optional)</label>
                  <input 
                    type="number" step="any" value={nav} onChange={(e) => setNav(e.target.value)}
                    className="w-full bg-black/20 border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">SIP Amount (Optional)</label>
                  <input 
                    type="number" step="any" value={sipAmount} onChange={(e) => setSipAmount(e.target.value)}
                    className="w-full bg-black/20 border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)]"
                  />
                </div>
              </div>
            )}

            {assetType === 'FD' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">Interest Rate (%)</label>
                  <input 
                    type="number" step="any" value={interestRate} onChange={(e) => setInterestRate(e.target.value)}
                    className="w-full bg-black/20 border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1">Maturity Date</label>
                  <input 
                    type="date" value={maturityDate} onChange={(e) => setMaturityDate(e.target.value)}
                    className="w-full bg-black/20 border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)]"
                  />
                </div>
              </div>
            )}

            <div className="pt-2">
              <button 
                type="submit" disabled={loading}
                className="w-full bg-[var(--primary)] text-white py-2 rounded-xl font-semibold hover:bg-opacity-90 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Save Investment'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
