#!/usr/bin/env python3
"""Post a blog article to X/Twitter for PootGelukkig or WeAreImpact.

Usage:
    python3 post-to-x.py --project pootgelukkig --slug hond-adopteren-tips
    python3 post-to-x.py --project weareimpact --title "Mijn blog titel" --url "https://..." --custom "Korte eigen tekst"
"""

import argparse
import os
import sys
import tweepy
from urllib.parse import quote_plus

ENV_PATHS = [
    os.path.expanduser("~/AppData/Local/hermes/.env.weareimpact-x"),
]

def load_env(path):
    """Load a .env file and return a dict."""
    env = {}
    if os.path.exists(path):
        with open(path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    env[k.strip()] = v.strip()
    return env

def get_client():
    """Create an authenticated tweepy client using stored credentials."""
    env = {}
    for p in ENV_PATHS:
        env.update(load_env(p))

    # Also check os.environ for injected env vars
    api_key = env.get("X_API_KEY") or os.environ.get("X_API_KEY")
    api_secret = env.get("X_API_SECRET") or os.environ.get("X_API_SECRET")
    access_token = env.get("X_ACCESS_TOKEN") or os.environ.get("X_ACCESS_TOKEN")
    access_secret = env.get("X_ACCESS_TOKEN_SECRET") or os.environ.get("X_ACCESS_TOKEN_SECRET")

    if not all([api_key, api_secret, access_token, access_secret]):
        print("ERROR: Missing X API credentials. Check ~/AppData/Local/hermes/.env.weareimpact-x")
        sys.exit(1)

    client = tweepy.Client(
        consumer_key=api_key,
        consumer_secret=api_secret,
        access_token=access_token,
        access_token_secret=access_secret,
    )
    return client

def generate_post_text(project: str, title: str = None, url: str = None, slug: str = None, custom: str = None) -> str:
    """Generate an optimized tweet text for the blog post."""
    if custom:
        return custom

    if project == "pootgelukkig":
        if not slug:
            print("ERROR: --slug required for pootgelukkig project")
            sys.exit(1)
        if not title:
            title = slug.replace("-", " ").title()
        base_url = f"https://www.pootgelukkig.nl/blog/{slug}"
        prefix = "🐾 Nieuwe blog:"
    elif project == "weareimpact":
        if not title:
            print("ERROR: --title required for weareimpact project")
            sys.exit(1)
        base_url = url or "https://weareimpact.nl"
        prefix = "📝 Nieuwe blog:"
    else:
        prefix = "📝 Nieuw artikel:"
        base_url = url or slug or ""

    # Keep tweet under 280 chars with room for the URL
    url = base_url
    url_len = len(url) + 1  # +1 for space before URL

    tweet = f"{prefix} {title}"

    # Add teaser if room
    remaining = 280 - len(tweet) - url_len - 5
    if remaining > 20 and title:
        tweet += f"\n\n{title[:remaining]}"

    tweet += f"\n\n{url}"
    return tweet

def post_to_x(text: str) -> bool:
    """Post the text to X/Twitter. Returns True on success."""
    client = get_client()
    try:
        response = client.create_tweet(text=text)
        if response.data and response.data.get("id"):
            tweet_id = response.data["id"]
            print(f"✅ Gepost op X! Tweet ID: {tweet_id}")
            print(f"   https://x.com/Impactmakernl/status/{tweet_id}")
            return True
        else:
            print(f"❌ Fout bij posten: {response}")
            return False
    except tweepy.TweepyException as e:
        print(f"❌ X API fout: {e}")
        # Check for common errors
        err_str = str(e)
        if "duplicate" in err_str.lower():
            print("   → Dit is een duplicate content error — de tweet lijkt al gepost.")
        elif "403" in err_str:
            print("   → 403 Forbidden — check of de app nog toegang heeft tot de account.")
        elif "429" in err_str:
            print("   → Rate limited — wacht 15 minuten en probeer opnieuw.")
        return False

def main():
    parser = argparse.ArgumentParser(description="Post blog to X/Twitter")
    parser.add_argument("--project", choices=["pootgelukkig", "weareimpact"], default="weareimpact",
                        help="Which project's blog")
    parser.add_argument("--slug", help="Blog slug (for URL generation)")
    parser.add_argument("--title", help="Blog title")
    parser.add_argument("--url", help="Full URL (overrides auto-generated URL)")
    parser.add_argument("--custom", help="Custom tweet text (overrides auto-generation)")
    parser.add_argument("--dry-run", action="store_true", help="Print tweet but don't post")
    parser.add_argument("--preview", action="store_true", help="Generate text and print only")

    args = parser.parse_args()

    text = generate_post_text(
        project=args.project,
        title=args.title,
        url=args.url,
        slug=args.slug,
        custom=args.custom,
    )

    print(f"\n📋 Concept tweet ({len(text)} tekens):")
    print("─" * 50)
    print(text)
    print("─" * 50)

    if args.preview or args.dry_run:
        print("\n🔍 Preview mode — niets gepost.")
        return

    if args.custom or args.slug:
        confirm = input("\nPosten naar X? (j/N): ").strip().lower()
        if confirm != "j":
            print("Geannuleerd.")
            return

    post_to_x(text)

if __name__ == "__main__":
    main()
