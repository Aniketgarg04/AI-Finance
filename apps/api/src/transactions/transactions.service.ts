import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: any) {
    let category = data.category;
    let isFraud = false;
    let fraudReason = null;

    if (data.type === 'EXPENSE') {
      try {
        // 1. Auto-categorization
        if (!category || category === 'Other') {
          const catRes = await fetch('http://localhost:8000/api/v1/categorize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ description: data.description || 'Unknown', amount: data.amount })
          });
          if (catRes.ok) {
            const catData = await catRes.json();
            category = catData.category;
          }
        }

        // 2. Fraud Detection
        const fraudRes = await fetch('http://localhost:8000/api/v1/fraud-detect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            amount: data.amount,
            merchant: data.description || 'Unknown'
          })
        });
        if (fraudRes.ok) {
          const fraudData = await fraudRes.json();
          if (fraudData.is_fraud) {
            isFraud = true;
            fraudReason = fraudData.reason;
          }
        }
      } catch (err) {
        console.error('ML Service Error:', err);
      }
    }

    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        amount: parseFloat((data.amount || 0).toString()),
        type: data.type,
        category: category || 'Other',
        description: data.description,
        date: data.date ? new Date(data.date) : undefined,
      },
    });

    if (isFraud && fraudReason) {
      await this.prisma.fraudAlert.create({
        data: {
          userId,
          transactionId: transaction.id,
          reason: fraudReason,
        }
      });
    }

    return transaction;
  }

  async findAll(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    return this.prisma.transaction.findFirst({
      where: { id, userId },
    });
  }

  async update(userId: string, id: string, data: any) {
    return this.prisma.transaction.updateMany({
      where: { id, userId },
      data,
    });
  }

  async remove(userId: string, id: string) {
    return this.prisma.transaction.deleteMany({
      where: { id, userId },
    });
  }
}
