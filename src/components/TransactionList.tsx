
import React from 'react';
import { Trash2 } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBudget, Transaction } from '@/contexts/BudgetContext';
import { formatCurrency, formatDate } from '@/utils/financialUtils';

interface TransactionListProps {
  transactions: Transaction[];
  limit?: number;
  showDelete?: boolean;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions, 
  limit, 
  showDelete = true 
}) => {
  const { deleteTransaction } = useBudget();
  
  // Filter out transactions with invalid date objects
  const validTransactions = transactions.filter(t => t.date instanceof Date);
  
  const displayTransactions = limit 
    ? validTransactions.slice(0, limit) 
    : validTransactions;
    
  // Safe sorting that handles potential invalid date objects
  const sortedTransactions = [...displayTransactions].sort((a, b) => {
    // Double-check that both dates are valid
    if (!(a.date instanceof Date) || !(b.date instanceof Date)) {
      console.error('Invalid date object found during sorting', { a, b });
      return 0;
    }
    return b.date.getTime() - a.date.getTime();
  });
  
  if (sortedTransactions.length === 0) {
    return (
      <Card className="border border-dashed">
        <CardContent className="pt-6 text-center text-muted-foreground">
          Nenhuma transação encontrada.
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-3">
      {sortedTransactions.map((transaction, index) => (
        <div 
          key={transaction.id}
          className="transaction-item"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <Card className="overflow-hidden card-hover">
            <div className={`
              h-1 w-full 
              ${transaction.type === 'income' ? 'bg-budget-income' : 'bg-budget-expense'}
            `} />
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{transaction.description}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs px-2 py-0.5 bg-secondary rounded-full">
                      {transaction.category}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-secondary rounded-full">
                      {transaction.date instanceof Date ? formatDate(transaction.date) : 'Data inválida'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </span>
                  {showDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteTransaction(transaction.id)}
                      className="text-muted-foreground hover:text-destructive h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default TransactionList;
