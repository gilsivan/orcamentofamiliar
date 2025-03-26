
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useBudget } from '@/contexts/BudgetContext';
import { formatCurrency, getMonthName } from '@/utils/financialUtils';

const YearlyComparison: React.FC = () => {
  const { 
    monthlyData, 
    currentYear, 
    setCurrentYear 
  } = useBudget();
  
  // Filter for current year and sort by month
  const yearData = monthlyData
    .filter(data => data.year === currentYear)
    .sort((a, b) => a.month - b.month);
  
  const chartData = yearData.map(data => ({
    month: getMonthName(data.month).substring(0, 3),
    receitas: data.income,
    despesas: data.expense,
    saldo: data.balance
  }));
  
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentYear(parseInt(e.target.value));
  };
  
  // Get available years from data
  const availableYears = Array.from(
    new Set(monthlyData.map(data => data.year))
  ).sort((a, b) => b - a);
  
  if (availableYears.length === 0) {
    availableYears.push(currentYear);
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Comparação Anual</h2>
        <select
          value={currentYear}
          onChange={handleYearChange}
          className="px-3 py-1.5 border rounded-md bg-background"
        >
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      
      <Card className="glass">
        <CardContent className="p-6">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  width={80}
                  tickFormatter={(value) => `R$${value}`}
                />
                <Tooltip 
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{ borderRadius: '8px' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="receitas" 
                  stroke="#34D399" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="despesas" 
                  stroke="#F87171"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="saldo" 
                  stroke="#A78BFA"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default YearlyComparison;
