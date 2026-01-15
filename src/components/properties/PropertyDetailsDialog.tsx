import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePropertyInterestedLeads } from '@/hooks/useProperties';
import { useLeads } from '@/hooks/useLeads';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Car, 
  Maximize2, 
  User, 
  Phone, 
  Mail,
  Trash2,
  Plus,
  Flame,
  Snowflake,
  ThermometerSun
} from 'lucide-react';
import type { Property } from '@/types/properties';
import { cn } from '@/lib/utils';

interface PropertyDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: Property | null;
}

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

const temperatureConfig: Record<string, { icon: any; color: string; label: string }> = {
  quente: { icon: Flame, color: 'text-red-500', label: 'Quente' },
  morno: { icon: ThermometerSun, color: 'text-orange-500', label: 'Morno' },
  frio: { icon: Snowflake, color: 'text-blue-500', label: 'Frio' },
};

export function PropertyDetailsDialog({ open, onOpenChange, property }: PropertyDetailsDialogProps) {
  const [selectedLeadId, setSelectedLeadId] = useState('');
  const [interestLevel, setInterestLevel] = useState('medio');
  
  const { interestedLeads, isLoading: loadingInterested, addInterestedLead, removeInterestedLead } = usePropertyInterestedLeads(property?.id);
  const { leads } = useLeads();

  if (!property) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const availableLeads = leads.filter(
    lead => !interestedLeads.some(il => il.lead_id === lead.id)
  );

  const handleAddLead = () => {
    if (selectedLeadId && property) {
      addInterestedLead.mutate({
        property_id: property.id,
        lead_id: selectedLeadId,
        interest_level: interestLevel,
      });
      setSelectedLeadId('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {property.title}
            <Badge variant="outline" className={cn('ml-2', statusColors[property.status])}>
              {statusLabels[property.status] || property.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="interested">
              Interessados ({interestedLeads.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6 mt-4">
            {/* Price */}
            <div className="text-center py-4 bg-primary/5 rounded-xl">
              <p className="text-sm text-muted-foreground">Valor</p>
              <p className="text-3xl font-bold text-primary">{formatPrice(property.price)}</p>
            </div>

            {/* Characteristics */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded-xl">
                <Bed className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                <p className="font-semibold">{property.bedrooms}</p>
                <p className="text-xs text-muted-foreground">Quartos</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-xl">
                <Bath className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                <p className="font-semibold">{property.bathrooms}</p>
                <p className="text-xs text-muted-foreground">Banheiros</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-xl">
                <Car className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                <p className="font-semibold">{property.parking_spaces}</p>
                <p className="text-xs text-muted-foreground">Vagas</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-xl">
                <Maximize2 className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                <p className="font-semibold">{property.area}</p>
                <p className="text-xs text-muted-foreground">m²</p>
              </div>
            </div>

            {/* Location */}
            {(property.address || property.neighborhood || property.city) && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground">Localização</h4>
                <div className="flex items-start gap-2 p-3 bg-muted rounded-xl">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    {property.address && <p>{property.address}</p>}
                    <p className="text-muted-foreground">
                      {[property.neighborhood, property.city, property.state]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                    {property.zip_code && (
                      <p className="text-sm text-muted-foreground">CEP: {property.zip_code}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            {property.description && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground">Descrição</h4>
                <p className="text-sm leading-relaxed">{property.description}</p>
              </div>
            )}

            {/* Broker */}
            {property.broker && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground">Corretor Responsável</h4>
                <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{property.broker.name}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {property.broker.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {property.broker.phone}
                        </span>
                      )}
                      {property.broker.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {property.broker.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="interested" className="space-y-4 mt-4">
            {/* Add Lead */}
            <div className="flex gap-2 p-4 bg-muted rounded-xl">
              <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione um lead" />
                </SelectTrigger>
                <SelectContent>
                  {availableLeads.length === 0 ? (
                    <SelectItem value="" disabled>Nenhum lead disponível</SelectItem>
                  ) : (
                    availableLeads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.name} {lead.phone && `- ${lead.phone}`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              
              <Select value={interestLevel} onValueChange={setInterestLevel}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixo">Baixo</SelectItem>
                  <SelectItem value="medio">Médio</SelectItem>
                  <SelectItem value="alto">Alto</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                onClick={handleAddLead} 
                disabled={!selectedLeadId || addInterestedLead.isPending}
                size="icon"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Interested Leads List */}
            {loadingInterested ? (
              <p className="text-center text-muted-foreground py-8">Carregando...</p>
            ) : interestedLeads.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum lead interessado neste imóvel.
              </p>
            ) : (
              <div className="space-y-2">
                {interestedLeads.map((item) => {
                  const temp = item.lead?.temperature || 'frio';
                  const tempConfig = temperatureConfig[temp] || temperatureConfig.frio;
                  const TempIcon = tempConfig.icon;

                  return (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-card border rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{item.lead?.name}</p>
                          <TempIcon className={cn('w-4 h-4', tempConfig.color)} />
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {item.lead?.phone && <span>{item.lead.phone}</span>}
                          <Badge variant="outline" className="text-xs">
                            Interesse: {item.interest_level}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeInterestedLead.mutate(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
