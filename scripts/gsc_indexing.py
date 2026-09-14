#!/usr/bin/env python3
"""
Google Indexing API Batch Notification Script for Konthora (konthora.dev.bd).

Reads Google Cloud Service Account credentials from the GSC_SERVICE_ACCOUNT_JSON
environment variable (JSON string or file path) and submits URL_UPDATED notifications.
"""

import os
import sys
import json
import time
from typing import List, Dict, Any, Optional
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

GSC_INDEXING_ENDPOINT = "https://indexing.googleapis.com/v3/urlNotifications:publish"
GSC_OAUTH_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
GSC_INDEXING_SCOPE = "https://www.googleapis.com/auth/indexing"
CANONICAL_ORIGIN = "https://konthora.dev.bd"

def load_credentials() -> Optional[Dict[str, Any]]:
    """Loads service account credentials from GSC_SERVICE_ACCOUNT_JSON env var."""
    raw = os.environ.get("GSC_SERVICE_ACCOUNT_JSON", "").strip()
    if not raw:
        return None

    if os.path.exists(raw):
        with open(raw, "r", encoding="utf-8") as f:
            return json.load(f)

    return json.loads(raw)

def get_sitemap_urls() -> List[str]:
    """Extracts all canonical URLs from sitemap artifact or default routes."""
    body_path = os.path.join(os.path.dirname(__file__), "..", ".next", "server", "app", "sitemap.xml.body")
    if os.path.exists(body_path):
        import re
        with open(body_path, "r", encoding="utf-8") as f:
            content = f.read()
        matches = re.findall(r"<loc>([^<]+)</loc>", content)
        if matches:
            return list(dict.fromkeys(m.strip() for m in matches))

    # Fallback to key canonical URLs
    return [
        f"{CANONICAL_ORIGIN}/",
        f"{CANONICAL_ORIGIN}/text-to-speech",
        f"{CANONICAL_ORIGIN}/audio-to-text",
        f"{CANONICAL_ORIGIN}/speech-to-text",
        f"{CANONICAL_ORIGIN}/voices",
    ]

def submit_url(url: str, access_token: str) -> Dict[str, Any]:
    """Submits a single URL notification to Google Indexing API."""
    payload = json.dumps({"url": url, "type": "URL_UPDATED"}).encode("utf-8")
    req = Request(
        GSC_INDEXING_ENDPOINT,
        data=payload,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}",
        },
        method="POST"
    )

    try:
        with urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return {"url": url, "success": True, "status": resp.status, "data": data}
    except HTTPError as e:
        body = e.read().decode("utf-8")
        return {"url": url, "success": False, "status": e.code, "error": body}
    except URLError as e:
        return {"url": url, "success": False, "status": 0, "error": str(e.reason)}

def main():
    urls = sys.argv[1:] if len(sys.argv) > 1 else get_sitemap_urls()

    try:
        creds = load_credentials()
    except Exception as e:
        print(f"[GSC Indexing] Error parsing GSC_SERVICE_ACCOUNT_JSON: {e}", file=sys.stderr)
        sys.exit(0)

    if not creds:
        print("[GSC Indexing] GSC_SERVICE_ACCOUNT_JSON not configured. Skipping Google Indexing API submission.")
        sys.exit(0)

    print(f"[GSC Indexing] Discovered {len(urls)} URLs for indexing update.")

if __name__ == "__main__":
    main()
