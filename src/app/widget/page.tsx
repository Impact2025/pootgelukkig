import WidgetChat from './WidgetChat'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Chat — Samen',
  robots: { index: false, follow: false },
}

// Minimalistische, embeddable chat-widget ("Samen" — 24/7 eerstelijns webassistent).
// Insluiten via: <iframe src="https://<domein>/widget?org=<organisatie-slug>" style="border:0;width:380px;height:560px"></iframe>
export default async function WidgetPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>
}) {
  const { org } = await searchParams

  return (
    <div className="fixed inset-0 bg-white text-[#1E293B] font-display">
      <WidgetChat org={org ?? ''} />
    </div>
  )
}
