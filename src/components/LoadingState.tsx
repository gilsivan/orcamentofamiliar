
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <h3 className="text-xl font-medium">Carregando seus dados...</h3>
      <p className="text-muted-foreground mt-2">
        Aguarde enquanto preparamos seu orçamento familiar
      </p>
    </div>
  );
};

export default LoadingState;
