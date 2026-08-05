# Konthora Knowledge Center â€” SEO Architecture Blueprint

---

## 1. Document Status

| Field | Value |
|---|---|
| **Status** | Approved â€” finalized for implementation |
| **Version** | 1.0 |
| **Date** | 2026-08-06 |
| **Scope** | 12â€“24 month SEO authority plan |
| **Owner** | Konthora product team |
| **Applies to** | All Knowledge Center content, URL architecture, internal linking, and programmatic SEO decisions |
| **Live tools covered** | `/text-to-speech`, `/audio-to-text` |

This document is the single source of truth for Knowledge Center architecture decisions. No page, URL, or content cluster may be created outside this blueprint without an intent-owner review.

---

## 2. Purpose

Establish Konthora as the definitive topical authority for:

- Free, private, browser-based English text-to-speech (Kokoro-powered)
- Free, private, browser-based English audio transcription with timestamps (Whisper-powered)

The informational layer is called the **Knowledge Center** â€” not a blog. It has no blog taxonomy, no `/blog/` URL prefix, no post dates as primary content signals. Every page ships as a product-integrated knowledge page with a clear search intent and a live tool conversion path.

---

## 3. Strategic Positioning

**Niche to own:**
Free + private + browser-only + English (US/UK) + genuine captions pipeline for independent creators, students, podcasters, educators, and accessibility-focused users.

**Factual differentiators (verified from backend â€” never contradict in copy):**

| Product | Verified Facts |
|---|---|
| **Text-to-Speech** | 10 voices (6 US, 4 UK; male + female), Kokoro-based neural synthesis, 2,000-character limit per generation, MP3 and WAV output, speed 0.75Ã—â€“1.25Ã—, English only |
| **Transcription** | Accepts MP3, WAV, M4A, AAC, MP4, WebM, MOV; 100 MB file limit; 10-minute duration limit; English (auto-detect routes to English); sentence / paragraph / word timestamp grouping; TXT, SRT, VTT, JSON export; Whisper model |
| **Privacy** | 60-minute automatic deletion of all uploaded files and generated transcripts; TTS text processed in-memory only; no user account required |

**Positioning statement (for entity and pillar pages):**
> Konthora provides browser-based tools for converting text into natural speech and transcribing audio or video with accurate timestamps. No account. No permanent storage. English only.

Do not use "best," "fastest," "most accurate," invented usage figures, or comparisons to named competitors' capabilities unless independently verifiable.

---

## 4. Research Findings

### Search Intent Distribution

- Approximately 70% of relevant queries are informational
- "How/what" questions dominate (â‰ˆ51% of top queries)
- Users expect direct answers in the first sentence, followed by clear sub-heading structure
- Featured snippets, People Also Ask boxes, and AI Overviews reward structured, direct content
- AI assistants (ChatGPT, Perplexity, Google AI Overviews) favour named-entity pages, factual claims, and structured data

### Key Content Signals for AI Search

- Direct answer in the first sentence
- Clear H2/H3/H4 hierarchy
- Verified facts with no invented claims
- Structured data matching visible content
- Named entities with `sameAs` references where verifiable

### Competitive Landscape (Conceptual â€” No Copied Content)

Major incumbents: ElevenLabs, Google Cloud TTS, Azure Speech, OpenAI TTS, Deepgram, AssemblyAI, Whisper tools, Speechify, NaturalReader.

**Gap:** None of these owns clean, factual, definitional entity pages for the shared vocabulary (Kokoro, Whisper, ASR, neural TTS, speech synthesis) with an internal entity graph pointing back to free-to-use tools. This is AI-search and knowledge-graph territory Konthora can occupy while remaining strictly factual.

---

## 5. Topic Clusters

