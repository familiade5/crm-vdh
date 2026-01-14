import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { WhatsAppQRConnect } from '@/components/integrations/WhatsAppQRConnect';
import { usePortalIntegrations, useWhatsAppConnection } from '@/hooks/useIntegrations';
import { Zap, Globe, RefreshCw, Plus, Webhook, Key, Shield, MessageCircle, BarChart3, Share2, Loader2, Check, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const portalIcons: Record<string, string> = {
  facebook: '📘',
  instagram: '📷',
  google: '🔍',
  olx: '🏠',
  site: '🌐',
  analytics: '📊',
};

const Integracoes = () => {
  const { integrations, loading, toggleIntegration, updateIntegration } = usePortalIntegrations();
  const { connection: whatsappConnection } = useWhatsAppConnection();
  const [configuringId, setConfiguringId] = useState<string | null>(null);
  const [configForm, setConfigForm] = useState({ api_key: '', webhook_url: '' });

  const activeCount = integrations.filter((p) => p.is_active).length + (whatsappConnection?.status === 'connected' ? 1 : 0);
  const totalLeads = integrations.reduce((acc, p) => acc + p.leads_count, 0) + (whatsappConnection?.leads_captured || 0);

  const socialPortals = integrations.filter(p => p.category === 'social');
  const propertyPortals = integrations.filter(p => p.category === 'portal');
  const analyticsPortals = integrations.filter(p => p.category === 'analytics');

  const handleToggle = async (id: string) => {
    await toggleIntegration(id);
  };

  const handleOpenConfig = (integration: typeof integrations[0]) => {
    setConfiguringId(integration.id);
    setConfigForm({ api_key: integration.api_key || '', webhook_url: integration.webhook_url || '' });
  };

  const handleSaveConfig = async () => {
    if (!configuringId) return;
    await updateIntegration(configuringId, configForm);
    setConfiguringId(null);
  };

  const handleSyncAll = () => {
    toast.info('Sincronizando todas as integrações...');
    setTimeout(() => {
      toast.success('Todas as integrações sincronizadas!');
    }, 2000);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="font-display font-bold text-3xl lg:text-4xl">Integrações</h1>
            <p className="text-muted-foreground mt-1">
              Conecte seus canais de marketing e capture leads automaticamente
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSyncAll}
              className="px-4 py-2.5 bg-muted rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Sincronizar Todos
            </button>
            <button className="px-4 py-2.5 bg-gradient-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 shadow-glow">
              <Plus className="w-4 h-4" />
              Nova Integração
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-card rounded-2xl p-6 shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Canais Conectados</p>
                <p className="font-display font-bold text-2xl">{activeCount} de {integrations.length + 1}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Leads Capturados</p>
                <p className="font-display font-bold text-2xl">{totalLeads}</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 shadow-md">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status Webhooks</p>
                <p className="font-display font-bold text-2xl text-success">Todos Ativos</p>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Connection - Highlighted */}
        <WhatsAppQRConnect />

        {/* Social Media Integrations */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl">Redes Sociais & Ads</h2>
              <p className="text-sm text-muted-foreground">Facebook, Instagram e Google Ads</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {socialPortals.map((portal) => (
              <PortalCard 
                key={portal.id} 
                portal={portal} 
                onToggle={handleToggle}
                onConfigure={handleOpenConfig}
              />
            ))}
          </div>
        </div>

        {/* Property Portals */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl">Portais & Site</h2>
              <p className="text-sm text-muted-foreground">OLX e Site da Imobiliária</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {propertyPortals.map((portal) => (
              <PortalCard 
                key={portal.id} 
                portal={portal} 
                onToggle={handleToggle}
                onConfigure={handleOpenConfig}
              />
            ))}
          </div>
        </div>

        {/* Analytics */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl">Analytics</h2>
              <p className="text-sm text-muted-foreground">Métricas e comportamento dos visitantes</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticsPortals.map((portal) => (
              <PortalCard 
                key={portal.id} 
                portal={portal} 
                onToggle={handleToggle}
                onConfigure={handleOpenConfig}
              />
            ))}
          </div>
        </div>

        {/* Config Modal */}
        {configuringId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl">
              <h3 className="font-display font-bold text-xl mb-4">Configurar Integração</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">API Key</label>
                  <input
                    type="text"
                    value={configForm.api_key}
                    onChange={(e) => setConfigForm(prev => ({ ...prev, api_key: e.target.value }))}
                    placeholder="Sua chave de API"
                    className="w-full mt-1 px-4 py-2.5 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Webhook URL</label>
                  <input
                    type="url"
                    value={configForm.webhook_url}
                    onChange={(e) => setConfigForm(prev => ({ ...prev, webhook_url: e.target.value }))}
                    placeholder="https://..."
                    className="w-full mt-1 px-4 py-2.5 bg-muted rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setConfiguringId(null)}
                  className="flex-1 px-4 py-2.5 bg-muted rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveConfig}
                  className="flex-1 px-4 py-2.5 bg-gradient-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* API Config Card */}
        <div className="bg-gradient-dark rounded-2xl p-6 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center">
                <Webhook className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl">API & Webhooks</h3>
                <p className="text-white/70 text-sm">
                  Configure webhooks personalizados para receber leads em tempo real
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-white/10 rounded-xl">
                <p className="text-xs text-white/60">Sua API Key</p>
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-accent" />
                  <code className="text-sm font-mono">imb_sk_****7890</code>
                </div>
              </div>
              <button className="px-4 py-2.5 bg-white text-foreground rounded-xl text-sm font-medium hover:bg-white/90 transition-colors">
                Ver Documentação
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

interface PortalCardProps {
  portal: {
    id: string;
    portal_slug: string;
    portal_name: string;
    is_active: boolean;
    leads_count: number;
    last_sync: string | null;
  };
  onToggle: (id: string) => void;
  onConfigure: (portal: any) => void;
}

function PortalCard({ portal, onToggle, onConfigure }: PortalCardProps) {
  const icon = portalIcons[portal.portal_slug] || '📱';

  return (
    <div className={cn(
      'bg-card rounded-2xl p-5 shadow-md transition-all',
      portal.is_active && 'ring-2 ring-primary/30'
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
            {icon}
          </div>
          <div>
            <h4 className="font-semibold">{portal.portal_name}</h4>
            <p className="text-sm text-muted-foreground">{portal.leads_count} leads</p>
          </div>
        </div>
        <button
          onClick={() => onToggle(portal.id)}
          className={cn(
            "w-12 h-7 rounded-full relative transition-colors",
            portal.is_active ? "bg-primary" : "bg-muted"
          )}
        >
          <div className={cn(
            "absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all",
            portal.is_active ? "right-1" : "left-1"
          )} />
        </button>
      </div>

      {portal.is_active && (
        <div className="pt-4 border-t border-border space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 text-success" />
            <span className="text-muted-foreground">
              {portal.last_sync 
                ? `Sincronizado ${formatDistanceToNow(new Date(portal.last_sync), { locale: ptBR, addSuffix: true })}`
                : 'Nunca sincronizado'
              }
            </span>
          </div>
          <button
            onClick={() => onConfigure(portal)}
            className="w-full py-2 px-3 bg-muted rounded-lg text-sm font-medium hover:bg-muted/80 transition-colors flex items-center justify-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Configurar
          </button>
        </div>
      )}
    </div>
  );
}

export default Integracoes;
