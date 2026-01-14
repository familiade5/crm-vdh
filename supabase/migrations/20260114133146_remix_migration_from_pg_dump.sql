CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), NEW.email);
  
  INSERT INTO public.ai_settings (user_id)
  VALUES (NEW.id);
  
  INSERT INTO public.whatsapp_connections (user_id)
  VALUES (NEW.id);
  
  -- Create default portal integrations
  INSERT INTO public.portal_integrations (user_id, portal_slug, portal_name, category) VALUES
    (NEW.id, 'facebook', 'Facebook Ads', 'social'),
    (NEW.id, 'instagram', 'Instagram', 'social'),
    (NEW.id, 'google', 'Google Ads', 'social'),
    (NEW.id, 'olx', 'OLX Imóveis', 'portal'),
    (NEW.id, 'site', 'Site Próprio', 'portal'),
    (NEW.id, 'analytics', 'Google Analytics', 'analytics');
  
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: agenda_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.agenda_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    lead_id uuid,
    property_id uuid,
    title text NOT NULL,
    description text DEFAULT ''::text,
    event_type text NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone NOT NULL,
    status text DEFAULT 'agendado'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT agenda_events_event_type_check CHECK ((event_type = ANY (ARRAY['visita'::text, 'reuniao'::text, 'ligacao'::text, 'outro'::text]))),
    CONSTRAINT agenda_events_status_check CHECK ((status = ANY (ARRAY['agendado'::text, 'confirmado'::text, 'realizado'::text, 'cancelado'::text])))
);


--
-- Name: ai_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    auto_response boolean DEFAULT true,
    score_qualification boolean DEFAULT true,
    auto_scheduling boolean DEFAULT false,
    welcome_message text DEFAULT 'Olá! 👋 Bem-vindo à nossa imobiliária! Sou o assistente virtual e estou aqui para ajudá-lo a encontrar o imóvel ideal. Para começar, poderia me contar que tipo de imóvel você está buscando?'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lead_id uuid NOT NULL,
    content text NOT NULL,
    sender text NOT NULL,
    is_transfer_request boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chat_messages_sender_check CHECK ((sender = ANY (ARRAY['lead'::text, 'ai'::text, 'user'::text])))
);


--
-- Name: company_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    company_name text DEFAULT ''::text NOT NULL,
    cnpj text DEFAULT ''::text,
    address text DEFAULT ''::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: leads; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    email text DEFAULT ''::text,
    phone text NOT NULL,
    source text NOT NULL,
    temperature text DEFAULT 'frio'::text NOT NULL,
    status text DEFAULT 'novo'::text NOT NULL,
    interest text DEFAULT ''::text,
    ai_active boolean DEFAULT true,
    ai_qualified boolean DEFAULT false,
    requested_human boolean DEFAULT false,
    score integer DEFAULT 0,
    notes text DEFAULT ''::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT leads_source_check CHECK ((source = ANY (ARRAY['facebook'::text, 'instagram'::text, 'google'::text, 'olx'::text, 'site'::text, 'whatsapp'::text]))),
    CONSTRAINT leads_status_check CHECK ((status = ANY (ARRAY['novo'::text, 'contato'::text, 'visita'::text, 'proposta'::text, 'fechado'::text, 'perdido'::text]))),
    CONSTRAINT leads_temperature_check CHECK ((temperature = ANY (ARRAY['frio'::text, 'morno'::text, 'quente'::text])))
);


--
-- Name: portal_integrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.portal_integrations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    portal_slug text NOT NULL,
    portal_name text NOT NULL,
    category text NOT NULL,
    is_active boolean DEFAULT false,
    api_key text DEFAULT ''::text,
    webhook_url text DEFAULT ''::text,
    leads_count integer DEFAULT 0,
    last_sync timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT portal_integrations_category_check CHECK ((category = ANY (ARRAY['social'::text, 'portal'::text, 'analytics'::text])))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text DEFAULT ''::text NOT NULL,
    email text DEFAULT ''::text NOT NULL,
    phone text DEFAULT ''::text,
    creci text DEFAULT ''::text,
    avatar_url text DEFAULT ''::text,
    role text DEFAULT 'corretor'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: properties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.properties (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    type text NOT NULL,
    address text NOT NULL,
    price numeric(12,2) NOT NULL,
    area numeric(10,2) NOT NULL,
    bedrooms integer DEFAULT 0,
    bathrooms integer DEFAULT 0,
    parking integer DEFAULT 0,
    description text DEFAULT ''::text,
    images text[] DEFAULT '{}'::text[],
    status text DEFAULT 'disponivel'::text,
    transaction_type text DEFAULT 'venda'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT properties_status_check CHECK ((status = ANY (ARRAY['disponivel'::text, 'reservado'::text, 'vendido'::text, 'alugado'::text]))),
    CONSTRAINT properties_transaction_type_check CHECK ((transaction_type = ANY (ARRAY['venda'::text, 'aluguel'::text])))
);


--
-- Name: whatsapp_connections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.whatsapp_connections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    phone_number text DEFAULT ''::text,
    status text DEFAULT 'disconnected'::text,
    qr_code text DEFAULT ''::text,
    session_data jsonb DEFAULT '{}'::jsonb,
    leads_captured integer DEFAULT 0,
    active_chats integer DEFAULT 0,
    response_rate numeric(5,2) DEFAULT 0,
    connected_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT whatsapp_connections_status_check CHECK ((status = ANY (ARRAY['disconnected'::text, 'scanning'::text, 'connected'::text])))
);


