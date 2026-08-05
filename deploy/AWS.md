# Konthora — AWS Recommendations (cost-aware)

This document describes the **recommended** AWS layout for hosting the Konthora
backend **on a limited budget (≈ USD $100 of AWS credits)**. It is a
reference/planning document only — **no resources are created here**. Follow
[LAUNCH_CHECKLIST.md](../LAUNCH_CHECKLIST.md) and
[DEPLOYMENT.md](../DEPLOYMENT.md) for the actual deployment steps, and the
**benchmark steps in this document before picking an instance**.

> Budget reality: the project has ≈ USD $100 of AWS credits / a limited free
> plan window. Every always-on choice below is costed. **Running a
> compute-optimized instance continuously can exhaust $100 in under a month.**
> Size down, run only when testing, and benchmark before you commit to a shape.

| Reference | Value |
| --- | --- |
| Backend host | AWS EC2 (Ubuntu 24.04 LTS, x86_64) |
| Frontend host | **AWS EC2 (same instance — self-hosted Next.js)** |
| Region (example used throughout) | **`ap-south-1`** (Mumbai — nearest to the `.bd` audience) |
| Compare regions | `ap-south-1`, `ap-southeast-1`, `us-east-1` |

```
                 ┌─────────────────────────────────────────────────────┐
                 │ AWS  ──  single EC2 (validation / MVP)             │
Browser ──┐      │  Public IPv4 ──► Nginx:443 ──► uvicorn:8000        │
          │      │  (api.konthora.dev.bd)                             │
          │      │                                                    │
          │      │  Public IPv4 ──► Nginx:443 ──► Next.js:3000        │
          └────► │  (konthora.dev.bd / www.konthora.dev.bd)           │
                 └─────────────────────────────────────────────────────┘
```

---

## 0. Public IPv4 / Elastic IP — COST CORRECTION

> **A public IPv4 address is billable whether it is attached or unattached.**
> It is **not** free.

- AWS charges **≈ USD $0.005 per hour per public IPv4 address** (attached or
  detached) — approximately **USD $3.65 per month** for one continuously used
  address (before any credit or promotional allowance).
- A **static public IPv4 (Elastic IP)** is still **useful**: it keeps
  `api.konthora.dev.bd` stable across instance stop/start, so you don't have to
  update DNS. **But it consumes credit** (~$3.65/mo) as long as it exists.
- **Recommendation for the credit budget:**
  - Do **not** allocate an Elastic IP at launch unless you are confident the
    box will keep running.
  - Use the **auto-assigned public IPv4** on the instance while it runs
    (billed hourly only while running), OR allocate an Elastic IP and
    **release it** whenever the instance is stopped for more than a couple of
    days.
  - A stopped instance keeps billing EBS + public IPv4; a **released** Elastic
    IP stops the IPv4 charge entirely.
- AWS removes the old "one public IPv4 is free for all accounts with EC2"
  allowance — **assume every IPv4 (attached or not) is paid** and confirm your
  account's credit/promotional allowance in Billing.

---

## 1. Choose an instance tier (benchmark first)

Do **not** default to `c6i.xlarge`. Pick a tier based on measured memory (see
§5 Benchmark). The single uvicorn worker + in-process queue constraint stays:
**1 worker per instance** (`--workers 1` is already enforced).

### Tier A — Low-cost validation (goal: preserve the $100 credit)

| Instance | vCPU | RAM | Notes |
| --- | --- | --- | --- |
| `c7i-flex.large` | 2 | 4 GiB | newest gen, flexible instance |
| `c6i.large` | 2 | 4 GiB | compute-optimized baseline |
| `m7i-flex.large` | 2 | 4 GiB | general purpose, flexible instance |
| `t3.large` | 2 | 8 GiB | burstable, more RAM headroom |
| `t3a.large` | 2 | 8 GiB | AMD burstable, same RAM |

- **Requirements:** ≥ 4 GiB RAM; enough disk for both model caches; **1 TTS
  worker**; **1 transcription worker**; strict queue/rate limits;
  **do not preload both models simultaneously** if memory can't hold them
  (leave `modelReady` lazy); swap only as an emergency safeguard, never as
  normal inference memory.
- ⚠️ **4 GiB may be marginal.** Measured locally (see §5): the app holds both
  models warm at ~1.5 GB, and a transcription job can push FFmpeg + model
  peak toward ~3 GB. On a 4 GiB box that leaves little headroom — **must be
  benchmarked on the actual box, not assumed.**
