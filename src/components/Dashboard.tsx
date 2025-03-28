
import React from 'react';
import { 
  ChevronDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  PiggyBank, 
  RefreshCw 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import MonthlyOverview from './MonthlyOverview';
import TransactionList from './TransactionList';
import LoadingState from './LoadingState';
import { useBudget } from '@/contexts/BudgetContext';
import { formatCurrency } from '@/utils/financialUtils';

const Dashboard: React.FC = () => {
  const { 
    transactions,
    getCurrentMonthData,
    calculateYearlyTotals,
    currentMonth,
    currentYear,
    isLoading
  } = useBudget();
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  const monthData = getCurrentMonthData();
  const yearlyTotals = calculateYearlyTotals();
  
  const recentTransactions = transactions
    .sort((a, b) => {
      if (!(a.date instanceof Date) || !(b.date instanceof Date)) {
        return 0;
      }
      return b.date.getTime() - a.date.getTime();
    })
    .slice(0, 5);
  
  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="income-card card-hover animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Receitas (Anual)</p>
              <h3 className="text-2xl font-semibold mt-1">{formatCurrency(yearlyTotals.income)}</h3>
              <div className="mt-2 flex items-center text-sm text-green-600">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                <span>Receitas</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <ArrowUpRight className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="expense-card card-hover animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Despesas (Anual)</p>
              <h3 className="text-2xl font-semibold mt-1">{formatCurrency(yearlyTotals.expense)}</h3>
              <div className="mt-2 flex items-center text-sm text-red-600">
                <ArrowDownRight className="w-4 h-4 mr-1" />
                <span>Despesas</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <ArrowDownRight className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="balance-card card-hover animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Saldo (Anual)</p>
              <h3 className={`text-2xl font-semibold mt-1 ${
                yearlyTotals.balance >= 0 ? 'text-purple-600' : 'text-red-600'
              }`}>
                {formatCurrency(yearlyTotals.balance)}
              </h3>
              <div className={`mt-2 flex items-center text-sm ${
                yearlyTotals.balance >= 0 ? 'text-purple-600' : 'text-red-600'
              }`}>
                <RefreshCw className="w-4 h-4 mr-1" />
                <span>Balanço</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="saving-card card-hover animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Economia Mensal</p>
              <h3 className={`text-2xl font-semibold mt-1 ${
                (monthData?.balance || 0) >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}>
                {formatCurrency(monthData?.balance || 0)}
              </h3>
              <div className={`mt-2 flex items-center text-sm ${
                (monthData?.balance || 0) >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}>
                <PiggyBank className="w-4 h-4 mr-1" />
                <span>Economias</span>
              </div>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <PiggyBank className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </section>
      
      <section>
        <MonthlyOverview />
      </section>
      
      <section className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Transações Recentes</h2>
          <a href="/transactions" className="text-primary hover:underline flex items-center">
            Ver todas
            <ChevronDown className="h-4 w-4 ml-1 transform rotate-270" />
          </a>
        </div>
        
        <TransactionList 
          transactions={recentTransactions} 
          limit={5}
          showDelete={false}
        />
      </section>
    </div>
  );
};

export default Dashboard;
