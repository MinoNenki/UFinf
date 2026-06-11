export type PlanKey = 'free' | 'pro' | 'premium_plus' | 'expert';

export type AntiLossSettings = {
  maxRequestCostUsd: number;
  dailyGlobalAiBudgetUsd: number;
  freeDailyGenerations: number;
  proDailyGenerations: number;
  premiumPlusDailyGenerations: number;
  softStopPercent: number;
};

export type ApiKeySettings = {
  openaiApiKey: string;
  anthropicApiKey: string;
  replicateApiToken: string;
  tiktokAccessToken: string;
  tiktokOpenId: string;
  youtubeAccessToken: string;
  youtubeChannelId: string;
  instagramAccessToken: string;
  instagramUserId: string;
  facebookAccessToken: string;
  facebookPageId: string;
  xBearerToken: string;
};

export type FeatureSettings = {
  oneClickPublishEnabled: boolean;
  aiContentBrainEnabled: boolean;
};

export type AppSettings = {
  antiLoss: AntiLossSettings;
  apiKeys: ApiKeySettings;
  features: FeatureSettings;
  updatedAt: string;
};

export type PublicAppSettings = {
  antiLoss: AntiLossSettings;
  apiKeys: {
    openaiConfigured: boolean;
    anthropicConfigured: boolean;
    replicateConfigured: boolean;
    tiktokConfigured: boolean;
    youtubeConfigured: boolean;
    instagramConfigured: boolean;
    facebookConfigured: boolean;
    xConfigured: boolean;
  };
  features: FeatureSettings;
  updatedAt: string;
};
