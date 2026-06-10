export interface Trend {
  id: number;
  topic: string;
  niche: string;
  growth: number;
  views: string;
  trend: 'up' | 'down';
  hot: boolean;
}

export const MOCK_TRENDS: Trend[] = [
  { id: 1, topic: 'Path of Exile 2', niche: 'gaming', growth: 120, views: '4.2M', trend: 'up', hot: true },
  { id: 2, topic: 'AI tools for creators', niche: 'tech', growth: 89, views: '2.1M', trend: 'up', hot: true },
  { id: 3, topic: 'Morning routine 2025', niche: 'lifestyle', growth: 67, views: '1.8M', trend: 'up', hot: true },
  { id: 4, topic: 'Budget investing', niche: 'finance', growth: 54, views: '3.4M', trend: 'up', hot: false },
  { id: 5, topic: 'Solo travel tips', niche: 'travel', growth: 43, views: '2.9M', trend: 'up', hot: false },
  { id: 6, topic: 'Meal prep under $50', niche: 'food', growth: 38, views: '1.5M', trend: 'up', hot: false },
  { id: 7, topic: 'Home gym setup 2025', niche: 'fitness', growth: 35, views: '2.2M', trend: 'up', hot: false },
  { id: 8, topic: 'React 19 new features', niche: 'tech', growth: 92, views: '890K', trend: 'up', hot: false },
  { id: 9, topic: 'Passive income ideas 2025', niche: 'finance', growth: 61, views: '4.1M', trend: 'up', hot: false },
  { id: 10, topic: 'Capsule wardrobe guide', niche: 'lifestyle', growth: 29, views: '1.1M', trend: 'up', hot: false },
  { id: 11, topic: 'Street food Tokyo vlog', niche: 'food', growth: 77, views: '3.6M', trend: 'up', hot: false },
  { id: 12, topic: 'Crypto altcoin season', niche: 'finance', growth: 110, views: '5.2M', trend: 'up', hot: false },
  { id: 13, topic: 'AI avatar creation guide', niche: 'tech', growth: 95, views: '1.7M', trend: 'up', hot: false },
  { id: 14, topic: 'Van life 2025', niche: 'travel', growth: 47, views: '2.0M', trend: 'up', hot: false },
  { id: 15, topic: '5-minute HIIT workout', niche: 'fitness', growth: 58, views: '3.8M', trend: 'up', hot: false },
];

export const NICHES = ['gaming', 'tech', 'lifestyle', 'finance', 'travel', 'food', 'fitness'];

export const MOCK_COMPETITOR = {
  username: '@techguru2025',
  subscribers: '124K',
  avgViews: '45K',
  topVideos: [
    { title: 'ChatGPT vs Gemini — which is better in 2025?', views: '890K', likes: '42K' },
    { title: '10 AI tools that will replace your team', views: '654K', likes: '38K' },
    { title: 'How I use AI to create 30 videos/month', views: '421K', likes: '21K' },
  ],
  postingFrequency: [
    { day: 'Pon', count: 2 },
    { day: 'Wt', count: 1 },
    { day: 'Śr', count: 3 },
    { day: 'Czw', count: 2 },
    { day: 'Pt', count: 4 },
    { day: 'Sob', count: 1 },
    { day: 'Nd', count: 0 },
  ],
  bestHours: [
    { hour: '08', score: 20 },
    { hour: '10', score: 35 },
    { hour: '12', score: 60 },
    { hour: '14', score: 45 },
    { hour: '16', score: 70 },
    { hour: '18', score: 100 },
    { hour: '20', score: 90 },
    { hour: '22', score: 40 },
  ],
  topKeywords: ['AI', 'ChatGPT', 'automation', 'tools', 'creator', 'content', 'YouTube', 'growth', 'tutorial', 'free', 'tips', '2025'],
  niche: 'tech',
  engagementRate: '8.2%',
};

export const MOCK_REVENUE = {
  monthly: [
    { month: 'Sie', revenue: 420 },
    { month: 'Wrz', revenue: 560 },
    { month: 'Paź', revenue: 490 },
    { month: 'Lis', revenue: 720 },
    { month: 'Gru', revenue: 840 },
    { month: 'Sty', revenue: 1120 },
  ],
  topContent: [
    { title: 'AI tools for creators', platform: 'YouTube', revenue: 340, views: '89K' },
    { title: 'Morning routine 2025', platform: 'TikTok', revenue: 210, views: '145K' },
    { title: 'Budget investing basics', platform: 'Instagram', revenue: 180, views: '62K' },
  ],
  byPlatform: [
    { platform: 'YouTube', percent: 45, color: '#ef4444' },
    { platform: 'TikTok', percent: 28, color: '#ec4899' },
    { platform: 'Instagram', percent: 17, color: '#8b5cf6' },
    { platform: 'Facebook', percent: 7, color: '#3b82f6' },
    { platform: 'X', percent: 3, color: '#f8fafc' },
  ],
  forecast: '+$320/mc w ciągu 3 miesięcy',
  topNiches: [
    { niche: 'Tech / AI', score: 94 },
    { niche: 'Finance', score: 88 },
    { niche: 'Lifestyle', score: 72 },
    { niche: 'Gaming', score: 65 },
    { niche: 'Food', score: 58 },
  ],
};

export interface InboxMessage {
  id: number;
  platform: 'tiktok' | 'youtube' | 'instagram' | 'facebook' | 'x';
  author: string;
  avatar: string;
  message: string;
  time: string;
  unread: boolean;
  aiReply: string;
}

