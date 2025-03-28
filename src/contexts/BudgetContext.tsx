
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase, TransactionRecord, FamilyMemberRecord, FamilyRecord } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

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
  familyId?: string;
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
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  setCurrentMonth: (month: number) => void;
  setCurrentYear: (year: number) => void;
  getCurrentMonthData: () => MonthData | undefined;
  calculateYearlyTotals: () => { income: number; expense: number; balance: number };
  filterTransactionsByMonth: (month: number, year: number) => Transaction[];
  addFamilyMember: (member: Omit<FamilyMember, 'id'>) => Promise<void>;
  removeFamilyMember: (id: string) => Promise<void>;
  isAdmin: () => boolean;
  isLoading: boolean;
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

// Função auxiliar para converter entre tipos Transaction e TransactionRecord
const toTransactionRecord = (transaction: Omit<Transaction, 'id'>, userId: string, familyId: string): Omit<TransactionRecord, 'id' | 'created_at'> => {
  return {
    user_id: userId,
    family_id: familyId,
    description: transaction.description,
    amount: transaction.amount,
    date: transaction.date instanceof Date ? transaction.date.toISOString() : new Date().toISOString(),
    category: transaction.category,
    type: transaction.type,
  };
};

const fromTransactionRecord = (record: TransactionRecord): Transaction => {
  return {
    id: record.id,
    description: record.description,
    amount: record.amount,
    date: new Date(record.date),
    category: record.category,
    type: record.type,
    createdBy: record.user_id,
    familyId: record.family_id,
  };
};

// Função auxiliar para converter entre tipos FamilyMember e FamilyMemberRecord
const toFamilyMemberRecord = (member: Omit<FamilyMember, 'id'>, userId: string, familyId: string): Omit<FamilyMemberRecord, 'id' | 'created_at'> => {
  return {
    family_id: familyId,
    user_id: userId,
    name: member.name,
    email: member.email,
    role: member.role,
  };
};

const fromFamilyMemberRecord = (record: FamilyMemberRecord): FamilyMember => {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    role: record.role,
  };
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

export const BudgetProvider: React.FC<BudgetProviderProps> = ({ children }) => {
  const { user, isSignedIn } = useUser();
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Função para criar ou obter o ID da família
  const createOrGetFamily = async (): Promise<string | null> => {
    if (!isSignedIn || !user) return null;

    try {
      // Verificar se o usuário já está em uma família
      const { data: existingMember, error: memberError } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        return existingMember.family_id;
      }

      // Se não está em uma família, criar uma nova
      const familyName = `Família ${user.fullName || 'do ' + (user.username || user.id)}`;
      const { data: newFamily, error: familyError } = await supabase
        .from('families')
        .insert({
          name: familyName,
          created_by: user.id
        })
        .select()
        .single();

      if (familyError) {
        console.error('Erro ao criar família:', familyError);
        toast({
          title: 'Erro',
          description: 'Não foi possível criar sua família. Tente novamente.',
          variant: 'destructive'
        });
        return null;
      }

      // Adicionar o usuário como admin na nova família
      const { error: addMemberError } = await supabase
        .from('family_members')
        .insert({
          family_id: newFamily.id,
          user_id: user.id,
          name: user.fullName || user.username || 'Você',
          email: user.primaryEmailAddress?.emailAddress || '',
          role: 'admin'
        });

      if (addMemberError) {
        console.error('Erro ao adicionar membro à família:', addMemberError);
        return null;
      }

      return newFamily.id;
    } catch (error) {
      console.error('Erro ao verificar ou criar família:', error);
      return null;
    }
  };

  // Inicializar a família do usuário
  useEffect(() => {
    const initFamily = async () => {
      if (isSignedIn && user) {
        setIsLoading(true);
        const familyId = await createOrGetFamily();
        setFamilyId(familyId);
        setIsLoading(false);
      } else {
        setFamilyId(null);
        setTransactions([]);
        setFamilyMembers([]);
      }
    };

    initFamily();
  }, [isSignedIn, user]);

  // Carregar transações quando o ID da família estiver disponível
  useEffect(() => {
    const loadTransactions = async () => {
      if (!familyId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('family_id', familyId);

        if (error) {
          throw error;
        }

        if (data) {
          const parsedTransactions = data.map(fromTransactionRecord);
          setTransactions(ensureValidDates(parsedTransactions));
        }
      } catch (error) {
        console.error('Erro ao carregar transações:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar suas transações. Tente novamente.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, [familyId]);

  // Carregar membros da família
  useEffect(() => {
    const loadFamilyMembers = async () => {
      if (!familyId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('family_members')
          .select('*')
          .eq('family_id', familyId);

        if (error) {
          throw error;
        }

        if (data) {
          const members = data.map(fromFamilyMemberRecord);
          setFamilyMembers(members);
        }
      } catch (error) {
        console.error('Erro ao carregar membros da família:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os membros da sua família. Tente novamente.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadFamilyMembers();
  }, [familyId]);

  // Processar transações para calcular dados mensais
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

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!isSignedIn || !user || !familyId) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para adicionar uma transação.',
        variant: 'destructive'
      });
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
    
    const transactionToAdd = {
      ...transaction,
      date: transactionDate,
    };
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert(toTransactionRecord(transactionToAdd, user.id, familyId))
        .select()
        .single();

      if (error) throw error;

      const newTransaction: Transaction = {
        id: data.id,
        description: data.description,
        amount: data.amount,
        date: new Date(data.date),
        category: data.category,
        type: data.type,
        createdBy: data.user_id,
        familyId: data.family_id,
      };

      setTransactions(prev => [...prev, newTransaction]);
      
      toast({
        title: 'Sucesso',
        description: 'Transação adicionada com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar a transação. Tente novamente.',
        variant: 'destructive'
      });
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTransactions(prev => prev.filter(t => t.id !== id));
      
      toast({
        title: 'Sucesso',
        description: 'Transação excluída com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a transação. Tente novamente.',
        variant: 'destructive'
      });
    }
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

  const addFamilyMember = async (member: Omit<FamilyMember, 'id'>) => {
    if (!isSignedIn || !user || !familyId) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para adicionar um membro.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      // Verificar se o email já está cadastrado na família
      const { data: existingMembers } = await supabase
        .from('family_members')
        .select('*')
        .eq('family_id', familyId)
        .eq('email', member.email);

      if (existingMembers && existingMembers.length > 0) {
        toast({
          title: 'Erro',
          description: 'Este email já está cadastrado na família.',
          variant: 'destructive'
        });
        return;
      }

      const { data, error } = await supabase
        .from('family_members')
        .insert(toFamilyMemberRecord(member, user.id, familyId))
        .select()
        .single();

      if (error) throw error;

      const newMember: FamilyMember = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
      };

      setFamilyMembers(prev => [...prev, newMember]);
      
      toast({
        title: 'Sucesso',
        description: 'Membro adicionado com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o membro. Tente novamente.',
        variant: 'destructive'
      });
    }
  };

  const removeFamilyMember = async (id: string) => {
    // Não pode remover o usuário principal (admin)
    if (id === user?.id) {
      toast({
        title: 'Operação não permitida',
        description: 'Você não pode remover a si mesmo da família.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFamilyMembers(prev => prev.filter(m => m.id !== id));
      
      toast({
        title: 'Sucesso',
        description: 'Membro removido com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o membro. Tente novamente.',
        variant: 'destructive'
      });
    }
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
        isAdmin,
        isLoading
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};
