#!/usr/bin/env python3
"""PootGelukkig email helper — POP3 lezen & SMTP versturen.

Gebruik:
    python3 mail.py inbox           # Toon laatste 10 berichten
    python3 mail.py inbox --all     # Toon alle berichten
    python3 mail.py read <nr>       # Lees bericht #N
    python3 mail.py send <nr>       # Reply op bericht #N (vraagt input)
    python3 mail.py compose         # Nieuw bericht schrijven (vraagt input)
"""

import os
import poplib
import smtplib
import email
from email.message import EmailMessage
from email.header import decode_header
from email.utils import parsedate_to_datetime
import getpass
import argparse

# ── Laad credentials uit .env ─────────────────────────────────────────────
ENV_PATH = os.path.expanduser("~/AppData/Local/hermes/.env.pootgelukkig-mail")
ENV_VARS = {}
if os.path.exists(ENV_PATH):
    with open(ENV_PATH) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                ENV_VARS[k.strip()] = v.strip()

EMAIL = ENV_VARS.get("MAIL_USERNAME", "hallo@pootgelukkig.nl")
PASSWORD = ENV_VARS.get("MAIL_PASSWORD", "")
POP3_SERVER = ENV_VARS.get("MAIL_SERVER", "mail.pootgelukkig.nl")
POP3_PORT = int(ENV_VARS.get("MAIL_POP3_PORT", "110"))
SMTP_SERVER = ENV_VARS.get("MAIL_SERVER", "mail.pootgelukkig.nl")
SMTP_PORT = int(ENV_VARS.get("MAIL_SMTP_PORT", "587"))

def decode_mime(s):
    """Decode MIME-encoded headers naar leesbare tekst."""
    if not s:
        return ""
    parts = decode_header(s)
    result = []
    for part, charset in parts:
        if isinstance(part, bytes):
            try:
                result.append(part.decode(charset or "utf-8", errors="replace"))
            except:
                result.append(part.decode("utf-8", errors="replace"))
        else:
            result.append(part)
    return "".join(result)

def get_inbox(limit=10):
    """Haal berichten uit POP3 inbox."""
    try:
        pop = poplib.POP3(POP3_SERVER, POP3_PORT)
        pop.user(EMAIL)
        pop.pass_(PASSWORD)

        count, size = pop.stat()
        if count == 0:
            print("📭 Inbox is leeg.")
            pop.quit()
            return []

        messages = []
        # POP3 nummert 1..N (1 = oudste)
        start = max(1, count - limit + 1) if limit else 1
        for i in range(start, count + 1):
            raw = pop.retr(i)
            msg_bytes = b"\n".join(raw[1])
            msg = email.message_from_bytes(msg_bytes)
            
            subject = decode_mime(msg.get("Subject", "(geen onderwerp)"))
            sender = decode_mime(msg.get("From", "(onbekend)"))
            date = msg.get("Date", "")
            # Parse date for nicer display
            try:
                dt = parsedate_to_datetime(date)
                date_str = dt.strftime("%d-%m-%Y %H:%M")
            except:
                date_str = date[:25] if date else ""

            messages.append({
                "nr": i,
                "from": sender,
                "subject": subject,
                "date": date_str,
                "raw": msg,
            })

        pop.quit()
        return list(reversed(messages))  # nieuwste eerst

    except poplib.error_proto as e:
        print(f"❌ POP3 fout: {e}")
        return []
    except Exception as e:
        print(f"❌ Fout: {e}")
        return []

def read_message(nr):
    """Lees een specifiek bericht en toon de inhoud."""
    try:
        pop = poplib.POP3(POP3_SERVER, POP3_PORT)
        pop.user(EMAIL)
        pop.pass_(PASSWORD)

        count, _ = pop.stat()
        if nr < 1 or nr > count:
            print(f"❌ Bericht #{nr} bestaat niet (total: {count})")
            pop.quit()
            return

        raw = pop.retr(nr)
        msg_bytes = b"\n".join(raw[1])
        msg = email.message_from_bytes(msg_bytes)

        print("=" * 60)
        print(f"Van:    {decode_mime(msg.get('From', ''))}")
        print(f"Aan:    {decode_mime(msg.get('To', ''))}")
        print(f"Datum:  {msg.get('Date', '')[:30]}")
        print(f"Onderw: {decode_mime(msg.get('Subject', '(geen)'))}")
        print("=" * 60)

        # Toon body
        if msg.is_multipart():
            for part in msg.walk():
                ct = part.get_content_type()
                if ct == "text/plain":
                    body = part.get_payload(decode=True)
                    if body:
                        try:
                            charset = part.get_content_charset() or "utf-8"
                            print(body.decode(charset, errors="replace"))
                        except:
                            print(body.decode("utf-8", errors="replace"))
                    break
        else:
            body = msg.get_payload(decode=True)
            if body:
                try:
                    print(body.decode("utf-8", errors="replace"))
                except:
                    print(str(body))

        print("=" * 60)
        pop.quit()
        return msg

    except Exception as e:
        print(f"❌ Fout: {e}")
        return None