| # | Cluster | Root URL | Status |
|---|---|---|---|
| C1 | Text-to-Speech technology | `/text-to-speech/` | Live tool â€” expand |
| C2 | Speech-to-Text | `/speech-to-text/` | Planned |
| C3 | Entity SEO | `/entity/` | Planned |
| C4 | Voices & Accents | `/voices/` | Planned |
| C5 | Languages | `/languages/` | Planned |
| C6 | Audio & Export Formats | `/formats/` | Planned |
| C7 | Captions & Subtitles | `/captions/` | Planned |
| C8 | Accessibility & Assistive Tech | `/accessibility/` | Planned |
| C9 | Use-Cases & Audiences | `/use-cases/` | Planned |
| C10 | Developers | `/developers/` | Planned |
| C11 | Compare | `/compare/` | Deferred â€” final phase only |
| C12 | Learn (task-based tutorials) | `/learn/` | Planned |
| C13 | Glossary | `/glossary/` | Planned |
| C14 | Documentation | `/documentation/` | Planned |
| C15 | Privacy & Trust | `/privacy/` | Planned |
| C16 | Troubleshooting | Under `/text-to-speech/` + `/speech-to-text/` | Planned |

---

## 6. Pillar Pages

| Pillar | Primary Intent | Notes |
|---|---|---|
| `/` | Homepage â€” all pillars + both tools | Live |
| `/text-to-speech` | TTS tool + TTS-technology pillar | Live â€” hosts C1 children |
| `/audio-to-text` | Transcription tool | Live â€” links to `/speech-to-text/` |
| `/speech-to-text/` | STT technology + how-to hub | Targets "speech to text", "transcribe audio" |
| `/entity/` | Entity SEO hub | Definitional authority for shared vocabulary |
| `/voices/` | Voices and accents catalogue | Verified voice data only |
| `/languages/` | Language scope + roadmap | Only publish for genuinely shipped languages |
| `/formats/` | Audio + export formats reference | |
| `/captions/` | Captions and subtitles | |
| `/accessibility/` | Assistive technology | |
| `/use-cases/` | Audiences + scenarios | |
| `/developers/` | Developer-focused reference | |
| `/compare/` | Comparison hub | Deferred â€” URL reserved, no content until authority phase |
| `/privacy/` | Trust layer (extends live `/privacy-policy`) | |
| `/learn/` | Task-based tutorials (absorbs `/guides/` if used) | |
| `/glossary/` | Term definitions | |
| `/documentation/` | Product and technical reference | |

### Intent Ownership Rules (Anti-Cannibalization)

| Intent type | Owning location |
|---|---|
| Definitional ("what is X") | `/entity/...` for core technology; `/glossary/...` for general terms |
| Topic reference | Topic pillar child (e.g., `/formats/mp3/`, `/voices/us/`, `/captions/srt/`) |
| Task how-to (cross-topic) | `/learn/...` |
| Task how-to (single-topic) | Under the relevant pillar |
| Product / technical reference | `/documentation/...` |
| Audience / scenario | `/use-cases/...` |
| Comparison | `/compare/...` (deferred) |

One keyword. One page. One intent. No exceptions.

---

## 7. Supporting-Page Catalogue

### C1 â€” Text-to-Speech Technology (`/text-to-speech/`)

- `/text-to-speech/` â€” pillar: live tool + technology hub
- `/text-to-speech/neural-text-to-speech/`
- `/text-to-speech/how-does-text-to-speech-work/`
- `/text-to-speech/speech-synthesis/`
- `/text-to-speech/speech-quality/`
- `/text-to-speech/history-of-tts/`
- `/text-to-speech/troubleshooting/` â€” troubleshooting hub
- `/text-to-speech/char-limits/`
- `/text-to-speech/tts-sounds-robotic/`

### C2 â€” Speech-to-Text (`/speech-to-text/`)

- `/speech-to-text/` â€” pillar
- `/speech-to-text/how-to-transcribe-audio/`
- `/speech-to-text/how-to-transcribe-video/`
- `/speech-to-text/timestamps/`
- `/speech-to-text/word-vs-sentence-vs-paragraph/`
- `/speech-to-text/free-speech-to-text/`
- `/speech-to-text/convert-audio-to-text/`
- `/speech-to-text/correct-ai-transcript/`
- `/speech-to-text/how-whisper-transcription-works/`

### C3 â€” Entity SEO (`/entity/`)

- `/entity/` â€” hub
- `/entity/ai-voice/`
- `/entity/neural-text-to-speech/`
- `/entity/speech-synthesis/`
- `/entity/speech-recognition/`
- `/entity/automatic-speech-recognition/`
- `/entity/whisper/`
- `/entity/kokoro/`
- `/entity/english-text-to-speech/`
- `/entity/english-speech-to-text/`

