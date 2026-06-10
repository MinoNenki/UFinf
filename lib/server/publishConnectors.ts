import type { PublishPlatform } from '@/lib/server/publishQueue';
import type { ApiKeySettings } from '@/lib/settings';

export type ConnectorResult = {
  externalId: string;
  publishedUrl: string;
};

function ensure(value: string, field: string) {
  if (!value) throw new Error(`Missing connector config: ${field}`);
  return value;
}

async function parseJsonOrText(res: Response) {
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return await res.json();
  }
  return await res.text();
}

async function assertOk(res: Response, platform: PublishPlatform) {
  if (res.ok) return;
  const payload = await parseJsonOrText(res);
  const message = typeof payload === 'string' ? payload : JSON.stringify(payload);
  throw new Error(`${platform} API ${res.status}: ${message.slice(0, 500)}`);
}

function textFor(platform: PublishPlatform, topic: string, descriptionByPlatform: Record<string, string>, hashtags: string[]) {
  const desc = descriptionByPlatform[platform] || topic;
  const tags = hashtags.slice(0, 6).map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ');
  return `${desc}\n\n${tags}`.slice(0, 270);
}

async function publishX(input: {
  text: string;
  apiKeys: ApiKeySettings;
  idempotencyKey: string;
}): Promise<ConnectorResult> {
  const token = ensure(input.apiKeys.xBearerToken, 'xBearerToken');
  const res = await fetch('https://api.x.com/2/tweets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Client-Transaction-Id': input.idempotencyKey,
      'Idempotency-Key': input.idempotencyKey,
    },
    body: JSON.stringify({ text: input.text }),
  });
  await assertOk(res, 'x');
  const data = await res.json() as { data?: { id?: string } };
  const id = data.data?.id || `x-${Date.now()}`;
  return {
    externalId: id,
    publishedUrl: `https://x.com/i/web/status/${id}`,
  };
}

async function publishFacebook(input: {
  text: string;
  apiKeys: ApiKeySettings;
  idempotencyKey: string;
}): Promise<ConnectorResult> {
  const token = ensure(input.apiKeys.facebookAccessToken, 'facebookAccessToken');
  const pageId = ensure(input.apiKeys.facebookPageId, 'facebookPageId');
  const params = new URLSearchParams();
  params.set('message', input.text);
  params.set('access_token', token);

  const res = await fetch(`https://graph.facebook.com/v20.0/${pageId}/feed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Idempotency-Key': input.idempotencyKey,
    },
    body: params,
  });
  await assertOk(res, 'facebook');
  const data = await res.json() as { id?: string };
  return {
    externalId: data.id || `facebook-${Date.now()}`,
    publishedUrl: `https://www.facebook.com/${pageId}`,
  };
}

async function publishInstagram(input: {
  text: string;
  mediaUrl: string;
  apiKeys: ApiKeySettings;
  idempotencyKey: string;
}): Promise<ConnectorResult> {
  const token = ensure(input.apiKeys.instagramAccessToken, 'instagramAccessToken');
  const igUserId = ensure(input.apiKeys.instagramUserId, 'instagramUserId');

  const createParams = new URLSearchParams();
  createParams.set('caption', input.text);
  createParams.set('image_url', input.mediaUrl);
  createParams.set('access_token', token);

  const createRes = await fetch(`https://graph.facebook.com/v20.0/${igUserId}/media`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Idempotency-Key': input.idempotencyKey,
    },
    body: createParams,
  });
  await assertOk(createRes, 'instagram');
  const createData = await createRes.json() as { id?: string };
  const creationId = ensure(createData.id || '', 'instagram media creation id');

  const publishParams = new URLSearchParams();
  publishParams.set('creation_id', creationId);
  publishParams.set('access_token', token);

  const publishRes = await fetch(`https://graph.facebook.com/v20.0/${igUserId}/media_publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Idempotency-Key': input.idempotencyKey,
    },
    body: publishParams,
  });
  await assertOk(publishRes, 'instagram');
  const publishData = await publishRes.json() as { id?: string };
  const mediaId = publishData.id || creationId;

  return {
    externalId: mediaId,
    publishedUrl: `https://www.instagram.com/p/${mediaId}`,
  };
}

async function publishTikTok(input: {
  text: string;
  mediaUrl: string;
  apiKeys: ApiKeySettings;
  idempotencyKey: string;
}): Promise<ConnectorResult> {
  const token = ensure(input.apiKeys.tiktokAccessToken, 'tiktokAccessToken');
  const openId = ensure(input.apiKeys.tiktokOpenId, 'tiktokOpenId');
  const res = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': input.idempotencyKey,
    },
    body: JSON.stringify({
      post_info: {
        title: input.text.slice(0, 90),
        privacy_level: 'PUBLIC_TO_EVERYONE',
      },
      source_info: {
        source: 'PULL_FROM_URL',
        video_url: input.mediaUrl,
      },
      open_id: openId,
    }),
  });
  await assertOk(res, 'tiktok');
  const data = await res.json() as { data?: { publish_id?: string } };
  const publishId = data.data?.publish_id || `tiktok-${Date.now()}`;
  return {
    externalId: publishId,
    publishedUrl: `https://www.tiktok.com/@${openId}/video/${publishId}`,
  };
}

async function publishYouTube(input: {
  title: string;
  description: string;
  apiKeys: ApiKeySettings;
  idempotencyKey: string;
}): Promise<ConnectorResult> {
  const token = ensure(input.apiKeys.youtubeAccessToken, 'youtubeAccessToken');
  const channelId = ensure(input.apiKeys.youtubeChannelId, 'youtubeChannelId');

  const res = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status&uploadType=resumable', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Type': 'video/mp4',
      'Idempotency-Key': input.idempotencyKey,
    },
    body: JSON.stringify({
      snippet: {
        title: input.title.slice(0, 100),
        description: input.description,
        categoryId: '22',
      },
      status: {
        privacyStatus: 'public',
      },
    }),
  });

  await assertOk(res, 'youtube');
  const uploadUrl = res.headers.get('location') || '';
  const externalId = uploadUrl || `youtube-${Date.now()}`;
  return {
    externalId,
    publishedUrl: `https://www.youtube.com/channel/${channelId}`,
  };
}

export async function publishToPlatform(input: {
  platform: PublishPlatform;
  topic: string;
  payload: {
    descriptionByPlatform: Record<string, string>;
    hashtags: string[];
    thumbnailPrompt: string;
  };
  apiKeys: ApiKeySettings;
  idempotencyKey: string;
}) {
  const text = textFor(input.platform, input.topic, input.payload.descriptionByPlatform, input.payload.hashtags);
  const mediaUrl = `https://picsum.photos/seed/${encodeURIComponent(input.idempotencyKey)}/1080/1080`;

  switch (input.platform) {
    case 'x':
      return publishX({ text, apiKeys: input.apiKeys, idempotencyKey: input.idempotencyKey });
    case 'facebook':
      return publishFacebook({ text, apiKeys: input.apiKeys, idempotencyKey: input.idempotencyKey });
    case 'instagram':
      return publishInstagram({ text, mediaUrl, apiKeys: input.apiKeys, idempotencyKey: input.idempotencyKey });
    case 'tiktok':
      return publishTikTok({ text, mediaUrl, apiKeys: input.apiKeys, idempotencyKey: input.idempotencyKey });
    case 'youtube':
      return publishYouTube({
        title: input.topic,
        description: text,
        apiKeys: input.apiKeys,
        idempotencyKey: input.idempotencyKey,
      });
    default:
      throw new Error(`Unsupported platform: ${input.platform}`);
  }
}
