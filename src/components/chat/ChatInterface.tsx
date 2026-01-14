import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Paperclip, Mic, MoreVertical, AlertTriangle, UserCheck, Power, Bell, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatMessages } from '@/hooks/useLeads';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface ChatInterfaceProps {
  leadId: string;
  leadName: string;
  leadTemperature?: 'frio' | 'morno' | 'quente';
  leadSource?: string;
  leadInterest?: string;
}

const temperatureConfig = {
  quente: { label: 'Quente', color: 'bg-red-500', textColor: 'text-red-500', bgLight: 'bg-red-500/10' },
  morno: { label: 'Morno', color: 'bg-amber-500', textColor: 'text-amber-500', bgLight: 'bg-amber-500/10' },
  frio: { label: 'Frio', color: 'bg-blue-500', textColor: 'text-blue-500', bgLight: 'bg-blue-500/10' },
};

export function ChatInterface({ 
  leadId, 
  leadName,
  leadTemperature = 'frio',
  leadSource = 'site',
  leadInterest = ''
}: ChatInterfaceProps) {
  const { messages, loading, sendMessage, callAI } = useChatMessages(leadId);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAIActive, setIsAIActive] = useState(true);
  const [showTransferAlert, setShowTransferAlert] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const tempConfig = temperatureConfig[leadTemperature];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check for transfer requests
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.is_transfer_request && isAIActive) {
      setShowTransferAlert(true);
      setIsAIActive(false);
      toast.warning('🚨 Lead solicitou atendimento humano!', {
        description: `${leadName} quer falar com um corretor.`,
        duration: 10000,
      });
    }
  }, [messages, isAIActive, leadName]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    setSending(true);
    const userMessage = input;
    setInput('');

    // Send agent message
    await sendMessage(userMessage, 'agent', false, false);

    // If AI is active, get AI response
    if (isAIActive) {
      setIsTyping(true);
      
      try {
        const aiResult = await callAI(userMessage, leadName, leadInterest);
        
        if (aiResult?.response) {
          await sendMessage(aiResult.response, 'ai', true, aiResult.isTransferRequest || false);
        }
      } catch (error) {
        console.error('AI error:', error);
        toast.error('Erro ao obter resposta da IA');
      } finally {
        setIsTyping(false);
      }
    }

    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleAI = () => {
    const newState = !isAIActive;
    setIsAIActive(newState);
    toast.success(newState ? '🤖 IA ativada para este chat' : '👤 Você assumiu o atendimento');
  };

  const handleAssumeChat = () => {
    setShowTransferAlert(false);
    setIsAIActive(false);
    toast.success('Você assumiu o atendimento deste lead');
  };

  // Simulate lead message (for testing)
  const simulateLeadMessage = async () => {
    const testMessages = [
      'Olá! Estou interessado em um apartamento de 3 quartos.',
      'Qual o valor médio dos imóveis na região?',
      'Vocês têm imóveis disponíveis no centro?',
      'Gostaria de agendar uma visita.',
      'Quero falar com um corretor humano, por favor.',
    ];
    const randomMessage = testMessages[Math.floor(Math.random() * testMessages.length)];
    
    // Check if it's a transfer request
    const isTransfer = randomMessage.toLowerCase().includes('humano') || 
                       randomMessage.toLowerCase().includes('corretor');
    
    await sendMessage(randomMessage, 'lead', false, isTransfer);
    
    // If AI is active and not a transfer request, get AI response
    if (isAIActive && !isTransfer) {
      setIsTyping(true);
      setTimeout(async () => {
        try {
          const aiResult = await callAI(randomMessage, leadName, leadInterest);
          if (aiResult?.response) {
            await sendMessage(aiResult.response, 'ai', true, false);
          }
        } catch (error) {
          console.error('AI error:', error);
        }
        setIsTyping(false);
      }, 1500);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-card rounded-2xl shadow-md overflow-hidden items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-card rounded-2xl shadow-md overflow-hidden">
      {/* Transfer Alert Banner */}
      {showTransferAlert && (
        <div className="bg-warning/10 border-b border-warning/30 px-4 py-3 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="font-semibold text-warning">Solicitação de Atendimento Humano</p>
              <p className="text-sm text-muted-foreground">O lead pediu para falar com um corretor</p>
            </div>
          </div>
          <button
            onClick={handleAssumeChat}
            className="px-4 py-2 bg-warning text-warning-foreground rounded-xl font-medium text-sm hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            Assumir Atendimento
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-card">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
              {leadName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success border-2 border-card flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-success-foreground animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{leadName}</h3>
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1',
                tempConfig.bgLight, tempConfig.textColor
              )}>
                <span className={cn('w-2 h-2 rounded-full', tempConfig.color)} />
                {tempConfig.label}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                {isAIActive ? (
                  <>
                    <Sparkles className="w-3 h-3 text-accent" />
                    <span className="text-accent">IA Ativa</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3 h-3 text-primary" />
                    <span className="text-primary">Atendimento Humano</span>
                  </>
                )}
              </span>
              <span>•</span>
              <span className="capitalize">via {leadSource}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Simulate Lead Message Button */}
          <button
            onClick={simulateLeadMessage}
            className="px-3 py-2 rounded-xl text-sm bg-muted hover:bg-muted/80 transition-colors"
            title="Simular mensagem do lead"
          >
            📩 Simular
          </button>
          
          <button
            onClick={toggleAI}
            className={cn(
              'px-4 py-2 rounded-xl font-medium text-sm transition-all flex items-center gap-2',
              isAIActive 
                ? 'bg-accent/10 text-accent hover:bg-accent/20' 
                : 'bg-primary/10 text-primary hover:bg-primary/20'
            )}
          >
            {isAIActive ? (
              <>
                <Power className="w-4 h-4" />
                Pausar IA
              </>
            ) : (
              <>
                <Bot className="w-4 h-4" />
                Ativar IA
              </>
            )}
          </button>
          <button className="p-2 rounded-lg hover:bg-muted transition-colors">
            <MoreVertical className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/30">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <Bot className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma mensagem ainda</p>
              <p className="text-sm mt-1">Clique em "Simular" para testar o chat</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isLead = message.sender === 'lead';
            const isAI = message.is_ai;

            return (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3 animate-slide-in',
                  isLead ? 'justify-start' : 'justify-end'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {isLead && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}

                <div
                  className={cn(
                    'max-w-[70%] rounded-2xl px-4 py-3',
                    isLead
                      ? message.is_transfer_request
                        ? 'bg-warning/10 border-2 border-warning/30 rounded-tl-none'
                        : 'bg-card border border-border rounded-tl-none'
                      : isAI
                      ? 'bg-gradient-primary text-primary-foreground rounded-tr-none'
                      : 'bg-primary text-primary-foreground rounded-tr-none'
                  )}
                >
                  {message.is_transfer_request && (
                    <div className="flex items-center gap-1 mb-1 text-xs text-warning">
                      <Bell className="w-3 h-3" />
                      <span>Solicitou atendente</span>
                    </div>
                  )}
                  {isAI && (
                    <div className="flex items-center gap-1 mb-1 text-xs opacity-80">
                      <Bot className="w-3 h-3" />
                      <span>Assistente IA</span>
                    </div>
                  )}
                  {!isLead && !isAI && (
                    <div className="flex items-center gap-1 mb-1 text-xs opacity-80">
                      <UserCheck className="w-3 h-3" />
                      <span>Você</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p
                    className={cn(
                      'text-xs mt-2',
                      isLead ? 'text-muted-foreground' : 'opacity-70'
                    )}
                  >
                    {format(new Date(message.created_at), "HH:mm", { locale: ptBR })}
                  </p>
                </div>

                {!isLead && (
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                      isAI ? 'bg-gradient-primary' : 'bg-primary'
                    )}
                  >
                    {isAI ? (
                      <Bot className="w-4 h-4 text-primary-foreground" />
                    ) : (
                      <User className="w-4 h-4 text-primary-foreground" />
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {isTyping && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-none px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-end gap-3">
          <button className="p-3 rounded-xl hover:bg-muted transition-colors">
            <Paperclip className="w-5 h-5 text-muted-foreground" />
          </button>

          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isAIActive ? "A IA está respondendo... ou digite para enviar" : "Digite sua mensagem..."}
              className="w-full px-4 py-3 pr-12 bg-muted rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              rows={1}
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-background transition-colors">
              <Mic className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className={cn(
              'p-3 rounded-xl transition-all duration-200',
              input.trim() && !sending
                ? 'bg-gradient-primary text-primary-foreground shadow-glow hover:scale-105'
                : 'bg-muted text-muted-foreground'
            )}
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted-foreground">
          {isAIActive ? (
            <>
              <Sparkles className="w-3 h-3 text-accent" />
              <span>IA fazendo pré-qualificação • Clique em "Pausar IA" para assumir</span>
            </>
          ) : (
            <>
              <UserCheck className="w-3 h-3 text-primary" />
              <span>Você está atendendo diretamente • Clique em "Ativar IA" para voltar</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
