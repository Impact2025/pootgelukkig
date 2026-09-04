import { Skeleton } from '@/components/admin/ui'

// Route-niveau skeleton: verschijnt terwijl een admin-pagina zijn data streamt.
export default function AdminLoading() {
  return (
    <div className="mx-auto max-w-6xl p-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-11 w-40 rounded-2xl" />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-[#1E293B]/8 bg-white p-5">
            <Skeleton className="size-10 rounded-xl" />
            <Skeleton className="mt-4 h-8 w-16" />
            <Skeleton className="mt-2 h-3 w-24" />
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#1E293B]/8 bg-white p-6 lg:col-span-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="mt-6 h-28 w-full" />
        </div>
        <div className="space-y-3 rounded-2xl border border-[#1E293B]/8 bg-white p-6">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
