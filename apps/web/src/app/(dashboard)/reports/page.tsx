'use client';

/**
 * Reports page — report cards with real data status.
 * No hardcoded stats — shows available report types.
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileDown, FileText, BarChart2, PieChart, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

const REPORTS = [
  {
    id: 'r1', title: 'Monthly Finance Report', subtitle: 'Current Month',
    icon: BarChart2, color: 'text-violet-400', bg: 'bg-violet-500/10',
    description: 'Complete breakdown of income, expenses, savings, and budget performance for the current month.',
    formats: ['PDF', 'CSV'],
  },
  {
    id: 'r2', title: 'Expense Category Report', subtitle: 'Current Quarter',
    icon: PieChart, color: 'text-blue-400', bg: 'bg-blue-500/10',
    description: 'Detailed spending breakdown by category across all tracked buckets.',
    formats: ['PDF', 'CSV'],
  },
  {
    id: 'r3', title: 'Portfolio Performance', subtitle: 'Year to Date',
    icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10',
    description: 'Asset-level P&L, sector allocation, and annualized return analysis.',
    formats: ['PDF'],
  },
  {
    id: 'r4', title: 'Tax Summary Report', subtitle: 'Current FY',
    icon: FileText, color: 'text-amber-400', bg: 'bg-amber-500/10',
    description: 'Tax-ready summary with deductions, estimated liability, and regime recommendation.',
    formats: ['PDF'],
  },
  {
    id: 'r5', title: 'Annual Wealth Summary', subtitle: 'Full Year',
    icon: Calendar, color: 'text-pink-400', bg: 'bg-pink-500/10',
    description: 'Full-year net worth, investment growth, and financial goals progress report.',
    formats: ['PDF', 'CSV'],
  },
];

export default function ReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const downloadCSV = (data: any[], filename: string) => {
    const headers = ['Date', 'Category', 'Description', 'Type', 'Amount'];
    const rows = data.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.category,
      t.description || '',
      t.type,
      t.amount
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = (data: any[], title: string, filename: string) => {
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(18);
    doc.text('AI Finance Copilot', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(title, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 36);

    const tableColumn = ["Date", "Category", "Description", "Type", "Amount"];
    const tableRows = data.map(t => [
      new Date(t.date).toLocaleDateString(),
      t.category,
      t.description || '-',
      t.type === 'INCOME' ? 'Income' : 'Expense',
      formatCurrency(t.amount)
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [124, 58, 237] }, // Primary violet color
    });
    
    doc.save(`${filename}.pdf`);
  };

  const handleDownload = async (format: string, report: any) => {
    setDownloading(`${report.id}-${format}`);
    try {
      const res = await api.get('/transactions');
      const transactions = res.data || [];
      
      let filteredData = transactions;
      
      // Basic filtering based on report type
      if (report.id === 'r2') {
        filteredData = transactions.filter((t: any) => t.type === 'EXPENSE');
      }
      
      const filename = report.title.toLowerCase().replace(/\s+/g, '_');
      
      if (format === 'CSV') {
        downloadCSV(filteredData, filename);
      } else if (format === 'PDF') {
        downloadPDF(filteredData, report.title, filename);
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Reports & Export</h2>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">
          Download your financial reports in PDF or CSV format
        </p>
      </div>

      {/* Report cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {REPORTS.map((report, i) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="card-glass rounded-2xl p-5 flex flex-col gap-4 hover:border-[var(--border-strong)]
                       transition-all duration-200 group"
          >
            {/* Icon + title */}
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${report.bg}`}>
                <report.icon size={18} className={report.color} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{report.title}</p>
                <p className="text-xs text-[var(--text-muted)]">{report.subtitle}</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">{report.description}</p>

            {/* Download buttons */}
            <div className="flex gap-2 mt-auto">
              {report.formats.map((fmt) => {
                const isDownloading = downloading === `${report.id}-${fmt}`;
                return (
                  <button
                    key={fmt}
                    onClick={() => handleDownload(fmt, report)}
                    disabled={isDownloading || !!downloading}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl
                               border border-[var(--border-default)] text-xs font-medium
                               text-[var(--text-secondary)] hover:bg-[var(--primary)] hover:text-white
                               hover:border-[var(--primary)] transition-all duration-150 disabled:opacity-50"
                  >
                    {isDownloading ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <FileDown size={12} />
                    )}
                    {fmt}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bulk export note */}
      <div className="card-glass rounded-2xl p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
          <FileText size={14} className="text-violet-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-[var(--text-primary)]">Custom date range export</p>
          <p className="text-xs text-[var(--text-muted)]">Select any date range and export all transactions as CSV</p>
        </div>
        <button 
          onClick={() => handleDownload('CSV', { id: 'custom', title: 'Custom Export' })}
          disabled={!!downloading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)]
                           hover:bg-[var(--primary-hover)] text-white text-xs font-semibold
                           transition-colors shadow-lg shadow-violet-900/30 shrink-0 disabled:opacity-70"
        >
          {downloading === 'custom-CSV' ? <Loader2 size={12} className="animate-spin" /> : <FileDown size={12} />} 
          Export CSV
        </button>
      </div>
    </div>
  );
}
