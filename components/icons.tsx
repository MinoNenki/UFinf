import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

const simple = (d: React.ReactNode) => (props: IconProps) => <IconBase {...props}>{d}</IconBase>;

export const Sparkles = simple(<><path d="M12 3l1.8 4.8L18 9.6l-4.2 1.8L12 16l-1.8-4.6L6 9.6l4.2-1.8L12 3Z" /><path d="M19 14l.9 2.4L22 17.3l-2.1.9L19 20l-.9-1.8-2.1-.9 2.1-1 1-2.3Z" /></>);
export const LayoutDashboard = simple(<><rect x="3" y="3" width="8" height="8" rx="2" /><rect x="13" y="3" width="8" height="5" rx="2" /><rect x="13" y="10" width="8" height="11" rx="2" /><rect x="3" y="13" width="8" height="8" rx="2" /></>);
export const Clapperboard = simple(<><path d="M4 7h16" /><path d="M6 4l3 3" /><path d="M10 4l3 3" /><path d="M14 4l3 3" /><rect x="4" y="7" width="16" height="13" rx="2" /></>);
export const Radar = simple(<><circle cx="12" cy="12" r="8" /><path d="M12 12l5-5" /><path d="M12 12h8" /><path d="M12 4a8 8 0 0 1 8 8" /></>);
export const Users = simple(<><path d="M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" /><circle cx="9.5" cy="8" r="3" /><path d="M22 20v-1a3 3 0 0 0-2-2.8" /><path d="M16.5 4.5a3 3 0 0 1 0 6" /></>);
export const Brain = simple(<><path d="M8 8a3 3 0 0 1 3-3" /><path d="M16 8a3 3 0 0 0-3-3" /><path d="M6 12a2 2 0 0 1 2-2" /><path d="M18 12a2 2 0 0 0-2-2" /><path d="M8 20a4 4 0 0 1-4-4" /><path d="M16 20a4 4 0 0 0 4-4" /><path d="M12 5v14" /></>);
export const Inbox = simple(<><path d="M4 4h16v10a2 2 0 0 1-2 2h-3l-3 3-3-3H6a2 2 0 0 1-2-2V4Z" /><path d="M8 10h8" /></>);
export const Palette = simple(<><path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4h1a2 2 0 0 0 0-4h-1a2 2 0 0 1 0-4Z" /><circle cx="7.5" cy="8.5" r="1" /><circle cx="6.5" cy="13" r="1" /><circle cx="9" cy="16.5" r="1" /></>);
export const DollarSign = simple(<><path d="M12 3v18" /><path d="M16 7.5a4 4 0 0 0-3.6-2.5H11a3 3 0 0 0 0 6h2a3 3 0 0 1 0 6h-1.4A4 4 0 0 1 8 14" /></>);
export const Settings = simple(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1-1.6 2.8-.2-.1a1 1 0 0 0-1.1.2l-.3.3-2.8-1.6a1 1 0 0 0-1.4.4l-.1.2H9l-.1-.2a1 1 0 0 0-1.4-.4L4.7 19l-.3-.3a1 1 0 0 0-1.1-.2l-.2.1-1.6-2.8.1-.1a1 1 0 0 0 .2-1.1l-.1-.2V9l.1-.2A1 1 0 0 0 1.4 7.7l-.1-.1 1.6-2.8.2.1a1 1 0 0 0 1.1-.2l.3-.3 2.8 1.6a1 1 0 0 0 1.4-.4l.1-.2h3.2l.1.2a1 1 0 0 0 1.4.4l2.8-1.6.3.3a1 1 0 0 0 1.1.2l.2-.1 1.6 2.8-.1.1a1 1 0 0 0-.2 1.1l.1.2v6l-.1.2Z" /></>);
export const ArrowRight = simple(<><path d="M5 12h14" /><path d="m13 5 7 7-7 7" /></>);
export const BrainCircuit = Brain;
export const TrendingUp = simple(<><path d="M3 17l6-6 4 4 8-8" /><path d="M14 7h7v7" /></>);
export const Eye = simple(<><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" /><circle cx="12" cy="12" r="2.5" /></>);
export const CalendarClock = simple(<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4" /><path d="M16 3v4" /><path d="M3 10h18" /><circle cx="16" cy="16" r="3" /><path d="M16 14.5V16l1 1" /></>);
export const Flame = simple(<><path d="M13 3s1 3-1 5c-2 2-3 4-3 6a5 5 0 0 0 10 0c0-3-2-6-6-11Z" /><path d="M8 13c-1 1-2 3-2 5a6 6 0 0 0 12 0" /></>);
export const CheckCircle2 = simple(<><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>);
export const Zap = simple(<><path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" /></>);
export const Globe2 = simple(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c3 3 3 15 0 18" /><path d="M12 3c-3 3-3 15 0 18" /></>);
export const LockKeyhole = simple(<><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /><circle cx="12" cy="15" r="1" /><path d="M12 16v2" /></>);
export const UploadCloud = simple(<><path d="M12 16V6" /><path d="m8 10 4-4 4 4" /><path d="M20 16.5A4.5 4.5 0 0 0 16.5 12H15" /><path d="M4 16.5A4.5 4.5 0 0 1 7.5 12H9" /><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></>);
export const ShieldCheck = simple(<><path d="M12 3 20 6v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3Z" /><path d="m9 12 2 2 4-4" /></>);
export const Check = simple(<><path d="m5 12 4 4 10-10" /></>);
export const Copy = simple(<><rect x="9" y="9" width="10" height="10" rx="2" /><path d="M5 15V7a2 2 0 0 1 2-2h8" /></>);
export const Loader = simple(<><path d="M12 2v4" /><path d="M12 18v4" /><path d="M4.9 4.9 7.8 7.8" /><path d="M16.2 16.2 19.1 19.1" /><path d="M2 12h4" /><path d="M18 12h4" /><path d="M4.9 19.1 7.8 16.2" /><path d="M16.2 7.8 19.1 4.9" /></>);
export const Search = simple(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>);
export const BarChart3 = simple(<><path d="M4 20V10" /><path d="M10 20V4" /><path d="M16 20v-7" /><path d="M2 20h20" /></>);
export const Clock = simple(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>);
export const Hash = simple(<><path d="M4 9h16" /><path d="M3 15h16" /><path d="m8 3-2 18" /><path d="m14 3-2 18" /></>);

