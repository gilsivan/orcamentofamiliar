
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  description: string;
  category: string;
  type: TransactionType;
}

export interface MonthData {
  month: number;
  year: number;
  income: number;
  expense: number;
  balance: number;
  transactions: Transaction[];
}

interface BudgetContextType {
  transactions: Transaction[];
  monthlyData: MonthData[];
  currentMonth: number;
  currentYear: number;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  setCurrentMonth: (month: number) => void;
  setCurrentYear: (year: number) => void;
  getCurrentMonthData: () => MonthData | undefined;
  calculateYearlyTotals: () => { income: number; expense: number; balance: number };
  filterTransactionsByMonth: (month: number, year: number) => Transaction[];
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
};

interface BudgetProviderProps {
  children: ReactNode;
}

// Helper function to generate sample data
const generateSampleData = (): Transaction[] => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const sampleData: Transaction[] = [
    {
      id: '1',
      date: new Date(currentYear, currentMonth, 5),
      amount: 2500,
      description: 'Salário',
      category: 'Trabalho',
      type: 'income',
    },
    {
      id: '2',
      date: new Date(currentYear, currentMonth, 10),
      amount: 150,
      description: 'Supermercado',
      category: 'Alimentação',
      type: 'expense',
    },
    {
      id: '3',
      date: new Date(currentYear, currentMonth, 15),
      amount: 80,
      description: 'Conta de luz',
      category: 'Utilidades',
      type: 'expense',
    },
    {
      id: '4',
      date: new Date(currentYear, currentMonth, 20),
      amount: 500,
      description: 'Freelance',
      category: 'Trabalho',
      type: 'income',
    },
    {
      id: '5',
      date: new Date(currentYear, currentMonth - 1, 5),
      amount: 2500,
      description: 'Salário',
      category: 'Trabalho',
      type: 'income',
    },
    {
      id: '6',
      date: new Date(currentYear, currentMonth - 1, 10),
      amount: 200,
      description: 'Supermercado',
      category: 'Alimentação',
      type: 'expense',
    },
  ];
  
  return sampleData;
};

export const BudgetProvider: React.FC<BudgetProviderProps> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(generateSampleData);
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

  // Process transactions to calculate monthly data
  useEffect(() => {
    const processMonthlyData = () => {
      // Get unique month/year combinations
      const months = Array.from(
        new Set(
          transactions.map(
            t => `${t.date.getMonth()}-${t.date.getFullYear()}`
          )
        )
      );

      const data: MonthData[] = months.map(monthYear => {
        const [month, year] = monthYear.split('-').map(Number);
        
        // Filter transactions for this month
        const monthTransactions = transactions.filter(
          t => t.date.getMonth() === month && t.date.getFullYear() === year
        );
        
        // Calculate totals
        const income = monthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);
          
        const expense = monthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
          
        return {
          month,
          year,
          income,
          expense,
          balance: income - expense,
          transactions: monthTransactions
        };
      });
      
      setMonthlyData(data);
    };
    
    processMonthlyData();
  }, [transactions]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    
    setTransactions(prev => [...prev, newTransaction]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const getCurrentMonthData = () => {
    return monthlyData.find(
      data => data.month === currentMonth && data.year === currentYear
    );
  };

  const calculateYearlyTotals = () => {
    const yearData = monthlyData.filter(data => data.year === currentYear);
    
    const income = yearData.reduce((sum, month) => sum + month.income, 0);
    const expense = yearData.reduce((sum, month) => sum + month.expense, 0);
    
    return {
      income,
      expense,
      balance: income - expense
    };
  };

  const filterTransactionsByMonth = (month: number, year: number) => {
    return transactions.filter(
      t => t.date.getMonth() === month && t.date.getFullYear() === year
    );
  };

  return (
    <BudgetContext.Provider
      value={{
        transactions,
        monthlyData,
        currentMonth,
        currentYear,
        addTransaction,
        deleteTransaction,
        setCurrentMonth,
        setCurrentYear,
        getCurrentMonthData,
        calculateYearlyTotals,
        filterTransactionsByMonth
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};