- **Purpose:** initial deploy, smoke tests, very low traffic, restricted beta.

### Tier B — Recommended MVP (small public launch)

| Instance | vCPU | RAM | Target disk |
| --- | --- | --- | --- |
| `c6i.large`+ / `m6i.large`-class upgraded, or 4 vCPU / 8 GiB equivalent | 4 | 8 GiB | 40–50 GiB gp3 initially |

- Better reliability, limited concurrent traffic.
- ⚠️ **Not credit-efficient.** State clearly: this tier may consume the whole
  USD $100 credit in **roughly one month or less** depending on region, data
  transfer, public IPv4 cost, and usage.

### Tier C — Scale-up (future, paid funding)

| Instance | vCPU | RAM | When |
| --- | --- | --- | --- |
| `c6i.xlarge` / `c7i.xlarge` (or equivalent compute-optimized) | 4 | 8 GiB | real traffic or paid funding exists |

Keep these **as a scale-up option only** — not the default first launch.

---

## 2. Region & pricing guidance

AWS prices vary by region; the nearest region is **not** automatically the
cheapest. Compare **at least**:

| Region (name) | Representative 2 vCPU / 4 GiB (c6i.large) on-demand | Relative cost |
| --- | --- | --- |
| `ap-south-1` (Mumbai) | ≈ $0.085 / hr | lower |
| `us-east-1` (N. Virginia) | ≈ $0.085 / hr | lower |
| `ap-southeast-1` (Singapore) | ≈ $0.098 / hr | higher |

Examples are **illustrative** (refreshed ~Aug 2026 from third-party pricing
feeds, not authoritative). **Confirm live rates in the AWS Pricing Calculator
before launch** — do not treat these as locked.

### Cost model inputs (the six items to verify per region)

For every estimate, record, at minimum:

| Line | What to capture |
| --- | --- |
| Region | e.g. `ap-south-1` |
| Hourly rate source/date | Pricing Calculator URL + date read |
| Compute (730 h) | `hourly_rate × 730` (continuous) — or × actual run hours |
| EBS | `gp3_size_GB × ~$0.08/GB/month` (billed whether running or stopped) |
| Public IPv4 | ~ $0.005/hr ≈ $3.65/mo (billed whether attached or not) |
| Data transfer out | ~ $0.09/GB (first 10 TB, us-east-1-style); varies by region/direction |
| **Total before credits** | sum of the above |

> **Example — `c6i.large` in `ap-south-1`, continuous Linux on-demand:**
> compute ≈ $62/mo (730 × $0.085) + EBS 40 GB ≈ $3.20/mo + public IPv4
> ≈ $3.65/mo + data transfer ≈ $2–5/mo ≈ **~$71–74/mo** before credits.
> Continuous, that exhausts $100 credits in ~1.3 months. Run it **only while
> testing** (e.g. 4 hr/day ≈ 120 hr/mo): compute ≈ $10.20/mo + EBS + IPv4 +
> transfer ≈ ~$19/mo → $100 credits last ≈ **5 months**.

---

## 3. USD $100 Credit Survival Plan

### Scenario 1 — Short validation deployment (most credit-frugal)

- Run the backend **only while actively testing**; **stop the EC2 instance**
  when unused.
- Remember: a stopped instance still bills **EBS** (~$3.20/mo for 40 GB) and
  **public IPv4** (~$3.65/mo) — stop = not free.
- **Release the public IPv4** (auto-assigned or Elastic IP) when you stop for
  several days to drop the ~$3.65/mo charge.
- Use **30–40 GiB gp3** initially ($2.40–3.20/mo).
- Apply **strict guest quotas** (low `TTS_RATE_LIMIT_*` /
  `TRANSCRIPTION_RATE_LIMIT_*`, low per-client concurrency).
- **Monitor daily** credit usage in Cost Explorer.

### Scenario 2 — Continuous low-cost beta

- Use the **smallest benchmarked instance** that can safely run the app
  (Tier A; prefer an 8 GiB `t3`/`t3a` if 4 GiB proves marginal).
- One worker per AI queue; **lazy model loading**; low request/duration limits.
- Expect **reduced speed** (2 vCPU inference is slower).
- Estimate days: `$100 ÷ (monthly_total / 30.4)`. Example — `t3.large`
  (~$0.083/hr ≈ $60/mo compute) + EBS 40 GB ≈ $3.2 + IPv4 ≈ $3.65 + transfer
  ≈ $3 ≈ **~$70/mo** → ≈ **43 days** continuous. Fewer run-hours = longer.

