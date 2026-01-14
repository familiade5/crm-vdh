import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, leadId, leadName, leadInterest, welcomeMessage, conversationHistory } = await req.json();
    
    console.log('AI Chat request received:', { leadId, leadName, messagePreview: message?.substring(0, 50) });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch AI settings for the user
    let aiSettings = {
      welcome_message: welcomeMessage || 'Olá! 👋 Bem-vindo à nossa imobiliária! Sou o assistente virtual e estou aqui para ajudá-lo a encontrar o imóvel ideal.',
      auto_response: true,
      auto_scheduling: false,
    };

    // System prompt for real estate AI with auto-response and handoff
    const systemPrompt = `Você é um assistente virtual de uma imobiliária brasileira chamada ImobiCRM. Seu objetivo principal é:

## PASSO 1 - PRÉ-QUALIFICAÇÃO (Perguntas obrigatórias)
Faça estas perguntas de forma natural e conversacional:
1. Qual seu nome completo?
2. Está procurando imóvel para COMPRAR ou ALUGAR?
3. Qual tipo de imóvel? (apartamento, casa, sala comercial, terreno)
4. Qual região/bairro de preferência?
5. Qual faixa de preço máxima?
6. Quantos quartos/suítes precisa?
7. Tem preferência de condomínio com lazer?

## PASSO 2 - CLASSIFICAÇÃO DE TEMPERATURA
Baseado nas respostas, classifique o lead:
- QUENTE 🔥: Tem urgência, orçamento definido, pronto para visitar
- MORNO 🌡️: Interessado mas sem urgência imediata
- FRIO ❄️: Apenas pesquisando, sem definições

## PASSO 3 - AUTO-RESPOSTA E HANDOFF
- Se o cliente pedir para falar com HUMANO/CORRETOR/ATENDENTE, responda:
  "Entendi! Vou transferir você para um de nossos corretores especializados agora mesmo. Aguarde um momento, em breve entraremos em contato! 📞"
- Se o lead estiver QUENTE e respondeu todas as perguntas, ofereça agendar uma visita
- Se detectar que precisa de atendimento especializado, sugira a transferência

## REGRAS IMPORTANTES
- Seja cordial, profissional e use emojis com moderação
- Use linguagem informal mas respeitosa (você, não tu)
- Faça UMA pergunta por vez para não sobrecarregar
- NÃO invente informações sobre imóveis específicos
- Sempre agradeça as informações fornecidas
- Se o cliente demonstrar frustração, ofereça transferir para humano

## CONTEXTO DO LEAD
Nome: ${leadName || 'Cliente'}
Interesse declarado: ${leadInterest || 'Não especificado'}

## HISTÓRICO DA CONVERSA
${conversationHistory ? conversationHistory.map((m: { role: string; content: string }) => 
  `${m.role === 'user' ? 'Cliente' : 'Assistente'}: ${m.content}`
).join('\n') : 'Início da conversa'}`;

    // Build messages array
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt }
    ];

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory) {
        messages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        });
      }
    }

    // Add current message
    messages.push({ role: 'user', content: message || 'Olá' });

    // Call Lovable AI Gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem. Por favor, tente novamente.';

    // Check if user requested human transfer
    const lowerMessage = message?.toLowerCase() || '';
    const isTransferRequest = 
      lowerMessage.includes('humano') || 
      lowerMessage.includes('atendente') ||
      lowerMessage.includes('pessoa') ||
      lowerMessage.includes('corretor') ||
      lowerMessage.includes('falar com alguém') ||
      lowerMessage.includes('atendimento');

    // Check if AI response suggests transfer
    const aiSuggestsTransfer = 
      aiResponse.toLowerCase().includes('transferir') ||
      aiResponse.toLowerCase().includes('corretor especializado');

    // Detect temperature based on conversation
    let suggestedTemperature: string | null = null;
    let suggestedScore = 0;

    // Analyze message content for lead scoring
    if (lowerMessage.includes('urgente') || lowerMessage.includes('preciso agora') || lowerMessage.includes('esta semana')) {
      suggestedTemperature = 'quente';
      suggestedScore = 80;
    } else if (lowerMessage.includes('interessado') || lowerMessage.includes('gostaria') || lowerMessage.includes('quero')) {
      suggestedTemperature = 'morno';
      suggestedScore = 50;
    } else if (lowerMessage.includes('apenas olhando') || lowerMessage.includes('pesquisando') || lowerMessage.includes('no futuro')) {
      suggestedTemperature = 'frio';
      suggestedScore = 20;
    }

    // Extract budget if mentioned
    const budgetMatch = lowerMessage.match(/(\d{2,3})(\s)?(mil|k)|(\d{1,2})(\s)?(milhão|milhões|mi)/);
    let extractedBudget = null;
    if (budgetMatch) {
      extractedBudget = budgetMatch[0];
    }

    // Update lead in database if we have new info
    if (leadId && (suggestedTemperature || extractedBudget || isTransferRequest)) {
      const updates: Record<string, unknown> = {};
      if (suggestedTemperature) {
        updates.temperature = suggestedTemperature;
        updates.score = suggestedScore;
      }
      if (extractedBudget) {
        updates.budget = extractedBudget;
      }
      if (isTransferRequest || aiSuggestsTransfer) {
        updates.requested_human = true;
        updates.ai_active = false;
      }
      if (suggestedScore >= 50) {
        updates.ai_qualified = true;
      }

      if (Object.keys(updates).length > 0) {
        await supabase
          .from('leads')
          .update(updates)
          .eq('id', leadId);
        console.log('Lead updated:', updates);
      }
    }

    console.log('AI response generated successfully');

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        isTransferRequest: isTransferRequest || aiSuggestsTransfer,
        suggestedTemperature,
        suggestedScore,
        extractedBudget,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in ai-chat function:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
