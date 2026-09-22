import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BillsService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, data: any) {
    return this.prisma.bill.create({
      data: { ...data, userId },
    });
  }

  findAll(userId: string) {
    return this.prisma.bill.findMany({ where: { userId }, orderBy: { dueDate: 'asc' } });
  }

  findOne(userId: string, id: string) {
    return this.prisma.bill.findFirst({ where: { id, userId } });
  }

  update(userId: string, id: string, data: any) {
    return this.prisma.bill.updateMany({
      where: { id, userId },
      data,
    });
  }

  remove(userId: string, id: string) {
    return this.prisma.bill.deleteMany({
      where: { id, userId },
    });
  }
}
