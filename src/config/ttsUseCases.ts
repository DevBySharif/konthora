/**
 * Shared content model for the /text-to-speech-for-* use-case guides.
 *
 * These six pages were hand-maintained clones sharing an identical skeleton:
 * the same four H2 sections, the same five workflow steps, and the same three
 * FAQs. Measured token overlap between siblings was 84-93%, which is the same
 * thin-content pattern that got the /transcribe-* guides refused by Google.
 *
 * Each entry below carries content specific to its use case. The renderer lives
 * in @/components/guides/TtsUseCasePage.
 */

export interface TtsStep {
  title: string;
  body: string;
}

export interface TtsSection {
  id: string;
  heading: string;
  /** Paragraphs. Inline links use [label](/path). */
  paragraphs: string[];
}

export interface TtsContent {
  slug: string;
  /** Short label for the breadcrumb, e.g. "Podcasts". */
  crumb: string;
  /** The noun phrase that completes the h1, e.g. "Podcasts". */
  h1Noun: string;
  title: string;
  description: string;
  /** One or two sentences under the h1. */
  lede: string;
  howToName: string;
  howToDescription: string;
  steps: TtsStep[];
  sections: TtsSection[];
  faqs: { question: string; answer: string }[];
  /** Adjacent use case with a genuine one-way relationship. */
  relatedNote: { before: string; linkLabel: string; href: string; after: string };
}

