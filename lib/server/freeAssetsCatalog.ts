export type FreeAssetGroup = {
  id: string;
  title: string;
  description: string;
  items: Array<{
    name: string;
    url: string;
    license: string;
    bestFor: string;
  }>;
};

export function getFreeAssetsCatalog(): FreeAssetGroup[] {
  return [
    {
      id: 'video-footage',
      title: 'Free Stock Video',
      description: 'Free high-quality footage for shorts, reels, and b-roll composition.',
      items: [
        { name: 'Pexels Video', url: 'https://www.pexels.com/videos/', license: 'Free / Pexels License', bestFor: 'B-roll and lifestyle shots' },
        { name: 'Pixabay Video', url: 'https://pixabay.com/videos/', license: 'Free / Pixabay License', bestFor: 'Generic visual fillers and transitions' },
        { name: 'Mixkit', url: 'https://mixkit.co/free-stock-video/', license: 'Free / Mixkit License', bestFor: 'Cinematic and social-ready clips' },
      ],
    },
    {
      id: 'music-sfx',
      title: 'Free Music and SFX',
      description: 'Royalty-free tracks and effects for social video pacing.',
      items: [
        { name: 'YouTube Audio Library', url: 'https://www.youtube.com/audiolibrary', license: 'Free / YouTube', bestFor: 'Safe music for YouTube and Shorts' },
        { name: 'Free Music Archive', url: 'https://freemusicarchive.org/', license: 'Mixed free licenses', bestFor: 'Niche genres and indie sounds' },
        { name: 'Freesound', url: 'https://freesound.org/', license: 'CC licenses', bestFor: 'SFX layers and atmosphere' },
      ],
    },
    {
      id: 'images-graphics',
      title: 'Free Images and Graphics',
      description: 'CC0-friendly photo and vector assets for thumbnails and posts.',
      items: [
        { name: 'Unsplash', url: 'https://unsplash.com/', license: 'Free / Unsplash License', bestFor: 'Hero images and backgrounds' },
        { name: 'Openverse', url: 'https://openverse.org/', license: 'CC search', bestFor: 'Fast license-filtered discovery' },
        { name: 'unDraw', url: 'https://undraw.co/illustrations', license: 'Free / unDraw License', bestFor: 'Modern vectors and explainer visuals' },
      ],
    },
    {
      id: 'fonts-icons',
      title: 'Free Fonts and Icons',
      description: 'Global-safe typography and icon packs for strong visual hierarchy.',
      items: [
        { name: 'Google Fonts', url: 'https://fonts.google.com/', license: 'Open source', bestFor: 'Readable brand typography' },
        { name: 'Fontshare', url: 'https://www.fontshare.com/', license: 'Free fonts', bestFor: 'Editorial and premium headline styles' },
        { name: 'Iconoir', url: 'https://iconoir.com/', license: 'MIT', bestFor: 'UI icon systems' },
      ],
    },
  ];
}
