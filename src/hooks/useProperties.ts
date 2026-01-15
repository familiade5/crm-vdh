import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Property, PropertyInterestedLead } from '@/types/properties';
import type { TablesInsert } from '@/integrations/supabase/types';

export function useProperties() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const propertiesQuery = useQuery({
    queryKey: ['properties', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*, broker:brokers(*)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Property[];
    },
    enabled: !!user,
  });

  const createProperty = useMutation({
    mutationFn: async (property: Omit<TablesInsert<'properties'>, 'user_id'>) => {
      const { data, error } = await supabase
        .from('properties')
        .insert({ ...property, user_id: user!.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Imóvel cadastrado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao cadastrar imóvel: ' + error.message);
    },
  });

  const updateProperty = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Property> & { id: string }) => {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Imóvel atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar imóvel: ' + error.message);
    },
  });

  const deleteProperty = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Imóvel excluído com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir imóvel: ' + error.message);
    },
  });

  return {
    properties: propertiesQuery.data ?? [],
    isLoading: propertiesQuery.isLoading,
    error: propertiesQuery.error,
    createProperty,
    updateProperty,
    deleteProperty,
  };
}

export function usePropertyInterestedLeads(propertyId?: string) {
  const queryClient = useQueryClient();

  const interestedLeadsQuery = useQuery({
    queryKey: ['property-interested-leads', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('property_interested_leads')
        .select('*, lead:leads(*)')
        .eq('property_id', propertyId!)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PropertyInterestedLead[];
    },
    enabled: !!propertyId,
  });

  const addInterestedLead = useMutation({
    mutationFn: async (data: { property_id: string; lead_id: string; interest_level?: string; notes?: string }) => {
      const { error } = await supabase
        .from('property_interested_leads')
        .insert(data);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-interested-leads'] });
      toast.success('Lead vinculado ao imóvel!');
    },
    onError: (error) => {
      toast.error('Erro ao vincular lead: ' + error.message);
    },
  });

  const removeInterestedLead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('property_interested_leads')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['property-interested-leads'] });
      toast.success('Lead removido do imóvel!');
    },
    onError: (error) => {
      toast.error('Erro ao remover lead: ' + error.message);
    },
  });

  return {
    interestedLeads: interestedLeadsQuery.data ?? [],
    isLoading: interestedLeadsQuery.isLoading,
    addInterestedLead,
    removeInterestedLead,
  };
}