export const TTS_USE_CASES: TtsContent[] = [
  {
    slug: 'text-to-speech-for-podcasts',
    crumb: 'Podcasts',
    h1Noun: 'Podcasts',
    title: 'Text to Speech for Podcasts: Narration Guide | Konthora',
    description:
      'Generate podcast narration, ads and show intros with AI speech. Covers script length limits, voice choice for long-form listening, and picking a speed.',
    lede:
      'Synthetic narration has one job on a podcast: sound consistent and stay out of the way for forty minutes. That is a different requirement from a two-minute ad read, and it changes which voice and which speed you want.',
    howToName: 'How to create podcast narration with Konthora',
    howToDescription:
      'A five-step path from a written script to downloadable narration for a podcast, including how to work around the per-job character limit.',
    steps: [
      {
        title: 'Split the script into sections under 2,000 characters',
        body: 'Each job accepts up to 2,000 characters, which is roughly three minutes of narration. Write the script in sections that break at a natural pause, a topic change or a paragraph break, so the audio can be stitched back together without an audible seam.',
      },
      {
        title: 'Pick a voice that is comfortable over a long listen',
        body: 'Bright, heavily accented voices tire after twenty minutes. For narration, a mid-register American or British English voice with an even cadence is the safer choice. A deeper voice reads as more authoritative for documentary and true-crime formats.',
      },
      {
        title: 'Set the speed slightly below 1.0x',
        body: 'The default of 1.0x suits an advertisement. Long-form listening is usually better at 0.9x to 0.95x, which matches a natural speaking pace and reduces the fatigue that makes synthetic narration obvious.',
      },
      {
        title: 'Increase the paragraph pause at section joins',
        body: 'When joining separate jobs, a longer pause at the boundary makes the seam disappear. The paragraph pause defaults to 500 ms; raise it for a topic change and leave it alone for a sentence continuation.',
      },
      {
        title: 'Export WAV for editing, MP3 for distribution',
        body: 'WAV is uncompressed, so it survives being trimmed and rejoined in an editor without generational loss. Export MP3 only once the final cut is settled, since every re-encode degrades the audio.',
      },
    ],
    sections: [
      {
        id: 'when-synthetic-works',
        heading: 'When synthetic narration works on a podcast',
        paragraphs: [
          'Synthetic narration suits the parts of a podcast that are not the main conversation: show intros, sponsor reads, chapter recaps and trailer edits. These are short, scripted and heard once, which is exactly where consistency beats character.',
          'It is a poor fit for the conversation itself. Listeners form a relationship with a host over dozens of episodes, and an obvious change in speaker between episodes breaks that. If narration appears in episode one, it should appear in every episode.',
          'Ad reads are the strongest case. A sponsor read is scripted, has to stay consistent across forty episodes, and is often recorded by someone whose voice does not suit the show. That is a real problem synthetic speech solves rather than a compromise.',
        ],
      },
      {
        id: 'voice-for-long-listen',
        heading: 'Choosing a voice for long-form listening',
        paragraphs: [
          'The test is whether you can listen for ten minutes without noticing it. Brightness, exaggerated inflection and a narrow pitch range all fatigue faster than a natural speaking voice, because listeners read synthetic speech as slightly effortful even when they cannot say why.',
          'Register matters more than accent. A mid-range voice sits comfortably for a whole episode, while a very high or very low voice draws attention to itself. For documentary and interview-adjacent formats, a lower register reads as credible without needing character.',
          'Match the voice to the existing show rather than to where the audience is. A voice that changes between episodes is far more noticeable than an accent nobody comments on.',
        ],
      },
      {
        id: 'writing-for-the-ear',
        heading: 'Writing a script that sounds spoken',
        paragraphs: [
          'Written prose does not read well aloud. Long subordinate clauses need punctuation the voice will misplace, and a sentence that scans fine on screen can become unintelligible when spoken at conversational speed.',
          'Write for the ear: short sentences, one idea each, and a deliberate full stop where a speaker would breathe. Numbers and abbreviations should be written the way you want them said, because the model reads symbols literally. Write "20 percent" rather than "20%", and expect "Dr." to pause as an abbreviation rather than expand.',
          'Read the script aloud before generating it. Anything you stumble over, the voice will stumble over too, and this check costs a minute.',
        ],
      },
      {
        id: 'joining-sections',
        heading: 'Joining multiple sections without seams',
        paragraphs: [
          'Any narration over 2,000 characters has to be generated in sections and joined, and the joins are where synthetic audio gives itself away. Two things hide them: consistent volume across sections, and a pause long enough to sound deliberate.',
          'Generate every section with the same voice and the same speed settings. Changing either mid-episode produces a shift that is immediately noticeable, and re-generating one section with different settings to fix it makes it worse.',
          'The limit is per job, not per script. A thirty-minute episode is roughly nine sections, which is manageable joining work and much less effort than re-recording a line that did not land.',
        ],
      },
    ],
    faqs: [
      {
        question: 'How much text can I convert for a podcast at once?',
        answer:
          '2,000 characters per job, about three minutes of narration. Longer scripts are generated as several jobs and joined. Write the script in sections that break at a natural pause so the joins are not audible.',
      },
      {
        question: 'What speed should I use for podcast narration?',
        answer:
          'Slightly below 1.0x, usually 0.9x to 0.95x. The 1.0x default suits an advertisement, but long-form listening tires faster at full speed and starts to sound obviously synthetic.',
      },
      {
        question: 'Which voice is best for a podcast?',
        answer:
          'A mid-register voice with an even cadence. Bright or heavily accented voices fatigue over a full episode. Match the voice to the show you already have rather than changing it, since a voice that changes between episodes is more noticeable than an accent.',
      },
      {
        question: 'Should I export MP3 or WAV for a podcast?',
        answer:
          'WAV for editing, MP3 for distribution. WAV is uncompressed, so trimming and joining sections does not degrade the audio further. Export MP3 once the final cut is settled, because every re-encode loses quality.',
      },
    ],
    relatedNote: {
      before: 'If you already have a finished recording and want written notes from it rather than narration for a new one, see the ',
      linkLabel: 'podcast transcription guide',
      href: '/transcribe-podcast',
      after: ' instead.',
    },
  },

  {
    slug: 'text-to-speech-for-youtube-videos',
    crumb: 'YouTube Videos',
    h1Noun: 'YouTube Videos',
    title: 'Text to Speech for YouTube Videos | Konthora',
    description:
      'Generate voiceover for YouTube explainers and tutorials. Covers pacing, timing narration to the edit, and writing text that sounds spoken.',
    lede:
      'Narration carries a video only if it keeps up with the picture. The usual failure is not a poor voice. It is good audio that arrives a beat late, or a script written to be read on screen being read aloud word for word.',
    howToName: 'How to add AI voiceover to a YouTube video',
    howToDescription:
      'A five-step path from a video script to narration that matches the edit, including how to time the read to picture and choose a voice for long-form content.',
    steps: [
      {
        title: 'Write the script against the edit, not the outline',
        body: 'Open the timeline and time each line to the visual it belongs to. A script written from an outline produces narration that drifts against the picture, and fixing that afterwards means re-cutting the video.',
      },
      {
        title: 'Convert on-screen text into spoken sentences',
        body: 'A caption reading "Step 3: Configure" should be a sentence: "Now we will configure the settings." Bullets and fragments read as nonsense aloud, and this rewrite is the single biggest quality improvement available.',
      },
      {
        title: 'Pick a voice with energy for explainer content',
        body: 'Narration for a tutorial has to carry the visual interest, so a brighter and more expressive voice works here than it would for a podcast. For documentary or serious commentary, drop the energy and the register instead.',
      },
      {
        title: 'Use 1.0x for tutorials, 0.95x for documentary',
        body: 'Instructional content matches a natural presenting pace at the default speed. Slower material, where the viewer is reading along with on-screen detail, reads better a little below 1.0x.',
      },
      {
        title: 'Generate in sections and leave room for silence',
        body: 'Split the script at scene changes and generate each as a separate job. The gaps between sections become natural pauses, which a video needs far more than a podcast does.',
      },
    ],
    sections: [
      {
        id: 'timing-to-picture',
        heading: 'Timing narration to the picture',
        paragraphs: [
          'A voiceover that finishes before the visual it describes feels like a mistake to the viewer, and one that finishes after it forces a rewind. The fix is to write the script with timings in it rather than against it.',
          'Practically, that means opening the edit first and timing each line to the moment it belongs to, then writing to that length. A line that needs four seconds of screen time should be written at roughly ten to twelve words, because English narration runs at about 150 words per minute.',
          'Leave a beat of silence at every scene change. Silence reads as deliberate pacing, and it is the difference between narration that sounds laid over a video and narration that sounds like it belongs to one.',
        ],
      },
      {
        id: 'energy-and-register',
        heading: 'Matching voice energy to your format',
        paragraphs: [
          'The right voice depends entirely on what kind of video you are making. An explainer or tutorial needs energy, because the visuals are carrying the information and the voice has to keep attention on them. A documentary or essay does the opposite, and an energetic voice there is exhausting.',
          'Register follows the same logic. A higher, brighter voice suits a product walkthrough. A lower, steadier one suits analysis. The 41-voice catalogue covers American and British English in both, so the choice is about intent rather than availability.',
          'Consistency across a channel matters more than picking the theoretically ideal voice. A channel that changes narration style between videos reads as inconsistent, and viewers notice that long before they can say why.',
        ],
      },
      {
        id: 'converting-captions',
        heading: 'Turning on-screen text into narration',
        paragraphs: [
          'Video scripts are often drafted as on-screen text because that is faster to write, and then read verbatim by the voice. The result sounds like a bulleted list being spoken, which is the most recognisable sign of unprepared voiceover.',
          'Expand every fragment into a sentence and remove the punctuation that only makes sense visually. "Click here" becomes "Click the button here." "1. Add water 2. Boil" becomes "First, add the water, and bring it to a boil."',
          'Delete anything the viewer can already read faster than they can hear it. If a figure is on screen for four seconds, it does not need to be spoken as well, and saying it twice is the fastest way to lose a viewer.',
        ],
      },
      {
        id: 'section-lengths',
        heading: 'Working with the 2,000-character limit',
        paragraphs: [
          'A ten-minute video script is well past the 2,000-character per-job limit, so a full video is generated in sections. This is not really a constraint for video work: sections that map to scene changes are the unit you would edit in anyway.',
          'Generate each section separately and place the files on the timeline at the timings you wrote them to. Because the split is already aligned to the edit, there is no audio to join and nothing to smooth over.',
          'Keep every section on the same voice and speed. Changing settings mid-video is the most audible mistake in a narrated edit, and it is entirely avoidable by treating the whole video as one project.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is AI voiceover good enough for YouTube?',
        answer:
          'For narration over existing footage, tutorials, explainers and course content, yes, particularly at the shorter lengths that perform well on the platform. What does not work is narration standing in for footage you do not have, where the lack of visuals is obvious rather than the lack of a human voice.',
      },
      {
        question: 'How do I keep the voice from sounding robotic?',
        answer:
          'Write for the ear rather than the screen. Expand on-screen fragments into sentences, delete anything the viewer can read faster than they can hear it, and read the script aloud before generating. Anything you stumble over, the voice will stumble over too.',
      },
      {
        question: 'How long can a video script be?',
        answer:
          '2,000 characters per generation job, which is roughly two and a half minutes of narration. Longer scripts are generated as separate jobs and placed on the timeline individually. Splitting at scene changes is usually the better unit than splitting at a character count.',
      },
      {
        question: 'Should I use the same voice across all my videos?',
        answer:
          'Yes. A channel that changes narration style between videos reads as inconsistent, and viewers register that even when they cannot name it. Pick a voice that suits your format and leave it alone across the channel.',
      },
    ],
    relatedNote: {
      before: 'If you need captions for the videos you already have rather than narration for new ones, see ',
      linkLabel: 'how to transcribe video into subtitles',
      href: '/transcribe-video',
      after: '.',
    },
  },

  {
    slug: 'text-to-speech-for-presentations',
    crumb: 'Presentations',
    h1Noun: 'Presentations',
    title: 'Text to Speech for Presentations | Konthora',
    description:
      'Narrate slide decks and product walkthroughs with AI speech. Covers writing narration that does not repeat the slide, pacing to a talk, and rehearsal.',
    lede:
      'A narrated deck is not a slide deck with a voice reading it. The slides hold the points; the narration exists to connect them, explain what is on screen, and let the presenter talk to the audience instead of the screen.',
    howToName: 'How to narrate a presentation with Konthora',
    howToDescription:
      'A five-step path from a finished deck to narration that supports the slides rather than repeating them, including how to pace it against delivery.',
    steps: [
      {
        title: 'Decide what the slides say and what the narration adds',
        body: 'Anything already legible on a slide should not be repeated aloud. The narration carries context, transition and the sentence that explains why the number on screen matters. Writing both from the same source is the most common cause of a tedious presentation.',
      },
      {
        title: 'Write one narration block per slide change',
        body: 'A block per slide gives you a file per slide, which is exactly what the deck needs. Keep each block under 2,000 characters, which is more than thirty seconds of speech and comfortably more than a single slide warrants.',
      },
      {
        title: 'Choose a voice that projects without dominating',
        body: 'A presentation voice is heard alongside a human talking, so it should sit slightly below the presenter. Mid-register, even cadence, no strong regional character. Bright promotional voices compete with the room.',
      },
      {
        title: 'Match narration pace to your delivery speed',
        body: 'Narrating at 1.0x into a slot you normally fill at a comfortable pace means the audio finishes early and you are talking over silence. Generate at 0.95x to 1.0x and rehearse against the actual deck.',
      },
      {
        title: 'Export per slide and rehearse the whole deck',
        body: 'Place one audio file on each slide and play the deck end to end at least once. Silent slides and audio that overruns into the next slide are both obvious from the audience and invisible in the file list.',
      },
    ],
    sections: [
      {
        id: 'slides-vs-narration',
        heading: 'The rule: never read the slide aloud',
        paragraphs: [
          'The most common failure in a narrated deck is duplication. A bullet says "Revenue grew 24%" and the narration says "Revenue grew twenty-four percent." The audience reads it, hears it, and waits for something to happen.',
          'A slide is read silently and quickly. Narration is processed at conversational speed. They are different channels, and using them for the same information wastes the one channel that is actually holding attention.',
          'The test for any line: if deleting it leaves the slide just as clear, delete it. Narration earns its place by adding the reason, the transition, or the caveat that a bullet cannot hold.',
        ],
      },
      {
        id: 'narration-as-bridge',
        heading: 'Using narration as the bridge between slides',
        paragraphs: [
          'Narrated decks have a structural advantage over silent ones. The voice carries the transitions, so the presenter is not clicking through slides while also explaining them. That is a real gain in a room where the audience cannot read ahead.',
          'Write those transitions first, before the slide content. Two sentences of connection between sections does more for comprehension than another bullet ever will, and it is the part that gets skipped when time is short.',
          'A useful pattern is one sentence of setup, one of explanation, one of consequence, per slide. That is a predictable shape the audience learns within two slides and then navigates without effort.',
        ],
      },
      {
        id: 'pace-and-rehearsal',
        heading: 'Pacing, pauses and rehearsal',
        paragraphs: [
          'Narration has to finish before the presenter moves on, or the audience hears two voices at once. The practical fix is to write each block to a known length and leave a second of silence at the end of it.',
          'The pause control helps here. Raising the paragraph pause adds a natural break at the end of a block, which reads as considered rather than cut off, and it gives you somewhere to take a breath before advancing.',
          'Rehearse against the real deck rather than the scripts. The gap between how long a slide feels and how long its narration actually runs is invisible on paper and obvious in a room, and it is the most common reason a narrated deck is rushed.',
        ],
      },
      {
        id: 'accessibility-and-archive',
        heading: 'Narration, accessibility and leaving an archive',
        paragraphs: [
          'A narrated deck is also the accessible version of your presentation. A deck that only works when someone is in the room explaining it excludes everyone else, and the narration file is a much smaller commitment than recording a live talk.',
          'This is a genuine advantage of narrated decks over live delivery: the recording is the primary artefact rather than a byproduct. It can be sent to people who could not attend, reused in onboarding, and quoted in writing.',
          'If the deck is for a proposal or a review rather than a talk, narrating it removes the need to arrange a meeting at all. That is often the stronger argument for the format, and it is worth making explicitly when you propose it.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Should presentation narration read the slide text?',
        answer:
          'No. A slide is read silently and quickly; narration is processed conversationally. Reading the slide aloud makes the audience do the same thing twice. Narration should add the reason behind a number, the transition between sections, or a caveat a bullet cannot hold.',
      },
      {
        question: 'How do I stop the narration talking over my slides?',
        answer:
          'Write one narration block per slide, keep each under the 2,000-character limit, and leave a second of silence at the end of each. Rehearse against the real deck, because the gap between how long a slide feels and how long its audio runs is invisible on paper.',
      },
      {
        question: 'What voice should I use for a slide deck?',
        answer:
          'A mid-register voice with even cadence and no strong regional character. The narration is heard alongside a human talking, so it should sit slightly below the presenter rather than compete with the room. Bright promotional voices are wrong for presentations.',
      },
      {
        question: 'Can I narrate a deck and also present it live?',
        answer:
          'Yes, and it is the normal way to use the format. Narrate the explanatory sections, present the discussion sections live, and the presenter never has to explain a slide while clicking to it. Generate at 0.95x to 1.0x so the audio does not finish before you have finished talking.',
      },
    ],
    relatedNote: {
      before: 'If you want a written record of a talk that has already happened, rather than narration for slides you are about to present, see the ',
      linkLabel: 'meeting transcription guide',
      href: '/transcribe-meeting',
      after: '.',
    },
  },

  {
    slug: 'text-to-speech-for-elearning',
    crumb: 'E-Learning',
    h1Noun: 'E-Learning',
    title: 'Text to Speech for E-Learning Courses | Konthora',
    description:
      'Narrate course modules with AI speech. Covers accessibility requirements, holding learner attention, and updating lessons without re-recording.',
    lede:
      'Narration in e-learning is doing two jobs at once. It carries the lesson, and it is often the accessibility mechanism that makes the course compliant. That second job is why narration quality is a requirement rather than a nicety in most institutions.',
    howToName: 'How to narrate an e-learning module with Konthora',
    howToDescription:
      'A five-step path from a written lesson to narrated course content, including how to meet accessibility requirements and keep lesson audio short enough to hold attention.',
    steps: [
      {
        title: 'Split the lesson into segments of two to five minutes',
        body: 'Attention in online learning drops sharply after about six minutes, and the drop is worse without a visible instructor. Short segments are not only better pedagogy, they also map cleanly onto the 2,000-character generation limit.',
      },
      {
        title: 'Write plain sentences and expand every abbreviation on first use',
        body: 'Learners are hearing terminology for the first time and often reading the transcript at the same time. Spell out an abbreviation the first time it appears and use it afterwards, rather than expecting the narration to carry the expansion mid-sentence.',
      },
      {
        title: 'Use a clear, neutral voice at 0.95x to 1.0x',
        body: 'Instructional audio competes with on-screen material, so it should be easy to follow rather than engaging in itself. A neutral mid-register voice at 0.95x leaves room for the learner to read along without falling behind.',
      },
      {
        title: 'Export per segment and ship with a transcript',
        body: 'One file per segment keeps the lesson editable. Pairing every segment with a written transcript is what satisfies most accessibility requirements, and it also gives learners something to search and skip with.',
      },
      {
        title: 'Regenerate only the segment that changed',
        body: 'Because each segment is a separate job, correcting one paragraph means regenerating one file. With the same voice and speed settings the result is indistinguishable from the original, which is what makes a course maintainable.',
      },
    ],
    sections: [
      {
        id: 'accessibility-requirement',
        heading: 'Narration as an accessibility requirement',
        paragraphs: [
          'For a lot of e-learning, narration is not a stylistic choice. A course with audio and no transcript excludes deaf and hard-of-hearing learners, and a course with text and no audio excludes anyone who cannot read quickly or at all. Most institutional accessibility standards require both, which is the practical reason to narrate.',
          'A written transcript alongside the audio is not optional in that context, and it is worth treating as the deliverable rather than an afterthought. It also has an independent benefit: learners search transcripts far more often than they scrub through video, so a good transcript is often the part that gets used.',
          'The barrier to adding narration is usually recording: a quiet room, a decent microphone, and re-recording every time a lesson changes. Synthetic narration removes all three, which is what makes it practical to keep a course current rather than letting it go stale.',
        ],
      },
      {
        id: 'attention-window',
        heading: 'The attention window',
        paragraphs: [
          'Online learners are usually alone, distracted, and with no social pressure to continue. Their attention is short and it is fragile, and the most common reason a learner abandons a module is not difficulty but drift.',
          'Two to five minutes is the practical segment length. Long enough to cover one idea properly, short enough that finishing feels achievable. Narration helps here specifically because a voice holds attention better than text alone, but only for a while.',
          'End each segment on a completed thought rather than a mid-sentence stop. A learner who stops at a natural break is more likely to resume; one who stops mid-explanation is more likely to close the tab.',
        ],
      },
      {
        id: 'pedagogy',
        heading: 'Writing for a learner who cannot rewind',
        paragraphs: [
          'Narration changes what a script can assume. A learner scanning text can jump to the part they need; a learner listening has to catch up, so the sentence structure has to carry more of the load.',
          'Short sentences and one idea each is the reliable approach. Long subordinate clauses are much harder to follow by ear, because the listener has to hold the first half of the sentence in memory while waiting for the second.',
          'Write numbers, dates and technical terms the way you want them spoken, and avoid symbols entirely. A model reads what is written, so a percent sign or an ampersand is read as a character name rather than as the thing it represents.',
        ],
      },
      {
        id: 'course-maintenance',
        heading: 'Keeping a course current',
        paragraphs: [
          'The real advantage of synthetic narration is not the first recording, it is the hundredth revision. A course built around recorded audio is effectively frozen, because correcting one sentence means finding the studio, the microphone, and an hour.',
          'Segmented generation removes that. Each segment is an independent job, so an edit regenerates one file. Keep the voice and speed settings identical across the course and the regenerated file is indistinguishable from the original.',
          'This is the argument worth making to anyone who wants narration: not that it is faster initially, but that it is the only version of narrated course content that stays accurate.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is narration required for online course accessibility?',
        answer:
          'For most institutional standards, yes, and it is nearly always required alongside a written transcript rather than instead of one. A course with audio and no transcript excludes deaf and hard-of-hearing learners, and text with no audio excludes learners who cannot read quickly.',
      },
      {
        question: 'How long should each lesson segment be?',
        answer:
          'Two to five minutes. Attention in online learning drops sharply after about six minutes, particularly without a visible instructor. This length also maps cleanly onto the 2,000-character per-job limit, so the constraint and the pedagogy agree.',
      },
      {
        question: 'Can I update one lesson without regenerating the whole course?',
        answer:
          'Yes, because each segment is a separate generation job. Correct the paragraph, regenerate that one file, and place it back. Keep the same voice and speed settings across the course or the difference is audible.',
      },
      {
        question: 'What voice and speed work best for instruction?',
        answer:
          'A clear, neutral mid-register voice at 0.95x to 1.0x. Instructional audio competes with on-screen material, so it should be easy to follow rather than engaging in itself, and slightly slower than default leaves room for a learner reading along.',
      },
    ],
    relatedNote: {
      before: 'If you are transcribing lectures you have already recorded rather than narrating new ones, see ',
      linkLabel: 'how to transcribe a lecture',
      href: '/transcribe-lecture',
      after: '.',
    },
  },

  {
    slug: 'text-to-speech-for-social-media',
    crumb: 'Social Media',
    h1Noun: 'Social Media',
    title: 'Text to Speech for Social Media | Konthora',
    description:
      'Generate voiceover for social posts, ads and reels. Covers platform length limits, writing for a scrolling viewer, and brand consistency.',
    lede:
      'Social audio has the tightest constraint on the site: the viewer decides in under a second whether to keep watching. Every choice here follows from that. A slower voice, a long sentence or a quiet opening loses the viewer before the content starts.',
    howToName: 'How to make AI voiceover for social posts',
    howToDescription:
      'A five-step path from a social caption to a short voiceover, including how to fit platform limits and write for a viewer who is scrolling.',
    steps: [
      {
        title: 'Write the hook first, before anything else',
        body: 'The first sentence decides whether the rest is heard. Lead with the specific claim or question rather than a greeting. "Most transcripts fail on one setting" earns attention; "Hi, today we will look at" does not.',
      },
      {
        title: 'Keep it inside the platform limit from the start',
        body: 'Write to the limit rather than trimming afterwards. 2,000 characters is roughly thirty seconds of narration, which covers a Reel, a Short, or a LinkedIn voice note. Trimming a finished script usually breaks the sentence that was doing the work.',
      },
      {
        title: 'Use a bright voice at 1.0x or above',
        body: 'This is the one use case where a higher-energy voice is correct. Social feeds are fast and slightly manic, and a measured podcast-style read loses the viewer here for the same reason it would work in a documentary.',
      },
      {
        title: 'Front-load the value and end cleanly',
        body: 'Say the most interesting thing first rather than building to it. Viewers leave mid-video, so anything placed after a fifteen-second mark is optional. Finish on a complete sentence with no trailing clause.',
      },
      {
        title: 'Export MP3, since social platforms compress anyway',
        body: 'There is no point working in WAV for a platform that re-encodes to AAC on upload. Export MP3, upload, and keep the length comfortably under the limit so the platform does not trim you mid-sentence.',
      },
    ],
    sections: [
      {
        id: 'one-second-test',
        heading: 'The one-second test',
        paragraphs: [
          'A social viewer makes a keep-or-scroll decision faster than a sentence can be spoken. That single constraint drives every other decision on this page: the hook, the speed, the voice, and the length.',
          'It also means the opening is the entire video. If the first five seconds do not make a promise, nothing later in the clip can rescue it, because most viewers will not be there to be rescued.',
          'Test it honestly. Watch your own output with sound off, then with sound on. If the on-screen text alone does not work without audio, you are relying on the audio to carry more attention than a feed will give it.',
        ],
      },
      {
        id: 'writing-for-scroll',
        heading: 'Writing for someone who is scrolling',
        paragraphs: [
          'Social copy is not written prose. It is built to survive a thumb moving at speed, which means short sentences, concrete nouns, and no subordinate clauses waiting on a payoff.',
          'Specificity is what separates a clip that works from one that does not. A real number, a real name, or a real consequence outperforms an abstract claim almost every time, and it is the easiest thing to get right before generating anything.',
          'Cut every word that does not earn its place. Social is the one context where the 2,000-character limit is genuinely generous and readers are genuinely impatient, so trim before you generate rather than after.',
        ],
      },
      {
        id: 'brand-consistency',
        heading: 'Keeping a consistent brand voice',
        paragraphs: [
          'Individual posts are cheap to produce, which is exactly why brand voice drifts. Each clip is made in isolation, the voice is chosen from memory, and within a month the feed sounds like three different accounts.',
          'Pick one voice and one speed and use them for everything. Consistency is more noticeable to a follower than quality is, and an account that sounds like itself is doing something no single great clip can do.',
          'Keep a short note of the settings you use. It sounds trivial, but the most common cause of an inconsistent feed is somebody reasonably assuming they remembered the right speed.',
        ],
      },
      {
        id: 'platform-fit',
        heading: 'Fitting the platforms',
        paragraphs: [
          'Each platform has its own length limit and its own audience behaviour, so the same script does not transfer cleanly between them. A thirty-second Reel script is roughly 400 words, and it needs to be a complete idea rather than the first half of one.',
          'Vertical video with a caption burned in is expected on every platform, and the caption is usually read rather than the audio. Write the caption as a summary and the narration as the fuller version, rather than making them identical.',
          'Check the length after export rather than trusting the character count. Speech at 1.0x varies slightly with punctuation and with how numbers are written, and a clip that lands two seconds over gets cut off mid-sentence.',
        ],
      },
    ],
    faqs: [
      {
        question: 'How long can a social media voiceover be?',
        answer:
          '2,000 characters per job, which is about thirty seconds of narration at 1.0x. That covers a Reel, a Short, or a LinkedIn voice note. Keep it slightly under the platform limit so it is not trimmed mid-sentence.',
      },
      {
        question: 'Should I use a bright, energetic voice for social?',
        answer:
          'Yes, this is the one use case where it is the right choice. Feeds are fast and slightly manic, and a measured narration voice loses viewers here for the same reason it works in a documentary or a podcast.',
      },
      {
        question: 'What speed should I use for short-form content?',
        answer:
          'The 1.0x default, or marginally above it for particularly fast formats. Social is the opposite of narration, where slowing down to 0.9x reduces fatigue. Check the length after export, since punctuation and written-out numbers shift the duration.',
      },
      {
        question: 'Do I need captions as well as voiceover?',
        answer:
          'Yes, and on most platforms the caption is read more than the audio is heard. Write the on-screen text as a summary of the narration rather than a copy of it, so the two are not redundant for anyone watching with sound off.',
      },
    ],
    relatedNote: {
      before: 'If you need captions for social clips you have already recorded rather than narration for new ones, see ',
      linkLabel: 'transcribing a video into subtitles',
      href: '/transcribe-video',
      after: '.',
    },
  },

  {
    slug: 'text-to-speech-for-audiobooks',
    crumb: 'Audiobooks',
    h1Noun: 'Audiobooks',
    title: 'Text to Speech for Audiobooks | Konthora',
    description:
      'Narrate book chapters with AI speech. Covers the 2,000-character limit, scene-level pacing, and preparing prose for speech.',
    lede:
      'Long-form narration is the hardest case on this site, and the limits are the reason. A chapter is tens of thousands of characters against a 2,000-character job limit, and prose is the least speech-like text there is. The work is in preparation, not generation.',
    howToName: 'How to narrate an audiobook chapter with Konthora',
    howToDescription:
      'A five-step path from a chapter of prose to a joined narration, including how to structure the work around the per-job character limit and prepare prose for speech.',
    steps: [
      {
        title: 'Split the chapter at scene boundaries, not at 2,000 characters',
        body: 'A character-count split cuts sentences in half. Split at a scene break, a chapter heading, or a change of speaker or time, which gives sections of a few thousand characters each that you can then generate as two or three jobs.',
      },
      {
        title: 'Convert prose into speakable text before generating',
        body: 'Prose contains constructs that do not survive being read aloud: parenthetical asides, em-dash digressions, footnotes and dialogue tags written for the eye. Resolve them in the source text first, because no speed or voice setting fixes them afterwards.',
      },
      {
        title: 'Use a steady mid-register voice at 0.9x to 0.95x',
        body: 'Narrative fiction is usually better read slightly below the default. A 0.9x to 0.95x pace matches a natural reading speed and prevents the listener fatigue that makes a long chapter hard to stay with.',
      },
      {
        title: 'Normalise abbreviations, numbers and symbols',
        body: 'Write "one hundred and twenty" rather than "120" where it appears mid-sentence, and never leave a percent sign or an ampersand in the text. The model reads symbols literally, and a footnote marker is read as a number.',
      },
      {
        title: 'Join the sections in one session with fixed settings',
        body: 'A chapter is many files, and inconsistency between them is far more audible over an hour than it is over thirty seconds. Generate everything in one sitting with the same voice, speed and pause settings, then join without re-encoding.',
      },
    ],
    sections: [
      {
        id: 'preparing-prose',
        heading: 'Preparing prose for speech',
        paragraphs: [
          'Novels and essays are written to be read silently. Narration needs them rewritten, and this is the single largest quality difference between a good audiobook and a robotic one.',
          'Parenthetical asides are the main offender. An aside is invisible on a page and a stumble in audio, because the narrator has to hold the main clause, deliver a subordinate thought, and return. Move it into its own sentence.',
          'Dialogue tags and em-dash interruptions have the same problem in fiction. So do footnotes, symbols, and numbers written in digits. Resolving all of these in the source text is faster than trying to fix them by regenerating, because the model reads what is written rather than what is meant.',
        ],
      },
      {
        id: 'managing-the-limit',
        heading: 'Managing the 2,000-character limit at length',
        paragraphs: [
          'A single audiobook chapter is usually 30,000 to 60,000 characters, so it is fifteen to thirty jobs. That is not a workaround, it is the shape of the work, and treating it as one is where projects stall.',
          'Split at scene boundaries. A scene break gives you sections of three to eight thousand characters, each generating as two or four jobs, and it means the splits are somewhere that already made structural sense. A character-count split at 2,000 puts a seam mid-sentence.',
          'Name the files as you go. Thirty sequential files joined in the wrong order is a genuinely painful mistake to discover at the end, and the numbering costs nothing at the start.',
        ],
      },
      {
        id: 'pacing-long-form',
        heading: 'Pacing that holds over an hour',
        paragraphs: [
          'Pacing is the difference between a listener finishing a chapter and abandoning it at fifteen minutes, and it is mostly the paragraph pause setting rather than the speed.',
          'A longer paragraph pause at the end of a section reads as a beat between scenes, which is exactly what a human narrator does. At the default of 500 ms the joins between generated jobs feel abrupt, and over an hour that accumulates into a sense of breathless delivery.',
          'Keep speed constant across the whole chapter. A listener who has adjusted to one pace finds a change jarring in a way that a single odd voice never does, because the speed is what they calibrated to without noticing.',
        ],
      },
      {
        id: 'genre-differences',
        heading: 'Fiction, non-fiction and voice choice',
        paragraphs: [
          'Fiction and non-fiction want different voices more than most people expect. Fiction wants a voice that disappears, so the reader stops hearing narration and starts hearing the story. Non-fiction wants a voice that carries the argument, because the words are doing the work rather than the delivery.',
          'Multi-character fiction is the honest limitation. There is no speaker labelling, so distinct voices have to be produced by generating each character separately, which is workable for a two-hander and impractical for an ensemble cast.',
          'For first-person narration, match the voice to the character you have written. A younger, higher voice for a younger narrator and a lower one for an older narrator are available in the catalogue, and the fit is more noticeable than the choice of accent.',
        ],
      },
    ],
    faqs: [
      {
        question: 'How much text can I narrate at once?',
        answer:
          '2,000 characters per generation job, which is about three minutes at 0.95x. A full chapter is fifteen to thirty jobs. Split at scene boundaries rather than at a character count, so no section begins or ends mid-sentence.',
      },
      {
        question: 'Can I narrate a whole book?',
        answer:
          'Chapter by chapter. A whole book is hundreds of generation jobs, and joining them all at once is where errors become hard to find. Treat each chapter as a project: prepare the prose, generate every section in one sitting with fixed settings, then join.',
      },
      {
        question: 'What speed is best for audiobook narration?',
        answer:
          '0.9x to 0.95x, which matches a natural reading speed and reduces the fatigue that makes a long chapter hard to stay with. Keep the speed identical across every job in a chapter, since a listener calibrates to it without noticing.',
      },
      {
        question: 'How do I handle dialogue with multiple speakers?',
        answer:
          'There is no speaker labelling, so distinct voices have to come from generating each character separately. That is practical for a two-hander and impractical for an ensemble cast. If the book has many speakers, a human narrator is the better option.',
      },
    ],
    relatedNote: {
      before: 'If you have a finished audiobook and want a written version rather than narration for a new one, see the ',
      linkLabel: 'audio transcription accuracy guide',
      href: '/speech-to-text/audio-transcription-accuracy',
      after: '.',
    },
  },
];

export function getTtsUseCase(slug: string): TtsContent | undefined {
  return TTS_USE_CASES.find((entry) => entry.slug === slug);
}
