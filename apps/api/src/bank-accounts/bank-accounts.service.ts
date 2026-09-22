import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BankAccountsService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, data: any) {
    return this.prisma.bankAccount.create({
      data: { ...data, userId },
    });
  }

  findAll(userId: string) {
    return this.prisma.bankAccount.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  findOne(userId: string, id: string) {
    return this.prisma.bankAccount.findFirst({ where: { id, userId } });
  }

  update(userId: string, id: string, data: any) {
    return this.prisma.bankAccount.updateMany({
      where: { id, userId },
      data,
    });
  }

  remove(userId: string, id: string) {
    return this.prisma.bankAccount.deleteMany({
      where: { id, userId },
    });
  }
}
