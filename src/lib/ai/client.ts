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
// 'anthropic/claude-sonnet-4.5'
// 'openai/gpt-4o'
// 'google/gemini-flash-1.5'
// Let op: OpenRouter verwijdert oudere model-ID's uit zijn catalogus (3.5-generatie is per
// sept. 2026 niet meer beschikbaar — gaf een stille 404 die door chatJSON/chatCompletion
// alleen als "leeg antwoord"/fout naar boven kwam). Controleer bij vreemde AI-fouten eerst
// https://openrouter.ai/api/v1/models of de hier gebruikte ID's nog bestaan.
export const DEFAULT_MODEL = 'anthropic/claude-sonnet-4.5'

// Model-routering voor de AI-rollen-engine:
// - Haiku: routing/triage, vrijwilligers-intake-screening en de 'chat'-webassistent
// - Sonnet: complexe schrijf- en analysetaken (fundraising, rapportage, social)
export const MODEL_HAIKU = 'anthropic/claude-haiku-4.5'
export const MODEL_SONNET = 'anthropic/claude-sonnet-4.5'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string | { type: 'text'; text: string }[] | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>
}

interface ChatOptions {
  model?: string
  maxTokens?: number
  // Verplicht: koppelt deze call aan een organisatie (+ actie/gebruiker) voor kostentracking.
  meta: AiMeta
}

interface OpenRouterResponse {
  choices: { message: { content: string } }[]
  usage?: AiUsage
}

export async function chatCompletion(
  messages: ChatMessage[],
  options: ChatOptions
): Promise<string> {
  const apiKey = getApiKey()
  const model = options.model ?? DEFAULT_MODEL

  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.impactos.nl',
      'X-Title': 'ImpactOS',
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

/**
 * Zelfde als chatCompletion, maar dwingt een JSON-object-antwoord af (OpenRouter/OpenAI
 * response_format). Gebruikt voor gestructureerde extractie tijdens een gesprek (bv. de
 * chat-onboarding), waarbij elke beurt meteen een stukje bruikbare data teruggeeft i.p.v.
 * vrije tekst die achteraf geparsed moet worden.
 */
export async function chatJSON<T>(messages: ChatMessage[], options: ChatOptions): Promise<T> {
  const eersteContent = await chatJSONRuw(messages, options)

  try {
    return parseJsonAntwoord<T>(eersteContent)
  } catch {
    // Sommige modellen negeren response_format bij een lang antwoord (bv. een opsomming die
    // niet meer in de JSON-envelop past) en leveren platte tekst. Eén herstelpoging: leg het
    // mislukte antwoord terug voor en vraag expliciet om alleen het JSON-object.
    const herstelContent = await chatJSONRuw(
      [
        ...messages,
        { role: 'assistant', content: eersteContent },
        {
          role: 'user',
          content:
            'Dat was geen geldige JSON. Geef ALLEEN het JSON-object opnieuw, gebaseerd op wat je hierboven bedoelde — geen markdown, geen uitleg, geen codeblok.',
        },
      ],
      options
    )
    return parseJsonAntwoord<T>(herstelContent)
  }
}

async function chatJSONRuw(messages: ChatMessage[], options: ChatOptions): Promise<string> {
  const apiKey = getApiKey()
  const model = options.model ?? DEFAULT_MODEL

  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.impactos.nl',
      'X-Title': 'ImpactOS',
    },
    body: JSON.stringify({
      model,
      max_tokens: options.maxTokens ?? 500,
      messages,
      response_format: { type: 'json_object' },
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

  void logAiGebruik(options.meta, model, data.usage)
  return content
}

// Modellen houden zich niet altijd exact aan response_format: json_object en wrappen het
// object soms alsnog in een ```json-codeblok. Eerst kaal proberen, dan het codeblok (of het
// eerste {...}-blok) eruit strippen voor we het als mislukt beschouwen.
export function parseJsonAntwoord<T>(content: string): T {
  try {
    return JSON.parse(content) as T
  } catch {
    // val door naar de opschoonpoging hieronder
  }

  const zonderFences = content
    .trim()
    .replace(/^```[a-z]*\n?/i, '')
    .replace(/```\s*$/, '')
    .trim()

  try {
    return JSON.parse(zonderFences) as T
  } catch {
    const eersteBlok = zonderFences.match(/\{[\s\S]*\}/)
    if (eersteBlok) {
      try {
        return JSON.parse(eersteBlok[0]) as T
      } catch {
        // valt door naar de finale fout hieronder
      }
    }
    throw new Error(`Ongeldige JSON van model: ${content.slice(0, 300)}`)
  }
}

// Streaming variant — geeft een ReadableStream terug voor live typing-effect
export async function chatStream(
  messages: ChatMessage[],
  options: ChatOptions
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = getApiKey()
  const model = options.model ?? DEFAULT_MODEL

  const response = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'https://www.impactos.nl',
      'X-Title': 'ImpactOS',
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
