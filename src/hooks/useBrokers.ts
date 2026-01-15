import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Broker } from '@/types/commissions';

export function useBrokers() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: brokers = [], isLoading, error } = useQuery({
    queryKey: ['brokers', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('brokers')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      return data as Broker[];
    },
    enabled: !!user?.id,
  });

  const createBroker = useMutation({
    mutationFn: async (broker: Omit<Broker, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('brokers')
        .insert({ ...broker, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brokers'] });
      toast.success('Corretor cadastrado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao cadastrar corretor: ${error.message}`);
    },
  });

  const updateBroker = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Broker> & { id: string }) => {
      const { data, error } = await supabase
        .from('brokers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brokers'] });
      toast.success('Corretor atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar corretor: ${error.message}`);
    },
  });

  const deleteBroker = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('brokers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brokers'] });
      toast.success('Corretor removido com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover corretor: ${error.message}`);
    },
  });

  return {
    brokers,
    activeBrokers: brokers.filter(b => b.is_active),
    isLoading,
    error,
    createBroker,
    updateBroker,
    deleteBroker,
  };
}
