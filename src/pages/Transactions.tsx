
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Check, X } from 'lucide-react';
import TransactionList from '@/components/TransactionList';
import TransactionForm from '@/components/TransactionForm';
import ExportButton from '@/components/ExportButton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBudget, TransactionType } from '@/contexts/BudgetContext';
import { formatCurrency, getMonthName } from '@/utils/financialUtils';

const Transactions = () => {
  const { 
    transactions, 
    currentMonth, 
    currentYear, 
    setCurrentMonth, 
    setCurrentYear,
    filterTransactionsByMonth,
    getCurrentMonthData 
  } = useBudget();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TransactionType | 'all'>('all');
  
  const monthData = getCurrentMonthData();
  
  // Handle month navigation
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
  
  // Ensure transactions are properly filtered and date objects are valid
  const filteredTransactions = filterTransactionsByMonth(currentMonth, currentYear)
    .filter(t => {
      // Make sure the date is a valid Date object
      if (!(t.date instanceof Date)) {
        console.error('Invalid date object found:', t);
        return false;
      }
      
      const matchesSearch = searchQuery === '' ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesType = activeTab === 'all' || t.type === activeTab;
      
      return matchesSearch && matchesType;
    });
  
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0 mb-6">
          <h1 className="text-3xl font-bold">Transações</h1>
          
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
            
            <ExportButton 
              transactions={filteredTransactions}
              month={currentMonth}
              year={currentYear}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="glass p-4 rounded-lg flex flex-col justify-between">
            <span className="text-sm text-muted-foreground">Receitas</span>
            <span className="text-2xl font-semibold text-green-600">
              {formatCurrency(monthData?.income || 0)}
            </span>
          </div>
          
          <div className="glass p-4 rounded-lg flex flex-col justify-between">
            <span className="text-sm text-muted-foreground">Despesas</span>
            <span className="text-2xl font-semibold text-red-600">
              {formatCurrency(monthData?.expense || 0)}
            </span>
          </div>
          
          <div className="glass p-4 rounded-lg flex flex-col justify-between">
            <span className="text-sm text-muted-foreground">Saldo</span>
            <span className={`text-2xl font-semibold ${
              (monthData?.balance || 0) >= 0 ? 'text-purple-600' : 'text-red-600'
            }`}>
              {formatCurrency(monthData?.balance || 0)}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0">
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as TransactionType | 'all')}
            className="w-full md:w-auto"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="income" className="text-green-600">Receitas</TabsTrigger>
              <TabsTrigger value="expense" className="text-red-600">Despesas</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar transações..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        <TransactionList transactions={filteredTransactions} />
        <TransactionForm />
      </main>
    </div>
  );
};

export default Transactions;
