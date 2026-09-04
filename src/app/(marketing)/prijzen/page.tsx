import { redirect } from 'next/navigation'

// De prijspagina heet nu "Tarieven" en past bij de ImpactOS-propositie.
// Deze route blijft bestaan als permanente redirect voor bestaande links/backlinks.
export default function PrijzenRedirectPage() {
  redirect('/tarieven')
}