### Scenario 3 — Recommended public production

- Use **4 vCPU / 8 GiB or larger** (Tier B/MVP).
- Be honest: **additional budget will almost certainly be needed before six
  months.** At ~$135–150/mo continuous, $100 credits last ~3 weeks.
- Budget for real funding before a public launch.

> **The $100 credit is not guaranteed to last six months.** Free-plan
> expiration, instance hours, EBS, IPv4 and transfer all consume it.

---

## 4. Systemd limits (see `deploy/systemd/konthora.service`)

- **`MemoryMax`** is raised to `6G` for the recommended 8 GiB box — measured
  app warmth is ~1.5 GB (both models), and a transcription job can push peak to
  ~3 GB. `6G` leaves ~2 GB for Ubuntu, Nginx, FFmpeg and filesystem cache
  (never set it equal to total RAM).
  - On a 4 GiB validation box the physical RAM is the real ceiling regardless
    of `MemoryMax`; keep `6G` (moot) or lower it to `3G` with tuning.
- **`CPUQuota`** is `400%` = 4 vCPU. **Adjust for your instance:** 2 vCPU →
  `200%`, 4 vCPU → `400%`, 8 vCPU → `800%`. A quota higher than the physical
  core count is benign (it does not remove CPU capacity), but set it to match
  so throttling is predictable. See the comments in the unit file.

---

## 5. Benchmark before final instance selection

Final sizing **must** be based on measured memory/CPU/disk, not guesses.
Measure locally first, then re-measure on the EC2 box. There is a helper at
[`deploy/scripts/benchmark_resources.sh`](scripts/benchmark_resources.sh).

To exercise the real models locally (and/or on EC2):

```bash
cd backend
RUN_TTS_INTEGRATION_TESTS=1 RUN_TRANSCRIPTION_INTEGRATION_TESTS=1 \
  .venv/bin/python -m pytest app/tests/test_integration.py \
  app/tests/test_transcription_integration.py -q
# while it runs, capture the table below (see helper script)
```

| Metric | How to measure | Local baseline (this project, Windows, Aug 2026) |
| --- | --- | --- |
| Idle backend RAM | RSS after `app.main` import | ~45 MB |
| RAM before model loading | RSS at first request before any model | ~45 MB |
| RAM after Kokoro load | RSS after first TTS warms model | ~1.37 GB |
| RAM after faster-whisper load | RSS after first transcription warms model | ~1.46 GB |
| Peak RAM during TTS | peak RSS while synthesizing | ~1.4 GB |
| Peak RAM during transcription | peak RSS while transcribing an upload | *measure on EC2* |
| Peak RAM, TTS + transcription overlap | peak RSS while both run | ~1.5 GB (both warm) |
| CPU utilization | `top`/`vmstat` during jobs | *measure on EC2* |
| TTS processing time | job duration for a 2000-char request | *measure on EC2* |
| Transcription real-time factor | media duration ÷ wall time | *measure on EC2* |
| Model cache disk | size of `~/.cache/huggingface`/`HF_HOME` | ~0.8 GB (Kokoro 0.3 GB + Whisper 0.46 GB) |
| Temporary-file peak | peak size of `TTS_STORAGE_ROOT` while ingesting 100 MB | *measure on EC2* |

> If 4 GiB RAM is too tight for a 100 MB upload + whisper decode, reduce
> `TRANSCRIPTION_MAX_FILE_SIZE_MB` (e.g. 50) for the validation tier.

---

## 6. Storage (EBS) — reduced default

**Default: 40 GiB gp3** (encrypted). The frontend also lives on this instance,
so add Node + `.next` to the baseline:

| Consumes disk | Approx |
| --- | --- |
| Ubuntu + Nginx + tools | ~5 GB |
| Python 3.11 + venv | ~4 GB |
| Node.js 22 + node_modules + `.next` build | ~1–2 GB |
| Kokoro + faster-whisper model cache | ~1 GB |
| Temp uploads (100 MB at a time buffering) | 0.5–1 GB |
| Generated audio/transcript files (60-min retention) | <1 GB |
| Logs (rotating, 50 MB × 7) | <1 GB |
| Safety margin + filesystem overhead | remaining |
| **Total comfortable** | **40–45 GB** |

- **40–45 GB gp3** is adequate to start (~$3.20–3.60/mo).
- **80 GB** remains an **optional safer tier**, not the default.
- **Do not undersize temp space** — keep ≥ a few GB free so FFmpeg can decode
  a 100 MB upload alongside the model.