**Overlap rule:** Accessibility, Captions, and Subtitles are owned by their respective pillars. Entity pages link to those pillars as canonical definitions rather than redefining the concepts.

### C4â€“C10 â€” Remaining Clusters

Pillar pages kept per governance. Children to be catalogued during Phase 2â€“3 planning. `/compare/` children defined but **not built until the final authority phase**.

### C12 â€” Learn (`/learn/`)

- `/learn/` â€” hub
- `/learn/create-narrated-video/`
- `/learn/make-podcast-with-ai-voices/`
- `/learn/add-subtitles-to-video/`
- `/learn/study-with-text-to-speech/`
- `/learn/proofread-by-listening/`

### C13 â€” Glossary (`/glossary/`)

- `/glossary/` â€” hub
- Terms: `sample-rate`, `phoneme`, `waveform`, `codec`, `bitrate`, `wer`, `diarization`, `timestamp`, `closed-captioning`, `subtitle`, `screen-reader`, `speech-synthesis`, `neural-network`

### C14 â€” Documentation (`/documentation/`)

- `/documentation/` â€” hub
- `/documentation/format-support/`
- `/documentation/limits/`
- `/documentation/storage-lifecycle/`
- `/documentation/voices/`
- `/documentation/transcript-formats/`
- `/documentation/api/` â€” **future only**, published when a public API exists
- `/documentation/self-host/`

---

## 8. URL Architecture

```
/
â”œâ”€ /text-to-speech                  (LIVE Â· tool + TTS-technology pillar)
â”‚    â”œâ”€ /text-to-speech/neural-text-to-speech/
â”‚    â”œâ”€ /text-to-speech/how-does-text-to-speech-work/
â”‚    â”œâ”€ /text-to-speech/speech-synthesis/
â”‚    â”œâ”€ /text-to-speech/speech-quality/
â”‚    â”œâ”€ /text-to-speech/history-of-tts/
â”‚    â”œâ”€ /text-to-speech/troubleshooting/
â”‚    â”œâ”€ /text-to-speech/char-limits/
â”‚    â””â”€ /text-to-speech/tts-sounds-robotic/
â”œâ”€ /audio-to-text                   (LIVE Â· transcription tool)
â”œâ”€ /speech-to-text/                 (STT pillar)
â”‚    â”œâ”€ /speech-to-text/how-to-transcribe-audio/
â”‚    â”œâ”€ /speech-to-text/how-to-transcribe-video/
â”‚    â”œâ”€ /speech-to-text/timestamps/
â”‚    â”œâ”€ /speech-to-text/word-vs-sentence-vs-paragraph/
â”‚    â”œâ”€ /speech-to-text/free-speech-to-text/
â”‚    â”œâ”€ /speech-to-text/convert-audio-to-text/
â”‚    â”œâ”€ /speech-to-text/correct-ai-transcript/
â”‚    â””â”€ /speech-to-text/how-whisper-transcription-works/
â”œâ”€ /entity/                         (entity hub)
â”‚    â”œâ”€ /entity/ai-voice/
â”‚    â”œâ”€ /entity/neural-text-to-speech/
â”‚    â”œâ”€ /entity/speech-synthesis/
â”‚    â”œâ”€ /entity/speech-recognition/
â”‚    â”œâ”€ /entity/automatic-speech-recognition/
â”‚    â”œâ”€ /entity/whisper/
â”‚    â”œâ”€ /entity/kokoro/
â”‚    â”œâ”€ /entity/english-text-to-speech/
â”‚    â””â”€ /entity/english-speech-to-text/
â”œâ”€ /voices/
â”œâ”€ /languages/
â”œâ”€ /formats/
â”œâ”€ /captions/
â”œâ”€ /accessibility/
â”œâ”€ /use-cases/
â”œâ”€ /developers/
â”œâ”€ /documentation/
â”œâ”€ /learn/
â”œâ”€ /glossary/
â”œâ”€ /privacy/
â””â”€ /compare/                        (URL reserved Â· no content until final phase)
```