def send_reply(nr, reply_text):
    """Reply op bericht #N."""
    try:
        pop = poplib.POP3(POP3_SERVER, POP3_PORT)
        pop.user(EMAIL)
        pop.pass_(PASSWORD)

        count, _ = pop.stat()
        raw = pop.retr(nr)
        msg_bytes = b"\n".join(raw[1])
        orig = email.message_from_bytes(msg_bytes)
        pop.quit()

        orig_subject = decode_mime(orig.get("Subject", ""))
        orig_from = decode_mime(orig.get("Reply-To", "") or orig.get("From", ""))
        orig_msg_id = orig.get("Message-ID", "")

        # Maak reply
        reply = EmailMessage()
        reply["From"] = EMAIL
        reply["To"] = orig_from
        reply["Subject"] = f"Re: {orig_subject}" if not orig_subject.startswith("Re:") else orig_subject
        if orig_msg_id:
            reply["In-Reply-To"] = orig_msg_id
            reply["References"] = orig_msg_id
        reply.set_content(reply_text)

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as smtp:
            smtp.starttls()
            smtp.login(EMAIL, PASSWORD)
            smtp.send_message(reply)

        print(f"✅ Reply verstuurd naar {orig_from}")
        print(f"   Onderwerp: Re: {orig_subject}")
        return True

    except Exception as e:
        print(f"❌ Fout bij reply: {e}")
        return False

def send_new(to, subject, body):
    """Verstuur een nieuw bericht."""
    try:
        msg = EmailMessage()
        msg["From"] = EMAIL
        msg["To"] = to
        msg["Subject"] = subject
        msg.set_content(body)

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as smtp:
            smtp.starttls()
            smtp.login(EMAIL, PASSWORD)
            smtp.send_message(msg)

        print(f"✅ Bericht verstuurd naar {to}")
        print(f"   Onderwerp: {subject}")
        return True
    except Exception as e:
        print(f"❌ Fout: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description="PootGelukkig email tool")
    sub = parser.add_subparsers(dest="command")

    # inbox
    p_inbox = sub.add_parser("inbox", help="Toon inbox")
    p_inbox.add_argument("--all", action="store_true", help="Toon alle berichten")
    p_inbox.add_argument("--limit", type=int, default=10, help="Max berichten (default: 10)")

    # read
    p_read = sub.add_parser("read", help="Lees bericht")
    p_read.add_argument("nr", type=int, help="Berichtnummer")

    # reply
    p_reply = sub.add_parser("reply", help="Reply op bericht")
    p_reply.add_argument("nr", type=int, help="Berichtnummer")
    p_reply.add_argument("--text", help="Reply tekst (anders via stdin)")

    # compose
    p_compose = sub.add_parser("compose", help="Nieuw bericht")
    p_compose.add_argument("--to", required=True, help="Ontvanger")
    p_compose.add_argument("--subject", required=True, help="Onderwerp")
    p_compose.add_argument("--body", help="Berichttekst (anders via stdin)")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return

    if args.command == "inbox":
        msgs = get_inbox(limit=None if args.all else args.limit)
        if msgs:
            print(f"\n📬 Inbox ({len(msgs)} berichten):")
            print("-" * 70)
            for m in msgs:
                datum = m["date"][:16] if m["date"] else "??"
                subj = m["subject"][:50] if m["subject"] else "(geen)"
                print(f"  #{m['nr']:<3} {datum} | {m['from'][:40]:<40}")
                print(f"       📝 {subj}")
            print("-" * 70)
            print(f"  Lees: python3 mail.py read <nr>")
            print(f"  Reply: python3 mail.py reply <nr> --text \"...\"")

    elif args.command == "read":
        read_message(args.nr)

    elif args.command == "reply":
        if args.text:
            send_reply(args.nr, args.text)
        else:
            print("📝 Typ je reply (Ctrl+D/Ctrl+Z om te versturen, Ctrl+C om te annuleren):")
            lines = sys.stdin.read()
            if lines.strip():
                send_reply(args.nr, lines.strip())
            else:
                print("Geannuleerd.")

    elif args.command == "compose":
        if args.body:
            send_new(args.to, args.subject, args.body)
        else:
            print(f"📝 Naar: {args.to}")
            print(f"📝 Onderwerp: {args.subject}")
            print("📝 Typ je bericht (Ctrl+D/Ctrl+Z om te versturen, Ctrl+C om te annuleren):")
            lines = sys.stdin.read()
            if lines.strip():
                send_new(args.to, args.subject, lines.strip())
            else:
                print("Geannuleerd.")

if __name__ == "__main__":
    main()
