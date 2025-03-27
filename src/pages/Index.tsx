
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, ListChecks, TrendingUp, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Dashboard from '@/components/Dashboard';
import TransactionForm from '@/components/TransactionForm';
import { useBudget } from '@/contexts/BudgetContext';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/utils/financialUtils';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { transactions, getCurrentMonthData } = useBudget();
  
  const monthData = getCurrentMonthData();

  const handleSave = () => {
    // Lógica de salvar alterações
    toast({
      title: "Alterações salvas",
      description: `Todas as alterações foram salvas com sucesso. Total de transações: ${transactions.length}`,
    });
  };

  // Encontrar a última transação
  const lastTransaction = [...transactions].sort((a, b) => 
    b.date.getTime() - a.date.getTime()
  )[0];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Visão geral das suas finanças</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            asChild
          >
            <Link to="/transactions">
              <ListChecks className="h-4 w-4 mr-2" />
              Transações
            </Link>
          </Button>
          <Button 
            variant="default"
            onClick={handleSave}
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="income-card overflow-hidden">
          <div className="h-1 w-full bg-budget-income"></div>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Receitas do Mês</h3>
            <p className="text-2xl font-semibold text-green-600 mt-1">
              {formatCurrency(monthData?.income || 0)}
            </p>
          </CardContent>
        </Card>
        
        <Card className="expense-card overflow-hidden">
          <div className="h-1 w-full bg-budget-expense"></div>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Despesas do Mês</h3>
            <p className="text-2xl font-semibold text-red-600 mt-1">
              {formatCurrency(monthData?.expense || 0)}
            </p>
          </CardContent>
        </Card>
        
        <Card className="balance-card overflow-hidden">
          <div className="h-1 w-full bg-budget-balance"></div>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Saldo do Mês</h3>
            <p className={`text-2xl font-semibold mt-1 ${
              (monthData?.balance || 0) >= 0 ? 'text-purple-600' : 'text-red-600'
            }`}>
              {formatCurrency(monthData?.balance || 0)}
            </p>
          </CardContent>
        </Card>
        
        <Card className="saving-card overflow-hidden">
          <div className="h-1 w-full bg-budget-saving"></div>
          <CardContent className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground">Economia Estimada</h3>
            <p className="text-2xl font-semibold text-blue-600 mt-1">
              {formatCurrency((monthData?.income || 0) * 0.2)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Meta: 20% da receita</p>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard principal */}
      <Dashboard />
      
      {/* Última transação */}
      {lastTransaction && (
        <Card className="overflow-hidden border-dashed animate-pulse-gentle">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Última Transação</h3>
                <p className="font-semibold mt-1">{lastTransaction.description}</p>
                <div className="flex gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 bg-secondary rounded-full">
                    {lastTransaction.category}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`font-semibold ${
                  lastTransaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {lastTransaction.type === 'income' ? '+' : '-'} {formatCurrency(lastTransaction.amount)}
                </span>
                <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate('/transactions')}>
                  Ver todas
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulário de transação */}
      <TransactionForm />
    </div>
  );
};

export default Index;
