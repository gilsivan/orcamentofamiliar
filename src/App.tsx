
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
import AppShell from "./components/AppShell";
import { ClerkProvider, SignIn, SignUp } from "@clerk/clerk-react";
import { supabase } from "./lib/supabase";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

// Componente de Login melhorado
const Login = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-violet-500/10">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent mb-2">
            Orçamento Familiar
          </h1>
          <p className="text-muted-foreground">
            Controle suas finanças com simplicidade
          </p>
        </div>
        <div className="rounded-lg border bg-card/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none border-none p-4",
                headerTitle: "text-foreground text-xl",
                headerSubtitle: "text-muted-foreground",
                formFieldLabel: "text-foreground",
                formButtonPrimary: 
                  "bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-700 hover:to-violet-700 transition-all",
                footerActionLink: "text-primary hover:text-primary/90",
                socialButtonsIconButton: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                formFieldInput: "bg-background/60 backdrop-blur-sm border-input",
                dividerLine: "bg-muted",
                dividerText: "text-muted-foreground"
              }
            }}
            signUpUrl="/cadastro"
          />
        </div>
      </div>
    </div>
  );
};

// Componente de Registro melhorado
const Register = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-violet-500/10">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent mb-2">
            Orçamento Familiar
          </h1>
          <p className="text-muted-foreground">
            Crie sua conta e comece a gerenciar suas finanças
          </p>
        </div>
        <div className="rounded-lg border bg-card/80 backdrop-blur-sm shadow-lg overflow-hidden">
          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none border-none p-4",
                headerTitle: "text-foreground text-xl",
                headerSubtitle: "text-muted-foreground",
                formFieldLabel: "text-foreground",
                formButtonPrimary: 
                  "bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-700 hover:to-violet-700 transition-all",
                footerActionLink: "text-primary hover:text-primary/90",
                socialButtonsIconButton: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                formFieldInput: "bg-background/60 backdrop-blur-sm border-input",
                dividerLine: "bg-muted",
                dividerText: "text-muted-foreground"
              }
            }}
            signInUrl="/entrar"
          />
        </div>
      </div>
    </div>
  );
};

const queryClient = new QueryClient();

const App = () => {
  // Obtenha a chave publicável
  const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  // Verificar se as configurações do Supabase estão disponíveis e válidas
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };
  
  const isSupabaseConfigured = SUPABASE_URL && SUPABASE_URL !== 'https://your-project-id.supabase.co' && 
                              SUPABASE_KEY && SUPABASE_KEY !== 'your-supabase-anon-key' &&
                              isValidUrl(SUPABASE_URL);

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
          signInFallbackRedirectUrl="/"
          redirectUrl="/"
          afterSignOutUrl="/entrar"
        >
          <BudgetProvider>
            <Toaster />
            <Sonner />
            {!isSupabaseConfigured && (
              <div className="fixed top-0 left-0 right-0 z-50 p-4 bg-background">
                <Alert variant="destructive">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <AlertTitle>Configuração do Supabase</AlertTitle>
                  <AlertDescription>
                    As variáveis de ambiente do Supabase não estão configuradas corretamente. O URL deve começar com https:// (ex: https://projeto.supabase.co). 
                    Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env
                  </AlertDescription>
                </Alert>
              </div>
            )}
            <BrowserRouter>
              <Routes>
                <Route path="/entrar" element={<Login />} />
                <Route path="/cadastro" element={<Register />} />
                <Route element={<AuthLayout />}>
                  <Route element={<AppShell />}>
                    <Route path="/" element={<Index />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/familia" element={<FamilySettings />} />
                  </Route>
                </Route>
                {/* Redireciona qualquer rota de autenticação para a página principal após login bem-sucedido */}
                <Route path="/sso-callback" element={<Navigate to="/" replace />} />
                <Route path="/entrar/*" element={<Login />} />
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
