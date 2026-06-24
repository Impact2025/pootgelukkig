// OpenRouter client — compatibel met OpenAI API formaat
// Docs: https://openrouter.ai/docs

import { logAiGebruik, type AiMeta, type AiUsage } from './usage'

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'

function getApiKey(): string {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY niet geconfigureerd. Voeg hem toe aan je .env.local.')
  }
  return apiKey
}

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

interface ChatOptions {
  model?: string
  maxTokens?: number
  // Optioneel: koppelt deze call aan een module/gebruiker voor kostentracking.
  meta?: AiMeta
}

interface OpenRouterResponse {
  choices: { message: { content: string } }[]
  usage?: AiUsage
}

export async function chatCompletion(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<string> {
  const apiKey = getApiKey()
  const model = options.model ?? DEFAULT_MODEL

  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://pootgelukkig.nl',
      'X-Title': 'PootGelukkig',
    },
    body: JSON.stringify({
      model,
      max_tokens: options.maxTokens ?? 500,
      messages,
      usage: { include: true },
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

  // Niet-blokkerend loggen van tokengebruik + kosten
  void logAiGebruik(options.meta, model, data.usage)

  return content
}

// Streaming variant — geeft een ReadableStream terug voor live typing-effect
export async function chatStream(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = getApiKey()
  const model = options.model ?? DEFAULT_MODEL

  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://pootgelukkig.nl',
      'X-Title': 'PootGelukkig',
    },
    body: JSON.stringify({
      model,
      max_tokens: options.maxTokens ?? 600,
      stream: true,
      stream_options: { include_usage: true },
      usage: { include: true },
      messages,
    }),
  })

  if (!response.ok) {
    const fout = await response.text()
    throw new Error(`OpenRouter streaming fout ${response.status}: ${fout}`)
  }

  if (!response.body) {
    throw new Error('Geen streaming body ontvangen van OpenRouter')
  }

  // Transformeer OpenRouter SSE stream naar plain-text stream
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  return new ReadableStream({
    async start(controller) {
      const reader = response.body!.getReader()
      let laatsteUsage: AiUsage | undefined
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n').filter((l) => l.trim())

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data) as {
                choices: { delta: { content?: string } }[]
                usage?: AiUsage
              }
              if (parsed.usage) laatsteUsage = parsed.usage
              const content = parsed.choices[0]?.delta?.content
              if (content) {
                controller.enqueue(encoder.encode(content))
              }
            } catch {
              // ongeldige JSON in stream overslaan
            }
          }
        }
      } finally {
        reader.releaseLock()
        controller.close()
        // Niet-blokkerend loggen van tokengebruik + kosten (usage komt in de laatste chunk)
        void logAiGebruik(options.meta, model, laatsteUsage)
      }
    },
  })
}
