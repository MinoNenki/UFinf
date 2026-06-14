export const metadata = {
  title: 'Warunki Korzystania z Usługi — UFInf',
  description: 'Regulamin i warunki korzystania z platformy UFInf (ufinf.com).',
};

const LAST_UPDATED = '2026-06-14';
const CONTACT = 'ufrevsupport@gmail.com';

export default function TermsPage() {
  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: '60px 24px 80px', color: '#e5edf9', fontFamily: 'system-ui, sans-serif', lineHeight: 1.75 }}>
      <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 6 }}>Warunki Korzystania z Usługi</h1>
      <p style={{ color: '#6b7ea0', fontSize: 13, marginBottom: 40 }}>Ostatnia aktualizacja: {LAST_UPDATED}</p>

      <p style={{ color: '#cdd6e8', marginBottom: 32 }}>
        Niniejsze Warunki Korzystania z Usługi (&bdquo;Warunki&ldquo;) stanowią wiążącą umowę prawną między Tobą a operatorem platformy UFInf / ufinf.com (&bdquo;UFInf&ldquo;, &bdquo;my&ldquo;, &bdquo;nas&ldquo;). Korzystając z usługi, akceptujesz niniejsze Warunki w całości. Jeśli nie akceptujesz, zaprzestań korzystania z usługi niezwłocznie.
      </p>

      <Section title="1. Opis usługi">
        <p>UFInf jest platformą SaaS zapewniającą wsparcie decyzji oparte na AI do analizy produktów, badań rynkowych i walidacji biznesu. Usługa jest <strong>WYŁĄCZNIE DO CELÓW INFORMACYJNYCH</strong> i nie stanowi porady finansowej, inwestycyjnej, prawnej, medycznej ani żadnej innej regulowanej porady profesjonalnej.</p>
      </Section>

      <Section title="2. BEZ GWARANCJI ZYSKU — WYŁĄCZENIE ODPOWIEDZIALNOŚCI">
        <p>Wyniki AI są <strong>PROBABILISTYCZNE i mogą być NIEDOKŁADNE</strong>. UFInf <strong>NIE GWARANTUJE</strong>: dokładności wyników, rentowności, zysku finansowego, sukcesu biznesowego, użyteczności ani niezawodności. Decyzje podejmujesz <strong>NA WŁASNE RYZYKO</strong>. UFInf jest narzędziem wspierającym, nie doradcą i nie gwarantem jakichkolwiek wyników.</p>
        <p style={{ marginTop: 8 }}>Każde działanie lub decyzja podjęta w oparciu o wyniki UFInf jest podejmowana wyłącznie przez Ciebie i na Twoją wyłączną odpowiedzialność.</p>
      </Section>

      <Section title="3. BEZ ODPOWIEDZIALNOŚCI ZA DECYZJE UŻYTKOWNIKA">
        <p>UFInf <strong>nie ponosi odpowiedzialności</strong> za:</p>
        <ul>
          <li>Straty finansowe wynikające z decyzji podjętych na podstawie wyników platformy.</li>
          <li>Niepowodzenia biznesowe, utracone kontrakty lub utratę przychodów.</li>
          <li>Skutki polegania na rekomendacjach AI.</li>
          <li>Błędy, niedokładności lub braki w wynikach generowania.</li>
          <li>Utracone okazje w wyniku jakiegokolwiek działania lub zaniechania platformy.</li>
        </ul>
        <p style={{ marginTop: 8 }}>Akceptujesz <strong>PEŁNĄ ODPOWIEDZIALNOŚĆ</strong> za wszystkie decyzje i działania podjęte na podstawie wyników UFInf.</p>
      </Section>

      <Section title="4. LIMIT ODPOWIEDZIALNOŚCI">
        <p>W maksymalnym zakresie dozwolonym przez prawo, <strong>łączna odpowiedzialność UFInf</strong> wobec Ciebie z tytułu wszelkich roszczeń związanych z usługą jest ograniczona do <strong>kwoty opłat faktycznie zapłaconych przez Ciebie w ciągu ostatnich 30 dni</strong>. UFInf nie ponosi odpowiedzialności za żadne szkody pośrednie, następcze, szczególne, przypadkowe ani za utratę zysku, danych lub możliwości biznesowych, niezależnie od podstawy prawnej roszczenia i nawet jeśli była poinformowana o możliwości ich wystąpienia.</p>
        <p style={{ marginTop: 8 }}>Użytkownicy z UE: tam, gdzie prawo konsumenckie ogranicza powyższe wyłączenia, wyłączenia stosuje się w maksymalnym dozwolonym przez prawo zakresie.</p>
      </Section>

      <Section title="5. PŁATNOŚCI — BEZ ZWROTU">
        <p>Z wyjątkiem przypadków wymaganych przez bezwzględnie obowiązujące prawo (w szczególności prawa konsumenta UE):</p>
        <ul>
          <li>Wszystkie płatności subskrypcji są <strong>BEZ ZWROTU</strong>.</li>
          <li>Jednorazowe zakupy top-up są <strong>BEZ ZWROTU</strong> po aktywacji generacji.</li>
          <li>Anulowanie w połowie okresu rozliczeniowego nie uprawnia do proporcjonalnego zwrotu.</li>
          <li>Anulowanie przez naruszenie Warunków nie uprawnia do jakiegokolwiek zwrotu.</li>
        </ul>
        <p style={{ marginTop: 8 }}>Próby zwrotu środków przez bank/kartę (chargeback) bez uprzedniego kontaktu supportowego będą traktowane jako nadużycie i mogą skutkować natychmiastowym zawieszeniem konta, usunięciem danych i podjęciem działań prawnych w celu odzyskania środków.</p>
      </Section>

      <Section title="6. PŁATNOŚCI STRIPE I POLITYKA CHARGEBACKÓW">
        <p>Wszystkie płatności są przetwarzane przez Stripe (stripe.com). Subskrypcje są automatycznie odnawiane miesięcznie lub rocznie — potwierdzasz, że rozumiesz i akceptujesz to zobowiązanie. Nieudane płatności mogą skutkować wstrzymaniem dostępu do usługi. Chargebacki, spory lub próby oszustwa prowadzą do natychmiastowego zakończenia konta, trwałego usunięcia danych i umieszczenia na liście zablokowanych. Zastrzegamy prawo do dochodzenia należności z tytułu chargebacków w drodze prawnej. Transakcje podlegają Warunkom Stripe.</p>
      </Section>

      <Section title="7. AKCEPTOWALNE UŻYTKOWANIE">
        <p>Zabrania się:</p>
        <ul>
          <li>Używania platformy do generowania treści nielegalnych, naruszających prawa autorskie, szkalujących, nienawistnych lub szkodliwych.</li>
          <li>Automatycznego masowego odpytywania API z naruszeniem limitów planów.</li>
          <li>Udostępniania dostępu do konta innym osobom lub odsprzedaży generowanych treści bez zaznaczenia źródła AI.</li>
          <li>Prób obejścia limitów, systemów anty-fraud lub mechanizmów bezpieczeństwa.</li>
          <li>Przesyłania danych osobowych stron trzecich bez ich zgody.</li>
          <li>Naruszania przepisów o ochronie danych, praw autorskich lub innych praw własności intelektualnej.</li>
        </ul>
        <p style={{ marginTop: 8 }}>Naruszenie tych zasad skutkuje natychmiastowym zawieszeniem lub usunięciem konta bez prawa do zwrotu.</p>
      </Section>

      <Section title="8. ODPOWIEDZIALNOŚĆ UŻYTKOWNIKA I BEZPIECZEŃSTWO KONTA">
        <p>Odpowiadasz za: dokładność danych rejestracyjnych, bezpieczeństwo logowania i wszelkie aktywności na Twoim koncie, legalność treści przesyłanych do analizy, zgodność z prawem autorskim i sposobem wykorzystania wyników AI. Udostępnianie dostępu do konta osobom trzecim jest zabronione. Nadużycia = natychmiastowe zawieszenie bez zwrotu.</p>
      </Section>

      <Section title="9. AUTOMATYZACJA I FUNKCJE RYZYKA">
        <p>UFInf oferuje funkcje automatyzacji (generowanie treści, publikacja, harmonogramowanie). Korzystasz z nich <strong>BEZ GWARANCJI</strong> efektywności i <strong>BEZ GWARANCJI</strong> przed stratami. Musisz samodzielnie weryfikować wszystkie automatycznie generowane treści przed publikacją. Działania automatyczne są <strong>WYŁĄCZNIE NA TWOJE RYZYKO I ODPOWIEDZIALNOŚĆ</strong>.</p>
      </Section>

      <Section title="10. PRYWATNOŚĆ I OCHRONA DANYCH">
        <p>Przetwarzanie danych odbywa się zgodnie z naszą <a href="/privacy" style={{ color: '#22d3ee' }}>Polityką Prywatności</a>, która stanowi integralną część niniejszych Warunków. Platformę obsługujemy zgodnie z RODO (UE), CCPA (Kalifornia) i UK GDPR. Dane mogą być przetwarzane globalnie przez naszych dostawców (Vercel, Supabase, Stripe, OpenAI). Korzystając z usługi, wyrażasz zgodę na takie transfery z zastosowaniem odpowiednich mechanizmów ochrony (SCCs, DPF).</p>
      </Section>

      <Section title="11. WŁASNOŚĆ INTELEKTUALNA">
        <p>UFInf (kod, marka, interfejs, metodologia) jest własnością operatora. Wyniki generowania treści AI są udostępniane Tobie na użytek własny zgodny z niniejszymi Warunkami. Nie przenosimy na Ciebie żadnych praw do platformy ani jej komponentów. Treści przesłane przez Ciebie pozostają Twoją własnością — udzielasz UFInf ograniczonej licencji na przetwarzanie ich wyłącznie w celu świadczenia usługi.</p>
      </Section>

      <Section title="12. INTEGRACJE ZEWNĘTRZNE">
        <p>UFInf może integrować się z platformami trzecimi (TikTok, YouTube, Instagram, Facebook, X). Jesteśmy <strong>NIEODPOWIEDZIALNI</strong> za funkcjonalność usług zewnętrznych, przerwy ich działania, zmiany API ani naruszenia przez nie bezpieczeństwa. Integracje z platformami zewnętrznymi używasz <strong>NA WŁASNE RYZYKO</strong>.</p>
      </Section>

      <Section title="13. ZMIANY USŁUGI I ZAKOŃCZENIE">
        <p>Możemy modyfikować usługę, funkcje, plany lub ceny w dowolnym momencie. Duże zmiany będą komunikowane z wyprzedzeniem. Mamy prawo zawiesić lub usunąć konto za naruszenia prawa, naruszenia Warunków, próby fraudu lub nadużycia platformy — bez wcześniejszego powiadomienia i bez prawa do zwrotu. Użytkownicy mogą anulować w dowolnym momencie ze skutkiem na koniec okresu rozliczeniowego.</p>
      </Section>

      <Section title="14. PRAWO WŁAŚCIWE I JURYSDYKCJA">
        <p>Niniejsze Warunki podlegają prawu polskiemu. Wszelkie spory rozstrzygane są przez sądy właściwe dla siedziby operatora, z możliwością arbitrażu. Dla użytkowników z UE: prawo lokalne może przyznawać Ci dodatkowe prawa konsumenckie, których niniejsze Warunki nie ograniczają. Dla użytkowników z Kalifornii: stosują się prawa przewidziane przez CCPA. Skontaktuj się z nami w sprawie sporów: <a href={`mailto:${CONTACT}`} style={{ color: '#22d3ee' }}>{CONTACT}</a></p>
      </Section>

      <Section title="15. ROZSTRZYGANIE SPORÓW">
        <p>Przed wszczęciem jakiegokolwiek postępowania prawnego zobowiązujesz się skontaktować z nami na adres <a href={`mailto:${CONTACT}`} style={{ color: '#22d3ee' }}>{CONTACT}</a> i umożliwić nam rozwiązanie sporu w ciągu 30 dni. Podejmiesz próbę polubownego rozwiązania sporu przed oddaniem sprawy do sądu lub arbitrażu.</p>
      </Section>

      <Section title="16. POSTANOWIENIA KOŃCOWE">
        <ul>
          <li><strong>Rozdzielność</strong>: nieważność jednego postanowienia nie wpływa na pozostałe.</li>
          <li><strong>Brak zrzeczenia</strong>: nieegzekwowanie postanowień nie stanowi zrzeczenia się praw.</li>
          <li><strong>Całość umowy</strong>: niniejsze Warunki wraz z Polityką Prywatności stanowią całość umowy.</li>
          <li><strong>Cesja</strong>: nie możesz cedować swoich praw bez naszej pisemnej zgody.</li>
          <li><strong>Przeżywalność</strong>: postanowienia dotyczące odpowiedzialności, IP i poufności przeżywają rozwiązanie umowy.</li>
        </ul>
      </Section>

      <Section title="17. ZMIANY WARUNKÓW">
        <p>Możemy aktualizować niniejsze Warunki w dowolnym czasie. Istotne zmiany ogłaszane będą z co najmniej 14-dniowym wyprzedzeniem przez e-mail lub widoczny baner w produkcie. Dalsze korzystanie z usługi po tym terminie stanowi akceptację nowych Warunków. Zalecamy regularne przeglądanie tej strony.</p>
      </Section>

      <p style={{ marginTop: 48, fontSize: 12, color: '#6b7ea0' }}>
        © UFInf / ufinf.com — {LAST_UPDATED}. Wszelkie prawa zastrzeżone.<br />
        Kontakt: <a href={`mailto:${CONTACT}`} style={{ color: '#22d3ee' }}>{CONTACT}</a>
      </p>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, color: '#22d3ee' }}>{title}</h2>
      <div style={{ color: '#cdd6e8', fontSize: 14 }}>{children}</div>
    </section>
  );
}
