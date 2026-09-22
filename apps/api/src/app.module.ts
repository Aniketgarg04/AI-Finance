import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TransactionsModule } from './transactions/transactions.module';
import { BudgetsModule } from './budgets/budgets.module';
import { GoalsModule } from './goals/goals.module';
import { PortfoliosModule } from './portfolios/portfolios.module';
import { TaxesModule } from './taxes/taxes.module';
import { AlertsModule } from './alerts/alerts.module';
import { ChatModule } from './chat/chat.module';
import { BankAccountsModule } from './bank-accounts/bank-accounts.module';
import { BillsModule } from './bills/bills.module';
import { DashboardModule } from './dashboard/dashboard.module';

import { ConfigModule } from '@nestjs/config';
import { NotificationsModule } from './notifications/notifications.module';
import { ReportsModule } from './reports/reports.module';
import { HealthModule } from './health/health.module';
import { InsightsModule } from './insights/insights.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    TransactionsModule,
    BudgetsModule,
    GoalsModule,
    PortfoliosModule,
    TaxesModule,
    AlertsModule,
    ChatModule,
    BankAccountsModule,
    BillsModule,
    DashboardModule,
    NotificationsModule,
    ReportsModule,
    HealthModule,
    InsightsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
