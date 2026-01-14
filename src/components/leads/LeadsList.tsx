import { useState } from 'react';
import { Lead, LeadTemperature } from '@/types';
import { cn } from '@/lib/utils';
import {
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  MessageSquare,
  Star,
  MoreVertical,
  ChevronDown,
  Bot,
  Flame,
  Snowflake,
  ThermometerSun,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LeadsListProps {
  leads: Lead[];
}

const statusColors = {
  novo: 'bg-info/10 text-info border-info/30',
  contato: 'bg-warning/10 text-warning border-warning/30',
  qualificado: 'bg-primary/10 text-primary border-primary/30',
  visita: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
  proposta: 'bg-accent/10 text-accent border-accent/30',
  fechado: 'bg-success/10 text-success border-success/30',
  perdido: 'bg-destructive/10 text-destructive border-destructive/30',
};

const statusLabels = {
  novo: 'Novo',
  contato: 'Em Contato',
  qualificado: 'Qualificado',
  visita: 'Visita Agendada',
  proposta: 'Proposta',
  fechado: 'Fechado',
  perdido: 'Perdido',
};

const temperatureConfig = {
  quente: { label: 'Quente', icon: Flame, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  morno: { label: 'Morno', icon: ThermometerSun, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  frio: { label: 'Frio', icon: Snowflake, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
};

const sourceConfig: Record<string, { icon: string; label: string; color: string }> = {
  facebook: { icon: '📘', label: 'Facebook', color: 'bg-blue-600' },
  instagram: { icon: '📸', label: 'Instagram', color: 'bg-gradient-to-br from-purple-500 to-pink-500' },
  google: { icon: '🔍', label: 'Google', color: 'bg-green-500' },
  olx: { icon: '📦', label: 'OLX', color: 'bg-orange-500' },
  site: { icon: '🏠', label: 'Site', color: 'bg-primary' },
  whatsapp: { icon: '💬', label: 'WhatsApp', color: 'bg-green-600' },
  indicacao: { icon: '🤝', label: 'Indicação', color: 'bg-purple-500' },
  outro: { icon: '📋', label: 'Outro', color: 'bg-gray-500' },
};

export function LeadsList({ leads }: LeadsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [selectedTemperature, setSelectedTemperature] = useState<string>('todos');

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm);
    const matchesStatus = selectedStatus === 'todos' || lead.status === selectedStatus;
    const matchesTemperature = selectedTemperature === 'todos' || lead.temperature === selectedTemperature;
    return matchesSearch && matchesStatus && matchesTemperature;
  });

  // Contadores por temperatura
  const temperatureCounts = {
    quente: leads.filter(l => l.temperature === 'quente').length,
    morno: leads.filter(l => l.temperature === 'morno').length,
    frio: leads.filter(l => l.temperature === 'frio').length,
  };

  return (
    <div className="space-y-6">
      {/* Temperature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(Object.entries(temperatureConfig) as [LeadTemperature, typeof temperatureConfig.quente][]).map(([temp, config]) => {
          const Icon = config.icon;
          const count = temperatureCounts[temp];
          const isSelected = selectedTemperature === temp;
          
          return (
            <button
              key={temp}
              onClick={() => setSelectedTemperature(isSelected ? 'todos' : temp)}
              className={cn(
                'p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-[1.02]',
                isSelected 
                  ? `${config.bg} ${config.border}` 
                  : 'bg-card border-border hover:border-muted-foreground/30'
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', config.bg)}>
                    <Icon className={cn('w-6 h-6', config.color)} />
                  </div>
                  <div className="text-left">
                    <p className={cn('font-display font-bold text-3xl', config.color)}>{count}</p>
                    <p className="text-sm text-muted-foreground">Leads {config.label}s</p>
                  </div>
                </div>
                {isSelected && (
                  <div className={cn('w-3 h-3 rounded-full', config.color.replace('text-', 'bg-'))} />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main List Card */}
      <div className="bg-card rounded-2xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="font-display font-bold text-2xl">Leads</h2>
              <p className="text-muted-foreground">
                {filteredLeads.length} leads encontrados
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por nome, email ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>

              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="appearance-none px-4 py-2.5 pr-10 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-medium cursor-pointer"
                >
                  <option value="todos">Todos os status</option>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>

              <button className="px-4 py-2.5 bg-gradient-primary text-primary-foreground rounded-xl font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2 shadow-glow">
                <Plus className="w-4 h-4" />
                Novo Lead
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Lead
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Temperatura
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Origem
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Score
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Atendimento
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead, index) => {
                const tempConfig = temperatureConfig[lead.temperature];
                const TempIcon = tempConfig.icon;
                const srcConfig = sourceConfig[lead.source];

                return (
                  <tr
                    key={lead.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors animate-slide-in"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                          {lead.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {lead.name}
                            {lead.aiQualified && (
                              <span className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center" title="Qualificado por IA">
                                <Bot className="w-3 h-3 text-accent" />
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">{lead.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border',
                        tempConfig.bg, tempConfig.color, tempConfig.border
                      )}>
                        <TempIcon className="w-3.5 h-3.5" />
                        {tempConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{srcConfig.icon}</span>
                        <span className="text-sm font-medium">{srcConfig.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border',
                          statusColors[lead.status]
                        )}
                      >
                        {statusLabels[lead.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-accent fill-accent" />
                        <span className="font-semibold">{lead.score}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium',
                        lead.aiActive ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'
                      )}>
                        {lead.aiActive ? (
                          <>
                            <Bot className="w-3 h-3" />
                            IA
                          </>
                        ) : (
                          <>
                            <MessageSquare className="w-3 h-3" />
                            Humano
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                          <Phone className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                          <Mail className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                          <MoreVertical className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
