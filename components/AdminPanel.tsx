'use client';

import { AlertTriangle, BarChart3, DollarSign, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { byLanguage, useI18n } from '@/lib/i18n';

const KPI = [
  { label: 'Aktywne workspace', value: 'Brak danych', hint: 'Dane operacyjne nie sa jeszcze podlaczone', icon: Users, color: 'var(--cyan)' },
  { label: 'MRR', value: 'Brak danych', hint: 'Brak realnego feedu przychodowego', icon: DollarSign, color: 'var(--green)' },
  { label: 'Zuzycie AI (24h)', value: 'Brak danych', hint: 'Monitoring kosztow wymaga realnego telemetry feed', icon: BarChart3, color: 'var(--yellow)' },
  { label: 'Ryzyko anti-loss', value: 'Do weryfikacji', hint: 'Sprawdz logi i limity zamiast wartosci demo', icon: ShieldCheck, color: 'var(--violet)' },
];

const ALERTS = [
  'Panel admina nie pokazuje juz zmyslonych alertow systemowych.',
  'Podlacz realny audit log i monitoring, aby zobaczyc prawdziwe alerty operacyjne.',
  'Do czasu integracji traktuj ten widok jako panel konfiguracyjny, nie jako zrodlo metryk.',
];

type Props = {
  adminRole?: string;
};

export default function AdminPanel({ adminRole }: Props) {
  const { language } = useI18n();
  const copy = byLanguage(language, {
    pl: {
      title: 'Centrum kontroli admina',
      subtitle: 'Globalny panel operacyjny: budzet, jakosc publikacji, ryzyka i stabilnosc platform.',
      actions: 'Globalne akcje',
      monitoring: 'Alerty systemowe na zywo',
      ops: 'Ops',
      monitor: 'Monitoring',
      buttons: ['Twardy kill switch AI', 'Rate limit: tryb ostry', 'Wymus retry publikacji', 'Odswiez feature flags'],
      warning: 'Akcje admina powinny byc wykonywane tylko przez role z odpowiednimi uprawnieniami RBAC, audit logiem i 2FA.',
      playbook: 'Co robic po zalogowaniu',
      playbookSteps: [
        '1. Wejdz do Ustawien i sprawdz, czy wszystkie klucze API platform sa uzupelnione.',
        '2. Zweryfikuj feature flags i limity anti-loss przed wlaczeniem produkcyjnego ruchu.',
        '3. Monitoruj publish queue, joby retry oraz wpisy DLQ po problemach z konektorami.',
        '4. Sprawdz audit log oraz rate limit alerts przed zmianami security.',
      ],
      activeRole: 'Aktywna rola',
    },
    en: {
      title: 'Admin control center',
      subtitle: 'Global operations panel for budget, publish quality, risk, and platform stability.',
      actions: 'Global actions',
      monitoring: 'Live system alerts',
      ops: 'Ops',
      monitor: 'Monitoring',
      buttons: ['Hard AI kill switch', 'Rate limit: strict mode', 'Force publish retry', 'Refresh feature flags'],
      warning: 'Admin actions should run only under roles protected by RBAC permissions, audit logging, and 2FA.',
      playbook: 'What to do after signing in',
      playbookSteps: [
        '1. Open Settings and verify that all platform API keys are filled in.',
        '2. Review feature flags and anti-loss limits before enabling production traffic.',
        '3. Monitor the publish queue, retry jobs, and DLQ entries after connector issues.',
        '4. Review the audit log and rate-limit alerts before changing security settings.',
      ],
      activeRole: 'Active role',
    },
    es: {
      title: 'Centro de control admin',
      subtitle: 'Panel global de operaciones para presupuesto, calidad de publicacion, riesgo y estabilidad de plataformas.',
      actions: 'Acciones globales',
      monitoring: 'Alertas del sistema en vivo',
      ops: 'Ops',
      monitor: 'Monitoreo',
      buttons: ['Kill switch duro de AI', 'Rate limit: modo estricto', 'Forzar reintento de publicacion', 'Refrescar feature flags'],
      warning: 'Las acciones admin solo deben ejecutarse bajo roles protegidos por RBAC, audit log y 2FA.',
      playbook: 'Que hacer despues de iniciar sesion',
      playbookSteps: [
        '1. Abre Ajustes y verifica que todas las claves API de plataformas esten completas.',
        '2. Revisa las feature flags y los limites anti-loss antes de habilitar trafico productivo.',
        '3. Supervisa la publish queue, los retry jobs y las entradas DLQ tras fallos de conectores.',
        '4. Revisa el audit log y las alertas de rate limit antes de cambiar seguridad.',
      ],
      activeRole: 'Rol activo',
    },
  });

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>{copy.title}</h1>
        <p>{copy.subtitle}</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 16 }}>
        {KPI.map(({ label, value, hint, icon: Icon, color }) => (
          <div className="stat-card" key={label}>
            <div className="flex items-center justify-between mb-8">
              <span className="stat-label">{label}</span>
              <Icon size={16} color={color} />
            </div>
            <div className="stat-value" style={{ fontSize: 24 }}>{value}</div>
            <div className="stat-change stat-up">{hint}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ gap: 16 }}>
        <div className="card admin-ops-card">
          <div className="flex items-center justify-between mb-12">
            <h3 style={{ fontSize: 15, fontWeight: 800 }}>{copy.actions}</h3>
            <span className="badge badge-violet">{copy.ops}</span>
          </div>

          <div className="admin-actions-grid">
            {copy.buttons.map((label, index) => (
              <button key={label} className={`btn ${index === 0 ? 'btn-danger' : index === 2 ? 'btn-success' : 'btn-ghost'} btn-sm`}>{label}</button>
            ))}
          </div>

          <div className="alert alert-warning" style={{ marginTop: 14 }}>
            <AlertTriangle size={16} />
            {copy.warning}
          </div>
        </div>

        <div className="card admin-ops-card">
          <div className="flex items-center justify-between mb-12">
            <h3 style={{ fontSize: 15, fontWeight: 800 }}>{copy.monitoring}</h3>
            <span className="badge badge-cyan">{copy.monitor}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ALERTS.map((item) => (
              <div className="admin-alert-item" key={item}>
                <Sparkles size={13} color="var(--cyan)" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card admin-ops-card" style={{ gridColumn: '1 / -1' }}>
          <div className="flex items-center justify-between mb-12">
            <h3 style={{ fontSize: 15, fontWeight: 800 }}>{copy.playbook}</h3>
            <span className="badge badge-green">{copy.activeRole}: {adminRole || 'super_admin'}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {copy.playbookSteps.map((step) => <div key={step} className="admin-alert-item"><Sparkles size={13} color="var(--cyan)" /><span>{step}</span></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
