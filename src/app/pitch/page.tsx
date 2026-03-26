import Link from 'next/link'

export const metadata = {
  title: 'PootGelukkig — Pitch Deck',
  description: 'AI-gestuurde matching tussen mensen en asieldieren. Bedacht door Maya van Munster.',
}

const stats = [
  { getal: '10', label: 'Vragen in de AI intake' },
  { getal: '1 op 5', label: 'Adopties mislukt binnen 6 mnd*' },
  { getal: '0€', label: 'Kosten voor asielen' },
  { getal: '14', label: 'Leeftijd van de bedenker' },
]

const demoMomenten = [
  {
    nummer: '01',
    titel: 'AI Intake',
    beschrijving: 'Stel 10 vragen over jouw leefstijl. Claude analyseert je antwoorden en bouwt een profiel.',
    icon: 'psychology',
    kleur: 'from-amber-500/20 to-amber-600/10',
    grens: 'border-amber-500/30',
    link: '/auth/login?callbackUrl=/intake',
    label: 'Bekijk intake →',
  },
  {
    nummer: '02',
    titel: 'AI Matching',
    beschrijving: 'Het algoritme matcht jouw profiel met alle dieren in de database. Gesorteerd op compatibiliteit.',
    icon: 'favorite',
    kleur: 'from-rose-500/20 to-rose-600/10',
    grens: 'border-rose-500/30',
    link: '/auth/login?callbackUrl=/dashboard',
    label: 'Bekijk matches →',
  },
  {
    nummer: '03',
    titel: 'Dierenprofiel',
    beschrijving: 'Gedetailleerde uitleg waarom dit dier bij jou past. Medisch paspoort, karakter, chat met asiel.',
    icon: 'pets',
    kleur: 'from-violet-500/20 to-violet-600/10',
    grens: 'border-violet-500/30',
    link: '/auth/login?callbackUrl=/dashboard',
    label: 'Bekijk profiel →',
  },
]

const technologie = [
  { naam: 'Next.js 15', rol: 'App Router + Server Components' },
  { naam: 'Claude AI', rol: 'Matching + Intake chatbot' },
  { naam: 'Neon PostgreSQL', rol: 'Database via Drizzle ORM' },
  { naam: 'NextAuth v5', rol: 'Authenticatie' },
  { naam: 'Vercel', rol: 'Deployment + Blob storage' },
  { naam: 'TypeScript', rol: 'Strict mode, geen any' },
]

