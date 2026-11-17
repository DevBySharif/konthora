"""H3 regression: a spoofed X-Forwarded-For must not choose the rate-limit key.

With TRUST_PROXY_HEADERS=true the old code trusted the FIRST XFF entry
blindly, so any client could send `X-Forwarded-For: <fresh-ip>` and get a
fresh 30/hr (TTS) / 15/hr (transcription) quota on every request.

Fix: when proxy headers are trusted, take the LAST entry of the chain —
each proxy appends the address it received the connection from, so only
the last entry was written by the proxy we directly receive from. A
client can prepend arbitrary entries, but it cannot forge the entry our
own proxy appended. A malformed last entry falls back to the direct peer.
"""

import pytest
from fastapi import Request

from app.core.config import settings
from app.services.rate_limit_service import RateLimitService


def _request(xff=None, peer="203.0.113.9"):
    headers = []
    if xff is not None:
        headers.append((b"x-forwarded-for", xff.encode("latin-1")))
    scope = {
        "type": "http",
        "method": "GET",
        "path": "/",
        "headers": headers,
        "client": (peer, 12345),
    }
    return Request(scope)


@pytest.fixture
def trust_proxy(monkeypatch):
    monkeypatch.setattr(settings, "TRUST_PROXY_HEADERS", True)
    yield


@pytest.fixture
def no_trust_proxy(monkeypatch):
    monkeypatch.setattr(settings, "TRUST_PROXY_HEADERS", False)
    yield


def test_spoofed_first_xff_entry_is_ignored(trust_proxy):
    """XFF 'spoofed, real-client' must key on the real client (last entry)."""
    request = _request(xff="1.2.3.4, 5.6.7.8", peer="203.0.113.9")
    assert RateLimitService().get_client_ip(request) == "5.6.7.8"


def test_single_xff_entry_still_works(trust_proxy):
    """A lone entry is also the last entry, so it is used as-is."""
    request = _request(xff="1.2.3.4", peer="203.0.113.9")
    assert RateLimitService().get_client_ip(request) == "1.2.3.4"


def test_no_xff_falls_back_to_direct_peer(trust_proxy):
    request = _request(xff=None, peer="203.0.113.9")
    assert RateLimitService().get_client_ip(request) == "203.0.113.9"


def test_malformed_last_entry_falls_back_to_direct_peer(trust_proxy):
    """A garbage last entry must not promote an earlier spoofed entry."""
    request = _request(xff="1.2.3.4, not-an-ip", peer="203.0.113.9")
    assert RateLimitService().get_client_ip(request) == "203.0.113.9"


def test_xff_ignored_when_proxy_headers_not_trusted(no_trust_proxy):
    """With TRUST_PROXY_HEADERS=false a spoofed XFF must be ignored."""
    request = _request(xff="1.2.3.4, 5.6.7.8", peer="203.0.113.9")
    assert RateLimitService().get_client_ip(request) == "203.0.113.9"


def test_ipv6_last_entry_accepted(trust_proxy):
    request = _request(xff="1.2.3.4, 2001:db8::1", peer="203.0.113.9")
    assert RateLimitService().get_client_ip(request) == "2001:db8::1"
