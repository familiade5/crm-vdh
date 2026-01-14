import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface AISettings {
  id: string;
  user_id: string;
  auto_response: boolean;
  score_qualification: boolean;
  auto_scheduling: boolean;
  welcome_message: string;
}

export interface CompanySettings {
  id: string;
  user_id: string;
  company_name: string;
  cnpj: string;
  address: string;
}

export function useAISettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error fetching AI settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<AISettings>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('ai_settings')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setSettings(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Configurações salvas!');
      return { error: null };
    } catch (error) {
      toast.error('Erro ao salvar configurações');
      return { error };
    }
  };

  return { settings, loading, updateSettings };
}

export function useCompanySettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error fetching company settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<CompanySettings>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      if (settings) {
        const { error } = await supabase
          .from('company_settings')
          .update(updates)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('company_settings')
          .insert({ ...updates, user_id: user.id });
        if (error) throw error;
      }
      
      setSettings(prev => prev ? { ...prev, ...updates } : { user_id: user.id, ...updates } as CompanySettings);
      toast.success('Dados da empresa salvos!');
      return { error: null };
    } catch (error) {
      toast.error('Erro ao salvar dados da empresa');
      return { error };
    }
  };

  return { settings, loading, updateSettings };
}
