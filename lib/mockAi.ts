type MockLanguage = 'pl' | 'en' | 'es';

export function generateGrowthPack(input: { topic: string; platform: string; niche: string; language?: MockLanguage }) {
  const language = input.language || 'pl';
  const defaults = {
    pl: {
      topic: 'nowy film edukacyjny',
      niche: 'creator economy',
      platform: 'wszystkie platformy',
      verdict: 'PUBLIKUJ',
      bestTime: '18:00–20:00',
      trend: (niche: string) => `${niche}: temat ma potencjal wzrostu w krotkich formatach, szczegolnie jako seria 3 czesci.`,
      content: (topic: string) => ({
        tiktok: `Hook: "Nie popelniaj tego bledu przy: ${topic}". Format: szybkie ciecia, 3 punkty, mocne CTA w ostatnich 2 sekundach.`,
        shorts: `Tytul: ${topic} - 3 rzeczy, ktore zwieksza wynik kanalu. Opis krotki, z obietnica praktycznego efektu.`,
        reels: 'Reels: pokaz problem -> szybkie rozwiazanie -> rezultat. Dodaj napis na ekranie w pierwszej sekundzie.',
        facebook: 'Post: praktyczna mini-historia + pytanie do odbiorcow. Cel: komentarze i zapisanie posta.',
        x: 'Thread 5 tweetow: problem, przyklad, blad, rozwiazanie, CTA.',
      }),
      nextIdeas: (topic: string, niche: string, platform: string) => [
        `Porownanie: co dzialalo kiedys vs teraz w temacie ${topic}`,
        `Case study: jak poprawic wynik filmu w niszy ${niche}`,
        `Lista bledow, ktore blokuja zasiegi w ${platform}`,
      ],
      coach: [
        'Opublikuj dzisiaj miedzy 18:00 a 20:00.',
        'Zrob wersje z mocniejszym hookiem w pierwszej sekundzie.',
        'Po publikacji odpowiedz na pierwsze 10 komentarzy w ciagu 30 minut.',
      ],
    },
    en: {
      topic: 'new educational video',
      niche: 'creator economy',
      platform: 'all platforms',
      verdict: 'PUBLISH',
      bestTime: '6:00-8:00 PM',
      trend: (niche: string) => `${niche}: this topic has strong short-form growth potential, especially as a 3-part series.`,
      content: (topic: string) => ({
        tiktok: `Hook: "Do not make this mistake with: ${topic}". Format: fast cuts, 3 points, strong CTA in the last 2 seconds.`,
        shorts: `Title: ${topic} - 3 things that will improve your channel performance. Keep the description short with a clear practical promise.`,
        reels: 'Reels: show the problem -> quick solution -> result. Add on-screen text in the first second.',
        facebook: 'Post: practical mini-story + audience question. Goal: comments and post saves.',
        x: '5-tweet thread: problem, example, mistake, solution, CTA.',
      }),
      nextIdeas: (topic: string, niche: string, platform: string) => [
        `Comparison: what worked before vs now for ${topic}`,
        `Case study: how to improve video performance in the ${niche} niche`,
        `A list of mistakes that block reach on ${platform}`,
      ],
      coach: [
        'Publish today between 6:00 PM and 8:00 PM.',
        'Create a version with a stronger hook in the first second.',
        'After publishing, reply to the first 10 comments within 30 minutes.',
      ],
    },
    es: {
      topic: 'nuevo video educativo',
      niche: 'creator economy',
      platform: 'todas las plataformas',
      verdict: 'PUBLICAR',
      bestTime: '18:00-20:00',
      trend: (niche: string) => `${niche}: este tema tiene potencial de crecimiento en formatos cortos, especialmente como una serie de 3 partes.`,
      content: (topic: string) => ({
        tiktok: `Hook: "No cometas este error con: ${topic}". Formato: cortes rapidos, 3 puntos y CTA fuerte en los ultimos 2 segundos.`,
        shorts: `Titulo: ${topic} - 3 cosas que mejoraran el rendimiento del canal. Descripcion breve con una promesa practica clara.`,
        reels: 'Reels: muestra el problema -> solucion rapida -> resultado. Anade texto en pantalla en el primer segundo.',
        facebook: 'Post: mini-historia practica + pregunta a la audiencia. Objetivo: comentarios y guardados.',
        x: 'Hilo de 5 tweets: problema, ejemplo, error, solucion, CTA.',
      }),
      nextIdeas: (topic: string, niche: string, platform: string) => [
        `Comparacion: que funcionaba antes vs ahora en ${topic}`,
        `Caso practico: como mejorar el rendimiento del video en el nicho ${niche}`,
        `Lista de errores que bloquean el alcance en ${platform}`,
      ],
      coach: [
        'Publica hoy entre las 18:00 y las 20:00.',
        'Crea una version con un hook mas fuerte en el primer segundo.',
        'Despues de publicar, responde a los primeros 10 comentarios en 30 minutos.',
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
    hashtags: ['#growth', '#creator', '#tiktokgrowth', '#shorts', '#contentstrategy', '#ai'],
    nextIdeas: defaults.nextIdeas(topic, niche, platform),
    coach: defaults.coach,
  };
}