**Trailing-slash convention:** Planned Knowledge Center URLs use a trailing slash. The two live tool routes (`/text-to-speech`, `/audio-to-text`) do not currently use a trailing slash and must not be changed without a redirect audit.

---

## 9. Intent and Keyword Ownership Rules

Every page must be assigned one, and only one, primary keyword and one primary search intent before writing begins.

| Rule | Description |
|---|---|
| One keyword owner | No two pages may share a primary target keyword |
| One intent per page | Definitional, task, topic-reference, or audience â€” never mixed |
| No duplicate intent | If intent is already covered, extend the existing page |
| No ambiguous ownership | When a concept spans clusters, the entity cluster owns the definition; the pillar owns the practical how-to |
| Tool conversion | Every meaningful page must link to a relevant live tool (`/text-to-speech` or `/audio-to-text`) |

---

## 10. Internal-Linking Map

```
Homepage (/)
  â”‚
  â”œâ”€â”€ /text-to-speech â”€â”€ TTS-tech children â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ /entity/neural-tts
  â”‚        â”‚                                            /entity/speech-synthesis
  â”‚        â”‚                                            /entity/kokoro
  â”‚        â””â”€â”€ /text-to-speech/troubleshooting/
  â”‚
  â”œâ”€â”€ /audio-to-text â”€â”€ /speech-to-text/ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ /captions/
  â”‚        â”‚                â”‚                              /accessibility/
  â”‚        â”‚                â”œâ”€â”€ timestamps, modes
  â”‚        â”‚                â””â”€â”€ /entity/whisper
  â”‚        â”‚                    /entity/automatic-speech-recognition/
  â”‚        â”‚                    /entity/english-speech-to-text/
  â”‚        â””â”€â”€ /entity/english-speech-to-text/
  â”‚
  â”œâ”€â”€ /entity/ (hub) â”€â”€ all entity pages link:
  â”‚        â”‚              up â†’ /entity/
  â”‚        â”‚              out â†’ 2 sibling entities
  â”‚        â”‚              out â†’ owning pillar/tool
  â”‚
  â”œâ”€â”€ /voices/ â”€â”€ /entity/ai-voice/ â”€â”€ /entity/english-tts/
  â”œâ”€â”€ /formats/ â”€â”€ /entity/codec/ (glossary) â”€â”€ tools
  â”œâ”€â”€ /captions/ â”€â”€ /accessibility/ â”€â”€ /entity/asr/
  â”œâ”€â”€ /learn/ (cross-topic bridge) â”€â”€ tools â”€â”€ relevant pillars
  â”œâ”€â”€ /glossary/ â”€â”€ owning pillar or entity page for every term
  â”œâ”€â”€ /documentation/ â”€â”€ tools â”€â”€ relevant pillars
  â”œâ”€â”€ /use-cases/ â”€â”€ tools + relevant pillars
  â””â”€â”€ /privacy/ â”€â”€ homepage + /documentation/storage-lifecycle/
```

**Zero orphan rule:** Every published page must be reachable from at least one pillar page and from the homepage via no more than three link steps.

---

## 11. Topical Authority Map

```
TEXT â†’ SPEECH                          AUDIO â†’ TEXT
  /text-to-speech (pillar)               /audio-to-text (pillar)
   â”œ neural TTS                           â”œ /speech-to-text/
   â”œ speech synthesis                     â”‚    â”œ timestamps / grouping modes
   â”œ speech quality                       â”‚    â”œ how-to-transcribe-audio
   â”œ Kokoro                               â”‚    â”” Whisper workflow
   â”œ voices (US / UK)                     â”œ /captions/ â”€â”€ /accessibility/
   â”œ formats (MP3 / WAV)                  â”” /entity/whisper/
   â”” troubleshooting                          /entity/asr/

ENTITY GRAPH (hub: /entity/)
  AI Voice â”€ Neural TTS â”€ Speech Synthesis â”€ Kokoro â”€ English TTS
  Speech Recognition â”€ ASR â”€ Whisper â”€ English STT
  â†’ Accessibility Â· Captions Â· Subtitles owned by their pillars
```

---

## 12. Entity SEO Graph

The `/entity/` cluster is the knowledge-graph layer. Each entity page:

