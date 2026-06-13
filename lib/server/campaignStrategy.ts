export type CampaignGoal = 'awareness' | 'leads' | 'sales' | 'authority' | 'community';
export type StyleMode = 'auto' | 'manual';

type StrategyLanguage = 'pl' | 'en' | 'es';

export type CampaignStrategy = {
  goal: CampaignGoal;
  styleMode: StyleMode;
  resolvedNiche: string;
  styleProfile: string;
  shortVideoTemplate: {
    hookFormula: string;
    sceneFlow: string[];
    ctaFormula: string;
    visualDirection: string;
    editCadence: string;
  };
};

const NICHE_MAP: Array<{ keywords: string[]; resolvedNiche: string; styleProfiles: Record<CampaignGoal, string> }> = [
  {
    keywords: ['finance', 'finanse', 'bank', 'inwest', 'crypto', 'krypto', 'biznes'],
    resolvedNiche: 'finance',
    styleProfiles: {
      awareness: 'editorial trust + sharp authority + clean charts',
      leads: 'problem-solution urgency + proof snippets + clear offer framing',
      sales: 'premium ROI narrative + objection handling + direct conversion CTA',
      authority: 'institutional tone + thought-leadership hooks + expert framing',
      community: 'transparent founder voice + audience Q&A + social proof loops',
    },
  },
  {
    keywords: ['ecommerce', 'shop', 'sklep', 'product', 'produkt', 'dropshipping', 'd2c'],
    resolvedNiche: 'ecommerce',
    styleProfiles: {
      awareness: 'visual-first product storytelling + curiosity hooks',
      leads: 'pain-point demo + lead magnet framing + urgency signal',
      sales: 'offer-stack clarity + trust badges + frictionless CTA',
      authority: 'behind-the-brand expertise + process transparency',
      community: 'ugc-driven narrative + comment-first engagement prompts',
    },
  },
  {
    keywords: ['gaming', 'game', 'gry', 'esport', 'stream', 'fps', 'rpg'],
    resolvedNiche: 'gaming',
    styleProfiles: {
      awareness: 'high-energy pattern interrupts + meme-aware pacing',
      leads: 'challenge-based hook + unlock reward structure',
      sales: 'value-per-minute pitch + social proof + scarcity beat',
      authority: 'meta-analysis style + tactical breakdown voice',
      community: 'inside-joke cadence + creator-audience co-op vibe',
    },
  },
  {
    keywords: ['edu', 'education', 'eduk', 'learning', 'kurs', 'szkolenie', 'academy'],
    resolvedNiche: 'education',
    styleProfiles: {
      awareness: 'clarity-first storytelling + myth-busting hooks',
      leads: 'gap-to-outcome framing + low-friction next step',
      sales: 'outcome proof + transformation arc + direct CTA',
      authority: 'mentor-level explanation + strong frameworks',
      community: 'co-learning format + reflection prompts',
    },
  },
];

function normalizeText(value: string) {
  return value.toLowerCase().trim();
}

function resolveNiche(niche: string, topic: string) {
  const text = `${normalizeText(niche)} ${normalizeText(topic)}`;
  const found = NICHE_MAP.find((entry) => entry.keywords.some((keyword) => text.includes(keyword)));
  return found || {
    resolvedNiche: 'creator_business',
    styleProfiles: {
      awareness: 'bold creator storytelling + strong first-second hook',
      leads: 'audience pain reframing + low-friction next action',
      sales: 'value narrative + trust anchors + clear conversion CTA',
      authority: 'expert POV + framework-first delivery',
      community: 'conversation-driven tone + response triggers',
    },
  };
}

