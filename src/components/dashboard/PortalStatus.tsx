import { Portal } from '@/types';
import { cn } from '@/lib/utils';
import { Check, X, RefreshCw, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PortalStatusProps {
  portals: Portal[];
}

export function PortalStatus({ portals }: PortalStatusProps) {
  const activePortals = portals.filter((p) => p.isActive);
  const totalLeads = portals.reduce((acc, p) => acc + p.leadsCount, 0);

  return (
    <div className="bg-card rounded-2xl p-6 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-bold text-xl">Integrações Ativas</h3>
          <p className="text-sm text-muted-foreground">
            {activePortals.length} portais conectados • {totalLeads} leads capturados
          </p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Sincronizar
        </button>
      </div>

      <div className="space-y-3">
        {portals.map((portal) => (
          <div
            key={portal.id}
            className={cn(
              'flex items-center justify-between p-4 rounded-xl border transition-all duration-200',
              portal.isActive
                ? 'bg-gradient-card border-primary/20 hover:border-primary/40'
                : 'bg-muted/50 border-border'
            )}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl">
                {portal.icon}
              </div>
              <div>
                <h4 className="font-semibold">{portal.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {portal.leadsCount} leads capturados
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {portal.lastSync && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Última sinc.</p>
                  <p className="text-sm font-medium">
                    {format(portal.lastSync, "HH:mm", { locale: ptBR })}
                  </p>
                </div>
              )}

              <div
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
                  portal.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                )}
              >
                {portal.isActive ? (
                  <>
                    <Check className="w-4 h-4" />
                    Ativo
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    Inativo
                  </>
                )}
              </div>

              <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
