import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: any) {
    let aiResponse = data.response;

    if (!aiResponse) {
      try {
        // Automatically fetch user's current portfolio to give context to the AI
        const userPortfolio = await this.prisma.portfolio.findMany({
          where: { userId },
        });

        const chatHistory = await this.prisma.aIChat.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 10,
        });
        const history = chatHistory.reverse().map(h => ({ prompt: h.prompt, response: h.response }));

        const mlRes = await fetch('http://localhost:8000/api/v1/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: data.prompt,
            user_context: { portfolio: userPortfolio },
            history: history
          }),
        });
        if (mlRes.ok) {
          const mlData = await mlRes.json();
          aiResponse = mlData.reply;
        } else {
          aiResponse = "Sorry, the AI service is currently unavailable.";
        }
      } catch (err) {
        aiResponse = "Sorry, I couldn't reach the AI service.";
      }
    }

    return this.prisma.aIChat.create({
      data: {
        userId,
        prompt: data.prompt,
        response: aiResponse || "No response generated.",
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.aIChat.findMany({
      where: { userId },
    });
  }

  async findOne(userId: string, id: string) {
    return this.prisma.aIChat.findFirst({
      where: { id, userId },
    });
  }

  async update(userId: string, id: string, data: any) {
    return this.prisma.aIChat.updateMany({
      where: { id, userId },
      data,
    });
  }

  async remove(userId: string, id: string) {
    return this.prisma.aIChat.deleteMany({
      where: { id, userId },
    });
  }
}
