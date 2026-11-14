import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { constructMetadata } from '@/lib/metadata';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { PageHeader } from '@/components/ui/PageHeader';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { JsonLd } from '@/components/JsonLd';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = constructMetadata({
  title: `Konthora API for Developers | ${siteConfig.name}`,
  description:
    'Build on the Konthora API: text to speech with Kokoro and Edge voices, and English transcription with timestamps. Endpoints, curl examples, and limits.',
  path: '/developers',
});

const API_BASE_URL = 'https://devsharif-konthora-api.hf.space/api/v1';

const CURL_VOICES = `curl ${API_BASE_URL}/tts/voices`;

const CURL_CREATE_TTS_JOB = `curl -X POST ${API_BASE_URL}/tts/jobs \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Welcome to Konthora. This is how my voice sounds.",
    "voiceId": "af_heart",
    "engine": "kokoro",
    "accent": "American English",
    "speed": 1.0,
    "outputFormat": "mp3",
    "sentencePauseMs": 220,
    "paragraphPauseMs": 500,
    "normalizeText": true
  }'`;

const CURL_TTS_STATUS = `curl ${API_BASE_URL}/tts/jobs/JOB_ID \\
  -H "Authorization: Bearer YOUR_TOKEN"`;

const CURL_TTS_AUDIO = `curl ${API_BASE_URL}/tts/jobs/JOB_ID/audio \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -o konthora-speech.mp3`;

const CURL_PREVIEW = `curl ${API_BASE_URL}/tts/preview/en-US-AriaNeural \\
  -o preview.mp3`;

const CURL_CAPABILITIES = `curl ${API_BASE_URL}/transcription/capabilities`;

const CURL_CREATE_TRANSCRIPTION_JOB = `curl -X POST ${API_BASE_URL}/transcription/jobs \\
  -F "file=@recording.mp3" \\
  -F "language=auto" \\
  -F "timestampMode=sentence" \\
  -F "exportFormat=txt"`;

const CURL_TRANSCRIPTION_STATUS = `curl ${API_BASE_URL}/transcription/jobs/JOB_ID \\
  -H "Authorization: Bearer YOUR_TOKEN"`;

const CURL_TRANSCRIPT = `curl ${API_BASE_URL}/transcription/jobs/JOB_ID/transcript \\
  -H "Authorization: Bearer YOUR_TOKEN"`;

const CURL_TRANSCRIPT_RESULT = `curl "${API_BASE_URL}/transcription/jobs/JOB_ID/result?format=srt" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -o transcript.srt`;

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl bg-secondary/50 p-4 font-mono text-xs text-foreground leading-relaxed border border-border/50">
      <code>{code}</code>
    </pre>
  );
}

function Endpoint({ method, path, children }: { method: string; path: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="font-mono text-sm">
        <span className="inline-block rounded bg-primary/10 px-2 py-0.5 font-semibold text-primary mr-2">
          {method}
        </span>
        <code className="text-foreground break-all">{path}</code>
      </p>
      {children ? <div className="mt-2 text-muted-foreground leading-relaxed">{children}</div> : null}
    </div>
  );
}

