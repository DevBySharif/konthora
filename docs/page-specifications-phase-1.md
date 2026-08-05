# Konthora Phase 1 â€” Content Specifications

---

## Document Status

| Field | Value |
|---|---|
| **Status** | Approved â€” ready for writing |
| **Version** | 1.0 |
| **Date** | 2026-08-06 |
| **Phase** | Phase 1 (10 editorial pages) |
| **Framework reference** | `docs/editorial-content-framework.md` |
| **Architecture reference** | `docs/knowledge-center-architecture.md` |
| **Owner** | Konthora content team |

These 10 specifications are production-ready briefs. No writing begins until a specification has been reviewed and signed off. Each spec follows the mandatory template from the Editorial Content Framework. All product facts are verified against the live Konthora backend.

---

## Page Selection Rationale

The 10 pages below were selected for Phase 1 on these criteria:

1. **Entity authority first.** Four entity pages establish the knowledge-graph layer and create AI-search citation targets before any other content ships.
2. **No cannibalization.** Every page owns a distinct primary keyword and a distinct search intent. No two pages share a target.
3. **Maximum snippet surface.** Each page targets a query format with a confirmed Featured Snippet or PAA opportunity.
4. **Foundation before depth.** Pillar pages (`/speech-to-text/`, `/captions/`, `/formats/`) are included to create the structural anchors that later supporting pages link up to.
5. **Tool conversion everywhere.** Every page has a clear, short path to a live Konthora tool.

| # | URL | Cluster | Primary keyword |
|---|---|---|---|
| 1 | `/entity/kokoro/` | C3 Entity | kokoro tts |
| 2 | `/entity/whisper/` | C3 Entity | openai whisper |
| 3 | `/entity/neural-text-to-speech/` | C3 Entity | neural text to speech |
| 4 | `/entity/automatic-speech-recognition/` | C3 Entity | automatic speech recognition |
| 5 | `/text-to-speech/how-does-text-to-speech-work/` | C1 TTS | how does text to speech work |
| 6 | `/speech-to-text/` | C2 STT | speech to text |
| 7 | `/speech-to-text/how-to-transcribe-audio/` | C2 STT | how to transcribe audio |
| 8 | `/speech-to-text/timestamps/` | C2 STT | audio transcription timestamps |
| 9 | `/captions/` | C7 Captions | captions vs subtitles |
| 10 | `/formats/` | C6 Formats | audio file formats for transcription |

---

---

# SPECIFICATION 1

## Page Identity

| Field | Value |
|---|---|
| **Page title (H1 draft)** | Kokoro: The Open-Source Neural TTS Model |
| **Proposed URL** | `/entity/kokoro/` |
| **Cluster ownership** | C3 â€” Entity SEO |
| **Pillar parent** | `/entity/` (entity hub) |
| **Phase** | 1 |
| **Specification date** | 2026-08-06 |

---

### 1. Page Objective

Establish Konthora as the most factually complete, human-readable English-language reference for the Kokoro open-source TTS model â€” a named technology that powers Konthora's own tool â€” and route readers who want to use it directly to `/text-to-speech`.

---

### 2. Search Intent

**Primary intent type:** Informational

**Intent in plain English:** The user wants to understand what Kokoro is, how it works, and whether it is worth using as a TTS model.

**Intent conflict check:**
- No other Konthora page targets "kokoro tts" or the Kokoro model as its primary keyword.
- Closest existing page: `/text-to-speech` (live tool â€” targets transactional "text to speech free" intent, not definitional Kokoro intent).
- No conflict.

---

### 3. User Journey Stage

**Stage:** Awareness

**Why this fits:** Users searching "Kokoro TTS" or "what is Kokoro" do not yet know that Konthora uses Kokoro. They may be researchers, developers evaluating models, or creators who encountered the name in a thread or release note.

**What the user already knows:** They have heard the name "Kokoro" in a TTS or open-source context. They want to know what it is.

**What the user will know after reading:** What Kokoro is, how it differs from earlier TTS approaches, what English voices it produces, and that Konthora uses it as a free, no-account browser tool.

---

### 4. Primary Keyword

| Field | Value |
|---|---|
| **Primary keyword** | kokoro tts |
| **Search volume estimate** | 1,000â€“4,000/month global (growing; model released late 2024) |
| **Keyword difficulty** | Lowâ€“Medium (limited authoritative coverage exists) |
| **SERP features** | Featured Snippet opportunity; PAA box present |
| **Current Konthora ranking** | Not ranking |
| **Target position** | 1â€“3 |

**Single ownership confirmed:** No other planned or live Konthora page targets "kokoro tts".

**Secondary keyword targets that will be captured naturally:**
- "what is kokoro tts" (navigational sub-intent)
- "kokoro text to speech model"
- "kokoro neural tts"
- "hexgrad kokoro"
- "kokoro tts voices"

---

### 5. Supporting Keywords

| Supporting keyword | Search intent | Fits naturally |
|---|---|---|
| kokoro text to speech | Informational | Yes â€” primary synonym |
| what is kokoro tts | Informational | Yes â€” definitional sub-query |
| kokoro tts voices | Informational | Yes â€” voice catalogue section |
| kokoro open source tts | Informational | Yes â€” provenance section |
| hexgrad kokoro | Navigational | Yes â€” attribution context |
| kokoro tts english | Informational | Yes â€” language scope section |

---

### 6. Entity Ownership

**Primary entity:** Kokoro (open-source neural TTS model by Hexgrad)

**Entity cluster:** C3 â€” `/entity/`

**Entity relationships:**
- Kokoro â†’ Neural Text-to-Speech (`/entity/neural-text-to-speech/`)
- Kokoro â†’ Speech Synthesis (`/entity/speech-synthesis/`) â€” future
- Kokoro â†’ AI Voice (`/entity/ai-voice/`) â€” future
- Kokoro â†’ English Text-to-Speech (`/entity/english-text-to-speech/`) â€” future

**Entity verification:** Kokoro is a real, publicly released open-source model available on Hugging Face (hexgrad/Kokoro-82M). Repository and model card are the verifiable source. No invented capabilities.

**Lateral links to include:**
- `/entity/neural-text-to-speech/` (sibling entity)
- `/entity/whisper/` (sibling entity â€” the STT counterpart)
- `/text-to-speech` (live tool using Kokoro)

---

### 7. Search Promise

**Query:** "what is kokoro tts" / "kokoro tts"

**Promise the page delivers in the opening paragraph:**
> Kokoro is an open-source, lightweight neural text-to-speech model developed by Hexgrad. It converts written English text into natural-sounding speech using a small neural architecture (82 million parameters) that runs efficiently without requiring GPU hardware. Konthora uses Kokoro to power its free, browser-based text-to-speech tool.

This answer must appear before the first scroll. Everything else on the page supports and extends it.

---

### 8. Conversion Goal

**Primary conversion:** Use the Text-to-Speech tool at `/text-to-speech`

**Conversion path:** This page â†’ CTA button â†’ `/text-to-speech` (1 click)

**Secondary conversion:** Read `/entity/neural-text-to-speech/` to understand the broader technology Kokoro represents.

---

### 9. CTA Strategy

**Primary CTA text:** "Try Kokoro TTS Free â€” No Account Needed"

**Primary CTA destination:** `/text-to-speech`

**Primary CTA placement:** After the opening definition paragraph (top of page); repeated at the end of the page.

**Secondary CTA text:** "Explore Neural Text-to-Speech"

**Secondary CTA destination:** `/entity/neural-text-to-speech/`

**Secondary CTA placement:** Within the "How Kokoro Works" section.

**CTA rules confirmed:**
- CTAs describe a real, live capability â€” Konthora's tool uses Kokoro.
- No CTA promises features that do not exist (voice cloning, multilingual, API).

---

### 10. Required Sections

| # | H2 section title | Purpose | Est. words |
|---|---|---|---|
| 1 | What Is Kokoro? | Core definition â€” snippet target | 100â€“150 |
| 2 | How Kokoro Generates Speech | Technical mechanism â€” HowTo/TechArticle material | 150â€“200 |
| 3 | Kokoro's English Voices | Voice catalogue (factual, from backend) | 100â€“150 |
| 4 | Kokoro vs. Earlier TTS Approaches | Context: why it matters, what changed | 150â€“200 |
| 5 | Using Kokoro Without Installation | Konthora value proposition | 100â€“120 |
| 6 | Frequently Asked Questions | FAQPage schema target | 150â€“200 |

**Total estimated word count:** 750â€“1,020 words

---

### 11. Heading Hierarchy

```
H1: Kokoro: The Open-Source Neural TTS Model

  H2: What Is Kokoro?
    (no H3 needed â€” direct paragraph answer)

  H2: How Kokoro Generates Speech
    H3: Text Normalisation and Phoneme Conversion
    H3: Neural Waveform Generation

  H2: Kokoro's English Voices
    (table of verified voices â€” US and UK, male and female)

  H2: Kokoro vs. Earlier TTS Approaches
    H3: Parametric and Concatenative TTS
    H3: What Neural Synthesis Changed

  H2: Using Kokoro Without Installation
    (Konthora tool context â€” with CTA)

  H2: Frequently Asked Questions
```

**H1 confirmation:** Contains primary entity name. Unique across site. Not a generic title.

---

### 12. FAQ Requirements

**Minimum:** 4 questions | **Maximum:** 6 questions

**Source:** PAA boxes for "Kokoro TTS", developer forum questions, actual model documentation

**Planned FAQ questions:**

1. Is Kokoro TTS free to use?
2. What languages does Kokoro support?
3. How many parameters does the Kokoro model have?
4. Who created Kokoro TTS?
5. What is the difference between Kokoro and other open-source TTS models?

**FAQ rules confirmed:**
- All answers verifiable from Kokoro's Hugging Face model card or Konthora's backend.
- Language question: answer must state English only â€” do not imply multilingual support.
- Parameter count (82M) is verifiable from the model card.

---

### 13. Internal Linking Requirements

**Upward links:**
- Link text: "Explore all AI voice and speech entities" â†’ `/entity/`
- Placement: closing paragraph

**Downward / tool links:**
- `/text-to-speech` â€” CTA after intro + end of page
- Anchor text: "Try Kokoro TTS free on Konthora"

**Lateral links:**
| Destination | Anchor text | Placement |
|---|---|---|
| `/entity/neural-text-to-speech/` | "neural text-to-speech" | Within "How Kokoro Generates Speech" section |
| `/entity/whisper/` | "Whisper â€” Kokoro's transcription counterpart" | Within FAQ or closing section |

**Orphan check:**
- This page will be linked from `/entity/` hub (planned)
- This page will be linked from `/text-to-speech` page (add "Powered by Kokoro" link)