- Answers "what is X" as its primary intent
- Is written as a factual TechArticle, not a commercial page
- Links to 2â€“3 sibling entities on the same graph
- Links up to `/entity/` hub
- Links to the owning product pillar (e.g., `/entity/kokoro/` â†’ `/text-to-speech`)
- Links to the live tool wherever applicable
- Carries `TechArticle` + `DefinedTerm` or `SoftwareApplication` schema where verifiable
- Contains no invented capabilities, invented release dates, or unverifiable performance claims

**Entity relationships:**

```
Kokoro â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Neural TTS â”€â”€ Speech Synthesis â”€â”€ AI Voice
                                â”‚
                          English TTS

Whisper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ ASR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Speech Recognition
                          â”‚
                    English STT

Shared concepts: Accessibility, Captions, Subtitles (owned by pillar clusters)
```

---

## 13. Content Priority

### HIGH â€” Launch first

Definitional entity pages and snippet/AI-search targets:

- `/entity/ai-voice/`, `/entity/neural-text-to-speech/`, `/entity/speech-synthesis/`
- `/entity/speech-recognition/`, `/entity/automatic-speech-recognition/`
- `/entity/whisper/`, `/entity/kokoro/`
- `/entity/english-text-to-speech/`, `/entity/english-speech-to-text/`
- `/text-to-speech/` tech children (neural TTS, how-does-it-work, speech synthesis)
- `/speech-to-text/` pillar + how-to-transcribe-audio + timestamps
- `/captions/closed-captions-vs-subtitles/`
- `/voices/` + US/UK child pages
- `/formats/` + MP3-vs-WAV + SRT + VTT
- `/glossary/` core terms
- `/privacy/auto-deletion/`

### MEDIUM â€” Phase 2â€“3

- `/learn/` tutorials
- `/use-cases/` children
- `/accessibility/` children
- Remaining captions and formats children
- `/documentation/limits/`, `/documentation/storage-lifecycle/`
- `/languages/` (only for shipped languages)

### LOW / Deferred

- `/compare/` (all versus / alternatives / best pages)
- Programmatic voice, format, and use-case value pages
- `/documentation/api/` (only when public API exists)

---

## 14. Competition Gaps

Competitors identified (for gap analysis only â€” no content copied):

ElevenLabs, Google Cloud TTS, Azure Speech, OpenAI TTS, Deepgram, AssemblyAI, Whisper-based tools, Speechify, NaturalReader.

**Gap Konthora can own:**
None of these maintain clean, factual, interlinked entity pages for the shared open-source vocabulary (Kokoro, Whisper, ASR, neural TTS, speech synthesis) that simultaneously point to a free, no-account browser tool. This gap is particularly valuable for AI-search citation and knowledge-graph ingestion because it is factual, non-commercial, and structured.

---

## 15. Programmatic SEO Roadmap

**Trigger condition:** Programmatic pages are not built until the editorial foundation (Phases 1â€“4) is indexed, crawlable, and showing measurable impressions on target intents in Google Search Console and Bing Webmaster Tools.

**Order when triggered:**

1. Voices (from verified backend voice catalogue)
2. Formats (from verified backend format support)
3. Use-cases (from audience research)
4. Languages (only for languages actually shipped)
5. Compare matrix â€” last, requires established domain authority

**Quality gate for every programmatic page before indexing:**

- Unique intro sentence â€” not templated boilerplate
- Verified data â€” pulled from backend metadata or verified product facts
- Structured spec section
- FAQ section with real questions (from Search Console PAA data)
- Internal links: up to pillar, lateral to 2 siblings, down to live tool
- Schema matching visible content
- No machine-gun duplicates (no near-identical pages with name substitution only)
- `noindex` applied to pages that fail the gate; re-evaluated after improvement

---

## 16. SEO Risks and Mitigation

