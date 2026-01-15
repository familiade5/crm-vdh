import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useCommissions } from '@/hooks/useCommissions';
import { CommissionCard } from '@/components/commissions/CommissionCard';
import { PaymentDialog } from '@/components/commissions/PaymentDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import type { BrokerCommission } from '@/types/commissions';

const Comissoes = () => {
  const { 
    pendingCommissions, 
    dueCommissions, 
    paidCommissions, 
    summary, 
    isLoading,
    updatePaymentStatus 
  } = useCommissions();
  
  const [selectedCommission, setSelectedCommission] = useState<BrokerCommission | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handlePayClick = (commission: BrokerCommission) => {
    setSelectedCommission(commission);
    setShowPaymentDialog(true);
  };

  const handlePaymentConfirm = (data: { payment_method?: string; payment_reference?: string }) => {
    if (selectedCommission) {
      updatePaymentStatus.mutate(
        { 
          id: selectedCommission.id, 
          status: 'paid',
          payment_method: data.payment_method,
          payment_reference: data.payment_reference,
        },
        {
          onSuccess: () => {
            setShowPaymentDialog(false);
            setSelectedCommission(null);
          },
        }
      );
    }
  };

  const stats = [
    {
      label: 'Aguardando Registro',
      value: formatCurrency(summary.totalPending),
      count: summary.countPending,
      icon: Clock,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    },
    {
      label: 'A Pagar',
      value: formatCurrency(summary.totalDue),
      count: summary.countDue,
      icon: AlertCircle,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: 'Pagas',
      value: formatCurrency(summary.totalPaid),
      count: summary.countPaid,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Total Geral',
      value: formatCurrency(summary.totalPending + summary.totalDue + summary.totalPaid),
      count: summary.countPending + summary.countDue + summary.countPaid,
      icon: TrendingUp,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <MainLayout>
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl lg:text-4xl">Comissões</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os pagamentos de comissões dos corretores
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-card rounded-2xl p-4 md:p-5 shadow-md border border-border"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', stat.bgColor)}>
                  <stat.icon className={cn('w-5 h-5', stat.color)} />
                </div>
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</p>
              <p className={cn('font-display font-bold text-xl md:text-2xl mt-1', stat.color)}>
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.count} comiss{stat.count === 1 ? 'ão' : 'ões'}
              </p>
            </div>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && summary.countPending + summary.countDue + summary.countPaid === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Wallet className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Nenhuma comissão ainda</h3>
            <p className="text-muted-foreground">
              As comissões serão criadas automaticamente quando você registrar vendas.
            </p>
          </div>
        )}

        {/* Tabs */}
        {!isLoading && (summary.countPending + summary.countDue + summary.countPaid > 0) && (
          <Tabs defaultValue="due" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="due" className="relative">
                <AlertCircle className="w-4 h-4 mr-2" />
                A Pagar
                {summary.countDue > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-warning text-warning-foreground rounded-full">
                    {summary.countDue}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="pending">
                <Clock className="w-4 h-4 mr-2" />
                Aguardando
                {summary.countPending > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
                    {summary.countPending}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="paid">
                <CheckCircle className="w-4 h-4 mr-2" />
                Pagas
                {summary.countPaid > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-success text-success-foreground rounded-full">
                    {summary.countPaid}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="due" className="space-y-4">
              {dueCommissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma comissão pendente de pagamento
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {dueCommissions.map((commission) => (
                    <CommissionCard
                      key={commission.id}
                      commission={commission}
                      onPayClick={() => handlePayClick(commission)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {pendingCommissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma comissão aguardando registro do imóvel
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pendingCommissions.map((commission) => (
                    <CommissionCard
                      key={commission.id}
                      commission={commission}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="paid" className="space-y-4">
              {paidCommissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma comissão paga ainda
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {paidCommissions.map((commission) => (
                    <CommissionCard
                      key={commission.id}
                      commission={commission}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Payment Dialog */}
      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        commission={selectedCommission}
        onConfirm={handlePaymentConfirm}
        isLoading={updatePaymentStatus.isPending}
      />
    </MainLayout>
  );
};

export default Comissoes;
