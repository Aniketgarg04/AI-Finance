import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { PortfoliosService } from './portfolios.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('portfolios')
export class PortfoliosController {
  constructor(private readonly service: PortfoliosService) {}

  @Post()
  create(@Req() req: any, @Body() dto: any) {
    return this.service.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.service.findAll(req.user.userId);
  }

  @Get('refresh')
  refresh(@Req() req: any) {
    return this.service.refreshPrices(req.user.userId);
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

  @Post('analyze')
  analyze(@Req() req: any) {
    return this.service.analyze(req.user.userId);
  }

  @Post('initiate-consent')
  initiateConsent(@Req() req: any, @Body() body: { phone: string; panOrDemat: string; brokerName?: string }) {
    return this.service.initiateDematConsent(body.phone, body.panOrDemat, body?.brokerName || 'AccountAggregator');
  }

  @Post('verify-otp')
  verifyOtp(@Req() req: any, @Body() body: { consentHandle: string; otp: string; brokerName?: string }) {
    return this.service.verifyDematOtp(req.user.userId, body.consentHandle, body.otp, body?.brokerName || 'AccountAggregator');
  }

  @Post('sync-demat')
  syncDemat(@Req() req: any, @Body() body: { brokerName?: string; dematAccountNumber?: string; panOrPhone?: string; token?: string }) {
    return this.service.syncDemat(
      req.user.userId,
      body?.brokerName || 'Zerodha',
      body?.dematAccountNumber || '1208160012345678',
      body?.panOrPhone,
      body?.token || 'demo_token'
    );
  }
}

