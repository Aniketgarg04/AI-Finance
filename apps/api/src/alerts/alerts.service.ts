import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: any) {
    return this.prisma.fraudAlert.create({
      data: {
        userId,
        transactionId: data.transactionId,
        reason: data.reason,
        resolved: data.resolved
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.fraudAlert.findMany({
      where: { userId },
    });
  }

  async findOne(userId: string, id: string) {
    return this.prisma.fraudAlert.findFirst({
      where: { id, userId },
    });
  }

  async update(userId: string, id: string, data: any) {
    return this.prisma.fraudAlert.updateMany({
      where: { id, userId },
      data,
    });
  }

  async remove(userId: string, id: string) {
    return this.prisma.fraudAlert.deleteMany({
      where: { id, userId },
    });
  }
}
