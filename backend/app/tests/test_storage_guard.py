"""Tests for the storage disk-space guard.

The Hugging Face free Space has 50GB of non-persistent disk shared by the model
cache, stored results and in-flight uploads. Without a guard an upload can fill
the disk mid-write, and the resulting ENOSPC surfaces as an opaque failure part
way through a job the user already waited for.
"""
import shutil
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from app.core.exceptions import InsufficientDiskSpaceException
from app.utils.storage import (
    ensure_sufficient_disk_space,
    get_free_space_bytes,
    get_resolved_storage_root,
)


def test_free_space_is_measured_on_the_real_filesystem(tmp_path):
    # Compares against shutil directly rather than asserting a positive value:
    # a nearly full or quota-limited volume can legitimately report 0 free,
    # and the guard's job is to compare, not to guarantee headroom.
    free = get_free_space_bytes(tmp_path)
    assert free >= 0
    assert free == shutil.disk_usage(tmp_path).free


def test_a_full_volume_reports_zero_and_is_rejected(tmp_path, monkeypatch):
    monkeypatch.setenv("TTS_STORAGE_ROOT", str(tmp_path))
    with patch("app.utils.storage.shutil.disk_usage", return_value=MagicMock(free=0)):
        with pytest.raises(InsufficientDiskSpaceException):
            ensure_sufficient_disk_space(1)


def test_free_space_walks_up_when_the_path_does_not_exist_yet(tmp_path):
    missing = tmp_path / "not" / "created" / "yet"
    assert not missing.exists()
    assert get_free_space_bytes(missing) >= 0


def test_a_low_disk_rejects_the_request_with_a_retryable_error(tmp_path, monkeypatch):
    monkeypatch.setenv("TTS_STORAGE_ROOT", str(tmp_path))
    with patch("app.utils.storage.get_free_space_bytes", return_value=10 * 1024 * 1024):
        with pytest.raises(InsufficientDiskSpaceException) as exc:
            ensure_sufficient_disk_space(1 * 1024 * 1024)
    assert exc.value.code == "STORAGE_UNAVAILABLE"
    assert exc.value.status_code == 503


def test_a_healthy_disk_accepts_the_request(tmp_path, monkeypatch):
    monkeypatch.setenv("TTS_STORAGE_ROOT", str(tmp_path))
    with patch("app.utils.storage.get_free_space_bytes", return_value=20 * 1024 * 1024 * 1024):
        ensure_sufficient_disk_space(100 * 1024 * 1024)


def test_an_unmeasurable_disk_never_blocks_a_real_upload(tmp_path, monkeypatch):
    # Returning -1 means statvfs failed. Blocking every upload on an unknown
    # value would take the whole service down for a monitoring problem.
    monkeypatch.setenv("TTS_STORAGE_ROOT", str(tmp_path))
    with patch("app.utils.storage.get_free_space_bytes", return_value=-1):
        ensure_sufficient_disk_space(100 * 1024 * 1024)


def test_a_file_larger_than_the_reserve_is_rejected_even_with_free_space(tmp_path, monkeypatch):
    monkeypatch.setenv("TTS_STORAGE_ROOT", str(tmp_path))
    with patch("app.utils.storage.get_free_space_bytes", return_value=5 * 1024 * 1024 * 1024):
        # 10GB of free space cannot hold a 10GB upload plus the reserve.
        with pytest.raises(InsufficientDiskSpaceException):
            ensure_sufficient_disk_space(10 * 1024 * 1024 * 1024)


def test_disk_is_checked_before_the_queue_slot_is_reserved(client):
    # Ordering matters: rejecting a full disk before reserving a slot avoids
    # taking a slot and then immediately returning it.
    reserve = MagicMock(side_effect=AssertionError("a slot was taken with a full disk"))
    reserve.return_value = _async_true()

    with patch(
        "app.api.v1.transcription.ensure_sufficient_disk_space",
        side_effect=InsufficientDiskSpaceException(),
    ) as guard:
        with patch("app.api.v1.transcription.TranscriptionQueueManager") as qm:
            qm.return_value.reserve_admission_slot = reserve
            response = client.post(
                "/api/v1/transcription/jobs",
                files={"file": ("audio.mp3", _minimal_mp3_bytes(), "audio/mpeg")},
            )

    assert response.status_code == 503
    guard.assert_called_once()
    assert reserve.call_count == 0, (
        "a queue slot must not be taken when the disk is already full"
    )


def test_health_endpoint_still_works_when_the_disk_is_full(client):
    # A full disk must not take down status polling or the capabilities call,
    # otherwise the UI cannot even report why uploads are failing.
    with patch(
        "app.api.v1.transcription.ensure_sufficient_disk_space",
        side_effect=InsufficientDiskSpaceException(),
    ):
        assert client.get("/api/v1/health").status_code == 200
        assert client.get("/api/v1/transcription/capabilities").status_code == 200


async def _async_true(*_args, **_kwargs):
    return True


def _minimal_mp3_bytes() -> bytes:
    return b"ID3\x03\x00\x00\x00\x00\x00\x00" + b"\xff\xfb\x90\x00" + b"\x00" * 512
