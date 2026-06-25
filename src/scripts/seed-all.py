"""Seed blog categories and insert first blog post directly via psycopg2."""
import psycopg2
import os
import re

# Read DATABASE_URL from .env.local
db_url = None
with open('D:\\APPS\\Pootgelukkig\\pootgelukkig\\.env.local') as f:
    for line in f:
        line = line.strip()
        if line.startswith('DATABASE_URL='):
            db_url = line.split('=', 1)[1].strip("'\"")
            break

if not db_url:
    print("❌ DATABASE_URL not found")
    exit(1)

# Read the blog post content
with open('D:\APPS\Pootgelukkig\pootgelukkig\src\scripts\content-hond-adopteren-gids.md') as f:
    inhoud_md = f.read()

conn = psycopg2.connect(db_url)
cur = conn.cursor()

# 1. Seed categories
cats = [
    ('Adoptanten', 'adoptanten'),
    ('Asielen', 'asielen'),
    ('Pootgelukkig', 'pootgelukkig'),
]
for naam, slug in cats:
    cur.execute(
        "INSERT INTO blog_categorieen (naam, slug) VALUES (%s, %s) ON CONFLICT (slug) DO NOTHING",
        (naam, slug)
    )
    print(f"✓ Categorie: {naam}")

conn.commit()

# 2. Get category id
cur.execute("SELECT id FROM blog_categorieen WHERE slug = 'adoptanten'")
cat_id = cur.fetchone()[0]
print(f"✓ Adoptanten ID: {cat_id}")

# 3. Check if blog post exists
slug = 'hond-adopteren-uit-het-asiel-complete-gids'
cur.execute("SELECT id FROM blog_posts WHERE slug = %s", (slug,))
existing = cur.fetchone()

if existing:
    print(f"⚠️  Artikel bestaat al (id: {existing[0]}), skippen")
else:
    cur.execute("""
        INSERT INTO blog_posts (
            titel, slug, inhoud_md, excerpt, cover_url, categorie_id,
            status, meta_title, meta_description, focus_keyword,
            leestijd, interne_links, gepubliceerd_op, aangemaakt_op, bijgewerkt_op
        ) VALUES (
            %s, %s, %s, %s, %s, %s,
            %s, %s, %s, %s,
            %s, %s::jsonb, NOW(), NOW(), NOW()
        )
    """, (
        'Hond adopteren uit het asiel: complete gids 2026',
        slug,
        inhoud_md,
        'Overweeg je een hond adopteren uit het asiel? Complete gids van intake tot nazorg. Ontdek wat het kost, hoe de intake werkt en wat de 3-3-3 regel inhoudt.',
        None,
        cat_id,
        'gepubliceerd',
        'Hond adopteren uit het asiel: complete gids 2026',
        'Een hond adopteren uit het asiel: complete gids met stappenplan, kostenoverzicht en nazorg. Ontdek hoe PootGelukkig jou helpt bij de perfecte match.',
        'hond adopteren uit het asiel',
        10,
        '[{"tekst": "Wat kost een asieldier", "url": "/kennisbank/voorbereiding/wat-kost-een-asieldier"}, {"tekst": "De 3-3-3 regel", "url": "/kennisbank/thuiskomst/de-eerste-dagen-3-3-3"}, {"tekst": "Is adopteren iets voor jou", "url": "/kennisbank/voorbereiding/is-adopteren-iets-voor-jou"}, {"tekst": "Kat adopteren gids", "url": "/blog/een-kat-adopteren-uit-het-asiel-de-complete-gids-voor-beginners"}, {"tekst": "Hoe matching werkt", "url": "/kennisbank/hoe-het-werkt/hoe-werkt-de-matching"}]',
    ))
    conn.commit()
    print(f"✅ Artikel 'Hond adopteren' ingevoegd met slug: {slug}")

# 4. Now fix the existing kat artikel
print("\n--- Kat artikel upgraden ---")
cur.execute("SELECT id, meta_title, cover_url FROM blog_posts WHERE slug = 'een-kat-adopteren-uit-het-asiel-de-complete-gids-voor-beginners'")
kat = cur.fetchone()
if kat:
    kat_id = kat[0]
    # Fix meta_title - remove 2024
    cur.execute(
        "UPDATE blog_posts SET meta_title = 'Kat adopteren uit het asiel: complete gids 2026', leestijd = 8 WHERE id = %s",
        (kat_id,)
    )
    conn.commit()
    print(f"✓ Kat artikel (id: {kat_id}) meta_title en leestijd geüpdatet")
else:
    print("⚠️  Kat artikel niet gevonden in DB")

conn.close()
print("\n✅ Done!")
