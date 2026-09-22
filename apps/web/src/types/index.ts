/**
 * TypeScript type definitions — AI Finance Copilot
 * Central type registry for all domain models
 */

// ── Auth ────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  name: string;
  employmentType?: 'SALARIED' | 'BUSINESS';
  annualIncome?: number;
  avatarUrl?: string;
  createdAt: string;
  isProfileComplete?: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

// ── Transaction / Expense ───────────────────────────────────
export type ExpenseCategory =
  | 'Food'
  | 'Travel'
  | 'Shopping'
  | 'Bills'
  | 'Education'
  | 'Entertainment'
  | 'Healthcare'
  | 'Investments'
  | 'Others';

export type TransactionType = 'debit' | 'credit';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: ExpenseCategory;
  date: string;
  note?: string;
  isRecurring?: boolean;
  isFlagged?: boolean;
}

export interface CategoryTotal {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
  color: string;
}

// ── Budget ─────────────────────────────────────────────────
export interface Budget {
  id: string;
  category: ExpenseCategory;
  limit: number;
  spent: number;
  month: string; // "2024-01"
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  targetDate: string;
  icon: string;
}

// ── Portfolio ────────────────────────────────────────────────
export interface Holding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  sector: string;
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;       // absolute
  changePercent: number;
  sector: string;
}

export interface SectorAllocation {
  sector: string;
  value: number;
  percentage: number;
  color: string;
}

// ── Tax ─────────────────────────────────────────────────────
export interface TaxInput {
  grossSalary: number;
  otherIncome: number;
  section80C: number;   // max 1.5L
  section80D: number;   // medical
  hra: number;
  homeLoanInterest: number;
}

export interface TaxResult {
  taxableIncome: number;
  taxOldRegime: number;
  taxNewRegime: number;
  recommendedRegime: 'old' | 'new';
  effectiveTaxRate: number;
  savings: number;
}

export interface Deduction {
  id: string;
  section: string;
  description: string;
  maxLimit: number;
  claimed: number;
  potential: number;
}

// ── Fraud Alert ─────────────────────────────────────────────
export type AlertSeverity = 'low' | 'medium' | 'high';
export type AlertType =
  | 'duplicate'
  | 'large_transaction'
  | 'unusual_pattern'
  | 'suspicious_merchant'
  | 'location_anomaly';

export interface FraudAlert {
  id: string;
  transactionId: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  type: AlertType;
  amount: number;
  date: string;
  isResolved: boolean;
}

// ── Chart Data ───────────────────────────────────────────────
export interface MonthlyDataPoint {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  balance: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// ── Dashboard Stats ─────────────────────────────────────────
export interface DashboardStats {
  totalBalance: number;
  balanceChange: number;       // % vs last month
  monthlyExpenses: number;
  expenseChange: number;
  monthlySavings: number;
  savingsChange: number;
  budgetUsed: number;          // percentage
  budgetChange: number;
}
