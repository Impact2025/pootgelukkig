'use client'

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-[#33335c]/15 bg-white px-5 py-2.5 text-sm font-bold text-[#33335c] transition-colors hover:border-[#33335c]/30"
      aria-label="Print deze pagina als PDF"
    >
      <span className="material-symbols-outlined text-[1.1rem]">picture_as_pdf</span>
      Print / PDF
    </button>
  )
}
