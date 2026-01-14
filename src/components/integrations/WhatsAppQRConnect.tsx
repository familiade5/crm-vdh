import { useState, useEffect } from 'react';
import { QrCode, Check, Smartphone, RefreshCw, Wifi, WifiOff, MessageCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWhatsAppConnection } from '@/hooks/useIntegrations';

export function WhatsAppQRConnect() {
  const { connection, loading, startScanning, connect, disconnect } = useWhatsAppConnection();
  const [countdown, setCountdown] = useState(60);
  const [localStatus, setLocalStatus] = useState<'disconnected' | 'scanning' | 'connected'>('disconnected');

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
      <div className="p-6 border-b border-border bg-gradient-to-r from-green-600/10 to-green-500/5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-green-600 flex items-center justify-center">
            <MessageCircle className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-xl">WhatsApp Business</h3>
            <p className="text-sm text-muted-foreground">
              Conecte seu número para receber e responder mensagens
            </p>
          </div>
          <div className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium',
            localStatus === 'connected' 
              ? 'bg-success/10 text-success' 
              : localStatus === 'scanning'
              ? 'bg-warning/10 text-warning'
              : 'bg-muted text-muted-foreground'
          )}>
            {localStatus === 'connected' ? (
              <>
                <Wifi className="w-4 h-4" />
                Conectado
              </>
            ) : localStatus === 'scanning' ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Aguardando...
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4" />
                Desconectado
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {localStatus === 'disconnected' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-muted flex items-center justify-center">
              <Smartphone className="w-10 h-10 text-muted-foreground" />
            </div>
            <h4 className="font-display font-bold text-lg mb-2">
              Conecte seu WhatsApp Business
            </h4>
            <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
              Escaneie o QR Code com seu celular para conectar o WhatsApp Business e começar a receber mensagens automaticamente.
            </p>
            <button
              onClick={handleGenerateQR}
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <QrCode className="w-5 h-5" />
              Gerar QR Code
            </button>
          </div>
        )}

        {localStatus === 'scanning' && (
          <div className="text-center py-4">
            <div className="relative w-64 h-64 mx-auto mb-6 bg-white rounded-2xl p-4 shadow-lg">
              {/* Simulated QR Code */}
              <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg relative overflow-hidden">
                <div className="absolute inset-4 grid grid-cols-8 grid-rows-8 gap-1">
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
                <div className="absolute top-2 left-2 w-10 h-10 border-4 border-white rounded-md" />
                <div className="absolute top-2 right-2 w-10 h-10 border-4 border-white rounded-md" />
                <div className="absolute bottom-2 left-2 w-10 h-10 border-4 border-white rounded-md" />
              </div>
              
              {/* Scanning animation */}
              <div className="absolute inset-4 overflow-hidden rounded-lg">
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

            <div className="bg-muted/50 rounded-xl p-4 max-w-md mx-auto">
              <h5 className="font-semibold mb-2">Como conectar:</h5>
              <ol className="text-sm text-muted-foreground text-left space-y-2">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                  Abra o WhatsApp Business no seu celular
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                  Vá em Configurações → Aparelhos conectados
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                  Toque em "Conectar um aparelho" e escaneie o código
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
          <div className="text-center py-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
              <Check className="w-10 h-10 text-success" />
            </div>
            <h4 className="font-display font-bold text-lg mb-2 text-success">
              WhatsApp Conectado!
            </h4>
            <p className="text-muted-foreground text-sm mb-2">
              {connection?.phone_number || '+55 11 99999-0000'}
            </p>
            <p className="text-muted-foreground text-sm mb-6">
              Todas as mensagens serão recebidas e processadas automaticamente pela IA.
            </p>

            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-6">
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <p className="font-display font-bold text-2xl text-primary">{connection?.leads_captured || 0}</p>
                <p className="text-xs text-muted-foreground">Leads Captados</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <p className="font-display font-bold text-2xl text-accent">{connection?.active_chats || 0}</p>
                <p className="text-xs text-muted-foreground">Chats Ativos</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <p className="font-display font-bold text-2xl text-success">{connection?.response_rate || 0}%</p>
                <p className="text-xs text-muted-foreground">Taxa de Resposta</p>
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
