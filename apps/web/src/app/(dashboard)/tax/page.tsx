'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, CheckCircle2, FileDown, Save } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';

const DEFAULT_INPUTS = {
  grossSalary: '',
  hra: '',
  specialAllowance: '',
  bonus: '',
  otherIncome: '',
  housePropertyIncome: '',
  capitalGains: '',
  businessIncome: '',
  investments80C: '',
  investments80D: '',
  investments80E: '',
  professionalTax: '',
  tdsPaid: '',
};

export default function TaxPage() {
  const { user, _hasHydrated } = useAuthStore();
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (_hasHydrated && user) {
      fetchHistory();
    }
  }, [_hasHydrated, user]);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/taxes');
      setHistory(res.data);
      if (res.data.length > 0) {
        // Pre-fill with most recent
        const recent = res.data[0];
        setInputs({
          grossSalary: recent.grossSalary || '',
          hra: recent.hra || '',
          specialAllowance: recent.specialAllowance || '',
          bonus: recent.bonus || '',
          otherIncome: recent.otherIncome || '',
          housePropertyIncome: recent.housePropertyIncome || '',
          capitalGains: recent.capitalGains || '',
          businessIncome: recent.businessIncome || '',
          investments80C: recent.investments80C || '',
          investments80D: recent.investments80D || '',
          investments80E: recent.investments80E || '',
          professionalTax: recent.professionalTax || '',
          tdsPaid: recent.tdsPaid || '',
        });
        setResult(recent);
      }
    } catch (e) {
      console.error('Failed to fetch tax history');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const calculateAndSave = async () => {
    setIsLoading(true);
    try {
      const numericInputs = Object.fromEntries(
        Object.entries(inputs).map(([k, v]) => [k, Number(v) || 0])
      );
      const res = await api.post('/taxes/calculate-and-save', { year: 2024, ...numericInputs });
      setResult(res.data);
      fetchHistory(); // Refresh history
    } catch (e) {
      console.error('Calculation failed', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!_hasHydrated) return null;

  const isBusiness = user?.employmentType === 'BUSINESS';
  const bestRegime = result ? (result.taxOldRegime < result.taxNewRegime ? 'old' : 'new') : null;
  const savings = result ? Math.abs(result.taxOldRegime - result.taxNewRegime) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Tax Assistant</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            Comprehensive Tax Calculator (FY 2024-25)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4">
          <div className="card-glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Calculator size={16} className="text-[var(--primary)]" /> Income Sources
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {!isBusiness && (
                <>
                  <InputField label="Gross Salary" name="grossSalary" value={inputs.grossSalary} onChange={handleInputChange} />
                  <InputField label="HRA Received" name="hra" value={inputs.hra} onChange={handleInputChange} />
                  <InputField label="Special Allowance" name="specialAllowance" value={inputs.specialAllowance} onChange={handleInputChange} />
                  <InputField label="Bonus" name="bonus" value={inputs.bonus} onChange={handleInputChange} />
                </>
              )}
              {isBusiness && (
                <InputField label="Business/Prof. Income" name="businessIncome" value={inputs.businessIncome} onChange={handleInputChange} />
              )}
              <InputField label="House Property Income" name="housePropertyIncome" value={inputs.housePropertyIncome} onChange={handleInputChange} />
              <InputField label="Capital Gains" name="capitalGains" value={inputs.capitalGains} onChange={handleInputChange} />
              <InputField label="Other Income (Interest, etc.)" name="otherIncome" value={inputs.otherIncome} onChange={handleInputChange} />
            </div>
          </div>

          <div className="card-glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Calculator size={16} className="text-[var(--primary)]" /> Deductions & Taxes
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <InputField label="Sec 80C (PPF, ELSS, EPF)" name="investments80C" value={inputs.investments80C} onChange={handleInputChange} />
              <InputField label="Sec 80D (Health Insurance)" name="investments80D" value={inputs.investments80D} onChange={handleInputChange} />
              <InputField label="Sec 80E (Education Loan)" name="investments80E" value={inputs.investments80E} onChange={handleInputChange} />
              <InputField label="Professional Tax" name="professionalTax" value={inputs.professionalTax} onChange={handleInputChange} />
              <InputField label="TDS Already Paid" name="tdsPaid" value={inputs.tdsPaid} onChange={handleInputChange} />
            </div>
          </div>

          <button
            onClick={calculateAndSave}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl
                       bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-hover)]
                       transition-colors shadow-lg shadow-violet-900/30 disabled:opacity-70"
          >
            {isLoading ? 'Calculating...' : <><Save size={18} /> Calculate & Save Record</>}
          </button>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {result ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <RegimeCard 
                  title="Old Regime" 
                  taxable={result.taxableIncomeOld} 
                  tax={result.taxOldRegime} 
                  isRecommended={bestRegime === 'old'} 
                />
                <RegimeCard 
                  title="New Regime" 
                  taxable={result.taxableIncomeNew} 
                  tax={result.taxNewRegime} 
                  isRecommended={bestRegime === 'new'} 
                />
              </div>

              {savings > 0 && (
                <div className="card-glass rounded-2xl p-4 flex items-center gap-3 border-green-500/30 glow-primary">
                  <CheckCircle2 size={24} className="text-green-400 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      You save {formatCurrency(savings)} with the {bestRegime?.toUpperCase()} regime
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Your optimal tax liability is {formatCurrency(Math.min(result.taxOldRegime, result.taxNewRegime))}.
                    </p>
                  </div>
                </div>
              )}

              <div className="card-glass rounded-2xl p-5">
                 <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Calculation Breakdown</h3>
                 <div className="space-y-2 text-xs text-[var(--text-secondary)]">
                    <div className="flex justify-between border-b border-[var(--border-default)] pb-1">
                      <span>Standard Deduction</span>
                      <span>{formatCurrency(result.standardDeduction)}</span>
                    </div>
                    <div className="flex justify-between border-b border-[var(--border-default)] pb-1">
                      <span>Total 80C + 80D + 80E (Old only)</span>
                      <span>{formatCurrency(result.investments80C + result.investments80D + result.investments80E)}</span>
                    </div>
                    <div className="flex justify-between pt-1 font-semibold text-[var(--text-primary)]">
                      <span>TDS Deducted</span>
                      <span className="text-red-400">-{formatCurrency(result.tdsPaid)}</span>
                    </div>
                    <div className="flex justify-between pt-1 font-semibold text-[var(--text-primary)]">
                      <span>Net Tax Payable (Best Regime)</span>
                      <span className="text-green-400">
                        {formatCurrency(Math.max(0, Math.min(result.taxOldRegime, result.taxNewRegime) - result.tdsPaid))}
                      </span>
                    </div>
                 </div>
              </div>
            </>
          ) : (
            <div className="card-glass rounded-2xl p-10 flex flex-col items-center justify-center text-center border-dashed border-[var(--border-strong)] h-full">
              <Calculator size={48} className="text-[var(--text-disabled)] mb-4" />
              <p className="text-[var(--text-secondary)] font-medium">Enter your details</p>
              <p className="text-xs text-[var(--text-muted)] mt-2 max-w-[250px]">
                Fill out the comprehensive income and deduction form to calculate your optimal tax regime.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InputField({ label, name, value, onChange }: { label: string, name: string, value: string, onChange: (e: any) => void }) {
  return (
    <div>
      <label className="text-[11px] font-medium text-[var(--text-secondary)] mb-1 block">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">₹</span>
        <input
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          className="w-full pl-7 pr-3 py-2 text-sm rounded-xl outline-none bg-[var(--bg-elevated)] border border-[var(--border-default)] focus:border-[var(--primary)] transition-colors"
          placeholder="0"
        />
      </div>
    </div>
  );
}

function RegimeCard({ title, taxable, tax, isRecommended }: { title: string, taxable: number, tax: number, isRecommended: boolean }) {
  return (
    <motion.div
      animate={{ scale: isRecommended ? 1.02 : 1 }}
      className={`card-glass rounded-2xl p-4 relative transition-all duration-300
        ${isRecommended ? 'border-[var(--primary)] shadow-[0_0_15px_rgba(124,58,237,0.3)]' : ''}`}
    >
      {isRecommended && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-semibold
                         bg-[var(--primary)] text-white px-3 py-0.5 rounded-full whitespace-nowrap shadow-md">
          Recommended
        </span>
      )}
      <p className="text-xs font-semibold text-[var(--text-muted)] capitalize mb-2">{title}</p>
      
      <div className="space-y-1 mb-3">
        <p className="text-[10px] text-[var(--text-secondary)]">Taxable Income</p>
        <p className="text-sm font-medium text-[var(--text-primary)]">{formatCurrency(taxable)}</p>
      </div>

      <div className="space-y-1">
        <p className="text-[10px] text-[var(--text-secondary)]">Computed Tax</p>
        <p className="text-xl font-bold font-mono text-[var(--text-primary)]">
          {formatCurrency(tax)}
        </p>
      </div>
    </motion.div>
  );
}
