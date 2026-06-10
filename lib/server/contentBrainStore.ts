import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export type BrainEvent = {
  id: string;
  topic: string;
  platform: 'tiktok' | 'youtube' | 'instagram' | 'facebook' | 'x';
  publishHour: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  retentionRate: number;
  conversions: number;
  revenueUsd: number;
  createdAt: string;
};

type InsightLanguage = 'pl' | 'en' | 'es';

const BRAIN_FILE = path.join(process.cwd(), '.runtime', 'content-brain-events.json');

function eventScore(e: BrainEvent) {
  const engagementRate = (e.likes + e.comments + e.shares) / Math.max(e.views, 1);
  return Number((e.views * 0.0008 + engagementRate * 120 + e.retentionRate * 60 + e.conversions * 15 + e.revenueUsd * 3).toFixed(4));
}

async function readEvents(): Promise<BrainEvent[]> {
  try {
    const raw = await readFile(BRAIN_FILE, 'utf8');
    return JSON.parse(raw) as BrainEvent[];
  } catch {
    return [];
  }
}

async function writeEvents(events: BrainEvent[]) {
  await mkdir(path.dirname(BRAIN_FILE), { recursive: true });
  await writeFile(BRAIN_FILE, JSON.stringify(events.slice(-3000), null, 2), 'utf8');
}

function id() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function ingestBrainEvents(input: Array<Partial<BrainEvent>>) {
  const prev = await readEvents();
  const mapped = input.map((e) => ({
    id: id(),
    topic: String(e.topic || 'Untitled Topic'),
    platform: (e.platform || 'youtube') as BrainEvent['platform'],
    publishHour: Math.min(23, Math.max(0, Number(e.publishHour ?? 18))),
    views: Math.max(0, Number(e.views ?? 0)),
    likes: Math.max(0, Number(e.likes ?? 0)),
    comments: Math.max(0, Number(e.comments ?? 0)),
    shares: Math.max(0, Number(e.shares ?? 0)),
    retentionRate: Math.max(0, Math.min(1, Number(e.retentionRate ?? 0.35))),
    conversions: Math.max(0, Number(e.conversions ?? 0)),
    revenueUsd: Math.max(0, Number(e.revenueUsd ?? 0)),
    createdAt: new Date().toISOString(),
  }));
  const next = [...prev, ...mapped];
  await writeEvents(next);
  return mapped.length;
}

export async function getBrainInsights(limit = 5, language: InsightLanguage = 'pl') {
  const events = await readEvents();
  if (!events.length) {
    return {
      samples: 0,
      topTopics: [],
      bestHours: [],
      recommendations: [
        language === 'en'
          ? 'No data yet. Add metrics through /api/content-brain/ingest or after publishing.'
          : language === 'es'
            ? 'Todavia no hay datos. Agrega metricas mediante /api/content-brain/ingest o despues de publicar.'
            : 'Brak danych. Dodaj metryki przez /api/content-brain/ingest lub po publikacjach.',
      ],
    };
  }

  const globalAvg = events.reduce((sum, e) => sum + eventScore(e), 0) / events.length;

  const byTopic = new Map<string, { total: number; count: number; views: number }>();
  const byHour = new Map<number, { total: number; count: number }>();

  for (const e of events) {
    const score = eventScore(e);
    const t = byTopic.get(e.topic) || { total: 0, count: 0, views: 0 };
    t.total += score;
    t.count += 1;
    t.views += e.views;
    byTopic.set(e.topic, t);

    const h = byHour.get(e.publishHour) || { total: 0, count: 0 };
    h.total += score;
    h.count += 1;
    byHour.set(e.publishHour, h);
  }

  const topTopics = Array.from(byTopic.entries())
    .map(([topic, v]) => {
      const avg = v.total / v.count;
      const uplift = globalAvg > 0 ? ((avg - globalAvg) / globalAvg) * 100 : 0;
      return {
        topic,
        samples: v.count,
        avgViews: Math.round(v.views / v.count),
        score: Number(avg.toFixed(2)),
        upliftPct: Number(uplift.toFixed(1)),
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const bestHours = Array.from(byHour.entries())
    .map(([hour, v]) => ({ hour, score: Number((v.total / v.count).toFixed(2)), samples: v.count }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  const rec: string[] = [];
  if (topTopics[0]) {
    rec.push(
      language === 'en'
        ? `Topic "${topTopics[0].topic}" performs ${topTopics[0].upliftPct}% better than the average.`
        : language === 'es'
          ? `El tema "${topTopics[0].topic}" rinde un ${topTopics[0].upliftPct}% mejor que la media.`
          : `Temat "${topTopics[0].topic}" daje srednio ${topTopics[0].upliftPct}% lepszy wynik niz srednia.`
    );
  }
  if (bestHours[0]) {
    rec.push(
      language === 'en'
        ? `Best publishing hour: ${bestHours[0].hour}:00 (score ${bestHours[0].score}).`
        : language === 'es'
          ? `Mejor hora para publicar: ${bestHours[0].hour}:00 (score ${bestHours[0].score}).`
          : `Najlepsza godzina publikacji: ${bestHours[0].hour}:00 (score ${bestHours[0].score}).`
    );
  }
  if (topTopics.length > 1) {
    rec.push(
      language === 'en'
        ? `Scale the series: ${topTopics.slice(0, 2).map((x) => x.topic).join(' + ')}.`
        : language === 'es'
          ? `Escala la serie: ${topTopics.slice(0, 2).map((x) => x.topic).join(' + ')}.`
          : `Skaluj serie: ${topTopics.slice(0, 2).map((x) => x.topic).join(' + ')}.`
    );
  }

  return {
    samples: events.length,
    topTopics,
    bestHours,
    recommendations: rec,
  };
}
