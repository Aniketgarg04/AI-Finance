import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class InsightsService {
  async generateInsights(userId: string) {
    // 1. Fetch user data (transactions, budgets)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transactions = await prisma.transaction.findMany({
      where: { userId, date: { gte: thirtyDaysAgo } }
    });
    const budgets = await prisma.budget.findMany({ where: { userId } });

    // In a full implementation, you would send this aggregated data 
    // to the `apps/ml-service` to generate natural language insights.
    
    // For now, we will compute some deterministic insights based on the data.
    const insights = [];

    // Analyze large transactions
    const largeExpenses = transactions.filter(t => t.type === 'EXPENSE' && t.amount > 500);
    if (largeExpenses.length > 0) {
      insights.push({
        type: 'WARNING',
        message: `You had ${largeExpenses.length} large expenses over $500 this month. Keep an eye on big purchases.`
      });
    }

    // Analyze budget utilization
    if (budgets.length > 0) {
      for (const budget of budgets) {
        const categorySpend = transactions
          .filter(t => t.type === 'EXPENSE' && t.category === budget.category)
          .reduce((sum, t) => sum + t.amount, 0);
        
        if (categorySpend > budget.limit) {
          insights.push({
            type: 'ALERT',
            message: `You've exceeded your ${budget.category} budget of $${budget.limit}. Current spend: $${categorySpend}.`
          });
        } else if (categorySpend > budget.limit * 0.8) {
          insights.push({
            type: 'WARNING',
            message: `You are nearing your ${budget.category} budget. $${budget.limit - categorySpend} remaining.`
          });
        }
      }
    }

    // If no negative insights, add a positive one
    if (insights.length === 0) {
      insights.push({
        type: 'POSITIVE',
        message: "Your finances look great this month! You are staying within your budgets and avoiding unusually large expenses."
      });
    }

    return { insights };
  }
}
