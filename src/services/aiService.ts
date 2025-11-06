import type { Message } from '../store/useStore';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const GOOGLE_GENAI_API_KEY = import.meta.env.VITE_GOOGLE_GENAI_API_KEY || '';

export async function sendMessage(
  provider: 'openai' | 'gemini' | 'grok' | 'anthropic' | 'deepseek',
  model: string,
  messages: Message[]
): Promise<string> {
  switch (provider) {
    case 'openai':
      return sendOpenAIMessage(model, messages);
    case 'gemini':
      return sendGeminiMessage(model, messages);
    default:
      throw new Error(`Provider ${provider} not implemented yet`);
  }
}

async function sendOpenAIMessage(model: string, messages: Message[]): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: model || 'gpt-4o',
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API error');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function sendGeminiMessage(model: string, messages: Message[]): Promise<string> {
  if (!GOOGLE_GENAI_API_KEY) {
    throw new Error('Google Gemini API key not configured');
  }

  // Convert messages to Gemini format
  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-pro'}:generateContent?key=${GOOGLE_GENAI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000
        }
      })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Gemini API error');
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}
