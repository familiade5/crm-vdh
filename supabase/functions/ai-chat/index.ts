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
    const { message, leadId, leadName, leadInterest, welcomeMessage } = await req.json();
    
    console.log('AI Chat request received:', { leadId, leadName, messagePreview: message?.substring(0, 50) });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch AI settings
    const authHeader = req.headers.get('Authorization');
    let aiSettings = {
      welcome_message: welcomeMessage || 'Olá! 👋 Bem-vindo à nossa imobiliária! Sou o assistente virtual e estou aqui para ajudá-lo a encontrar o imóvel ideal.'
    };

    // System prompt for real estate AI
    const systemPrompt = `Você é um assistente virtual de uma imobiliária brasileira. Seu objetivo é:
1. Fazer a pré-qualificação dos leads
2. Coletar informações sobre o tipo de imóvel desejado (apartamento, casa, comercial)
3. Entender a faixa de preço do cliente
4. Descobrir a região de interesse
5. Verificar se é para compra ou aluguel
6. Agendar visitas quando apropriado

Regras importantes:
- Seja cordial e profissional
- Use linguagem informal mas respeitosa (você, não tu)
- Faça perguntas abertas para entender melhor as necessidades
- Se o cliente pedir para falar com um humano, diga: "Entendo! Vou transferir você para um de nossos corretores agora mesmo. Aguarde um momento."
- Não invente informações sobre imóveis específicos
- Foque em qualificar o lead antes de oferecer imóveis

Nome do lead: ${leadName || 'Cliente'}
Interesse declarado: ${leadInterest || 'Não especificado'}`;

    // Call Lovable AI Gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message || 'Olá' }
        ],
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
    const isTransferRequest = message?.toLowerCase().includes('humano') || 
                              message?.toLowerCase().includes('atendente') ||
                              message?.toLowerCase().includes('pessoa') ||
                              message?.toLowerCase().includes('corretor');

    // Detect temperature based on conversation
    let suggestedTemperature = null;
    if (message?.toLowerCase().includes('urgente') || message?.toLowerCase().includes('preciso agora')) {
      suggestedTemperature = 'quente';
    } else if (message?.toLowerCase().includes('interessado') || message?.toLowerCase().includes('gostaria')) {
      suggestedTemperature = 'morno';
    }

    console.log('AI response generated successfully');

    return new Response(
      JSON.stringify({ 
        response: aiResponse,
        isTransferRequest,
        suggestedTemperature
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
