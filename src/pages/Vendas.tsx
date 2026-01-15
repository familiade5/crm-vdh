import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useSales } from '@/hooks/useSales';
import { useBrokers } from '@/hooks/useBrokers';
import { SaleForm } from '@/components/commissions/SaleForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Plus,
  Search,
  Building,
  User,
  Calendar,
  DollarSign,
  FileCheck,
  Clock,
  Loader2,
  CheckCircle,
  MoreVertical,
  Eye,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { PropertySale, RegistrationStatus } from '@/types/commissions';

const registrationStatusConfig: Record<RegistrationStatus, { label: string; color: string; icon: typeof Clock }> = {
  pending: {
    label: 'Aguardando',
    color: 'bg-muted text-muted-foreground border-muted-foreground/30',
    icon: Clock,
  },
  in_progress: {
    label: 'Em Andamento',
    color: 'bg-info/10 text-info border-info/30',
    icon: Loader2,
  },
  completed: {
    label: 'Concluído',
    color: 'bg-success/10 text-success border-success/30',
    icon: CheckCircle,
  },
};

const Vendas = () => {
  const { sales, isLoading, createSale, updateRegistrationStatus, deleteSale } = useSales();
  const { activeBrokers } = useBrokers();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [deletingSale, setDeletingSale] = useState<PropertySale | null>(null);

  const filteredSales = sales.filter(
    (sale) =>
      sale.property_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.broker?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.buyer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleSubmit = (data: Parameters<typeof createSale.mutate>[0]) => {
    createSale.mutate(data, {
      onSuccess: () => setShowForm(false),
    });
  };

  const handleDelete = () => {
    if (deletingSale) {
      deleteSale.mutate(deletingSale.id, {
        onSuccess: () => setDeletingSale(null),
      });
    }
  };

  const handleStatusChange = (sale: PropertySale, status: RegistrationStatus) => {
    updateRegistrationStatus.mutate({ id: sale.id, status });
  };

  const totalSales = filteredSales.reduce((acc, sale) => acc + Number(sale.sale_price), 0);

  return (
    <MainLayout>
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl md:text-3xl lg:text-4xl">Vendas</h1>
            <p className="text-muted-foreground mt-1">
              {filteredSales.length} vendas • Total: {formatCurrency(totalSales)}
            </p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-primary text-primary-foreground shadow-glow"
            disabled={activeBrokers.length === 0}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Venda
          </Button>
        </div>

        {activeBrokers.length === 0 && (
          <div className="bg-warning/10 border border-warning/30 rounded-xl p-4">
            <p className="text-warning text-sm">
              ⚠️ Cadastre pelo menos um corretor antes de registrar vendas.
            </p>
          </div>
        )}

        {/* Search */}
        <div className="bg-card rounded-2xl p-4 shadow-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por imóvel, corretor ou comprador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && sales.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Building className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Nenhuma venda registrada</h3>
            <p className="text-muted-foreground mb-4">
              Registre suas vendas para gerenciar comissões automaticamente.
            </p>
          </div>
        )}

        {/* Sales List */}
        {!isLoading && filteredSales.length > 0 && (
          <div className="space-y-4">
            {filteredSales.map((sale, index) => {
              const statusConfig = registrationStatusConfig[sale.registration_status];
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={sale.id}
                  className="bg-card rounded-2xl p-4 md:p-5 shadow-md border border-border hover:shadow-lg transition-all animate-slide-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Main Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-lg truncate">{sale.property_title}</h3>
                          {sale.property_address && (
                            <p className="text-sm text-muted-foreground truncate">{sale.property_address}</p>
                          )}
                        </div>
                        <Badge className={cn('px-2 py-1 border shrink-0', statusConfig.color)}>
                          <StatusIcon className={cn('w-3 h-3 mr-1', sale.registration_status === 'in_progress' && 'animate-spin')} />
                          {statusConfig.label}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                        <div className="flex items-center gap-1.5">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Corretor:</span>
                          <span className="font-medium">{sale.broker?.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {format(new Date(sale.sale_date), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                          </span>
                        </div>
                        {sale.buyer_name && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-muted-foreground">Comprador:</span>
                            <span className="font-medium">{sale.buyer_name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="flex items-center justify-between lg:justify-end gap-4">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Valor da Venda</p>
                        <p className="font-display font-bold text-xl text-primary">
                          {formatCurrency(Number(sale.sale_price))}
                        </p>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            disabled={sale.registration_status === 'pending'}
                            onClick={() => handleStatusChange(sale, 'pending')}
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            Marcar: Aguardando
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={sale.registration_status === 'in_progress'}
                            onClick={() => handleStatusChange(sale, 'in_progress')}
                          >
                            <Loader2 className="w-4 h-4 mr-2" />
                            Marcar: Em Andamento
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={sale.registration_status === 'completed'}
                            onClick={() => handleStatusChange(sale, 'completed')}
                            className="text-success"
                          >
                            <FileCheck className="w-4 h-4 mr-2" />
                            Marcar: Registro Concluído
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeletingSale(sale)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir Venda
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <SaleForm
        open={showForm}
        onOpenChange={setShowForm}
        brokers={activeBrokers}
        onSubmit={handleSubmit}
        isLoading={createSale.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingSale} onOpenChange={() => setDeletingSale(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Venda</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a venda "{deletingSale?.property_title}"?
              A comissão associada também será removida. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default Vendas;
