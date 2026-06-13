import { NextResponse } from 'next/server';
import { advanceVideoJob, getVideoJob } from '@/lib/server/videoJobStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, context: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await context.params;
  if (!jobId) {
    return NextResponse.json({ error: 'Missing jobId.' }, { status: 400 });
  }

  const advanced = await advanceVideoJob(jobId);
  if (!advanced) {
    return NextResponse.json({ error: 'Video job not found.' }, { status: 404 });
  }

  const current = (await getVideoJob(jobId)) || advanced;
  return NextResponse.json({
    ok: true,
    ...current,
    pollUrl: `/api/video/jobs/${jobId}`,
    resultUrl: `/api/video/jobs/${jobId}/result`,
  });
}