| Risk | Mitigation |
|---|---|
| Entity vs pillar cannibalization | Entity pages own definitional intent ("what is"); pillar pages own practical intent ("how to"). Distinct H1, title, and meta description. Entity page is canonical for definitional queries. |
| Tool vs guide cannibalization | Tool page retains canonical for transactional intent; all guide pages link to the tool, never compete with it |
| Duplicate intent | Intent mapping enforced before writing; if intent already covered, extend the existing page |
| Thin / AI filler content | Blocked by Content Governance section; no page ships without real, reviewable, verifiable content |
| Near-duplicate pages | One-slug owner per concept; expand before creating a near-duplicate |
| Weak internal linking | Upward/downward/lateral linking required on every page; orphan audit before each phase gate |
| Index bloat | Quality gate enforced; genuinely thin utility pages receive `noindex`; programmatic pages gated behind editorial performance |
| Unsupported claims | All product facts verified against live backend before publishing; language/voice/format claims must match shipped product |
| Invented entities | No invented ratings, testimonials, usage figures, author names, or credentials |

---

## 17. Publishing Roadmap

### Phase-1 Boundary â€” Mandatory Constraints

> **No 120-page bulk launch. No mass-generated thin pages.**

Phase 1 begins with exactly **10 carefully selected editorial pages**. The following are explicitly deferred until later phases:

- All `/compare/` children (versus, alternatives, best)
- `/documentation/api/` (deferred until a public API exists)
- Language pages for unsupported languages
- Voice pages using unverified data
- All programmatic pages

These constraints are not advisory. They are enforced at the intent-owner review stage.

### Phase Structure

| Phase | Page count | Primary scope | Gate before advancing |
|---|---|---|---|
| **Phase 1** | 10 editorial | Entity core + TTS-tech children + key voices + core formats + captions pillar | See gate checklist below |
| **Phase 2** | 10 editorial | STT pillar + how-to transcribe + timestamps + glossary core + accessibility + privacy | See gate checklist below |
| **Phase 3** | 15 editorial | Learn tutorials + documentation + use-cases + languages (shipped only) | See gate checklist below |
| **Phase 4** | 20 editorial | Use-cases expansion + troubleshooting + documentation expansion | See gate checklist below |
| **Programmatic** | Variable | Voices â†’ Formats â†’ Use-cases â†’ Languages â†’ Compare (last) | After Phase 4 is indexed and performing |

### Phase Gate Checklist

Before advancing from any phase to the next, verify:

- [ ] All published pages are crawlable (no `noindex` applied accidentally)
- [ ] XML sitemap contains the intended URLs
- [ ] Google Search Console has seen (crawled or indexed) the published URLs
- [ ] Bing Webmaster Tools has seen the published URLs
- [ ] Important pages are indexed or showing normal crawl progress
- [ ] No major canonical or duplicate-content problems detected
- [ ] No orphan pages exist
- [ ] No material keyword cannibalization identified
- [ ] Internal-link structure is intact (upward, downward, lateral)
- [ ] Pages show meaningful engagement or impressions on target queries
- [ ] Existing pages have been improved where signals indicate weakness

> Rankings are not guaranteed by following a fixed schedule. Phase advancement is gated on measurable crawl and index health, not on calendar dates.

---

## 18. Content Governance

### Ownership Rules

- **One keyword owner per page.** Every target keyword maps to exactly one page. No two pages may share a primary target keyword.
- **One primary search intent per page.** Each page answers a single, unambiguous intent: definitional, task-based, topic-reference, or audience-specific. Never mix intents.
- **No duplicate intent.** A page is not created if its intent is already covered by an existing page. The existing page is extended instead.
- **No AI filler.** Every page must be factually grounded, written for human readers, and free of inflated or unsupported claims.
- **No placeholder content.** Pages are published only with complete, reviewable, accurate content. No stub sections, no lorem ipsum, no "coming soon" sections on indexed pages.
- **Every page must provide unique, verifiable value.** A new page must offer something not available on existing pages â€” a new question answered, a new audience addressed, a new format or reference.
- **Every page must link upward to its pillar.** No page exists without a visible link to its parent cluster pillar.
- **Every page must link downward where child pages exist.** Pillar pages link to their children. Child pages link to the tool.
- **Every page must link laterally to relevant sibling or entity pages.** At least two lateral links per published page.
- **Every meaningful page must link to a relevant live tool.** `/text-to-speech` or `/audio-to-text` must be reachable from every Knowledge Center page within two clicks.
- **No orphan pages.** Every page must be reachable from at least one pillar and from the homepage via no more than three link steps.
- **Expand before duplicating.** If a page is thin, improve it first. Create a new page only when a genuinely distinct primary keyword and intent exist.
- **Structured data must match visible content.** Schema is only added for claims and structures that appear on the page. No schema for ratings, reviews, or capabilities that are not present.
- **No invented content.** Do not publish invented ratings, testimonials, usage figures, author names, credentials, or product capabilities. Do not target languages, voices, formats, API features, or tools that have not shipped.

