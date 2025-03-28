
-- *** TABELAS PRINCIPAIS ***

-- Tabela de famílias
CREATE TABLE IF NOT EXISTS public.families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Tabela de membros da família
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (family_id, user_id),
  UNIQUE (family_id, email)
);

-- Tabela de transações
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- *** CONFIGURAÇÕES DE SEGURANÇA ***

-- Ativar extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Habilitar RLS (Row Level Security) nas tabelas
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela families
CREATE POLICY "Usuários podem ver suas próprias famílias" ON public.families
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_members.family_id = families.id
      AND family_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Apenas admins podem criar famílias" ON public.families
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Apenas admins podem atualizar famílias" ON public.families
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_members.family_id = families.id
      AND family_members.user_id = auth.uid()
      AND family_members.role = 'admin'
    )
  );

-- Políticas para a tabela family_members
CREATE POLICY "Usuários podem ver membros de suas famílias" ON public.family_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.family_members AS fm
      WHERE fm.family_id = family_members.family_id
      AND fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Apenas admins podem adicionar membros" ON public.family_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_members.family_id = NEW.family_id
      AND family_members.user_id = auth.uid()
      AND family_members.role = 'admin'
    ) OR (NEW.user_id = auth.uid() AND NOT EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_id = NEW.family_id
    ))
  );

CREATE POLICY "Apenas admins podem remover membros" ON public.family_members
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_members.family_id = family_members.family_id
      AND family_members.user_id = auth.uid()
      AND family_members.role = 'admin'
    )
  );

-- Políticas para a tabela transactions
CREATE POLICY "Usuários podem ver transações de suas famílias" ON public.transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_members.family_id = transactions.family_id
      AND family_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem adicionar transações em suas famílias" ON public.transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_members.family_id = NEW.family_id
      AND family_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem atualizar suas próprias transações" ON public.transactions
  FOR UPDATE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_members.family_id = transactions.family_id
      AND family_members.user_id = auth.uid()
      AND family_members.role = 'admin'
    )
  );

CREATE POLICY "Usuários podem deletar suas próprias transações" ON public.transactions
  FOR DELETE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_members.family_id = transactions.family_id
      AND family_members.user_id = auth.uid()
      AND family_members.role = 'admin'
    )
  );
