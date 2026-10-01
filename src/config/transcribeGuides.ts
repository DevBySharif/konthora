/**
 * Shared content model for the /transcribe-* use-case guides.
 *
 * These pages were seven hand-maintained 352-line clones that differed only in
 * the nouns: same H2 headings, same five workflow steps, same three FAQs, ~700
 * shared tokens each. Google read that as seven attempts to rank one page and
 * refused to index them ("Crawled - currently not indexed", 12 affected pages).
 *
 * Each entry below now carries genuinely different prose: a distinct angle, its
 * own section headings, use-case-specific steps and use-case-specific FAQs. The
 * renderer is shared so structure stays consistent, but the content is not
 * swappable.
 */

export interface GuideStep {
  title: string;
  body: string;
}

export interface GuideSection {
  id: string;
  heading: string;
  /** Paragraphs of body copy. Inline links use [label](/path) syntax. */
  paragraphs: string[];
}

export interface GuideFaq {
  question: string;
  answer: string;
}

export interface GuideContent {
  slug: string;
  /** Short label used in the breadcrumb. */
  label: string;
  /**
   * The noun phrase that completes the h1. The renderer emits
   * "How to {h1Highlight}", so this must read as a complete phrase on its own:
   * "Transcribe a Podcast", not "Podcast".
   */
  h1Highlight: string;
  title: string;
  description: string;
  /** One or two sentences under the h1. */
  lede: string;
  howToName: string;
  howToDescription: string;
  steps: GuideStep[];
  sections: GuideSection[];
  faqs: GuideFaq[];
  /** Page this guide is most useful next to, shown as the closing CTA. */
  ctaHref: string;
  ctaLabel: string;
}

