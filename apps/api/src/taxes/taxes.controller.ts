import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { TaxesService } from './taxes.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('taxes')
export class TaxesController {
  constructor(private readonly service: TaxesService) {}

  @Post('calculate-and-save')
  calculateAndSave(@Req() req: any, @Body() dto: any) {
    return this.service.calculateAndSave(req.user.userId, dto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.service.findAll(req.user.userId);
  }
}
