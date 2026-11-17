"""Server-side Origin enforcement for the Konthora API (C1 follow-up).

Why this exists: the app-level CORS fix (allowlist only in main.py) is
not enough live. The HF Spaces edge answers CORS preflights itself and
reflects any Origin, so CORS headers alone cannot stop a foreign website
from calling the API from a visitor's browser. This guard enforces the
same allowlist server-side, on the actual requests: any /api/v1/* request
carrying a non-allowlisted Origin is rejected with 403 before it reaches
the route handler — so it cannot burn rate-limit quota or create a job.

Rules:
- Scope is /api/v1/* only. The Gradio UI (/gradio/) and the Space root
  (/) are the Space's own interface, not the API, and are untouched.
- OPTIONS preflights are NOT enforced here: they belong to the CORS
  middleware, and live they never even reach the app (the edge answers
  them). A future reader must not "fix" this by adding OPTIONS handling.
- No Origin header means a non-browser client (curl, server-to-server,
  mobile apps): allowed through.
- The allowlist is settings.cors_origins_list — the SAME single source of
  truth the CORS middleware uses. Never hardcode a second list here.
- Origins are compared after normalisation (strip whitespace/trailing
  slash, lowercase) on scheme + host + port, exact match only. A
  subdomain or suffix lookalike (sub.konthora.dev.bd,
  konthora.dev.bd.evil.com) is NOT allowlisted.
"""

from typing import Optional

from app.core.config import settings

API_PREFIX = "/api/v1"


def normalize_origin(origin: str) -> str:
    """Canonical form for comparison: no whitespace, no trailing slash,
    lowercase (scheme and host are case-insensitive)."""
    return origin.strip().rstrip("/").lower()


def is_origin_allowed(origin: Optional[str]) -> bool:
    """True when a request with this Origin header may use the API.

    None/empty means the request carries no Origin header at all — a
    non-browser client — which is allowed through.
    """
    if not origin or not origin.strip():
        return True
    normalized = normalize_origin(origin)
    allowed = {normalize_origin(o) for o in settings.cors_origins_list}
    return normalized in allowed
