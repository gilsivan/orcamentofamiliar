
import React, { useState } from 'react';
import { ArrowLeft, Save, UserPlus, Trash2, Mail, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBudget, FamilyMember } from '@/contexts/BudgetContext';
import { 
  Dialog, 
  DialogContent, 
  DialogTitle, 
  DialogTrigger, 
  DialogClose,
  DialogHeader 
} from '@/components/ui/dialog';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import Navbar from '@/components/Navbar';

const FamilySettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { familyMembers, addFamilyMember, removeFamilyMember, isAdmin } = useBudget();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddMember = () => {
    if (!name || !email) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive"
      });
      return;
    }

    // Verificar se o e-mail já existe
    if (familyMembers.some(m => m.email === email)) {
      toast({
        title: "Erro",
        description: "Este e-mail já está cadastrado",
        variant: "destructive"
      });
      return;
    }

    addFamilyMember({
      name,
      email,
      role
    });

    toast({
      title: "Membro adicionado",
      description: `${name} foi adicionado à sua família`
    });

    // Reset form
    setName('');
    setEmail('');
    setRole('member');
    setIsDialogOpen(false);
  };

  const handleRemoveMember = (id: string, name: string) => {
    removeFamilyMember(id);
    
    toast({
      title: "Membro removido",
      description: `${name} foi removido da sua família`
    });
  };

  const handleSaveChanges = () => {
    // Aqui você poderia implementar a sincronização com o backend
    toast({
      title: "Alterações salvas",
      description: "As configurações da família foram atualizadas",
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
            <h1 className="text-3xl font-bold">Gerenciar Família</h1>
          </div>
          <Button 
            variant="default"
            onClick={handleSaveChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2" />
                  Membros da Família
                </CardTitle>
                <CardDescription>
                  Gerencie quem tem acesso ao orçamento familiar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {familyMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {member.email}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          member.role === 'admin' 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                        }`}>
                          {member.role === 'admin' ? 'Administrador' : 'Membro'}
                        </span>
                        {member.id !== '1' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveMember(member.id, member.name)}
                            disabled={!isAdmin()}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" disabled={!isAdmin()}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Adicionar Membro
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Membro da Família</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">Nome</label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Nome do membro"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">E-mail</label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="email@exemplo.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="role" className="text-sm font-medium">Função</label>
                        <Select
                          value={role}
                          onValueChange={(value) => setRole(value as 'admin' | 'member')}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma função" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="member">Membro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <DialogClose asChild>
                          <Button variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button onClick={handleAddMember}>Adicionar</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Compartilhamento</CardTitle>
                <CardDescription>
                  Informações sobre o compartilhamento do orçamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-1">Acesso de Membros</h3>
                  <p className="text-sm text-muted-foreground">
                    Membros podem visualizar e adicionar transações ao orçamento familiar.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-1">Acesso de Administradores</h3>
                  <p className="text-sm text-muted-foreground">
                    Administradores podem gerenciar membros, configurações e todas as transações.
                  </p>
                </div>
                <div className="pt-4">
                  <h3 className="font-medium mb-2">Dicas para Compartilhamento</h3>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="rounded-full bg-green-100 text-green-800 w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                      <span>Adicione apenas pessoas de confiança ao seu orçamento familiar.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="rounded-full bg-green-100 text-green-800 w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                      <span>Verifique se o email está correto ao adicionar membros.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="rounded-full bg-green-100 text-green-800 w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">✓</span>
                      <span>Revise regularmente quem tem acesso ao seu orçamento.</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FamilySettings;
