import { verstuurMail } from '@/lib/email'
async function test() {
  const r = await verstuurMail({
    naar: 'v.munster@weareimpact.nl',
    onderwerp: '🧪 Test tracking — klik op de link',
    html: '<div style="font-family:sans-serif;padding:32px"><h2>Test tracking</h2><p>Als je deze mail opent en <a href="https://pootgelukkig.nl">hier klikt</a>, zien we dat in Resend.</p></div>',
    meta: { template: 'test-tracking' },
  })
  console.log(JSON.stringify(r))
}
test().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