- **Expanding later (no downtime):** increase the volume in the console/CLI
  (`modify-volume`, size change), then grow the filesystem (`sudo growpart
  /dev/nvme0n1 1 && sudo resize2fs /dev/nvme0n1p1`, or `xfs_growfs`).

---

## 7. Security Group rules

Single SG (`konthora-backend`).

### Inbound
| Port | Source | Purpose |
| --- | --- | --- |
| 22 | **your SSH IP only** (`/32`) | SSH/SSM admin |
| 80 | `0.0.0.0/0` | HTTP → HTTPS redirect + Let's Encrypt HTTP-01 |
| 443 | `0.0.0.0/0` | HTTPS API |
| ~~8000~~ | — | **not open** (uvicorn binds 127.0.0.1) |

### Outbound
| Port | Destination | Purpose |
| --- | --- | --- |
| 80/443 | `0.0.0.0/0` | apt, pip, GitHub, Hugging Face, Let's Encrypt |
| 22 | `0.0.0.0/0` | git over SSH (if used) |
| 53 UDP | `0.0.0.0/0` | DNS |

No inbound DB/redis/queue ports — none exist (all state in-process).

---

## 8. IAM recommendations

- The app needs **no** AWS permissions.
- Optional instance profile: `AmazonSSMManagedInstanceCore` (SSM Session
  Manager — no inbound SSH needed, audited; recommended over a `.pem`).
- If you use a key pair: generate in EC2, store in a password manager, never
  commit (`*.pem` git-ignored).
- (Future) dedicated S3 role for backups scoped to a single bucket.
- No production credentials on the box — secrets live in
  `/etc/konthora/konthora.env` (600, root-owned).

---

## 9. Elastic IP (summary)

- Allocating a static Elastic IP keeps DNS stable across stop/start, but it
  bills **~$3.65/mo** whether attached or not.
- For a credit budget: prefer **auto-assigned public IPv4** while running and
  **stop + release** when idle; escalate to an Elastic IP only when you want a
  stable identity for a constantly-running instance.

---

## 10. Estimated monthly cost (examples — verify in Pricing Calculator)

Region used for the examples: **`ap-south-1`**. Rates ~Aug 2026, illustrative.

| Tier | Instance | 730 h compute | EBS | Public IPv4 | Data xfer | Total/mo | $100 credit lasts |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A validation (test-only ~120 h/mo) | `c6i.large` | ~$10 | ~$3.20 (40 GB) | ~$3.65 | ~$2 | **~$19** | **~5 months** |
| A continuous | `t3.large` | ~$60 | ~$3.20 (40 GB) | ~$3.65 | ~$3 | **~$70** | **~43 days** |
| B MVP continuous | `c6i.xlarge`-class | ~$124 | ~$4 (50 GB) | ~$3.65 | ~$8 | **~$140** | **~3 weeks** |
| C scale-up | `c7i.xlarge` | ~$130+ | ~$4–6 (50–80 GB) | ~$3.65 | market | **$140–160+** | **< 3 weeks** |

> **Never treat these as authoritative.** Rebuild them in the AWS Pricing
> Calculator for your chosen region/date before launching.

---

## 11. Free-plan account limitations

- The **AWS Free Plan** ends when **credits are exhausted or the plan
  expiration date is reached** — whichever is first.
- It **may restrict some services** (limited instance hours, no guaranteed
  capacity for compute-heavy instances).
- It does **not** guarantee a compute-heavy instance can run continuously for
  six months (CPU inference is far above the free allowance).
- Continued use after free-plan termination **requires an explicit upgrade to
  the paid plan**.
- Hosting is **not free** merely because credits exist.

---

## 12. Scaling path (future)

1. **Vertical:** grow Tier A → Tier B → Tier C by resizing. Keep 1 worker.
2. **Horizontal behind an ALB:** 2+ EC2 with **sticky sessions** (in-process
   state requires per-client pinning). Terminate TLS at the ALB (ACM).
3. **CloudFront/WAF:** edge caching + DDoS shielding in front of the API.
4. **S3:** move job files/presigned URLs for long-term retention; keep the
   hot cache on the instance.
5. Externalizing the in-process queue for stateless scale is **out of scope**
   for the current single-process architecture.

---

## 13. What was NOT done

- No AWS resources were created (no EC2, no Elastic IP, no Security Group, no
  IAM roles, no DNS, no Budgets). This document is the plan; execution follows
  [LAUNCH_CHECKLIST.md](../LAUNCH_CHECKLIST.md).