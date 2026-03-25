// OpenRouter client — compatibel met OpenAI API formaat
// Docs: https://openrouter.ai/docs

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'

// Standaard model — pas aan naar eigen voorkeur:
// 'anthropic/claude-sonnet-4-5'
// 'anthropic/claude-3.5-sonnet'
// 'openai/gpt-4o'
// 'google/gemini-flash-1.5'
export const DEFAULT_MODEL = 'anthropic/claude-sonnet-4-5'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string | { type: 'text'; text: string }[] | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>
}

interface OpenRouterResponse {
  choices: { message: { content: string } }[]
}

export async function chatCompletion(
  messages: ChatMessage[],
  options: {
    model?: string
    maxTokens?: number
  } = {}
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error(
      'OPENROUTER_API_KEY niet geconfigureerd. Voeg hem toe aan je .env.local.'
    )
  }

  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://pootgelukkig.nl',
      'X-Title': 'PootGelukkig',
    },
    body: JSON.stringify({
      model: options.model ?? DEFAULT_MODEL,
      max_tokens: options.maxTokens ?? 500,
      messages,
    }),
  })

  if (!response.ok) {
    const fout = await response.text()
    throw new Error(`OpenRouter fout ${response.status}: ${fout}`)
  }

  const data = (await response.json()) as OpenRouterResponse
  const content = data.choices[0]?.message?.content

  if (!content) {
    throw new Error('Leeg antwoord van OpenRouter')
  }

  return content
}
