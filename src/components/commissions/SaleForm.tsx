import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Broker, PropertySale } from '@/types/commissions';
import { format } from 'date-fns';

interface SaleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brokers: Broker[];
  sale?: PropertySale | null;
  onSubmit: (data: {
    broker_id: string;
    property_title: string;
    property_address?: string;
    sale_price: number;
    sale_date: string;
    buyer_name?: string;
    buyer_cpf?: string;
    notes?: string;
  }) => void;
  isLoading?: boolean;
}

export function SaleForm({ open, onOpenChange, brokers, sale, onSubmit, isLoading }: SaleFormProps) {
  const [formData, setFormData] = useState({
    broker_id: sale?.broker_id || '',
    property_title: sale?.property_title || '',
    property_address: sale?.property_address || '',
    sale_price: sale?.sale_price || 0,
    sale_date: sale?.sale_date || format(new Date(), 'yyyy-MM-dd'),
    buyer_name: sale?.buyer_name || '',
    buyer_cpf: sale?.buyer_cpf || '',
    notes: sale?.notes || '',
  });

  const selectedBroker = brokers.find(b => b.id === formData.broker_id);
  const estimatedCommission = formData.sale_price * (selectedBroker?.commission_rate || 0) / 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      sale_price: Number(formData.sale_price),
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{sale ? 'Editar Venda' : 'Registrar Nova Venda'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="broker_id">Corretor Responsável *</Label>
            <Select
              value={formData.broker_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, broker_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o corretor" />
              </SelectTrigger>
              <SelectContent>
                {brokers.filter(b => b.is_active).map((broker) => (
                  <SelectItem key={broker.id} value={broker.id}>
                    {broker.name} ({broker.commission_rate}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="property_title">Título do Imóvel *</Label>
            <Input
              id="property_title"
              value={formData.property_title}
              onChange={(e) => setFormData(prev => ({ ...prev, property_title: e.target.value }))}
              placeholder="Ex: Apartamento 3 quartos - Centro"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="property_address">Endereço</Label>
            <Input
              id="property_address"
              value={formData.property_address}
              onChange={(e) => setFormData(prev => ({ ...prev, property_address: e.target.value }))}
              placeholder="Rua, número, bairro"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sale_price">Valor da Venda (R$) *</Label>
              <Input
                id="sale_price"
                type="number"
                min="0"
                step="1000"
                value={formData.sale_price}
                onChange={(e) => setFormData(prev => ({ ...prev, sale_price: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sale_date">Data da Venda *</Label>
              <Input
                id="sale_date"
                type="date"
                value={formData.sale_date}
                onChange={(e) => setFormData(prev => ({ ...prev, sale_date: e.target.value }))}
                required
              />
            </div>
          </div>

          {formData.broker_id && formData.sale_price > 0 && (
            <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
              <p className="text-sm text-muted-foreground">Comissão Estimada</p>
              <p className="text-xl font-bold text-primary">
                {formatCurrency(estimatedCommission)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedBroker?.commission_rate}% sobre {formatCurrency(formData.sale_price)}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buyer_name">Nome do Comprador</Label>
              <Input
                id="buyer_name"
                value={formData.buyer_name}
                onChange={(e) => setFormData(prev => ({ ...prev, buyer_name: e.target.value }))}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="buyer_cpf">CPF do Comprador</Label>
              <Input
                id="buyer_cpf"
                value={formData.buyer_cpf}
                onChange={(e) => setFormData(prev => ({ ...prev, buyer_cpf: e.target.value }))}
                placeholder="000.000.000-00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Notas adicionais sobre a venda..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !formData.broker_id}>
              {isLoading ? 'Salvando...' : 'Registrar Venda'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
