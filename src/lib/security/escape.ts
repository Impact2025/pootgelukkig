// Escapet tekst zodat gebruikersinvoer veilig in een HTML-context (zoals e-mail)
// kan worden geplaatst zonder injectie.
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
