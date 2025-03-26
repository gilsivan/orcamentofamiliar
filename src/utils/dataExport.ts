
import { Transaction } from '@/contexts/BudgetContext';
import { formatCurrency, formatDate } from './financialUtils';

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

// Export to PDF (just a placeholder, would require PDF library in real implementation)
export const exportToPDF = (transactions: Transaction[], filename: string): void => {
  // In a real implementation, this would use a library like jsPDF
  alert('Exportação para PDF será implementada em uma versão futura.');
};

// Export to Excel/XLSX (just a placeholder, would require Excel library in real implementation)
export const exportToExcel = (transactions: Transaction[], filename: string): void => {
  // In a real implementation, this would use a library like exceljs or xlsx
  // For now, we'll use CSV as a fallback
  exportToCSV(transactions, filename);
};
