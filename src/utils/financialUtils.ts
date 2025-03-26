
// Format a number as currency (BRL)
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Format a date
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

// Get month name
export const getMonthName = (month: number): string => {
  const monthNames = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  
  return monthNames[month];
};

// Calculate percentage
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

// Generate random color
export const generateColor = (seed: string): string => {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convert to hex color
  const color = Math.abs(hash).toString(16).substring(0, 6);
  return `#${'0'.repeat(6 - color.length)}${color}`;
};

// Get budget category color
export const getCategoryColor = (category: string): string => {
  const categoryColors: Record<string, string> = {
    'Alimentação': '#F59E0B',
    'Moradia': '#10B981',
    'Transporte': '#3B82F6',
    'Educação': '#8B5CF6', 
    'Saúde': '#EC4899',
    'Lazer': '#06B6D4',
    'Trabalho': '#6366F1',
    'Investimentos': '#059669',
    'Outros': '#6B7280',
  };
  
  return categoryColors[category] || generateColor(category);
};

// Get available categories
export const getCategories = (): { label: string; value: string }[] => {
  return [
    { label: 'Alimentação', value: 'Alimentação' },
    { label: 'Moradia', value: 'Moradia' },
    { label: 'Transporte', value: 'Transporte' },
    { label: 'Educação', value: 'Educação' },
    { label: 'Saúde', value: 'Saúde' },
    { label: 'Lazer', value: 'Lazer' },
    { label: 'Trabalho', value: 'Trabalho' },
    { label: 'Investimentos', value: 'Investimentos' },
    { label: 'Outros', value: 'Outros' },
  ];
};