---

### 14. Schema Requirements

| Schema type | Justification | Visible content present |
|---|---|---|
| `BreadcrumbList` | All Knowledge Center pages | Yes â€” Home > Entity Hub > Kokoro |
| `TechArticle` | Factual, technical entity description | Yes |
| `SoftwareApplication` | Kokoro is a named software model | Yes â€” name, description, applicationCategory |
| `FAQPage` | Genuine FAQ section present | Yes |

**Schema rules confirmed:**
- No `aggregateRating` â€” no ratings data exists.
- `SoftwareApplication` schema will name Kokoro, not Konthora's tool (they are separate things).
- All schema validated before publication.

---

### 15. Evidence Requirements

| Claim | Source | Verifiable |
|---|---|---|
| Kokoro is developed by Hexgrad | Hugging Face model card: hexgrad/Kokoro-82M | Yes |
| 82 million parameters | Hugging Face model card | Yes |
| Runs without GPU | Model card / benchmark notes | Yes (verify before writing) |
| Konthora uses Kokoro | Live backend (KokoroService in codebase) | Yes |
| 10 English voices in Konthora | Live backend voice catalogue | Yes |
| Voice names and accents (US/UK) | Live backend | Yes â€” from backend API |
| Speed range 0.75Ã—â€“1.25Ã— | Live backend config | Yes |

---

### 16. Example Requirements

**Number of examples:** 1

**Type:** Text-to-speech output description â€” describe what a sample sentence sounds like when rendered by Kokoro through Konthora, without making unverifiable quality claims.

**Format:** Narrative description of a test run ("When the sentence 'The quick brown foxâ€¦' is entered at normal speed with a US female voice, Kokoro producesâ€¦") â€” not a promise of quality, but a factual description of the output.

**Rule:** Do not claim "natural-sounding" or "human-like" without qualification. Use: "produces speech with smooth prosody and clear consonant articulation" only if verifiable by listening to the tool.

---

### 17. Visual Requirements

| Visual | Purpose | Type | Alt text draft |
|---|---|---|---|
| Voice catalogue table | Show verified US/UK voices | Markdown table | N/A (table) |
| (Optional) Kokoro architecture diagram | Show text â†’ phoneme â†’ waveform flow | Simple text diagram | "Diagram: Kokoro TTS pipeline from text input to audio output" |

**No screenshots of the Konthora UI on this entity page** â€” the entity page describes Kokoro the model, not the Konthora interface. Screenshots belong on the tool page and how-to pages.

---

### 18. Trust Requirements

- [ ] All Kokoro model facts sourced from the official Hugging Face model card
- [ ] "Powered by Kokoro" claim verified against live codebase
- [ ] Voice catalogue verified against live backend API response
- [ ] No performance benchmarks compared to named competitors
- [ ] No invented user counts or quality ratings
- [ ] Privacy claim (60-min auto-delete) not placed on this entity page â€” belongs on `/privacy/` and the tool page

---

### 19. Future Update Checklist

| Trigger | Action |
|---|---|
| Kokoro releases new version | Update parameter count, architecture description, model card link |
| New voices added to Konthora | Update voice catalogue table |
| Language support added to Kokoro | Update language scope section |
| Konthora UI changes | No impact â€” this page does not screenshot the UI |
| 90-day review | Re-verify model card facts; check Search Console impressions |

**First review date (90 days from publication):** Schedule at time of publishing.

---

---

# SPECIFICATION 2

## Page Identity

| Field | Value |
|---|---|
| **Page title (H1 draft)** | Whisper: OpenAI's Open-Source Speech Recognition Model |
| **Proposed URL** | `/entity/whisper/` |
| **Cluster ownership** | C3 â€” Entity SEO |
| **Pillar parent** | `/entity/` (entity hub) |
| **Phase** | 1 |
| **Specification date** | 2026-08-06 |

---

### 1. Page Objective

Become the factual, independently useful reference for the Whisper speech recognition model â€” explaining what it is, how it works, and what its capabilities and limitations are â€” and route readers to Konthora's transcription tool, which uses Whisper.

---

### 2. Search Intent

**Primary intent type:** Informational

**Intent in plain English:** The user wants to understand what Whisper is: its origin, how it transcribes audio, what it can and cannot do, and whether it is worth using.

**Intent conflict check:**
- No other Konthora page targets "openai whisper" or the Whisper model as its primary keyword.
- Closest existing page: `/audio-to-text` (live tool â€” targets "transcribe audio" transactional intent, not model-definition intent).
- No conflict. The STT how-to pages target task queries, not model-definition queries.

---

### 3. User Journey Stage

**Stage:** Awareness

**Why this fits:** Users searching "OpenAI Whisper" or "what is Whisper AI" are researching the model. They may be podcast producers, developers, students, or professionals who heard about Whisper and want to understand it before deciding to use a Whisper-powered tool.

**What the user already knows:** They know "Whisper" is a speech recognition model, likely from OpenAI. They want depth.

**What the user will know after reading:** What Whisper is, how it was trained, what English transcription quality it produces, what its limitations are (hallucination, no speaker labels), and that Konthora provides a free, no-account browser tool powered by Whisper.

---

### 4. Primary Keyword

