import { Portal } from '@/types';
import { cn } from '@/lib/utils';
import { Check, X, Settings, RefreshCw, Link2, Unlink } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';

interface PortalCardProps {
  portal: Portal;
  onToggle: (id: string) => void;
}

export function PortalCard({ portal, onToggle }: PortalCardProps) {
  const [isConfiguring, setIsConfiguring] = useState(false);

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 transition-all duration-300 border-2',
        portal.isActive
          ? 'bg-gradient-card border-primary/30 shadow-lg'
          : 'bg-card border-border hover:border-muted-foreground/30'
      )}
    >
      {/* Active indicator */}
      {portal.isActive && (
        <div className="absolute top-0 right-0 w-32 h-32 -translate-y-1/2 translate-x-1/2">
          <div className="w-full h-full bg-primary/10 rounded-full blur-3xl" />
        </div>
      )}

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all duration-300',
                portal.isActive
                  ? 'bg-white shadow-lg'
                  : 'bg-muted'
              )}
            >
              {portal.icon}
            </div>
            <div>
              <h3 className="font-display font-bold text-lg">{portal.name}</h3>
              <p className="text-sm text-muted-foreground">
                {portal.leadsCount} leads capturados
              </p>
            </div>
          </div>

          <button
            onClick={() => onToggle(portal.id)}
            className={cn(
              'relative w-14 h-8 rounded-full transition-all duration-300',
              portal.isActive ? 'bg-primary' : 'bg-muted'
            )}
          >
            <div
              className={cn(
                'absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 flex items-center justify-center',
                portal.isActive ? 'left-7' : 'left-1'
              )}
            >
              {portal.isActive ? (
                <Check className="w-3 h-3 text-primary" />
              ) : (
                <X className="w-3 h-3 text-muted-foreground" />
              )}
            </div>
          </button>
        </div>

        {portal.isActive && (
          <div className="space-y-4 animate-slide-in">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
              <div>
                <p className="text-xs text-muted-foreground">Última sincronização</p>
                <p className="font-medium text-sm">
                  {portal.lastSync
                    ? format(portal.lastSync, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                    : 'Nunca sincronizado'}
                </p>
              </div>
              <button className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsConfiguring(!isConfiguring)}
                className="flex-1 px-4 py-2.5 bg-muted rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Configurar
              </button>
              <button className="flex-1 px-4 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-medium hover:bg-primary/20 transition-colors flex items-center justify-center gap-2">
                <Link2 className="w-4 h-4" />
                Webhook
              </button>
            </div>

            {isConfiguring && (
              <div className="space-y-3 p-4 bg-muted/30 rounded-xl animate-scale-in">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">API Key</label>
                  <input
                    type="password"
                    placeholder="••••••••••••••••"
                    className="w-full mt-1 px-3 py-2 bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Webhook URL</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={`https://api.imobicrm.com/webhook/${portal.slug}`}
                      readOnly
                      className="flex-1 px-3 py-2 bg-background rounded-lg border border-border text-sm text-muted-foreground"
                    />
                    <button className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
                      <Link2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button className="w-full px-4 py-2.5 bg-gradient-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                  Salvar Configurações
                </button>
              </div>
            )}
          </div>
        )}

        {!portal.isActive && (
          <div className="mt-4 p-3 bg-muted/30 rounded-xl">
            <p className="text-sm text-muted-foreground text-center">
              Ative para começar a receber leads deste portal
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
