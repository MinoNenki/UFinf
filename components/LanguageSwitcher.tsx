'use client';

import { byLanguage, LANGUAGE_LABELS, type Language, useI18n } from '@/lib/i18n';

type Props = {
  compact?: boolean;
};

const LABELS = {
  pl: { title: 'Jezyk' },
  en: { title: 'Language' },
  es: { title: 'Idioma' },
};

export default function LanguageSwitcher({ compact = false }: Props) {
  const { language, setLanguage } = useI18n();
  const copy = byLanguage(language, LABELS);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      {!compact && <span style={{ fontSize: 12, color: 'var(--muted)' }}>{copy.title}</span>}
      {(['pl', 'en', 'es'] as Language[]).map((item) => (
        <button
          key={item}
          className={`btn btn-sm ${language === item ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setLanguage(item)}
          type="button"
        >
          {compact ? item.toUpperCase() : LANGUAGE_LABELS[item]}
        </button>
      ))}
    </div>
  );
}
