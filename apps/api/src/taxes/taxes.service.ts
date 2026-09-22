import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TaxesService {
  constructor(private readonly prisma: PrismaService) {}

  private calculateOldRegime(income: number) {
    let tax = 0;
    const slabs = [
      { min: 0, max: 250000, rate: 0 },
      { min: 250000, max: 500000, rate: 0.05 },
      { min: 500000, max: 1000000, rate: 0.20 },
      { min: 1000000, max: Infinity, rate: 0.30 },
    ];
    for (const slab of slabs) {
      if (income > slab.min) {
        tax += (Math.min(income, slab.max) - slab.min) * slab.rate;
      }
    }
    // Rebate 87A for Old Regime (up to 5L income)
    if (income <= 500000) {
      tax = Math.max(0, tax - 12500);
    }
    return tax + tax * 0.04; // 4% cess
  }

  private calculateNewRegime(income: number) {
    let tax = 0;
    const slabs = [
      { min: 0, max: 300000, rate: 0 },
      { min: 300000, max: 600000, rate: 0.05 },
      { min: 600000, max: 900000, rate: 0.10 },
      { min: 900000, max: 1200000, rate: 0.15 },
      { min: 1200000, max: 1500000, rate: 0.20 },
      { min: 1500000, max: Infinity, rate: 0.30 },
    ];
    for (const slab of slabs) {
      if (income > slab.min) {
        tax += (Math.min(income, slab.max) - slab.min) * slab.rate;
      }
    }
    // Rebate 87A for New Regime (up to 7L income)
    if (income <= 700000) {
      tax = Math.max(0, tax - 25000);
    }
    return tax + tax * 0.04; // 4% cess
  }

  async calculateAndSave(userId: string, data: any) {
    const year = data.year || new Date().getFullYear();
    
    // Default to 0 for all number fields if not provided
    const grossSalary = Number(data.grossSalary) || 0;
    const hra = Number(data.hra) || 0;
    const specialAllowance = Number(data.specialAllowance) || 0;
    const bonus = Number(data.bonus) || 0;
    const otherIncome = Number(data.otherIncome) || 0;
    const housePropertyIncome = Number(data.housePropertyIncome) || 0;
    const capitalGains = Number(data.capitalGains) || 0;
    const businessIncome = Number(data.businessIncome) || 0;
    
    const investments80C = Math.min(Number(data.investments80C) || 0, 150000); // Max 1.5L
    const investments80D = Math.min(Number(data.investments80D) || 0, 50000); // Assuming max 50k for parents
    const investments80E = Number(data.investments80E) || 0;
    const standardDeductionOld = grossSalary > 0 ? 50000 : 0;
    const standardDeductionNew = grossSalary > 0 ? 75000 : 0;
    const professionalTax = Number(data.professionalTax) || 0;
    const tdsPaid = Number(data.tdsPaid) || 0;

    const totalIncome = grossSalary + specialAllowance + bonus + otherIncome + housePropertyIncome + capitalGains + businessIncome;
    
    const totalDeductionsOld = hra + investments80C + investments80D + investments80E + standardDeductionOld + professionalTax;
    const taxableIncomeOld = Math.max(0, totalIncome - totalDeductionsOld);
    
    // New regime allows standard deduction (75k) for salaried from FY24-25, but no 80C/80D/HRA
    const totalDeductionsNew = standardDeductionNew;
    const taxableIncomeNew = Math.max(0, totalIncome - totalDeductionsNew);

    const taxOldRegime = this.calculateOldRegime(taxableIncomeOld);
    const taxNewRegime = this.calculateNewRegime(taxableIncomeNew);

    return this.prisma.taxRecord.create({
      data: {
        userId,
        year,
        grossSalary,
        hra,
        specialAllowance,
        bonus,
        otherIncome,
        housePropertyIncome,
        capitalGains,
        businessIncome,
        investments80C,
        investments80D,
        investments80E,
        standardDeduction: Math.max(standardDeductionOld, standardDeductionNew),
        professionalTax,
        tdsPaid,
        taxableIncomeOld,
        taxableIncomeNew,
        taxOldRegime,
        taxNewRegime
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.taxRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }
}
