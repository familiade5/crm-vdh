import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BrokerCommission } from '@/types/commissions';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commission: BrokerCommission | null;
  onConfirm: (data: { payment_method?: string; payment_reference?: string }) => void;
  isLoading?: boolean;
}

export function PaymentDialog({ open, onOpenChange, commission, onConfirm, isLoading }: PaymentDialogProps) {
  const [formData, setFormData] = useState({
    payment_method: '',
    payment_reference: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(formData);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (!commission) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar Pagamento</DialogTitle>
          <DialogDescription>
            Registrar pagamento de comissão para {commission.broker?.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4 bg-success/10 rounded-xl border border-success/20 mb-4">
          <p className="text-sm text-muted-foreground">Valor a Pagar</p>
          <p className="text-2xl font-bold text-success">
            {formatCurrency(Number(commission.commission_amount))}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Referente à venda: {commission.sale?.property_title}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment_method">Forma de Pagamento</Label>
            <Select
              value={formData.payment_method}
              onValueChange={(value) => setFormData(prev => ({ ...prev, payment_method: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_reference">Comprovante / Referência</Label>
            <Input
              id="payment_reference"
              value={formData.payment_reference}
              onChange={(e) => setFormData(prev => ({ ...prev, payment_reference: e.target.value }))}
              placeholder="Número do comprovante, ID da transação..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-success hover:bg-success/90">
              {isLoading ? 'Processando...' : 'Confirmar Pagamento'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
