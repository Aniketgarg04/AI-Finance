import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Injectable()
export class NotificationsService {
  async getNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20, // Limit to recent 20
    });
  }

  async markAsRead(id: string, userId: string) {
    // Ensure the user owns the notification before updating
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }
}
