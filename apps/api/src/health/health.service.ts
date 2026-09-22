import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class HealthService {
  async calculateHealthScore(userId: string) {
    // 1. Fetch user data (transactions for the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transactions = await prisma.transaction.findMany({
      where: { userId, date: { gte: thirtyDaysAgo } }
    });

    let income = 0;
    let expenses = 0;

    transactions.forEach(t => {
      if (t.type === 'INCOME') income += t.amount;
      else expenses += t.amount;
    });

    // 2. Base Score Engine (0-100)
    let score = 50; // Base score
    const details = [];

    // Savings Rate (Income vs Expenses)
    if (income > 0) {
      const savingsRate = ((income - expenses) / income) * 100;
      if (savingsRate >= 20) {
        score += 20;
        details.push("Excellent savings rate (>= 20%).");
      } else if (savingsRate > 0) {
        score += 10;
        details.push("Positive savings rate, but could be improved.");
      } else {
        score -= 15;
        details.push("Spending exceeds income this month.");
      }
    } else {
      details.push("No income recorded this month.");
    }

    // Checking Budgets
    const budgets = await prisma.budget.findMany({ where: { userId } });
    if (budgets.length > 0) {
      let overBudgetCount = 0;
      for (const budget of budgets) {
        const categorySpend = transactions
          .filter(t => t.type === 'EXPENSE' && t.category === budget.category)
          .reduce((sum, t) => sum + t.amount, 0);
        
        if (categorySpend > budget.limit) {
          overBudgetCount++;
        }
      }
      
      if (overBudgetCount === 0) {
        score += 15;
        details.push("Staying within all budgets.");
      } else {
        score -= (overBudgetCount * 5); // Subtract 5 for each over-budget category
        details.push(`Exceeded budget in ${overBudgetCount} categories.`);
      }
    }

    // Emergency Fund (Cash/Savings Balance)
    const accounts = await prisma.bankAccount.findMany({ where: { userId } });
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    
    if (totalBalance >= (expenses * 3)) { // 3 months of expenses
      score += 15;
      details.push("Strong emergency fund.");
    } else {
      details.push("Emergency fund is less than 3 months of expenses.");
    }

    // Cap Score between 0 and 100
    score = Math.max(0, Math.min(100, score));

    return {
      score,
      status: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Poor',
      details
    };
  }
}
