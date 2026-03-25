export default function AnimalLoading() {
  return (
    <div className="mobile-container bg-bg-dark animate-pulse">
      {/* Hero skeleton */}
      <div className="relative w-full h-[460px] bg-white/10 rounded-b-3xl" />

      {/* Content skeleton */}
      <div className="px-6 py-8 space-y-8">
        {/* Match analyse */}
        <div className="space-y-3">
          <div className="h-6 w-40 bg-white/10 rounded-lg" />
          <div className="bg-white/5 rounded-2xl p-5 space-y-3">
            <div className="h-4 w-full bg-white/10 rounded" />
            <div className="h-4 w-4/5 bg-white/10 rounded" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-16 bg-white/10 rounded-xl" />
              <div className="h-16 bg-white/10 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <div className="h-6 w-32 bg-white/10 rounded-lg" />
          <div className="flex flex-wrap gap-2">
            {[60, 80, 100, 70].map((w, i) => (
              <div key={i} className="h-8 bg-white/10 rounded-full" style={{ width: w }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
