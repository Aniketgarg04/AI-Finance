import { Controller, Get, Res, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service';
import type { Response } from 'express';

@UseGuards(AuthGuard('jwt'))
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('transactions/csv')
  async downloadTransactionsCsv(@Request() req: any, @Res() res: Response) {
    const csvBuffer = await this.reportsService.generateTransactionsCsv(req.user.userId);
    
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="transactions.csv"',
    });
    
    res.send(csvBuffer);
  }

  @Get('monthly/pdf')
  async downloadMonthlyPdf(@Request() req: any, @Res() res: Response) {
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="monthly_report.pdf"',
    });

    const pdfStream = await this.reportsService.generateMonthlyPdf(req.user.userId);
    pdfStream.pipe(res);
  }
}
