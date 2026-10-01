/**
 * Shared content model for the answer-shaped reference pages.
 *
 * These target question queries rather than head terms. Search Console showed
 * the site ranking at position 57-70 for "how does text to speech work" (71
 * impressions) and "word level timestamps" (27 impressions), and 60-88 for
 * "video to text" and "transcription with timestamps". Questions with a stated
 * constraint are winnable at far lower authority than a bare head term, because
 * the query itself does most of the matching.
 *
 * The renderer lives in @/components/guides/AnswerPage.
 */

export interface AnswerSection {
  id: string;
  /** Question-shaped heading. AEO favours these over feature-led titles. */
  heading: string;
  /** Paragraphs. Inline links use [label](/path). */
  paragraphs: string[];
}

export interface AnswerContent {
  slug: string;
  crumb: string;
  /** Noun completing "What is X" or used directly. */
  h1Prefix: string;
  title: string;
  description: string;
  /** One or two sentence direct answer, placed immediately under the h1. */
  directAnswer: string;
  /** Bullet answers to the questions this page covers. */
  quickAnswers: { question: string; answer: string }[];
  sections: AnswerSection[];
  faqs: { question: string; answer: string }[];
  links: { href: string; label: string; description: string }[];
}

export const ANSWER_PAGES: AnswerContent[] = [
  {
    slug: 'text-to-speech-timestamps-explained',
    crumb: 'Timestamps in Transcripts',
    h1Prefix: 'Transcript Timestamps',
    title: 'How to Get Timestamps in a Transcript | Konthora',
    description:
      'Learn what sentence, paragraph and word-level timestamps mean, when each is the right choice, and how to add or remove them from a transcript.',
    directAnswer:
      'A timestamp is a start and end time attached to a piece of text, so you can jump from a sentence to the exact moment it was spoken. Choose sentence level for reading, paragraph level for notes, and word level for subtitles.',
    quickAnswers: [
      {
        question: 'What are timestamps in a transcript?',
        answer:
          'A start and end time for each piece of text, which lets you jump straight from a line to the moment it was said rather than scrubbing through audio to find it.',
      },
      {
        question: 'What is the difference between sentence, paragraph and word-level timestamps?',
        answer:
          'Sentence level times each sentence, paragraph level groups related speech into blocks, and word level times every individual word. The choice depends on whether you are reading, summarising, or making subtitles.',
      },
      {
        question: 'Why do word-level timestamps matter for subtitles?',
        answer:
          'Captions need to appear when the words are spoken. Sentence-level timing holds a whole line on screen for its entire duration, so the viewer reads it while the speaker has already moved on, and captions end up trailing the voice.',
      },
    ],
    sections: [
      {
        id: 'what-timestamps-do',
        heading: 'What can I do with timestamps in a transcript?',
        paragraphs: [
          'A transcript without timing tells you what was said. A transcript with timing tells you what was said and when, and the second is far more useful for anything that involves moving between the text and the recording.',
          'That means finding a quote. If you need one specific line from a forty-minute interview, sentence timestamps let you skim the text, note the time, and jump straight there. Without them you listen to forty minutes to check one sentence.',
          'It also means subtitling and chaptering, which are timing problems rather than text problems. And it means verifying a transcript against its source, which is the difference between a transcript you can publish and one you have to trust.',
        ],
      },
      {
        id: 'choosing-a-mode',
        heading: 'Which timestamp mode should I choose?',
        paragraphs: [
          'Sentence level suits reading and quote-finding. One timestamp per sentence is enough granularity to locate anything, and the text stays in natural paragraphs rather than breaking on every word.',
          'Paragraph level suits summarising and note-taking. It groups related speech into blocks that read like notes rather than dialogue, which is usually what you want when a meeting or lecture is being turned into study material.',
          'Word level suits subtitles and anything that needs tight alignment. It is the only mode where a caption can track the voice instead of trailing it, at the cost of more timestamps and a busier transcript.',
        ],
      },
      {
        id: 'timestamps-and-subtitles',
        heading: 'Why do subtitle timings differ from transcript timings?',
        paragraphs: [
          'Subtitles have a reading-speed constraint that transcripts do not. A viewer reads roughly 160 to 180 words per minute, so a caption has to arrive when the words are spoken rather than when the sentence finished.',
          'Sentence-level cues break that. The whole sentence stays on screen for its entire duration, which means the viewer is reading a line while the speaker has already moved past it. The captions look correct and feel constantly behind.',
          'Word-level timestamps fix it, because each cue reflects what is actually being said at that moment. It is the single biggest quality difference between an automatically generated caption file and one that is genuinely watchable. The [subtitle format guide](/captions/subtitle-formats) covers the file side of this.',
        ],
      },
      {
        id: 'adding-timestamps',
        heading: 'How do I add timestamps to a transcript I already have?',
        paragraphs: [
          'If you already have text without timing, re-running it through a transcription tool is usually faster than inserting timestamps by hand, because the timings come from the audio rather than from a guess.',
          'Hand-inserting is only worth it for a very short excerpt, where the overhead of re-transcribing exceeds the work of typing a handful of timecodes.',
          'If your source was MP3, note that the encoding affects both the text and how cleanly the timings land. The [MP3 to text guide](/mp3-to-text) covers which settings matter and why.',
        ],
      },
      {
        id: 'exporting-timestamps',
        heading: 'How do I get timestamps out in a usable format?',
        paragraphs: [
          'Plain text with a leading timestamp per block is the readable option, useful for show notes and written summaries.',
          'SRT and VTT carry machine-readable timing and are what caption players expect. Use SRT for most platforms and VTT for HTML5 players; both are covered in the [format reference](/formats/srt).',
          'JSON is the option when you are scripting, because it carries per-word timing in a structure you can actually use rather than a flat string you would have to parse.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can I add timestamps to a transcript I already have?',
        answer:
          'Usually by re-running it through a transcription tool, which is faster than typing timecodes and gives you timings taken from the audio rather than estimated. Hand-inserting only makes sense for a very short excerpt.',
      },
      {
        question: 'Which timestamp mode should I choose?',
        answer:
          'Sentence level for reading and finding quotes, paragraph level for summarising a lecture or meeting, and word level for subtitles. Word level is the only mode where captions track the speaker instead of trailing them.',
      },
      {
        question: 'Does choosing word-level timestamps slow transcription down?',
        answer:
          'Slightly, because the model produces a timestamp for every word rather than every sentence. For files at the ten-minute limit the difference is minor, and the subtitle quality gain is usually worth it.',
      },
      {
        question: 'Which export format should I use for timestamps?',
        answer:
          'TXT for readable notes, SRT for most subtitle platforms, VTT for HTML5 players, and JSON when you are scripting and want per-word timing in a usable structure.',
      },
      {
        question: 'Why do my subtitles fall behind the speech?',
        answer:
          'Almost always because sentence-level timing was used. A whole sentence stays on screen for its duration, so the viewer reads it while the speaker has moved on. Switch to word-level timestamps and the captions track the voice.',
      },
    ],
    links: [
      { href: '/speech-to-text/timestamps', label: 'Timestamp Modes Explained', description: 'The full reference on each mode and when to use it.' },
      { href: '/captions/subtitle-formats', label: 'Subtitle Formats', description: 'SRT versus VTT and which player needs which.' },
      { href: '/audio-to-text', label: 'Audio to Text Tool', description: 'Transcribe with sentence, paragraph or word-level timing.' },
    ],
  },

  {
    slug: 'ai-voice-sounds-robotic',
    crumb: 'Making AI Voices Sound Natural',
    h1Prefix: 'Why AI Voices Sound Robotic',
    title: 'How to Make AI Text-to-Speech Sound Less Robotic | Konthora',
    description:
      'Fix robotic AI voice output with seven practical adjustments: voice choice, speed, punctuation, and writing text the way it should be read aloud.',
    directAnswer:
      'Synthetic speech sounds robotic when it is asked to read text that was written to be seen. Fixing it comes down to four things: choose a voice with natural inflection, slow the pace slightly, write for the ear, and control how punctuation is read.',
    quickAnswers: [
      {
        question: 'Why does AI text-to-speech sound robotic?',
        answer:
          'Mostly because the text was written for reading rather than hearing. Long sentences, written abbreviations, and unpunctuated lists all read aloud badly. Voice choice and speed contribute, but the script is usually the bigger factor.',
      },
      {
        question: 'What speed makes AI voice sound most natural?',
        answer:
          'Around 0.9x to 0.95x. The 1.0x default matches a presenting pace, but slightly slower is closer to natural conversation and removes the urgency that reads as synthetic.',
      },
      {
        question: 'Which AI voice sounds least robotic?',
        answer:
          'A mid-register voice with even inflection and no strong regional character. Bright, heavily accented, or very high and very low voices draw attention to themselves, which is what makes speech sound synthetic.',
      },
    ],
    sections: [
      {
        id: 'write-for-the-ear',
        heading: 'Why does my writing sound robotic when it is read aloud?',
        paragraphs: [
          'This is the fix that matters most, and it is not a setting. Written prose carries things that speech cannot: subordinate clauses, parenthetical asides, written abbreviations, and lists formatted with bullets.',
          'Those all read badly aloud. An aside that is invisible on a page becomes a stumble in audio, because the narrator has to hold the main clause, deliver a subordinate thought, and return without the listener knowing where they are.',
          'Short sentences solve most of it. One idea each, with a deliberate full stop where a speaker would breathe. Read the script aloud before generating it: anything you stumble over, the voice will stumble over too.',
        ],
      },
      {
        id: 'numbers-and-symbols',
        heading: 'How do I stop numbers and symbols being read out literally?',
        paragraphs: [
          'A model reads what is written, not what is meant. That produces the classic giveaway: a percentage sign read as "percent symbol", or an ampersand read as "and" where you wanted "and".',
          'Write numbers as you want them heard. "20 percent" rather than "20%". Spell out an abbreviation on first use and abbreviate afterwards, because an unexplained acronym read in full sounds like a stutter.',
          'The same applies to dates, currency, and times. "March 3" is read differently from "3 March" depending on locale, and writing it the way you want it said removes the ambiguity entirely.',
        ],
      },
      {
        id: 'voice-choice',
        heading: 'Which AI voice sounds least robotic?',
        paragraphs: [
          'The test is whether you can listen for ten minutes without noticing it is synthetic. Voices with strong regional character, exaggerated inflection, or a narrow pitch range all fatigue faster, because listeners perceive them as effortful even when they cannot say why.',
          'Register matters more than accent. A mid-range voice sits comfortably for a whole paragraph; a very high or very low voice draws attention to itself. The catalogue covers American and British English in both registers, so the choice is about intent rather than availability.',
          'Match the voice to the audience you already have. A voice that changes between videos reads as inconsistent, and viewers notice that long before they can name it.',
        ],
      },
      {
        id: 'speed-and-pauses',
        heading: 'What speed and pause settings sound most natural?',
        paragraphs: [
          'The default of 1.0x is a presenting pace. Natural conversation runs slower, and 0.9x to 0.95x usually removes the machine quality more than any other single change.',
          'Paragraph pauses matter just as much. A short pause between paragraphs reads as considered; a long one reads as a section break. Raising the pause is the cheapest way to make a flat passage sound structured.',
          'The opposite problem is over-pausing, which reads as hesitation. If the voice sounds like it is searching for words, the pause is too long rather than too short.',
        ],
      },
      {
        id: 'what-will-not-work',
        heading: 'What will not fix a robotic-sounding voice?',
        paragraphs: [
          'No setting compensates for a script written to be read on screen. Normalising text helps with the symbols, but it cannot restructure a sentence built for the eye.',
          'Post-processing in an audio editor is a last resort. Compression, de-essing, and EQ all make the audio cleaner, but they do not make the prosody less synthetic, because the problem is in how the sentence was planned.',
          'Generating the same text repeatedly with different voices rarely helps either. If a passage sounds wrong, the passage is wrong. Change the script and the voice becomes a secondary question.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Why does my AI voice sound robotic?',
        answer:
          'Usually because the text was written for reading rather than hearing. Long sentences, parenthetical asides and written abbreviations all read aloud badly. Fixing the script matters more than changing any setting.',
      },
      {
        question: 'What speed sounds most natural?',
        answer:
          'Around 0.9x to 0.95x. The 1.0x default suits a presenting pace, but slightly slower matches natural conversation and removes the urgency that reads as synthetic.',
      },
      {
        question: 'Should I use text normalisation to fix robotic speech?',
        answer:
          'It helps with symbols rather than structure. Writing "20 percent" instead of "20%" and expanding an abbreviation on first use removes the worst artefacts, but it cannot fix a sentence written for the eye.',
      },
      {
        question: 'Is there a way to make AI speech sound emotional?',
        answer:
          'Not reliably through the interface. Expressiveness comes from the script: shorter sentences, varied structure, and pauses placed where a person would pause. Choosing a voice with more inflection helps, but writing flat copy still produces flat delivery.',
      },
      {
        question: 'Do longer AI voices sound better?',
        answer:
          'Longer models are often better at prosody, but a short well-written script on a simpler model beats a long model reading text that was written to be seen. Script quality dominates model quality for this problem.',
      },
    ],
    links: [
      { href: '/text-to-speech/how-does-text-to-speech-work', label: 'How Text to Speech Works', description: 'What the model does and why the script matters so much.' },
      { href: '/voices', label: 'Browse the Voice Catalogue', description: 'Compare registers and accents across all 41 voices.' },
      { href: '/text-to-speech', label: 'Text to Speech Tool', description: 'Adjust speed, pauses, and normalisation, then export MP3 or WAV.' },
    ],
  },

  {
    slug: 'speech-to-text/transcription-accuracy-checklist',
    crumb: 'Transcription Accuracy Checklist',
    h1Prefix: 'Improve Transcription Accuracy',
    title: 'How to Improve Audio Transcription Accuracy | Konthora',
    description:
      'A practical checklist for better transcription results: microphone placement, noise reduction, file format, and what to check before uploading.',
    directAnswer:
      'Transcription accuracy is set before transcription starts. Recording quality, microphone distance, and background noise change the result more than any setting you can change afterwards. Fix those three and most errors disappear.',
    quickAnswers: [
      {
        question: 'What is the single biggest factor in transcription accuracy?',
        answer:
          'Audio quality at the moment of recording. A microphone close to the speaker on a quiet recording beats an expensive microphone across a noisy room, because distance and background noise degrade the signal before any model ever sees it.',
      },
      {
        question: 'Does file format affect transcription accuracy?',
        answer:
          'Yes, substantially. Lossy formats discard detail unevenly, and the detail they discard is concentrated in quiet speech and hard consonants. A WAV source transcribes noticeably better than an MP3 made from it.',
      },
      {
        question: 'Can I improve accuracy after recording?',
        answer:
          'A little, by trimming silence and obvious noise before upload. You cannot recover detail the recording never captured, so re-recording is the only real fix for a genuinely bad source.',
      },
    ],
    sections: [
      {
        id: 'microphone-distance',
        heading: 'Does microphone quality or microphone distance matter more?',
        paragraphs: [
          'The signal-to-noise ratio degrades with distance. A laptop microphone twenty inches from a speaker in a quiet room beats a £200 microphone six feet away in an office, because the closer recording has proportionally less background noise in it.',
          'A lavalier or headset microphone clipped to the speaker is the single most effective upgrade available, and it costs very little. It removes the distance problem entirely rather than trying to filter it afterwards.',
          'One microphone in the middle of a table beats several spread around a room. Multiple distant microphones each capture the room as much as the person, and overlapping audio is much harder to transcribe than a single clean source.',
        ],
      },
      {
        id: 'background-noise',
        heading: 'How do I reduce background noise in a recording?',
        paragraphs: [
          'Steady background noise is the most damaging case, because the model treats it as part of the speech rather than as something to ignore. Traffic, air conditioning, and a room hum all do this.',
          'Software noise reduction helps more than people expect, but it works by guessing what the speech should sound like, and it introduces artefacts that the model then reads as garbled words. Mild hum benefits; heavy noise often does not.',
          'Turning off air conditioning or moving away from a road takes ten seconds and is more effective than any amount of processing afterwards. Record somewhere quiet rather than recording a quiet recording.',
        ],
      },
      {
        id: 'overlapping-speech',
        heading: 'What happens when two people talk at once?',
        paragraphs: [
          'When two people talk at once, the model has to separate interleaved speech, and it does not have enough information to do it reliably. The result is not clean speaker labels but fragments and mis-attributed lines.',
          'The only reliable fix is to prevent it. A conversation with one microphone should be moderated so people speak in turns, which is worth doing anyway in any recording meant to be used later.',
          'For genuinely unavoidable overlap, transcribing the same passage twice does not help, because the model sees the same problem both times. Splitting speakers onto separate tracks and transcribing each separately does.',
        ],
      },
      {
        id: 'file-format',
        heading: 'Does MP3 file format affect transcription accuracy?',
        paragraphs: [
          'Lossy compression discards detail unevenly across the frequency range, and what it discards is concentrated where quiet speech and consonants live. That is precisely where transcription is hardest, so the loss lands where it costs most.',
          'Record to WAV where you can, or at least 192 kbps. Below 64 kbps, typical of phone voice memos, expect errors even on a well-spoken recording.',
          'Mono is usually better than stereo for voice, since stereo doubles the data without adding information and introduces phase problems when the channels are not perfectly aligned. The [MP3 to text guide](/mp3-to-text) covers the encoding detail.',
        ],
      },
      {
        id: 'before-uploading',
        heading: 'What should I check before uploading a recording?',
        paragraphs: [
          'Trim leading and trailing silence. It adds no text and occasionally costs you the first words of a file.',
          'Cut any section with unusable audio rather than hoping it improves. A five-second gap of static transcribes as confident nonsense, and those invented words are harder to spot than an obvious omission.',
          'Speak names and technical terms clearly at least once in the recording. The model cannot infer a spelling it has not heard, and this is the most common source of checkable errors in otherwise good transcripts.',
          'Read the transcript against the audio once before publishing anything externally. Names, numbers, and titles deserve the closest attention, because a wrong figure in a correct method is worse than a garbled word.',
        ],
      },
    ],
    faqs: [
      {
        question: 'How do I get more accurate transcription results?',
        answer:
          'Improve the recording before you upload. Microphone distance, background noise and overlapping speech account for most errors, and none of them can be fixed by choosing a different tool afterwards.',
      },
      {
        question: 'Is a more expensive microphone worth it?',
        answer:
          'Only if it improves the ratio of voice to background noise, which usually means getting it closer to the speaker. An expensive microphone six feet away in a noisy room loses to a cheap one twenty inches from the mouth.',
      },
      {
        question: 'Does noise removal software help?',
        answer:
          'For mild hum and steady background noise, yes. It works by guessing what the speech should sound like and introduces artefacts the model then reads as garbled words, so heavy noise is better solved by recording somewhere quiet.',
      },
      {
        question: 'Does MP3 reduce transcription accuracy?',
        answer:
          'Yes, and measurably. Lossy compression discards detail in exactly the frequency range that quiet speech and consonants occupy. A WAV source transcribes noticeably better than an MP3 made from the same recording.',
      },
      {
        question: 'Can the tool handle several speakers talking at once?',
        answer:
          'Not reliably. Overlapping speech produces fragments rather than speaker labels, because the model cannot separate interleaved voices from a single track. Moderating the conversation so people speak in turns is the effective fix.',
      },
    ],
    links: [
      { href: '/speech-to-text/audio-transcription-accuracy', label: 'Transcription Accuracy Explained', description: 'Why results differ between files, in more detail.' },
      { href: '/formats/mp3-vs-wav', label: 'MP3 vs WAV', description: 'What the container format changes about what the model hears.' },
      { href: '/audio-to-text', label: 'Audio to Text Tool', description: 'Transcribe a prepared recording with timestamps.' },
    ],
  },
];

export function getAnswerPage(slug: string): AnswerContent | undefined {
  return ANSWER_PAGES.find((page) => page.slug === slug);
}
