# Konthora Editorial Content Framework

---

## Document Status

| Field | Value |
|---|---|
| **Status** | Active â€” mandatory for all Knowledge Center pages |
| **Version** | 1.0 |
| **Date** | 2026-08-06 |
| **Applies to** | Every Knowledge Center page before writing begins |
| **Owner** | Konthora content team |
| **Related document** | `docs/knowledge-center-architecture.md` |

This framework is the mandatory specification template for every Knowledge Center page. No page may be written, reviewed, or published without a completed specification based on this framework. The framework is not a suggestion â€” it is the gate between planning and writing.

---

## How to Use This Framework

1. Copy the **Page Specification Template** (Section 2) into a working document for the specific page.
2. Complete every field. Do not leave fields blank. If a field does not apply, state why explicitly.
3. Have the specification reviewed for intent conflicts before writing begins.
4. Write the page content according to the completed specification.
5. Run all checklists in Sections 15â€“22 before submitting for publication review.
6. Attach the completed specification to the page's review record.

A page that enters the writing phase without a completed specification will be returned to planning.

---

## Section 1 — Core Definitions

These definitions apply to every field in this framework. Writers and reviewers must understand them before completing a specification.

### Editorial Governance Rule
**"Technical implementation details must always remain secondary to user outcomes."**
When uncertain between explaining a feature and explaining the underlying model, always choose the feature first. Only explain the model if it directly helps the reader accomplish their goal.

### Content Priority Flow
Future content decisions must follow this priority:
User benefit → Workflow → Capability → Privacy → Formats → Limitations → Technology → Implementation → Model.
The model itself is always the lowest-priority message.

### Search Intent Types

| Intent type | Definition | Example query |
|---|---|---|
| **Informational** | User wants to learn or understand something | "what is neural text to speech" |
| **Navigational** | User wants to reach a specific page or tool | "konthora text to speech" |
| **Transactional** | User wants to complete an action | "convert text to speech free" |
| **Commercial investigation** | User is comparing options before a decision | "best free tts tools" |

Each page may own exactly one primary intent type. A page targeting informational intent must not also compete for transactional intent.

### User Journey Stages

| Stage | Description | Typical content type |
|---|---|---|
| **Awareness** | User does not yet know a solution exists | Definitional, educational |
| **Consideration** | User knows solutions exist and is exploring | Comparison, how-to, feature explanation |
| **Decision** | User is ready to act | Tool page, tutorial, direct conversion |
| **Retention** | User has used the tool and needs support | Troubleshooting, documentation, refresh |

### Entity Ownership

Every page is assigned to exactly one entity or cluster from the Knowledge Center architecture. If a page touches multiple clusters, it belongs to the cluster that owns its primary keyword. Cross-cluster pages are not permitted â€” instead, lateral links are used to connect related content.

### Search Promise

The search promise is the specific, honest answer the page delivers to a user who clicked on its search result. It must be deliverable in the first paragraph. If the page cannot deliver the promise, the page should not exist.

---

## Section 2 â€” Page Specification Template

Copy and complete the following template for every Knowledge Center page before writing begins.

---

