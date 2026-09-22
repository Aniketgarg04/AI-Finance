import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BudgetsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: any) {
    return this.prisma.budget.create({
      data: {
        userId,
        category: data.category || 'Other', 
        limit: parseFloat((data.limit || 0).toString()), 
        month: parseInt((data.month || new Date().getMonth() + 1).toString()), 
        year: parseInt((data.year || new Date().getFullYear()).toString())
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.budget.findMany({
      where: { userId },
    });
  }

  async findOne(userId: string, id: string) {
    return this.prisma.budget.findFirst({
      where: { id, userId },
    });
  }

  async update(userId: string, id: string, data: any) {
    return this.prisma.budget.updateMany({
      where: { id, userId },
      data,
    });
  }

  async remove(userId: string, id: string) {
    return this.prisma.budget.deleteMany({
      where: { id, userId },
    });
  }
}
