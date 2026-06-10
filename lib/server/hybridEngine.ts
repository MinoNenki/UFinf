import { PlanKey } from '@/lib/settings';

export type HybridTask = 'script' | 'description' | 'hashtags' | 'thumbnail' | 'video-idea';

export function chooseHybridStrategy(plan: PlanKey, task: HybridTask, hasRealAi: boolean) {
  if (!hasRealAi) {
    return { provider: 'mock', mode: 'safe_demo', reason: 'No API key configured' } as const;
  }

  if (plan === 'premium_plus') {
    if (task === 'video-idea' || task === 'script') {
      return { provider: 'openai', mode: 'quality', reason: 'Premium high quality path' } as const;
    }
    return { provider: 'openai-mini', mode: 'hybrid_cost_optimized', reason: 'Premium hybrid path' } as const;
  }

  if (plan === 'pro') {
    return { provider: 'openai-mini', mode: 'hybrid_cost_optimized', reason: 'Pro optimized path' } as const;
  }

  return { provider: 'mock', mode: 'safe_demo', reason: 'Free plan protection' } as const;
}

export function buildOneClickHybridPlan(plan: PlanKey, hasRealAi: boolean) {
  return {
    script: chooseHybridStrategy(plan, 'script', hasRealAi),
    description: chooseHybridStrategy(plan, 'description', hasRealAi),
    hashtags: chooseHybridStrategy(plan, 'hashtags', hasRealAi),
    thumbnail: chooseHybridStrategy(plan, 'thumbnail', hasRealAi),
    videoIdea: chooseHybridStrategy(plan, 'video-idea', hasRealAi),
  };
}
