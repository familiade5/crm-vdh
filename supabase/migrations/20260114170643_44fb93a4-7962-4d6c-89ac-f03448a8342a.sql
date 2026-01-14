-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  creci TEXT,
  role TEXT DEFAULT 'corretor',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'novo' CHECK (status IN ('novo', 'contato', 'qualificado', 'visita', 'proposta', 'fechado', 'perdido')),
  temperature TEXT DEFAULT 'frio' CHECK (temperature IN ('frio', 'morno', 'quente')),
  source TEXT DEFAULT 'site' CHECK (source IN ('facebook', 'instagram', 'google', 'olx', 'site', 'whatsapp', 'indicacao', 'outro')),
  interest TEXT,
  budget TEXT,
  notes TEXT,
  score INTEGER DEFAULT 50,
  ai_qualified BOOLEAN DEFAULT false,
  ai_active BOOLEAN DEFAULT true,
  requested_human BOOLEAN DEFAULT false,
  assigned_to TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_contact TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('lead', 'ai', 'agent')),
  is_ai BOOLEAN DEFAULT false,
  is_transfer_request BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ai_settings table
CREATE TABLE public.ai_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  auto_response BOOLEAN DEFAULT true,
  score_qualification BOOLEAN DEFAULT true,
  auto_scheduling BOOLEAN DEFAULT false,
  welcome_message TEXT DEFAULT 'Olá! 👋 Bem-vindo à nossa imobiliária! Sou o assistente virtual e estou aqui para ajudá-lo a encontrar o imóvel ideal.',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create company_settings table
CREATE TABLE public.company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  cnpj TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create portal_integrations table
CREATE TABLE public.portal_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portal_slug TEXT NOT NULL,
  portal_name TEXT NOT NULL,
  category TEXT DEFAULT 'portal' CHECK (category IN ('social', 'portal', 'analytics')),
  is_active BOOLEAN DEFAULT false,
  api_key TEXT,
  webhook_url TEXT,
  leads_count INTEGER DEFAULT 0,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, portal_slug)
);

-- Create whatsapp_connections table
CREATE TABLE public.whatsapp_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number TEXT,
  status TEXT DEFAULT 'disconnected' CHECK (status IN ('disconnected', 'scanning', 'connected')),
  qr_code TEXT,
  leads_captured INTEGER DEFAULT 0,
  active_chats INTEGER DEFAULT 0,
  response_rate NUMERIC(5,2) DEFAULT 0,
  connected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portal_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_connections ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Leads policies
CREATE POLICY "Users can view own leads" ON public.leads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own leads" ON public.leads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own leads" ON public.leads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own leads" ON public.leads FOR DELETE USING (auth.uid() = user_id);

-- Chat messages policies (through lead ownership)
CREATE POLICY "Users can view messages of own leads" ON public.chat_messages 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.leads WHERE leads.id = chat_messages.lead_id AND leads.user_id = auth.uid())
  );
CREATE POLICY "Users can insert messages to own leads" ON public.chat_messages 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.leads WHERE leads.id = chat_messages.lead_id AND leads.user_id = auth.uid())
  );

-- AI settings policies
CREATE POLICY "Users can view own ai_settings" ON public.ai_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own ai_settings" ON public.ai_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ai_settings" ON public.ai_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Company settings policies
CREATE POLICY "Users can view own company_settings" ON public.company_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own company_settings" ON public.company_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own company_settings" ON public.company_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Portal integrations policies
CREATE POLICY "Users can view own integrations" ON public.portal_integrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own integrations" ON public.portal_integrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own integrations" ON public.portal_integrations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own integrations" ON public.portal_integrations FOR DELETE USING (auth.uid() = user_id);

-- WhatsApp connections policies
CREATE POLICY "Users can view own whatsapp" ON public.whatsapp_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own whatsapp" ON public.whatsapp_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own whatsapp" ON public.whatsapp_connections FOR UPDATE USING (auth.uid() = user_id);

-- Function to handle new user signup (create profile and settings)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'name', NEW.email);
  
  -- Create AI settings
  INSERT INTO public.ai_settings (user_id) VALUES (NEW.id);
  
  -- Create company settings
  INSERT INTO public.company_settings (user_id) VALUES (NEW.id);
  
  -- Create WhatsApp connection
  INSERT INTO public.whatsapp_connections (user_id) VALUES (NEW.id);
  
  -- Create default portal integrations
  INSERT INTO public.portal_integrations (user_id, portal_slug, portal_name, category) VALUES
    (NEW.id, 'facebook', 'Facebook Ads', 'social'),
    (NEW.id, 'instagram', 'Instagram', 'social'),
    (NEW.id, 'google', 'Google Ads', 'social'),
    (NEW.id, 'olx', 'OLX', 'portal'),
    (NEW.id, 'zap', 'ZAP Imóveis', 'portal'),
    (NEW.id, 'vivareal', 'Viva Real', 'portal'),
    (NEW.id, 'analytics', 'Google Analytics', 'analytics');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add update triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ai_settings_updated_at BEFORE UPDATE ON public.ai_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON public.company_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();