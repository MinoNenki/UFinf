export function getClientIp(req: Request) {
  const fwd = req.headers.get('x-forwarded-for') || '';
  const first = fwd.split(',')[0]?.trim();
  if (first) return first;
  return req.headers.get('x-real-ip') || 'unknown';
}

export function getUserAgent(req: Request) {
  return req.headers.get('user-agent') || 'unknown';
}
