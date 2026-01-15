import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { BrokerCommission, PaymentStatus, CommissionSummary } from '@/types/commissions';

export function useCommissions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: commissions = [], isLoading, error } = useQuery({
    queryKey: ['broker_commissions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('broker_commissions')
        .select(`
          *,
          broker:brokers(*),
          sale:property_sales(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BrokerCommission[];
    },
    enabled: !!user?.id,
  });

  const summary: CommissionSummary = commissions.reduce(
    (acc, commission) => {
      const amount = Number(commission.commission_amount);
      switch (commission.payment_status) {
        case 'pending':
          acc.totalPending += amount;
          acc.countPending += 1;
          break;
        case 'due':
          acc.totalDue += amount;
          acc.countDue += 1;
          break;
        case 'paid':
          acc.totalPaid += amount;
          acc.countPaid += 1;
          break;
      }
      return acc;
    },
    { totalPending: 0, totalDue: 0, totalPaid: 0, countPending: 0, countDue: 0, countPaid: 0 }
  );

  const updatePaymentStatus = useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      payment_method,
      payment_reference 
    }: { 
      id: string; 
      status: PaymentStatus;
      payment_method?: string;
      payment_reference?: string;
    }) => {
      const updates: Partial<BrokerCommission> = { 
        payment_status: status 
      };
      
      if (status === 'paid') {
        updates.paid_at = new Date().toISOString();
        updates.payment_method = payment_method || null;
        updates.payment_reference = payment_reference || null;
      }
      
      const { data, error } = await supabase
        .from('broker_commissions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['broker_commissions'] });
      
      if (variables.status === 'paid') {
        toast.success('Pagamento registrado com sucesso!');
      } else {
        toast.success('Status do pagamento atualizado!');
      }
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar pagamento: ${error.message}`);
    },
  });

  const pendingCommissions = commissions.filter(c => c.payment_status === 'pending');
  const dueCommissions = commissions.filter(c => c.payment_status === 'due');
  const paidCommissions = commissions.filter(c => c.payment_status === 'paid');

  return {
    commissions,
    pendingCommissions,
    dueCommissions,
    paidCommissions,
    summary,
    isLoading,
    error,
    updatePaymentStatus,
  };
}