export const GUIDES: GuideContent[] = [
  /* ─────────────────────────── podcast ─────────────────────────── */
  {
    slug: 'transcribe-podcast',
    label: 'Transcribe a Podcast',
    h1Highlight: 'Transcribe a Podcast',
    title: 'How to Transcribe a Podcast Episode into Text | Konthora',
    description:
      'Turn a podcast episode into a searchable transcript and captioned video. Covers splitting long episodes, two-host audio and picking an export format.',
    lede:
      'A podcast transcript does three jobs at once: it makes your episode searchable, it lets listeners skim instead of listen, and it gives you raw material to turn one recording into a week of content. This guide covers the whole path from a finished episode file to published captions.',
    howToName: 'How to produce a transcript for a podcast episode',
    howToDescription:
      'A five-step path from a finished episode file to a published transcript, including how to handle episodes longer than the ten-minute limit.',
    steps: [
      {
        title: 'Split the episode into parts that fit the limit',
        body: 'Konthora accepts up to 10 minutes per file. Most podcast episodes are 30 to 90 minutes, so split yours at a natural break — a topic change, a sponsor read, or the end of a segment — rather than an arbitrary timestamp. Transcribe each part and keep the pieces in order.',
      },
      {
        title: 'Upload the part you want captioned',
        body: 'Drop the file into the workspace. If your show publishes video, upload the MP4 and the audio track is extracted automatically. No account is needed.',
      },
      {
        title: 'Pick sentence timestamps for show notes and highlights',
        body: 'Sentence mode gives each line a start and end time, which is what you want when you are pulling quotes or building chapter markers. Use word mode only if you need subtitle-accurate alignment.',
      },
      {
        title: 'Run the transcription and wait for the result',
        body: 'Processing happens on a CPU worker and takes roughly the length of the audio. Episode music beds and overlapping speech are the two things most likely to need a manual pass afterwards.',
      },
      {
        title: 'Export SRT or VTT if you publish video, TXT if you do not',
        body: 'Audio shows take a plain transcript. Video shows need SRT or VTT for the player or the platform. Export before the 60-minute retention window closes.',
      },
    ],
    sections: [
      {
        id: 'why-podcast-transcripts',
        heading: 'What a podcast transcript is actually for',
        paragraphs: [
          'The most common reason is repurposing. One 45-minute interview contains enough quotable material for a newsletter, a handful of social clips, and a written summary, and writing that by hand means listening to the tape three more times. A transcript turns the searching problem into a reading problem.',
          'The second reason is reach. Listeners who are deaf or hard of hearing, people who are not native speakers of your language, and anyone who simply prefers reading all rely on the written version. Several podcast directories also treat transcripts as a quality signal, and some players will surface a transcript as a separate search result.',
          'The third is searchable archives. Nobody scrolls back through forty episodes looking for the moment you explained pricing. With transcripts indexed, that sentence can be found.',
        ],
      },
      {
        id: 'long-episodes',
        heading: 'Handling episodes longer than ten minutes',
        paragraphs: [
          'The ten-minute ceiling is a hard limit, not a soft warning, and it exists because the transcription model runs locally on limited hardware. Rather than compress or truncate your audio, split the file.',
          'Split on structure, not on the clock. If your episode has segments, transcribe each segment as its own file. If it is a single conversation, split on a long pause or a clear change of subject. A transcript that reads in the right order afterwards is one you can publish without editing.',
          'When you reassemble the parts, keep a small amount of overlap. Models occasionally drop the first few words of a file, so overlapping by a second or two on each join means no sentence is lost at the seam.',
        ],
      },
      {
        id: 'episode-quality',
        heading: 'Two-speaker audio and music beds',
        paragraphs: [
          'A conversation between two hosts is a harder case than one speaker reading. The model does not label speakers, so if you need to know who said what, you will be matching the transcript against the audio yourself. Word mode helps here, because tighter timings make it easier to follow a line back to the recording.',
          'Intro and outro music is a different problem. Music is not speech, so it produces either nothing or a scattering of mis-transcribed words. The fix is to trim the bed before upload rather than trying to clean it afterwards.',
          'Remote recordings are worth checking first. Two people recorded on separate machines in different rooms arrive with noticeably different levels, and the quieter speaker is where most errors appear.',
        ],
      },
      {
        id: 'publishing-transcripts',
        heading: 'Publishing the transcript',
        paragraphs: [
          'For an audio show, put the transcript on your own site under a stable URL and link it from the episode description. Host it yourself rather than relying only on a platform page, since you want it indexed against your domain.',
          'For a video show, the captions are the transcript. Upload the SRT to the platform and keep the file; the platform will also generate its own, and having yours means the timing is the timing you intended.',
          'Whichever you choose, export early. Results are held for 60 minutes, and a finished episode transcript that expires while you are writing the show notes is an afternoon you will not get back.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can Konthora transcribe a full 60-minute episode in one go?',
        answer:
          'No. Media is capped at 10 minutes per file, so a full episode needs splitting into parts. Split at a topic change or a sponsor break rather than an arbitrary timestamp, overlap each join by a second so no sentence is lost, then export the parts in order.',
      },
      {
        question: 'Will the transcript tell me who said what?',
        answer:
          'No. Speaker labels are not produced, so for a two-host or interview episode you will match the text back to the audio yourself. Word-level timestamps make that job easier because each word has its own timing.',
      },
      {
        question: 'What happens to the music in my intro and outro?',
        answer:
          'Music is not speech, so it produces either nothing or a scattering of mis-transcribed words. Trim the intro and outro beds out of the file before uploading rather than cleaning up the transcript afterwards.',
      },
      {
        question: 'Is there a size or format limit on podcast episodes?',
        answer:
          'Up to 100 MB and 10 minutes per file. Audio inputs are MP3, WAV, M4A and AAC; MP4, WebM and MOV are accepted too, and the audio track is extracted automatically for video shows.',
      },
    ],
    ctaHref: '/audio-to-text',
    ctaLabel: 'Open the transcription tool',
  },

  /* ─────────────────────────── interview ─────────────────────────── */
  {
    slug: 'transcribe-interview',
    label: 'Transcribe an Interview',
    h1Highlight: 'Transcribe an Interview',
    title: 'How to Transcribe an Interview | Konthora',
    description:
      'Transcribe a recorded interview into quotable text. Covers multi-speaker audio, pulling clean quotes and preparing audio before transcription.',
    lede:
      'An interview transcript has a different job from a podcast transcript. You are not publishing the whole thing — you are mining it for a handful of accurate quotes. That changes what you need: tighter timing, clean paragraph breaks, and a transcript you can trust enough to publish without a fact-check pass.',
    howToName: 'How to transcribe a recorded interview',
    howToDescription:
      'A five-step path from a finished interview recording to a transcript you can quote from, including how to handle two speakers on one track.',
    steps: [
      {
        title: 'Consolidate the recording to a single file',
        body: 'Interviewers often record the local end and the remote end separately. Combine or choose the better track first — the two usually have different levels, and the weaker one is where errors concentrate.',
      },
      {
        title: 'Trim the pre-roll and dead air',
        body: 'Long silences and tape-room noise at the head and tail of the file do not produce useful text and only slow the job down. Cut them before upload.',
      },
      {
        title: 'Upload the recording in sentence mode',
        body: 'Sentence mode is the right default for interviews. It gives you one timestamp per sentence, which is exactly the granularity you need to find a quote later and verify it against the recording.',
      },
      {
        title: 'Transcribe, then read it against the audio once',
        body: 'The transcript is a first pass, not a legal record. Read it against the audio and correct anything that matters for your piece. Proper nouns and numbers deserve the closest attention.',
      },
      {
        title: 'Export TXT to read, JSON if you are scripting',
        body: 'TXT for reading and copying quotes. JSON carries per-word timing, which is useful if you are building a searchable quote index or aligning audio to text in a player. Export as soon as the result is ready: results are held for 60 minutes, and a verified interview transcript that expires before you have written up your quotes is an afternoon you will not get back.',
      },
    ],
    sections: [
      {
        id: 'interview-accuracy',
        heading: 'Accuracy you can actually publish',
        paragraphs: [
          'Automatic transcription is good enough to find a quote and accurate enough to check quickly. It is not accurate enough to skip checking. The failures are predictable: brand names, surnames, job titles, numbers, and anything said while someone laughs or talks over the speaker.',
          'Read the transcript against the audio once, marking anything you plan to quote. If a quote will appear in a published piece, verify it word for word. This is faster than it sounds, because you are reading two short things side by side rather than re-listening to forty minutes.',
          'If a quotation is legally sensitive — anything in a recorded interview that might be contested — transcribe it, check it, and keep the audio. The transcript is a finding aid, not evidence.',
        ],
      },
      {
        id: 'two-speakers',
        heading: 'Two speakers on one track',
        paragraphs: [
          'Konthora does not label speakers. For an interview that means you are attributing lines yourself, and the fastest way to do that is to transcribe with word-level timestamps so you can jump to a moment in the recording without scrubbing blind.',
          'If you recorded the interview on two machines, you have a genuine advantage: you already know which half of the audio belongs to which person, so attribution is a matter of cutting rather than inferring. Merge them in order and transcribe the combined file.',
          'A single combined track is harder. Look for the practical tells — pitch, pace, and turn-taking rhythm are usually enough to follow a two-person conversation, but budget time for it.',
        ],
      },
      {
        id: 'finding-quotes',
        heading: 'Finding the quote worth using',
        paragraphs: [
          'Sentence timestamps make the transcript searchable in a way that matters here: you can skim the text for a phrase, note the timestamp, and jump straight to that point in the recording to check the delivery. A quote that reads well in text may sound wrong in the actual sentence, and the timestamp is how you find that out quickly.',
          'Paragraph mode is better when you are looking for a passage rather than a single line, because it keeps the surrounding sentences together and the context usually determines whether a quote stands up.',
          'Word mode is the right choice only when you need subtitles or karaoke-style alignment for a published clip.',
        ],
      },
      {
        id: 'before-recording',
        heading: 'Advice that happens before transcription',
        paragraphs: [
          'The quality ceiling is set at recording time, not at transcription time. A single mic in the middle of a table beats two mics at opposite ends of a room, and a lav on the speaker beats a laptop microphone by a wide margin.',
          'Ask your subject to spell names and terms you will need. A five-second confirmation at the start of the recording removes the most common transcription error before it happens.',
          'If the recording is already made and rough, do not discard it. Trim the worst noise, run the transcription, and correct the transcript by hand. That is usually faster than re-recording and it is always better than publishing an inaccurate quote.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does Konthora label who is speaking in an interview?',
        answer:
          'No. There is no speaker diarisation, so lines are not attributed. Use word-level timestamps to follow a line back to the recording, or merge two separately recorded tracks in order so you already know which half belongs to whom.',
      },
      {
        question: 'How accurate is the transcript, and should I fact-check it?',
        answer:
          'It is accurate enough to locate a quote and then verify it quickly, but you should read it against the audio once before publishing. Names, job titles, numbers and anything said over background noise are the usual failure points.',
      },
      {
        question: 'Can I transcribe an interview longer than 10 minutes?',
        answer:
          'Media is capped at 100 MB and 10 minutes per file, so longer interviews need splitting. Split at topic changes and overlap the joins by about a second, since models can drop the first words of a file.',
      },
      {
        question: 'What if I recorded the interview on two devices?',
        answer:
          'Combine the two tracks in order, or transcribe them separately. Because you know which half of the audio belongs to each person, attribution becomes a matter of cutting rather than guessing, which is the most reliable way to work.',
      },
    ],
    ctaHref: '/audio-to-text',
    ctaLabel: 'Open the transcription tool',
  },

  /* ─────────────────────────── meeting ─────────────────────────── */
  {
    slug: 'transcribe-meeting',
    label: 'Transcribe a Meeting',
    h1Highlight: 'Transcribe a Meeting',
    title: 'How to Transcribe a Meeting and Get Action Items | Konthora',
    description:
      'Turn a recorded meeting into notes, decisions and action items. Covers multi-speaker calls, splitting long meetings and the timestamp mode to choose.',
    lede:
      'Nobody wants a wall of transcribed dialogue after a meeting. What you want is decisions, owners and dates. This guide covers turning a raw recording into something you would actually circulate — and being honest about which parts still need a human.',
    howToName: 'How to transcribe a meeting into notes and action items',
    howToDescription:
      'A five-step path from a recorded call to circulated notes, including how to handle meetings longer than the ten-minute limit.',
    steps: [
      {
        title: 'Split anything past ten minutes',
        body: 'Meetings routinely run 30 to 60 minutes. Split on agenda items so each part is a coherent topic, transcribe the parts, and read them back in order. Keeping the split aligned to the agenda makes the reassembly trivial.',
      },
      {
        title: 'Upload one part and choose paragraph mode',
        body: 'Paragraph mode groups related discussion into blocks that read like notes rather than dialogue. It is the most useful mode for meetings because you are after themes, not individual lines.',
      },
      {
        title: 'Transcribe and read for decisions',
        body: 'Look for sentences where a decision was actually made. "I think we should" is a discussion; "we decided to" is a decision. The transcript is much better at separating the two than memory is.',
      },
      {
        title: 'Extract action items with their owners',
        body: 'For every commitment, capture who made it, what they will do, and by when. This is the step people skip, and it is the reason a transcript is often more useful than a recording nobody reopens.',
      },
      {
        title: 'Export TXT for notes, SRT if the meeting was recorded for video',
        body: 'Most meetings want plain text. Export before the 60-minute retention window expires — the follow-up task list is the whole point.',
      },
    ],
    sections: [
      {
        id: 'what-to-extract',
        heading: 'What to extract from a meeting transcript',
        paragraphs: [
          'A recording contains a great deal of material that nobody wants in writing. The value of a transcript is not completeness, it is extraction. Three things are worth pulling out: the decisions that were made, the actions that were assigned, and the open questions that nobody closed.',
          'Language is the fastest filter. Decisions cluster around "we decided", "let us go with", "we will use". Actions cluster around a name followed by a verb — "Sarah will send", "I will draft". Everything else is context you can read once and discard.',
          'Worth writing down explicitly: anything that was discussed and left unresolved. Meetings that end without a decision often look productive while producing nothing, and a transcript makes that visible in a way that memory does not.',
        ],
      },
      {
        id: 'multi-speaker-calls',
        heading: 'Multi-speaker calls and bad audio',
        paragraphs: [
          'Conference calls are the hardest audio there is. Every participant is on a different codec, levels vary wildly, and one person is usually on a phone line. Expect more errors than a single-mic recording, and give yourself time for a correction pass.',
          'If you control the setup, ask for headphones rather than speakers. Headphones remove the feedback path that makes distant participants hard to hear, which is usually the single biggest quality win available.',
          'If the call is already recorded and rough, transcribe it anyway. The transcript will be usable for decisions even when individual words are wrong, and correcting a rough transcript is far faster than reconstructing decisions from memory a week later.',
        ],
      },
      {
        id: 'sharing-notes',
        heading: 'Turning the transcript into notes people read',
        paragraphs: [
          'Do not circulate raw dialogue. Nobody reads a wall of transcribed speech, so a transcript that is merely dumped into a document produces the appearance of documentation and none of the benefit.',
          'Restructure it. Group by agenda item, pull decisions and actions to the top, and keep the transcript underneath as the record of what was actually said. The structure is what makes it read; the transcript is what makes it checkable.',
          'Keep timestamps in whatever you send. When someone disputes a decision two days later, the timestamp turns an argument into a thirty-second listen.',
        ],
      },
      {
        id: 'long-meetings',
        heading: 'Meetings longer than ten minutes',
        paragraphs: [
          'The limit is 10 minutes and 100 MB per file, so any realistic meeting needs splitting. Split on agenda items rather than on elapsed time: each part then covers one topic, and reassembly is obvious.',
          'Keep the agenda to hand while you split. It is the only reliable way to find the natural break points, and it means each part has a title you can use in the notes.',
          'Overlap the joins by about a second. A model occasionally drops the opening words of a file, and a one-second overlap costs nothing but prevents a lost sentence at each boundary.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can Konthora identify who said what in a meeting?',
        answer:
          'No. There is no speaker labelling, so lines come back unattributed. For follow-up you will be reading for commitments and attributing them yourself; word-level timestamps make that easier by letting you jump to a moment in the recording.',
      },
      {
        question: 'How do I get action items out of a long meeting recording?',
        answer:
          'Split the recording on agenda items, transcribe each part in paragraph mode, then scan for decision language such as "we decided" and for a name followed by a verb. Those two patterns find most commitments far faster than reading the whole transcript.',
      },
      {
        question: 'What is the maximum meeting length Konthora can handle?',
        answer:
          '10 minutes and 100 MB per file, so a 60-minute meeting needs roughly six parts. Split on agenda items, overlap the joins by a second so no sentence is lost, and export each part before the 60-minute retention window closes.',
      },
      {
        question: 'Is a transcript a reliable record of what was agreed?',
        answer:
          'It is a good first pass and far better than memory, but it is not a legal record. Read it against the audio before circulating anything externally, and keep the original recording for anything that may be contested.',
      },
    ],
    ctaHref: '/audio-to-text',
    ctaLabel: 'Open the transcription tool',
  },

  /* ─────────────────────────── lecture ─────────────────────────── */
  {
    slug: 'transcribe-lecture',
    label: 'Transcribe a Lecture',
    h1Highlight: 'Transcribe a Lecture',
    title: 'How to Transcribe a Lecture for Notes and Captions | Konthora',
    description:
      'Turn a recorded lecture into accessible notes and captions. Covers long class recordings, dividing by lecture segment and student study use.',
    lede:
      'A lecture recording is worth more as text than almost any other kind of audio. Students skim notes instead of rewinding at double speed, you can reuse a recording as written material, and captions make the recording usable by the people in the room who cannot rely on sound alone.',
    howToName: 'How to transcribe a recorded lecture',
    howToDescription:
      'A five-step path from a recorded class session to accessible notes and captions, including how to handle a lecture longer than ten minutes.',
    steps: [
      {
        title: 'Split the lecture by topic, not by clock',
        body: 'Align the split to your lecture outline — introduction, first concept, worked example, second concept. Each part then has a title you can use in the notes, and reassembly is obvious.',
      },
      {
        title: 'Upload the part you want to distribute',
        body: 'For a recorded lecture with a camera, upload the MP4 and the audio track is extracted automatically. A phone recording of the audio alone works too. No account is needed.',
      },
      {
        title: 'Choose sentence timestamps for study notes',
        body: 'Sentence mode gives each line a start and end time, which is what you want for notes students can scan and search. Switch to word mode only for captioned video where exact alignment matters.',
      },
      {
        title: 'Transcribe and check the technical terms',
        body: 'Domain vocabulary is where a general-purpose model struggles. Expect errors in course names, notation read aloud, and discipline-specific terms, and correct those specifically.',
      },
      {
        title: 'Export TXT for notes, SRT or VTT for captioned video',
        body: 'Notes are usually text. Captioned course video needs SRT or VTT. Export each part before the 60-minute retention window closes.',
      },
    ],
    sections: [
      {
        id: 'lecture-accessibility',
        heading: 'Captions and access in the room',
        paragraphs: [
          'A recording with no captions excludes the students who are deaf or hard of hearing, and it excludes everyone else whenever the room is too noisy to hear clearly on a laptop speaker. Captions are what turns a recording into an accessible one.',
          'Caption quality matters more than caption presence. Word-level timestamps are worth choosing here, because captions that drift out of sync with the audio are arguably worse than no captions at all, because viewers trust them and stop watching the screen.',
          'Ship both when you can. A transcript is more accessible for someone skimming or using a screen reader; captions are more accessible for someone watching the video. Neither replaces the other, and together they cost nothing extra.',
        ],
      },
      {
        id: 'study-materials',
        heading: 'Turning a lecture into study material',
        paragraphs: [
          'The best argument for a lecture transcript is that it inverts how students use the recording. Audio forces linear consumption at real time or nobody uses it. Text can be skimmed, searched, and read at 3am before an exam, and that is when a lecture is actually worth having.',
          'Edit rather than dump. Restructure by lecture segment, fix the technical vocabulary, and pull out definitions, worked examples and anything you flagged as important at the time. A raw transcript is a document to edit; the edited version is a study resource.',
          'Distribute the notes before the exam, not after. The value is retrieval and revision, and both are worthless if the material arrives too late to be useful.',
        ],
      },
      {
        id: 'technical-vocabulary',
        heading: 'Technical vocabulary and notation',
        paragraphs: [
          'The transcription model is general-purpose, so discipline-specific terms are where you will do the most correction. Course names, abbreviations, notation spoken aloud, and anything with a non-obvious pronunciation are the usual casualties.',
          'A practical trick is to write the key terms down as you record the lecture. A short list of spellings to check afterwards is much more effective than reading the entire transcript hunting for errors you do not know to look for.',
          'Worked examples deserve particular attention. A mis-transcribed number or a swapped variable turns a correct method into a wrong one, and a student following the transcript will get the wrong answer while believing they have understood it.',
        ],
      },
      {
        id: 'long-lectures',
        heading: 'Lectures longer than ten minutes',
        paragraphs: [
          'Media is capped at 10 minutes and 100 MB per file, so a single lecture hour needs around six parts. Use your lecture outline to place the splits.',
          'Overlap each join by about a second. Models occasionally drop the opening words of a file, and a one-second overlap means a sentence spanning a boundary survives in at least one part.',
          'Label each part as you go. With six files to reassemble, an untitled set of parts is genuinely hard to put back in order a week later, and that is exactly when the notes are being written.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can Konthora handle a full 90-minute lecture?',
        answer:
          'Not in one file. The limit is 10 minutes and 100 MB per upload, so a 90-minute lecture needs about nine parts. Split along your lecture outline and overlap the joins by a second, then transcribe each part in order.',
      },
      {
        question: 'Which timestamp mode should I choose for a lecture?',
        answer:
          'Sentence mode for study notes, because students scan and search text rather than follow timings. Word-level only when you are producing captioned video, where captions that drift out of sync are worse than no captions at all.',
      },
      {
        question: 'How do I fix errors in technical terminology?',
        answer:
          'The model is general-purpose, so expect errors in course names, notation spoken aloud and discipline terms. Keep a list of the terms that matter as you record, and check only those. Worked examples need the closest attention, since a wrong number or swapped variable produces a correct-looking but incorrect method.',
      },
      {
        question: 'Do I need both captions and a transcript?',
        answer:
          'For accessibility, ideally yes. Captions serve someone watching the video; a transcript serves someone skimming or using a screen reader. Both come from the same transcription run, so exporting both costs nothing extra.',
      },
    ],
    ctaHref: '/audio-to-text',
    ctaLabel: 'Open the transcription tool',
  },

  /* ─────────────────────────── video ─────────────────────────── */
  {
    slug: 'transcribe-video',
    label: 'Transcribe Video',
    h1Highlight: 'Transcribe Video into Subtitles',
    title: 'How to Transcribe Video into Subtitles | Konthora',
    description:
      'Generate subtitles and transcripts from video. Covers extracting audio, subtitle timing, caption standards and which file format to upload.',
    lede:
      'Video is the one format where a transcript is not optional. Captions are expected, they are often the only way a significant share of viewers can follow along, and on platforms like YouTube the text is indexed — so a caption file is quietly a search asset too.',
    howToName: 'How to create subtitles for a video',
    howToDescription:
      'A five-step path from a video file to published subtitles, including why the audio track is what actually gets transcribed.',
    steps: [
      {
        title: 'Upload the video file directly',
        body: 'MP4, WebM and MOV are all accepted. Konthora extracts the audio track automatically and transcribes the speech in it, so you do not need to pull an audio file out first.',
      },
      {
        title: 'Choose word-level timestamps for subtitles',
        body: 'Subtitle quality depends on tight timing. Word mode gives each word its own timestamp, which is what keeps captions in sync with the speaker instead of trailing them.',
      },
      {
        title: 'Run the transcription',
        body: 'Processing is CPU-bound and takes roughly the length of the audio. Very long videos need splitting first, since the limit is 10 minutes per file.',
      },
      {
        title: 'Proof the captions against the video once',
        body: 'Watch the first two minutes with the captions open. Non-speech sound — laughter, applause, a door — has no correct caption, and a caption file that desynchronises early puts a viewer straight out of sync for the rest.',
        },
      {
        title: 'Upload SRT or VTT to your platform',
        body: 'SRT is the near-universal subtitle format; VTT is what HTML5 players want. Keep the file after uploading, because platforms re-generate captions and yours is the version with the timing you intended. Download it within the 60-minute retention window, since a caption file is much more work to recreate than an upload is to retry.',
      },
    ],
    sections: [
      {
        id: 'audio-track',
        heading: 'What actually gets transcribed',
        paragraphs: [
          'Konthora transcribes the audio track of a video, not the picture. That distinction matters for two reasons. First, a video with a silent or music-only audio track produces no text, however interesting the visuals are. Second, burned-in text in the video frame is not read, because it is not audio.',
          'If your video has narration, it transcribes that. If your video is a screencast with no voiceover, the transcript will be empty, and no transcription tool can help — the information is in the frames, not the track.',
          'Upload the original rather than a heavily compressed re-encode where you have a choice. Video platforms routinely transcode to low bitrates, and the artefacts they introduce are audible to the model as garbled speech.',
        ],
      },
      {
        id: 'subtitle-timing',
        heading: 'Why word-level timing matters for captions',
        paragraphs: [
          'Captions are read at roughly 160 to 180 words per minute, and a reader needs the text to arrive when the words are spoken. Sentence-level timing puts a whole sentence on screen for its entire duration, so the viewer reads a line while the speaker has already moved on.',
          'Word-level timestamps fix this: the cue reflects what is actually being said at that moment, so the captions track the voice instead of lagging behind it. This is the single biggest quality difference between an automated caption file and a usable one.',
          'There is a cost. Word mode produces more cues and a larger file, and some older players handle dense cues poorly. If your audience is on a modern HTML5 player, take the improvement.',
        ],
      },
      {
        id: 'caption-standards',
        heading: 'Caption standards and reading speed',
        paragraphs: [
          'Two lines maximum per caption is the near-universal convention, and going beyond it means the viewer is reading rather than following. Long sentences need splitting into more cues, not wider ones.',
          'Characters per line matter for the same reason. Roughly 32 to 42 characters per line is the working range; beyond that, the eye loses the start of the next line while still finishing the current one.',
          'Sound that is not speech has no correct caption. Laughter, applause and music are normally left uncaptioned, and a file that invents text for them is worse than a file that stays quiet.',
        ],
      },
      {
        id: 'video-seo',
        heading: 'Captions as a search asset',
        paragraphs: [
          'On YouTube and most platforms, caption text is indexed alongside title, description and tags. That makes a caption file a second and third chance at the same query, and for a video whose title is vague it is often the only text that matches what a viewer would actually search.',
          'It also carries the spoken words. If your video says something the title does not, a transcript-only competitor can outrank you on it — the reverse of the usual situation, and worth checking for.',
          'Publishing the transcript on your own site as well is worth doing for the same reason as podcasts: you want the indexed text on a domain you control, not only inside someone else’s platform.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Which timestamp mode is best for subtitles?',
        answer:
          'Word-level. It gives each word its own timestamp, so a caption reflects what is being said at that moment instead of holding a whole sentence on screen while the speaker has already moved on. That tracking is the main difference between a usable caption file and a frustrating one.',
      },
      {
        question: 'What video formats can I upload?',
        answer:
          'MP4, WebM and MOV. Konthora extracts the audio track automatically and transcribes the speech in it, so you do not need to extract an audio file first. Upload the original where possible, since re-encoding introduces artefacts the model hears as garbled speech.',
      },
      {
        question: 'My video has burned-in captions already. What happens?',
        answer:
          'Burned-in text is part of the picture, not the audio, so it is not transcribed. Konthora reads the audio track. If your video has no narration, the transcript will be empty, because the information is in the frames rather than the sound.',
      },
      {
        question: 'Can I use the transcript to help YouTube rank the video?',
        answer:
          'Yes. Platforms index caption text, so it is an additional chance at the same query and often captures spoken words your title does not. Publishing the transcript on your own site as well puts that indexed text on a domain you control.',
      },
    ],
    ctaHref: '/video-to-text',
    ctaLabel: 'Open the video transcription tool',
  },

  /* ─────────────────────────── voice memo ─────────────────────────── */
  {
    slug: 'transcribe-voice-memo',
    label: 'Transcribe a Voice Memo',
    h1Highlight: 'Transcribe a Voice Memo',
    title: 'How to Transcribe a Voice Memo into Text | Konthora',
    description:
      'Convert an iPhone or Android voice memo into clean text. Covers exporting memos from your phone, small file handling and turning rambles into notes.',
    lede:
      'A voice memo is usually a rough private recording — a thought you did not want to forget, a list spoken at walking pace, a note taken while your hands were busy. Turning it into text is not about accuracy so much as about making the content usable again a week later.',
    howToName: 'How to transcribe a phone voice memo',
    howToDescription:
      'A five-step path from a voice memo on your phone to text you can actually act on, including how to get the file off the device.',
    steps: [
      {
        title: 'Get the memo off your phone as a file',
        body: 'On iOS, share the memo to Files and it saves as M4A. On Android it is usually already in your Files app as M4A or MP3. M4A, MP3, WAV and AAC are all accepted.',
      },
      {
        title: 'Listen once and note what you want out of it',
        body: 'Knowing whether you want the list, the decision or the whole thing changes what you keep. Voice memos rarely survive a verbatim transcript, and that is fine — the useful part is usually a tenth of it.',
      },
      {
        title: 'Upload and choose sentence timestamps',
        body: 'Sentence mode is right for a memo. Memos are short and unstructured, so per-sentence timings are more than enough granularity and the output reads cleanly.',
      },
      {
        title: 'Transcribe, then cut it down',
        body: 'Read the transcript and keep what still matters. A memo recorded three weeks ago is a record of what you were thinking, and you now know which parts of that still apply.',
      },
      {
        title: 'Export TXT and export it early',
        body: 'Memos get transcribed and then forgotten. Export the text straight away rather than treating the recording as the artefact — a transcript you can search is worth more than a recording you have to replay.',
      },
    ],
    sections: [
      {
        id: 'getting-the-file',
        heading: 'Getting a voice memo off your phone',
        paragraphs: [
          'On iOS, open the Voice Memos app, find the recording, tap share and choose Files. The memo saves with an M4A extension and can be uploaded straight from your computer or from the browser on the device you are reading it on.',
          'On Android, recordings usually land in a Files or Voice Recorder folder as M4A or MP3 depending on the app. Any of those upload directly.',
          'A short M4A from a phone is well under the 100 MB limit, and phone memos are almost always inside the 10-minute limit too, so this is the one transcription case that usually needs no splitting at all.',
        ],
      },
      {
        id: 'memos-are-rough',
        heading: 'Memos are rough, and that is fine',
        paragraphs: [
          'A voice memo is a thinking tool, not a recording. The result is full of half-started sentences, asides, and the sentence you changed your mind about halfway through. A verbatim transcript of that is not especially useful, and the instinct to preserve it exactly is usually wrong.',
          'What you want is extraction. Read the transcript, keep the decisions and the list items, and discard the rest. This is the one transcription job where doing less with the output is the correct approach.',
          'Memos recorded while walking or driving are the hardest case. Road noise and wind are broad-spectrum and the model will produce confident wrong words rather than obvious errors, so read anything that looks specific and verify it.',
        ],
      },
      {
        id: 'use-cases',
        heading: 'What people transcribe memos for',
        paragraphs: [
          'Lists spoken while driving or cooking are the most common use. A memo that reads back as a clean bulleted list is immediately actionable, and doing it later from the recording takes ten times as long.',
          'Decisions and reminders are the second. "Remember to email the contractor about Thursday" becomes text you can search, and a decision made out loud is easier to revisit than one you are relying on memory to recall.',
          'Rough drafts are the third. Speaking a paragraph of prose and transcribing it produces a first draft faster than typing, and it bypasses the blank page. Expect to edit it, since spoken drafts are full of spoken filler.',
        ],
      },
      {
        id: 'privacy',
        heading: 'Recording other people',
        paragraphs: [
          'Recording a conversation on a phone and transcribing it raises a consent question that recording alone does not. Depending on where you are, you may be required to tell people they are being recorded, and in some places you need permission.',
          'The safer default is to tell people. It costs one sentence at the start of the call and removes a real problem. Note also that transcripts are easier to forward accidentally than recordings, so a memo of a conversation is more widely shared than you might expect.',
          'Konthora holds uploads and results for 60 minutes and then deletes them, which limits how long a sensitive recording sits around. That is a useful property, but it is not a substitute for telling people.',
        ],
      },
    ],
    faqs: [
      {
        question: 'How do I get a voice memo off my iPhone to transcribe it?',
        answer:
          'Open the Voice Memos app, find the recording, tap share and choose Files. It saves as M4A, which Konthora accepts directly. Phone memos are almost always under both the 100 MB and 10-minute limits, so this is usually a single upload with no splitting.',
      },
      {
        question: 'Why does my voice memo transcript contain so many wrong words?',
        answer:
          'Memos recorded while walking, driving or in a noisy room are the hardest case, and the model tends to produce confident wrong words rather than obvious errors. Move somewhere quieter and re-record for anything that has to be accurate.',
      },
      {
        question: 'Should I keep the whole transcript or edit it down?',
        answer:
          'Edit it down. A voice memo is a thinking tool, so the raw output is full of half-finished sentences and second thoughts. Keep the decisions and list items and discard the rest — extracting a tenth of the transcript is usually the correct outcome.',
      },
      {
        question: 'Is it legal to record and transcribe a conversation?',
        answer:
          'It depends on where you are. Many places require you to tell people they are being recorded, and some require permission. The safer default is to say so at the start, which costs one sentence. Results are deleted after 60 minutes, but that does not replace telling people.',
      },
    ],
    ctaHref: '/audio-to-text',
    ctaLabel: 'Open the transcription tool',
  },

  /* ─────────────────────────── webinar ─────────────────────────── */
  {
    slug: 'transcribe-webinar',
    label: 'Transcribe a Webinar',
    h1Highlight: 'Transcribe a Webinar',
    title: 'How to Transcribe a Webinar Recording | Konthora',
    description:
      'Transcribe a recorded webinar into a summary, chapter list and captions. Covers long recordings, Q&A sections and follow-up for registrants.',
    lede:
      'A webinar is a presentation and a conversation, and the conversation is usually the part worth keeping. Registrants who missed it want the substance, and the host wants the quotes. A transcript of a recorded webinar is mostly a follow-up asset rather than a published article — which shapes how you should split and process it.',
    howToName: 'How to transcribe a recorded webinar',
    howToDescription:
      'A five-step path from a finished webinar recording to a follow-up summary and captioned replay, including how to handle a session longer than ten minutes.',
    steps: [
      {
        title: 'Split the recording into presentation and Q&A',
        body: 'This is the split that matters. The presentation and the audience questions are different audiences and different jobs, and separating them here makes both easier to use later.',
      },
      {
        title: 'Upload each part and choose paragraph mode',
        body: 'Paragraph mode suits a webinar better than the alternatives because you are summarising a session rather than quoting a single line. A spoken presentation is already loosely structured.',
      },
      {
        title: 'Transcribe the presentation part first',
        body: 'A talk is the easiest audio there is: one speaker, planned, in a quiet room. It needs very little correction, so start here and build confidence before tackling the Q&A.',
      },
      {
        title: 'Transcribe the Q&A separately and mark the answers',
        body: 'This is the valuable part and the hardest audio. Reading back, you want each question paired with its answer, since that pairing is what registrants actually want to find.',
      },
      {
        title: 'Export a summary, plus SRT or VTT if you host a video replay',
        body: 'Text for the follow-up email, subtitles for the replay. Export before the 60-minute retention window closes.',
      },
    ],
    sections: [
      {
        id: 'webinar-structure',
        heading: 'Why the structure of a webinar matters',
        paragraphs: [
          'A webinar is two things stitched together: a presentation, which is one speaker talking in a quiet room, and a Q&A, which is several people talking over a conference bridge. The audio quality and the useful structure are different in each half.',
          'Splitting at that boundary first is the highest-value decision you will make. The presentation transcript is nearly clean and can be turned into a summary quickly. The Q&A is worth more to registrants but needs real work to turn into something readable.',
          'If the recording is a single unedited file, cut the boundary by ear. It is usually obvious — the shift from a prepared speaker to a call-and-response format is not subtle.',
        ],
      },
      {
        id: 'qa-section',
        heading: 'Making the Q&A readable',
        paragraphs: [
          'Raw Q&A dialogue is close to unusable. The same question gets asked three different ways, the answer arrives in the wrong order, and the moderator repeats the question before anyone responds.',
          'What registrants want is a question and answer pairing. Reading the transcript, pull each question out with its answer, drop the moderator’s restatements, and keep the timestamps so anyone can jump to the moment in the replay.',
          'Several near-identical questions are a signal, not a problem. Three people asking about pricing means pricing is what your audience is trying to find out, and that belongs in the follow-up email and the next webinar.',
        ],
      },
      {
        id: 'long-recordings',
        heading: 'Long webinar recordings',
        paragraphs: [
          'Webinars routinely run 45 to 90 minutes, and the limit is 10 minutes per file, so splitting is mandatory. Split at the presentation/Q&A boundary first, then at topic changes within the presentation.',
          'Overlap the joins by about a second so a sentence spanning a boundary survives. A model can drop the opening words of a file, and a one-second overlap means nothing is lost at the seam.',
          'Label every part as you go. With nine or ten files to reassemble, an untitled set is genuinely difficult to put back in order, and the follow-up email is usually being written the same afternoon.',
        ],
      },
      {
        id: 'follow-up',
        heading: 'Turning the recording into follow-up',
        paragraphs: [
          'The follow-up email is the highest-value output and almost nobody writes it from scratch. With a transcript, you can pull the three strongest points, answer the questions that came up more than once, and link the moments people asked about.',
          'Send the summary to registrants whether or not they attended. Attendance is a fraction of sign-ups, and the people who registered and missed it are the ones most likely to come to the next one if you give them a reason.',
          'If you host a video replay, captions are expected and the platform will generate its own — but they will not be indexed against your domain. Publish the transcript on your own site as well.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can Konthora transcribe a whole 60-minute webinar?',
        answer:
          'Not in one file. The limit is 10 minutes and 100 MB per upload, so a 60-minute webinar needs about six parts. Split at the presentation/Q&A boundary first, then on topic changes, and overlap the joins by a second so no sentence is lost.',
      },
      {
        question: 'How do I make the Q&A section readable?',
        answer:
          'Pull each question out with its answer and drop the moderator restatements. Keep the timestamps so anyone can jump to that moment in the replay. Several near-identical questions are useful signal — it shows what your audience is really trying to find out.',
      },
      {
        question: 'Which timestamp mode is right for a webinar?',
        answer:
          'Paragraph mode. A webinar is a spoken presentation rather than an interview, and paragraph grouping produces something you can summarise from. Choose word mode only if you are producing captioned video for the replay.',
      },
      {
        question: 'What should I send to registrants after the webinar?',
        answer:
          'A written summary with the three strongest points, plus answers to the questions that came up more than once, and timestamps linking into the replay. Send it to everyone who registered, not only attendees — people who signed up and missed it are the ones most likely to attend the next session.',
      },
    ],
    ctaHref: '/video-to-text',
    ctaLabel: 'Open the video transcription tool',
  },
];

export function getGuide(slug: string): GuideContent | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}
