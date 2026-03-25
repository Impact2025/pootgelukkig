'use client'

interface Props {
  jaar: number
}

export default function RapportageDownload({ jaar }: Props) {
  function download() {
    window.open(`/api/admin/rapportage?jaar=${jaar}&format=csv`, '_blank')
  }

  return (
    <button
      onClick={download}
      className="flex items-center gap-2 bg-[#33335c] text-[#f8aa25] font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-[#33335c]/90 transition-colors"
    >
      <span className="material-symbols-outlined text-sm">download</span>
      Download CSV
    </button>
  )
}
