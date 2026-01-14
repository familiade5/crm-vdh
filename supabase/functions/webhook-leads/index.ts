import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
};

interface LeadPayload {
  name: string;
  email?: string;
  phone?: string;
  source: 'facebook' | 'instagram' | 'google' | 'site' | 'whatsapp';
  interest?: string;
  message?: string;
  budget?: string;
  // Facebook/Instagram specific
  fb_lead_id?: string;
  fb_form_id?: string;
  // Google specific
  gclid?: string;
  campaign?: string;
  // Site specific
  page_url?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify webhook secret if provided
    const webhookSecret = req.headers.get('x-webhook-secret');
    const expectedSecret = Deno.env.get('WEBHOOK_SECRET');
    
    if (expectedSecret && webhookSecret !== expectedSecret) {
      console.warn('Invalid webhook secret');
      return new Response(
        JSON.stringify({ error: 'Invalid webhook secret' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: LeadPayload = await req.json();
    console.log('Received lead webhook:', { source: payload.source, name: payload.name });

    // Validate required fields
    if (!payload.name || !payload.source) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, source' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the user_id from the integration config (for now, get the first admin)
    // In production, you'd map this based on the webhook endpoint or API key
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id')
      .limit(1);

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No user configured to receive leads' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = profiles[0].user_id;

    // Create the lead
    const leadData = {
      user_id: userId,
      name: payload.name,
      email: payload.email || null,
      phone: payload.phone || null,
      source: payload.source,
      interest: payload.interest || null,
      budget: payload.budget || null,
      notes: payload.message ? `Mensagem inicial: ${payload.message}` : null,
      status: 'novo',
      temperature: 'frio',
      score: 0,
      ai_active: true,
      ai_qualified: false,
      requested_human: false,
    };

    const { data: lead, error } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single();

    if (error) {
      console.error('Error creating lead:', error);
      throw error;
    }

    // Update integration leads count
    const { data: integration } = await supabase
      .from('portal_integrations')
      .select('id, leads_count')
      .eq('user_id', userId)
      .eq('portal_slug', payload.source)
      .single();

    if (integration) {
      await supabase
        .from('portal_integrations')
        .update({ 
          leads_count: (integration.leads_count || 0) + 1,
          last_sync: new Date().toISOString()
        })
        .eq('id', integration.id);
    }

    // If there's an initial message, create a chat message and trigger AI response
    if (payload.message) {
      await supabase
        .from('chat_messages')
        .insert({
          lead_id: lead.id,
          content: payload.message,
          sender: 'lead',
          is_ai: false,
        });

      // Trigger AI auto-response
      const aiResponse = await fetch(`${supabaseUrl}/functions/v1/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          message: payload.message,
          leadId: lead.id,
          leadName: payload.name,
          leadInterest: payload.interest,
        }),
      });

      if (aiResponse.ok) {
        const aiData = await aiResponse.json();
        await supabase
          .from('chat_messages')
          .insert({
            lead_id: lead.id,
            content: aiData.response,
            sender: 'bot',
            is_ai: true,
          });
      }
    }

    console.log('Lead created successfully:', lead.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        lead_id: lead.id,
        message: 'Lead created successfully'
      }),
      { 
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