```
PAGE SPECIFICATION
==================

## Page Identity

Page title (H1 draft):
Proposed URL slug:
Cluster ownership (from architecture doc):
Pillar parent (URL):
Phase assigned (1 / 2 / 3 / 4 / programmatic):
Author / content owner:
Specification date:
Specification reviewer:

---

## 1. Page Objective

State in one sentence what this page accomplishes for Konthora.
[Not the user's goal â€” the business and SEO goal of the page's existence.]

Example: "Establish Konthora as the factual authority for the definition of
neural text-to-speech and route informed users to the TTS tool."

---

## 2. Search Intent

Primary intent type (Informational / Navigational / Transactional / Commercial):
Intent in plain English (what is the user trying to accomplish):

Confirm no existing page owns this intent:
[ ] Checked architecture doc â€” intent is unassigned
[ ] Checked live site â€” no page currently targets this intent
[ ] Closest existing page: [URL or "none"]
[ ] Action if existing page found: [extend existing / proceed / abandon]

---

## 3. User Journey Stage

Stage (Awareness / Consideration / Decision / Retention):
Why this stage fits the query:
What the user already knows when they land on this page:
What the user should know or be able to do after reading:

---

## 4. Primary Keyword

Primary keyword (exact):
Monthly search volume estimate (source):
Keyword difficulty estimate (source):
SERP features present (Featured Snippet / PAA / AI Overview / none):
Current Konthora ranking for this keyword (if any):
Target ranking position:

Confirm single ownership:
[ ] No other planned or live Konthora page targets this exact keyword
[ ] This keyword does not cannibalize [URL] (if risk exists, note it)

---

## 5. Supporting Keywords

List 3â€“8 supporting keywords this page will naturally cover.
Do not force them â€” include only those that arise from genuinely covering the topic.

| Supporting keyword | Search intent | Fits naturally? |
|---|---|---|
| | | |
| | | |
| | | |

Do not treat supporting keywords as additional primary targets. They support the primary â€” they do not compete with it.

---

## 6. Entity Ownership

Primary entity this page defines or references:
Entity cluster (from architecture doc):
Entity relationship (this entity relates to these others):

If this page is an entity page:
[ ] Entity is in the approved entity graph
[ ] Entity is not already defined by another page
[ ] Definition is factually verifiable (source):

If this page references entities:
List the 2â€“3 most relevant entity pages to link to laterally:
- [entity page URL or planned slug]
- [entity page URL or planned slug]

---

## 7. Search Promise

The exact answer this page delivers in its opening paragraph:
[Write it here â€” this becomes the template for the intro]

The user will arrive searching for: [query]
The page will answer: [answer]
The answer will be delivered: [in the first paragraph / within the first screen]

If the answer cannot be delivered in the first paragraph, reconsider the page concept.

---

## 8. Conversion Goal

Primary conversion action (what should the user do after reading):
[ ] Use the Text-to-Speech tool (/text-to-speech)
[ ] Use the Audio-to-Text tool (/audio-to-text)
[ ] Read a related pillar page
[ ] Read a related supporting page
[ ] Other (specify):

Secondary conversion action (optional):
Conversion path (how many clicks from this page to the tool):

The conversion path must be 2 clicks or fewer from any Knowledge Center page to a live tool.

---

## 9. CTA Strategy

Primary CTA text (the exact label on the main call-to-action):
Primary CTA destination URL:
Primary CTA placement (top / mid-page / end / sticky):

Secondary CTA (if applicable):
Secondary CTA text:
Secondary CTA destination URL:

CTA rules:
[ ] CTA is specific, not generic ("Convert text to speech free" not "Click here")
[ ] CTA destination is a live tool or a directly useful page
[ ] CTA does not promise a feature the tool does not yet support
[ ] CTA is present in the page body, not only in the navigation

---

## 10. Required Sections

List every H2 section this page must contain, in order.
Every H2 must serve the user's intent â€” remove any section that exists only to add length.

| # | H2 section title | Purpose | Estimated words |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |

Total estimated word count:
[Target 600â€“1,500 words for most editorial pages. Justify if longer.]

---

## 11. Heading Hierarchy

Rule: one H1 per page. H2 for major sections. H3 for sub-points within a section.
H4 only when a sub-point itself requires subdivision. Never skip heading levels.

H1 (page title â€” answers the primary keyword directly):
H2 sections (list in order):
  - H2: [section]
    - H3: [sub-section if needed]
    - H3: [sub-section if needed]
  - H2: [section]

Confirm:
[ ] H1 contains the primary keyword or its natural-language equivalent
[ ] H1 is unique across the entire site
[ ] No two H2s serve the same purpose
[ ] H3s appear only where genuinely needed â€” not as padding
[ ] Heading text describes the content that follows â€” no "Introduction", "Overview", or "Conclusion" as H2s

---

## 12. FAQ Requirements

Minimum FAQ questions: 3
Maximum FAQ questions: 8
Source of questions (PAA / Search Console / actual user questions):

List planned FAQ questions:
1.
2.
3.

FAQ rules:
[ ] Every FAQ question is a real question users actually ask (not invented)
[ ] Every FAQ answer is complete in 2â€“4 sentences without requiring the user to read more
[ ] FAQ answers contain only verified facts â€” no "may", "might", "can sometimes"
[ ] FAQ answers do not repeat content already present in the body
[ ] FAQ section will receive FAQPage schema
[ ] No FAQ answer contradicts any claim elsewhere on the page

---

## 13. Internal Linking Requirements

Every published page must satisfy all three link directions.

### Upward links (to parent pillar)

Pillar page this page links up to:
Anchor text for upward link:
Placement of upward link (intro / body / end):

### Downward links (to children or tool)

Child pages or tool pages this page links down to:
| Destination | Anchor text | Placement |
|---|---|---|
| /text-to-speech or /audio-to-text | | |
| [child page if applicable] | | |

### Lateral links (to sibling / entity pages)

Sibling or entity pages this page links to laterally:
| Destination | Anchor text | Placement | Relationship |
|---|---|---|---|
| | | | |
| | | | |

Orphan check:
[ ] This page is linked to from its pillar page
[ ] This page is linked to from at least one other existing page
[ ] This page links to the live tool within 2 clicks
[ ] No lateral link duplicates the primary keyword of a different page (cannibalization check)

---

## 14. Schema Requirements

List every schema type this page will carry.

| Schema type | Justified by | Present in visible content? |
|---|---|---|
| BreadcrumbList | All Knowledge Center pages | Yes |
| | | |
| | | |

Schema rules:
[ ] BreadcrumbList is present on every Knowledge Center page â€” no exceptions
[ ] FAQPage schema is present only if a genuine FAQ section exists
[ ] HowTo schema is present only if the page contains numbered steps the user can follow
[ ] Article schema is used only with a real, named, verifiable author
[ ] No schema claims ratings, reviews, or aggregate scores unless real data exists
[ ] No schema describes features the product does not support
[ ] Schema validates with no errors in Google's Rich Results Test before publication

---

## 15. Evidence Requirements

Every factual claim in the page must be sourced. List the claims and their sources.

| Claim | Source | Verifiable? |
|---|---|---|
| | Backend config / product UI | |
| | | |

Evidence rules:
[ ] All product specifications (character limits, file sizes, voice counts, formats, duration limits) are verified against the live backend
[ ] No usage statistics ("millions of users", "97% accuracy") unless from a verifiable external source with a date
[ ] No performance comparisons to named competitors unless independently benchmarked
[ ] No "best", "fastest", "most accurate" superlatives without a defined, verifiable benchmark
[ ] Open-source model facts (Whisper, Kokoro) verified from official repositories or documentation
[ ] Any external claim is cited with source URL and access date in the writing notes (not necessarily visible on-page)

---

## 16. Example Requirements

Examples make abstract explanations concrete. Every how-to page and most informational pages must contain at least one worked example.

Number of examples required:
Type of example (text demo / step walkthrough / before-after / output sample):
Example source (real tool output / hypothetical / diagram):

Example rules:
[ ] Examples use realistic, non-trivial inputs (not "Hello, world")
[ ] Examples are reproducible â€” a user following the example gets the same result
[ ] Examples do not demonstrate features that do not exist in the current product
[ ] If an example references a tool, the tool is linked
[ ] Screenshots or output samples reflect the current product UI â€” not a prototype or mockup

---

## 17. Visual Requirements

Specify every visual element the page requires. Do not specify visuals that serve no informational purpose.

| Visual | Purpose | Type | Alt text draft |
|---|---|---|---|
| | | Screenshot / diagram / table / none | |

Visual rules:
[ ] Every image has a descriptive alt text (not "image1.png")
[ ] Screenshots reflect the current product UI
[ ] No placeholder, stock, or AI-generated images used to pad the page
[ ] Tables are used for structured comparative data â€” not for layout
[ ] Diagrams are used to illustrate relationships that are genuinely difficult to explain in text
[ ] All visuals are refreshed when the product UI changes (tracked in refresh checklist)

---

## 18. Trust Requirements

Trust signals are not decoration â€” they are evidence that the content is accurate and the product is real.

Required trust elements for this page:
[ ] Author attribution (name, role â€” only if a real, named person wrote or reviewed the page)
[ ] Last verified date (visible on-page or in schema)
[ ] Source citations for external claims (inline or footnoted)
[ ] Product version / limits referenced are current
[ ] No dark patterns: no inflated testimonials, no invented review scores, no fake "as seen in" logos

If this page makes security or privacy claims:
[ ] Claims are verified against the live backend
[ ] Claims reference specific, verifiable behaviour (e.g., "files are deleted after 60 minutes" â€” not "we take privacy seriously")

---

## 19. Future Update Checklist

Complete this before publication. It becomes the refresh trigger list.

| Trigger | When to update this page |
|---|---|
| Product limits change | Character limit, file size, duration, voice count, format support |
| UI changes | Screenshots, workflow steps, CTA labels |
| New feature ships | Relevant new capability should be added |
| Related page published | Add lateral link from this page |
| Search Console signals | Impressions low: review intent and intro; CTR low: review title/meta |
| 90-day review cycle | Check all claims, links, schema, and metadata |
| Competitor gap changes | If a gap closes, adjust positioning |

Scheduled first review date (90 days from publication):

---

## Section 3 â€” Content Quality Checklist

Run this checklist after the first draft is written and before peer review.

### Writing Quality

- [ ] First paragraph delivers the search promise â€” the user's question is answered before the first scroll
- [ ] No sentence requires a second read to understand
- [ ] No paragraph exceeds 4 sentences without a visual break
- [ ] No section exceeds its purpose â€” every paragraph earns its place
- [ ] Passive voice is minimised â€” active constructions preferred
- [ ] No filler phrases: "In today's world", "It goes without saying", "As we all know", "This comprehensive guide"
- [ ] No AI-generated filler patterns: "It's worth noting that", "It's important to understand", "In conclusion"
- [ ] Short sentences carry weight â€” no sentence is short purely for rhythm
- [ ] Technical terms are defined on first use or linked to the glossary

### Accuracy

- [ ] Every product fact matches the live backend (character limit, file size, voice count, format support, duration limit, deletion policy)
- [ ] No unverifiable superlatives ("best", "fastest", "most accurate") appear without a defined benchmark
- [ ] No features are described as available if they are not yet shipped
- [ ] No language support claimed beyond English
- [ ] Open-source model claims (Whisper, Kokoro) are verifiable from public sources
- [ ] All links in the draft go to real, live destinations

### Uniqueness

- [ ] This page answers something not answered by any existing Konthora page
- [ ] The primary keyword is not targeted by any other Konthora page
- [ ] The H1 is unique across the site
- [ ] The meta description is unique across the site
- [ ] No section copies or closely paraphrases any other Konthora page

### Completeness

- [ ] All required sections from the specification are present
- [ ] All FAQ questions are answered fully
- [ ] All examples specified are present and working
- [ ] All internal links specified are present
- [ ] The CTA is present and functional
- [ ] Schema is drafted and ready for implementation

---

## Section 4 â€” AI Overview Optimization Checklist

Google AI Overviews and AI assistants (Perplexity, ChatGPT, Bing Copilot) favour content with specific structural and factual characteristics. Complete this checklist before publication for every informational and definitional page.

### Answer Structure

- [ ] The first sentence of the page body directly answers the primary keyword query â€” no preamble
- [ ] The direct answer is self-contained: a user reading only the first 2â€“3 sentences gets a complete, usable answer
- [ ] The direct answer does not require the user to click through to another page to be useful
- [ ] The page contains at least one paragraph structured as: **[Term] is [definition]. [How it works]. [Why it matters].**

### Factual Density

- [ ] The page contains specific, verifiable facts (numbers, dates, named technologies, named models)
- [ ] The page avoids vague hedging ("some tools may", "it can sometimes") where a direct fact is available
- [ ] Every claim that AI systems might cite is verifiably accurate â€” no invented statistics

### Structural Signals

- [ ] H2 and H3 headings are phrased as questions or direct topic labels that match PAA-style queries
- [ ] The FAQ section contains real questions users search for â€” structured for PAA and AI citation
- [ ] Lists are used where the answer is genuinely list-structured (steps, features, types) â€” not forced
- [ ] If the page answers "how to" â€” the steps are numbered and each step is a single, complete action

### Entity Signals

- [ ] The page names the entities it discusses (Whisper, Kokoro, ASR, neural TTS) using their correct, full names
- [ ] Entities are consistent in spelling and capitalisation throughout
- [ ] Where applicable, entity pages (e.g., `/entity/whisper/`) are linked using the entity's name as anchor text
- [ ] The page does not use synonyms for entities inconsistently (e.g., mixing "Whisper", "the Whisper model", "OpenAI's Whisper", "whisper" â€” pick a consistent form)

### Citation Readiness

- [ ] Claims are written in a form that can be cited as a standalone sentence without losing meaning
- [ ] The page's name and URL are in the title tag and H1 in a form that makes the source clear if cited
- [ ] If the page makes a claim about Konthora's product, the claim is accurate and conservative enough to survive fact-checking

---

## Section 5 â€” Featured Snippet Optimization Checklist

Featured snippets appear above organic results. They are captured by pages that answer the query format directly and precisely. Complete this checklist for every informational and definitional page.

### Identify the Snippet Opportunity

- [ ] The primary keyword SERP currently shows a Featured Snippet (check manually)
- [ ] The snippet format has been identified: paragraph / list / table / steps
- [ ] The current snippet holder has been noted (for gap awareness â€” not for copying)

### Paragraph Snippet (definition or explanation queries)

If the primary keyword is "what is X" or "how does X work":

- [ ] The page contains a paragraph of 40â€“60 words that directly answers the query
- [ ] The paragraph begins with the subject: "[Term] isâ€¦" or "[Term] works byâ€¦"
- [ ] The paragraph does not start with "In this article" or the page title
- [ ] The paragraph is immediately under an H2 that matches or closely mirrors the query

### List Snippet (features, types, steps, tools)

If the primary keyword implies a list ("types of", "ways to", "steps to"):

- [ ] The page contains a bulleted or numbered list that directly answers the query
- [ ] The list has 4â€“8 items (longer lists are less likely to be shown in full)
- [ ] Each list item is a complete, self-explanatory label â€” not a fragment
- [ ] The list is preceded by an H2 or H3 that contains the query keyword

### Table Snippet (comparison or specification queries)

If the primary keyword implies comparison or specs:

- [ ] The page contains a Markdown table with clear column headers
- [ ] The table compares only verified, current data
- [ ] The table is not so wide that it loses readability on mobile

### Steps Snippet (how-to queries)

If the primary keyword is "how to X":

- [ ] The page contains numbered steps under a heading that contains "how to"
- [ ] Each step is a single action â€” not a multi-sentence paragraph
- [ ] Steps are in the correct logical order
- [ ] HowTo schema is applied to the steps section

### General Rules

- [ ] The snippet-target content appears in the first 25% of the page body
- [ ] The H2 above the snippet-target content mirrors the query phrasing closely
- [ ] The snippet content does not link out (links inside snippet targets are ignored by Google)
- [ ] Title tag includes the primary keyword in the first 60 characters

---

## Section 6 â€” E-E-A-T Checklist

Google's Quality Rater Guidelines evaluate Experience, Expertise, Authoritativeness, and Trustworthiness. Complete this checklist before publication.

### Experience

- [ ] The page demonstrates real, first-hand experience with the product or technology
- [ ] Examples are drawn from actual tool usage, not from hypothetical scenarios
- [ ] If the page describes a workflow, the workflow has been tested with the live product
- [ ] Screenshots and output samples are from the real product, not mockups

### Expertise

- [ ] The content is written at the appropriate depth for the target audience
- [ ] Technical terms are used correctly and consistently
- [ ] The content would satisfy a knowledgeable reader's question â€” not just a beginner's
- [ ] Claims about technology (Whisper, Kokoro, ASR, neural TTS) are accurate and verifiable
- [ ] If an author is named, their relevant expertise is stated (role, relevant background)

### Authoritativeness

- [ ] The page links to authoritative sources for external claims (official model repositories, academic references, official documentation)
- [ ] Other Knowledge Center pages and the live tools link to this page (planned or existing)
- [ ] The page is the designated owner of its primary keyword â€” no other Konthora page targets it
- [ ] Entity pages correctly reference the entities they define, using names that match knowledge graph expectations

### Trustworthiness

- [ ] All product capabilities described are currently live and verifiable
- [ ] Privacy and data handling claims are accurate and match the backend behaviour
- [ ] No invented testimonials, scores, user counts, or "as seen in" claims
- [ ] Contact information and support path (`hello@konthora.dev.bd`) are accessible from the site
- [ ] The canonical URL is correctly set
- [ ] HTTPS is in use (verified)
- [ ] The page has no broken links or missing images at the time of publication
- [ ] The deletion policy (60-minute auto-delete) is accurately described wherever referenced

---

## Section 7 â€” Final Publication Checklist

This is the last gate before a page is published. Every item must be checked by the reviewer â€” not the writer.

### Content

- [ ] Content Quality Checklist (Section 3) is complete with no failing items
- [ ] AI Overview Checklist (Section 4) is complete
- [ ] Featured Snippet Checklist (Section 5) is complete for applicable queries
- [ ] E-E-A-T Checklist (Section 6) is complete with no failing items
- [ ] Page specification (Section 2) was completed before writing began â€” confirm

### SEO

- [ ] H1 contains the primary keyword and is unique across the site
- [ ] Title tag is unique, under 60 characters, and contains the primary keyword
- [ ] Meta description is unique, 120â€“155 characters, and delivers the search promise
- [ ] Canonical URL is set to the intended final URL
- [ ] Index / noindex decision is documented and correctly implemented
- [ ] robots.txt does not accidentally block this URL
- [ ] XML sitemap will include this URL after publication

### Internal Linking

- [ ] Upward link to pillar is present
- [ ] Downward link to live tool is present (within 2 clicks)
- [ ] At least 2 lateral links to siblings or entity pages are present
- [ ] This page has been added as a link destination from its pillar page (or the pillar update is queued)
- [ ] No orphan state: at least one existing published page links to this page

### Schema

- [ ] BreadcrumbList is present and validated
- [ ] All additional schema types pass Google's Rich Results Test with no errors
- [ ] Schema matches visible content exactly â€” no schema for invisible or non-existent content

### Technical

- [ ] Page loads in under 3 seconds on a mid-range mobile device (PageSpeed check)
- [ ] Page is usable on a 375px-wide viewport without horizontal scroll
- [ ] All images have alt text
- [ ] All links resolve to live destinations (no 404s)
- [ ] Open Graph title and description are set
- [ ] Twitter card meta tags are set

### Final Decisions

- [ ] **Index / noindex** â€” decision confirmed:
  - Editorial pages: index (default)
  - Thin utility or near-duplicate pages: noindex pending improvement
- [ ] **Canonical** â€” self-canonical set
- [ ] **Sitemap** â€” URL will appear in sitemap after deployment
- [ ] **Search Console** â€” URL will be submitted or will be discovered via sitemap
- [ ] **Refresh date** â€” 90-day review date recorded

---

## Section 8 â€” Product Facts Reference

The following facts are verified from the live backend. Every page must use these figures. Do not use any other figures without verifying the backend first.

| Fact | Value |
|---|---|
| TTS character limit | 2,000 characters per generation |
| TTS output formats | MP3, WAV |
| TTS speed range | 0.75Ã— to 1.25Ã— |
| TTS voice count | 10 (6 US, 4 UK; male and female) |
| TTS model | Kokoro-based neural synthesis |
| TTS language | English only |
| Transcription file size limit | 100 MB |
| Transcription duration limit | 10 minutes |
| Transcription accepted formats | MP3, WAV, M4A, AAC, MP4, WebM, MOV |
| Transcription language | English (auto-detect routes to English) |
| Transcription timestamp modes | Sentence, paragraph, word |
| Transcription export formats | TXT, SRT, VTT, JSON |
| Transcription model | Whisper (small.en) |
| File / transcript retention | 60 minutes (automatic deletion) |
| Account requirement | None |
| Storage type | Browser-based; TTS text in-memory only |
| Live TTS tool URL | `/text-to-speech` |
| Live transcription tool URL | `/audio-to-text` |
| Support email | hello@konthora.dev.bd |
| Canonical domain | https://konthora.dev.bd |

> **Update this reference whenever the backend changes.** Any page that cites these figures must be flagged for review when this table is updated.

---

## Section 9 â€” Disallowed Content Patterns

The following patterns are prohibited in all Knowledge Center pages. Reviewers must reject any page containing them.

| Pattern | Why prohibited |
|---|---|
| "In today's fast-paced worldâ€¦" | AI filler â€” no informational value |
| "As an AI language modelâ€¦" | Reveals AI authorship without value |
| "It's worth noting thatâ€¦" | Padding â€” state the fact directly |
| "Comprehensive guide toâ€¦" in H1 | Hollow superlative â€” state the actual topic |
| "Best X for Y" without a verifiable benchmark | Unsupported comparative claim |
| Usage figures without a source and date | Invented social proof |
| "Millions of users" or similar | Unverifiable â€” prohibited unless sourced |
| Competitor capability claims | Risk of inaccuracy â€” prohibited unless independently verified |
| Feature claims for unshipped features | Misleads users and Search Console |
| "Coming soon" sections on indexed pages | Index bloat + poor experience |
| Testimonials without real attribution | Fake social proof |
| Author bio for a non-existent or unnamed author | E-E-A-T violation |
| Schema for ratings/reviews without real data | Schema spam â€” grounds for manual action |
| Any claim that Konthora supports languages beyond English | Product fact error |
| Any claim that Konthora supports more than 10 voices | Product fact error (update if voices are added) |

---

## Section 10 â€” Revision History

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-08-06 | Initial framework â€” 10 sections, 24 checklist categories |

When this framework is updated, all in-progress page specifications must be reviewed for compatibility with the new version.

---

*Framework status: Active. No exceptions. Every Knowledge Center page begins here.*
