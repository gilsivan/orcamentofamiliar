
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Button } from './ui/button';
import { Sun, Moon, LayoutDashboard, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AppShell: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const { toast } = useToast();

  // Função para alternar entre dark/light mode
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    
    toast({
      title: newMode ? "Modo escuro ativado" : "Modo claro ativado",
      description: "Suas preferências foram salvas.",
      duration: 2000,
    });
  };

  // Função para mostrar tour de ajuda
  const showHelp = () => {
    toast({
      title: "Guia de ajuda",
      description: "Use a navegação para acessar diferentes áreas do app. O botão + permite adicionar novas transações.",
      duration: 5000,
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl animate-fade-in">
        <Outlet />
      </main>
      
      {/* Botões flutuantes de ação rápida */}
      <div className="fixed bottom-6 left-6 flex flex-col gap-2 z-10">
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full h-10 w-10 shadow-md bg-background/80 backdrop-blur-sm"
          onClick={toggleDarkMode}
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full h-10 w-10 shadow-md bg-background/80 backdrop-blur-sm"
          onClick={showHelp}
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default AppShell;
