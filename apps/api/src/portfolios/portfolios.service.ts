import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PortfoliosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: any) {
    return this.prisma.portfolio.create({
      data: {
        userId,
        ...data,
        buyDate: data.buyDate ? new Date(data.buyDate) : new Date(),
        maturityDate: data.maturityDate ? new Date(data.maturityDate) : null,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.portfolio.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async refreshPrices(userId: string) {
    const holdings = await this.prisma.portfolio.findMany({ where: { userId } });
    if (holdings.length === 0) return [];

    try {
      const res = await fetch('http://localhost:8000/api/v1/stock-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolio_data: holdings }),
      });

      if (res.ok) {
        const data = await res.json();
        const enriched = data.enriched_holdings || [];

        for (const item of enriched) {
          if (item.symbol && item.current_price) {
            await this.prisma.portfolio.updateMany({
              where: { userId, assetSymbol: item.symbol },
              data: { currentPrice: item.current_price },
            });
          }
        }
      }
    } catch (e) {
      console.error('Error auto-refreshing prices:', e);
    }

    return this.prisma.portfolio.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    return this.prisma.portfolio.findFirst({
      where: { id, userId },
    });
  }

  async update(userId: string, id: string, data: any) {
    return this.prisma.portfolio.updateMany({
      where: { id, userId },
      data,
    });
  }

  async remove(userId: string, id: string) {
    return this.prisma.portfolio.deleteMany({
      where: { id, userId },
    });
  }

  async initiateDematConsent(phone: string, panOrDemat: string, brokerName: string = 'AccountAggregator') {
    try {
      const res = await fetch('http://localhost:8000/api/v1/demat/initiate-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phone,
          pan_or_demat: panOrDemat,
          broker_name: brokerName,
        }),
      });
      if (!res.ok) throw new Error(`AA service error: ${res.statusText}`);
      return await res.json();
    } catch (err: any) {
      throw new Error(`Failed to initiate Demat verification: ${err.message}`);
    }
  }

  async verifyDematOtp(userId: string, consentHandle: string, otp: string, brokerName: string = 'AccountAggregator') {
    try {
      const res = await fetch('http://localhost:8000/api/v1/demat/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consent_handle: consentHandle,
          otp,
          broker_name: brokerName,
        }),
      });

      if (!res.ok) throw new Error(`OTP verification failed: ${res.statusText}`);
      const data = await res.json();
      const holdings = data.holdings || [];

      // Save synced items
      const syncedItems = [];
      for (const item of holdings) {
        const existing = await this.prisma.portfolio.findFirst({
          where: { userId, assetSymbol: item.symbol },
        });

        if (existing) {
          const updated = await this.prisma.portfolio.update({
            where: { id: existing.id },
            data: {
              quantity: item.quantity,
              buyPrice: item.buy_price,
              currentPrice: item.current_price || item.buy_price,
              assetName: item.name,
              assetType: item.asset_type || 'STOCK',
            },
          });
          syncedItems.push(updated);
        } else {
          const created = await this.prisma.portfolio.create({
            data: {
              userId,
              assetSymbol: item.symbol,
              assetName: item.name,
              quantity: item.quantity,
              buyPrice: item.buy_price,
              currentPrice: item.current_price || item.buy_price,
              assetType: item.asset_type || 'STOCK',
            },
          });
          syncedItems.push(created);
        }
      }

      return {
        status: 'success',
        broker: brokerName,
        syncedCount: syncedItems.length,
        items: syncedItems,
        message: `Successfully verified OTP and imported ${syncedItems.length} holdings from ${brokerName}.`,
      };
    } catch (err: any) {
      throw new Error(`Failed to verify Demat OTP: ${err.message}`);
    }
  }

  async syncDemat(
    userId: string, 
    brokerName: string = 'Zerodha', 
    dematAccountNumber?: string,
    panOrPhone?: string,
    token: string = 'demo_token'
  ) {
    try {
      const res = await fetch('http://localhost:8000/api/v1/demat/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          broker_name: brokerName, 
          demat_account_number: dematAccountNumber,
          pan_or_phone: panOrPhone,
          auth_token_or_client_id: token 
        }),
      });

      if (!res.ok) {
        throw new Error(`Demat service error: ${res.statusText}`);
      }

      const data = await res.json();
      const holdings = data.holdings || [];

      // Save or update each holding into user's portfolio table
      const syncedItems = [];
      for (const item of holdings) {
        // Upsert by checking if asset already exists
        const existing = await this.prisma.portfolio.findFirst({
          where: { userId, assetSymbol: item.symbol },
        });

        if (existing) {
          const updated = await this.prisma.portfolio.update({
            where: { id: existing.id },
            data: {
              quantity: item.quantity,
              buyPrice: item.buy_price,
              currentPrice: item.current_price || item.buy_price,
              assetName: item.name,
              assetType: item.asset_type || 'STOCK',
            },
          });
          syncedItems.push(updated);
        } else {
          const created = await this.prisma.portfolio.create({
            data: {
              userId,
              assetSymbol: item.symbol,
              assetName: item.name,
              quantity: item.quantity,
              buyPrice: item.buy_price,
              currentPrice: item.current_price || item.buy_price,
              assetType: item.asset_type || 'STOCK',
            },
          });
          syncedItems.push(created);
        }
      }

      return {
        status: 'success',
        broker: brokerName,
        syncedCount: syncedItems.length,
        items: syncedItems,
      };
    } catch (err: any) {
      throw new Error(`Failed to sync Demat account: ${err.message}`);
    }
  }

  async analyze(userId: string) {
    const portfolio = await this.prisma.portfolio.findMany({
      where: { userId },
    });

    try {
      const mlRes = await fetch('http://localhost:8000/api/v1/analyze-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolio_data: portfolio }),
      });
      if (mlRes.ok) {
        const data = await mlRes.json();
        return { analysis: data.analysis };
      }
      const errText = await mlRes.text();
      return { analysis: `AI service returned an error (${mlRes.status}): ${errText}` };
    } catch (err: any) {
      return { analysis: `Could not reach the AI service: ${err.message}` };
    }
  }
}
