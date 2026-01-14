import { MainLayout } from '@/components/layout/MainLayout';
import { mockProperties } from '@/data/mockData';
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
  MoreVertical,
  Edit,
  Eye,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

const statusColors = {
  disponivel: 'bg-success/10 text-success border-success/30',
  reservado: 'bg-warning/10 text-warning border-warning/30',
  vendido: 'bg-primary/10 text-primary border-primary/30',
  alugado: 'bg-info/10 text-info border-info/30',
};

const statusLabels = {
  disponivel: 'Disponível',
  reservado: 'Reservado',
  vendido: 'Vendido',
  alugado: 'Alugado',
};

const Imoveis = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProperties = mockProperties.filter(
    (property) =>
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <MainLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl lg:text-4xl">Imóveis</h1>
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
            <button className="px-4 py-2.5 bg-gradient-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-glow">
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
            <div className="flex items-center gap-3">
              <select className="px-4 py-2.5 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium">
                <option>Todos os tipos</option>
                <option>Apartamento</option>
                <option>Casa</option>
                <option>Terreno</option>
                <option>Comercial</option>
              </select>
              <select className="px-4 py-2.5 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium">
                <option>Todos os status</option>
                <option>Disponível</option>
                <option>Reservado</option>
                <option>Vendido</option>
              </select>
              <button className="px-4 py-2.5 bg-muted rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Mais filtros
              </button>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        <div
          className={cn(
            'grid gap-6',
            viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
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
                  viewMode === 'grid' ? 'h-48' : 'w-64 flex-shrink-0'
                )}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl opacity-50">🏠</div>
                </div>
                <div className="absolute top-3 left-3">
                  <span
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium border',
                      statusColors[property.status]
                    )}
                  >
                    {statusLabels[property.status]}
                  </span>
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 bg-white/90 rounded-lg shadow-md hover:bg-white transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className={cn('p-5', viewMode === 'list' && 'flex-1')}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-1">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-4 h-4" />
                      {property.neighborhood}, {property.city}
                    </div>
                  </div>
                </div>

                <p className="font-display font-bold text-2xl text-primary mb-4">
                  {formatPrice(property.price)}
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
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
                    {property.parkingSpaces}
                  </div>
                  <div className="flex items-center gap-1">
                    <Maximize2 className="w-4 h-4" />
                    {property.area}m²
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-border">
                  <button className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    Ver
                  </button>
                  <button className="flex-1 px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors flex items-center justify-center gap-2">
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Imoveis;
