import * as microsoft from './microsoft'
import * as google from './google'
import type { Provider } from './store'

export const INTEGRATIE_LABELS: Record<Provider, string> = {
  microsoft: 'Outlook / Microsoft 365',
  google: 'Google Agenda',
}

const REGISTRY = {
  microsoft: {
    geconfigureerd: microsoft.microsoftGeconfigureerd,
    bouwAutorisatieUrl: microsoft.bouwAutorisatieUrl,
    wisselCodeVoorTokens: microsoft.wisselCodeVoorTokens,
    haalGebruikersEmail: microsoft.haalGebruikersEmail,
    haalAgendaItems: microsoft.haalAgendaItems,
  },
  google: {
    geconfigureerd: google.googleGeconfigureerd,
    bouwAutorisatieUrl: google.bouwAutorisatieUrl,
    wisselCodeVoorTokens: google.wisselCodeVoorTokens,
    haalGebruikersEmail: google.haalGebruikersEmail,
    haalAgendaItems: google.haalAgendaItems,
  },
} satisfies Record<Provider, unknown>

export function isGeldigeProvider(waarde: string): waarde is Provider {
  return waarde === 'microsoft' || waarde === 'google'
}

export function haalProviderModule(provider: Provider) {
  return REGISTRY[provider]
}