function localizedSceneFlow(language: StrategyLanguage) {
  if (language === 'pl') {
    return [
      '0-2s: mocny hook (kontrast lub obalenie mitu)',
      '2-6s: kontekst problemu i stawka',
      '6-12s: konkretne rozwiazanie krok 1-2',
      '12-18s: dowod / mini case / rezultat',
      '18-22s: mocny CTA zgodny z celem kampanii',
    ];
  }
  if (language === 'es') {
    return [
      '0-2s: hook fuerte (contraste o mito roto)',
      '2-6s: contexto del problema y apuesta',
      '6-12s: solucion concreta paso 1-2',
      '12-18s: prueba / mini caso / resultado',
      '18-22s: CTA fuerte alineado al objetivo',
    ];
  }
  return [
    '0-2s: hard hook (contrast or myth-break)',
    '2-6s: problem context and stakes',
    '6-12s: concrete solution step 1-2',
    '12-18s: proof / mini case / result',
    '18-22s: strong CTA aligned with campaign goal',
  ];
}

export function resolveCampaignStrategy(input: {
  topic: string;
  niche: string;
  campaignGoal?: string;
  styleMode?: string;
  manualStyleHint?: string;
  language: StrategyLanguage;
}): CampaignStrategy {
  const goal = (input.campaignGoal || 'awareness') as CampaignGoal;
  const styleMode = (input.styleMode || 'auto') as StyleMode;
  const niche = resolveNiche(input.niche, input.topic);

  const autoProfile = niche.styleProfiles[goal] || niche.styleProfiles.awareness;
  const styleProfile = styleMode === 'manual' && input.manualStyleHint?.trim()
    ? input.manualStyleHint.trim()
    : autoProfile;

  return {
    goal,
    styleMode,
    resolvedNiche: niche.resolvedNiche,
    styleProfile,
    shortVideoTemplate: {
      hookFormula: languageAwareHook(goal, input.language),
      sceneFlow: localizedSceneFlow(input.language),
      ctaFormula: languageAwareCta(goal, input.language),
      visualDirection: languageAwareVisualDirection(niche.resolvedNiche, input.language),
      editCadence: languageAwareCadence(goal, input.language),
    },
  };
}

function languageAwareHook(goal: CampaignGoal, language: StrategyLanguage) {
  const map = {
    awareness: {
      pl: 'Mocny kontrast: "Wszyscy robia X, ale to zabija wyniki"',
      en: 'Pattern-break contrast: "Everyone does X, but this kills results"',
      es: 'Contraste rompe-patron: "Todos hacen X, pero esto mata resultados"',
    },
    leads: {
      pl: 'Hook problemowy: "Masz ten blad? Tracisz leady codziennie"',
      en: 'Pain hook: "Still making this mistake? You are losing leads daily"',
      es: 'Hook de dolor: "Si haces este error, pierdes leads cada dia"',
    },
    sales: {
      pl: 'Hook wartosci: "To zmienia konwersje bez zwiekszania budzetu"',
      en: 'Value hook: "This lifts conversions without increasing ad spend"',
      es: 'Hook de valor: "Esto sube conversion sin aumentar presupuesto"',
    },
    authority: {
      pl: 'Hook ekspercki: "3 rzeczy, ktorych nie mowi wiekszosc ekspertow"',
      en: 'Authority hook: "3 things most experts never tell you"',
      es: 'Hook de autoridad: "3 cosas que casi ningun experto te cuenta"',
    },
    community: {
      pl: 'Hook społeczny: "Zobaczmy to razem i ocenmy wynik"',
      en: 'Community hook: "Let us test this together and judge the result"',
      es: 'Hook comunidad: "Probemos esto juntos y veamos el resultado"',
    },
  };

  return map[goal]?.[language] || map.awareness[language];
}

