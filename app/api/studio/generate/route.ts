import { NextResponse } from 'next/server';
import { readSettings } from '@/lib/server/settingsStore';
import { generateStudioImageAsset, generateStudioVideoBlueprint } from '@/lib/server/mediaProvider';
import { saveStudioHistoryEntry } from '@/lib/server/studioHistoryStore';
import { requireEntitlement } from '@/lib/server/security/requireEntitlement';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const guard = await requireEntitlement(req, ['pro', 'premium_plus', 'expert']);
  if (guard) return guard;
  const body = await req.json().catch(() => ({}));
  const topic = String(body.topic || '').trim();
  const preset = String(body.preset || '').trim();
  const tone = String(body.tone || '').trim();
  const mode = String(body.mode || 'image');
  const language = String(body.language || 'pl') as 'pl' | 'en' | 'es';
  const providerMode = String(body.providerMode || 'fallback') as 'fast' | 'fallback' | 'quality_max';

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

      const historyEntry = await saveStudioHistoryEntry({
        mode: 'image',
        topic,
        preset,
        tone,
        language,
        providerMode,
        providerUsed: image.providerUsed,
        generatedPrompt: image.revisedPrompt,
        revisedPrompt: image.revisedPrompt,
        imageDataUrl: image.imageDataUrl,
      });

      return NextResponse.json({
        ok: true,
        mode: 'image',
        providerMode,
        ...image,
        historyEntry,
      });
    }

    const video = await generateStudioVideoBlueprint({
      topic,
      preset,
      tone,
      language,
      openaiApiKey: settings.apiKeys.openaiApiKey,
      anthropicApiKey: settings.apiKeys.anthropicApiKey,
      providerMode,
    });

    const historyEntry = await saveStudioHistoryEntry({
      mode: 'video',
      topic,
      preset,
      tone,
      language,
      providerMode,
      providerUsed: video.providerUsed,
      generatedPrompt: video.blueprint.hook,
      blueprint: video.blueprint,
    });

    return NextResponse.json({
      ok: true,
      mode: 'video',
      providerMode,
      providerUsed: video.providerUsed,
      providersTried: video.providersTried,
      blueprint: video.blueprint,
      historyEntry,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Studio generation failed.' },
      { status: 502 }
    );
  }
}
