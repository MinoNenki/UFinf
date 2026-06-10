import { NextResponse } from 'next/server';
import { listPublishJobs, processPublishJob } from '@/lib/server/publishQueue';

export async function POST() {
  const jobs = await listPublishJobs(20);
  const pending = jobs.filter((job) => Object.values(job.platforms).some((p) => p.status === 'pending' || p.status === 'retrying'));

  const updated = [];
  for (const job of pending) {
    const next = await processPublishJob(job.id);
    if (next) updated.push(next.id);
  }

  return NextResponse.json({ processedJobs: updated.length, jobIds: updated });
}