function languageAwareCta(goal: CampaignGoal, language: StrategyLanguage) {
  const map = {
    awareness: {
      pl: 'CTA: Obserwuj po wiecej takich rozbiorek i trendow.',
      en: 'CTA: Follow for more high-signal breakdowns and trends.',
      es: 'CTA: Sigue para mas analisis de alto valor y tendencias.',
    },
    leads: {
      pl: 'CTA: Napisz "PLAN" i odbierz gotowy framework.',
      en: 'CTA: Comment "PLAN" to get the ready framework.',
      es: 'CTA: Comenta "PLAN" para recibir el framework listo.',
    },
    sales: {
      pl: 'CTA: Kliknij link i sprawdz oferte dopasowana do Ciebie.',
      en: 'CTA: Tap the link and check the offer tailored for you.',
      es: 'CTA: Entra al enlace y mira la oferta adaptada para ti.',
    },
    authority: {
      pl: 'CTA: Zapisz i udostepnij, jesli chcesz wiecej analiz eksperckich.',
      en: 'CTA: Save and share if you want more expert-level analyses.',
      es: 'CTA: Guarda y comparte si quieres mas analisis de nivel experto.',
    },
    community: {
      pl: 'CTA: Daj swoj wynik w komentarzu, porownamy strategie.',
      en: 'CTA: Drop your result in comments, we will compare strategies.',
      es: 'CTA: Deja tu resultado en comentarios y comparamos estrategias.',
    },
  };

  return map[goal]?.[language] || map.awareness[language];
}

function languageAwareVisualDirection(resolvedNiche: string, language: StrategyLanguage) {
  const byNiche: Record<string, { pl: string; en: string; es: string }> = {
    finance: {
      pl: 'Styl editorial-premium, wykresy i liczby, czysty layout, wysoki kontrast.',
      en: 'Editorial-premium style, charts and numbers, clean layout, high contrast.',
      es: 'Estilo editorial-premium, graficos y numeros, layout limpio, alto contraste.',
    },
    ecommerce: {
      pl: 'Produkt w centrum, szybkie cuty detali, oswietlenie high-end, mocny before/after.',
      en: 'Product-centered visuals, fast detail cuts, high-end lighting, strong before/after.',
      es: 'Visual centrado en producto, cortes rapidos de detalle, luz high-end, before/after fuerte.',
    },
    gaming: {
      pl: 'Dynamiczne ujęcia, neonowe akcenty, szybki montaz, overlaye danych.',
      en: 'Dynamic shots, neon accents, fast montage, data overlays.',
      es: 'Tomas dinamicas, acentos neon, montaje rapido, overlays de datos.',
    },
    education: {
      pl: 'Czytelne kadry, overlaye krokow, tablica/diagramy, spokojny premium rytm.',
      en: 'Clear framing, step overlays, board/diagram visuals, calm premium rhythm.',
      es: 'Planos claros, overlays por pasos, visuales de pizarra/diagramas, ritmo premium calmado.',
    },
    creator_business: {
      pl: 'Kontrastowe kadry, twarz + b-roll, czytelne napisy i jasny focal point.',
      en: 'High-contrast frames, face + b-roll, readable captions and clear focal point.',
      es: 'Planos de alto contraste, rostro + b-roll, subtitulos legibles y foco claro.',
    },
  };

  const selected = byNiche[resolvedNiche] || byNiche.creator_business;
  return selected[language];
}

function languageAwareCadence(goal: CampaignGoal, language: StrategyLanguage) {
  const cadence = goal === 'sales' || goal === 'leads'
    ? {
      pl: 'Tempo szybkie: ciecia 0.8-1.4s, mocna dynamika i CTA przed koncem.',
      en: 'Fast cadence: 0.8-1.4s cuts, high momentum, CTA before the final beat.',
      es: 'Cadencia rapida: cortes de 0.8-1.4s, alta energia y CTA antes del cierre.',
    }
    : {
      pl: 'Tempo zbalansowane: ciecia 1.2-2.2s, czytelnosc przekazu i mocny final.',
      en: 'Balanced cadence: 1.2-2.2s cuts, clear messaging, strong finish.',
      es: 'Cadencia equilibrada: cortes de 1.2-2.2s, mensaje claro y cierre fuerte.',
    };

  return cadence[language];
}
