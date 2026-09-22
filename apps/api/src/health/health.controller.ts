import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HealthService } from './health.service';

@UseGuards(AuthGuard('jwt'))
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('score')
  async getHealthScore(@Request() req: any) {
    return this.healthService.calculateHealthScore(req.user.userId);
  }
}
