import { MainLayout } from '@/components/layout/MainLayout';
import { Calendar, Clock, MapPin, User, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface Event {
  id: string;
  title: string;
  type: 'visita' | 'reuniao' | 'ligacao' | 'assinatura';
  time: string;
  duration: string;
  location?: string;
  client: string;
  property?: string;
}

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Visita ao Apartamento',
    type: 'visita',
    time: '09:00',
    duration: '1h',
    location: 'Rua dos Pinheiros, 1500',
    client: 'João Silva',
    property: 'Apartamento 3 quartos',
  },
  {
    id: '2',
    title: 'Reunião de Negociação',
    type: 'reuniao',
    time: '11:00',
    duration: '1h30',
    location: 'Escritório',
    client: 'Maria Santos',
    property: 'Casa em Alphaville',
  },
  {
    id: '3',
    title: 'Ligação de Follow-up',
    type: 'ligacao',
    time: '14:00',
    duration: '30min',
    client: 'Carlos Oliveira',
  },
  {
    id: '4',
    title: 'Assinatura de Contrato',
    type: 'assinatura',
    time: '16:00',
    duration: '1h',
    location: 'Cartório Centro',
    client: 'Luciana Mendes',
    property: 'Apartamento 2 quartos',
  },
];

const eventColors = {
  visita: 'bg-primary/10 text-primary border-primary/30',
  reuniao: 'bg-accent/10 text-accent border-accent/30',
  ligacao: 'bg-info/10 text-info border-info/30',
  assinatura: 'bg-success/10 text-success border-success/30',
};

const eventLabels = {
  visita: 'Visita',
  reuniao: 'Reunião',
  ligacao: 'Ligação',
  assinatura: 'Assinatura',
};

const Agenda = () => {
  const [selectedDate] = useState(new Date());
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const days = getDaysInMonth(selectedDate);
  const today = new Date().getDate();

  return (
    <MainLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl lg:text-4xl">Agenda</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie suas visitas, reuniões e compromissos
            </p>
          </div>
          <button className="px-4 py-2.5 bg-gradient-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-glow">
            <Plus className="w-4 h-4" />
            Novo Evento
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="bg-card rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-lg">
                {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </h2>
              <div className="flex items-center gap-1">
                <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, index) => (
                <button
                  key={index}
                  className={cn(
                    'aspect-square rounded-lg flex items-center justify-center text-sm transition-colors',
                    day === null && 'invisible',
                    day === today && 'bg-primary text-primary-foreground font-bold',
                    day !== today && day && 'hover:bg-muted'
                  )}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-6 border-t border-border space-y-2">
              {Object.entries(eventLabels).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={cn('w-3 h-3 rounded-full', eventColors[key as keyof typeof eventColors].split(' ')[0])} />
                  <span className="text-sm text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Events */}
          <div className="lg:col-span-2 bg-card rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display font-bold text-xl">Hoje</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">{mockEvents.length} eventos</span>
              </div>
            </div>

            <div className="space-y-4">
              {mockEvents.map((event, index) => (
                <div
                  key={event.id}
                  className={cn(
                    'p-4 rounded-xl border-l-4 bg-gradient-card hover:shadow-md transition-all duration-200 cursor-pointer animate-slide-in',
                    eventColors[event.type]
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', eventColors[event.type])}>
                          {eventLabels[event.type]}
                        </span>
                        <span className="text-sm font-bold">{event.time}</span>
                        <span className="text-xs text-muted-foreground">({event.duration})</span>
                      </div>
                      <h3 className="font-semibold mb-1">{event.title}</h3>
                      {event.property && (
                        <p className="text-sm text-muted-foreground">{event.property}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      {event.client}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Agenda;
