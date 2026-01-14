import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface PortalIntegration {
  id: string;
  user_id: string;
  portal_slug: string;
  portal_name: string;
  category: 'social' | 'portal' | 'analytics';
  is_active: boolean;
  api_key: string;
  webhook_url: string;
  leads_count: number;
  last_sync: string | null;
}

export interface WhatsAppConnection {
  id: string;
  user_id: string;
  phone_number: string;
  status: 'disconnected' | 'scanning' | 'connected';
  qr_code: string;
  leads_captured: number;
  active_chats: number;
  response_rate: number;
  connected_at: string | null;
}

export function usePortalIntegrations() {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<PortalIntegration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchIntegrations();
    }
  }, [user]);

  const fetchIntegrations = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('portal_integrations')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setIntegrations(data as PortalIntegration[]);
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateIntegration = async (id: string, updates: Partial<PortalIntegration>) => {
    try {
      const { error } = await supabase
        .from('portal_integrations')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      setIntegrations(prev => 
        prev.map(i => i.id === id ? { ...i, ...updates } : i)
      );
      toast.success('Integração atualizada!');
      return { error: null };
    } catch (error) {
      toast.error('Erro ao atualizar integração');
      return { error };
    }
  };

  const toggleIntegration = async (id: string) => {
    const integration = integrations.find(i => i.id === id);
    if (!integration) return;

    return updateIntegration(id, { 
      is_active: !integration.is_active,
      last_sync: !integration.is_active ? new Date().toISOString() : integration.last_sync
    });
  };

  return { integrations, loading, updateIntegration, toggleIntegration, refetch: fetchIntegrations };
}

export function useWhatsAppConnection() {
  const { user } = useAuth();
  const [connection, setConnection] = useState<WhatsAppConnection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConnection();
    }
  }, [user]);

  const fetchConnection = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('whatsapp_connections')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setConnection(data as WhatsAppConnection);
    } catch (error) {
      console.error('Error fetching WhatsApp connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConnection = async (updates: Partial<WhatsAppConnection>) => {
    if (!user || !connection) return { error: new Error('Not authenticated') };

    try {
      const { error } = await supabase
        .from('whatsapp_connections')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setConnection(prev => prev ? { ...prev, ...updates } : null);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const startScanning = async () => {
    // Generate a simulated QR code session
    await updateConnection({ 
      status: 'scanning',
      qr_code: `QR_${Date.now()}`
    });
    toast.info('Escaneie o QR Code com seu WhatsApp Business');
  };

  const connect = async (phoneNumber: string) => {
    await updateConnection({ 
      status: 'connected',
      phone_number: phoneNumber,
      connected_at: new Date().toISOString(),
      qr_code: ''
    });
    toast.success('WhatsApp Business conectado com sucesso!');
  };

  const disconnect = async () => {
    await updateConnection({ 
      status: 'disconnected',
      phone_number: '',
      connected_at: null,
      qr_code: ''
    });
    toast.info('WhatsApp desconectado');
  };

  return { connection, loading, updateConnection, startScanning, connect, disconnect };
}
