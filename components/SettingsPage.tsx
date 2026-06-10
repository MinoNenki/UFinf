'use client';

import { useEffect, useState } from 'react';
import { Shield, Wallet } from 'lucide-react';
import { byLanguage, useI18n } from '@/lib/i18n';

type FormState = {
  openaiApiKey: string;
  anthropicApiKey: string;
  replicateApiToken: string;
  maxRequestCostUsd: number;
  dailyGlobalAiBudgetUsd: number;
  freeDailyGenerations: number;
  proDailyGenerations: number;
  premiumPlusDailyGenerations: number;
  softStopPercent: number;
  oneClickPublishEnabled: boolean;
  aiContentBrainEnabled: boolean;
};

const DEFAULT_FORM: FormState = {
  openaiApiKey: '',
  anthropicApiKey: '',
  replicateApiToken: '',
  maxRequestCostUsd: 0.12,
  dailyGlobalAiBudgetUsd: 20,
  freeDailyGenerations: 3,
  proDailyGenerations: 40,
  premiumPlusDailyGenerations: 120,
  softStopPercent: 80,
  oneClickPublishEnabled: true,
  aiContentBrainEnabled: true,
};

export default function SettingsPage() {
  const { language } = useI18n();
  const copy = byLanguage(language, {
    pl: { title: 'Ustawienia', loading: 'Ladowanie konfiguracji...', subtitle: 'Konfiguracja kluczy API, limitow anti-loss i funkcji Premium Plus.', fetchError: 'Nie mozna pobrac ustawien.', fallback: 'Blad pobierania ustawien. Uzywam wartosci domyslnych.', saveError: 'Nie mozna zapisac ustawien.', saveOk: 'Ustawienia zapisane.', saveFail: 'Blad zapisu ustawien.', security: 'API i bezpieczenstwo', limits: 'Anti-loss i limity', saveKeys: 'Zapisz klucze', saveLimits: 'Zapisz limity', saving: 'Zapisywanie...', maxCost: 'Maksymalny koszt / request (USD)', daily: 'Limit dzienny workspace (USD)', free: 'Free: generacje / dzien', pro: 'Pro: generacje / dzien', premium: 'Premium Plus: generacje / dzien', soft: 'Soft stop (%)' },
    en: { title: 'Settings', loading: 'Loading configuration...', subtitle: 'Configuration for API keys, anti-loss limits, and Premium Plus features.', fetchError: 'Cannot fetch settings.', fallback: 'Settings fetch failed. Using default values.', saveError: 'Cannot save settings.', saveOk: 'Settings saved.', saveFail: 'Settings save failed.', security: 'API and security', limits: 'Anti-loss and limits', saveKeys: 'Save keys', saveLimits: 'Save limits', saving: 'Saving...', maxCost: 'Maximum cost / request (USD)', daily: 'Daily workspace limit (USD)', free: 'Free: generations / day', pro: 'Pro: generations / day', premium: 'Premium Plus: generations / day', soft: 'Soft stop (%)' },
    es: { title: 'Ajustes', loading: 'Cargando configuracion...', subtitle: 'Configuracion de claves API, limites anti-loss y funciones Premium Plus.', fetchError: 'No se pueden obtener los ajustes.', fallback: 'Error al obtener ajustes. Se usan valores por defecto.', saveError: 'No se pueden guardar los ajustes.', saveOk: 'Ajustes guardados.', saveFail: 'Error al guardar los ajustes.', security: 'API y seguridad', limits: 'Anti-loss y limites', saveKeys: 'Guardar claves', saveLimits: 'Guardar limites', saving: 'Guardando...', maxCost: 'Coste maximo / request (USD)', daily: 'Limite diario del workspace (USD)', free: 'Free: generaciones / dia', pro: 'Pro: generaciones / dia', premium: 'Premium Plus: generaciones / dia', soft: 'Soft stop (%)' },
  });
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings', { method: 'GET' });
        if (!res.ok) throw new Error(copy.fetchError);
        const data = await res.json();
        setForm((prev) => ({
          ...prev,
          ...data.antiLoss,
          oneClickPublishEnabled: Boolean(data.features?.oneClickPublishEnabled),
          aiContentBrainEnabled: Boolean(data.features?.aiContentBrainEnabled),
        }));
      } catch {
        setMessage(copy.fallback);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  async function saveSettings() {
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        apiKeys: {
          openaiApiKey: form.openaiApiKey,
          anthropicApiKey: form.anthropicApiKey,
          replicateApiToken: form.replicateApiToken,
        },
        antiLoss: {
          maxRequestCostUsd: form.maxRequestCostUsd,
          dailyGlobalAiBudgetUsd: form.dailyGlobalAiBudgetUsd,
          freeDailyGenerations: form.freeDailyGenerations,
          proDailyGenerations: form.proDailyGenerations,
          premiumPlusDailyGenerations: form.premiumPlusDailyGenerations,
          softStopPercent: form.softStopPercent,
        },
        features: {
          oneClickPublishEnabled: form.oneClickPublishEnabled,
          aiContentBrainEnabled: form.aiContentBrainEnabled,
        },
      };

      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(copy.saveError);
      setMessage(copy.saveOk);
      setForm((prev) => ({ ...prev, openaiApiKey: '', anthropicApiKey: '', replicateApiToken: '' }));
    } catch {
      setMessage(copy.saveFail);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="animate-in">
        <div className="page-header">
          <h1>{copy.title}</h1>
          <p>{copy.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>{copy.title}</h1>
        <p>{copy.subtitle}</p>
      </div>

      {message && (
        <div className="alert alert-info" style={{ marginBottom: 16 }}>{message}</div>
      )}

      <div className="grid-2" style={{ gap: 20 }}>
        <div className="card">
          <div className="flex items-center gap-8" style={{ marginBottom: 12 }}>
            <Shield size={16} color="var(--cyan)" />
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>{copy.security}</h3>
          </div>

          <div className="form-group">
            <label className="form-label">OPENAI_API_KEY</label>
            <input type="password" placeholder="sk-..." value={form.openaiApiKey} onChange={(e) => setForm((p) => ({ ...p, openaiApiKey: e.target.value }))} />
          </div>

          <div className="form-group">
            <label className="form-label">ANTHROPIC_API_KEY</label>
            <input type="password" placeholder="sk-ant-..." value={form.anthropicApiKey} onChange={(e) => setForm((p) => ({ ...p, anthropicApiKey: e.target.value }))} />
          </div>

          <div className="form-group">
            <label className="form-label">REPLICATE_API_TOKEN</label>
            <input type="password" placeholder="r8_..." value={form.replicateApiToken} onChange={(e) => setForm((p) => ({ ...p, replicateApiToken: e.target.value }))} />
          </div>

          <button className="btn btn-primary btn-sm" onClick={saveSettings} disabled={saving}>{saving ? copy.saving : copy.saveKeys}</button>
        </div>

        <div className="card">
          <div className="flex items-center gap-8" style={{ marginBottom: 12 }}>
            <Wallet size={16} color="var(--green)" />
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>{copy.limits}</h3>
          </div>

          <div className="form-group">
            <label className="form-label">{copy.maxCost}</label>
            <input type="number" value={form.maxRequestCostUsd} step="0.01" min="0.01" onChange={(e) => setForm((p) => ({ ...p, maxRequestCostUsd: Number(e.target.value) }))} />
          </div>

          <div className="form-group">
            <label className="form-label">{copy.daily}</label>
            <input type="number" value={form.dailyGlobalAiBudgetUsd} step="1" min="1" onChange={(e) => setForm((p) => ({ ...p, dailyGlobalAiBudgetUsd: Number(e.target.value) }))} />
          </div>

          <div className="form-group">
            <label className="form-label">{copy.free}</label>
            <input type="number" value={form.freeDailyGenerations} step="1" min="1" onChange={(e) => setForm((p) => ({ ...p, freeDailyGenerations: Number(e.target.value) }))} />
          </div>

          <div className="form-group">
            <label className="form-label">{copy.pro}</label>
            <input type="number" value={form.proDailyGenerations} step="1" min="1" onChange={(e) => setForm((p) => ({ ...p, proDailyGenerations: Number(e.target.value) }))} />
          </div>

          <div className="form-group">
            <label className="form-label">{copy.premium}</label>
            <input type="number" value={form.premiumPlusDailyGenerations} step="1" min="1" onChange={(e) => setForm((p) => ({ ...p, premiumPlusDailyGenerations: Number(e.target.value) }))} />
          </div>

          <div className="form-group">
            <label className="form-label">{copy.soft}</label>
            <input type="number" value={form.softStopPercent} step="1" min="50" max="99" onChange={(e) => setForm((p) => ({ ...p, softStopPercent: Number(e.target.value) }))} />
          </div>

          <label className={`checkbox-item${form.oneClickPublishEnabled ? ' selected' : ''}`} style={{ marginBottom: 8 }}>
            <input type="checkbox" checked={form.oneClickPublishEnabled} onChange={(e) => setForm((p) => ({ ...p, oneClickPublishEnabled: e.target.checked }))} />
            One Click Publish (Premium Plus)
          </label>

          <label className={`checkbox-item${form.aiContentBrainEnabled ? ' selected' : ''}`} style={{ marginBottom: 14 }}>
            <input type="checkbox" checked={form.aiContentBrainEnabled} onChange={(e) => setForm((p) => ({ ...p, aiContentBrainEnabled: e.target.checked }))} />
            AI Content Brain (Premium Plus)
          </label>

          <button className="btn btn-success btn-sm" onClick={saveSettings} disabled={saving}>{saving ? copy.saving : copy.saveLimits}</button>
        </div>
      </div>
    </div>
  );
}
