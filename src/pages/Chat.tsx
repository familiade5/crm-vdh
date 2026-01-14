import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { mockLeads } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Search, Bot, MessageSquare, Star, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Chat = () => {
  const [selectedLead, setSelectedLead] = useState(mockLeads[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLeads = mockLeads.filter((lead) =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="h-[calc(100vh-2rem)] p-4 lg:p-6">
        <div className="h-full flex gap-6">
          {/* Conversations List */}
          <div className="w-80 flex-shrink-0 bg-card rounded-2xl shadow-md overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-xl">Conversas</h2>
                <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full">
                  <Bot className="w-3 h-3 text-primary" />
                  <span className="text-xs font-medium text-primary">IA Ativa</span>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar conversas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredLeads.map((lead) => (
                <button
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className={cn(
                    'w-full p-4 text-left transition-colors border-b border-border hover:bg-muted/50',
                    selectedLead.id === lead.id && 'bg-primary/5 border-l-4 border-l-primary'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                        {lead.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      {lead.aiQualified && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                          <Bot className="w-3 h-3 text-accent-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm truncate">{lead.name}</h4>
                        <span className="text-xs text-muted-foreground">
                          {format(lead.lastContact, "HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{lead.interest}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="w-3 h-3 text-accent fill-accent" />
                          {lead.score}
                        </div>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground capitalize">{lead.source}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Interface */}
          <div className="flex-1">
            <ChatInterface leadId={selectedLead.id} leadName={selectedLead.name} />
          </div>

          {/* Lead Details Sidebar */}
          <div className="w-80 flex-shrink-0 bg-card rounded-2xl shadow-md overflow-hidden">
            <div className="p-6 border-b border-border text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold text-2xl mb-4">
                {selectedLead.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <h3 className="font-display font-bold text-xl">{selectedLead.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedLead.email}</p>
              <p className="text-sm text-muted-foreground">{selectedLead.phone}</p>

              <div className="flex items-center justify-center gap-2 mt-4">
                {selectedLead.aiQualified && (
                  <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-xs font-medium flex items-center gap-1">
                    <Bot className="w-3 h-3" />
                    IA Qualificado
                  </span>
                )}
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium flex items-center gap-1">
                  <Star className="w-3 h-3 fill-primary" />
                  Score {selectedLead.score}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Interesse
                </h4>
                <p className="text-sm">{selectedLead.interest}</p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Orçamento
                </h4>
                <p className="text-sm font-medium text-primary">{selectedLead.budget}</p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Origem
                </h4>
                <p className="text-sm capitalize">{selectedLead.source}</p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Notas
                </h4>
                <p className="text-sm text-muted-foreground">{selectedLead.notes}</p>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Criado em {format(selectedLead.createdAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Chat;
