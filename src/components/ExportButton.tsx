
import React from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Transaction } from '@/contexts/BudgetContext';
import { getMonthName } from '@/utils/financialUtils';
import { exportToCSV, exportToExcel } from '@/utils/dataExport';

interface ExportButtonProps {
  transactions: Transaction[];
  month?: number;
  year?: number;
}

const ExportButton: React.FC<ExportButtonProps> = ({ 
  transactions,
  month,
  year
}) => {
  const { toast } = useToast();
  
  const getFilename = () => {
    if (month !== undefined && year !== undefined) {
      return `orcamento-familiar-${getMonthName(month).toLowerCase()}-${year}`;
    }
    return `orcamento-familiar-${new Date().toISOString().split('T')[0]}`;
  };
  
  const handleExportCSV = () => {
    exportToCSV(transactions, getFilename());
    toast({
      title: 'Exportação concluída',
      description: 'Seus dados foram exportados em formato CSV.',
    });
  };
  
  const handleExportExcel = () => {
    exportToExcel(transactions, getFilename());
    toast({
      title: 'Exportação concluída',
      description: 'Seus dados foram exportados em formato Excel.',
    });
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleExportCSV}>
          <FileText className="h-4 w-4 mr-2" />
          Exportar como CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportExcel}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Exportar como Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton;
