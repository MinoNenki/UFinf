type MockLanguage = 'pl' | 'en' | 'es';

export function generateGrowthPack(input: { topic: string; platform: string; niche: string; language?: MockLanguage }) {
  const language = input.language || 'pl';
  const defaults = {
    pl: {
      topic: 'nowy film edukacyjny',
      niche: 'creator economy',
      platform: 'wszystkie platformy',
      verdict: 'PUBLIKUJ TERAZ',
      bestTime: '18:00–20:00',
      trend: (niche: string) => `${niche}: temat ma SILNY potencjal wzrostu w formatach krotkich, szczegolnie jako seria 3 czeci. Zainteresowanie rośnie +320% w ostatnim tygodniu. Algorytm TikTok/Shorts nagrodzi pierwsze 5s haka i szybkie ciecia.`,
      content: (topic: string) => ({
        tiktok: `HOOK (0-2s): "Nie rób TEGO przy ${topic}..." - SZOKUJACY, emocjonalny start. BODY (2-15s): Pokaz 3 błedy + rozwiazania, szybkie ciecia co 1s, napis na ekranie caly czas. CTA (15-16s): "Klikaj profil aby dowiedziec się wszystkiego". Format: 9:16, MIN 720p, 24-60fps. Kolory: CYANowy akcent + czarny tlo.`,
        shorts: `TYTUL: "${topic} - 3 rzeczy, które ZMIENIA wynik kanału" (50 znakow max). OPIS: Praktyczna obietnica + CTA. PIERWSZA SEKUNDA: Tekst wyrazny + twarz lub obiekt w centrum. BODY: 3 sekcje à 5 sekund, kazda z mocnym punkcikiem. KONIEC: Subskrypcja + link. Kontrast: wysoki.`,
        reels: `PROBLEM (0-3s): Pokaz typowy blad/brak wyniku - relatable sytuacja. ROZWIAZANIE (3-10s): Konkretne kroki, na tle + grafika, napis tekstu instruktażu. DOWÓD (10-15s): Przed/po, wyniki, liczby. AKCJA (15s): "Spróbuj dzisiaj". Kolory: ciepłe + dynamiczny montaż.`,
        facebook: `POST: Mini-historia praktyczna (150-250 slow) + PYTANIE do publiczności. Opisz problem ktorego twoja publicznosc zna osobiście. Popros o opinie w komentarzach. Załacz mockup/screenshot (visual ma 2x viecej sharow niz text). Link do artykulu/video.`,
        x: `THREAD 5 TWEETOW: (1) PROBLEM - szokuje/zaskakuje, (2) PRZYKLAD z zycia - relatywny, (3) BLAD - co robia ludzie zle, (4) ROZWIAZANIE - konkretne kroki/link, (5) CTA - "fav + follow aby wiedziec wiecej". Kazdy tweet max 280 znakow, jasne numerowanie.`,
      }),
      nextIdeas: (topic: string, niche: string, platform: string) => [
        `Porównanie DEEP: "Przed 2 lata vs dzisiaj w ${topic}" - co sie zmienilo, co teraz dziala`,
        `Case study z LICZBAMI: "Jak ${topic} dała nam +340% zasiegu w ${niche}" - konkretne metryki`,
        `"TOP 7 Błedów, które blokują zasiegi w ${platform}" - lista z priorytetem`,
        `Tutorial krok-po-kroku: "${topic}" - od A do Z, bez przeskoków`,
        `Trend alert: "Wszyscy robią ${topic}, ale mało kto wie..." - insider info`,
      ],
      coach: [
        '✓ PUBLIKUJ DZISIAJ 18:00-20:00 (peak engagement dla zakresu: wiek 18-45, creator economy)',
        '✓ Przygotuj 2 WERSJE haka - mocniejszy A/B test w pierwszej godzinie',
        '✓ ODPOWIEDZ na pierwsze 15 komentarzy w ciągu 30 minut (boost algorytmu +45%)',
        '✓ PIN komentarz z CTA: "Sprawdź pełny poradnik w naszym ostatnim video"',
        '✓ REPURPOSE: ten sam content → Shorts (dodaj subs), Reels (dodaj overlays), TikTok (zmień hook)',
        '✓ MONITORUJ: 24h po publikacji sprawdź CTR, watch time, save rate - bądź gotów na kolejny post',
      ],
    },
    en: {
      topic: 'new educational video',
      niche: 'creator economy',
      platform: 'all platforms',
      verdict: 'PUBLISH NOW',
      bestTime: '6:00-8:00 PM',
      trend: (niche: string) => `${niche}: STRONG short-form growth potential, especially as a 3-part series. Interest is rising +320% week-over-week. TikTok/YouTube Shorts algorithm rewards first 5s hook and fast cuts.`,
      content: (topic: string) => ({
        tiktok: `HOOK (0-2s): "DON'T do THIS with ${topic}..." - SHOCKING, emotional start. BODY (2-15s): Show 3 mistakes + solutions, fast cuts every 1s, on-screen text constantly. CTA (15-16s): "Follow for the complete guide". Format: 9:16, MIN 720p, 24-60fps. Colors: CYAN accent + black background.`,
        shorts: `TITLE: "${topic} - 3 Things That CHANGE Channel Performance" (50 chars max). DESCRIPTION: Practical promise + CTA. FIRST SECOND: Clear text + face or object centered. BODY: 3 sections à 5 seconds, each with a strong point. END: Subscribe + link. Contrast: high.`,
        reels: `PROBLEM (0-3s): Show typical mistake/no results - relatable situation. SOLUTION (3-10s): Concrete steps, over background + graphics, instruction text. PROOF (10-15s): Before/after, results, numbers. ACTION (15s): "Try today". Colors: warm + dynamic editing.`,
        facebook: `POST: Practical mini-story (150-250 words) + QUESTION to audience. Describe a problem your audience knows personally. Ask for opinions in comments. Attach mockup/screenshot (visuals get 2x more shares). Link to article/video.`,
        x: `THREAD 5 TWEETS: (1) PROBLEM - shocks/surprises, (2) EXAMPLE from life - relatable, (3) MISTAKE - what people do wrong, (4) SOLUTION - concrete steps/link, (5) CTA - "favorite + follow for more". Each tweet max 280 chars, clear numbering.`,
      }),
      nextIdeas: (topic: string, niche: string, platform: string) => [
        `Deep comparison: "${topic} 2 years ago vs today" - what changed, what works now`,
        `Case study WITH NUMBERS: "How ${topic} gave us +340% reach in ${niche}" - concrete metrics`,
        `"TOP 7 Mistakes blocking reach on ${platform}" - prioritized list`,
        `Step-by-step tutorial: "${topic}" from A to Z, no skips`,
        `Trend alert: "Everyone is doing ${topic}, but few know..." - insider info`,
      ],
      coach: [
        '✓ PUBLISH TODAY 6:00-8:00 PM (peak engagement: age 18-45, creator economy)',
        '✓ Prepare 2 HOOK versions - A/B test stronger one in first hour',
        '✓ REPLY to first 15 comments within 30 minutes (algo boost +45%)',
        '✓ PIN comment with CTA: "Check the full guide in our latest video"',
        '✓ REPURPOSE: same content → Shorts (add subs), Reels (add overlays), TikTok (change hook)',
        '✓ MONITOR: 24h post-publish check CTR, watch time, save rate - be ready for next post',
      ],
    },
    es: {
      topic: 'nuevo video educativo',
      niche: 'creator economy',
      platform: 'todas las plataformas',
      verdict: 'PUBLICAR AHORA',
      bestTime: '18:00-20:00',
      trend: (niche: string) => `${niche}: potencial FUERTE de crecimiento en formatos cortos, especialmente como serie de 3 partes. El interes está subiendo +320% semana a semana. El algoritmo de TikTok/Shorts recompensa hook fuerte en primeros 5s y cortes rápidos.`,
      content: (topic: string) => ({
        tiktok: `HOOK (0-2s): "NO hagas ESTO con ${topic}..." - IMPACTANTE, inicio emocional. BODY (2-15s): Muestra 3 errores + soluciones, cortes rápidos cada 1s, texto en pantalla constantemente. CTA (15-16s): "Sigue para la guía completa". Formato: 9:16, MIN 720p, 24-60fps. Colores: acento CYAN + fondo negro.`,
        shorts: `TÍTULO: "${topic} - 3 Cosas que CAMBIAN el Rendimiento del Canal" (50 caracteres max). DESCRIPCIÓN: Promesa práctica + CTA. PRIMER SEGUNDO: Texto claro + cara u objeto centrado. BODY: 3 secciones de 5 segundos cada una, cada una con un punto fuerte. FIN: Suscribirse + enlace. Contraste: alto.`,
        reels: `PROBLEMA (0-3s): Muestra error típico/sin resultados - situación relatable. SOLUCIÓN (3-10s): Pasos concretos, sobre fondo + gráficos, texto instructivo. PRUEBA (10-15s): Antes/después, resultados, números. ACCIÓN (15s): "Prueba hoy". Colores: cálidos + edición dinámica.`,
        facebook: `POST: Mini-historia práctica (150-250 palabras) + PREGUNTA a la audiencia. Describe un problema que tu audiencia conoce personalmente. Pide opiniones en comentarios. Adjunta mockup/captura (visuals get 2x más shares). Enlace a artículo/video.`,
        x: `HILO 5 TWEETS: (1) PROBLEMA - impacta/sorprende, (2) EJEMPLO de vida - relatable, (3) ERROR - qué hace la gente mal, (4) SOLUCIÓN - pasos concretos/enlace, (5) CTA - "favorito + sigue para más". Cada tweet máx 280 caracteres, numeración clara.`,
      }),
      nextIdeas: (topic: string, niche: string, platform: string) => [
        `Comparación PROFUNDA: "${topic} hace 2 años vs hoy" - qué cambió, qué funciona ahora`,
        `Caso práctico CON NÚMEROS: "Cómo ${topic} nos dio +340% alcance en ${niche}" - métricas concretas`,
        `"TOP 7 Errores que bloquean alcance en ${platform}" - lista prioritaria`,
        `Tutorial paso a paso: "${topic}" de A a Z, sin saltos`,
        `Alerta de tendencia: "Todos están haciendo ${topic}, pero pocos saben..." - info privilegiada`,
      ],
      coach: [
        '✓ PUBLICA HOY 18:00-20:00 (máximo engagement: edad 18-45, creator economy)',
        '✓ Prepara 2 versiones de HOOK - prueba A/B la más fuerte en primera hora',
        '✓ RESPONDE a primeros 15 comentarios en 30 minutos (boost algo +45%)',
        '✓ FIJA comentario con CTA: "Revisa la guía completa en nuestro último video"',
        '✓ REPURPOSEA: mismo contenido → Shorts (agrega subs), Reels (agrega overlays), TikTok (cambia hook)',
        '✓ MONITOREA: 24h post-publicación revisa CTR, watch time, save rate - estés listo para siguiente post',
      ],
    },
  }[language];

  const topic = input.topic?.trim() || defaults.topic;
  const niche = input.niche?.trim() || defaults.niche;
  const platform = input.platform || defaults.platform;

  return {
    verdict: defaults.verdict,
    score: 87,
    bestTime: defaults.bestTime,
    trend: defaults.trend(niche),
    content: defaults.content(topic),
    hashtags: ['#growth', '#creator', '#tiktokgrowth', '#shorts', '#contentstrategy', '#ai', '#contentcreator', '#marketing'],
    nextIdeas: defaults.nextIdeas(topic, niche, platform),
    coach: defaults.coach,
  };
}
