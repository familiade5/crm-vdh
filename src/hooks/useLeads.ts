import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Lead {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  source: 'facebook' | 'instagram' | 'google' | 'olx' | 'site' | 'whatsapp' | 'indicacao' | 'outro';
  temperature: 'frio' | 'morno' | 'quente';
  status: 'novo' | 'contato' | 'qualificado' | 'visita' | 'proposta' | 'fechado' | 'perdido';
  interest: string | null;
  budget: string | null;
  ai_active: boolean;
  ai_qualified: boolean;
  requested_human: boolean;
  score: number;
  notes: string | null;
  assigned_to: string | null;
  created_at: string;
  last_contact: string;
}

export interface ChatMessage {
  id: string;
  lead_id: string;
  content: string;
  sender: 'lead' | 'ai' | 'agent';
  is_ai: boolean;
  is_transfer_request: boolean;
  created_at: string;
}

type CreateLeadInput = {
  name: string;
  email?: string;
  phone?: string;
  source?: Lead['source'];
  temperature?: Lead['temperature'];
  status?: Lead['status'];
  interest?: string;
  budget?: string;
  notes?: string;
};

export function useLeads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(async () => {
    if (!user) {
      setLeads([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('last_contact', { ascending: false });

      if (error) throw error;
      setLeads(data as Lead[]);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Erro ao carregar leads');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('leads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchLeads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchLeads]);

  const createLead = async (leadData: CreateLeadInput) => {
    if (!user) return { error: new Error('Not authenticated'), data: null };

    try {
      const { data, error } = await supabase
        .from('leads')
        .insert({
          user_id: user.id,
          name: leadData.name,
          email: leadData.email || null,
          phone: leadData.phone || null,
          source: leadData.source || 'site',
          temperature: leadData.temperature || 'frio',
          status: leadData.status || 'novo',
          interest: leadData.interest || null,
          budget: leadData.budget || null,
          notes: leadData.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      
      setLeads(prev => [data as Lead, ...prev]);
      toast.success('Lead criado com sucesso!');
      return { data: data as Lead, error: null };
    } catch (error) {
      console.error('Error creating lead:', error);
      toast.error('Erro ao criar lead');
      return { error, data: null };
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('leads')
        .update({
          ...updates,
          last_contact: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setLeads(prev => 
        prev.map(lead => lead.id === id ? { ...lead, ...updates } : lead)
      );
      toast.success('Lead atualizado!');
      return { error: null };
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error('Erro ao atualizar lead');
      return { error };
    }
  };

  const deleteLead = async (id: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setLeads(prev => prev.filter(lead => lead.id !== id));
      toast.success('Lead removido!');
      return { error: null };
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error('Erro ao remover lead');
      return { error };
    }
  };

  return { leads, loading, createLead, updateLead, deleteLead, refetch: fetchLeads };
}

export function useChatMessages(leadId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!leadId || !user) {
      setMessages([]);
      setLoading(false);
      return;
    }

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
  }, [leadId, user]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!leadId) return;

    const channel = supabase
      .channel(`chat_messages_${leadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `lead_id=eq.${leadId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [leadId]);

  const sendMessage = async (content: string, sender: 'lead' | 'ai' | 'agent', isAI: boolean = false, isTransferRequest: boolean = false) => {
    if (!leadId || !user) return { error: new Error('No lead selected') };

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          lead_id: leadId,
          content,
          sender,
          is_ai: isAI,
          is_transfer_request: isTransferRequest,
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error sending message:', error);
      return { error };
    }
  };

  const callAI = async (message: string, leadName: string, leadInterest: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message,
          leadId,
          leadName,
          leadInterest,
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error calling AI:', error);
      return { response: 'Desculpe, ocorreu um erro. Por favor, tente novamente.', isTransferRequest: false };
    }
  };

  return { messages, loading, sendMessage, callAI, refetch: fetchMessages };
}
