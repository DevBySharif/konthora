/**
 * Shared content model for the three transcription tool pages.
 *
 * /audio-to-text, /video-to-text and /mp3-to-text were near-identical clones.
 * Measured against the live site: /video-to-text shared 760 of 848 tokens with
 * /audio-to-text (90%), and /mp3-to-text shared 757 of 841 (90%). Three pages
 * were competing for one intent, and /video-to-text sat at position 86 on 478
 * impressions as a result.
 *
 * Each entry below now carries content specific to its input format. The
 * renderer lives in @/components/tools/ToolPage.
 */

export interface ToolCard {
  icon: string;
  title: string;
  desc: string;
}

export interface ToolStep {
  title: string;
  desc: string;
}

export interface ToolLink {
  href: string;
  label: string;
  description: string;
  primary?: boolean;
}

export interface ToolContent {
  slug: string;
  /** Breadcrumb label. */
  crumb: string;
  /** Short badge on the page header. */
  badge: string;
  /** Page title, used for metadata and the h1. */
  heading: string;
  /** Page description, must stay within the 155-char SERP budget. */
  description: string;
  /**
   * The factual summary quoted by voice assistants and AI answer engines via
   * Speakable schema. Rendered visually hidden but must match the visible copy.
   */
  speakable: string;
  /** The h1 shown above the workspace. */
  headerTitle: string;
  headerDescription: string;
  /** Voice intent for the workspace. */
  tool: 'audio' | 'video';
  capabilityEyebrow: string;
  capabilityTitle: string;
  capabilityDescription: string;
  capabilityCards: ToolCard[];
  stepEyebrow: string;
  stepTitle: string;
  stepDescription: string;
  steps: ToolStep[];
  useCaseEyebrow: string;
  useCaseTitle: string;
  useCaseDescription: string;
  useCaseCards: ToolCard[];
  crossLinkTitle: string;
  crossLinkDescription: string;
  links: ToolLink[];
  faqHeading: string;
  faqSubheading: string;
  faqs: { question: string; answer: string }[];
}