| Field | Value |
|---|---|
| **Primary keyword** | openai whisper |
| **Search volume estimate** | 12,000â€“30,000/month global |
| **Keyword difficulty** | Mediumâ€“High (OpenAI's own documentation ranks; Wikipedia ranks) |
| **SERP features** | Featured Snippet present; large PAA box; AI Overview present |
| **Current Konthora ranking** | Not ranking |
| **Target position** | 3â€“8 (competitive; entity page plays a long game) |

**Single ownership confirmed:** No other Konthora page targets "openai whisper".

---

### 5. Supporting Keywords

| Supporting keyword | Search intent | Fits naturally |
|---|---|---|
| what is whisper ai | Informational | Yes â€” definitional sub-query |
| whisper speech recognition | Informational | Yes â€” technical description |
| whisper transcription model | Informational | Yes â€” use-case section |
| whisper model accuracy | Informational | Yes â€” limitations section |
| how does whisper work | Informational | Yes â€” mechanism section |
| whisper open source | Informational | Yes â€” provenance section |
| whisper word error rate | Informational | Yes â€” accuracy section (with caveats) |

---

### 6. Entity Ownership

**Primary entity:** Whisper (open-source automatic speech recognition model by OpenAI)

**Entity cluster:** C3 â€” `/entity/`

**Entity relationships:**
- Whisper â†’ Automatic Speech Recognition (`/entity/automatic-speech-recognition/`)
- Whisper â†’ English Speech-to-Text (`/entity/english-speech-to-text/`) â€” future
- Whisper â†’ Kokoro (`/entity/kokoro/`) â€” peer model (TTS counterpart)

**Entity verification:** Whisper is publicly released under an MIT licence on GitHub (openai/whisper). Model cards and the original research paper are verifiable sources.

---

### 7. Search Promise

**Query:** "openai whisper" / "what is whisper ai"

**Promise delivered in opening paragraph:**
> Whisper is an open-source automatic speech recognition model developed by OpenAI and released in 2022. It transcribes spoken audio into text by processing audio as visual spectrograms through a transformer-based neural network. Konthora uses the Whisper small.en model to power its free, browser-based audio transcription tool.

---

### 8. Conversion Goal

**Primary conversion:** Use the Audio-to-Text tool at `/audio-to-text`

**Conversion path:** This page â†’ CTA â†’ `/audio-to-text` (1 click)

**Secondary conversion:** Read `/entity/automatic-speech-recognition/` for broader context.

---

### 9. CTA Strategy

**Primary CTA text:** "Transcribe Audio Free with Whisper â€” No Account Needed"

**Primary CTA destination:** `/audio-to-text`

**Primary CTA placement:** After the opening definition paragraph; repeated at the end.

**Secondary CTA text:** "How Automatic Speech Recognition Works"

**Secondary CTA destination:** `/entity/automatic-speech-recognition/`

**Secondary CTA placement:** Within the "How Whisper Works" section.

---

### 10. Required Sections

| # | H2 section title | Purpose | Est. words |
|---|---|---|---|
| 1 | What Is Whisper? | Core definition â€” snippet target | 100â€“150 |
| 2 | How Whisper Transcribes Audio | Technical mechanism â€” spectrogram â†’ transformer | 150â€“200 |
| 3 | What Whisper Can and Cannot Do | Honest capability and limitation summary | 150â€“200 |
| 4 | Whisper Model Sizes and the small.en Model | Which model Konthora uses and why | 100â€“150 |
| 5 | Using Whisper Without Setup | Konthora free-tool value proposition | 100â€“120 |
| 6 | Frequently Asked Questions | FAQPage schema target | 150â€“200 |

**Total estimated word count:** 750â€“1,020 words

---

### 11. Heading Hierarchy

```
H1: Whisper: OpenAI's Open-Source Speech Recognition Model

  H2: What Is Whisper?

  H2: How Whisper Transcribes Audio
    H3: Converting Audio to Spectrograms
    H3: The Transformer Decoder

  H2: What Whisper Can and Cannot Do
    H3: Strengths
    H3: Known Limitations (Hallucination, No Speaker Labels, English Focus for small.en)

  H2: Whisper Model Sizes and the small.en Model
    (table: tiny / base / small / medium / large â€” describe, do not benchmark against competitors)

  H2: Using Whisper Without Setup

  H2: Frequently Asked Questions
```

---

### 12. FAQ Requirements

**Planned FAQ questions:**

1. Is Whisper free to use?
2. How accurate is Whisper transcription?
3. What languages does Whisper support?
4. What is the difference between Whisper tiny, small, and large?
5. Does Whisper identify different speakers?
6. Can Whisper transcribe video files?

**Critical answer guidance:**
- Language question: Konthora's small.en model is English-only. Whisper's large models support other languages, but Konthora does not expose them. Answer must be clear and not mislead the user into expecting multilingual transcription on Konthora.
- Speaker labels: Whisper does not perform diarization. State this clearly.
- Accuracy: Do not invent WER percentages. Reference the OpenAI research paper if citing benchmarks, and note these are under controlled conditions.

---

### 13. Internal Linking Requirements

**Upward:** "View all speech and voice entities" â†’ `/entity/` (closing paragraph)

**Downward / tool:**
- `/audio-to-text` â€” CTA after intro + end (anchor: "Transcribe audio free with Whisper")

**Lateral:**
| Destination | Anchor text | Placement |
|---|---|---|
| `/entity/automatic-speech-recognition/` | "automatic speech recognition" | In "How Whisper Works" section |
| `/entity/kokoro/` | "Kokoro â€” the TTS model used alongside Whisper on Konthora" | In closing section |
| `/speech-to-text/` | "speech-to-text" | Naturally in the opening or limitation section |

**Orphan check:**
- Will be linked from `/entity/` hub
- Will be linked from `/audio-to-text` ("Powered by Whisper" link)
- Will be linked from `/entity/automatic-speech-recognition/`

---

### 14. Schema Requirements

| Schema type | Justification |
|---|---|
| `BreadcrumbList` | All Knowledge Center pages |
| `TechArticle` | Technical entity description |
| `SoftwareApplication` | Whisper is a named software model |
| `FAQPage` | Genuine FAQ section |

**Note on `SoftwareApplication` for Whisper:**
- `name`: "Whisper"
- `applicationCategory`: "Speech Recognition"
- `author`: Organization â€” OpenAI
- `url`: https://github.com/openai/whisper (verifiable)
- Do not add `aggregateRating`.

---

### 15. Evidence Requirements

| Claim | Source | Verifiable |
|---|---|---|
| Whisper released by OpenAI in 2022 | OpenAI blog post / GitHub | Yes |
| MIT licence | GitHub repository licence file | Yes |
| Transformer architecture | OpenAI Whisper research paper | Yes |
| Model sizes (tiny/base/small/medium/large) | OpenAI model documentation | Yes |
| Konthora uses small.en | Live backend config / transcription_service.py | Yes |
| small.en is English-only | Model card | Yes |
| Whisper does not perform speaker diarization | Model documentation | Yes |
| 100 MB / 10-min limits (Konthora) | Live backend config | Yes |

---

### 16. Example Requirements

**Number of examples:** 1

**Type:** Describe the result of transcribing a realistic short audio clip through Konthora. State the input (e.g., 30-second English speech), the timestamp mode used (sentence), and the output format (SRT). Describe the result factually without quality superlatives.

**Rule:** Must be tested with the live `/audio-to-text` tool before writing. Do not describe features that are not in the current product.

---

### 17. Visual Requirements

| Visual | Purpose | Type | Alt text |
|---|---|---|---|
| Model size comparison table | Show tiny/base/small/medium/large trade-offs | Markdown table | N/A |

No Konthora UI screenshots on this entity page.

---

### 18. Trust Requirements

- [ ] All Whisper facts sourced from OpenAI's research paper or GitHub repository
- [ ] Konthora's use of small.en verified from live backend
- [ ] Hallucination limitation noted honestly â€” not downplayed
- [ ] No invented WER numbers â€” cite paper benchmarks only, with context
- [ ] No claim that Whisper supports languages beyond what Konthora ships

---

### 19. Future Update Checklist

| Trigger | Action |
|---|---|
| OpenAI releases new Whisper version | Update model description; verify if Konthora upgrades |
| Konthora upgrades Whisper model | Update "Whisper Model Sizes" section |
| Diarization added to product | Update limitation section |
| Additional language support | Update language section |
| 90-day review | Re-verify GitHub facts; check Search Console |

---

---

# SPECIFICATION 3

## Page Identity

| Field | Value |
|---|---|
| **Page title (H1 draft)** | Neural Text-to-Speech: How AI Voices Are Generated |
| **Proposed URL** | `/entity/neural-text-to-speech/` |
| **Cluster ownership** | C3 â€” Entity SEO |
| **Pillar parent** | `/entity/` (entity hub) |
| **Phase** | 1 |
| **Specification date** | 2026-08-06 |

---

### 1. Page Objective

Own the definitional search intent for "neural text-to-speech" â€” explaining what it is, how it works, and why it sounds more natural than earlier synthesis approaches â€” and connect readers to Konthora's neural TTS tool.

---

### 2. Search Intent

**Primary intent type:** Informational

**Intent in plain English:** The user wants to understand what neural text-to-speech is and how it differs from older TTS systems.

**Intent conflict check:**
- The pillar child `/text-to-speech/neural-text-to-speech/` exists in the architecture but is planned for a later phase. When it ships, it will target the practical intent ("use neural TTS") while this entity page owns the definitional intent ("what is neural TTS"). Intents are distinct. Document this in the future linking map.
- No current conflict.

---

### 3. User Journey Stage

**Stage:** Awareness

**What the user already knows:** They have seen the term "neural TTS" or "neural text-to-speech" and want to understand what it means technically.

**What the user will know after reading:** The distinction between parametric, concatenative, and neural TTS; what makes neural TTS sound more natural; what Kokoro is as a specific implementation; how to try neural TTS free on Konthora.

---

### 4. Primary Keyword

| Field | Value |
|---|---|
| **Primary keyword** | neural text to speech |
| **Search volume estimate** | 3,000â€“8,000/month global |
| **Keyword difficulty** | Medium |
| **SERP features** | Featured Snippet; PAA; AI Overview |
| **Current Konthora ranking** | Not ranking |
| **Target position** | 1â€“5 |

---

### 5. Supporting Keywords

| Supporting keyword | Fits naturally |
|---|---|
| neural tts | Yes |
| what is neural text to speech | Yes |
| neural speech synthesis | Yes |
| neural tts vs traditional tts | Yes |
| how does neural tts work | Yes |
| ai text to speech | Partially (broader â€” use carefully) |

---

### 6. Entity Ownership

**Primary entity:** Neural Text-to-Speech (the technology category)

**Entity relationships:**
- Neural TTS â†’ Kokoro (`/entity/kokoro/`)
- Neural TTS â†’ Speech Synthesis (`/entity/speech-synthesis/`) â€” future
- Neural TTS â†’ AI Voice (`/entity/ai-voice/`) â€” future

**Definitional authority:** This entity page is the canonical definition of neural TTS on Konthora. The pillar child (`/text-to-speech/neural-text-to-speech/`) will own the practical how-to angle when published.

---

### 7. Search Promise

> Neural text-to-speech (neural TTS) is a method of generating spoken audio from written text using deep learning models â€” specifically neural networks trained on large datasets of human speech. Unlike earlier rule-based or concatenative approaches, neural TTS learns the acoustic patterns of natural speech and can produce output that closely resembles a human voice.

---

### 8. Conversion Goal

**Primary conversion:** Use `/text-to-speech`

**CTA text:** "Try Neural TTS Free â€” Powered by Kokoro"

**CTA placement:** After the definition section; end of page.

---

### 9. Required Sections

| # | H2 section | Purpose | Est. words |
|---|---|---|---|
| 1 | What Is Neural Text-to-Speech? | Definition â€” paragraph snippet target | 100â€“150 |
| 2 | How Neural TTS Generates Speech | Mechanism: training data, neural network, waveform | 150â€“200 |
| 3 | Neural TTS vs. Older Synthesis Methods | Parametric vs. concatenative vs. neural | 150â€“200 |
| 4 | What Neural TTS Sounds Like | Realistic description of output characteristics | 80â€“120 |
| 5 | Neural TTS in Practice: The Kokoro Model | Connect to Konthora's specific implementation | 100â€“130 |
| 6 | Frequently Asked Questions | FAQPage schema | 150â€“200 |

**Total estimated word count:** 730â€“1,000 words

---

### 10. Heading Hierarchy

```
H1: Neural Text-to-Speech: How AI Voices Are Generated

  H2: What Is Neural Text-to-Speech?

  H2: How Neural TTS Generates Speech
    H3: Training on Human Speech Data
    H3: From Text to Waveform

  H2: Neural TTS vs. Older Synthesis Methods
    H3: Concatenative TTS
    H3: Parametric TTS
    H3: What Neural Models Changed

  H2: What Neural TTS Sounds Like

  H2: Neural TTS in Practice: The Kokoro Model

  H2: Frequently Asked Questions
```

---

### 11. FAQ Requirements

1. What is the difference between neural TTS and AI voice?
2. Is neural text-to-speech the same as speech synthesis?
3. How many parameters does a neural TTS model typically use?
4. Can neural TTS replicate any human voice?
5. What are the limitations of neural text-to-speech?

**Limitation answer must be honest:** Neural TTS can hallucinate incorrect prosody on unusual inputs; it cannot replicate a specific person's voice from a short sample without voice cloning (which Konthora does not offer).

---

### 12. Internal Linking Requirements

**Upward:** `/entity/` â€” "Explore the Konthora entity knowledge hub"

**Downward / tool:** `/text-to-speech` â€” "Try neural TTS free"

**Lateral:**
| Destination | Anchor text | Placement |
|---|---|---|
| `/entity/kokoro/` | "Kokoro" | In "Neural TTS in Practice" section |
| `/entity/whisper/` | "Whisper â€” for transcription" | In FAQ or closing |

---

### 13. Schema Requirements

| Schema type | Justification |
|---|---|
| `BreadcrumbList` | All KC pages |
| `TechArticle` | Technical definitional content |
| `DefinedTerm` | Defines "neural text-to-speech" |
| `FAQPage` | Genuine FAQ section |

---

### 14. Evidence Requirements

| Claim | Source |
|---|---|
| Neural TTS uses neural networks trained on speech data | Academic literature / model documentation |
| Produces more natural prosody than concatenative TTS | Verifiable by listening comparison (describe, do not claim superiority) |
| Kokoro is a neural TTS implementation | Kokoro model card (hexgrad/Kokoro-82M) |
| Konthora uses Kokoro | Live backend |

---

### 15. Example Requirements

**1 example:** A concrete comparison â€” describe what the same sentence sounds like when synthesised with a simple rule-based approach (flat, robotic) versus a neural model (natural intonation). Keep this as a descriptive contrast, not a benchmark.

---

### 16. Visual Requirements

| Visual | Type |
|---|---|
| Comparison table: Concatenative vs. Parametric vs. Neural TTS | Markdown table |

---

### 17. Future Update Checklist

| Trigger | Action |
|---|---|
| Major advances in neural TTS | Update mechanism section |
| New Kokoro version | Update "in practice" section |
| Pillar child `/text-to-speech/neural-text-to-speech/` published | Add lateral link from this entity page |
| 90-day review | Verify all claims; check impressions |

---

---

# SPECIFICATION 4

## Page Identity

| Field | Value |
|---|---|
| **Page title (H1 draft)** | Automatic Speech Recognition: How Machines Transcribe Audio |
| **Proposed URL** | `/entity/automatic-speech-recognition/` |
| **Cluster ownership** | C3 â€” Entity SEO |
| **Pillar parent** | `/entity/` (entity hub) |
| **Phase** | 1 |
| **Specification date** | 2026-08-06 |

---

### 1. Page Objective

Own the definitional authority for "automatic speech recognition" â€” the field and technology category that underlies Konthora's transcription tool â€” and establish entity-graph credibility that supports AI-search citation and topical authority for the entire C2/C3 cluster.

---

### 2. Search Intent

**Primary intent type:** Informational

**Intent in plain English:** The user wants to understand what automatic speech recognition is, how it works technically, and what it is used for.

**Intent conflict check:**
- `/entity/whisper/` targets "openai whisper" â€” a specific model within ASR. No conflict: this page defines the field; the Whisper page defines a specific implementation.
- `/speech-to-text/` (Specification 6) targets the task-based query "speech to text" for users who want to transcribe now. This page targets the definitional "what is automatic speech recognition". Intents are distinct.

---

### 3. User Journey Stage

**Stage:** Awareness

**What the user already knows:** They have encountered the term "ASR" or "automatic speech recognition" in a professional or technical context.

**What the user will know after reading:** What ASR is, how it works (acoustic model, language model, decoder), what modern neural ASR has changed, what Whisper represents in this field, and how to try ASR free on Konthora.

---

### 4. Primary Keyword

| Field | Value |
|---|---|
| **Primary keyword** | automatic speech recognition |
| **Search volume estimate** | 8,000â€“20,000/month global |
| **Keyword difficulty** | Mediumâ€“High |
| **SERP features** | Featured Snippet; PAA; AI Overview; Wikipedia ranks |
| **Current Konthora ranking** | Not ranking |
| **Target position** | 4â€“10 (competitive; long-term play) |

---

### 5. Supporting Keywords

| Supporting keyword | Fits naturally |
|---|---|
| what is automatic speech recognition | Yes |
| ASR technology | Yes |
| how does speech recognition work | Yes |
| automatic speech recognition definition | Yes |
| speech recognition AI | Yes |
| ASR vs NLU | Partially (mention in limitations) |

---

### 6. Entity Ownership

**Primary entity:** Automatic Speech Recognition (ASR â€” the technology category)

**Entity relationships:**
- ASR â†’ Whisper (`/entity/whisper/`)
- ASR â†’ Speech Recognition (`/entity/speech-recognition/`) â€” future (differentiate: "speech recognition" is the broad umbrella; "ASR" is the engineering term)
- ASR â†’ English Speech-to-Text (`/entity/english-speech-to-text/`) â€” future

---

### 7. Search Promise

> Automatic speech recognition (ASR) is a technology that converts spoken audio into written text using machine learning models. An ASR system analyses the acoustic properties of audio, matches them against patterns learned from large datasets of speech, and produces a text transcript. Modern ASR systems, including Whisper, use transformer neural networks trained on hundreds of thousands of hours of audio.

---

### 8. Conversion Goal

**Primary conversion:** `/audio-to-text`

**CTA text:** "Transcribe Audio Free â€” Powered by Whisper ASR"

---

### 9. Required Sections

| # | H2 section | Purpose | Est. words |
|---|---|---|---|
| 1 | What Is Automatic Speech Recognition? | Definition â€” snippet target | 100â€“150 |
| 2 | How ASR Systems Work | Three-component model: acoustic, language, decoder | 150â€“200 |
| 3 | From Rules to Neural Networks: The History of ASR | Brief, factual evolution | 120â€“150 |
| 4 | What ASR Can and Cannot Do | Honest capability and limitation | 120â€“150 |
| 5 | ASR in Practice: The Whisper Model | Connect to Konthora's implementation | 80â€“100 |
| 6 | Frequently Asked Questions | FAQPage schema | 150â€“200 |

**Total estimated word count:** 720â€“950 words

---

### 10. Heading Hierarchy

```
H1: Automatic Speech Recognition: How Machines Transcribe Audio

  H2: What Is Automatic Speech Recognition?

  H2: How ASR Systems Work
    H3: The Acoustic Model
    H3: The Language Model
    H3: The Decoder

  H2: From Rules to Neural Networks: The History of ASR

  H2: What ASR Can and Cannot Do

  H2: ASR in Practice: The Whisper Model

  H2: Frequently Asked Questions
```

---

### 11. FAQ Requirements

1. What is the difference between ASR and speech recognition?
2. How accurate is automatic speech recognition?
3. Does ASR work in real time?
4. What affects ASR accuracy?
5. Can ASR transcribe multiple speakers?

**Accuracy answer:** Do not state a specific WER without citing a source and noting the test conditions. State that accuracy varies by audio quality, accent, background noise, and model size.

---

### 12. Internal Linking Requirements

**Upward:** `/entity/`

**Tool:** `/audio-to-text` â€” "Transcribe audio free using Whisper ASR"

**Lateral:**
| Destination | Anchor text | Placement |
|---|---|---|
| `/entity/whisper/` | "Whisper" | In "ASR in Practice" section |
| `/speech-to-text/` | "speech-to-text guide" | In FAQ or intro |

---

### 13. Schema Requirements

| Schema type | Justification |
|---|---|
| `BreadcrumbList` | All KC pages |
| `TechArticle` | Technical definitional content |
| `DefinedTerm` | Defines "automatic speech recognition" |
| `FAQPage` | Genuine FAQ |

---

### 14. Evidence Requirements

| Claim | Source |
|---|---|
| ASR uses acoustic + language models | Academic consensus â€” verifiable from multiple sources |
| Transformer-based ASR (Whisper) outperforms earlier HMM-based models on many benchmarks | OpenAI Whisper research paper |
| Whisper trained on 680,000 hours of audio | OpenAI Whisper paper / GitHub README |
| Konthora uses Whisper small.en | Live backend |

---

### 15. Future Update Checklist

| Trigger | Action |
|---|---|
| Major ASR advance published | Update history / technology section |
| Konthora adds real-time transcription | Update "Can and Cannot Do" section |
| Speaker diarization added | Update limitation answer |
| `/entity/speech-recognition/` page published | Add lateral link |
| 90-day review | Verify claims; check impressions |

---

---

# SPECIFICATION 5

## Page Identity

| Field | Value |
|---|---|
| **Page title (H1 draft)** | How Does Text-to-Speech Work? |
| **Proposed URL** | `/text-to-speech/how-does-text-to-speech-work/` |
| **Cluster ownership** | C1 â€” Text-to-Speech Technology |
| **Pillar parent** | `/text-to-speech` (live tool + pillar) |
| **Phase** | 1 |
| **Specification date** | 2026-08-06 |

---

### 1. Page Objective

Capture the high-volume "how does text to speech work" query with a Featured Snippet-ready answer and a clear how-to structure, establishing Konthora as the authoritative TTS explainer and converting readers to immediate tool users.

---

### 2. Search Intent

**Primary intent type:** Informational

**Intent in plain English:** The user wants a clear, accurate explanation of how TTS systems convert text into audio. They are curious, not yet ready to act.

**Intent conflict check:**
- `/entity/neural-text-to-speech/` (Specification 3) targets "what is neural text to speech" â€” the definition of a specific category.
- This page targets "how does text to speech work" â€” the mechanics of the overall process. Distinct intents; no conflict.
- `/text-to-speech` (live tool) targets "text to speech free" transactional intent. No conflict.

---

### 3. User Journey Stage

**Stage:** Awareness â†’ Consideration

**What the user already knows:** They know TTS converts text to audio. They want to understand the mechanism.

**What the user will know after reading:** The full pipeline from text input to audio output (normalisation â†’ phonemisation â†’ synthesis â†’ output); what makes modern neural TTS different; how to try it immediately.

---

### 4. Primary Keyword

| Field | Value |
|---|---|
| **Primary keyword** | how does text to speech work |
| **Search volume estimate** | 5,000â€“15,000/month global |
| **Keyword difficulty** | Medium |
| **SERP features** | Featured Snippet (paragraph + steps); large PAA box; AI Overview |
| **Current Konthora ranking** | Not ranking |
| **Target position** | 1â€“3 (strong snippet opportunity) |

---

### 5. Supporting Keywords

| Supporting keyword | Fits naturally |
|---|---|
| how text to speech works | Yes |
| how does tts work | Yes |
| text to speech process | Yes |
| how ai voice works | Yes |
| text to speech pipeline | Yes |
| how does voice synthesis work | Yes |

---

### 6. Entity Ownership

**Primary entity addressed:** Text-to-Speech (the technology process)

**Cluster:** C1 â€” TTS technology

**This page is a how-to pillar child, not a definitional entity page.** It explains the process step by step. The `/entity/neural-text-to-speech/` page defines neural TTS. These are complementary, not competing.

---

### 7. Search Promise

> Text-to-speech (TTS) converts written text into spoken audio through a pipeline of three main stages: text analysis and normalisation, phoneme conversion, and audio waveform generation. Modern neural TTS systems, like the Kokoro model used by Konthora, complete this entire process in under a second and produce speech that closely resembles a human voice.

---

### 8. Conversion Goal

**Primary conversion:** `/text-to-speech`

**CTA text:** "See How It Works â€” Try Text-to-Speech Free"

**CTA placement:** After the pipeline summary (before deep sections); end of page.

---

### 9. Required Sections

| # | H2 section | Purpose | Est. words |
|---|---|---|---|
| 1 | The Three Stages of Text-to-Speech | Top-level process overview â€” snippet target | 120â€“150 |
| 2 | Stage 1: Text Analysis and Normalisation | What the system does with raw text | 120â€“150 |
| 3 | Stage 2: Phoneme Conversion | How text becomes phonemes | 100â€“130 |
| 4 | Stage 3: Waveform Generation | How audio is produced | 130â€“160 |
| 5 | How Modern Neural TTS Differs | The shift from older approaches | 100â€“130 |
| 6 | Text-to-Speech in Konthora | Practical application with verified facts | 80â€“100 |
| 7 | Frequently Asked Questions | FAQPage schema | 150â€“200 |

**Total estimated word count:** 800â€“1,020 words

---

### 10. Heading Hierarchy

```
H1: How Does Text-to-Speech Work?

  H2: The Three Stages of Text-to-Speech
    (numbered list â€” HowTo schema target)

  H2: Stage 1: Text Analysis and Normalisation
    H3: Handling Numbers, Abbreviations, and Punctuation
    H3: Sentence Boundary Detection

  H2: Stage 2: Phoneme Conversion
    H3: Grapheme-to-Phoneme Conversion
    H3: Prosody Prediction

  H2: Stage 3: Waveform Generation
    H3: How Neural Vocoders Work

  H2: How Modern Neural TTS Differs

  H2: Text-to-Speech in Konthora

  H2: Frequently Asked Questions
```

---

### 11. FAQ Requirements

1. How long does text-to-speech take to generate audio?
2. Can text-to-speech handle punctuation and numbers?
3. What is the difference between TTS and voice cloning?
4. Why does text-to-speech sometimes mispronounce words?
5. What file formats does text-to-speech produce?

**Voice cloning answer:** State clearly that Konthora does not offer voice cloning â€” it uses fixed neural voices. Do not conflate TTS and voice cloning.

**File formats answer:** Must accurately state MP3 and WAV (verified backend formats).

---

### 12. Internal Linking Requirements

**Upward:** `/text-to-speech` â€” "Konthora's Text-to-Speech Tool"

**Downward / tool:** `/text-to-speech` â€” primary CTA

**Lateral:**
| Destination | Anchor text | Placement |
|---|---|---|
| `/entity/neural-text-to-speech/` | "neural text-to-speech" | Stage 3 section or "How Neural TTS Differs" |
| `/entity/kokoro/` | "Kokoro" | In "Text-to-Speech in Konthora" section |
| `/formats/` | "MP3 and WAV" | In FAQ answer on file formats |

---

### 13. Schema Requirements

| Schema type | Justification |
|---|---|
| `BreadcrumbList` | All KC pages |
| `Article` | Explanatory editorial content |
| `HowTo` | The numbered pipeline stages qualify |
| `FAQPage` | Genuine FAQ section |

**HowTo schema steps:**
1. Text input and normalisation
2. Grapheme-to-phoneme conversion
3. Neural waveform generation
4. Audio file output

---

### 14. Evidence Requirements

| Claim | Source |
|---|---|
| TTS pipeline: text analysis â†’ phonemes â†’ waveform | Academic consensus â€” multiple sources |
| Kokoro handles normalisation and phonemisation | Kokoro model card + espeak-ng |
| Konthora produces MP3 and WAV | Live backend config |
| Speed 0.75Ã—â€“1.25Ã— | Live backend config |
| 2,000 character limit | Live backend config |
| Generation completes in under a second | Verifiable by testing; state as approximate |

---

### 15. Example Requirements

**1 worked example:** Take the sentence "Dr. Smith earned $1,500 in Q3 2024." and trace it through the three stages:
1. Normalisation: "Doctor Smith earned one thousand five hundred dollars in Q3 twenty twenty-four."
2. Phonemisation: Show approximate phoneme notation.
3. Output: "Konthora produces this as a WAV or MP3 file within approximately one second."

This is reproducible and tests the normalisation logic Konthora actually uses.

---

### 16. Visual Requirements

| Visual | Type | Alt text |
|---|---|---|
| TTS pipeline diagram | Simple text diagram (3 boxes in sequence) | "Diagram: text input â†’ phoneme conversion â†’ audio output" |

---

### 17. Future Update Checklist

| Trigger | Action |
|---|---|
| Kokoro version upgrade | Update "Text-to-Speech in Konthora" section |
| New output format added | Update FAQ and formats section |
| Character limit changes | Update all references |
| 90-day review | Re-test example; verify product facts |

---

---

# SPECIFICATION 6

## Page Identity

| Field | Value |
|---|---|
| **Page title (H1 draft)** | Speech to Text: How Audio Transcription Works |
| **Proposed URL** | `/speech-to-text/` |
| **Cluster ownership** | C2 â€” Speech-to-Text |
| **Pillar parent** | Self (this is the C2 pillar page) |
| **Phase** | 1 |
| **Specification date** | 2026-08-06 |

---

### 1. Page Objective

Establish the foundational authority page for the entire speech-to-text and audio transcription cluster â€” capturing broad "speech to text" informational and consideration-stage traffic â€” and route readers to Konthora's `/audio-to-text` tool and to supporting child pages as they are published.

---

### 2. Search Intent

**Primary intent type:** Informational / Consideration

**Intent in plain English:** The user wants to understand what speech-to-text is, how it works, and whether free tools exist. They are considering transcribing something.

**Intent conflict check:**
- `/entity/automatic-speech-recognition/` targets the definitional, technical "what is ASR" intent. This pillar page targets the broader, more practical "speech to text" query cluster. Distinct.
- `/speech-to-text/how-to-transcribe-audio/` (Specification 7) targets the task "how to transcribe audio" â€” the next step down the funnel. Distinct.

---

### 3. User Journey Stage

**Stage:** Awareness â†’ Consideration

**What the user already knows:** They know that converting speech to text is possible. They want to understand the options and may be ready to try.

**What the user will know after reading:** What speech-to-text is, how modern ASR (Whisper) works at a high level, what accuracy to expect, what Konthora offers, and where to go next (tool or deeper how-to pages).

---

### 4. Primary Keyword

| Field | Value |
|---|---|
| **Primary keyword** | speech to text |
| **Search volume estimate** | 100,000â€“300,000/month global (highly competitive) |
| **Keyword difficulty** | Very High |
| **SERP features** | Featured Snippet; AI Overview; tool boxes; PAA |
| **Current Konthora ranking** | Not ranking |
| **Target position** | 10â€“20 initially; improve over time as authority builds |

**Strategy note:** "speech to text" is extremely competitive. This pillar page earns authority over time through the child pages that link up to it. Publish it now as the structural anchor; do not expect rapid ranking on the head term â€” the child pages are the primary traffic drivers short-term.

---

### 5. Supporting Keywords

| Supporting keyword | Fits naturally |
|---|---|
| speech to text online | Yes |
| speech to text free | Yes |
| audio to text | Yes |
| transcribe audio | Yes |
| voice to text | Yes |
| convert speech to text | Yes |

---

### 6. Entity Ownership

**This is a pillar page, not an entity page.** It owns the practical "speech to text" cluster â€” explaining the technology, the use cases, and the conversion path. Definitional authority for ASR and Whisper resides in the entity pages.

---

### 7. Search Promise

> Speech-to-text converts spoken audio into written text using automatic speech recognition (ASR) software. Modern free tools powered by neural models like Whisper can transcribe audio files, videos, and voice recordings directly in a browser with no software to install.

---

### 8. Conversion Goal

**Primary conversion:** `/audio-to-text`

**CTA text:** "Transcribe Audio to Text Free â€” No Account Needed"

**CTA placements:** After intro paragraph; within "How to Transcribe" section; end of page (3 placements on pillar page â€” justified by its role as the primary acquisition page for the STT cluster).

---

### 9. Required Sections

| # | H2 section | Purpose | Est. words |
|---|---|---|---|
| 1 | What Is Speech to Text? | Definition â€” snippet target | 100â€“130 |
| 2 | How Speech-to-Text Works | High-level ASR process | 130â€“160 |
| 3 | What Speech-to-Text Is Used For | Use cases â€” PAA and audience signal | 120â€“150 |
| 4 | Free vs. Paid Speech-to-Text Tools | Honest positioning â€” no competitor bashing | 100â€“130 |
| 5 | Transcription Accuracy: What to Expect | Realistic framing | 100â€“130 |
| 6 | How to Transcribe Audio with Konthora | Step-by-step CTA section | 100â€“130 |
| 7 | Explore Speech-to-Text Topics | Links to child pages (navigation section) | 80â€“100 |
| 8 | Frequently Asked Questions | FAQPage schema | 150â€“200 |

**Total estimated word count:** 880â€“1,130 words

---

### 10. Heading Hierarchy

```
H1: Speech to Text: How Audio Transcription Works

  H2: What Is Speech to Text?

  H2: How Speech-to-Text Works

  H2: What Speech-to-Text Is Used For
    H3: Podcasters and Creators
    H3: Students and Researchers
    H3: Accessibility and Assistive Technology

  H2: Free vs. Paid Speech-to-Text Tools

  H2: Transcription Accuracy: What to Expect

  H2: How to Transcribe Audio with Konthora
    (numbered steps: upload â†’ select options â†’ transcribe â†’ export)

  H2: Explore Speech-to-Text Topics
    (link list to child pages)

  H2: Frequently Asked Questions
```

---

### 11. FAQ Requirements

1. Is speech-to-text free?
2. How accurate is free speech-to-text?
3. What audio formats can be transcribed?
4. Can speech-to-text add timestamps?
5. Does speech-to-text work for video files?
6. What is the difference between speech-to-text and voice recognition?

**Formats answer:** Must accurately list MP3, WAV, M4A, AAC, MP4, WebM, MOV (Konthora's verified formats).

**Timestamps answer:** Must mention Konthora's sentence/paragraph/word grouping options.

---

### 12. Internal Linking Requirements

**Upward:** Homepage (`/`) â€” via breadcrumb

**Downward / tool:**
| Destination | Anchor text | Placement |
|---|---|---|
| `/audio-to-text` | "Transcribe audio free" | Intro; how-to section; end |
| `/speech-to-text/how-to-transcribe-audio/` | "how to transcribe audio step by step" | "Explore Topics" section |
| `/speech-to-text/timestamps/` | "transcription with timestamps" | "Explore Topics" section |

**Lateral:**
| Destination | Anchor text | Placement |
|---|---|---|
| `/entity/automatic-speech-recognition/` | "automatic speech recognition" | In "How Speech-to-Text Works" |
| `/entity/whisper/` | "Whisper" | In "How Speech-to-Text Works" |
| `/captions/` | "captions and subtitles" | In "What STT Is Used For" section |

---

### 13. Schema Requirements

| Schema type | Justification |
|---|---|
| `BreadcrumbList` | All KC pages |
| `Article` | Pillar editorial page |
| `HowTo` | "How to Transcribe Audio with Konthora" section |
| `FAQPage` | Genuine FAQ |

---

### 14. Evidence Requirements

| Claim | Source |
|---|---|
| Konthora accepts MP3/WAV/M4A/AAC/MP4/WebM/MOV | Live backend |
| 100 MB file limit | Live backend |
| 10-minute duration limit | Live backend |
| Exports TXT, SRT, VTT, JSON | Live backend |
| Sentence/paragraph/word timestamp grouping | Live backend |
| Powered by Whisper small.en | Live backend |
| 60-minute file deletion | Live backend |
| No account required | Live product |

---

### 15. Future Update Checklist

| Trigger | Action |
|---|---|
| New child pages published | Add links in "Explore Topics" section |
| File format support changes | Update FAQ and formats list |
| Duration/size limits change | Update all references |
| New timestamp modes added | Update FAQ |
| 90-day review | Re-verify all facts; check child page links |

---

---

# SPECIFICATION 7

## Page Identity

| Field | Value |
|---|---|
| **Page title (H1 draft)** | How to Transcribe Audio to Text (Free, with Timestamps) |
| **Proposed URL** | `/speech-to-text/how-to-transcribe-audio/` |
| **Cluster ownership** | C2 â€” Speech-to-Text |
| **Pillar parent** | `/speech-to-text/` |
| **Phase** | 1 |
| **Specification date** | 2026-08-06 |

---

### 1. Page Objective

Capture high-intent "how to transcribe audio" queries with a Featured Snippet-ready numbered workflow and convert readers directly to the `/audio-to-text` tool. This is the highest-conversion page in Phase 1.

---

### 2. Search Intent

**Primary intent type:** Informational with strong transactional signal

**Intent in plain English:** The user has an audio file they want to transcribe. They want clear steps to do it free, ideally right now.

**Intent conflict check:**
- `/speech-to-text/` (Specification 6) targets broad "speech to text" informational intent. This page targets the specific task query "how to transcribe audio". Distinct.
- `/speech-to-text/how-to-transcribe-video/` (planned later) will target video-specific transcription. This page focuses on audio. When the video page is published, update this page with a lateral link.

---

### 3. User Journey Stage

**Stage:** Consideration â†’ Decision

**What the user already knows:** They have an audio file. They want to convert it to text. They are looking for the simplest free method.

**What the user will know after reading:** The exact steps to transcribe audio on Konthora, what formats are accepted, how timestamps work, and what to do with the result.

---

### 4. Primary Keyword

| Field | Value |
|---|---|
| **Primary keyword** | how to transcribe audio |
| **Search volume estimate** | 10,000â€“40,000/month global |
| **Keyword difficulty** | Mediumâ€“High |
| **SERP features** | Featured Snippet (steps); HowTo rich result; PAA |
| **Current Konthora ranking** | Not ranking |
| **Target position** | 1â€“5 (steps snippet is very achievable) |

---

### 5. Supporting Keywords

| Supporting keyword | Fits naturally |
|---|---|
| how to transcribe audio to text | Yes |
| transcribe audio free | Yes |
| how to convert audio to text | Yes |
| audio to text online | Yes |
| how to transcribe audio file | Yes |
| free audio transcription online | Yes |

---

### 6. Entity Ownership

**This is a task how-to page.** It owns the task intent "how to transcribe audio." Definitional authority for ASR/Whisper remains with entity pages. This page uses those entities in context but does not redefine them.

---

### 7. Search Promise

> To transcribe audio to text for free: (1) go to Konthora's audio-to-text tool, (2) upload your audio file (MP3, WAV, M4A, AAC, MP4, WebM, or MOV â€” up to 100 MB and 10 minutes), (3) choose your timestamp grouping, and (4) download or copy your transcript in TXT, SRT, VTT, or JSON format. No account required.

This four-step summary must appear in the first paragraph or immediately under a "Quick Steps" section before the first scroll.

---

### 8. Conversion Goal

**Primary conversion:** `/audio-to-text` (highest priority on this page)

**CTA text:** "Transcribe Audio Free Now"

**CTA placements:** Quick-steps box at the top; within the step-by-step section (after Step 4); end of page.

---

### 9. Required Sections

| # | H2 section | Purpose | Est. words |
|---|---|---|---|
| 1 | Quick Steps: Transcribe Audio in 4 Steps | Snippet-target summary | 80â€“100 |
| 2 | Step-by-Step: How to Transcribe Audio on Konthora | Detailed walkthrough | 200â€“280 |
| 3 | Supported Audio and Video Formats | Format reference â€” FAQ capture | 80â€“100 |
| 4 | Understanding Timestamp Options | Sentence, paragraph, word explained | 100â€“130 |
| 5 | Exporting Your Transcript | TXT / SRT / VTT / JSON â€” what each is for | 100â€“130 |
| 6 | Tips for Better Transcription Results | Practical quality tips | 80â€“100 |
| 7 | Frequently Asked Questions | FAQPage schema | 150â€“200 |

**Total estimated word count:** 790â€“1,040 words

---

### 10. Heading Hierarchy

```
H1: How to Transcribe Audio to Text (Free, with Timestamps)

  H2: Quick Steps: Transcribe Audio in 4 Steps
    (numbered list â€” HowTo schema target)

  H2: Step-by-Step: How to Transcribe Audio on Konthora
    H3: Step 1 â€” Upload Your Audio or Video File
    H3: Step 2 â€” Choose Your Language and Timestamp Mode
    H3: Step 3 â€” Start Transcription
    H3: Step 4 â€” Download or Copy Your Transcript

  H2: Supported Audio and Video Formats

  H2: Understanding Timestamp Options
    H3: Sentence Timestamps
    H3: Paragraph Timestamps
    H3: Word-Level Timestamps

  H2: Exporting Your Transcript
    H3: TXT Format
    H3: SRT Format
    H3: VTT Format
    H3: JSON Format

  H2: Tips for Better Transcription Results

  H2: Frequently Asked Questions
```

---

### 11. FAQ Requirements

1. How long does audio transcription take?
2. What is the maximum file size for transcription?
3. Can I transcribe a video file, not just audio?
4. Is my audio file stored after transcription?
5. Does transcription work for phone call recordings?
6. What export format should I choose?

**File storage answer:** State clearly that uploaded files are deleted automatically after 60 minutes.

**File size answer:** 100 MB / 10 minutes â€” both limits apply.

---

### 12. Internal Linking Requirements

**Upward:** `/speech-to-text/` â€” "Back to Speech-to-Text"

**Downward / tool:**
- `/audio-to-text` â€” 3 placements (Quick Steps; Step 4; end CTA)

**Lateral:**
| Destination | Anchor text | Placement |
|---|---|---|
| `/speech-to-text/timestamps/` | "timestamp grouping" | In "Understanding Timestamp Options" section |
| `/formats/` | "SRT, VTT, TXT, and JSON formats explained" | In "Exporting Your Transcript" section |
| `/entity/whisper/` | "Whisper" | In Step 3 â€” "Konthora uses the Whisper modelâ€¦" |

---

### 13. Schema Requirements

| Schema type | Justification |
|---|---|
| `BreadcrumbList` | All KC pages |
| `HowTo` | Core purpose of page â€” numbered steps |
| `FAQPage` | Genuine FAQ section |

**HowTo steps:**
1. Open Konthora's audio-to-text tool
2. Upload your audio or video file
3. Choose language and timestamp mode
4. Click Transcribe Audio and wait for processing
5. Download or copy your transcript

---

### 14. Evidence Requirements

| Claim | Source |
|---|---|
| Accepted formats: MP3/WAV/M4A/AAC/MP4/WebM/MOV | Live backend |
| 100 MB file limit | Live backend |
| 10-minute duration limit | Live backend |
| Sentence/paragraph/word timestamp modes | Live backend |
| TXT/SRT/VTT/JSON export | Live backend |
| Files deleted after 60 minutes | Live backend |
| No account required | Live product |
| Processing time (estimate) | Test with the live tool; state as approximate |

---

### 15. Example Requirements

**1 worked example:** Record a 30-second English audio clip, upload it to `/audio-to-text`, select sentence timestamps and SRT export, and transcribe. Show the resulting SRT output (3â€“5 segments) as a code block. This must be a real test, not invented output.

---

### 16. Visual Requirements

| Visual | Type | Alt text |
|---|---|---|
| Screenshot: file upload area | Screenshot | "Konthora audio-to-text file upload interface" |
| Screenshot: timestamp mode selector | Screenshot | "Selecting sentence timestamp grouping in Konthora" |
| SRT output example | Code block | N/A |

**All screenshots must match the live product UI at time of writing.**

---

### 17. Future Update Checklist

| Trigger | Action |
|---|---|
| UI changes | Update all screenshots |
| New format support | Update formats list and FAQ |
| File limit changes | Update all references |
| New timestamp mode added | Update timestamp section |
| `/speech-to-text/how-to-transcribe-video/` published | Add lateral link |
| 90-day review | Re-test full workflow; update screenshots if needed |

---

---

# SPECIFICATION 8

## Page Identity

| Field | Value |
|---|---|
| **Page title (H1 draft)** | Transcription Timestamps: Sentence, Paragraph, and Word-Level Explained |
| **Proposed URL** | `/speech-to-text/timestamps/` |
| **Cluster ownership** | C2 â€” Speech-to-Text |
| **Pillar parent** | `/speech-to-text/` |
| **Phase** | 1 |
| **Specification date** | 2026-08-06 |

---

### 1. Page Objective

Own the specific, low-competition query space around audio transcription timestamps â€” explaining what sentence, paragraph, and word-level timestamps are and when to use each â€” while capturing users who want this feature and converting them to the `/audio-to-text` tool.

---

### 2. Search Intent

**Primary intent type:** Informational

**Intent in plain English:** The user knows what timestamps are but wants to understand the difference between timestamp modes (sentence vs. paragraph vs. word) and which to use for their specific purpose.

**Intent conflict check:**
- `/speech-to-text/word-vs-sentence-vs-paragraph/` is also listed in the architecture. These could potentially conflict. **Decision:** This page at `/speech-to-text/timestamps/` owns the broader "what are transcription timestamps" intent. The `word-vs-sentence-vs-paragraph` page is a narrower direct comparison. The `timestamps/` page is the parent concept; the comparison page is a future child. This page should be published first; the comparison page links up to it. No current conflict.
- `/speech-to-text/how-to-transcribe-audio/` contains a section on timestamps but its primary intent is the how-to task. This page is the authoritative reference on timestamp modes specifically.

---

### 3. User Journey Stage

**Stage:** Consideration

**What the user already knows:** They are already transcribing or planning to transcribe. They want to choose the right timestamp mode for their output.

**What the user will know after reading:** What each mode means, which formats support which modes (SRT/VTT use sentence/paragraph; JSON provides word-level), and how to use Konthora's timestamp settings.

---

### 4. Primary Keyword

| Field | Value |
|---|---|
| **Primary keyword** | audio transcription timestamps |
| **Search volume estimate** | 1,000â€“4,000/month global |
| **Keyword difficulty** | Low |
| **SERP features** | PAA; possible Featured Snippet |
| **Current Konthora ranking** | Not ranking |
| **Target position** | 1â€“3 (low competition) |

---

### 5. Supporting Keywords

| Supporting keyword | Fits naturally |
|---|---|
| word level timestamps transcription | Yes |
| sentence timestamps transcription | Yes |
| paragraph timestamps | Yes |
| what are timestamps in transcription | Yes |
| SRT timestamps | Yes |
| transcription with timestamps free | Yes |

---

### 6. Entity Ownership

**This is a topic-reference page**, not a definitional entity page and not a task how-to. It explains a specific feature set owned by Konthora's tool. The primary entity it references is the timestamp as a concept in transcription.

---

### 7. Search Promise

> Transcription timestamps mark the time in an audio file when each word or phrase was spoken. Konthora's audio-to-text tool offers three timestamp modes: sentence-level (one timestamp per sentence), paragraph-level (grouped by speech pauses), and word-level (individual timestamp for every word). The right mode depends on your intended use: SRT captions, research notes, or word-search archives.

---

### 8. Conversion Goal

**Primary conversion:** `/audio-to-text`

**CTA text:** "Try Transcription with Timestamps â€” Free"

---

### 9. Required Sections

| # | H2 section | Purpose | Est. words |
|---|---|---|---|
| 1 | What Are Transcription Timestamps? | Definition | 80â€“100 |
| 2 | Sentence-Level Timestamps | What they are, when to use them | 100â€“130 |
| 3 | Paragraph-Level Timestamps | What they are, when to use them | 100â€“130 |
| 4 | Word-Level Timestamps | What they are, when to use them | 100â€“130 |
| 5 | Which Timestamp Mode Should You Use? | Decision guide | 100â€“120 |
| 6 | How Timestamps Appear in Each Export Format | SRT / VTT / TXT / JSON examples | 120â€“150 |
| 7 | Frequently Asked Questions | FAQPage schema | 120â€“150 |

**Total estimated word count:** 720â€“910 words

---

### 10. Heading Hierarchy

```
H1: Transcription Timestamps: Sentence, Paragraph, and Word-Level Explained

  H2: What Are Transcription Timestamps?

  H2: Sentence-Level Timestamps
    H3: When to Use Sentence Timestamps

  H2: Paragraph-Level Timestamps
    H3: When to Use Paragraph Timestamps

  H2: Word-Level Timestamps
    H3: When to Use Word-Level Timestamps

  H2: Which Timestamp Mode Should You Use?
    (comparison table: sentence / paragraph / word Ã— use case)

  H2: How Timestamps Appear in Each Export Format
    H3: SRT Format
    H3: VTT Format
    H3: TXT Format
    H3: JSON Format

  H2: Frequently Asked Questions
```

---

### 11. FAQ Requirements

1. What is the difference between sentence and word-level timestamps?
2. Which timestamp mode is best for subtitles?
3. Do all export formats include timestamps?
4. Can I change the timestamp mode after transcribing?
5. How accurate are word-level timestamps?

**Word-level accuracy:** Do not state a WER. Say accuracy depends on audio quality and speaking clarity, and note that Konthora uses the Whisper model.

---

### 12. Internal Linking Requirements

**Upward:** `/speech-to-text/` â€” "Speech-to-Text"

**Tool:** `/audio-to-text` â€” CTA throughout

**Lateral:**
| Destination | Anchor text | Placement |
|---|---|---|
| `/speech-to-text/how-to-transcribe-audio/` | "how to transcribe audio" | In intro or closing |
| `/formats/` | "SRT, VTT, TXT, and JSON formats" | In "How Timestamps Appear" section |
| `/captions/` | "subtitles and captions" | In "When to Use Sentence Timestamps" |

---

### 13. Schema Requirements

| Schema type | Justification |
|---|---|
| `BreadcrumbList` | All KC pages |
| `Article` | Topic reference page |
| `FAQPage` | Genuine FAQ |

---

### 14. Evidence Requirements

| Claim | Source |
|---|---|
| Three timestamp modes: sentence/paragraph/word | Live backend |
| SRT uses sentence/paragraph timestamps | Live backend |
| JSON export includes word-level timing | Live backend |
| TXT export includes timestamps in display format | Live backend |
| Whisper generates word-level timing data | Whisper model documentation |

---

### 15. Example Requirements

**1 worked example per format:** Show the same 10-second audio segment rendered as:
- SRT (sentence mode)
- VTT (sentence mode)
- JSON (word level â€” first 3 words)

All examples must use actual output from the live `/audio-to-text` tool.

---

### 16. Visual Requirements

| Visual | Type |
|---|---|
| Decision table: which mode for which use case | Markdown table |
| Code blocks: SRT, VTT, JSON examples | Fenced code blocks |

---

### 17. Future Update Checklist

| Trigger | Action |
|---|---|
| New timestamp mode added | Add section and update comparison table |
| Export format changes | Update format examples |
| `/speech-to-text/word-vs-sentence-vs-paragraph/` published | Add lateral link from this page |
| 90-day review | Re-test examples with live tool |

---

---

# SPECIFICATION 9

## Page Identity

| Field | Value |
|---|---|
| **Page title (H1 draft)** | Captions and Subtitles: What They Are and Why They Matter |
| **Proposed URL** | `/captions/` |
| **Cluster ownership** | C7 â€” Captions & Subtitles |
| **Pillar parent** | Self (C7 pillar page) |
| **Phase** | 1 |
| **Specification date** | 2026-08-06 |

---

### 1. Page Objective

Establish the captions cluster pillar, own the "captions vs subtitles" Featured Snippet query, and connect readers to Konthora's transcription tool (which produces SRT and VTT â€” the standard caption formats) as the practical output step.

---

### 2. Search Intent

**Primary intent type:** Informational

**Intent in plain English:** The user wants to understand the difference between captions and subtitles â€” what each is, when to use each, and how to create them.

**Intent conflict check:**
- `/captions/closed-captions-vs-subtitles/` is listed in the architecture as a child page. Since this pillar page covers the same definitional ground, the child page would create a duplicate intent. **Decision:** This pillar page absorbs the "closed captions vs subtitles" intent. The child page is deferred unless a genuinely distinct sub-intent emerges (e.g., a separate page on "open captions vs closed captions" for a distinct query). No separate child page for this query in Phase 1.

---

### 3. User Journey Stage

**Stage:** Awareness â†’ Consideration

**What the user already knows:** They have seen both terms used and are confused by the distinction.

**What the user will know after reading:** The precise difference between captions and subtitles; what closed captions are; what SRT and VTT files are; how to generate captions from an audio/video file using Konthora.

---

### 4. Primary Keyword

| Field | Value |
|---|---|
| **Primary keyword** | captions vs subtitles |
| **Search volume estimate** | 5,000â€“15,000/month global |
| **Keyword difficulty** | Medium |
| **SERP features** | Featured Snippet (definition/comparison); PAA |
| **Current Konthora ranking** | Not ranking |
| **Target position** | 1â€“5 |

---

### 5. Supporting Keywords

| Supporting keyword | Fits naturally |
|---|---|
| what are closed captions | Yes |
| difference between captions and subtitles | Yes |
| how to create captions | Yes |
| SRT file captions | Yes |
| VTT captions | Yes |
| open captions vs closed captions | Yes |
| add captions to video | Yes |

---

### 6. Entity Ownership

**This is a pillar page.** It owns the practical captions cluster. The entity pages (`/entity/` cluster) may eventually include a "closed-captioning" entity for the technical standard â€” but this pillar page owns the practical, user-facing "captions" topic for now.

---

### 7. Search Promise

> Captions display the spoken words in a video as on-screen text, while subtitles translate speech from one language to another. Closed captions also include non-speech audio descriptions â€” such as [music playing] or [door slams] â€” making them essential for accessibility. Both are typically delivered as SRT or VTT files that a video player reads alongside the video.

---

### 8. Conversion Goal

**Primary conversion:** `/audio-to-text` (generates SRT and VTT â€” the standard caption files)

**CTA text:** "Generate Captions Free â€” Export as SRT or VTT"

---

### 9. Required Sections

| # | H2 section | Purpose | Est. words |
|---|---|---|---|
| 1 | What Are Captions? | Definition â€” snippet target | 80â€“100 |
| 2 | What Are Subtitles? | Definition â€” contrast with captions | 80â€“100 |
| 3 | Captions vs. Subtitles: The Key Differences | Comparison â€” table | 100â€“130 |
| 4 | Open Captions vs. Closed Captions | Sub-distinction â€” PAA capture | 100â€“120 |
| 5 | Caption File Formats: SRT and VTT | What they are and what they do | 100â€“130 |
| 6 | How to Create Captions for Your Video | Practical steps using Konthora | 100â€“130 |
| 7 | Why Captions Matter for Accessibility | Context for the broader value | 80â€“100 |
| 8 | Frequently Asked Questions | FAQPage schema | 150â€“200 |

**Total estimated word count:** 790â€“1,010 words

---

### 10. Heading Hierarchy

```
H1: Captions and Subtitles: What They Are and Why They Matter

  H2: What Are Captions?

  H2: What Are Subtitles?

  H2: Captions vs. Subtitles: The Key Differences
    (comparison table)

  H2: Open Captions vs. Closed Captions

  H2: Caption File Formats: SRT and VTT
    H3: SRT Files
    H3: VTT Files

  H2: How to Create Captions for Your Video
    (numbered steps â€” HowTo schema)

  H2: Why Captions Matter for Accessibility

  H2: Frequently Asked Questions
```

---

### 11. FAQ Requirements

1. What is the difference between captions and subtitles?
2. What are closed captions?
3. What file format are captions in?
4. Do I need software to create captions?
5. Can I add captions to a YouTube video?
6. Are captions required for accessibility?

**Software answer:** State that Konthora generates captions (SRT/VTT) from audio in a browser, free, no account required.

**YouTube answer:** State that YouTube accepts SRT files. Do not claim Konthora integrates with YouTube â€” it does not. The user downloads the SRT file and uploads it manually.

---

### 12. Internal Linking Requirements

**Upward:** Homepage via breadcrumb

**Downward / tool:**
- `/audio-to-text` â€” CTA in "How to Create Captions" section + end of page

**Lateral:**
| Destination | Anchor text | Placement |
|---|---|---|
| `/formats/` | "SRT and VTT file formats" | In "Caption File Formats" section |
| `/speech-to-text/` | "speech-to-text transcription" | In "How to Create Captions" |
| `/accessibility/` | "accessibility" | In "Why Captions Matter" section |

---

### 13. Schema Requirements

| Schema type | Justification |
|---|---|
| `BreadcrumbList` | All KC pages |
| `Article` | Pillar editorial page |
| `HowTo` | "How to Create Captions" section |
| `FAQPage` | Genuine FAQ |

---

### 14. Evidence Requirements

| Claim | Source |
|---|---|
| Captions include non-speech audio descriptions | W3C / FCC definitions |
| Subtitles translate speech between languages | W3C / industry standard definition |
| SRT and VTT are the standard caption formats | W3C WebVTT specification; SRT is de facto standard |
| Konthora exports SRT and VTT | Live backend |
| YouTube accepts SRT files | YouTube Help documentation |
| No account required for Konthora | Live product |

---

### 15. Example Requirements

**1 example:** Show a 3-line SRT file produced by Konthora from a real audio file. Must be actual output from the live tool.

---

### 16. Visual Requirements

| Visual | Type |
|---|---|
| Captions vs. subtitles comparison table | Markdown table |
| SRT file example | Code block |

---

### 17. Future Update Checklist

| Trigger | Action |
|---|---|
| New export format added | Update "Caption File Formats" section |
| YouTube or video platform changes SRT handling | Update FAQ |
| `/accessibility/` page published | Add lateral link |
| Child caption pages published | Add links in an "Explore Captions Topics" section |
| 90-day review | Verify SRT/VTT definitions; re-test tool output |

---

---

# SPECIFICATION 10

## Page Identity

| Field | Value |
|---|---|
| **Page title (H1 draft)** | Audio and Transcript File Formats: MP3, WAV, SRT, VTT, JSON Explained |
| **Proposed URL** | `/formats/` |
| **Cluster ownership** | C6 â€” Audio & Export Formats |
| **Pillar parent** | Self (C6 pillar page) |
| **Phase** | 1 |
| **Specification date** | 2026-08-06 |

---

### 1. Page Objective

Establish the formats cluster pillar â€” explaining all audio input formats Konthora accepts and all transcript export formats it produces â€” and serve as the canonical reference that all other pages link to when they mention a format name.

---

### 2. Search Intent

**Primary intent type:** Informational / Topic reference

**Intent in plain English:** The user wants to understand what a specific audio or transcript file format is, how it differs from others, and which one to use for their purpose.

**Intent conflict check:**
- Future child pages (`/formats/mp3/`, `/formats/srt/`, etc.) will target individual format queries. This pillar page targets the overview "audio file formats" query and serves as the reference hub. No conflict â€” this pillar page links down to those children when they exist.
- `/captions/` covers SRT and VTT in context of captioning. This page covers them as file format references. Distinct angles; lateral link from captions to formats is appropriate.

---

### 3. User Journey Stage

**Stage:** Consideration / Reference

**What the user already knows:** They are working with audio or transcripts and need to choose or understand a format.

**What the user will know after reading:** What each audio format is (MP3, WAV, M4A, AAC, WebM, MOV), what each transcript format is (TXT, SRT, VTT, JSON), and which to choose for different purposes. A reference page they will bookmark.

---

### 4. Primary Keyword

| Field | Value |
|---|---|
| **Primary keyword** | audio file formats for transcription |
| **Search volume estimate** | 1,000â€“4,000/month global |
| **Keyword difficulty** | Lowâ€“Medium |
| **SERP features** | PAA; possible Featured Snippet for sub-queries |
| **Current Konthora ranking** | Not ranking |
| **Target position** | 1â€“5 |

**Note:** This page also captures sub-queries like "what is an SRT file", "MP3 vs WAV transcription", "VTT file format" â€” each naturally answerable with H3 sections.

---

### 5. Supporting Keywords

| Supporting keyword | Fits naturally |
|---|---|
| what is an SRT file | Yes |
| what is a VTT file | Yes |
| MP3 vs WAV audio | Yes |
| transcript file formats | Yes |
| audio formats for transcription | Yes |
| what is a WebM file | Yes |
| JSON transcript format | Yes |

---

### 6. Entity Ownership

**This is a topic-reference pillar page.** It owns the formats topic for the entire Knowledge Center. Every other page that mentions a file format links to this page or its future children as the canonical reference.

---

### 7. Search Promise

> Konthora accepts audio and video files in MP3, WAV, M4A, AAC, MP4, WebM, and MOV formats for transcription. It exports transcripts in TXT (plain text), SRT (subtitle captions), VTT (web video captions), and JSON (structured data with timestamps). This page explains what each format is and when to use it.

---

### 8. Conversion Goal

**Primary conversion:** `/audio-to-text` for audio input formats; `/text-to-speech` for audio output formats.

**CTA text (transcription):** "Transcribe Audio Free â€” Upload Any Supported Format"

**CTA text (TTS):** "Generate MP3 or WAV â€” Free Text-to-Speech"

---

### 9. Required Sections

| # | H2 section | Purpose | Est. words |
|---|---|---|---|
| 1 | Audio Input Formats for Transcription | Overview of accepted formats | 80â€“100 |
| 2 | MP3 | What it is, why it's common, transcription suitability | 80â€“100 |
| 3 | WAV | Lossless, larger, excellent transcription quality | 80â€“100 |
| 4 | M4A, AAC, WebM, and MOV | Briefer treatment of remaining input formats | 100â€“130 |
| 5 | Transcript Export Formats | Overview of output formats | 60â€“80 |
| 6 | TXT â€” Plain Text Transcript | What it contains, when to use it | 80â€“100 |
| 7 | SRT â€” SubRip Subtitle Format | Structure, timestamps, use cases | 100â€“120 |
| 8 | VTT â€” WebVTT Caption Format | Structure, difference from SRT, use cases | 80â€“100 |
| 9 | JSON â€” Structured Transcript Data | What JSON contains, developer use | 80â€“100 |
| 10 | Which Format Should You Use? | Decision guide | 80â€“100 |
| 11 | Frequently Asked Questions | FAQPage schema | 120â€“150 |

**Total estimated word count:** 960â€“1,180 words

---

### 10. Heading Hierarchy

```
H1: Audio and Transcript File Formats: MP3, WAV, SRT, VTT, JSON Explained

  H2: Audio Input Formats for Transcription
    H3: MP3
    H3: WAV
    H3: M4A
    H3: AAC
    H3: WebM
    H3: MOV

  H2: Transcript Export Formats
    H3: TXT â€” Plain Text
    H3: SRT â€” SubRip Subtitle
    H3: VTT â€” WebVTT Caption
    H3: JSON â€” Structured Data

  H2: Which Format Should You Use?
    (decision table: use case â†’ recommended format)

  H2: Frequently Asked Questions
```

---

### 11. FAQ Requirements

1. What is the difference between MP3 and WAV for transcription?
2. What is an SRT file?
3. What is the difference between SRT and VTT?
4. Can I use an MP4 video file for transcription?
5. What does the JSON transcript export contain?

**MP4 answer:** Yes â€” MP4 is accepted; the audio track is extracted and transcribed. State file size (100 MB) and duration (10 min) limits apply.

**JSON answer:** State that the JSON export contains the full text, detected language, word count, segment count, and word-level timing data for each segment.

---

### 12. Internal Linking Requirements

**Upward:** Homepage via breadcrumb

**Downward / tool:**
- `/audio-to-text` â€” CTA in "Audio Input Formats" and closing
- `/text-to-speech` â€” CTA in a brief note about MP3/WAV as TTS output formats

**Lateral:**
| Destination | Anchor text | Placement |
|---|---|---|
| `/captions/` | "captions and subtitles" | In SRT and VTT sections |
| `/speech-to-text/timestamps/` | "transcription timestamps" | In SRT/VTT/JSON sections |
| `/speech-to-text/` | "speech-to-text" | In intro section |

---

### 13. Schema Requirements

| Schema type | Justification |
|---|---|
| `BreadcrumbList` | All KC pages |
| `Article` | Reference pillar page |
| `FAQPage` | Genuine FAQ section |

---

### 14. Evidence Requirements

| Claim | Source |
|---|---|
| Accepted input formats: MP3/WAV/M4A/AAC/MP4/WebM/MOV | Live backend |
| Export formats: TXT/SRT/VTT/JSON | Live backend |
| JSON contains word-level timing | Live backend (TranscriptionService output) |
| SRT format specification | SRT is a de facto standard â€” describe its structure factually |
| VTT format specification | W3C WebVTT specification |
| MP3 uses lossy compression | Standard audio engineering fact |
| WAV is lossless PCM | Standard audio engineering fact |

---

### 15. Example Requirements

**1 example per transcript format:** Show the same 10-second audio segment rendered as TXT, SRT, VTT, and a snippet of JSON. All must be actual output from the live `/audio-to-text` tool.

---

### 16. Visual Requirements

| Visual | Type |
|---|---|
| Input formats comparison table (format, compression, typical use) | Markdown table |
| Output format comparison table (format, contains timestamps, best for) | Markdown table |
| TXT, SRT, VTT, JSON examples | Fenced code blocks |

---

### 17. Future Update Checklist

| Trigger | Action |
|---|---|
| New input format supported | Add H3 section in "Audio Input Formats" |
| New export format added | Add H3 section in "Transcript Export Formats" |
| JSON schema changes | Update JSON description and example |
| Child format pages published | Add "Learn more" links from each format H3 |
| 90-day review | Re-test all format examples; verify file limits |

---

---

## Cross-Page Consistency Rules

These rules apply across all 10 specifications. Enforce at review time.

### Product Facts (must be identical across all pages)

| Fact | Value |
|---|---|
| TTS character limit | 2,000 characters |
| TTS output formats | MP3, WAV |
| TTS speed range | 0.75Ã— to 1.25Ã— |
| TTS voice count | 10 (6 US, 4 UK) |
| Transcription file size limit | 100 MB |
| Transcription duration limit | 10 minutes |
| Transcription input formats | MP3, WAV, M4A, AAC, MP4, WebM, MOV |
| Transcription export formats | TXT, SRT, VTT, JSON |
| Timestamp modes | Sentence, paragraph, word |
| File / transcript retention | 60 minutes |
| Account requirement | None |
| Language support | English only |
| TTS model | Kokoro (hexgrad/Kokoro-82M) |
| Transcription model | Whisper small.en |

### Intent Map (no page may enter this table twice on the same row)

| Primary keyword | Owner page |
|---|---|
| kokoro tts | `/entity/kokoro/` |
| openai whisper | `/entity/whisper/` |
| neural text to speech (definitional) | `/entity/neural-text-to-speech/` |
| automatic speech recognition | `/entity/automatic-speech-recognition/` |
| how does text to speech work | `/text-to-speech/how-does-text-to-speech-work/` |
| speech to text | `/speech-to-text/` |
| how to transcribe audio | `/speech-to-text/how-to-transcribe-audio/` |
| audio transcription timestamps | `/speech-to-text/timestamps/` |
| captions vs subtitles | `/captions/` |
| audio file formats for transcription | `/formats/` |

### Publication Order

Recommended writing and publication order within Phase 1:

1. `/entity/kokoro/` and `/entity/whisper/` â€” publish together (mutual lateral links)
2. `/entity/neural-text-to-speech/` and `/entity/automatic-speech-recognition/` â€” publish together
3. `/speech-to-text/` â€” publish the pillar before its children
4. `/text-to-speech/how-does-text-to-speech-work/` â€” publish alongside the STT pillar
5. `/captions/` and `/formats/` â€” publish together (mutual SRT/VTT lateral links)
6. `/speech-to-text/how-to-transcribe-audio/` and `/speech-to-text/timestamps/` â€” publish last, after pillar and format pages are live

Do not publish a child page before its pillar page is live.

---

*Specifications status: Production-ready. Writing may begin after reviewer sign-off on each individual spec. No pages may be written, reviewed, or published without a completed and reviewed specification.*
