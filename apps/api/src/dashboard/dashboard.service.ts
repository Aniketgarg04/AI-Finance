import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private prisma: PrismaService) {}

  async getSummary(userId: string) {
    try {
      const currentMonthStart = new Date();
      currentMonthStart.setDate(1);
      currentMonthStart.setHours(0, 0, 0, 0);

      const [
        totalIncomeAgg,
        totalExpensesAgg,
        currentMonthIncomeAgg,
        currentMonthExpensesAgg,
        emiExpensesAgg,
        bankAccounts,
        portfolios,
        goals,
        activeBudgetsCount,
        upcomingBills,
        taxRecords,
        recentTransactions
      ] = await Promise.all([
        this.prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { userId, type: 'INCOME' }
        }),
        this.prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { userId, type: 'EXPENSE' }
        }),
        this.prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { userId, type: 'INCOME', date: { gte: currentMonthStart } }
        }),
        this.prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { userId, type: 'EXPENSE', date: { gte: currentMonthStart } }
        }),
        this.prisma.transaction.aggregate({
          _sum: { amount: true },
          where: { 
            userId, 
            type: 'EXPENSE', 
            date: { gte: currentMonthStart },
            OR: [
              { category: { contains: 'emi', mode: 'insensitive' } },
              { category: { contains: 'loan', mode: 'insensitive' } }
            ]
          }
        }),
        this.prisma.bankAccount.findMany({ where: { userId }, select: { balance: true } }),
        this.prisma.portfolio.findMany({ where: { userId }, select: { quantity: true, buyPrice: true, currentPrice: true } }),
        this.prisma.goal.findMany({ where: { userId }, select: { name: true, currentAmount: true } }),
        this.prisma.budget.count({ where: { userId } }),
        this.prisma.bill.findMany({ 
          where: { userId, isPaid: false, dueDate: { gt: new Date() } },
          orderBy: { dueDate: 'asc' },
          take: 5
        }),
        this.prisma.taxRecord.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 1 }),
        this.prisma.transaction.findMany({ where: { userId }, orderBy: { date: 'desc' }, take: 5 })
      ]);

      const totalIncome = totalIncomeAgg._sum.amount || 0;
      const totalExpenses = totalExpensesAgg._sum.amount || 0;
      
      const cashBalance = bankAccounts.reduce((sum, b) => sum + b.balance, 0) || (totalIncome - totalExpenses);
      const investmentsValue = portfolios.reduce((sum, p) => sum + (p.quantity * (p.currentPrice || p.buyPrice)), 0);
      const netWorth = cashBalance + investmentsValue;

      const emergencyFund = goals.find(g => g.name.toLowerCase().includes('emergency'))?.currentAmount || 0;
      
      const monthlyIncome = currentMonthIncomeAgg._sum.amount || 0;
      const monthlyExpenses = currentMonthExpensesAgg._sum.amount || 0;
      const monthlySavings = monthlyIncome - monthlyExpenses;
      const emiExpenses = emiExpensesAgg._sum.amount || 0;

      const taxLiability = taxRecords.length > 0 ? Math.min(taxRecords[0].taxOldRegime, taxRecords[0].taxNewRegime) : 0;

      // Generate AI Insights via ML Service
      let insights: string[] = [];
      try {
        const mlPayload = {
          message: "Analyze the user's financial summary and provide exactly 3 very short, actionable insights. Do not include introductory text. Separate each insight with a newline.",
          user_context: {
            netWorth, cashBalance, investmentsValue, monthlyIncome, monthlyExpenses,
            monthlySavings, emergencyFund, activeBudgetsCount, upcomingBillsCount: upcomingBills.length,
            emiExpenses
          }
        };

        const mlResponse = await fetch(process.env.ML_API_URL || 'http://localhost:8000/api/v1/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mlPayload)
        });

        if (mlResponse.ok) {
          const mlData = await mlResponse.json();
          if (mlData.reply) {
            insights = mlData.reply.split('\n')
              .map((i: string) => i.replace(/^[-\d.\s]+/, '').trim())
              .filter((i: string) => i.length > 0);
          }
        } else {
          this.logger.warn(`ML Service responded with status: ${mlResponse.status}`);
        }
      } catch (err: any) {
        this.logger.warn(`Failed to generate AI insights: ${err.message}`);
      }

      // Fallback insights if ML fails
      if (insights.length === 0) {
        if (monthlyExpenses > monthlyIncome * 0.8) {
          insights.push("You're spending more than 80% of your monthly income. Consider reviewing your budgets.");
        }
        if (upcomingBills.length > 0) {
          insights.push(`You have ${upcomingBills.length} upcoming bill(s) to pay soon.`);
        }
        if (emergencyFund < (monthlyExpenses * 3) && monthlyExpenses > 0) {
          insights.push("Your emergency fund is less than 3 months of expenses. Consider boosting it.");
        }
        if (insights.length === 0) {
          insights.push("Your finances are looking healthy this month!");
        }
      }

      return {
        netWorth,
        totalInvestments: investmentsValue,
        cashBalance,
        emergencyFund,
        monthlySavings,
        taxLiability,
        activeBudgetsCount,
        upcomingBillsCount: upcomingBills.length,
        emiExpenses,
        insights: insights.slice(0, 3),
        recentTransactions,
        recentBills: upcomingBills.slice(0, 3)
      };
    } catch (error: any) {
      this.logger.error(`Error generating dashboard summary: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Failed to load dashboard summary');
    }
  }
}
