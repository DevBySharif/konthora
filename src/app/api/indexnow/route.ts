import { NextResponse } from 'next/server';

export const INDEXNOW_KEY = 'ff904654fd97c20407266dd4f36709dad68735eda40b31f7bd84ac4b0bfe3478';

export async function GET() {
  return new NextResponse(INDEXNOW_KEY, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
