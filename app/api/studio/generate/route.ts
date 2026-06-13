import { NextResponse } from 'next/server';
import { readSettings } from '@/lib/server/settingsStore';
import { generateStudioImageAsset, generateStudioVideoBlueprint } from '@/lib/server/mediaProvider';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const topic = String(body.topic || '').trim();
  const preset = String(body.preset || '').trim();
  const tone = String(body.tone || '').trim();
  const mode = String(body.mode || 'image');
  const language = String(body.language || 'pl') as 'pl' | 'en' | 'es';

  if (!topic) {
    return NextResponse.json({ error: 'Topic is required.' }, { status: 400 });
  }

  const settings = await readSettings();

  try {
    if (mode === 'image') {
      const image = await generateStudioImageAsset({
        topic,
        preset,
        tone,
        language,
        openaiApiKey: settings.apiKeys.openaiApiKey,
      });

      return NextResponse.json({
        ok: true,
        mode: 'image',
        ...image,
      });
    }

    const blueprint = await generateStudioVideoBlueprint({
      topic,
      preset,
      tone,
      language,
      openaiApiKey: settings.apiKeys.openaiApiKey,
    });

    return NextResponse.json({
      ok: true,
      mode: 'video',
      blueprint,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Studio generation failed.' },
      { status: 502 }
    );
  }
}
