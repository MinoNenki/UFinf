import { cookies } from 'next/headers';
import { cookieName, verifyAdminSessionToken } from '@/lib/server/security/adminAuth';
import { AdminPermission, hasPermission } from '@/lib/server/security/rbac';

export type AdminSession = {
  role: 'admin';
  adminRole: 'super_admin' | 'ops_admin' | 'security_admin' | 'analyst';
  mfa: true;
  exp: number;
};

export async function getAdminSession(): Promise<AdminSession | null> {
  const jar = await cookies();
  const token = jar.get(cookieName())?.value;
  const payload = verifyAdminSessionToken(token);
  return payload || null;
}

export async function isAdminRequest() {
  return Boolean(await getAdminSession());
}

export async function hasAdminPermission(permission: AdminPermission) {
  const session = await getAdminSession();
  if (!session) return false;
  return hasPermission(session.adminRole, permission);
}
