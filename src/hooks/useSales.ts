import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { PropertySale, RegistrationStatus } from '@/types/commissions';

export function useSales() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: sales = [], isLoading, error } = useQuery({
    queryKey: ['property_sales', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('property_sales')
        .select(`
          *,
          broker:brokers(*)
        `)
        .eq('user_id', user.id)
        .order('sale_date', { ascending: false });
      
      if (error) throw error;
      return data as PropertySale[];
    },
    enabled: !!user?.id,
  });

  const createSale = useMutation({
    mutationFn: async (sale: {
      broker_id: string;
      property_title: string;
      property_address?: string;
      sale_price: number;
      sale_date: string;
      buyer_name?: string;
      buyer_cpf?: string;
      notes?: string;
    }) => {
      if (!user?.id) throw new Error('Usuário não autenticado');
      
      const { data, error } = await supabase
        .from('property_sales')
        .insert({ ...sale, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property_sales'] });
      queryClient.invalidateQueries({ queryKey: ['broker_commissions'] });
      toast.success('Venda registrada com sucesso! Comissão calculada automaticamente.');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao registrar venda: ${error.message}`);
    },
  });

  const updateSale = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PropertySale> & { id: string }) => {
      const { data, error } = await supabase
        .from('property_sales')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property_sales'] });
      queryClient.invalidateQueries({ queryKey: ['broker_commissions'] });
      toast.success('Venda atualizada com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar venda: ${error.message}`);
    },
  });

  const updateRegistrationStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: RegistrationStatus }) => {
      const { data, error } = await supabase
        .from('property_sales')
        .update({ registration_status: status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['property_sales'] });
      queryClient.invalidateQueries({ queryKey: ['broker_commissions'] });
      
      if (variables.status === 'completed') {
        toast.success('Registro concluído! Comissão marcada como devida.');
      } else {
        toast.success('Status do registro atualizado!');
      }
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar status: ${error.message}`);
    },
  });

  const deleteSale = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('property_sales')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property_sales'] });
      queryClient.invalidateQueries({ queryKey: ['broker_commissions'] });
      toast.success('Venda removida com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover venda: ${error.message}`);
    },
  });

  return {
    sales,
    isLoading,
    error,
    createSale,
    updateSale,
    updateRegistrationStatus,
    deleteSale,
  };
}
