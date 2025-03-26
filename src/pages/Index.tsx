
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Dashboard from '@/components/Dashboard';
import TransactionForm from '@/components/TransactionForm';
import { useBudget } from '@/contexts/BudgetContext';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { transactions } = useBudget();

  const handleSave = () => {
    // Aqui você poderia implementar a lógica de salvar as alterações
    // Por enquanto, apenas mostramos uma notificação
    toast({
      title: "Alterações salvas",
      description: `Todas as alterações foram salvas com sucesso. Total de transações: ${transactions.length}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => navigate(-1)}
              title="Voltar"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold">Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              asChild
            >
              <Link to="/transactions">
                <ListChecks className="h-4 w-4 mr-2" />
                Todas as Transações
              </Link>
            </Button>
            <Button 
              variant="default"
              onClick={handleSave}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </div>
        <Dashboard />
        <TransactionForm />
      </main>
    </div>
  );
};

export default Index;
