"""C1 regression: the Space entrypoint must not re-open CORS to any origin.

`backend/app.py` used to add a second CORSMiddleware with
`allow_origins=["*"]` + `allow_credentials=True` on top of the restrictive
allowlist in `app.main`. Starlette applies the LAST-added middleware
outermost, so the wildcard won and a preflight from any website was
reflected. This test loads the real composed app from `backend/app.py`
(the Gradio-mounted ASGI app) and checks preflights behaviourally.

NOTE: importing `backend/app.py` imports gradio, whose import-time httpx
setup chokes on this sandbox's bracketed-IPv6 `no_proxy` entries
(`InvalidURL: Invalid port: ':1]'`). The proxy variables are scrubbed for
the import only and restored immediately afterwards.
"""

import importlib.util
import os
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

_PROXY_ENV_VARS = (
    "http_proxy",
    "https_proxy",
    "HTTP_PROXY",
    "HTTPS_PROXY",
    "no_proxy",
    "NO_PROXY",
)


def _load_space_app():
    """Import backend/app.py as a standalone module (it is not the `app`
    package: `import app` would resolve to the `app/` directory)."""
    saved = {}
    for var in _PROXY_ENV_VARS:
        if var in os.environ:
            saved[var] = os.environ.pop(var)
    try:
        app_path = Path(__file__).resolve().parents[2] / "app.py"
        spec = importlib.util.spec_from_file_location("konthora_space_app", app_path)
        assert spec is not None and spec.loader is not None
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module.app
    finally:
        os.environ.update(saved)


@pytest.fixture(scope="module")
def space_client():
    with TestClient(_load_space_app()) as client:
        yield client


def _preflight(client, origin):
    return client.options(
        "/api/v1/tts/jobs",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type,authorization",
        },
    )


def test_foreign_origin_preflight_is_not_reflected(space_client):
    """A preflight from an unlisted origin must NOT get an ACAO echo."""
    response = _preflight(space_client, "https://evil.example.com")
    assert response.headers.get("access-control-allow-origin") != "https://evil.example.com"
    assert "https://evil.example.com" not in response.headers.get(
        "access-control-allow-origin", ""
    )


def test_production_origin_preflight_succeeds(space_client):
    """A preflight from the production site must succeed with its origin."""
    response = _preflight(space_client, "https://konthora.dev.bd")
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "https://konthora.dev.bd"


def test_localhost_dev_origin_preflight_succeeds(space_client):
    """The localhost dev origins in the main.py allowlist keep working."""
    response = _preflight(space_client, "http://localhost:3000")
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"
