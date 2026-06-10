import { NextResponse } from 'next/server';
import { getPublishJob, processPublishJob } from '@/lib/server/publishQueue';

export async function GET(_: Request, context: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await context.params;
  const job = await getPublishJob(jobId);
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  return NextResponse.json({ job });
}

export async function POST(_: Request, context: { params: Promise<{ jobId: string }> }) {
  const url = new URL(_.url);
  const force = url.searchParams.get('force') === '1';
  const { jobId } = await context.params;
  const job = await processPublishJob(jobId, { force });
  if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  return NextResponse.json({ job });
}
