
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
  familyId?: string; // ID da família para vinculação
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
  familyId: string | null;
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
const generateSampleFamilyMembers = (userId: string, userEmail: string, userName: string): FamilyMember[] => {
  return [
    {
      id: userId || '1',
      name: userName || 'Você',
      email: userEmail || 'seu.email@exemplo.com',
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
    if (!(transaction.date instanceof Date) || isNaN(transaction.date.getTime())) {
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

// Gera um ID único para a família com base no email do usuário
const generateFamilyId = (email: string): string => {
  return `family_${email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
};

export const BudgetProvider: React.FC<BudgetProviderProps> = ({ children }) => {
  const { user, isSignedIn } = useUser();
  const [familyId, setFamilyId] = useState<string | null>(null);
  
  // Gera um ID de família baseado no email do usuário quando disponível
  useEffect(() => {
    if (isSignedIn && user?.primaryEmailAddress) {
      const newFamilyId = generateFamilyId(user.primaryEmailAddress.emailAddress);
      setFamilyId(newFamilyId);
    } else {
      setFamilyId(null);
    }
  }, [isSignedIn, user]);
  
  // Função para obter a chave de armazenamento específica do usuário
  const getUserStorageKey = (baseKey: string): string => {
    return familyId ? `${baseKey}_${familyId}` : baseKey;
  };
  
  // Safely load and validate transactions from localStorage
  const loadTransactions = (): Transaction[] => {
    if (!isSignedIn || !familyId) {
      return [];
    }
    
    const storageKey = getUserStorageKey('budget_transactions');
    const savedData = localStorage.getItem(storageKey);
    
    if (savedData) {
      try {
        const parsed = deserializeData(savedData);
        return ensureValidDates(parsed);
      } catch (error) {
        console.error('Erro ao carregar transações do localStorage:', error);
        return generateSampleData();
      }
    }
    
    // No primeiro login, geramos dados de exemplo
    const sampleData = generateSampleData();
    return sampleData.map(transaction => ({
      ...transaction,
      familyId: familyId
    }));
  };
  
  const loadFamilyMembers = (): FamilyMember[] => {
    if (!isSignedIn || !familyId) {
      return [];
    }
    
    const storageKey = getUserStorageKey('budget_family_members');
    const savedData = localStorage.getItem(storageKey);
    
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (error) {
        console.error('Erro ao carregar membros da família do localStorage:', error);
        return generateSampleFamilyMembers(
          user?.id || '1',
          user?.primaryEmailAddress?.emailAddress || '',
          user?.fullName || 'Você'
        );
      }
    }
    
    return generateSampleFamilyMembers(
      user?.id || '1',
      user?.primaryEmailAddress?.emailAddress || '',
      user?.fullName || 'Você'
    );
  };
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  
  // Carregar dados quando o ID da família estiver disponível
  useEffect(() => {
    if (familyId) {
      setTransactions(loadTransactions());
      setFamilyMembers(loadFamilyMembers());
    } else {
      setTransactions([]);
      setFamilyMembers([]);
    }
  }, [familyId]);
  
  // Safely save transactions to localStorage
  useEffect(() => {
    if (isSignedIn && familyId && transactions.length > 0) {
      const storageKey = getUserStorageKey('budget_transactions');
      try {
        localStorage.setItem(storageKey, serializeData(transactions));
      } catch (error) {
        console.error('Error saving transactions to localStorage:', error);
      }
    }
  }, [transactions, isSignedIn, familyId]);
  
  // Save family members to localStorage
  useEffect(() => {
    if (isSignedIn && familyId && familyMembers.length > 0) {
      const storageKey = getUserStorageKey('budget_family_members');
      try {
        localStorage.setItem(storageKey, JSON.stringify(familyMembers));
      } catch (error) {
        console.error('Error saving family members to localStorage:', error);
      }
    }
  }, [familyMembers, isSignedIn, familyId]);
  
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
              if (!(t.date instanceof Date) || isNaN(t.date.getTime())) {
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
            if (!(t.date instanceof Date) || isNaN(t.date.getTime())) {
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
    if (isSignedIn && user && familyId) {
      setFamilyMembers(prev => {
        // Filtra membros existentes excluindo o próprio usuário
        const otherMembers = prev.filter(m => m.id !== user.id);
        
        // Adiciona o usuário atual como administrador
        return [
          {
            id: user.id,
            name: user.fullName || 'Você',
            email: user.primaryEmailAddress?.emailAddress || 'seu.email@exemplo.com',
            role: 'admin'
          },
          ...otherMembers
        ];
      });
    }
  }, [isSignedIn, user, familyId]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    if (!isSignedIn || !familyId) {
      return;
    }
    
    // Ensure the date is a valid Date object before saving
    let transactionDate = transaction.date;
    if (!(transactionDate instanceof Date) || isNaN(transactionDate.getTime())) {
      transactionDate = new Date(transactionDate);
      
      // Se ainda for inválida, use a data atual
      if (isNaN(transactionDate.getTime())) {
        transactionDate = new Date();
      }
    }
    
    const newTransaction: Transaction = {
      ...transaction,
      date: transactionDate,
      id: Date.now().toString(),
      createdBy: user?.id,
      familyId: familyId
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
      if (!(t.date instanceof Date) || isNaN(t.date.getTime())) {
        console.warn('Skipping transaction with invalid date:', t);
        return false;
      }
      return t.date.getMonth() === month && t.date.getFullYear() === year;
    });
  };

  const addFamilyMember = (member: Omit<FamilyMember, 'id'>) => {
    if (!isSignedIn || !familyId) {
      return;
    }
    
    const newMember: FamilyMember = {
      ...member,
      id: Date.now().toString()
    };
    
    setFamilyMembers(prev => [...prev, newMember]);
  };

  const removeFamilyMember = (id: string) => {
    // Não pode remover o usuário principal (admin)
    if (id === user?.id) return;
    
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
        familyId,
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
