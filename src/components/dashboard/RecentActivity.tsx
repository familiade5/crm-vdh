import { MessageSquare, Phone, Calendar, CheckCircle, UserPlus, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'message' | 'call' | 'visit' | 'closed' | 'new_lead' | 'ai_qualified';
  title: string;
  description: string;
  time: string;
}

const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'ai_qualified',
    title: 'IA qualificou lead',
    description: 'João Silva foi pré-qualificado automaticamente',
    time: '2 min atrás',
  },
  {
    id: '2',
    type: 'new_lead',
    title: 'Novo lead do ZAP Imóveis',
    description: 'Maria Santos interessada em casa em condomínio',
    time: '15 min atrás',
  },
  {
    id: '3',
    type: 'message',
    title: 'Mensagem no WhatsApp',
    description: 'Carlos respondeu sobre visita ao imóvel',
    time: '32 min atrás',
  },
  {
    id: '4',
    type: 'visit',
    title: 'Visita agendada',
    description: 'Ana Ferreira - Apartamento em Pinheiros',
    time: '1 hora atrás',
  },
  {
    id: '5',
    type: 'closed',
    title: 'Negócio fechado! 🎉',
    description: 'Luciana Mendes - R$ 750.000',
    time: '3 horas atrás',
  },
  {
    id: '6',
    type: 'call',
    title: 'Ligação realizada',
    description: 'Pedro Costa - Follow-up sobre cobertura',
    time: '4 horas atrás',
  },
];

const activityIcons = {
  message: MessageSquare,
  call: Phone,
  visit: Calendar,
  closed: CheckCircle,
  new_lead: UserPlus,
  ai_qualified: Bot,
};

const activityColors = {
  message: 'bg-info/10 text-info',
  call: 'bg-warning/10 text-warning',
  visit: 'bg-purple-500/10 text-purple-500',
  closed: 'bg-success/10 text-success',
  new_lead: 'bg-primary/10 text-primary',
  ai_qualified: 'bg-accent/10 text-accent',
};

export function RecentActivity() {
  return (
    <div className="bg-card rounded-2xl p-6 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-bold text-xl">Atividade Recente</h3>
        <button className="text-sm text-primary font-medium hover:underline">Ver tudo</button>
      </div>

      <div className="space-y-4">
        {mockActivities.map((activity, index) => {
          const Icon = activityIcons[activity.type];
          return (
            <div
              key={activity.id}
              className={cn(
                'flex items-start gap-4 animate-slide-in',
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                  activityColors[activity.type]
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{activity.title}</p>
                <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
