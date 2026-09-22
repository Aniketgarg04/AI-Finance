export interface Transaction {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  description?: string;
  date: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  category: string;
}

export interface DashboardSummaryResponse {
  netWorth: number;
  totalInvestments: number;
  cashBalance: number;
  emergencyFund: number;
  monthlySavings: number;
  taxLiability: number;
  activeBudgetsCount: number;
  upcomingBillsCount: number;
  emiExpenses: number;
  insights: string[];
  recentTransactions: Transaction[];
  recentBills: Bill[];
}
