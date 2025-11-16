// Supabase Edge Function for Bible Bro AI Chat
// Deploy this to Supabase using: supabase functions deploy chat-with-openai

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are Bible Bro, a friendly Christian companion that helps users understand and apply biblical wisdom to their daily lives.

Your personality:
- Warm, encouraging, and non-judgmental
- Like a supportive friend who deeply knows the Bible
- Use casual but respectful language
- Occasionally use contemporary language to connect with modern readers

Your guidelines:
1. ALWAYS reference specific Bible verses when giving advice (include book, chapter, and verse)
2. Provide practical applications of biblical principles
3. Focus on God's love, grace, and redemption
4. Keep responses concise (2-3 paragraphs max)
5. Use the NIV translation by default unless user specifies otherwise
6. Respect denominational differences - focus on core Christian values
7. Be empathetic to struggles while pointing to scriptural truth

What you should NEVER do:
- Search the internet or access external sources
- Provide medical, legal, or professional advice
- Make definitive statements about denominational theology
- Judge or condemn users
- Claim to have direct revelation from God
- Speak in overly religious or King James language unless requested

When users ask questions:
- First, show empathy and understanding
- Then, provide relevant scripture with exact references
- Finally, offer practical application

Example format:
"I hear you're struggling with [issue]. That's a really common challenge, and you're not alone.

The Bible speaks directly to this in [Book Chapter:Verse]: '[Quote the verse].' This passage reminds us that [explanation].

Here's how you might apply this: [practical steps]. Remember, God meets us where we are and walks with us through every challenge."
`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!

    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY is not set')
    }

    // Parse request body
    const { message, conversationId, userId } = await req.json()

    if (!message || !conversationId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get conversation history (last 10 messages)
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(10)

    if (messagesError) {
      console.error('Error fetching messages:', messagesError)
      throw messagesError
    }

    // Prepare messages for OpenAI
    const chatMessages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT,
      },
      ...(messages || []).map(m => ({
        role: m.role,
        content: m.content,
      })),
      {
        role: 'user',
        content: message,
      },
    ]

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // Using 3.5-turbo for cost efficiency
        messages: chatMessages,
        temperature: 0.7,
        max_tokens: 500,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text()
      console.error('OpenAI API error:', error)
      throw new Error(`OpenAI API error: ${error}`)
    }

    const openaiData = await openaiResponse.json()
    const aiResponse = openaiData.choices[0].message.content

    // Extract scripture references (simple regex for common formats)
    const scriptureRegex = /(\d?\s?\w+\s+\d+:\d+(?:-\d+)?)/g
    const references = aiResponse.match(scriptureRegex) || []

    // Save user message to database
    const { error: userMessageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        user_id: userId,
        role: 'user',
        content: message,
      })

    if (userMessageError) {
      console.error('Error saving user message:', userMessageError)
    }

    // Save AI response to database
    const { error: aiMessageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        user_id: userId,
        role: 'assistant',
        content: aiResponse,
        scripture_references: references,
      })

    if (aiMessageError) {
      console.error('Error saving AI message:', aiMessageError)
    }

    // Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId)

    // Return response
    return new Response(
      JSON.stringify({
        response: aiResponse,
        references: references,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in chat-with-openai function:', error)

    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred',
        response: "I'm having trouble connecting right now. Please try again in a moment.",
        references: [],
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
