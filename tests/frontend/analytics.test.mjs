import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, '..', '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const analyticsSource = read('src/components/analytics/Analytics.tsx');
const claritySource = read('src/components/analytics/ClarityAnalytics.tsx');
const layoutSource = read('src/app/layout.tsx');
const deployScript = read('deploy/scripts/deploy.sh');
const envTemplate = read('.env.production.example');

test('the root layout renders the analytics component', () => {
  assert.match(layoutSource, /import Analytics from/u, 'layout must import Analytics');
  assert.match(layoutSource, /<Analytics\s*\/>/u, 'layout must render <Analytics />');
});

test('analytics is rendered once, not duplicated per page', () => {
  const mounts = (layoutSource.match(/<Analytics\s*\/>/gu) || []).length;
  assert.equal(mounts, 1, `Analytics mounted ${mounts} times`);
});

test('an unset id renders no third-party script at all', () => {
  // Analytics.tsx gates each tag on the id, so a build without the env vars
  // never requests googletagmanager or clarity. This is what makes a
  // misconfigured deploy safe rather than slow.
  assert.match(analyticsSource, /GA_MEASUREMENT_ID \? <GoogleAnalytics/u);
  assert.match(analyticsSource, /GA_MEASUREMENT_ID \|\| ''/u, 'must default to an empty string');
  assert.match(claritySource, /if \(!projectId\) return;/u, 'Clarity must no-op without an id');
});

test('Clarity never blocks first render and never breaks the page', () => {
  assert.match(claritySource, /requestIdleCallback/u, 'Clarity must load on idle');
  assert.match(claritySource, /tag\.async = true/u, 'the injected tag must be async');
  assert.match(claritySource, /try \{/u, 'injection must be guarded');
  assert.match(claritySource, /console\.error\('Clarity init failed/u);
});

test('the CSP permits exactly the analytics hosts the tags contact', () => {
  // A CSP missing these hosts silently blocks analytics while the page still
  // looks healthy, which is the same failure mode as a missing id.
  const csp = read('next.config.ts');
  assert.match(csp, /googletagmanager\.com/u, 'CSP must allow googletagmanager for GA4');
  assert.match(csp, /clarity\.ms/u, 'CSP must allow clarity.ms for Clarity');
  assert.match(csp, /google-analytics\.com/u, 'CSP must allow GA4 collection');
});

test('the deploy script fails the build when a configured id is not emitted', () => {
  // This is the regression guard. Analytics ids are inlined at build time, so
  // an id missing from the env file silently produces a site with no analytics
  // and no error. The deploy must verify the emitted HTML and abort.
  assert.match(
    deployScript,
    /GA_ID="\$\{NEXT_PUBLIC_GA_MEASUREMENT_ID:-\}"/u,
    'deploy must read the GA id from the env file',
  );
  assert.match(
    deployScript,
    /grep -qF "\$GA_ID" "\$HOMEPAGE_HTML"/u,
    'deploy must check the GA id in the prerendered HTML',
  );
  assert.match(
    deployScript,
    /grep -rqF "\$CLARITY_ID" "\$REPO_DIR\/\.next\/static"/u,
    'deploy must check the Clarity id in the client chunks, where it is actually inlined',
  );
  assert.match(deployScript, /exit 1/u, 'a missing id must abort the deploy');
  assert.match(
    deployScript,
    /no analytics ids in \\\$WEB_ENV_FILE|WARN: no analytics ids/u,
    'deploy must warn loudly when no ids are configured at all',
  );
});

test('the deploy script sources the env file before building', () => {
  // Ordering matters: NEXT_PUBLIC_* must be exported before `npm run build`.
  const sourceIdx = deployScript.indexOf('source "$WEB_ENV_FILE"');
  const buildIdx = deployScript.indexOf('npm run build');
  assert.ok(sourceIdx !== -1, 'deploy must source the web env file');
  assert.ok(buildIdx !== -1, 'deploy must run the build');
  assert.ok(sourceIdx < buildIdx, 'the env file must be sourced before the build inlines it');
});

test('the env template ships both analytics ids filled in', () => {
  // An empty value in the template is what produced an unmeasurable site.
  const ga = envTemplate.match(/^NEXT_PUBLIC_GA_MEASUREMENT_ID=(.*)$/mu);
  const clarity = envTemplate.match(/^NEXT_PUBLIC_CLARITY_PROJECT_ID=(.*)$/mu);
  assert.ok(ga, 'the template must define NEXT_PUBLIC_GA_MEASUREMENT_ID');
  assert.ok(clarity, 'the template must define NEXT_PUBLIC_CLARITY_PROJECT_ID');
  assert.match(ga[1].trim(), /^G-[A-Z0-9]+$/u, 'the GA4 id must be filled in, not empty');
  assert.match(clarity[1].trim(), /^[a-z0-9]{6,}$/u, 'the Clarity project id must be filled in');
});

test('a build carries both analytics ids where each one actually lands', () => {
  // Reads the real build artifacts when present, and skips when there is no
  // build so the suite still runs before the first `npm run build`.
  //
  // GA4 is inlined into the prerendered HTML by @next/third-parties. Clarity is
  // injected from a client-side effect, so its id only ever appears in the JS
  // chunks. Asserting the Clarity id is in the HTML is wrong and made this
  // suite fail against a perfectly good build.
  const htmlPath = path.join(root, '.next', 'server', 'app', 'index.html');
  if (!fs.existsSync(htmlPath)) {
    return;
  }
  const html = fs.readFileSync(htmlPath, 'utf8');
  const ga = envTemplate.match(/^NEXT_PUBLIC_GA_MEASUREMENT_ID=(.*)$/mu)[1].trim();
  const clarity = envTemplate.match(/^NEXT_PUBLIC_CLARITY_PROJECT_ID=(.*)$/mu)[1].trim();

  assert.ok(
    html.includes(ga),
    'the GA4 id is missing from the built homepage, so production would have no analytics',
  );
  assert.ok(
    !html.includes(clarity),
    'Clarity is client-injected, so its id should not be inlined into the HTML',
  );

  const chunkDir = path.join(root, '.next', 'static', 'chunks');
  const chunks = fs
    .readdirSync(chunkDir, { recursive: true })
    .filter((entry) => typeof entry === 'string' && entry.endsWith('.js'))
    .map((entry) => path.join(chunkDir, entry));
  const inChunks = chunks.some((file) => fs.readFileSync(file, 'utf8').includes(clarity));
  assert.ok(
    inChunks,
    'the Clarity id is missing from every built client chunk, so production would have no heatmaps or session replay',
  );
});
