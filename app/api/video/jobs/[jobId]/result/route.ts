import { readFile } from 'node:fs/promises';
import { NextResponse } from 'next/server';
import { getVideoJob, getVideoJobOutputPath } from '@/lib/server/videoJobStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, context: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await context.params;
  if (!jobId) {
    return NextResponse.json({ error: 'Missing jobId.' }, { status: 400 });
  }

  const job = await getVideoJob(jobId);
  if (!job) {
    return NextResponse.json({ error: 'Video job not found.' }, { status: 404 });
  }

  if (job.status !== 'done') {
    return NextResponse.json(
      {
        error: 'Video is not ready yet.',
        status: job.status,
        progress: job.progress,
      },
      { status: 409 }
    );
  }

  const outputPath = await getVideoJobOutputPath(jobId);
  if (!outputPath) {
    return NextResponse.json({ error: 'Rendered output not found.' }, { status: 404 });
  }

  const bytes = await readFile(outputPath);
  const outputName = `edited_${job.originalFileName.replace(/\.[a-zA-Z0-9]+$/, '') || 'video'}.mp4`;

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Disposition': `inline; filename="${outputName}"`,
      'X-Video-Engine': 'ffmpeg-async',
      'Cache-Control': 'no-store',
    },
  });
}
