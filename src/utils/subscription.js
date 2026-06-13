const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function getSubscriptionExpiryNotice(user, now = new Date(), warningDays = 15) {
  if (user?.suscripcionEstado !== 'activo' || !user?.suscripcionHasta) {
    return null;
  }

  const expiration = new Date(user.suscripcionHasta);
  const remainingMs = expiration.getTime() - now.getTime();

  if (!Number.isFinite(expiration.getTime()) || remainingMs <= 0 || remainingMs > warningDays * DAY_IN_MS) {
    return null;
  }

  return {
    expiration,
    daysRemaining: Math.max(1, Math.ceil(remainingMs / DAY_IN_MS))
  };
}
