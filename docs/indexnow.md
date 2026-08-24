# IndexNow operator workflow

Konthora submits IndexNow notifications only for explicit canonical URLs that are new, updated, or removed. The deployment script does not submit URLs automatically, so an indexing-service outage cannot make an application deployment fail.

## Submit new or updated URLs

After deploying a content or SEO change, submit only the affected canonical paths. For example, when the homepage, Audio to Text, and About pages changed:

```bash
npm run indexnow -- / /audio-to-text /about
```

The utility accepts canonical `https://konthora.dev.bd/...` URLs as well as root-relative paths. It removes duplicate URLs and rejects other hosts, localhost, query/preset URLs, fragments, malformed URLs, and batches larger than 10,000 URLs.

## Notify a removed URL

After a genuine removal is deployed and the URL returns its intended final HTTP status (normally 404 or 410), notify that exact former canonical path:

```bash
npm run indexnow -- /former-route
```

Do not submit the full sitemap after a normal deployment and do not repeatedly submit unchanged URLs.

## Verification key

The public IndexNow verification file is served from the canonical host root:

```text
https://konthora.dev.bd/ff904654fd97c20407266dd4f36709dad68735eda40b31f7bd84ac4b0bfe3478.txt
```

The key is intentionally public under the IndexNow protocol and is not an application or SSH credential.
