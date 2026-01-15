
-- Tabela de corretores
CREATE TABLE public.brokers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  cpf TEXT,
  creci TEXT,
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 6.00, -- Taxa padrão de comissão %
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de vendas de imóveis
CREATE TABLE public.property_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  broker_id UUID NOT NULL REFERENCES public.brokers(id) ON DELETE RESTRICT,
  property_title TEXT NOT NULL,
  property_address TEXT,
  sale_price DECIMAL(15,2) NOT NULL,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  buyer_name TEXT,
  buyer_cpf TEXT,
  notes TEXT,
  -- Status do registro do imóvel
  registration_status TEXT NOT NULL DEFAULT 'pending' CHECK (registration_status IN ('pending', 'in_progress', 'completed')),
  registration_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de comissões
CREATE TABLE public.broker_commissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  broker_id UUID NOT NULL REFERENCES public.brokers(id) ON DELETE RESTRICT,
  sale_id UUID NOT NULL REFERENCES public.property_sales(id) ON DELETE CASCADE,
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(15,2) NOT NULL,
  -- Status do pagamento
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'due', 'paid')),
  due_date DATE,
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_method TEXT,
  payment_reference TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.brokers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broker_commissions ENABLE ROW LEVEL SECURITY;

-- Policies para brokers
CREATE POLICY "Users can view their own brokers" ON public.brokers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own brokers" ON public.brokers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own brokers" ON public.brokers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own brokers" ON public.brokers FOR DELETE USING (auth.uid() = user_id);

-- Policies para property_sales
CREATE POLICY "Users can view their own sales" ON public.property_sales FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sales" ON public.property_sales FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sales" ON public.property_sales FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sales" ON public.property_sales FOR DELETE USING (auth.uid() = user_id);

-- Policies para broker_commissions
CREATE POLICY "Users can view their own commissions" ON public.broker_commissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own commissions" ON public.broker_commissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own commissions" ON public.broker_commissions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own commissions" ON public.broker_commissions FOR DELETE USING (auth.uid() = user_id);

-- Triggers para updated_at
CREATE TRIGGER update_brokers_updated_at BEFORE UPDATE ON public.brokers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_property_sales_updated_at BEFORE UPDATE ON public.property_sales FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_broker_commissions_updated_at BEFORE UPDATE ON public.broker_commissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar comissão automaticamente quando uma venda é registrada
CREATE OR REPLACE FUNCTION public.create_commission_on_sale()
RETURNS TRIGGER AS $$
DECLARE
  broker_commission_rate DECIMAL(5,2);
BEGIN
  -- Busca a taxa de comissão do corretor
  SELECT commission_rate INTO broker_commission_rate FROM public.brokers WHERE id = NEW.broker_id;
  
  -- Cria a comissão
  INSERT INTO public.broker_commissions (user_id, broker_id, sale_id, commission_rate, commission_amount)
  VALUES (
    NEW.user_id,
    NEW.broker_id,
    NEW.id,
    broker_commission_rate,
    (NEW.sale_price * broker_commission_rate / 100)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER create_commission_after_sale
AFTER INSERT ON public.property_sales
FOR EACH ROW
EXECUTE FUNCTION public.create_commission_on_sale();

-- Função para atualizar status da comissão quando registro é concluído
CREATE OR REPLACE FUNCTION public.update_commission_on_registration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.registration_status = 'completed' AND OLD.registration_status != 'completed' THEN
    NEW.registration_completed_at = now();
    
    -- Atualiza a comissão para "devida"
    UPDATE public.broker_commissions 
    SET payment_status = 'due', due_date = CURRENT_DATE
    WHERE sale_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_commission_on_registration_complete
BEFORE UPDATE ON public.property_sales
FOR EACH ROW
EXECUTE FUNCTION public.update_commission_on_registration();
