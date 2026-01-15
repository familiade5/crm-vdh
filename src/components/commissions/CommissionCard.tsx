import { cn } from '@/lib/utils';
import { User, Building, Calendar, DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { BrokerCommission } from '@/types/commissions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CommissionCardProps {
  commission: BrokerCommission;
  onPayClick?: () => void;
  className?: string;
}

const statusConfig = {
  pending: {
    label: 'Aguardando Registro',
    color: 'bg-muted text-muted-foreground',
    icon: Clock,
  },
  due: {
    label: 'A Pagar',
    color: 'bg-warning/10 text-warning border-warning/30',
    icon: AlertCircle,
  },
  paid: {
    label: 'Pago',
    color: 'bg-success/10 text-success border-success/30',
    icon: CheckCircle,
  },
};

export function CommissionCard({ commission, onPayClick, className }: CommissionCardProps) {
  const config = statusConfig[commission.payment_status];
  const StatusIcon = config.icon;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className={cn('bg-card rounded-2xl p-5 shadow-md border border-border hover:shadow-lg transition-all', className)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">{commission.broker?.name}</h3>
            <p className="text-sm text-muted-foreground">{commission.broker?.creci && `CRECI: ${commission.broker.creci}`}</p>
          </div>
        </div>
        <Badge className={cn('px-3 py-1 border', config.color)}>
          <StatusIcon className="w-3 h-3 mr-1.5" />
          {config.label}
        </Badge>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Building className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Imóvel:</span>
          <span className="font-medium truncate">{commission.sale?.property_title}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Venda:</span>
          <span className="font-medium">{formatCurrency(Number(commission.sale?.sale_price || 0))}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Data:</span>
          <span className="font-medium">
            {commission.sale?.sale_date && format(new Date(commission.sale.sale_date), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-border flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Comissão ({commission.commission_rate}%)</p>
          <p className={cn(
            'text-xl font-bold',
            commission.payment_status === 'paid' ? 'text-success' : 
            commission.payment_status === 'due' ? 'text-warning' : 'text-muted-foreground'
          )}>
            {formatCurrency(Number(commission.commission_amount))}
          </p>
        </div>

        {commission.payment_status === 'due' && onPayClick && (
          <Button onClick={onPayClick} className="bg-success hover:bg-success/90">
            Pagar Agora
          </Button>
        )}

        {commission.payment_status === 'paid' && commission.paid_at && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Pago em</p>
            <p className="text-sm font-medium text-success">
              {format(new Date(commission.paid_at), "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
