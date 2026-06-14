export const metadata = {
  title: 'Polityka Prywatności — UFInf',
  description: 'Polityka prywatności platformy UFInf (ufinf.com). RODO, CCPA, UK GDPR.',
};

const LAST_UPDATED = '2026-06-14';

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: '60px 24px 80px', color: '#e5edf9', fontFamily: 'system-ui, sans-serif', lineHeight: 1.75 }}>
      <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 6 }}>Polityka Prywatności</h1>
      <p style={{ color: '#6b7ea0', fontSize: 13, marginBottom: 40 }}>Ostatnia aktualizacja: {LAST_UPDATED}</p>

      <Section title="1. Administrator danych">
        <p>Administratorem danych osobowych w rozumieniu RODO, CCPA oraz UK GDPR jest <strong>UFInf / UFINF.com</strong> — właściciel i operator platformy dostępnej pod adresem <strong>ufinf.com</strong>. Kontakt: <a href="mailto:ufrevsupport@gmail.com" style={{ color: '#22d3ee' }}>ufrevsupport@gmail.com</a>.</p>
        <p style={{ marginTop: 8 }}>Do czasu formalnej rejestracji działalności, za administratora uważa się osobę fizyczną prowadzącą platformę.</p>
      </Section>

      <Section title="2. Jakie dane zbieramy">
        <ul>
          <li>Dane konta: adres e-mail, imię lub pseudonim, preferencje językowe.</li>
          <li>Dane rozliczeniowe: identyfikatory Stripe, status subskrypcji, historia zakupów.</li>
          <li>Dane użytkowania: logi generowania treści, tematy promptów, liczba wywołań API.</li>
          <li>Dane techniczne: adres IP, user-agent, ciasteczka sesji, local storage, logi serverless.</li>
          <li>Treści przesłane przez użytkownika: pliki, opisy, materiały przekazane do analizy AI.</li>
          <li>Komunikacja supportowa: treść wiadomości zgłoszeń, historia korespondencji.</li>
        </ul>
        <p style={{ marginTop: 8 }}><strong>Nie zbieramy</strong> danych sensytywnych (m.in. danych biometrycznych, zdrowotnych, rasowych, politycznych) i prosimy o ich nieprzesyłanie.</p>
      </Section>

      <Section title="3. Jak wykorzystujemy Twoje dane">
        <ul>
          <li>Świadczenie usługi SaaS: generowanie treści, analiza AI, historia, eksport.</li>
          <li>Uwierzytelnianie sesji i zabezpieczenie konta.</li>
          <li>Obsługa subskrypcji i płatności przez Stripe.</li>
          <li>Wykrywanie nadużyć, rate-limiting, ochrona przed fraudem.</li>
          <li>Komunikowanie zmian w usłudze i ważnych powiadomień operacyjnych.</li>
          <li>Ulepszanie funkcjonalności platformy na bazie zagregowanych, zanonimizowanych danych.</li>
          <li>Dochodzenie lub obrona roszczeń prawnych, gdy jest to konieczne.</li>
        </ul>
        <p style={{ marginTop: 8 }}><strong>Nie sprzedajemy</strong> Twoich danych osobowych stronom trzecim w celach reklamowych ani marketingowych.</p>
      </Section>

      <Section title="4. Podstawa prawna przetwarzania">
        <ul>
          <li><strong>Umowa</strong> (art. 6 ust. 1 lit. b RODO): dane niezbędne do wykonania usługi.</li>
          <li><strong>Uzasadniony interes</strong> (art. 6 ust. 1 lit. f RODO): bezpieczeństwo, wykrywanie nadużyć, ulepszanie produktu.</li>
          <li><strong>Obowiązek prawny</strong> (art. 6 ust. 1 lit. c RODO): wymogi podatkowe, rachunkowe, prawne.</li>
          <li><strong>Zgoda</strong> (art. 6 ust. 1 lit. a RODO): w zakresie opcjonalnych plików cookie analitycznych, gdzie wymagana przez prawo lokalne.</li>
        </ul>
      </Section>

      <Section title="5. Odbiorcy danych">
        <p>Dane mogą być udostępniane wyłącznie dostawcom usług niezbędnym do działania platformy:</p>
        <ul>
          <li><strong>Vercel</strong> — hosting i CDN (USA, SCCs/Data Privacy Framework).</li>
          <li><strong>Supabase</strong> — baza danych i autentykacja (EU/USA).</li>
          <li><strong>Stripe</strong> — przetwarzanie płatności (USA, certyfikacja PCI DSS).</li>
          <li><strong>OpenAI / Anthropic</strong> — generowanie treści AI (USA, umowy DPA).</li>
        </ul>
        <p style={{ marginTop: 8 }}>Nie powierzamy danych żadnym dostawcom reklam, analytics third-party ani brokerom danych.</p>
      </Section>

      <Section title="6. Okres przechowywania danych">
        <p>Dane konta przechowujemy przez cały czas aktywności konta oraz przez okres wymagany prawnie po jego usunięciu (min. 5 lat dla danych rozliczeniowych). Po usunięciu konta dane osobowe są usuwane lub nieodwracalnie anonimizowane w ciągu 30 dni, z zastrzeżeniem wymogów prawnych i backupów.</p>
        <p style={{ marginTop: 8 }}>Logi techniczne przechowywane są przez 90 dni. Historia generowania — do czasu usunięcia konta lub danych.</p>
      </Section>

      <Section title="7. Twoje prawa (RODO / CCPA / UK GDPR)">
        <ul>
          <li><strong>Dostęp</strong>: możesz zażądać kopii danych, które przetwarzamy.</li>
          <li><strong>Sprostowanie</strong>: możesz poprosić o korektę nieprawidłowych danych.</li>
          <li><strong>Usunięcie</strong>: prawo do usunięcia danych (z zastrzeżeniem obowiązków prawnych).</li>
          <li><strong>Ograniczenie</strong>: możesz zażądać ograniczenia przetwarzania w określonych przypadkach.</li>
          <li><strong>Przeniesienie</strong>: możesz otrzymać swoje dane w formacie JSON/CSV.</li>
          <li><strong>Sprzeciw</strong>: wobec przetwarzania opartego na uzasadnionym interesie.</li>
          <li><strong>Wycofanie zgody</strong>: tam, gdzie przetwarzanie opiera się na zgodzie.</li>
          <li><strong>CCPA / Kalifornia</strong>: prawo do wiedzy, usunięcia i rezygnacji ze sprzedaży (której nie prowadzimy).</li>
        </ul>
        <p style={{ marginTop: 8 }}>Wnioski kieruj na: <a href="mailto:ufrevsupport@gmail.com" style={{ color: '#22d3ee' }}>ufrevsupport@gmail.com</a>. Odpowiemy w ciągu 30 dni. Masz prawo złożyć skargę do PUODO (Polska) lub właściwego organu nadzorczego w Twoim kraju.</p>
      </Section>

      <Section title="8. Cookies i dane techniczne">
        <p>Używamy:</p>
        <ul>
          <li><strong>Niezbędnych cookies sesji</strong>: uwierzytelnianie, bezpieczeństwo (podstawa: umowa / uzasadniony interes).</li>
          <li><strong>Local storage</strong>: preferencje językowe, dane profilu lokalnego (podstawa: umowa).</li>
        </ul>
        <p style={{ marginTop: 8 }}>Nie używamy cookies reklamowych ani śledzenia między stronami. Możesz usunąć cookies i local storage w ustawieniach przeglądarki — może to wpłynąć na działanie usługi.</p>
      </Section>

      <Section title="9. Bezpieczeństwo danych">
        <p>Stosujemy techniczne i organizacyjne środki ochrony danych, w tym:</p>
        <ul>
          <li>HTTPS / TLS dla wszystkich połączeń.</li>
          <li>Klucze API wyłącznie po stronie serwera.</li>
          <li>HMAC-SHA256 + TOTP 2FA dla dostępu administracyjnego.</li>
          <li>Rate-limiting i anty-fraud na endpointach API.</li>
          <li>Weryfikacja podpisu webhook Stripe.</li>
        </ul>
        <p style={{ marginTop: 8 }}>W przypadku naruszenia ochrony danych poinformujemy Cię i właściwy organ nadzorczy zgodnie z wymogami prawnymi (max. 72h od wykrycia, gdy wymagane).</p>
      </Section>

      <Section title="10. Transfer międzynarodowy">
        <p>Niektórzy nasi dostawcy przetwarzają dane poza Europejskim Obszarem Gospodarczym (EOG). Każdy taki transfer zabezpieczamy odpowiednimi mechanizmami prawnymi: standardowymi klauzulami umownymi (SCCs), decyzją o adekwatności Komisji Europejskiej lub certyfikacją Data Privacy Framework (DPF), stosownie do przypadku.</p>
      </Section>

      <Section title="11. Dane dzieci">
        <p>Usługa nie jest przeznaczona dla osób poniżej 16 roku życia (lub niższego progu wymaganego przez prawo lokalne). Jeśli dowiesz się, że Twoje dziecko przekazało nam dane bez Twojej zgody, skontaktuj się z nami — niezwłocznie usuniemy te dane.</p>
      </Section>

      <Section title="12. Zmiany polityki">
        <p>Możemy aktualizować niniejszą Politykę w dowolnym czasie. Istotne zmiany będą komunikowane e-mailem lub widocznym powiadomieniem w produkcie co najmniej 14 dni przed wejściem w życie. Dalsze korzystanie z usługi po tym terminie stanowi akceptację zmian.</p>
      </Section>

      <Section title="13. Kontakt">
        <p>W sprawach ochrony danych: <a href="mailto:ufrevsupport@gmail.com" style={{ color: '#22d3ee' }}>ufrevsupport@gmail.com</a></p>
        <p style={{ marginTop: 8 }}>W sprawach prawnych i roszczeń: ten sam adres, w tytule: LEGAL / DATA REQUEST.</p>
      </Section>

      <p style={{ marginTop: 48, fontSize: 12, color: '#6b7ea0' }}>© UFInf / ufinf.com — {LAST_UPDATED}. Wszelkie prawa zastrzeżone.</p>
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
