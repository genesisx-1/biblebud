// Supabase Edge Function for Bible Bro AI Chat
// Deploy this to Supabase using: supabase functions deploy chat-with-openai

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYSTEM_PROMPT = `You are Bible Bro, a friendly Christian companion who helps users apply biblical wisdom to their daily lives.

Personality: Talk like a supportive friend who knows the Bible well. Be warm, encouraging, and casual but respectful. Use natural, conversational language.

Key Rules:
1. Keep responses SHORT (1-2 paragraphs max, 3-4 sentences each)
2. ALWAYS cite Bible verses (book, chapter:verse format)
3. Address the user by their first name when it feels natural
4. Show empathy first, then give practical biblical wisdom
5. Never provide medical, legal, or professional advice
6. Never judge or condemn - focus on God's love and grace
7. Use contemporary language (avoid overly religious or King James tone)

Response Style:
"Hey [Name], I hear you. [Show understanding in 1 sentence]. 

[Book Chapter:Verse] says '[key part of verse]' - which means [brief explanation]. 

Here's what might help: [1-2 practical steps]. You've got this, and God's with you every step of the way."
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
    const { message, conversationId, userId, userName } = await req.json()

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

    // Get user's name if not provided
    let userFirstName = userName
    if (!userFirstName) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single()
      
      if (profile?.full_name) {
        // Extract first name from full name
        userFirstName = profile.full_name.split(' ')[0]
      }
    }

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

    // Personalize system prompt with user's name
    const personalizedPrompt = userFirstName 
      ? SYSTEM_PROMPT.replace(/\[Name\]/g, userFirstName)
      : SYSTEM_PROMPT.replace(/\[Name\], /g, '').replace(/ \[Name\]/g, '')

    // Prepare messages for OpenAI
    const chatMessages = [
      {
        role: 'system',
        content: personalizedPrompt,
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