### Pre-Publication Checklist

Every future page must pass this checklist before publication:

- [ ] **Intent owner confirmed** â€” primary search intent identified and assigned to this URL only
- [ ] **URL owner confirmed** â€” this slug is not used by any other page (planned or live)
- [ ] **Unique value confirmed** â€” page answers something not already answered by an existing page
- [ ] **Claims verified** â€” all product facts checked against live backend and verified documentation
- [ ] **Internal links defined** â€” upward (pillar), downward (children or tool), lateral (2+ siblings) all present
- [ ] **Tool conversion path defined** â€” live tool reachable within two clicks from this page
- [ ] **Metadata unique** â€” title tag and meta description are unique across the entire site
- [ ] **Schema justified** â€” structured data added only for content that appears visibly on the page
- [ ] **Mobile QA passed** â€” page renders correctly and is usable on mobile viewports
- [ ] **Index / noindex decision made** â€” explicit decision documented; default is index for editorial pages

---

## 19. Publishing Policy

Phased rollout gated on measured crawl, index, and performance signals.

### Phase Targets

| Phase | Pages | Scope |
|---|---|---|
| **Phase 1** | 10 editorial | TTS-tech children + entity core + key voices + core formats + captions |
| **Phase 2** | 10 editorial | STT pillar + how-to-transcribe + timestamps + glossary core + accessibility + privacy |
| **Phase 3** | 15 editorial | Learn tutorials + documentation + use-cases + shipped languages |
| **Phase 4** | 20 editorial | Use-cases expansion + troubleshooting + documentation expansion |
| **Programmatic** | Variable | Triggered only after Phase 4 editorial foundation is indexed and performing |

### Gates

Each phase transition requires the gate checklist from Section 17 to be completed. No phase is advanced on a calendar schedule alone. Performance signals â€” crawl coverage, indexing rate, Search Console impressions on target intents â€” must be present.

### Programmatic Gate

Programmatic SEO (voices, formats, use-cases, languages, compare) is triggered only when:

1. All Phase 1â€“4 editorial pages are indexed
2. At least a subset of editorial pages are showing Search Console impressions on their target intent queries
3. No material cannibalization or duplicate-content issues exist in the editorial layer
4. Each proposed programmatic page passes the uniqueness and usefulness quality gate defined in Section 15

The `/compare/` cluster is the last to be built, after domain authority and link equity are established.

---

## 20. Content Refresh Policy

### 90-Day Review Cycle

Priority pages (HIGH from Section 13) are reviewed every 90 days. Lower-priority pages are reviewed based on performance signals and product changes.

### What to Check on Every Review

- [ ] Product limits are accurate (character limit, file size, duration, formats, voices, languages)
- [ ] Supported capabilities match the live product (no claims for unshipped features)
- [ ] Screenshots and workflow examples match the current UI
- [ ] Internal links from this page to newer relevant pages are present
- [ ] Internal links from newer relevant pages back to this page are present
- [ ] FAQ answers are still accurate
- [ ] Title tag and meta description remain unique and accurate
- [ ] Structured data validates and matches visible content
- [ ] Weak introductions have been improved
- [ ] If Search Console shows low impressions: consider title, intro, or intent adjustment
- [ ] If two pages show cannibalization signals: merge or differentiate
- [ ] Pages that cannot be improved after two review cycles are candidates for `noindex`
- [ ] Re-submit or request indexing only when changes are materially substantial

### Merge and Removal Policy

- If search intent overlaps significantly with a sibling page and both are underperforming: merge into the stronger page, redirect the weaker slug
- If a page is genuinely too thin to be useful and cannot be improved: apply `noindex` pending improvement or removal
- Removal requires a redirect to the nearest relevant page â€” never a dead link

---

## 21. Schema Opportunities

