
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useBudget } from '@/contexts/BudgetContext';
import { formatCurrency, getMonthName } from '@/utils/financialUtils';

const MonthlyOverview: React.FC = () => {
  const { 
    currentMonth, 
    currentYear, 
    setCurrentMonth, 
    setCurrentYear,
    getCurrentMonthData 
  } = useBudget();
  
  const monthData = getCurrentMonthData();
  
  const handlePreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  const chartData = [
    {
      name: 'Receitas',
      value: monthData?.income || 0,
      fill: '#34D399'
    },
    {
      name: 'Despesas',
      value: monthData?.expense || 0,
      fill: '#F87171'
    },
    {
      name: 'Saldo',
      value: monthData?.balance || 0,
      fill: '#A78BFA'
    }
  ];
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Visão Mensal</h2>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handlePreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-medium">
            {getMonthName(currentMonth)} {currentYear}
          </span>
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="income-card">
          <CardContent className="p-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Receitas</h3>
              <p className="text-2xl font-semibold text-green-600">
                {formatCurrency(monthData?.income || 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="expense-card">
          <CardContent className="p-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Despesas</h3>
              <p className="text-2xl font-semibold text-red-600">
                {formatCurrency(monthData?.expense || 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="balance-card">
          <CardContent className="p-6">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Saldo</h3>
              <p className={`text-2xl font-semibold ${
                (monthData?.balance || 0) >= 0 ? 'text-purple-600' : 'text-red-600'
              }`}>
                {formatCurrency(monthData?.balance || 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="glass">
        <CardContent className="p-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis 
                  tickFormatter={(value) => `R$${value}`}
                  width={80}
                />
                <Tooltip 
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{ borderRadius: '8px' }}
                />
                <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyOverview;
