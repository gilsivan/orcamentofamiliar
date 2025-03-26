
import { Transaction } from '@/contexts/BudgetContext';
import { formatCurrency, formatDate } from './financialUtils';
import * as XLSX from 'xlsx';

// Export to CSV
export const exportToCSV = (transactions: Transaction[], filename: string): void => {
  // Define columns
  const columns = ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor'];
  
  // Format data
  const formattedData = transactions.map(t => [
    formatDate(t.date),
    t.description,
    t.category,
    t.type === 'income' ? 'Receita' : 'Despesa',
    t.amount.toString(),
  ]);
  
  // Create CSV content
  const csvContent = [
    columns.join(','),
    ...formattedData.map(row => row.join(','))
  ].join('\n');
  
  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export to Excel/XLSX using the xlsx library
export const exportToExcel = (transactions: Transaction[], filename: string): void => {
  // Format data for Excel
  const worksheetData = transactions.map(t => ({
    'Data': formatDate(t.date),
    'Descrição': t.description,
    'Categoria': t.category,
    'Tipo': t.type === 'income' ? 'Receita' : 'Despesa',
    'Valor': t.amount,
    'Formatado': formatCurrency(t.amount),
  }));
  
  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  
  // Set column widths
  const columnWidths = [
    { wch: 12 }, // Data
    { wch: 30 }, // Descrição
    { wch: 20 }, // Categoria
    { wch: 10 }, // Tipo
    { wch: 12 }, // Valor
    { wch: 15 }, // Formatado
  ];
  
  worksheet['!cols'] = columnWidths;
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transações');
  
  // Add a summary sheet
  const incomeTotal = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenseTotal = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = incomeTotal - expenseTotal;
  
  const summaryData = [
    { 'Resumo': 'Receitas', 'Valor': incomeTotal, 'Formatado': formatCurrency(incomeTotal) },
    { 'Resumo': 'Despesas', 'Valor': expenseTotal, 'Formatado': formatCurrency(expenseTotal) },
    { 'Resumo': 'Saldo', 'Valor': balance, 'Formatado': formatCurrency(balance) },
  ];
  
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 15 }, { wch: 12 }, { wch: 15 }];
  
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');
  
  // Export to file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

// Export to PDF (just a placeholder, would require PDF library in real implementation)
export const exportToPDF = (transactions: Transaction[], filename: string): void => {
  // In a real implementation, this would use a library like jsPDF
  alert('Exportação para PDF será implementada em uma versão futura.');
};