| Schema type | Applicable locations |
|---|---|
| `WebApplication` / `SoftwareApplication` | `/text-to-speech`, `/audio-to-text` (live tools) |
| `FAQPage` | Any page with a structured FAQ section |
| `HowTo` | How-to task pages under `/speech-to-text/` and `/learn/` |
| `Article` + `Person` (`sameAs`) | Editorial Knowledge Center pages where an attributed author exists |
| `TechArticle` | Entity pages, documentation pages |
| `BreadcrumbList` | All Knowledge Center pages |
| `DefinedTerm` | Glossary term pages |
| `SoftwareApplication` | `/entity/whisper/`, `/entity/kokoro/` (open-source tools) |
| `ItemList` | Catalogue pages (voices, formats, use-cases index) |
| `Dataset` | Future: programmatic data pages where applicable |
| `Organization` + `WebSite` | Homepage only â€” when verifiable |
| `Speakable` | Future: when audio rendering is confirmed in target channels |

**Schema rule:** Only add schema for content that is visibly present on the page. No schema for ratings, reviews, or capabilities not shown to the user.

---

## 22. Measurement and Expansion Gates

### Signals to Track

| Signal | Tool | Gate threshold |
|---|---|---|
| Pages crawled | Google Search Console â†’ Coverage | All published pages crawled |
| Pages indexed | Google Search Console â†’ Coverage | No unexpected exclusions |
| Impressions on target intents | Google Search Console â†’ Performance | At least some impressions before phase advance |
| Bing crawl coverage | Bing Webmaster Tools | All published pages discovered |
| Cannibalization | Search Console query overlap | No two pages ranking for the same primary query |
| Internal link health | Site audit / manual review | No orphan pages |
| Core Web Vitals | Search Console / PageSpeed Insights | Pass threshold before large-scale programmatic launch |

### Expansion Decision

A new cluster or sub-cluster is only approved for expansion when:

- Existing pages in the cluster are indexed and showing engagement
- A genuine content gap exists (new question not answered)
- The intent is not already owned by an existing page
- The pre-publication checklist in Section 18 is completed

---

## 23. Deferred Work

The following are explicitly deferred and must not be built until conditions are met:

| Deferred item | Condition to unblock |
|---|---|
| `/compare/` cluster (all versus / alternatives / best pages) | Domain authority established; editorial foundation indexed and ranking |
| `/documentation/api/` | Public API exists and is documented |
| Language pages beyond English | Additional languages actually shipped in the product |
| Voice pages beyond current 10-voice catalogue | New voices shipped and verified in backend |
| Programmatic pages (any cluster) | Editorial foundation indexed and performing (Phases 1â€“4 complete) |
| Speaker diarization content | Feature shipped |
| Multi-language transcription content | Feature shipped |
| Live microphone recording content | Feature shipped |

---

## 24. Final Implementation Principles

1. **Knowledge Center, not blog.** No `/blog/` URLs. No blog taxonomy. No post dates as primary content signals.
2. **English only at launch.** All content and product claims apply to English-language audio and text only. Do not imply other language support.
3. **Factual at all times.** Every product claim must be verifiable from the live backend. No invented usage figures, ratings, performance benchmarks, or author credentials.
4. **One page, one intent.** The pre-publication checklist enforces this. It is not optional.
5. **Tools are the destination.** Every Knowledge Center page exists to answer a question and convert the reader to a live tool user. Conversion paths are required, not optional.
6. **Privacy as a feature.** The 60-minute auto-deletion and no-account architecture are genuine differentiators. State them factually, once, in the right place.
7. **Build slowly, build right.** Ten pages done properly outperform one hundred thin pages. The programmatic layer is earned, not presumed.
8. **Measure before expanding.** No new cluster is opened without evidence that the existing editorial layer is working.
9. **No orphan pages, ever.** If a page cannot be linked to from at least one pillar, it should not exist.
10. **Refresh beats rebuild.** An improved existing page almost always outperforms a new page targeting a similar intent.

---

*Blueprint finalized: 2026-08-06. No pages created. This document is the approved Knowledge Center SEO architecture for the next 12â€“24 months. Implementation begins with Phase 1 editorial pages after this document is committed.*