export default function PitchPage() {
  return (
    <div className="min-h-screen bg-[#12122a] text-white font-display" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Achtergrond decoratie */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-60 -left-60 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #f8aa25 0%, transparent 70%)' }} />
        <div className="absolute -bottom-60 -right-60 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #E2725B 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #33335c 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-8 py-16">

        {/* ── HERO ── */}
        <header className="text-center mb-24">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] mb-8 shadow-2xl"
            style={{ background: 'rgba(248,170,37,0.12)', border: '1px solid rgba(248,170,37,0.25)' }}>
            <span className="material-symbols-outlined text-5xl" style={{ color: '#f8aa25', fontVariationSettings: "'FILL' 1" }}>
              pets
            </span>
          </div>

          <h1 className="text-7xl font-extrabold tracking-tight mb-4"
            style={{ background: 'linear-gradient(135deg, #f8aa25, #E2725B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            PootGelukkig
          </h1>

          <p className="text-2xl font-medium mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>
            AI-gestuurde matching tussen mensen en asieldieren
          </p>

          <p className="text-base max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Bedacht door <strong className="text-white/60">Maya van Munster</strong> (13 jaar) · Gebouwd door <strong className="text-white/60">WeAreImpact</strong>
          </p>

          <div className="flex items-center justify-center gap-4 mt-8">
            <Link href="/auth/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
              style={{ background: '#f8aa25', color: '#12122a', boxShadow: '0 8px 32px rgba(248,170,37,0.3)' }}>
              <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
              Demo starten
            </Link>
            <Link href="/admin"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all hover:bg-white/10"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}>
              <span className="material-symbols-outlined text-base">admin_panel_settings</span>
              Asiel admin
            </Link>
          </div>
        </header>

        {/* ── OVER DE MAKERS ── */}
        <section className="grid grid-cols-2 gap-6 mb-8">
          <div className="rounded-3xl p-7" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(248,170,37,0.12)' }}>
                <span className="material-symbols-outlined text-xl" style={{ color: '#f8aa25', fontVariationSettings: "'FILL' 1" }}>person</span>
              </div>
              <div>
                <p className="font-bold text-white text-sm">Vincent van Munster</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Oprichter · WeAreImpact</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Sociaal ondernemer met 25+ jaar ervaring als platformbouwer — zijn eerste internetbureau startte hij in 1999.
              Sinds 2014 sociaal ondernemer en impactmaker.
              Bouwt digitale producten voor welzijn, zorg en maatschappelijke impact via WeAreImpact.
            </p>
            <p className="text-xs mt-4 font-semibold" style={{ color: '#f8aa25' }}>Passie: impact maken</p>
          </div>

          <div className="rounded-3xl p-7" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(226,114,91,0.12)' }}>
                <span className="material-symbols-outlined text-xl" style={{ color: '#E2725B', fontVariationSettings: "'FILL' 1" }}>emoji_objects</span>
              </div>
              <div>
                <p className="font-bold text-white text-sm">Maya van Munster</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Bedenker · 14 jaar</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Zag het probleem, bedacht de oplossing. Vroeg haar vader: "Kunnen wij niet jouw matching AI gebruiken?"
              Dat ene zinnetje werd PootGelukkig.
            </p>
            <p className="text-xs mt-4 font-semibold" style={{ color: '#E2725B' }}>Bewijs dat leeftijd geen drempel is</p>
          </div>
        </section>

        {/* ── CONTEXT QUOTE ── */}
        <section className="mb-8">
          <div className="rounded-3xl px-8 py-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-base leading-relaxed italic" style={{ color: 'rgba(255,255,255,0.55)' }}>
              "Jaarlijks komen tienduizenden dieren in Nederlandse asielen terecht — vaak na een impulsaankoop of slechte match.
              Internationaal onderzoek toont aan dat <strong className="text-white/80 not-italic">'past niet in het huishouden'</strong> de nummer één reden is voor terugplaatsing."
            </p>
            <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Bron: Verhuisdieren.nl · Dierenbescherming jaarverslag · Humane Society (internationaal onderzoek)
            </p>
          </div>
        </section>

        {/* ── PROBLEEM + OPLOSSING ── */}
        <section className="grid grid-cols-2 gap-6 mb-20">
          <div className="rounded-3xl p-8" style={{ background: 'rgba(226,114,91,0.08)', border: '1px solid rgba(226,114,91,0.2)' }}>
            <div className="flex items-center gap-3 mb-5">
              <span className="material-symbols-outlined text-2xl" style={{ color: '#E2725B', fontVariationSettings: "'FILL' 1" }}>
                sentiment_dissatisfied
              </span>
              <h2 className="text-lg font-bold text-white/80 uppercase tracking-wider">Het probleem</h2>
            </div>
            <ul className="space-y-3">
              {[
                'Jaarlijks komen tienduizenden dieren in Nederlandse asielen terecht',
                '1 op de 5 adopties mislukt binnen zes maanden',
                '"Past niet in het huishouden" is de #1 reden voor terugplaatsing',
                'Terugplaatsing is traumatisch voor mens én dier',
              ].map((punt) => (
                <li key={punt} className="flex items-start gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  <span className="material-symbols-outlined text-sm mt-0.5 flex-shrink-0" style={{ color: '#E2725B' }}>close</span>
                  {punt}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl p-8" style={{ background: 'rgba(248,170,37,0.08)', border: '1px solid rgba(248,170,37,0.2)' }}>
            <div className="flex items-center gap-3 mb-5">
              <span className="material-symbols-outlined text-2xl" style={{ color: '#f8aa25', fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
              <h2 className="text-lg font-bold text-white/80 uppercase tracking-wider">De oplossing</h2>
            </div>
            <ul className="space-y-3">
              {[
                'AI analyseert leefstijl en matcht op gedrag, niet uiterlijk',
                'Automatische matchscore zodat asielen tijd besparen',
                'Persoonlijke uitleg: waarom dit dier bij jou past',
                'Nazorg module: 3-3-3 regel met AI-begeleiding',
              ].map((punt) => (
                <li key={punt} className="flex items-start gap-2.5 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  <span className="material-symbols-outlined text-sm mt-0.5 flex-shrink-0" style={{ color: '#f8aa25' }}>check</span>
                  {punt}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="mb-20">
          <div className="grid grid-cols-4 gap-4 mb-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-3xl p-6 text-center"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p className="text-3xl font-extrabold mb-1" style={{ color: '#f8aa25' }}>{stat.getal}</p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{stat.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
            * Humane Society: 7–20% keert terug binnen 6 maanden. Bron: Verhuisdieren.nl / Dierenbescherming
          </p>
        </section>

        {/* ── DEMO MOMENTEN ── */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold mb-3">Demo</h2>
            <p className="text-base" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Klik op een kaart om de demo live te starten
            </p>
          </div>

          {/* Perspectief 1: Adoptant */}
          <div className="mb-4">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1" style={{ background: 'rgba(248,170,37,0.2)' }} />
              <span className="text-xs font-bold uppercase tracking-widest px-3" style={{ color: '#f8aa25' }}>
                Perspectief adoptant
              </span>
              <div className="h-px flex-1" style={{ background: 'rgba(248,170,37,0.2)' }} />
            </div>
            <div className="grid grid-cols-3 gap-6">
              {demoMomenten.map((demo) => (
                <Link key={demo.nummer} href={demo.link}
                  className="rounded-3xl p-6 block transition-all hover:scale-[1.02] hover:-translate-y-1"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(248,170,37,0.15)' }}>
                  <div className="flex items-start justify-between mb-5">
                    <span className="text-4xl font-black" style={{ color: 'rgba(255,255,255,0.07)' }}>
                      {demo.nummer}
                    </span>
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                      style={{ background: 'rgba(248,170,37,0.1)' }}>
                      <span className="material-symbols-outlined text-xl" style={{ color: '#f8aa25', fontVariationSettings: "'FILL' 1" }}>
                        {demo.icon}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{demo.titel}</h3>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {demo.beschrijving}
                  </p>
                  <span className="text-sm font-semibold" style={{ color: '#f8aa25' }}>
                    {demo.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Perspectief 2: Asiel */}
          <div>
            <div className="flex items-center gap-3 mb-5 mt-10">
              <div className="h-px flex-1" style={{ background: 'rgba(226,114,91,0.2)' }} />
              <span className="text-xs font-bold uppercase tracking-widest px-3" style={{ color: '#E2725B' }}>
                Perspectief asiel
              </span>
              <div className="h-px flex-1" style={{ background: 'rgba(226,114,91,0.2)' }} />
            </div>
            <div className="grid grid-cols-3 gap-6">
              {[
                {
                  nummer: '04',
                  icon: 'dashboard',
                  titel: 'CRM dashboard',
                  beschrijving: 'Dieren, adopties, berichten, wachtlijst, pleeggezinnen, rapportages en instellingen — alles in één portaal.',
                  link: '/auth/login?callbackUrl=/admin',
                  label: 'Bekijk dashboard →',
                },
                {
                  nummer: '05',
                  icon: 'family_restroom',
                  titel: 'Wachtlijst & pleeggezinnen',
                  beschrijving: 'Asielen beheren wachtlijsten en pleeggezinnen. Tijdelijke opvang wordt bijgehouden per dier en gezin.',
                  link: '/auth/login?callbackUrl=/admin/wachtlijst',
                  label: 'Bekijk wachtlijst →',
                },
                {
                  nummer: '06',
                  icon: 'mark_chat_unread',
                  titel: 'Berichten & afspraken',
                  beschrijving: 'Alle gesprekken met adoptanten op één plek. Inclusief afspraakdatum en status per dier.',
                  link: '/auth/login?callbackUrl=/admin/berichten',
                  label: 'Bekijk berichten →',
                },
              ].map((demo) => (
                <Link key={demo.nummer} href={demo.link}
                  className="rounded-3xl p-6 block transition-all hover:scale-[1.02] hover:-translate-y-1"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(226,114,91,0.2)' }}>
                  <div className="flex items-start justify-between mb-5">
                    <span className="text-4xl font-black" style={{ color: 'rgba(255,255,255,0.07)' }}>
                      {demo.nummer}
                    </span>
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                      style={{ background: 'rgba(226,114,91,0.1)' }}>
                      <span className="material-symbols-outlined text-xl" style={{ color: '#E2725B', fontVariationSettings: "'FILL' 1" }}>
                        {demo.icon}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{demo.titel}</h3>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    {demo.beschrijving}
                  </p>
                  <span className="text-sm font-semibold" style={{ color: '#E2725B' }}>
                    {demo.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOE HET WERKT ── */}
        <section className="mb-20">
          <h2 className="text-4xl font-extrabold mb-10 text-center">Hoe het werkt</h2>
          <div className="relative">
            {/* Verbindingslijn */}
            <div className="absolute top-10 left-[10%] right-[10%] h-px hidden lg:block"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(248,170,37,0.3), rgba(226,114,91,0.3), transparent)' }} />

            <div className="grid grid-cols-4 gap-6 relative">
              {[
                { stap: '1', icon: 'person_add', titel: 'Aanmelden', tekst: 'Gratis account aanmaken als adoptant' },
                { stap: '2', icon: 'chat', titel: 'Intake', tekst: '10 vragen over jouw leefstijl en wensen' },
                { stap: '3', icon: 'psychology', titel: 'AI matching', tekst: 'Claude berekent scores voor elk dier' },
                { stap: '4', icon: 'home', titel: 'Match gevonden', tekst: 'Contact met asiel, adoptie starten' },
              ].map((item) => (
                <div key={item.stap} className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 relative"
                    style={{ background: 'rgba(248,170,37,0.1)', border: '1px solid rgba(248,170,37,0.2)' }}>
                    <span className="material-symbols-outlined text-3xl" style={{ color: '#f8aa25', fontVariationSettings: "'FILL' 1" }}>
                      {item.icon}
                    </span>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: '#f8aa25', color: '#12122a' }}>
                      {item.stap}
                    </span>
                  </div>
                  <h3 className="font-bold text-white mb-1">{item.titel}</h3>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.tekst}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TECHNOLOGIE ── */}
        <section className="mb-20">
          <h2 className="text-4xl font-extrabold mb-10 text-center">Tech stack</h2>
          <div className="grid grid-cols-3 gap-4">
            {technologie.map((tech) => (
              <div key={tech.naam} className="rounded-2xl px-6 py-4 flex items-center gap-4"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#f8aa25' }} />
                <div>
                  <p className="font-bold text-white text-sm">{tech.naam}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{tech.rol}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CALL TO ACTION ── */}
        <section className="rounded-3xl p-12 text-center mb-16"
          style={{ background: 'linear-gradient(135deg, rgba(248,170,37,0.1), rgba(226,114,91,0.08))', border: '1px solid rgba(248,170,37,0.2)' }}>
          <h2 className="text-4xl font-extrabold mb-4">Klaar voor de demo?</h2>
          <p className="text-base mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Login als testgebruiker en beleef het matching-algoritme live
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth/login?callbackUrl=/intake"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95"
              style={{ background: '#f8aa25', color: '#12122a', boxShadow: '0 8px 40px rgba(248,170,37,0.4)', fontSize: '1rem' }}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
              Start de intake
            </Link>
            <Link href="/auth/login?callbackUrl=/admin"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all hover:bg-white/10"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)', fontSize: '1rem' }}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>domain</span>
              Asiel dashboard
            </Link>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="text-center pb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="material-symbols-outlined text-lg" style={{ color: '#f8aa25', fontVariationSettings: "'FILL' 1" }}>pets</span>
            <span className="font-bold text-white">PootGelukkig</span>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Bedacht door Maya van Munster · Gebouwd door WeAreImpact · 2026
          </p>
        </footer>

      </div>
    </div>
  )
}
