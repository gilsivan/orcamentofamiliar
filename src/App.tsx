
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BudgetProvider } from "./contexts/BudgetContext";
import { ClerkProvider, SignIn, SignUp, SignedIn, SignedOut } from "@clerk/clerk-react";

import Index from "./pages/Index";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import FamilySettings from "./pages/FamilySettings";
import AuthLayout from "./components/AuthLayout";

const queryClient = new QueryClient();

// Substitua com sua chave real do Clerk
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  console.warn("Chave do Clerk não encontrada. A autenticação não funcionará corretamente.");
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        clerkJSVersion="5.56.0-snapshot.v20250312225817"
        signInUrl="/entrar"
        signUpUrl="/cadastro"
        signInFallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
        afterSignOutUrl="/entrar"
      >
        <BudgetProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<AuthLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/familia" element={<FamilySettings />} />
              </Route>
              <Route path="/entrar" element={
                <SignedOut>
                  <SignIn routing="path" path="/entrar" />
                </SignedOut>
              } />
              <Route path="/cadastro" element={
                <SignedOut>
                  <SignUp routing="path" path="/cadastro" />
                </SignedOut>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </BudgetProvider>
      </ClerkProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
