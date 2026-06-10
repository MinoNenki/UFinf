export type AdminRole = 'super_admin' | 'ops_admin' | 'security_admin' | 'analyst';

export type AdminPermission =
  | 'admin:panel:read'
  | 'settings:read'
  | 'settings:write'
  | 'publish:manage'
  | 'audit:read';

const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  super_admin: ['admin:panel:read', 'settings:read', 'settings:write', 'publish:manage', 'audit:read'],
  ops_admin: ['admin:panel:read', 'settings:read', 'publish:manage'],
  security_admin: ['admin:panel:read', 'settings:read', 'settings:write', 'audit:read'],
  analyst: ['admin:panel:read', 'settings:read'],
};

export function normalizeAdminRole(input: string | undefined): AdminRole {
  if (!input) return 'super_admin';
  if (input === 'super_admin' || input === 'ops_admin' || input === 'security_admin' || input === 'analyst') {
    return input;
  }
  return 'super_admin';
}

export function permissionsForRole(role: AdminRole) {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.super_admin;
}

export function hasPermission(role: AdminRole, permission: AdminPermission) {
  return permissionsForRole(role).includes(permission);
}
