"""Upload all new blog articles with unique dates from Jan 5 - June 25, 2026."""
import psycopg2
import os

def read_env(path):
    with open(path) as f:
        for line in f:
            line = line.strip()
            if line.startswith('DATABASE_URL='):
                return line.split('=', 1)[1].strip("'\"")
    return None

def read_md(path):
    with open(path, encoding='utf-8') as f:
        return f.read()

DB_URL = read_env('D:\\APPS\\Pootgelukkig\\pootgelukkig\\.env.local')
BASE = 'D:\\APPS\\Pootgelukkig\\pootgelukkig\\src\\scripts'

# Article definitions: (file, title, slug, excerpt, meta_title, meta_desc, keyword, minutes, categorie_slug, date_iso, extra_links)
articles = [
    {
        'file': 'content-werkdruk-asielen.md',
        'title': 'Werkdruk in asielen: cijfers en 5 bewezen oplossingen',
        'slug': 'werkdruk-in-asielen-cijfers-en-5-oplossingen',
        'excerpt': 'De werkdruk in Nederlandse asielen bereikt een kritiek punt. Ontdek de cijfers en 5 oplossingen die direct verlichting geven.',
        'meta_title': 'Werkdruk in asielen: cijfers en 5 oplossingen',
        'meta_desc': 'Werkdruk in asielen: cijfers, oorzaken en 5 bewezen oplossingen. Ontdek hoe digitalisering de administratieve last met 30% verlaagt.',
        'keyword': 'werkdruk in asielen',
        'minutes': 7,
        'cat': 'asielen',
        'date': '2026-03-15',
        'links': '[{"tekst": "Administratieve lasten verlagen", "url": "/blog/administratieve-lasten-verlagen-met-30 procent-in-jouw-asiel"}, {"tekst": "Aan de slag met dashboard", "url": "/kennisbank/dashboard/aan-de-slag-met-je-asiel-dashboard"}, {"tekst": "AI-matchscore lezen", "url": "/kennisbank/matching/de-ai-matchscore-lezen"}, {"tekst": "Hond adopteren gids", "url": "/blog/hond-adopteren-uit-het-asiel-complete-gids"}]',
    },
    {
        'file': 'content-verlatingsangst.md',
        'title': 'Verlatingsangst bij adoptiehonden: herkennen en oplossen',
        'slug': 'verlatingsangst-bij-adoptiehonden-herkennen-en-oplossen',
        'excerpt': 'Verlatingsangst is het meest voorkomende probleem bij adoptiehonden. Herken de signalen en los het stap voor stap op.',
        'meta_title': 'Verlatingsangst bij adoptiehonden: herkennen en oplossen',
        'meta_desc': 'Verlatingsangst bij adoptiehonden: herken de symptomen en los het op met 4 bewezen stappen. Van rustig opbouwen tot een gedragsdeskundige inschakelen.',
        'keyword': 'verlatingsangst hond',
        'minutes': 6,
        'cat': 'adoptanten',
        'date': '2026-04-02',
        'links': '[{"tekst": "Hond adopteren complete gids", "url": "/blog/hond-adopteren-uit-het-asiel-complete-gids"}, {"tekst": "3-3-3 regel", "url": "/kennisbank/thuiskomst/de-eerste-dagen-3-3-3"}, {"tekst": "Nazorg en gezondheid", "url": "/kennisbank/nazorg/de-eerste-dierenartscontrole"}]',
    },
    {
        'file': 'content-senior-kat.md',
        'title': 'Senior kat adopteren: waarom oudere katten de beste keuze zijn',
        'slug': 'senior-kat-adopteren-waarom-ouderen-katten-de-beste-keuze-zijn',
        'excerpt': 'Waarom een senior kat adopteren de beste keuze is: rustig karakter, bekend gedrag, lagere adoptiekosten. Lees waar je op moet letten.',
        'meta_title': 'Senior kat adopteren: waarom oudere katten de beste keuze zijn',
        'meta_desc': 'Senior kat adopteren uit het asiel: ontdek waarom oudere katten rustiger, voorspelbaarder en dankbaarder zijn. Met kostenoverzicht en aandachtspunten.',
        'keyword': 'senior kat adopteren',
        'minutes': 6,
        'cat': 'adoptanten',
        'date': '2026-04-20',
        'links': '[{"tekst": "Kat adopteren complete gids", "url": "/blog/een-kat-adopteren-uit-het-asiel-de-complete-gids-voor-beginners"}, {"tekst": "Kosten asieldier", "url": "/blog/wat-kost-een-huisdier-echt-asiel-vs-fokker"}, {"tekst": "Nazorg en gezondheid", "url": "/kennisbank/nazorg/de-eerste-dierenartscontrole"}]',
    },
    {
        'file': 'content-kinderen-en-asieldier.md',
        'title': 'Kinderen en een asieldier: zo bereid je ze voor',
        'slug': 'kinderen-en-een-asieldier-zo-bereid-je-ze-voor',
        'excerpt': 'Een asieldier in een gezin met kinderen is prachtig, maar vraagt voorbereiding. Tips voor de juiste match, regels en leeftijdstaken.',
        'meta_title': 'Kinderen en een asieldier: zo bereid je ze voor',
        'meta_desc': 'Kinderen en een asieldier: tips voor voorbereiding, de juiste match vinden, leeftijdsgeschikte taken en regels voor de eerste weken.',
        'keyword': 'kinderen en asieldier',
        'minutes': 6,
        'cat': 'adoptanten',
        'date': '2026-05-05',
        'links': '[{"tekst": "Hond adopteren complete gids", "url": "/blog/hond-adopteren-uit-het-asiel-complete-gids"}, {"tekst": "Senior kat adopteren", "url": "/blog/senior-kat-adopteren-waarom-ouderen-katten-de-beste-keuze-zijn"}, {"tekst": "3-3-3 regel", "url": "/kennisbank/thuiskomst/de-eerste-dagen-3-3-3"}]',
    },
    {
        'file': 'content-administratieve-lasten.md',
        'title': 'Administratieve lasten verlagen met 30 procent in jouw asiel',
        'slug': 'administratieve-lasten-verlagen-met-30-procent-in-jouw-asiel',
        'excerpt': 'Administratie vreet tijd in asielen. Ontdek hoe digitalisering 30% tijd bespaart: van automatische intakes tot AI-gedreven dierprofielen.',
        'meta_title': 'Administratieve lasten verlagen in het asiel: 30% besparen',
        'meta_desc': 'Administratieve lasten verlagen in jouw asiel: 4 bewezen stappen die 30% tijd besparen. Van digitale intake tot AI Copilot voor dierprofielen.',
        'keyword': 'administratieve lasten asiel',
        'minutes': 6,
        'cat': 'asielen',
        'date': '2026-05-25',
        'links': '[{"tekst": "Werkdruk in asielen", "url": "/blog/werkdruk-in-asielen-cijfers-en-5-oplossingen"}, {"tekst": "Aan de slag met dashboard", "url": "/kennisbank/dashboard/aan-de-slag-met-je-asiel-dashboard"}, {"tekst": "AI-matchscore lezen", "url": "/kennisbank/matching/de-ai-matchscore-lezen"}]',
    },
]

