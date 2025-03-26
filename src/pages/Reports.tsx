
import React from 'react';
import Navbar from '@/components/Navbar';
import YearlyComparison from '@/components/YearlyComparison';
import ExportButton from '@/components/ExportButton';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { useBudget } from '@/contexts/BudgetContext';
import { formatCurrency, getCategoryColor } from '@/utils/financialUtils';

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const Reports = () => {
  const { transactions, currentYear } = useBudget();
  
  // Filter transactions for current year
  const yearTransactions = transactions.filter(
    t => t.date.getFullYear() === currentYear
  );
  
  // Calculate category breakdown for expenses
  const expensesByCategory = yearTransactions
    .filter(t => t.type === 'expense')
    .reduce<Record<string, number>>((acc, transaction) => {
      const { category, amount } = transaction;
      acc[category] = (acc[category] || 0) + amount;
      return acc;
    }, {});
    
  const expenseChartData: CategoryData[] = Object.entries(expensesByCategory)
    .map(([name, value]) => ({
      name,
      value,
      color: getCategoryColor(name)
    }))
    .sort((a, b) => b.value - a.value);
    
  // Calculate category breakdown for income
  const incomeByCategory = yearTransactions
    .filter(t => t.type === 'income')
    .reduce<Record<string, number>>((acc, transaction) => {
      const { category, amount } = transaction;
      acc[category] = (acc[category] || 0) + amount;
      return acc;
    }, {});
    
  const incomeChartData: CategoryData[] = Object.entries(incomeByCategory)
    .map(([name, value]) => ({
      name,
      value,
      color: getCategoryColor(name)
    }))
    .sort((a, b) => b.value - a.value);
    
  // Calculate total income and expenses
  const totalIncome = incomeChartData.reduce((sum, item) => sum + item.value, 0);
  const totalExpenses = expenseChartData.reduce((sum, item) => sum + item.value, 0);
  
  // Custom tooltip formatter
  const tooltipFormatter = (value: number, name: string) => {
    return [formatCurrency(value), name];
  };
  
  // Calculate percentage for each category
  const getPercentage = (value: number, total: number) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <ExportButton transactions={yearTransactions} year={currentYear} />
        </div>
        
        <YearlyComparison />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card className="income-card">
            <CardHeader>
              <CardTitle>Receitas por Categoria ({currentYear})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomeChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, value }) => `${name}: ${getPercentage(value, totalIncome)}`}
                      labelLine={true}
                    >
                      {incomeChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={tooltipFormatter} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 space-y-2">
                {incomeChartData.map((category) => (
                  <div key={category.name} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: category.color }} 
                      />
                      <span>{category.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{formatCurrency(category.value)}</span>
                      <span className="text-sm text-muted-foreground">
                        ({getPercentage(category.value, totalIncome)})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="expense-card">
            <CardHeader>
              <CardTitle>Despesas por Categoria ({currentYear})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, value }) => `${name}: ${getPercentage(value, totalExpenses)}`}
                      labelLine={true}
                    >
                      {expenseChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={tooltipFormatter} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 space-y-2">
                {expenseChartData.map((category) => (
                  <div key={category.name} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: category.color }} 
                      />
                      <span>{category.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{formatCurrency(category.value)}</span>
                      <span className="text-sm text-muted-foreground">
                        ({getPercentage(category.value, totalExpenses)})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Reports;
