import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

export type AuditOutcome = 'allow' | 'deny' | 'error';

export type AuditEntry = {
  action: string;
  outcome: AuditOutcome;
  ip: string;
  userAgent: string;
  adminEmail?: string;
  adminRole?: string;
  details?: Record<string, unknown>;
};

const AUDIT_FILE = path.join(process.cwd(), '.runtime', 'security-audit.jsonl');

export async function writeAuditLog(entry: AuditEntry) {
  const row = {
    ts: new Date().toISOString(),
    ...entry,
  };
  try {
    await mkdir(path.dirname(AUDIT_FILE), { recursive: true });
    await appendFile(AUDIT_FILE, `${JSON.stringify(row)}\n`, 'utf8');
  } catch {
    // Audyt nie moze blokowac krytycznych sciezek w runtime bez zapisu do dysku.
  }
}
