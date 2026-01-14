import { Lead, LeadStatus } from '@/types';
import { cn } from '@/lib/utils';
import { Phone, Mail, MessageSquare, Star, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LeadsPipelineProps {
  leads: Lead[];
}

const statusConfig: Record<LeadStatus, { label: string; color: string; bgColor: string }> = {
  novo: { label: 'Novos', color: 'text-info', bgColor: 'bg-info/10 border-info/30' },
  contato: { label: 'Em Contato', color: 'text-warning', bgColor: 'bg-warning/10 border-warning/30' },
  qualificado: { label: 'Qualificados', color: 'text-primary', bgColor: 'bg-primary/10 border-primary/30' },
  visita: { label: 'Visita Agendada', color: 'text-purple-500', bgColor: 'bg-purple-500/10 border-purple-500/30' },
  proposta: { label: 'Proposta', color: 'text-accent', bgColor: 'bg-accent/10 border-accent/30' },
  fechado: { label: 'Fechados', color: 'text-success', bgColor: 'bg-success/10 border-success/30' },
  perdido: { label: 'Perdidos', color: 'text-destructive', bgColor: 'bg-destructive/10 border-destructive/30' },
};

const sourceIcons: Record<string, string> = {
  zap: '🏠',
  olx: '📦',
  vivareal: '🏡',
  imovelweb: '🌐',
  whatsapp: '💬',
  instagram: '📸',
  facebook: '👥',
  indicacao: '🤝',
  site: '🖥️',
  outro: '📋',
};

function LeadCard({ lead }: { lead: Lead }) {
  return (
    <div className="bg-card rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group border border-border hover:border-primary/30">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{sourceIcons[lead.source]}</span>
          <div>
            <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{lead.name}</h4>
            <p className="text-xs text-muted-foreground">{lead.source.toUpperCase()}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent/10">
          <Star className="w-3 h-3 text-accent fill-accent" />
          <span className="text-xs font-medium text-accent">{lead.score}</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{lead.interest}</p>

      <div className="flex items-center gap-2 mb-3">
        {lead.aiQualified && (
          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
            IA Qualificado
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {format(lead.lastContact, "dd MMM, HH:mm", { locale: ptBR })}
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
            <Phone className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
            <Mail className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors">
            <MessageSquare className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function LeadsPipeline({ leads }: LeadsPipelineProps) {
  const columns: LeadStatus[] = ['novo', 'contato', 'qualificado', 'visita', 'proposta', 'fechado'];

  return (
    <div className="bg-card rounded-2xl p-6 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-bold text-xl">Pipeline de Leads</h3>
          <p className="text-sm text-muted-foreground">Arraste os cards para mover entre estágios</p>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-4 overflow-x-auto pb-4">
        {columns.map((status) => {
          const config = statusConfig[status];
          const columnLeads = leads.filter((l) => l.status === status);

          return (
            <div key={status} className="min-w-[220px]">
              <div
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-lg mb-3 border',
                  config.bgColor
                )}
              >
                <span className={cn('font-medium text-sm', config.color)}>{config.label}</span>
                <span
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                    config.color,
                    'bg-white/80'
                  )}
                >
                  {columnLeads.length}
                </span>
              </div>

              <div className="space-y-3 min-h-[300px]">
                {columnLeads.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
