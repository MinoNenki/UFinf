import { NextResponse } from 'next/server';
import { listPublishJobs } from '@/lib/server/publishQueue';

export async function GET() {
  const jobs = await listPublishJobs(30);
  return NextResponse.json({ jobs });
}