export default function DevelopersPage() {
  const pageUrl = `${siteConfig.url}/developers`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteConfig.url },
      { '@type': 'ListItem', position: 2, name: 'Developers', item: pageUrl },
    ],
  };

  return (
    <>
      <JsonLd schema={breadcrumbSchema} />

      <Section>
        <Container className="max-w-4xl">
          <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Developers' }]} />
          <PageHeader
            title="Konthora API"
            description="The same API that powers the text-to-speech and transcription workspaces on this site, documented for direct use. No API key and no account: every job returns its own access token."
            badge="For Developers"
          />

          <div className="space-y-10 text-muted-foreground leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">Base URL</h2>
              <p className="mb-4">
                All endpoints live under the versioned base URL below. Requests and responses are
                JSON, except for file downloads, which return the audio or transcript file itself.
              </p>
              <CodeBlock code={API_BASE_URL} />
              <p className="mt-4">
                There is no other version: the path always starts with{' '}
                <code className="text-foreground">/api/v1</code>. Browser (fetch) calls are
                accepted from <code className="text-foreground">konthora.dev.bd</code> and from
                localhost development origins only; server-side calls from anywhere are fine.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">Authentication</h2>
              <p className="mb-4">
                There are no API keys. Creating a job returns a{' '}
                <code className="text-foreground">jobId</code> and an{' '}
                <code className="text-foreground">accessToken</code>. Send that token as a Bearer
                token on every later call for that job — status checks, audio downloads,
                transcripts, and result files:
              </p>
              <CodeBlock code={'Authorization: Bearer YOUR_TOKEN'} />
              <ul className="list-disc pl-5 space-y-2 mt-4">
                <li>
                  <strong className="text-foreground">The token is shown once.</strong> The
                  create-job response is the only place the full token appears; the server stores
                  only a hash of it. If you lose the token, there is no way to recover the job —
                  create a new one.
                </li>
                <li>
                  <strong className="text-foreground">One token per job.</strong> A token only
                  works for the job it was issued with. Using it on another job returns 401.
                </li>
                <li>
                  <strong className="text-foreground">Public endpoints need no token.</strong>{' '}
                  Listing voices, reading transcription capabilities, and fetching a voice preview
                  are unauthenticated.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">Text to speech</h2>
              <p className="mb-6">
                Turn text into spoken audio. Kokoro is the default engine; Edge voices are
                Microsoft neural voices served as a second engine while Edge is reachable. Use the
                same voices the{' '}
                <Link href="/text-to-speech" className="text-primary hover:underline">
                  text-to-speech workspace
                </Link>{' '}
                offers — see <Link href="/voices" className="text-primary hover:underline">all voices</Link> for
                the catalogue.
              </p>

              <h3 className="text-lg font-bold text-foreground mb-3">List voices</h3>
              <Endpoint method="GET" path="/tts/voices">
                <p>
                  Returns the voice catalogue the server will currently accept: all Kokoro voices,
                  plus Edge voices only while Edge is reachable. When Edge is down, its voices are
                  simply absent from this list.
                </p>
              </Endpoint>
              <div className="mb-6">
                <CodeBlock code={CURL_VOICES} />
              </div>
              <p className="mb-6">
                Each voice carries <code className="text-foreground">id</code>,{' '}
                <code className="text-foreground">displayName</code>,{' '}
                <code className="text-foreground">gender</code>,{' '}
                <code className="text-foreground">accent</code>,{' '}
                <code className="text-foreground">language</code>,{' '}
                <code className="text-foreground">recommended</code>, speed limits (
                <code className="text-foreground">defaultSpeed</code>,{' '}
                <code className="text-foreground">minimumSpeed</code>,{' '}
                <code className="text-foreground">maximumSpeed</code>),{' '}
                <code className="text-foreground">engine</code> (
                <code className="text-foreground">kokoro</code> or{' '}
                <code className="text-foreground">edge</code>), and{' '}
                <code className="text-foreground">previewUrl</code>. The preview URL is empty for
                Edge voices — they have no hosted preview clips, and the on-demand preview
                endpoint below is what serves them.
              </p>

              <h3 className="text-lg font-bold text-foreground mb-3">Create a job</h3>
              <Endpoint method="POST" path="/tts/jobs">
                <p>
                  Submits text for synthesis and returns{' '}
                  <code className="text-foreground">jobId</code>,{' '}
                  <code className="text-foreground">accessToken</code>, and{' '}
                  <code className="text-foreground">status</code> (initially{' '}
                  <code className="text-foreground">queued</code>).
                </p>
              </Endpoint>
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-left border-collapse border border-border/70 text-sm">
                  <thead>
                    <tr className="bg-secondary/20">
                      <th className="border border-border/70 px-4 py-3 font-semibold text-foreground">Field</th>
                      <th className="border border-border/70 px-4 py-3 font-semibold text-foreground">Required</th>
                      <th className="border border-border/70 px-4 py-3 font-semibold text-foreground">Rules</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">text</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Yes</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">1–2000 characters, at least one non-whitespace character. Control characters other than tab, newline, and carriage return are rejected.</td>
                    </tr>
                    <tr className="bg-secondary/5">
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">voiceId</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Yes</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Must be an id from GET /tts/voices. An unknown or currently unserved voice returns 400 VOICE_UNSUPPORTED.</td>
                    </tr>
                    <tr>
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">engine</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">No (default kokoro)</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">kokoro or edge. It must match the voice&apos;s own engine; a mismatch returns 400. The server resolves the engine from the voice in any case, so this field cannot switch a voice to the other engine.</td>
                    </tr>
                    <tr className="bg-secondary/5">
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">accent</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">No (default American English)</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">For Kokoro voices it must be one of the accents in the voice catalogue; for Edge voices any non-empty accent is accepted. The accent actually used is always taken from the voice itself.</td>
                    </tr>
                    <tr>
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">speed</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">No (default 1.0)</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Speech rate factor, 0.75–1.25.</td>
                    </tr>
                    <tr className="bg-secondary/5">
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">outputFormat</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">No (default mp3)</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">mp3 or wav. See the format note below: if FFmpeg is unavailable the server silently falls back to the other format.</td>
                    </tr>
                    <tr>
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">sentencePauseMs</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">No (default 220)</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Silence inserted at sentence boundaries, 0–1000 ms.</td>
                    </tr>
                    <tr className="bg-secondary/5">
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">paragraphPauseMs</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">No (default 500)</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Silence inserted at paragraph boundaries, 0–2000 ms.</td>
                    </tr>
                    <tr>
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">normalizeText</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">No (default true)</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Applies the server&apos;s conservative text-normalization pass before synthesis.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mb-6">
                <CodeBlock code={CURL_CREATE_TTS_JOB} />
              </div>

              <h3 className="text-lg font-bold text-foreground mb-3">Check job status</h3>
              <Endpoint method="GET" path="/tts/jobs/{jobId}">
                <p>
                  Poll this endpoint until <code className="text-foreground">status</code> is{' '}
                  <code className="text-foreground">completed</code> or{' '}
                  <code className="text-foreground">failed</code>. Requires the Bearer token.
                </p>
              </Endpoint>
              <div className="mb-4">
                <CodeBlock code={CURL_TTS_STATUS} />
              </div>
              <p className="mb-2">
                <code className="text-foreground">status</code> is one of{' '}
                <code className="text-foreground">queued</code>,{' '}
                <code className="text-foreground">processing</code>,{' '}
                <code className="text-foreground">completed</code>,{' '}
                <code className="text-foreground">failed</code>, or{' '}
                <code className="text-foreground">expired</code>.{' '}
                <code className="text-foreground">progressStage</code> gives finer detail:{' '}
                <code className="text-foreground">queued</code>,{' '}
                <code className="text-foreground">preparing_text</code>,{' '}
                <code className="text-foreground">generating_speech</code>,{' '}
                <code className="text-foreground">processing_audio</code>,{' '}
                <code className="text-foreground">finalizing_file</code>, then{' '}
                <code className="text-foreground">completed</code>,{' '}
                <code className="text-foreground">failed</code>, or{' '}
                <code className="text-foreground">expired</code>.
              </p>
              <p className="mb-6">
                The response also includes <code className="text-foreground">createdAt</code> and{' '}
                <code className="text-foreground">expiresAt</code>,{' '}
                <code className="text-foreground">durationSeconds</code> (null until the audio
                exists), <code className="text-foreground">characterCount</code>,{' '}
                <code className="text-foreground">outputFormat</code> (the format actually
                produced — see the format note below),{' '}
                <code className="text-foreground">errorCode</code> and{' '}
                <code className="text-foreground">errorMessage</code> on failure, and{' '}
                <code className="text-foreground">downloadUrl</code>, which is only present once
                the job is completed.
              </p>

              <h3 className="text-lg font-bold text-foreground mb-3">Download the audio</h3>
              <Endpoint method="GET" path="/tts/jobs/{jobId}/audio">
                <p>
                  Returns the finished audio file (<code className="text-foreground">audio/mpeg</code> for
                  MP3, <code className="text-foreground">audio/wav</code> for WAV) as a download
                  named like <code className="text-foreground">konthora-speech-&lt;first 8 characters of the job id&gt;.mp3</code>.
                  Requires the Bearer token. A HEAD request is also accepted. Calling it before the
                  job completes returns 400 — the audio is not available for the job&apos;s current state.
                </p>
              </Endpoint>
              <div className="mb-6">
                <CodeBlock code={CURL_TTS_AUDIO} />
              </div>

              <h3 className="text-lg font-bold text-foreground mb-3">Preview a voice</h3>
              <Endpoint method="GET" path="/tts/preview/{voice_id}">
                <p>
                  Returns a short MP3 clip of one Edge voice reading a single sentence in its own
                  language, so you can hear a voice before spending a job on it. No token needed.
                </p>
              </Endpoint>
              <div className="mb-4">
                <CodeBlock code={CURL_PREVIEW} />
              </div>
              <ul className="list-disc pl-5 space-y-2 mb-6">
                <li>
                  <strong className="text-foreground">Edge voices only.</strong> Kokoro voices and
                  unknown ids return 404 VOICE_UNSUPPORTED. Kokoro previews are static clips served
                  through the <code className="text-foreground">previewUrl</code> field of the voice
                  list instead.
                </li>
                <li>
                  <strong className="text-foreground">One fixed sentence per language.</strong>{' '}
                  The clip reads a single sentence in the voice&apos;s language — English, Bangla,
                  Hindi, Spanish, French, Italian, or Portuguese; any other language falls back to
                  the English sentence.
                </li>
                <li>
                  <strong className="text-foreground">Cached, and cheap.</strong> The clip is
                  synthesized once per voice and then served from disk (cached by browsers for a
                  day). Previews have their own rate-limit bucket of 120 per hour and never consume
                  the 30-per-hour TTS job quota.
                </li>
                <li>
                  <strong className="text-foreground">Edge must be up.</strong> If Edge is
                  unreachable when you ask, the endpoint returns 503 even if the voice is still
                  listed in the catalogue.
                </li>
              </ul>
              <p className="border-l-4 border-primary/40 pl-4 italic text-sm">
                Format note: Kokoro synthesis produces a WAV master; MP3 output is made by
                transcoding it with FFmpeg, and Edge synthesis produces MP3, which is transcoded to
                WAV the same way. If FFmpeg is unavailable on the server, the requested format is
                silently replaced with the other one and the status response&apos;s{' '}
                <code className="text-foreground">outputFormat</code> tells you which file you
                actually got — so always read that field instead of assuming your request was honoured.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">Transcription</h2>
              <p className="mb-6">
                Turn an audio or video file into a timestamped transcript. Transcription is{' '}
                <strong className="text-foreground">English only</strong>: the model is
                faster-whisper <code className="text-foreground">small.en</code>, so{' '}
                <code className="text-foreground">auto</code> detection maps to English and the
                reported detected language is always{' '}
                <code className="text-foreground">en</code>. The same flow powers the{' '}
                <Link href="/audio-to-text" className="text-primary hover:underline">
                  audio-to-text workspace
                </Link>
                .
              </p>

              <h3 className="text-lg font-bold text-foreground mb-3">Capabilities</h3>
              <Endpoint method="GET" path="/transcription/capabilities">
                <p>
                  Returns the limits and options the server currently enforces, so clients can
                  validate before uploading: accepted file extensions, maximum file size in bytes,
                  maximum media duration in seconds, supported languages, timestamp modes, export
                  formats, and whether word timestamps are available.
                </p>
              </Endpoint>
              <div className="mb-6">
                <CodeBlock code={CURL_CAPABILITIES} />
              </div>

              <h3 className="text-lg font-bold text-foreground mb-3">Create a job</h3>
              <Endpoint method="POST" path="/transcription/jobs">
                <p>
                  Uploads a media file as <code className="text-foreground">multipart/form-data</code> and
                  returns <code className="text-foreground">jobId</code>,{' '}
                  <code className="text-foreground">accessToken</code>, and{' '}
                  <code className="text-foreground">status</code>. The file streams to the server in
                  1 MB chunks.
                </p>
              </Endpoint>
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-left border-collapse border border-border/70 text-sm">
                  <thead>
                    <tr className="bg-secondary/20">
                      <th className="border border-border/70 px-4 py-3 font-semibold text-foreground">Field</th>
                      <th className="border border-border/70 px-4 py-3 font-semibold text-foreground">Required</th>
                      <th className="border border-border/70 px-4 py-3 font-semibold text-foreground">Rules</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">file</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Yes</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Extensions: .mp3, .wav, .m4a, .aac, .mp4, .webm, .mov. Maximum 100 MB and 600 seconds (10 minutes) of media. The extension, the declared MIME type, and the file&apos;s binary header are all checked — a renamed file of the wrong type is rejected.</td>
                    </tr>
                    <tr className="bg-secondary/5">
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">language</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">No (default auto)</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">auto or en only. Both mean English: auto detection maps to English under the small.en model. Any other value returns 400 LANGUAGE_UNSUPPORTED.</td>
                    </tr>
                    <tr>
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">timestampMode</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">No (default sentence)</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">sentence, paragraph, or word. Word mode includes per-word start/end times in the structured transcript.</td>
                    </tr>
                    <tr className="bg-secondary/5">
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">exportFormat</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">No (default txt)</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">txt, srt, vtt, or json. This is the default format for the result download; the download endpoint can override it per request.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="mb-4">
                <CodeBlock code={CURL_CREATE_TRANSCRIPTION_JOB} />
              </div>
              <p className="mb-6">
                After upload, the server inspects the media container with FFprobe (rejecting files
                longer than 600 seconds or with no audio track) and extracts the audio to a 16 kHz
                mono WAV with FFmpeg before transcribing. If the upload is cancelled or the file
                cannot be read, the job is cleaned up and the queue slot is released.
              </p>

              <h3 className="text-lg font-bold text-foreground mb-3">Check job status</h3>
              <Endpoint method="GET" path="/transcription/jobs/{jobId}">
                <p>
                  Poll this endpoint until <code className="text-foreground">status</code> is{' '}
                  <code className="text-foreground">completed</code> or{' '}
                  <code className="text-foreground">failed</code>. Requires the Bearer token.
                </p>
              </Endpoint>
              <div className="mb-4">
                <CodeBlock code={CURL_TRANSCRIPTION_STATUS} />
              </div>
              <p className="mb-2">
                <code className="text-foreground">status</code> is one of{' '}
                <code className="text-foreground">queued</code>,{' '}
                <code className="text-foreground">processing</code>,{' '}
                <code className="text-foreground">completed</code>,{' '}
                <code className="text-foreground">failed</code>, or{' '}
                <code className="text-foreground">expired</code>.{' '}
                <code className="text-foreground">progressStage</code> moves through{' '}
                <code className="text-foreground">uploading</code> (while the file streams in),{' '}
                <code className="text-foreground">inspecting_media</code>,{' '}
                <code className="text-foreground">extracting_audio</code>,{' '}
                <code className="text-foreground">transcribing</code>, and{' '}
                <code className="text-foreground">formatting_transcript</code>.
              </p>
              <p className="mb-6">
                The response also includes the original filename and size, media duration, detected
                language and its probability, transcript and word counts, segment count, the
                timestamp mode and export format you chose,{' '}
                <code className="text-foreground">expiresAt</code>,{' '}
                <code className="text-foreground">errorCode</code> and{' '}
                <code className="text-foreground">errorMessage</code> on failure, and{' '}
                <code className="text-foreground">resultUrl</code>, which is only present once the
                job is completed.
              </p>

              <h3 className="text-lg font-bold text-foreground mb-3">Get the structured transcript</h3>
              <Endpoint method="GET" path="/transcription/jobs/{jobId}/transcript">
                <p>
                  Returns the transcript as structured JSON: schema version, job id, detected
                  language and probability, duration, the full text, per-segment start/end times
                  and text, and — when word timestamps are available — a flat word list with
                  per-word start/end times and probabilities. Requires the Bearer token. Only
                  available once the job is completed; before that it returns 400 RESULT_NOT_READY.
                </p>
              </Endpoint>
              <div className="mb-6">
                <CodeBlock code={CURL_TRANSCRIPT} />
              </div>

              <h3 className="text-lg font-bold text-foreground mb-3">Download the transcript file</h3>
              <Endpoint method="GET" path="/transcription/jobs/{jobId}/result">
                <p>
                  Renders the stored transcript in the requested format and returns it as a file
                  download, named after the original file (for example{' '}
                  <code className="text-foreground">recording.srt</code>). Requires the Bearer
                  token. Without a <code className="text-foreground">format</code> query parameter
                  it uses the <code className="text-foreground">exportFormat</code> chosen at job
                  creation; pass <code className="text-foreground">?format=txt</code>,{' '}
                  <code className="text-foreground">srt</code>,{' '}
                  <code className="text-foreground">vtt</code>, or{' '}
                  <code className="text-foreground">json</code> to override it. An unknown format
                  returns 400, and a job that is not completed returns 400 RESULT_NOT_READY.
                </p>
              </Endpoint>
              <div className="mb-6">
                <CodeBlock code={CURL_TRANSCRIPT_RESULT} />
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">Limits and expiry</h2>
              <p className="mb-4">
                Limits are enforced per client IP over a sliding one-hour window. When a limit is
                hit the response is 429 with a <code className="text-foreground">Retry-After</code>{' '}
                header telling you how many seconds to wait.
              </p>
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-left border-collapse border border-border/70 text-sm">
                  <thead>
                    <tr className="bg-secondary/20">
                      <th className="border border-border/70 px-4 py-3 font-semibold text-foreground">Bucket</th>
                      <th className="border border-border/70 px-4 py-3 font-semibold text-foreground">Per hour, per IP</th>
                      <th className="border border-border/70 px-4 py-3 font-semibold text-foreground">Concurrency</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">Text-to-speech jobs</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">30 job creations</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">2 active jobs at once; the TTS queue holds 10 jobs</td>
                    </tr>
                    <tr className="bg-secondary/5">
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">Transcription jobs</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">15 job creations</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">1 active job at a time; the transcription queue holds 5 jobs</td>
                    </tr>
                    <tr>
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">Voice previews</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">120 previews</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Separate bucket — previews never consume the TTS job quota</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mb-4">
                A full queue returns 503 QUEUE_FULL, and hitting the active-job cap returns 429 —
                both mean &ldquo;wait for a running job to finish&rdquo;, not &ldquo;wait an hour.&rdquo;
                Listing voices, reading capabilities, polling status, and downloading results are not
                rate-limited.
              </p>
              <p>
                <strong className="text-foreground">Expiry:</strong> finished jobs — completed or
                failed — are kept for 60 minutes after they finish. The status response&apos;s{' '}
                <code className="text-foreground">expiresAt</code> tells you exactly when. After
                that the audio or transcript files are deleted from disk and the job reports{' '}
                <code className="text-foreground">expired</code>; later reads return 410
                JOB_EXPIRED. Download results promptly — there is no way to extend a job&apos;s life.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">Errors</h2>
              <p className="mb-4">
                Errors are JSON with a machine-readable{' '}
                <code className="text-foreground">code</code> and a human-readable{' '}
                <code className="text-foreground">message</code>:{' '}
                <code className="text-foreground">{'{"code": "RATE_LIMITED", "message": "..."}'}</code>.
                Note that request validation failures return 400, not the 422 FastAPI would send by
                default.
              </p>
              <div className="overflow-x-auto mb-4">
                <table className="w-full text-left border-collapse border border-border/70 text-sm">
                  <thead>
                    <tr className="bg-secondary/20">
                      <th className="border border-border/70 px-4 py-3 font-semibold text-foreground">Status</th>
                      <th className="border border-border/70 px-4 py-3 font-semibold text-foreground">Code</th>
                      <th className="border border-border/70 px-4 py-3 font-semibold text-foreground">Meaning</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">400</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">INVALID_REQUEST</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">A field failed validation — for example text over 2000 characters, speed outside 0.75–1.25, a voice/engine mismatch, an unsupported language, timestamp mode, export format, or file type, a file over 100 MB, a result requested before the job finished, or an audio download for a job that is not completed.</td>
                    </tr>
                    <tr className="bg-secondary/5">
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">401</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">UNAUTHORIZED</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">The Bearer token is missing or does not match the job.</td>
                    </tr>
                    <tr>
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">404</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">JOB_NOT_FOUND / VOICE_UNSUPPORTED</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">No job with that id exists, or the preview endpoint was asked for a Kokoro or unknown voice.</td>
                    </tr>
                    <tr className="bg-secondary/5">
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">410</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">JOB_EXPIRED</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">The job finished more than 60 minutes ago and its output has been deleted.</td>
                    </tr>
                    <tr>
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">429</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">RATE_LIMITED</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">The hourly limit or the active-job cap for your IP was hit. Check the Retry-After header.</td>
                    </tr>
                    <tr className="bg-secondary/5">
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">500</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">GENERATION_FAILED / INTERNAL_SERVER_ERROR</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">Audio generation failed, or something unexpected went wrong on the server. The message is deliberately generic.</td>
                    </tr>
                    <tr>
                      <td className="border border-border/70 px-4 py-3 text-foreground font-medium">503</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">QUEUE_FULL / SERVICE_UNAVAILABLE / MODEL_UNAVAILABLE / ENCODER_UNAVAILABLE</td>
                      <td className="border border-border/70 px-4 py-3 text-muted-foreground">The job queue is full, Edge previews are down, or the speech engine or audio encoder is unavailable. Retry later.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-4">Things to know before you build</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong className="text-foreground">Jobs live in server memory.</strong> Job
                  records are kept in memory, not in a database. If the API service restarts, job
                  ids from before the restart stop resolving (404) — keep your tokens and downloads
                  short-lived, and do not store job ids as permanent references.
                </li>
                <li>
                  <strong className="text-foreground">One worker per queue.</strong> TTS and
                  transcription each run a single worker, so jobs run one at a time; long texts and
                  long files queue behind whatever is already running.
                </li>
                <li>
                  <strong className="text-foreground">Edge voices can disappear mid-day.</strong>{' '}
                  Edge is an unofficial free endpoint with no SLA. Its voices only appear in the
                  voice list while a cached availability probe says Edge is reachable, and preview
                  requests can still 503 if Edge goes down between probes.
                </li>
                <li>
                  <strong className="text-foreground">Transcription is English only.</strong>{' '}
                  Uploading non-English audio still runs, but the model only knows English — the
                  transcript will be wrong, not an error.
                </li>
                <li>
                  <strong className="text-foreground">Download URLs are relative.</strong> The{' '}
                  <code className="text-foreground">downloadUrl</code> and{' '}
                  <code className="text-foreground">resultUrl</code> fields in status responses are
                  paths like <code className="text-foreground">/api/v1/tts/jobs/…/audio</code>;
                  resolve them against the base URL above.
                </li>
                <li>
                  <strong className="text-foreground">Poll, don&apos;t guess.</strong> There are
                  no webhooks. Poll the status endpoint every couple of seconds and stop when the
                  status is <code className="text-foreground">completed</code>,{' '}
                  <code className="text-foreground">failed</code>, or{' '}
                  <code className="text-foreground">expired</code>.
                </li>
              </ul>
              <p className="mt-6 text-sm">
                Prefer the website? The{' '}
                <Link href="/text-to-speech" className="text-primary hover:underline">
                  text-to-speech workspace
                </Link>{' '}
                and the{' '}
                <Link href="/audio-to-text" className="text-primary hover:underline">
                  audio-to-text workspace
                </Link>{' '}
                use exactly this API, with the same voices, limits, and 60-minute expiry.
              </p>
            </section>
          </div>
        </Container>
      </Section>
    </>
  );
}
