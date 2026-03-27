export const dynamic = 'force-static'

export default function OnderhoudPage() {
  return (
    <div className="min-h-svh bg-[#102210] flex flex-col items-center justify-center px-6 text-center">
      {/* Logo */}
      <div className="size-20 rounded-3xl bg-primary/15 flex items-center justify-center mb-6 border border-primary/20">
        <span
          className="material-symbols-outlined text-primary"
          style={{ fontSize: '40px', fontVariationSettings: "'FILL' 1" }}
        >
          pets
        </span>
      </div>

      {/* Badge */}
      <span className="text-[11px] font-extrabold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full tracking-widest uppercase mb-5">
        Even een pauze
      </span>

      {/* Heading */}
      <h1 className="text-white font-extrabold text-3xl leading-tight mb-3">
        PootGelukkig is<br />even offline
      </h1>

      <p className="text-white/50 text-base leading-relaxed max-w-xs mb-10">
        We zijn bezig met een update om jouw ervaring nog beter te maken.
        We zijn zo snel mogelijk terug!
      </p>

      {/* Illustratie: drie bolletjes */}
      <div className="flex gap-2 mb-10">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="size-2.5 rounded-full bg-primary/60"
            style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>

      {/* Footer */}
      <p className="text-white/20 text-xs">
        Vragen? Mail ons op{' '}
        <a href="mailto:hallo@pootgelukkig.nl" className="text-primary/60 underline underline-offset-2">
          hallo@pootgelukkig.nl
        </a>
      </p>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-8px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