export const MOCK_INBOX: InboxMessage[] = [
  { id: 1, platform: 'tiktok', author: '@kowalski_jan', avatar: 'K', message: 'Świetny film! Jak zacząć z AI jako kompletny laik?', time: '5 min temu', unread: true, aiReply: 'Cześć! Zacznij od darmowych narzędzi jak ChatGPT czy Gemini. Polecam mój poprzedni film o podstawach AI — link w bio! 🚀' },
  { id: 2, platform: 'youtube', author: 'Anna Nowak', avatar: 'A', message: 'Mogłbyś zrobić film o monetyzacji kanału YouTube?', time: '22 min temu', unread: true, aiReply: 'Hej Anna! Dobry pomysł — mam już taki film w planach! Zapisz się i włącz powiadomienia, żeby go nie przegapić 🔔' },
  { id: 3, platform: 'instagram', author: '@lifestyle_marta', avatar: 'M', message: 'Te narzędzia są płatne? Szukam czegoś za darmo', time: '1 godz. temu', unread: true, aiReply: 'Większość narzędzi, które pokazuję ma darmowe plany! ChatGPT, Canva, CapCut — wszystko dostępne bez wydawania złotówki ✅' },
  { id: 4, platform: 'youtube', author: 'Piotr Wiśniewski', avatar: 'P', message: 'Kiedy kolejny film o Path of Exile 2?', time: '2 godz. temu', unread: false, aiReply: 'Pracuję nad tym! Nagrywam jutro rano — spodziewaj się premiery w piątek 🎮' },
  { id: 5, platform: 'tiktok', author: '@gaming_pro99', avatar: 'G', message: 'Ta seria jest niesamowita, czekam na więcej!', time: '3 godz. temu', unread: false, aiReply: 'Dziękuję! Twoje wsparcie bardzo motywuje 💪 Kolejna część już w środę!' },
  { id: 6, platform: 'facebook', author: 'Katarzyna M.', avatar: 'K', message: 'Jak długo zajęło Ci zbudowanie 100K subskrybentów?', time: '5 godz. temu', unread: false, aiReply: 'To zajęło mi 18 miesięcy regularnej pracy. Kluczem była konsekwencja i analiza danych. Szczegóły w moim ostatnim filmie!' },
  { id: 7, platform: 'x', author: '@dev_tomasz', avatar: 'T', message: 'Dobra robota z tym materiałem o React 19', time: '8 godz. temu', unread: false, aiReply: 'Dzięki! React 19 to naprawdę duża zmiana — wkrótce więcej filmów na ten temat. Stay tuned! 🚀' },
  { id: 8, platform: 'instagram', author: '@fitness_ola', avatar: 'O', message: 'Czy masz plan dla osób zaczynających od zera?', time: '12 godz. temu', unread: false, aiReply: 'Tak! Mam specjalny przewodnik dla początkujących — sprawdź link w bio. Jest tam też darmowy checklist 📋' },
];

export const MOCK_GROWTH_HISTORY = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  score: Math.min(100, Math.max(50, 65 + Math.sin(i * 0.4) * 12 + i * 0.65)),
}));

export interface CoachAction {
  id: number;
  time: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  done: boolean;
}

export const MOCK_COACH_ACTIONS: CoachAction[] = [
  { id: 1, time: '18:00–20:00', action: 'Opublikuj film na TikTok i YouTube Shorts', priority: 'high', done: false },
  { id: 2, time: '09:00', action: 'Nagraj: "AI tools for creators — TOP 5 w 2025"', priority: 'high', done: false },
  { id: 3, time: 'Teraz', action: 'Odpowiedz na pierwsze 10 komentarzy (Smart Inbox)', priority: 'medium', done: false },
  { id: 4, time: '12:00', action: 'Opublikuj Instagram Reels z wczorajszego materiału', priority: 'medium', done: false },
  { id: 5, time: 'Dziś wieczór', action: 'Zaplanuj treść na następny tydzień (3 tematy)', priority: 'low', done: false },
];

export const MOCK_RECENT_CONTENT = [
  { id: 1, topic: 'AI tools for creators', platforms: ['tiktok', 'youtube', 'instagram'], score: 92, date: '2 godz. temu' },
  { id: 2, topic: 'Morning routine 2025', platforms: ['tiktok', 'youtube'], score: 85, date: 'Wczoraj' },
  { id: 3, topic: 'Budget investing basics', platforms: ['youtube', 'facebook'], score: 78, date: '3 dni temu' },
];

export const MOCK_PLATFORM_STATUS = [
  { platform: 'TikTok', connected: true, followers: '12.4K', color: '#ec4899' },
  { platform: 'YouTube', connected: true, followers: '4.2K', color: '#ef4444' },
  { platform: 'Instagram', connected: true, followers: '8.9K', color: '#8b5cf6' },
  { platform: 'Facebook', connected: false, followers: '-', color: '#3b82f6' },
  { platform: 'X', connected: false, followers: '-', color: '#f8fafc' },
];

export const MOCK_STATS = {
  views: { value: '128K', change: '+12%', up: true },
  subscribers: { value: '4.2K', change: '+8%', up: true },
  engagement: { value: '6.4%', change: '+2%', up: true },
  revenue: { value: '$840', change: '+18%', up: true },
};

export const MOCK_WEEKLY_SCORES = [
  { day: 'Pon', score: 72 },
  { day: 'Wt', score: 68 },
  { day: 'Śr', score: 80 },
  { day: 'Czw', score: 75 },
  { day: 'Pt', score: 90 },
  { day: 'Sob', score: 85 },
  { day: 'Nd', score: 87 },
];
