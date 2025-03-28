
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from '@clerk/clerk-react';

export type TransactionType = 'income' | 'expense';

export interface FamilyMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
}

export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  description: string;
  category: string;
  type: TransactionType;
  createdBy?: string;
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
  familyMembers: FamilyMember[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  setCurrentMonth: (month: number) => void;
  setCurrentYear: (year: number) => void;
  getCurrentMonthData: () => MonthData | undefined;
  calculateYearlyTotals: () => { income: number; expense: number; balance: number };
  filterTransactionsByMonth: (month: number, year: number) => Transaction[];
  addFamilyMember: (member: Omit<FamilyMember, 'id'>) => void;
  removeFamilyMember: (id: string) => void;
  isAdmin: () => boolean;
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

// Dados de exemplo para membros da família
const generateSampleFamilyMembers = (): FamilyMember[] => {
  return [
    {
      id: '1',
      name: 'Você',
      email: 'seu.email@exemplo.com',
      role: 'admin'
    }
  ];
};

// Improved function for serializing Date objects when saving to localStorage
const serializeData = (data: any): string => {
  return JSON.stringify(data, (key, value) => {
    if (value instanceof Date) {
      return { __type: 'Date', value: value.toISOString() };
    }
    return value;
  });
};

// Improved function for deserializing Date objects when reading from localStorage
const deserializeData = (data: string): any => {
  try {
    return JSON.parse(data, (key, value) => {
      if (value && typeof value === 'object' && value.__type === 'Date') {
        return new Date(value.value);
      }
      return value;
    });
  } catch (error) {
    console.error('Error deserializing data:', error);
    return [];
  }
};

// Verify and fix transaction dates
const ensureValidDates = (transactions: Transaction[]): Transaction[] => {
  return transactions.map(transaction => {
    // Make sure date is a valid Date object
    if (!(transaction.date instanceof Date)) {
      console.warn('Invalid date found, converting:', transaction);
      // Try to convert to Date if it's a string or handle other cases
      if (typeof transaction.date === 'string') {
        transaction.date = new Date(transaction.date);
      } else if (transaction.date && typeof transaction.date === 'object' && 'value' in transaction.date) {
        // Handle case where date might be stored as an object with a value property
        transaction.date = new Date((transaction.date as any).value);
      } else {
        // Fallback to current date if conversion fails
        transaction.date = new Date();
      }
    }
    return transaction;
  });
};

export const BudgetProvider: React.FC<BudgetProviderProps> = ({ children }) => {
  const { user, isSignedIn } = useUser();
  
  // Safely load and validate transactions from localStorage
  const loadTransactions = (): Transaction[] => {
    const savedData = localStorage.getItem('budget_transactions');
    if (savedData) {
      try {
        const parsed = deserializeData(savedData);
        return ensureValidDates(parsed);
      } catch (error) {
        console.error('Erro ao carregar transações do localStorage:', error);
        return generateSampleData();
      }
    }
    return generateSampleData();
  };
  
  const loadFamilyMembers = (): FamilyMember[] => {
    const savedData = localStorage.getItem('budget_family_members');
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (error) {
        console.error('Erro ao carregar membros da família do localStorage:', error);
        return generateSampleFamilyMembers();
      }
    }
    return generateSampleFamilyMembers();
  };
  
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions);
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(loadFamilyMembers);
  
  // Safely save transactions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('budget_transactions', serializeData(transactions));
    } catch (error) {
      console.error('Error saving transactions to localStorage:', error);
    }
  }, [transactions]);
  
  // Save family members to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('budget_family_members', JSON.stringify(familyMembers));
    } catch (error) {
      console.error('Error saving family members to localStorage:', error);
    }
  }, [familyMembers]);
  
  // Process transactions to calculate monthly data with added error handling
  useEffect(() => {
    const processMonthlyData = () => {
      try {
        // Ensure all transaction dates are valid before processing
        const validTransactions = ensureValidDates(transactions);
        
        // Get unique month/year combinations
        const months = Array.from(
          new Set(
            validTransactions.map(t => {
              if (!(t.date instanceof Date)) {
                console.error('Invalid date found even after validation:', t);
                return `${currentMonth}-${currentYear}`;
              }
              return `${t.date.getMonth()}-${t.date.getFullYear()}`;
            })
          )
        );

        const data: MonthData[] = months.map(monthYear => {
          const [month, year] = monthYear.split('-').map(Number);
          
          // Filter transactions for this month with additional validation
          const monthTransactions = validTransactions.filter(t => {
            if (!(t.date instanceof Date)) {
              return false;
            }
            return t.date.getMonth() === month && t.date.getFullYear() === year;
          });
          
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
      } catch (error) {
        console.error('Error processing monthly data:', error);
        setMonthlyData([]);
      }
    };
    
    processMonthlyData();
  }, [transactions, currentMonth, currentYear]);

  // Atualiza o membro da família "Você" com os dados do usuário logado
  useEffect(() => {
    if (isSignedIn && user) {
      setFamilyMembers(prev => {
        const otherMembers = prev.filter(m => m.id !== '1');
        return [
          {
            id: '1',
            name: user.fullName || 'Você',
            email: user.primaryEmailAddress?.emailAddress || 'seu.email@exemplo.com',
            role: 'admin'
          },
          ...otherMembers
        ];
      });
    }
  }, [isSignedIn, user]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    // Ensure the date is a valid Date object before saving
    let transactionDate = transaction.date;
    if (!(transactionDate instanceof Date)) {
      transactionDate = new Date(transactionDate);
    }
    
    const newTransaction: Transaction = {
      ...transaction,
      date: transactionDate,
      id: Date.now().toString(),
      createdBy: user?.id || '1',
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
    // Add validation to ensure we only return transactions with valid dates
    return transactions.filter(t => {
      if (!(t.date instanceof Date)) {
        console.warn('Skipping transaction with invalid date:', t);
        return false;
      }
      return t.date.getMonth() === month && t.date.getFullYear() === year;
    });
  };

  const addFamilyMember = (member: Omit<FamilyMember, 'id'>) => {
    const newMember: FamilyMember = {
      ...member,
      id: Date.now().toString()
    };
    
    setFamilyMembers(prev => [...prev, newMember]);
  };

  const removeFamilyMember = (id: string) => {
    // Não pode remover o usuário principal (admin)
    if (id === '1') return;
    
    setFamilyMembers(prev => prev.filter(m => m.id !== id));
  };

  const isAdmin = () => {
    if (!isSignedIn) return false;
    
    const currentUser = familyMembers.find(m => m.email === user?.primaryEmailAddress?.emailAddress);
    return currentUser?.role === 'admin';
  };

  return (
    <BudgetContext.Provider
      value={{
        transactions,
        monthlyData,
        currentMonth,
        currentYear,
        familyMembers,
        addTransaction,
        deleteTransaction,
        setCurrentMonth,
        setCurrentYear,
        getCurrentMonthData,
        calculateYearlyTotals,
        filterTransactionsByMonth,
        addFamilyMember,
        removeFamilyMember,
        isAdmin
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};
