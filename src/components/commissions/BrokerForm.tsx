import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { Broker } from '@/types/commissions';

interface BrokerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  broker?: Broker | null;
  onSubmit: (data: Partial<Broker>) => void;
  isLoading?: boolean;
}

export function BrokerForm({ open, onOpenChange, broker, onSubmit, isLoading }: BrokerFormProps) {
  const [formData, setFormData] = useState({
    name: broker?.name || '',
    email: broker?.email || '',
    phone: broker?.phone || '',
    cpf: broker?.cpf || '',
    creci: broker?.creci || '',
    commission_rate: broker?.commission_rate || 6,
    is_active: broker?.is_active ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      commission_rate: Number(formData.commission_rate),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{broker ? 'Editar Corretor' : 'Novo Corretor'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome completo"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                placeholder="000.000.000-00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="creci">CRECI</Label>
              <Input
                id="creci"
                value={formData.creci}
                onChange={(e) => setFormData(prev => ({ ...prev, creci: e.target.value }))}
                placeholder="00000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="commission_rate">Taxa de Comissão (%)</Label>
            <Input
              id="commission_rate"
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={formData.commission_rate}
              onChange={(e) => setFormData(prev => ({ ...prev, commission_rate: parseFloat(e.target.value) || 0 }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">Corretor Ativo</Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
