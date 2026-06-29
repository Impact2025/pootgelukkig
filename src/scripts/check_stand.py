"""Check de stand van de asiel-wervingscampagne."""
import psycopg2
import re
import os

# Read .env.local
db_url = None
with open('D:\\APPS\\Pootgelukkig\\pootgelukkig\\.env.local') as f:
    for line in f:
        line = line.strip()
        if line.startswith('DATABASE_URL='):
            db_url = line.split('=', 1)[1].strip("'\"")
            break

if not db_url:
    print("NO DATABASE_URL found")
    exit(1)

conn = psycopg2.connect(db_url)
cur = conn.cursor()

# Count by wervingStatus
cur.execute("SELECT werving_status, COUNT(*) FROM asielen GROUP BY werving_status ORDER BY COUNT(*) DESC")
print("=== Aantal asielen per status ===")
for row in cur.fetchall():
    print(f"  {row[0] or '(leeg)'}: {row[1]}")

# All asielen details
cur.execute("""
    SELECT id, naam, stad, regio, bron, werving_status,
           email IS NOT NULL as heeft_email,
           telefoon IS NOT NULL as heeft_telefoon
    FROM asielen
    ORDER BY werving_status NULLS FIRST, regio, naam
""")
rows = cur.fetchall()
print(f"\n=== Alle {len(rows)} asielen ===")
print(f"{'ID':>4} {'Status':<18} {'Regio':<16} {'Naam':<30} {'Email':<6} {'Tel':<6}")
print("-"*90)
for r in rows:
    print(f"{r[0]:>4} {str(r[5] or 'onbekend'):<18} {str(r[3] or '-'):<16} {r[1]:<30} {'ja' if r[6] else 'nee':<6} {'ja' if r[7] else 'nee':<6}")

# Check DEMO_VIDEO_URL in .env.local
print("\n=== DEMO_VIDEO_URL check ===")
with open('D:\\APPS\\Pootgelukkig\\pootgelukkig\\.env.local') as f:
    for line in f:
        line = line.strip()
        if line.startswith('DEMO_VIDEO_URL'):
            print(f"  AANWEZIG: {line[:60]}...")
            break
    else:
        print("  NIET AANWEZIG in .env.local — de demo-link in de email valt terug op placeholder!")

# Check whether seed has been run (check for example animals)
cur.execute("SELECT COUNT(*) FROM users")
user_count = cur.fetchone()[0]
cur.execute("SELECT COUNT(*) FROM dieren")
dier_count = cur.fetchone()[0]
print(f"\n=== Seed data ===")
print(f"  Users: {user_count}")
print(f"  Dieren: {dier_count}")

conn.close()