conn = psycopg2.connect(DB_URL)
cur = conn.cursor()

for a in articles:
    md = read_md(os.path.join(BASE, a['file']))
    slug = a['slug']
    
    cur.execute("SELECT id FROM blog_posts WHERE slug = %s", (slug,))
    existing = cur.fetchone()
    
    if existing:
        print(f"⚠️  Bestaat al: {slug} (id={existing[0]})")
        continue
    
    cur.execute("SELECT id FROM blog_categorieen WHERE slug = %s", (a['cat'],))
    cat_row = cur.fetchone()
    if not cat_row:
        print(f"❌ Categorie {a['cat']} niet gevonden")
        continue
    cat_id = cat_row[0]
    
    cur.execute("""
        INSERT INTO blog_posts (
            titel, slug, inhoud_md, excerpt, cover_url, categorie_id,
            status, meta_title, meta_description, focus_keyword,
            leestijd, interne_links, gepubliceerd_op, aangemaakt_op, bijgewerkt_op
        ) VALUES (%s, %s, %s, %s, NULL, %s,
            'gepubliceerd', %s, %s, %s, %s, %s::jsonb, %s::timestamp, NOW(), NOW())
    """, (
        a['title'], slug, md, a['excerpt'], cat_id,
        a['meta_title'], a['meta_desc'], a['keyword'],
        a['minutes'], a['links'], a['date'] + ' 10:00:00',
    ))
    print(f"✅ {a['title']} — {a['date']}")

conn.commit()
cur.close()
conn.close()
print('\n✅ Alle artikelen ingevoegd!')
