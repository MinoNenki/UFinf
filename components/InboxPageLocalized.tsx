'use client';

import { useMemo, useState } from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';
import { MOCK_INBOX, type InboxMessage } from '@/lib/mockData';
import { byLanguage, useI18n } from '@/lib/i18n';

const PLATFORM_LABEL: Record<InboxMessage['platform'], string> = { tiktok: 'TikTok', youtube: 'YouTube', instagram: 'Instagram', facebook: 'Facebook', x: 'X' };
const PLATFORM_CLASS: Record<InboxMessage['platform'], string> = { tiktok: 'plat-tiktok', youtube: 'plat-youtube', instagram: 'plat-instagram', facebook: 'plat-facebook', x: 'plat-x' };

export default function InboxPageLocalized() {
  const { language } = useI18n();
  const copy = byLanguage(language, {
    pl: { title: 'Smart Inbox', subtitle: 'Jedno centrum komunikacji klienta z gotowymi odpowiedziami AI i szybka obsluga leadow.', messages: 'wiadomosci', all: 'Wszystkie', unread: 'Nieprzeczytane', empty: 'Brak wiadomosci do wyswietlenia.', ai: 'Sugestia AI', approve: 'Zaakceptuj i wyslij', edit: 'Edytuj odpowiedz' },
    en: { title: 'Smart Inbox', subtitle: 'One client communication hub with AI-assisted replies and faster lead handling.', messages: 'messages', all: 'All', unread: 'Unread', empty: 'No messages to display.', ai: 'AI suggestion', approve: 'Approve and send', edit: 'Edit reply' },
    es: { title: 'Bandeja inteligente', subtitle: 'Un centro de comunicacion con clientes con respuestas AI y gestion rapida de leads.', messages: 'mensajes', all: 'Todas', unread: 'No leidos', empty: 'No hay mensajes para mostrar.', ai: 'Sugerencia AI', approve: 'Aceptar y enviar', edit: 'Editar respuesta' },
  });
  const [selectedId, setSelectedId] = useState<number>(MOCK_INBOX[0]?.id ?? 0);
  const [showUnread, setShowUnread] = useState(false);
  const filtered = useMemo(() => showUnread ? MOCK_INBOX.filter((item) => item.unread) : MOCK_INBOX, [showUnread]);
  const selected = filtered.find((item) => item.id === selectedId) ?? filtered[0];

  return (
    <div className="animate-in">
      <div className="page-header"><h1>{copy.title}</h1><p>{copy.subtitle}</p></div>
      <div className="inbox-layout">
        <aside className="inbox-list">
          <div className="inbox-filter"><div className="flex items-center justify-between" style={{ marginBottom: 10 }}><span className="badge badge-cyan">{filtered.length} {copy.messages}</span><button className="btn btn-ghost btn-sm" onClick={() => setShowUnread((prev) => !prev)}>{showUnread ? copy.all : copy.unread}</button></div></div>
          {filtered.map((item) => <div key={item.id} className={`inbox-item${selected?.id === item.id ? ' active' : ''}`} onClick={() => setSelectedId(item.id)}><div className="inbox-avatar" style={{ background: 'linear-gradient(135deg,var(--cyan),var(--violet))' }}>{item.avatar}</div><div style={{ minWidth: 0, flex: 1 }}><div className="flex items-center justify-between" style={{ gap: 8 }}><div className="inbox-sender">{item.author}</div><div className="inbox-time">{item.time}</div></div><div className="inbox-preview">{item.message}</div><div style={{ marginTop: 6 }}><span className={`badge badge-muted ${PLATFORM_CLASS[item.platform]}`} style={{ fontSize: 10, padding: '2px 8px' }}>{PLATFORM_LABEL[item.platform]}</span></div></div>{item.unread && <span className="inbox-unread-dot" />}</div>)}
        </aside>
        <section className="inbox-detail">
          {!selected ? <div className="alert alert-info"><MessageSquare size={16} />{copy.empty}</div> : <><div className="flex items-center justify-between" style={{ gap: 12, flexWrap: 'wrap' }}><div><h3 style={{ fontSize: 18, fontWeight: 800 }}>{selected.author}</h3><p style={{ color: 'var(--muted)', fontSize: 12 }}>{selected.time}</p></div><span className={`badge ${PLATFORM_CLASS[selected.platform]}`}>{PLATFORM_LABEL[selected.platform]}</span></div><div className="inbox-msg-bubble">{selected.message}</div><div className="inbox-reply-area"><div className="flex items-center gap-8" style={{ marginBottom: 8, fontWeight: 700 }}><Sparkles size={14} /> {copy.ai}</div>{selected.aiReply}</div><div className="flex items-center gap-8" style={{ gap: 8 }}><button className="btn btn-primary btn-sm btn-pulse-attention">{copy.approve}</button><button className="btn btn-ghost btn-sm">{copy.edit}</button></div></>}
        </section>
      </div>
    </div>
  );
}
