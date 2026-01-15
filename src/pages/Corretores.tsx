import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useBrokers } from '@/hooks/useBrokers';
import { BrokerForm } from '@/components/commissions/BrokerForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Plus,
  Search,
  User,
  Phone,
  Mail,
  Percent,
  Edit,
  Trash2,
  MoreVertical,
  UserCheck,
  UserX,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import type { Broker } from '@/types/commissions';

const Corretores = () => {
  const { brokers, isLoading, createBroker, updateBroker, deleteBroker } = useBrokers();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingBroker, setEditingBroker] = useState<Broker | null>(null);
  const [deletingBroker, setDeletingBroker] = useState<Broker | null>(null);

  const filteredBrokers = brokers.filter(
    (broker) =>
      broker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      broker.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      broker.creci?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeBrokers = filteredBrokers.filter((b) => b.is_active);
  const inactiveBrokers = filteredBrokers.filter((b) => !b.is_active);

  const handleSubmit = (data: Partial<Broker>) => {
    if (editingBroker) {
      updateBroker.mutate({ id: editingBroker.id, ...data }, {
        onSuccess: () => {
          setEditingBroker(null);
          setShowForm(false);
        },
      });
    } else {
      createBroker.mutate(data as any, {
        onSuccess: () => setShowForm(false),
      });
    }
  };

  const handleDelete = () => {
    if (deletingBroker) {
      deleteBroker.mutate(deletingBroker.id, {
        onSuccess: () => setDeletingBroker(null),
      });
    }
  };

  const BrokerCard = ({ broker }: { broker: Broker }) => (
    <div
      className={cn(
        'bg-card rounded-2xl p-5 shadow-md border border-border hover:shadow-lg transition-all group animate-slide-in',
        !broker.is_active && 'opacity-60'
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold',
              broker.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
            )}
          >
            {broker.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{broker.name}</h3>
            {broker.creci && (
              <p className="text-sm text-muted-foreground">CRECI: {broker.creci}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={cn(
              'px-2 py-0.5 text-xs border',
              broker.is_active
                ? 'bg-success/10 text-success border-success/30'
                : 'bg-muted text-muted-foreground border-muted-foreground/30'
            )}
          >
            {broker.is_active ? (
              <>
                <UserCheck className="w-3 h-3 mr-1" />
                Ativo
              </>
            ) : (
              <>
                <UserX className="w-3 h-3 mr-1" />
                Inativo
              </>
            )}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setEditingBroker(broker);
                  setShowForm(true);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeletingBroker(broker)}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {broker.email && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4" />
            {broker.email}
          </div>
        )}
        {broker.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4" />
            {broker.phone}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Percent className="w-4 h-4 text-primary" />
          <span className="text-sm text-muted-foreground">Taxa de Comissão</span>
        </div>
        <span className="font-bold text-lg text-primary">{broker.commission_rate}%</span>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl md:text-3xl lg:text-4xl">Corretores</h1>
            <p className="text-muted-foreground mt-1">
              {brokers.length} corretores cadastrados
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingBroker(null);
              setShowForm(true);
            }}
            className="bg-gradient-primary text-primary-foreground shadow-glow"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Corretor
          </Button>
        </div>

        {/* Search */}
        <div className="bg-card rounded-2xl p-4 shadow-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou CRECI..."
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
        {!isLoading && brokers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Nenhum corretor cadastrado</h3>
            <p className="text-muted-foreground mb-4">
              Cadastre seus corretores para começar a gerenciar comissões.
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Primeiro Corretor
            </Button>
          </div>
        )}

        {/* Brokers Grid */}
        {!isLoading && filteredBrokers.length > 0 && (
          <div className="space-y-6">
            {activeBrokers.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
                  Corretores Ativos ({activeBrokers.length})
                </h2>
                <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {activeBrokers.map((broker) => (
                    <BrokerCard key={broker.id} broker={broker} />
                  ))}
                </div>
              </div>
            )}

            {inactiveBrokers.length > 0 && (
              <div>
                <h2 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wide">
                  Corretores Inativos ({inactiveBrokers.length})
                </h2>
                <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {inactiveBrokers.map((broker) => (
                    <BrokerCard key={broker.id} broker={broker} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <BrokerForm
        open={showForm}
        onOpenChange={setShowForm}
        broker={editingBroker}
        onSubmit={handleSubmit}
        isLoading={createBroker.isPending || updateBroker.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingBroker} onOpenChange={() => setDeletingBroker(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Corretor</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o corretor "{deletingBroker?.name}"?
              Esta ação não pode ser desfeita.
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

export default Corretores;
