import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BudgetProvider } from "./contexts/BudgetContext";
import Index from "./pages/Index";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import FamilySettings from "./pages/FamilySettings";
import AuthLayout from "./components/AuthLayout";
import { ClerkProvider, SignIn, SignUp } from "@clerk/clerk-react";

// Criar um componente para o callback de SSO
const SSOCallback = () => {
  return (
    <div>
      <h1>Redirecionando...</h1>
      {/* Adicione lógica extra ou carregamento se necessário */}
    </div>
  );
};

const queryClient = new QueryClient();

// Componente de Login
const Login = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-500/10 to-violet-500/10">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-center text-2xl font-semibold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
          Orçamento Familiar
        </h1>
        <div className="rounded-lg border bg-card shadow-sm">
          <SignIn routing="path" path="/entrar" signUpUrl="/cadastro" />
        </div>
      </div>
    </div>
  );
};

// Componente de Registro
const Register = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-500/10 to-violet-500/10">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-center text-2xl font-semibold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
          Orçamento Familiar
        </h1>
        <div className="rounded-lg border bg-card shadow-sm">
          <SignUp
          routing="path"
          path="/cadastro"
          signInUrl="/entrar"
          afterSignUpUrl="/cadastro"  // Define o redirecionamento após o cadastro
        />
          </div>
      </div>
    </div>
  );
};

const App = () => {
  // Obtenha a chave publicável
  const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  // Se não houver chave, mostre a mensagem para configurar a chave
  if (!PUBLISHABLE_KEY) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center text-center p-4">
        <h1 className="text-2xl font-semibold mb-4">Chave de API do Clerk não encontrada</h1>
        <p className="mb-6 max-w-lg text-muted-foreground">
          Para utilizar o aplicativo Orçamento Familiar, é necessário configurar sua chave de API do Clerk.
          Obtenha sua chave em <a href="https://dashboard.clerk.com" target="_blank" rel="noreferrer" className="text-primary underline">dashboard.clerk.com</a>.
        </p>
        <div className="p-4 bg-amber-100 dark:bg-amber-900/30 rounded-lg max-w-lg text-left">
          <p className="text-sm">
            <strong>Como configurar:</strong> Adicione a variável de ambiente <code className="bg-muted px-1 py-0.5 rounded">VITE_CLERK_PUBLISHABLE_KEY</code> com o valor da sua chave publicável do Clerk.
          </p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
       <ClerkProvider
          publishableKey={PUBLISHABLE_KEY}
          clerkJSVersion="5.56.0-snapshot.v20250312225817"
          signInUrl="/entrar"
          signUpUrl="/cadastro"
          signInFallbackRedirectUrl="/"  // Redireciona para a página inicial após login
          signUpFallbackRedirectUrl="/"  // Redireciona para a página inicial após o registro
          afterSignUpUrl="/cadastro"    // Define que após o cadastro o usuário permanece na página de cadastro
          afterSignOutUrl="/entrar"     // Redireciona para a página de login após logout
        >

          <BudgetProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/entrar" element={<Login />} />
                <Route path="/cadastro" element={<Register />} />
                <Route element={<AuthLayout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/familia" element={<FamilySettings />} />
                </Route>
                {/* Rota para o callback de SSO */}
                <Route path="/entrar/sso-callback" element={<SSOCallback />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </BudgetProvider>
        </ClerkProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
