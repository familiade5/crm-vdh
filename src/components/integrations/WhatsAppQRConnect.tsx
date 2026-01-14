import { useState, useEffect } from 'react';
import { QrCode, Check, Smartphone, RefreshCw, Wifi, WifiOff, MessageCircle, Clock, AlertTriangle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWhatsAppConnection } from '@/hooks/useIntegrations';

export function WhatsAppQRConnect() {
  const { connection, loading, startScanning, connect, disconnect } = useWhatsAppConnection();
  const [countdown, setCountdown] = useState(60);
  const [localStatus, setLocalStatus] = useState<'disconnected' | 'scanning' | 'connected'>('disconnected');
  const [showApiInfo, setShowApiInfo] = useState(false);

  useEffect(() => {
    if (connection) {
      setLocalStatus(connection.status as 'disconnected' | 'scanning' | 'connected');
    }
  }, [connection]);

  const handleGenerateQR = async () => {
    setLocalStatus('scanning');
    setCountdown(60);
    await startScanning();
  };

  const handleSimulateConnect = async () => {
    setLocalStatus('connected');
    await connect('+55 11 99999-0000');
  };

  const handleDisconnect = async () => {
    setLocalStatus('disconnected');
    await disconnect();
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (localStatus === 'scanning' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    if (countdown === 0 && localStatus === 'scanning') {
      setLocalStatus('disconnected');
    }
    return () => clearInterval(timer);
  }, [localStatus, countdown]);

  // Auto-connect simulation after 5 seconds for demo
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (localStatus === 'scanning') {
      timer = setTimeout(() => {
        handleSimulateConnect();
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [localStatus]);

  if (loading) {
    return (
      <div className="bg-card rounded-2xl shadow-md p-8 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl shadow-md overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-border bg-gradient-to-r from-green-600/10 to-green-500/5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-lg sm:text-xl">WhatsApp Business</h3>
            <p className="text-sm text-muted-foreground">
              Conecte seu número para receber e responder mensagens
            </p>
          </div>
          <div className={cn(
            'flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-sm font-medium self-start sm:self-center',
            localStatus === 'connected' 
              ? 'bg-success/10 text-success' 
              : localStatus === 'scanning'
              ? 'bg-warning/10 text-warning'
              : 'bg-muted text-muted-foreground'
          )}>
            {localStatus === 'connected' ? (
              <>
                <Wifi className="w-4 h-4" />
                <span className="hidden sm:inline">Conectado</span>
              </>
            ) : localStatus === 'scanning' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Aguardando...</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                <span className="hidden sm:inline">Desconectado</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {/* API Info Banner */}
        <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm">Integração via WhatsApp Cloud API</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Para uso em produção, recomendamos usar a API oficial da Meta. 
                A conexão por QR Code é apenas para demonstração.
              </p>
              <button
                onClick={() => setShowApiInfo(!showApiInfo)}
                className="text-xs text-primary hover:underline mt-2 flex items-center gap-1"
              >
                {showApiInfo ? 'Ocultar detalhes' : 'Ver como configurar'}
                <ExternalLink className="w-3 h-3" />
              </button>
              
              {showApiInfo && (
                <div className="mt-3 p-3 bg-card rounded-lg text-xs space-y-2">
                  <p className="font-medium">Passos para usar a API oficial:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Crie uma conta no Meta Business Suite</li>
                    <li>Adicione o app WhatsApp Business</li>
                    <li>Configure um número de telefone verificado</li>
                    <li>Copie o Access Token e Phone Number ID</li>
                    <li>Configure o Webhook para receber mensagens</li>
                  </ol>
                  <a 
                    href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    Documentação oficial
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {localStatus === 'disconnected' && (
          <div className="text-center py-6 sm:py-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-2xl bg-muted flex items-center justify-center">
              <Smartphone className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" />
            </div>
            <h4 className="font-display font-bold text-base sm:text-lg mb-2">
              Conecte seu WhatsApp Business
            </h4>
            <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto px-4">
              Escaneie o QR Code com seu celular para conectar o WhatsApp Business e começar a receber mensagens automaticamente.
            </p>
            <button
              onClick={handleGenerateQR}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto text-sm sm:text-base"
            >
              <QrCode className="w-4 h-4 sm:w-5 sm:h-5" />
              Gerar QR Code (Demo)
            </button>
          </div>
        )}

        {localStatus === 'scanning' && (
          <div className="text-center py-4">
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 mx-auto mb-4 sm:mb-6 bg-white rounded-2xl p-3 sm:p-4 shadow-lg">
              {/* Simulated QR Code */}
              <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg relative overflow-hidden">
                <div className="absolute inset-3 sm:inset-4 grid grid-cols-8 grid-rows-8 gap-0.5 sm:gap-1">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'rounded-sm',
                        Math.random() > 0.5 ? 'bg-white' : 'bg-transparent'
                      )}
                    />
                  ))}
                </div>
                {/* Corner markers */}
                <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 w-8 h-8 sm:w-10 sm:h-10 border-3 sm:border-4 border-white rounded-md" />
                <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-8 h-8 sm:w-10 sm:h-10 border-3 sm:border-4 border-white rounded-md" />
                <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 w-8 h-8 sm:w-10 sm:h-10 border-3 sm:border-4 border-white rounded-md" />
              </div>
              
              {/* Scanning animation */}
              <div className="absolute inset-3 sm:inset-4 overflow-hidden rounded-lg">
                <div className="absolute inset-x-0 h-1 bg-green-500 animate-pulse shadow-lg shadow-green-500/50" 
                     style={{ 
                       animation: 'scan 2s ease-in-out infinite',
                       top: `${((60 - countdown) % 20) * 5}%`
                     }} 
                />
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <Clock className="w-4 h-4" />
              <span>Expira em {countdown}s</span>
            </div>

            <div className="bg-muted/50 rounded-xl p-3 sm:p-4 max-w-md mx-auto">
              <h5 className="font-semibold mb-2 text-sm sm:text-base">Como conectar:</h5>
              <ol className="text-xs sm:text-sm text-muted-foreground text-left space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  Abra o WhatsApp Business no seu celular
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  Vá em Configurações → Aparelhos conectados
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  Toque em "Conectar um aparelho" e escaneie
                </li>
              </ol>
            </div>

            <button
              onClick={() => setLocalStatus('disconnected')}
              className="mt-4 px-4 py-2 text-muted-foreground hover:text-foreground text-sm"
            >
              Cancelar
            </button>
          </div>
        )}

        {localStatus === 'connected' && (
          <div className="text-center py-6 sm:py-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-success/10 flex items-center justify-center">
              <Check className="w-8 h-8 sm:w-10 sm:h-10 text-success" />
            </div>
            <h4 className="font-display font-bold text-base sm:text-lg mb-2 text-success">
              WhatsApp Conectado!
            </h4>
            <p className="text-muted-foreground text-sm mb-2">
              {connection?.phone_number || '+55 11 99999-0000'}
            </p>
            <p className="text-muted-foreground text-xs sm:text-sm mb-6 px-4">
              Todas as mensagens serão recebidas e processadas automaticamente pela IA.
            </p>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-md mx-auto mb-6">
              <div className="bg-muted/50 rounded-xl p-3 sm:p-4 text-center">
                <p className="font-display font-bold text-lg sm:text-2xl text-primary">{connection?.leads_captured || 0}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Leads</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 sm:p-4 text-center">
                <p className="font-display font-bold text-lg sm:text-2xl text-accent">{connection?.active_chats || 0}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Chats</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 sm:p-4 text-center">
                <p className="font-display font-bold text-lg sm:text-2xl text-success">{connection?.response_rate || 0}%</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Resposta</p>
              </div>
            </div>

            <button
              onClick={handleDisconnect}
              className="px-4 py-2 text-destructive hover:bg-destructive/10 rounded-xl text-sm font-medium transition-colors"
            >
              Desconectar WhatsApp
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(200px); }
        }
      `}</style>
    </div>
  );
}
