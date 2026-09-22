import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
const PDFDocument = require('pdfkit');

const prisma = new PrismaClient();

@Injectable()
export class ReportsService {
  
  async generateTransactionsCsv(userId: string): Promise<Buffer> {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' }
    });

    if (transactions.length === 0) {
      return Buffer.from('Date,Description,Category,Type,Amount\n');
    }

    // Manual CSV generation since we just need a buffer in-memory
    const header = 'Date,Description,Category,Type,Amount\n';
    const rows = transactions.map(t => 
      `${t.date.toISOString().split('T')[0]},"${t.description || ''}",${t.category},${t.type},${t.amount}`
    ).join('\n');

    return Buffer.from(header + rows);
  }

  async generateMonthlyPdf(userId: string): Promise<any> {
    const doc = new PDFDocument();
    
    // Fetch user and past 30 days of transactions
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const transactions = await prisma.transaction.findMany({
      where: { userId, date: { gte: thirtyDaysAgo } },
      orderBy: { date: 'desc' }
    });

    // Calculate totals
    let income = 0;
    let expenses = 0;
    transactions.forEach(t => {
      if (t.type === 'INCOME') income += t.amount;
      else expenses += t.amount;
    });

    // Title
    doc.fontSize(25).text('Monthly Financial Report', { align: 'center' });
    doc.moveDown();
    
    // User details
    doc.fontSize(14).text(`User: ${user?.name || user?.email || 'Valued Customer'}`);
    doc.text(`Date Generated: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    // Summary
    doc.fontSize(18).text('Summary', { underline: true });
    doc.fontSize(12).text(`Total Income (30 Days): $${income.toFixed(2)}`, { continued: true }).text(`   |   Total Expenses: $${expenses.toFixed(2)}`, { align: 'right' });
    doc.text(`Net Savings: $${(income - expenses).toFixed(2)}`);
    doc.moveDown();

    // Transactions Table
    doc.fontSize(18).text('Recent Transactions', { underline: true });
    doc.moveDown();

    if (transactions.length === 0) {
      doc.fontSize(12).text('No transactions found in the last 30 days.');
    } else {
      transactions.slice(0, 50).forEach(t => {
        doc.fontSize(10).text(
          `${t.date.toISOString().split('T')[0]} | ${t.type.padEnd(8)} | ${t.category.padEnd(15)} | $${t.amount.toFixed(2)} | ${t.description || ''}`
        );
      });
    }

    doc.end();
    return doc; // Return the stream
  }
}