--
-- Name: agenda_events agenda_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agenda_events
    ADD CONSTRAINT agenda_events_pkey PRIMARY KEY (id);


--
-- Name: ai_settings ai_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_settings
    ADD CONSTRAINT ai_settings_pkey PRIMARY KEY (id);


--
-- Name: ai_settings ai_settings_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_settings
    ADD CONSTRAINT ai_settings_user_id_key UNIQUE (user_id);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: company_settings company_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_settings
    ADD CONSTRAINT company_settings_pkey PRIMARY KEY (id);


--
-- Name: leads leads_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);


--
-- Name: portal_integrations portal_integrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portal_integrations
    ADD CONSTRAINT portal_integrations_pkey PRIMARY KEY (id);


--
-- Name: portal_integrations portal_integrations_user_id_portal_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portal_integrations
    ADD CONSTRAINT portal_integrations_user_id_portal_slug_key UNIQUE (user_id, portal_slug);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: properties properties_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_connections whatsapp_connections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_connections
    ADD CONSTRAINT whatsapp_connections_pkey PRIMARY KEY (id);


--
-- Name: whatsapp_connections whatsapp_connections_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_connections
    ADD CONSTRAINT whatsapp_connections_user_id_key UNIQUE (user_id);


--
-- Name: agenda_events update_agenda_events_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_agenda_events_updated_at BEFORE UPDATE ON public.agenda_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ai_settings update_ai_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_ai_settings_updated_at BEFORE UPDATE ON public.ai_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: company_settings update_company_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_company_settings_updated_at BEFORE UPDATE ON public.company_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: leads update_leads_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: portal_integrations update_portal_integrations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_portal_integrations_updated_at BEFORE UPDATE ON public.portal_integrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: properties update_properties_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: whatsapp_connections update_whatsapp_connections_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_whatsapp_connections_updated_at BEFORE UPDATE ON public.whatsapp_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: agenda_events agenda_events_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agenda_events
    ADD CONSTRAINT agenda_events_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id);


--
-- Name: agenda_events agenda_events_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agenda_events
    ADD CONSTRAINT agenda_events_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id);


--
-- Name: agenda_events agenda_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.agenda_events
    ADD CONSTRAINT agenda_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: ai_settings ai_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_settings
    ADD CONSTRAINT ai_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: chat_messages chat_messages_lead_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id);


--
-- Name: company_settings company_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_settings
    ADD CONSTRAINT company_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: leads leads_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leads
    ADD CONSTRAINT leads_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: portal_integrations portal_integrations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.portal_integrations
    ADD CONSTRAINT portal_integrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: properties properties_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.properties
    ADD CONSTRAINT properties_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: whatsapp_connections whatsapp_connections_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.whatsapp_connections
    ADD CONSTRAINT whatsapp_connections_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: agenda_events Users can delete own events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own events" ON public.agenda_events FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: portal_integrations Users can delete own integrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own integrations" ON public.portal_integrations FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: leads Users can delete own leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own leads" ON public.leads FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: properties Users can delete own properties; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own properties" ON public.properties FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: chat_messages Users can insert messages to own leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert messages to own leads" ON public.chat_messages FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.leads
  WHERE ((leads.id = chat_messages.lead_id) AND (leads.user_id = auth.uid())))));


--
-- Name: ai_settings Users can insert own ai settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own ai settings" ON public.ai_settings FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: company_settings Users can insert own company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own company" ON public.company_settings FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: agenda_events Users can insert own events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own events" ON public.agenda_events FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: portal_integrations Users can insert own integrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own integrations" ON public.portal_integrations FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: leads Users can insert own leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own leads" ON public.leads FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: properties Users can insert own properties; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own properties" ON public.properties FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: whatsapp_connections Users can insert own whatsapp; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own whatsapp" ON public.whatsapp_connections FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: ai_settings Users can update own ai settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own ai settings" ON public.ai_settings FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: company_settings Users can update own company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own company" ON public.company_settings FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: agenda_events Users can update own events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own events" ON public.agenda_events FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: portal_integrations Users can update own integrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own integrations" ON public.portal_integrations FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: leads Users can update own leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own leads" ON public.leads FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: properties Users can update own properties; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own properties" ON public.properties FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: whatsapp_connections Users can update own whatsapp; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own whatsapp" ON public.whatsapp_connections FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: chat_messages Users can view messages from own leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view messages from own leads" ON public.chat_messages FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.leads
  WHERE ((leads.id = chat_messages.lead_id) AND (leads.user_id = auth.uid())))));


--
-- Name: ai_settings Users can view own ai settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own ai settings" ON public.ai_settings FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: company_settings Users can view own company; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own company" ON public.company_settings FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: agenda_events Users can view own events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own events" ON public.agenda_events FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: portal_integrations Users can view own integrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own integrations" ON public.portal_integrations FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: leads Users can view own leads; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own leads" ON public.leads FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: properties Users can view own properties; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own properties" ON public.properties FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: whatsapp_connections Users can view own whatsapp; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own whatsapp" ON public.whatsapp_connections FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: agenda_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.agenda_events ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: company_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: leads; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

--
-- Name: portal_integrations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.portal_integrations ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: properties; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

--
-- Name: whatsapp_connections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.whatsapp_connections ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;