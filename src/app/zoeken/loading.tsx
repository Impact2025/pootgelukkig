export default function ZoekenLoading() {
  return (
    <div className="mobile-container bg-bg-dark animate-pulse">
      <div className="sticky top-0 border-b border-white/10 px-4 pt-4 pb-3 bg-bg-dark space-y-3">
        <div className="h-6 w-24 bg-white/10 rounded-lg" />
        <div className="h-10 w-full bg-white/10 rounded-xl" />
        <div className="flex gap-2">
          {[5, 4, 3, 3, 4].map((w, i) => (
            <div key={i} className="h-8 bg-white/10 rounded-xl flex-shrink-0" style={{ width: w * 12 }} />
          ))}
        </div>
      </div>
      <div className="px-4 pt-4 space-y-3">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-0 bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="w-28 h-28 bg-white/10 flex-shrink-0" />
            <div className="p-3 flex-1 space-y-2">
              <div className="h-4 w-24 bg-white/10 rounded" />
              <div className="h-3 w-32 bg-white/5 rounded" />
              <div className="flex gap-1.5">
                <div className="h-5 w-14 bg-white/10 rounded-full" />
                <div className="h-5 w-20 bg-white/10 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
