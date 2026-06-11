import { PlanKey } from '@/lib/settings';

export type HybridTask = 'script' | 'description' | 'hashtags' | 'thumbnail' | 'video-idea';

export type HybridCapabilities = {
  hasOpenAi: boolean;
  hasAnthropic: boolean;
};

export function chooseHybridStrategy(plan: PlanKey, task: HybridTask, capabilities: HybridCapabilities) {
  const hasRealAi = capabilities.hasOpenAi || capabilities.hasAnthropic;
  if (!hasRealAi) {
    return { provider: 'mock', mode: 'safe_demo', reason: 'No API key configured' } as const;
  }

  const qualityProvider = capabilities.hasOpenAi
    ? 'openai'
    : capabilities.hasAnthropic
      ? 'anthropic'
      : 'mock';

  const costProvider = capabilities.hasAnthropic
    ? 'anthropic-haiku'
    : capabilities.hasOpenAi
      ? 'openai-mini'
      : 'mock';

  if (plan === 'premium_plus' || plan === 'expert') {
    if (task === 'video-idea' || task === 'script') {
      return { provider: qualityProvider, mode: 'quality', reason: 'Premium high quality path' } as const;
    }
    return { provider: costProvider, mode: 'hybrid_cost_optimized', reason: 'Premium hybrid path' } as const;
  }

  if (plan === 'pro') {
    return { provider: costProvider, mode: 'hybrid_cost_optimized', reason: 'Pro optimized path' } as const;
  }

  return { provider: 'mock', mode: 'safe_demo', reason: 'Free plan protection' } as const;
}

export function buildOneClickHybridPlan(plan: PlanKey, capabilities: HybridCapabilities) {
  return {
    script: chooseHybridStrategy(plan, 'script', capabilities),
    description: chooseHybridStrategy(plan, 'description', capabilities),
    hashtags: chooseHybridStrategy(plan, 'hashtags', capabilities),
    thumbnail: chooseHybridStrategy(plan, 'thumbnail', capabilities),
    videoIdea: chooseHybridStrategy(plan, 'video-idea', capabilities),
  };
}
