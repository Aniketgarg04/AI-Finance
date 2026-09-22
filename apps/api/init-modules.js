const fs = require('fs');
const path = require('path');

const modules = ['transactions', 'budgets', 'goals', 'portfolios', 'taxes', 'alerts', 'chat'];

modules.forEach(m => {
  const dir = path.join(__dirname, 'src', m);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const capitalized = m.charAt(0).toUpperCase() + m.slice(1);
  const classNamePrefix = capitalized; // Transactions, Budgets...

  const moduleContent = `import { Module } from '@nestjs/common';
import { ${classNamePrefix}Controller } from './${m}.controller';
import { ${classNamePrefix}Service } from './${m}.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [${classNamePrefix}Controller],
  providers: [${classNamePrefix}Service],
})
export class ${classNamePrefix}Module {}
`;

  const controllerContent = `import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ${classNamePrefix}Service } from './${m}.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('${m}')
export class ${classNamePrefix}Controller {
  constructor(private readonly service: ${classNamePrefix}Service) {}

  @Post()
  create(@Body() dto: any) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
`;

  const serviceContent = `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ${classNamePrefix}Service {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: any) {
    // TODO: Implementation
    return { message: 'Created' };
  }

  async findAll() {
    // TODO: Implementation
    return [];
  }

  async findOne(id: string) {
    // TODO: Implementation
    return { id };
  }

  async update(id: string, data: any) {
    // TODO: Implementation
    return { id, updated: true };
  }

  async remove(id: string) {
    // TODO: Implementation
    return { id, deleted: true };
  }
}
`;

  fs.writeFileSync(path.join(dir, `${m}.module.ts`), moduleContent);
  fs.writeFileSync(path.join(dir, `${m}.controller.ts`), controllerContent);
  fs.writeFileSync(path.join(dir, `${m}.service.ts`), serviceContent);
});

// Update app.module.ts
let appModule = fs.readFileSync(path.join(__dirname, 'src', 'app.module.ts'), 'utf8');

// remove old transactions import
appModule = appModule.replace(/import { TransactionsModule } from '.\/transactions\/transactions.module';\n/, '');

const imports = modules.map(m => {
  const cap = m.charAt(0).toUpperCase() + m.slice(1);
  return `import { ${cap}Module } from './${m}/${m}.module';`;
}).join('\\n');

appModule = appModule.replace(/import { AuthModule } from '.\/auth\/auth.module';/, `import { AuthModule } from './auth/auth.module';\n${imports}`);

const moduleClasses = modules.map(m => m.charAt(0).toUpperCase() + m.slice(1) + 'Module').join(', ');
appModule = appModule.replace(/imports: \[PrismaModule, AuthModule(.*?)\]/, `imports: [PrismaModule, AuthModule, ${moduleClasses}]`);

fs.writeFileSync(path.join(__dirname, 'src', 'app.module.ts'), appModule.replace(/\\n/g, '\n'));

console.log("Modules generated successfully!");
