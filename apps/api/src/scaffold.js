const fs = require('fs');
const path = require('path');

const modules = [
  {
    name: 'budgets',
    model: 'budget',
    fields: 'category: data.category, limit: data.limit, month: data.month, year: data.year',
  },
  {
    name: 'goals',
    model: 'goal',
    fields: 'name: data.name, targetAmount: data.targetAmount, currentAmount: data.currentAmount, deadline: data.deadline ? new Date(data.deadline) : undefined',
  },
  {
    name: 'portfolios',
    model: 'portfolio',
    fields: 'assetSymbol: data.assetSymbol, assetName: data.assetName, quantity: data.quantity, buyPrice: data.buyPrice, currentPrice: data.currentPrice',
  },
  {
    name: 'taxes',
    model: 'taxRecord',
    fields: 'year: data.year, taxableIncome: data.taxableIncome, estimatedTax: data.estimatedTax, deductions: data.deductions',
  },
  {
    name: 'alerts',
    model: 'fraudAlert',
    fields: 'transactionId: data.transactionId, reason: data.reason, resolved: data.resolved',
  },
  {
    name: 'chat',
    model: 'aIChat',
    fields: 'prompt: data.prompt, response: data.response',
  }
];

modules.forEach(mod => {
  const dir = path.join(__dirname, mod.name);
  
  // Controller
  const ctrlPath = path.join(dir, `${mod.name}.controller.ts`);
  const ctrlCode = `import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { ${mod.name.charAt(0).toUpperCase() + mod.name.slice(1)}Service } from './${mod.name}.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('${mod.name}')
export class ${mod.name.charAt(0).toUpperCase() + mod.name.slice(1)}Controller {
  constructor(private readonly service: ${mod.name.charAt(0).toUpperCase() + mod.name.slice(1)}Service) {}

  @Post()
  create(@Req() req: any, @Body() dto: any) {
    return this.service.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.service.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.service.findOne(req.user.userId, id);
  }

  @Put(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: any) {
    return this.service.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.service.remove(req.user.userId, id);
  }
}
`;
  fs.writeFileSync(ctrlPath, ctrlCode);

  // Service
  const srvPath = path.join(dir, `${mod.name}.service.ts`);
  const srvCode = `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ${mod.name.charAt(0).toUpperCase() + mod.name.slice(1)}Service {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: any) {
    return this.prisma.${mod.model}.create({
      data: {
        userId,
        ${mod.fields}
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.${mod.model}.findMany({
      where: { userId },
    });
  }

  async findOne(userId: string, id: string) {
    return this.prisma.${mod.model}.findFirst({
      where: { id, userId },
    });
  }

  async update(userId: string, id: string, data: any) {
    return this.prisma.${mod.model}.updateMany({
      where: { id, userId },
      data,
    });
  }

  async remove(userId: string, id: string) {
    return this.prisma.${mod.model}.deleteMany({
      where: { id, userId },
    });
  }
}
`;
  fs.writeFileSync(srvPath, srvCode);
});

console.log('Done scaffolding all modules');
