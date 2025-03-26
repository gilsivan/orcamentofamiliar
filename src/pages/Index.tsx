
import React from 'react';
import Navbar from '@/components/Navbar';
import Dashboard from '@/components/Dashboard';
import TransactionForm from '@/components/TransactionForm';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Dashboard />
        <TransactionForm />
      </main>
    </div>
  );
};

export default Index;
