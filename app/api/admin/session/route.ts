import { NextResponse } from 'next/server';
import { getAdminSession, isAdminRequest } from '@/lib/server/security/adminGuard';
import { permissionsForRole } from '@/lib/server/security/rbac';

export async function GET() {
  const isAdmin = await isAdminRequest();
  if (!isAdmin) return NextResponse.json({ isAdmin: false });
  const session = await getAdminSession();
  const role = session?.adminRole || 'super_admin';
  return NextResponse.json({
    isAdmin: true,
    role,
    permissions: permissionsForRole(role),
    mfa: true,
  });
}
