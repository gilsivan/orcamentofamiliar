
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

// Create a simple non-authenticated version of the app
const SimpleApp = () => (
  <BrowserRouter>
    <BudgetProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/familia" element={<FamilySettings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BudgetProvider>
  </BrowserRouter>
);

// Full app with authentication
const FullAppWithAuth = () => {
  // Import Clerk components only when the key is available
  const { ClerkProvider, SignIn, SignUp, SignedIn, SignedOut } = require("@clerk/clerk-react");

  // Substitua com sua chave real do Clerk
  const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  return (
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
  );
};

const queryClient = new QueryClient();

const App = () => {
  const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {PUBLISHABLE_KEY ? <FullAppWithAuth /> : <SimpleApp />}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
