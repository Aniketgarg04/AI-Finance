import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InsightsService } from './insights.service';

@UseGuards(AuthGuard('jwt'))
@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get()
  async getInsights(@Request() req: any) {
    return this.insightsService.generateInsights(req.user.userId);
  }
}