export const TOOL_PAGES: ToolContent[] = [
  {
    slug: 'audio-to-text',
    crumb: 'Audio to Text',
    badge: 'Transcription',
    heading: 'Audio to Text Converter with Timestamps | Konthora',
    description:
      'Convert any audio to text with sentence, paragraph or word-level timestamps. Export TXT, SRT, VTT or JSON, free, with no account required.',
    speakable:
      'Konthora converts audio and video into accurate transcripts for free in the browser. You can upload files up to 100 megabytes and 10 minutes long, choose sentence, paragraph, or word-level timestamps, edit the result, and export as TXT, SRT, VTT, or JSON. Transcripts are deleted automatically after 60 minutes.',
    headerTitle: 'Audio to Text with Timestamps',
    headerDescription:
      'Upload audio, choose sentence, paragraph, or word-level timestamps, then transcribe, review, and export as TXT, SRT, VTT, or JSON.',
    tool: 'audio',
    capabilityEyebrow: 'Capabilities',
    capabilityTitle: 'What the audio transcription workspace supports',
    capabilityDescription:
      'Konthora handles the general case: voice memos, recordings, interviews and anything else that arrives as an audio file. Here is exactly what is supported.',
    capabilityCards: [
      { icon: 'FileAudio', title: 'MP3, WAV, M4A, AAC', desc: 'Every common audio format, plus video files handled as audio.' },
      { icon: 'Clock', title: 'Three timestamp modes', desc: 'Sentence, paragraph, or word level, chosen before you transcribe.' },
      { icon: 'FileDown', title: 'TXT, SRT, VTT, JSON', desc: 'A readable transcript, subtitle files, or structured timing data.' },
      { icon: 'Languages', title: 'English transcription', desc: 'Speech recognition tuned for English-language recordings.' },
    ],
    stepEyebrow: 'How it works',
    stepTitle: 'Transcribe audio in three steps',
    stepDescription: 'Upload a file and get an accurate, timestamped transcript in seconds.',
    steps: [
      { title: 'Upload your audio file', desc: 'Drop in an MP3, WAV, M4A or AAC file up to 100 MB and 10 minutes long.' },
      { title: 'Choose timestamp grouping', desc: 'Pick sentence, paragraph, or word level depending on what you need the timing for.' },
      { title: 'Transcribe, review, and export', desc: 'Review the transcript in the editor, then download TXT, SRT, VTT or JSON.' },
    ],
    useCaseEyebrow: 'Who it is for',
    useCaseTitle: 'How people use Konthora audio transcription',
    useCaseDescription: 'Transcripts and captions for content, learning, research, and discovery.',
    useCaseCards: [
      { icon: 'Mic', title: 'Voice memos and notes', desc: 'Turn a rough spoken memo into something you can search and act on.' },
      { icon: 'Users', title: 'Interviews and research', desc: 'Pull verifiable quotes out of a recorded conversation.' },
      { icon: 'BookOpen', title: 'Lectures and meetings', desc: 'Make recorded teaching and business discussion readable.' },
      { icon: 'FileDown', title: 'Captions and subtitles', desc: 'Create SRT or VTT files for any recorded media.' },
    ],
    crossLinkTitle: 'Audio transcription resources',
    crossLinkDescription: 'Accuracy, timestamp modes, and format guides for general audio files.',
    links: [
      { href: '/speech-to-text/audio-transcription-accuracy', label: 'Audio Transcription Accuracy', description: 'What determines accuracy, and how to improve a recording before uploading it.', primary: true },
      { href: '/speech-to-text/timestamps', label: 'Timestamp Modes Explained', description: 'Choose between sentence, paragraph and word-level timing.' },
      { href: '/formats/mp3-vs-wav', label: 'MP3 vs WAV', description: 'Why the source file format changes what the model hears.' },
      { href: '/speech-to-text', label: 'How Speech to Text Works', description: 'The explainer behind automatic speech recognition.' },
    ],
    faqHeading: 'Audio to Text FAQs',
    faqSubheading: 'Common questions about converting audio files to text.',
    faqs: [
      { question: 'What is the maximum upload file size?', answer: '100 MB and 10 minutes per file. Longer recordings must be split into parts before upload.' },
      { question: 'Which audio formats are supported?', answer: 'MP3, WAV, M4A and AAC, plus MP4, WebM and MOV which are processed for their audio track only.' },
      { question: 'Which languages are supported?', answer: 'English. Selecting auto detect processes the audio as English.' },
      { question: 'How accurate is the transcript?', answer: 'It depends on the recording. Clear speech with low background noise transcribes best; see the accuracy guide for what to fix before uploading.' },
      { question: 'Can I choose timestamps?', answer: 'Yes. Sentence, paragraph, and word-level grouping are all available, chosen before transcription starts.' },
      { question: 'Is my audio stored?', answer: 'Uploads and transcripts are deleted automatically after 60 minutes, so anything sensitive has a short lifetime.' },
    ],
  },

  {
    slug: 'video-to-text',
    crumb: 'Video to Text',
    badge: 'Video Transcription',
    heading: 'Video to Text Converter for MP4, WebM and MOV | Konthora',
    description:
      'Transcribe MP4, WebM and MOV video in your browser. Extract the audio track, add sentence or word-level timing, and export SRT or VTT captions.',
    speakable:
      'Konthora converts video files into text transcripts for free in the browser. MP4, WebM, and MOV are accepted, the audio track is extracted automatically, and you can export the result as TXT, SRT, VTT, or JSON with sentence, paragraph, or word-level timestamps. Uploads are up to 100 megabytes and 10 minutes long, and are deleted after 60 minutes.',
    headerTitle: 'Video to Text with Automatic Audio Extraction',
    headerDescription:
      'Upload an MP4, WebM or MOV file. Konthora extracts the audio track, transcribes the speech in it, and gives you timed subtitles you can upload anywhere.',
    tool: 'video',
    capabilityEyebrow: 'Video-specific',
    capabilityTitle: 'How Konthora handles video files',
    capabilityDescription:
      'It transcribes the audio track, not the picture. That distinction decides what you get back and when this tool is the wrong choice.',
    capabilityCards: [
      { icon: 'FileVideo', title: 'MP4, WebM, MOV', desc: 'The formats most cameras, phones and editors actually produce.' },
      { icon: 'Scissors', title: 'Audio track extraction', desc: 'The track is extracted and prepared automatically. No separate audio file needed.' },
      { icon: 'Captions', title: 'Subtitle-ready timing', desc: 'Word-level timestamps keep captions in sync instead of trailing the speaker.' },
      { icon: 'Languages', title: 'Spoken audio only', desc: 'A silent or music-only video produces no text, because there is no speech to read.' },
    ],
    stepEyebrow: 'How it works',
    stepTitle: 'Get subtitles from a video in three steps',
    stepDescription: 'Upload a clip and receive timed captions plus a readable transcript.',
    steps: [
      { title: 'Upload the video file', desc: 'MP4, WebM or MOV, up to 100 MB and 10 minutes. Longer clips need splitting first.' },
      { title: 'Choose word-level timing for captions', desc: 'Word timestamps keep each cue in sync with the speaker. Use sentence level for a readable transcript instead.' },
      { title: 'Export SRT or VTT', desc: 'SRT for most platforms, VTT for HTML5 players. Keep the file after uploading so you control the timing.' },
    ],
    useCaseEyebrow: 'Who it is for',
    useCaseTitle: 'What people transcribe video for',
    useCaseDescription: 'Captions, searchable archives, and accessibility for published video.',
    useCaseCards: [
      { icon: 'Captions', title: 'Captions for published video', desc: 'Upload your own SRT or VTT rather than relying on a platform auto-caption.' },
      { icon: 'FileText', title: 'Searchable video archives', desc: 'Make a back catalogue findable by what was actually said in it.' },
      { icon: 'Users', title: 'Accessibility', desc: 'Captions make video usable for viewers who cannot rely on the audio track.' },
      { icon: 'Clock', title: 'Chapter and highlight discovery', desc: 'Punctuation at the sentence level lets you jump to the part that matters.' },
    ],
    crossLinkTitle: 'Video and caption resources',
    crossLinkDescription: 'Caption standards, subtitle formats, and the video transcription guide.',
    links: [
      { href: '/transcribe-video', label: 'Video Transcription Guide', description: 'Subtitle timing standards, burned-in captions, and why captions are indexed.', primary: true },
      { href: '/captions/subtitle-formats', label: 'Subtitle File Formats', description: 'SRT versus VTT, and which player needs which.' },
      { href: '/captions/how-to-add-captions-to-video', label: 'How to Add Captions to a Video', description: 'Uploading your own caption file to the common platforms.' },
      { href: '/formats/srt', label: 'SRT Format Reference', description: 'What an SRT file contains and how the timing works.' },
    ],
    faqHeading: 'Video to Text FAQs',
    faqSubheading: 'Common questions about transcribing video files.',
    faqs: [
      { question: 'Which video formats can I upload?', answer: 'MP4, WebM and MOV. Konthora extracts the audio track automatically, so you do not need to produce an audio file first. Upload the original where you can, since re-encoding introduces artefacts the model hears as garbled speech.' },
      { question: 'What happens to the visuals in my video?', answer: 'They are not transcribed. Konthora reads the audio track, so on-screen text, slides and footage carry no text of their own. If your video has no narration the transcript will be empty.' },
      { question: 'Which timestamp mode should I use for subtitles?', answer: 'Word level. It times each word individually, so a caption reflects what is being said at that moment instead of holding a whole sentence while the speaker has moved on. That tracking is the difference between usable captions and frustrating ones.' },
      { question: 'Can I make captions for a YouTube video?', answer: 'Yes. Export SRT and upload it, then keep your copy. Platforms generate their own captions, and yours will be indexed on your own domain rather than only inside the platform.' },
      { question: 'How long can a video be?', answer: '100 MB and 10 minutes per file. Split longer videos at scene changes and overlap the joins by about a second so no sentence is lost at the seam.' },
      { question: 'What happens to my video after I transcribe it?', answer: 'The upload and the resulting transcript are deleted automatically after 60 minutes, so export the caption file before that window closes rather than planning to come back for it.' },
      { question: 'My video already has burned-in captions. Will they be transcribed?', answer: 'No. Burned-in text is part of the picture rather than the audio, so it is not speech and is not read. Upload the original audio track if you need those captions extracted.' },
    ],
  },

  {
    slug: 'mp3-to-text',
    crumb: 'MP3 to Text',
    badge: 'MP3 Transcription',
    heading: 'MP3 to Text Converter: Transcribe MP3 Files | Konthora',
    description:
      'Transcribe MP3 files to text for free. See how bitrate, sample rate and stereo affect accuracy, choose timestamps, and export TXT, SRT or VTT.',
    speakable:
      'Konthora converts MP3 audio into accurate transcripts for free in the browser. MP3 is the most common recording format, and how the file was encoded affects accuracy. Choose sentence, paragraph, or word-level timestamps and export as TXT, SRT, VTT, or JSON. Uploads are up to 100 megabytes and 10 minutes long, and are deleted after 60 minutes.',
    headerTitle: 'MP3 to Text',
    headerDescription:
      'Upload an MP3 and get a timestamped transcript. The encoding of your file matters more than you would expect, and this page explains which parts.',
    tool: 'audio',
    capabilityEyebrow: 'MP3-specific',
    capabilityTitle: 'How MP3 encoding affects your transcript',
    capabilityDescription:
      'MP3 is lossy, and the loss is uneven across the frequency range the model relies on. These are the settings that change what comes back.',
    capabilityCards: [
      { icon: 'FileAudio', title: '64 kbps and below', desc: 'Phone and voice-memo recordings. Expect errors on quiet and consonant-heavy speech.' },
      { icon: 'FileAudio', title: '128 to 192 kbps', desc: 'The usual range for podcasts and voiceovers. A good balance of quality and size.' },
      { icon: 'Sparkles', title: '256 kbps and above', desc: 'Studio or lossless-then-encoded sources. Transcribes most accurately.' },
      { icon: 'Sliders', title: 'Mono versus stereo', desc: 'Mono voice recordings are smaller and usually cleaner. Stereo phase issues cost you accuracy.' },
    ],
    stepEyebrow: 'How it works',
    stepTitle: 'Transcribe an MP3 in three steps',
    stepDescription: 'Upload the file, pick your timing, and export in the format you need.',
    steps: [
      { title: 'Upload your MP3 file', desc: 'Up to 100 MB and 10 minutes. Anything recorded at 128 kbps or above transcribes reliably.' },
      { title: 'Pick timestamps for your use', desc: 'Sentence level for show notes, word level if you need subtitles, paragraph level for reading.' },
      { title: 'Review and export', desc: 'Check names and numbers specifically, then download TXT, SRT, VTT or JSON before the 60-minute window closes.' },
    ],
    useCaseEyebrow: 'Who it is for',
    useCaseTitle: 'What people transcribe MP3s for',
    useCaseDescription: 'The recording formats that come off a phone, a podcast host, or a field recorder.',
    useCaseCards: [
      { icon: 'Mic', title: 'Phone and voice memos', desc: 'The most common MP3 source, and usually the most compressed.' },
      { icon: 'AudioLines', title: 'Podcast episodes', desc: 'Longer recordings that need splitting at topic changes.' },
      { icon: 'Users', title: 'Interviews and field recordings', desc: 'Recorded on equipment that saves straight to MP3.' },
      { icon: 'FileDown', title: 'Archive and search', desc: 'Make an old MP3 library findable by what is said in it.' },
    ],
    crossLinkTitle: 'MP3 and audio quality resources',
    crossLinkDescription: 'Encoding, format choices, and what actually improves accuracy.',
    links: [
      { href: '/formats/mp3-vs-wav', label: 'MP3 vs WAV', description: 'Why the source format changes what the model hears.', primary: true },
      { href: '/speech-to-text/audio-transcription-accuracy', label: 'Improving Transcription Accuracy', description: 'What to fix before uploading a recording.' },
      { href: '/formats/srt', label: 'SRT Format Reference', description: 'Export the transcript as timed subtitles.' },
      { href: '/audio-to-text', label: 'General Audio to Text Tool', description: 'The workspace, and every format it accepts.' },
    ],
    faqHeading: 'MP3 to Text FAQs',
    faqSubheading: 'Common questions about transcribing MP3 files.',
    faqs: [
      { question: 'What MP3 bitrate should I use for the best accuracy?', answer: '192 kbps or above for reliable results. Below 64 kbps, which is typical of phone voice memos, expect errors on quiet speech and hard consonants. If you still have the original recording, re-encoding from a WAV source recovers most of the lost detail.' },
      { question: 'Does mono or stereo transcribe better?', answer: 'Mono usually does, for voice recordings. It is smaller and avoids phase problems where one channel is slightly delayed from the other, which the model reads as garbled speech. Stereo matters only when the recording genuinely uses both channels, such as a two-person conversation on separate mics.' },
      { question: 'Can Konthora convert an MP3 to a Word document?', answer: 'Not directly. Export TXT for plain text, which pastes into any word processor, or JSON if you are scripting and want the timing data as well.' },
      { question: 'Why does my MP3 transcript have errors that a WAV does not?', answer: 'MP3 is lossy. It discards detail unevenly, and the parts it discards are concentrated in quiet and consonant-heavy speech, which is exactly where transcription is hardest. The MP3 versus WAV guide covers this in detail.' },
      { question: 'How long can an MP3 be?', answer: '100 MB and 10 minutes per file. A 45-minute podcast episode at 128 kbps is roughly 40 MB but still exceeds the duration limit, so split it at topic changes and overlap the joins by a second.' },
      { question: 'Can I convert an MP3 to SRT subtitles?', answer: 'Yes. Choose word-level timestamps before transcribing, then export SRT. Sentence-level cues lag behind the speaker; word-level cues track the voice.' },
    ],
  },
];

export function getToolPage(slug: string): ToolContent | undefined {
  return TOOL_PAGES.find((page) => page.slug === slug);
}
