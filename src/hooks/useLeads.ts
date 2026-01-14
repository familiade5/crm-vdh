import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Lead {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  source: 'facebook' | 'instagram' | 'google' | 'olx' | 'site' | 'whatsapp';
  temperature: 'frio' | 'morno' | 'quente';
  status: 'novo' | 'contato' | 'visita' | 'proposta' | 'fechado' | 'perdido';
  interest: string;
  ai_active: boolean;
  ai_qualified: boolean;
  requested_human: boolean;
  score: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  lead_id: string;
  content: string;
  sender: 'lead' | 'ai' | 'user';
  is_transfer_request: boolean;
  created_at: string;
}

export function useLeads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLeads();
      subscribeToLeads();
    }
  }, [user]);

  const fetchLeads = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data as Lead[]);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToLeads = () => {
    const channel = supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads'
        },
        () => {
          fetchLeads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const createLead = async (lead: Omit<Lead, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: new Error('Not authenticated'), data: null };

    try {
      const { data, error } = await supabase
        .from('leads')
        .insert({ ...lead, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      toast.success('Lead criado com sucesso!');
      return { error: null, data };
    } catch (error) {
      toast.error('Erro ao criar lead');
      return { error, data: null };
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      const { error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      toast.success('Lead atualizado!');
      return { error: null };
    } catch (error) {
      toast.error('Erro ao atualizar lead');
      return { error };
    }
  };

  const deleteLead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Lead removido!');
      return { error: null };
    } catch (error) {
      toast.error('Erro ao remover lead');
      return { error };
    }
  };

  return { leads, loading, createLead, updateLead, deleteLead, refetch: fetchLeads };
}

export function useChatMessages(leadId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (leadId) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [leadId]);

  const fetchMessages = async () => {
    if (!leadId) return;
    
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data as ChatMessage[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages-${leadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `lead_id=eq.${leadId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (content: string, sender: 'user' | 'ai' | 'lead') => {
    if (!leadId) return { error: new Error('No lead selected') };

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({ lead_id: leadId, content, sender });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return { messages, loading, sendMessage, refetch: fetchMessages };
}
