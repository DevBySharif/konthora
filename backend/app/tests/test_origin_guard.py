"""C1 follow-up regression: server-side Origin enforcement on /api/v1/*.

The app-level CORS fix (allowlist only in main.py) is not enough live:
the HF Spaces edge answers CORS preflights itself and reflects any
Origin, so CORS headers alone cannot stop a foreign website from calling
the API from a visitor's browser. This middleware enforces the same
allowlist server-side: any /api/v1/* request carrying a non-allowlisted
Origin is rejected with 403 before it reaches the route handler — so it
also cannot burn rate-limit quota or create a job.

Scope: /api/v1/* only, all methods except OPTIONS (preflights belong to
the CORS middleware). No Origin header means a non-browser client:
allowed through. The allowlist is the single source of truth,
settings.cors_origins_list — the same list the CORS middleware uses.
"""

import pytest

from app.core.config import settings
from app.core.origin_guard import is_origin_allowed, normalize_origin
from app.services.job_service import JobService
from app.services.rate_limit_service import RateLimitService

EVIL = "https://evil.example.com"
SITE = "https://konthora.dev.bd"
LOCALHOST = "http://localhost:3000"


# --- Pure helper -----------------------------------------------------------

def test_helper_rejects_foreign_origin():
    assert is_origin_allowed(EVIL) is False


def test_helper_allows_production_site():
    assert is_origin_allowed(SITE) is True


def test_helper_allows_localhost_dev_origin():
    assert is_origin_allowed(LOCALHOST) is True


def test_helper_allows_missing_origin():
    """No Origin header = non-browser client (curl, server-to-server)."""
    assert is_origin_allowed(None) is True
    assert is_origin_allowed("") is True


def test_helper_allows_trailing_slash_variant():
    assert is_origin_allowed(SITE + "/") is True


def test_helper_is_case_insensitive_on_scheme_and_host():
    assert is_origin_allowed("HTTPS://KONTHORA.DEV.BD") is True


def test_helper_rejects_suffix_and_prefix_lookalikes():
    """Exact-match only: subdomains of the site are NOT allowlisted."""
    assert is_origin_allowed("https://konthora.dev.bd.evil.com") is False
    assert is_origin_allowed("https://evilkonthora.dev.bd") is False
    assert is_origin_allowed("https://sub.konthora.dev.bd") is False


def test_normalize_origin_strips_slash_and_case():
    assert normalize_origin("HTTPS://Konthora.Dev.Bd/") == "https://konthora.dev.bd"


def test_helper_uses_the_cors_allowlist_as_single_source_of_truth(monkeypatch):
    """The guard must read settings.cors_origins_list, never a second list."""
    monkeypatch.setattr(settings, "CORS_ORIGINS", "https://only.example.com")
    assert is_origin_allowed("https://only.example.com") is True
    assert is_origin_allowed(SITE) is False


# --- Middleware behaviour (real app via TestClient) ------------------------

def test_evil_origin_get_voices_is_forbidden(client):
    response = client.get("/api/v1/tts/voices", headers={"Origin": EVIL})
    assert response.status_code == 403
    assert response.json()["code"] == "FORBIDDEN_ORIGIN"
    # No catalogue data leaks in the rejection.
    assert "af_heart" not in response.text


def test_evil_origin_post_job_is_forbidden_and_creates_nothing(client):
    response = client.post(
        "/api/v1/tts/jobs",
        json={"text": "Hello world", "voiceId": "af_heart"},
        headers={"Origin": EVIL},
    )
    assert response.status_code == 403
    assert JobService()._jobs == {}


def test_evil_origin_post_does_not_burn_rate_limit_quota(client):
    client.post(
        "/api/v1/tts/jobs",
        json={"text": "Hello world", "voiceId": "af_heart"},
        headers={"Origin": EVIL},
    )
    assert RateLimitService()._request_history == {}


def test_site_origin_get_voices_allowed(client):
    response = client.get("/api/v1/tts/voices", headers={"Origin": SITE})
    assert response.status_code == 200
    assert len(response.json()) > 0


def test_site_origin_post_job_allowed(client):
    response = client.post(
        "/api/v1/tts/jobs",
        json={"text": "Hello world", "voiceId": "af_heart"},
        headers={"Origin": SITE},
    )
    assert response.status_code == 200
    assert "jobId" in response.json()


def test_no_origin_get_allowed(client):
    """curl / server-to-server clients send no Origin: allowed through."""
    response = client.get("/api/v1/tts/voices")
    assert response.status_code == 200


def test_localhost_origin_allowed(client):
    response = client.get("/api/v1/tts/voices", headers={"Origin": LOCALHOST})
    assert response.status_code == 200


def test_trailing_slash_site_origin_allowed(client):
    response = client.get("/api/v1/tts/voices", headers={"Origin": SITE + "/"})
    assert response.status_code == 200


def test_evil_origin_preflight_still_left_to_cors_middleware(client):
    """OPTIONS preflights are the CORS middleware's job, not the guard's:
    an evil preflight gets no ACAO echo (existing C1 behaviour), a site
    preflight still succeeds."""
    evil = client.options(
        "/api/v1/tts/jobs",
        headers={
            "Origin": EVIL,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type,authorization",
        },
    )
    assert evil.headers.get("access-control-allow-origin") != EVIL
    site = client.options(
        "/api/v1/tts/jobs",
        headers={
            "Origin": SITE,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type,authorization",
        },
    )
    assert site.status_code == 200
    assert site.headers.get("access-control-allow-origin") == SITE


def test_evil_origin_non_api_path_not_blocked_by_this_middleware(client):
    """The guard scopes to /api/v1/* only: docs and other non-API paths
    must not 403 on Origin (the Gradio UI and the root are out of scope)."""
    response = client.get("/docs", headers={"Origin": EVIL})
    assert response.status_code == 200


def test_evil_origin_health_is_forbidden(client):
    """/api/v1/health is an API route, so it is enforced too."""
    response = client.get("/api/v1/health", headers={"Origin": EVIL})
    assert response.status_code == 403
