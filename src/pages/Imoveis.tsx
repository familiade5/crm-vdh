import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useProperties } from '@/hooks/useProperties';
import { PropertyForm } from '@/components/properties/PropertyForm';
import { PropertyDetailsDialog } from '@/components/properties/PropertyDetailsDialog';
import { cn } from '@/lib/utils';
import {
  Search,
  Plus,
  Filter,
  Grid3X3,
  List,
  Bed,
  Bath,
  Car,
  Maximize2,
  MapPin,
  Edit,
  Eye,
  Trash2,
  User,
  Loader2,
} from 'lucide-react';
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
import type { Property } from '@/types/properties';

const statusColors: Record<string, string> = {
  disponivel: 'bg-success/10 text-success border-success/30',
  reservado: 'bg-warning/10 text-warning border-warning/30',
  vendido: 'bg-primary/10 text-primary border-primary/30',
  alugado: 'bg-info/10 text-info border-info/30',
};

const statusLabels: Record<string, string> = {
  disponivel: 'Disponível',
  reservado: 'Reservado',
  vendido: 'Vendido',
  alugado: 'Alugado',
};

const propertyTypeLabels: Record<string, string> = {
  apartamento: 'Apartamento',
  casa: 'Casa',
  terreno: 'Terreno',
  comercial: 'Comercial',
  cobertura: 'Cobertura',
  sitio: 'Sítio/Chácara',
};

const Imoveis = () => {
  const { properties, isLoading, createProperty, updateProperty, deleteProperty } = useProperties();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Property | null>(null);

  const filteredProperties = properties.filter((property) => {
    const matchesSearch = 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (property.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (property.city?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesStatus = !statusFilter || property.status === statusFilter;
    const matchesType = !typeFilter || property.property_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleCreateProperty = (data: Partial<Property>) => {
    if (!data.title) return;
    createProperty.mutate(data as Parameters<typeof createProperty.mutate>[0], {
      onSuccess: () => setFormOpen(false),
    });
  };

  const handleUpdateProperty = (data: Partial<Property>) => {
    if (editingProperty) {
      updateProperty.mutate({ ...data, id: editingProperty.id }, {
        onSuccess: () => {
          setEditingProperty(null);
          setFormOpen(false);
        },
      });
    }
  };

  const handleDelete = () => {
    if (deleteConfirm) {
      deleteProperty.mutate(deleteConfirm.id, {
        onSuccess: () => setDeleteConfirm(null),
      });
    }
  };

  const openEdit = (property: Property) => {
    setEditingProperty(property);
    setFormOpen(true);
  };

  const openNew = () => {
    setEditingProperty(null);
    setFormOpen(true);
  };

  return (
    <MainLayout>
      <div className="p-4 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-2xl lg:text-4xl">Imóveis</h1>
            <p className="text-muted-foreground mt-1">
              {filteredProperties.length} imóveis cadastrados
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-muted rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  viewMode === 'grid' ? 'bg-card shadow-sm' : 'hover:bg-card/50'
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  viewMode === 'list' ? 'bg-card shadow-sm' : 'hover:bg-card/50'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <button 
              onClick={openNew}
              className="px-4 py-2.5 bg-gradient-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-glow"
            >
              <Plus className="w-4 h-4" />
              Novo Imóvel
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card rounded-2xl p-4 shadow-md">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por título, bairro ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              />
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2.5 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
              >
                <option value="">Todos os tipos</option>
                <option value="apartamento">Apartamento</option>
                <option value="casa">Casa</option>
                <option value="terreno">Terreno</option>
                <option value="comercial">Comercial</option>
                <option value="cobertura">Cobertura</option>
                <option value="sitio">Sítio/Chácara</option>
              </select>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium"
              >
                <option value="">Todos os status</option>
                <option value="disponivel">Disponível</option>
                <option value="reservado">Reservado</option>
                <option value="vendido">Vendido</option>
                <option value="alugado">Alugado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredProperties.length === 0 && (
          <div className="text-center py-12 bg-card rounded-2xl shadow-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Grid3X3 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Nenhum imóvel encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter || typeFilter 
                ? 'Tente ajustar os filtros de busca.' 
                : 'Comece cadastrando seu primeiro imóvel.'}
            </p>
            <button 
              onClick={openNew}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Cadastrar Imóvel
            </button>
          </div>
        )}

        {/* Properties Grid */}
        {!isLoading && filteredProperties.length > 0 && (
          <div
            className={cn(
              'grid gap-4 lg:gap-6',
              viewMode === 'grid'
                ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                : 'grid-cols-1'
            )}
          >
            {filteredProperties.map((property, index) => (
              <div
                key={property.id}
                className={cn(
                  'bg-card rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group animate-slide-in',
                  viewMode === 'list' && 'flex'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Image */}
                <div
                  className={cn(
                    'relative bg-gradient-primary/10',
                    viewMode === 'grid' ? 'h-48' : 'w-48 lg:w-64 flex-shrink-0'
                  )}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl opacity-50">🏠</div>
                  </div>
                  <div className="absolute top-3 left-3">
                    <span
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium border',
                        statusColors[property.status] || statusColors.disponivel
                      )}
                    >
                      {statusLabels[property.status] || property.status}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 rounded-lg text-xs font-medium bg-black/50 text-white">
                      {propertyTypeLabels[property.property_type] || property.property_type}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className={cn('p-4 lg:p-5', viewMode === 'list' && 'flex-1')}>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                        {property.title}
                      </h3>
                      {(property.neighborhood || property.city) && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">
                            {[property.neighborhood, property.city].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="font-display font-bold text-xl lg:text-2xl text-primary mb-4">
                    {formatPrice(property.price)}
                  </p>

                  <div className="flex items-center gap-3 lg:gap-4 text-sm text-muted-foreground mb-4 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Bed className="w-4 h-4" />
                      {property.bedrooms}
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="w-4 h-4" />
                      {property.bathrooms}
                    </div>
                    <div className="flex items-center gap-1">
                      <Car className="w-4 h-4" />
                      {property.parking_spaces}
                    </div>
                    <div className="flex items-center gap-1">
                      <Maximize2 className="w-4 h-4" />
                      {property.area}m²
                    </div>
                  </div>

                  {/* Broker */}
                  {property.broker && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 pb-4 border-b">
                      <User className="w-4 h-4" />
                      <span>Corretor: {property.broker.name}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setViewingProperty(property)}
                      className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Ver
                    </button>
                    <button 
                      onClick={() => openEdit(property)}
                      className="flex-1 px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    <button 
                      onClick={() => setDeleteConfirm(property)}
                      className="px-3 py-2 bg-destructive/10 text-destructive rounded-lg text-sm font-medium hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Property Form Dialog */}
      <PropertyForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingProperty(null);
        }}
        property={editingProperty}
        onSubmit={editingProperty ? handleUpdateProperty : handleCreateProperty}
        isLoading={createProperty.isPending || updateProperty.isPending}
      />

      {/* Property Details Dialog */}
      <PropertyDetailsDialog
        open={!!viewingProperty}
        onOpenChange={(open) => !open && setViewingProperty(null)}
        property={viewingProperty}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Imóvel</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o imóvel "{deleteConfirm?.title}"? 
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

export default Imoveis;
