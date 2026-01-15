-- Create properties table
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  property_type TEXT NOT NULL DEFAULT 'apartamento',
  status TEXT NOT NULL DEFAULT 'disponivel',
  price NUMERIC NOT NULL DEFAULT 0,
  address TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT DEFAULT 'SP',
  zip_code TEXT,
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  parking_spaces INTEGER DEFAULT 0,
  area NUMERIC DEFAULT 0,
  features TEXT[],
  images TEXT[],
  broker_id UUID REFERENCES public.brokers(id) ON DELETE SET NULL,
  sold_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create property_interested_leads junction table
CREATE TABLE public.property_interested_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  interest_level TEXT DEFAULT 'medio',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(property_id, lead_id)
);

-- Enable RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_interested_leads ENABLE ROW LEVEL SECURITY;

-- RLS policies for properties
CREATE POLICY "Users can view their own properties" 
ON public.properties FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own properties" 
ON public.properties FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own properties" 
ON public.properties FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own properties" 
ON public.properties FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for property_interested_leads
CREATE POLICY "Users can view interested leads for their properties" 
ON public.property_interested_leads FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.properties 
  WHERE properties.id = property_interested_leads.property_id 
  AND properties.user_id = auth.uid()
));

CREATE POLICY "Users can add interested leads to their properties" 
ON public.property_interested_leads FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.properties 
  WHERE properties.id = property_interested_leads.property_id 
  AND properties.user_id = auth.uid()
));

CREATE POLICY "Users can update interested leads for their properties" 
ON public.property_interested_leads FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.properties 
  WHERE properties.id = property_interested_leads.property_id 
  AND properties.user_id = auth.uid()
));

CREATE POLICY "Users can remove interested leads from their properties" 
ON public.property_interested_leads FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.properties 
  WHERE properties.id = property_interested_leads.property_id 
  AND properties.user_id = auth.uid()
));

-- Trigger for updated_at
CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();