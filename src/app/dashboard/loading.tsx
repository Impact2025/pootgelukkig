export default function DashboardLoading() {
  return (
    <div className="mobile-container bg-bg-dark animate-pulse">
      {/* Nav skeleton */}
      <div className="sticky top-0 z-50 border-b border-white/10 px-4 py-4 flex items-center justify-between bg-bg-dark">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-white/10" />
          <div className="space-y-1">
            <div className="h-4 w-28 bg-white/10 rounded-lg" />
            <div className="h-2.5 w-16 bg-white/5 rounded-lg" />
          </div>
        </div>
        <div className="size-10 rounded-full bg-white/10" />
      </div>

      <main className="px-4 pb-32">
        {/* Header skeleton */}
        <div className="pt-8 pb-6 space-y-2">
          <div className="h-8 w-48 bg-white/10 rounded-xl" />
          <div className="h-4 w-64 bg-white/5 rounded-lg" />
        </div>

        {/* Score widget skeleton */}
        <div className="mb-6 bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-3 w-24 bg-white/10 rounded" />
            <div className="h-6 w-40 bg-white/10 rounded-lg" />
            <div className="h-3 w-28 bg-white/5 rounded" />
          </div>
          <div className="size-16 rounded-full bg-white/10" />
        </div>

        {/* Filter chips skeleton */}
        <div className="flex gap-3 mb-6">
          {[80, 60, 60, 60].map((w, i) => (
            <div key={i} className={`h-9 w-${w === 80 ? '28' : '20'} bg-white/10 rounded-xl flex-shrink-0`} style={{ width: w }} />
          ))}
        </div>

        {/* Card skeletons */}
        <div className="space-y-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <div className="h-64 w-full bg-white/10" />
              <div className="p-5 space-y-3">
                <div className="flex justify-between">
                  <div className="space-y-2">
                    <div className="h-7 w-32 bg-white/10 rounded-lg" />
                    <div className="h-4 w-48 bg-white/5 rounded" />
                  </div>
                  <div className="h-8 w-20 bg-white/10 rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-14 bg-white/5 rounded-lg" />
                  <div className="h-14 bg-white/5 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
