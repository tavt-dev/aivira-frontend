const ANONYMOUS_KEY = "aivira_anonymous_id";
const ANONYMOUS_CREATED_KEY = "aivira_anonymous_id_created_at";
const SESSION_KEY = "aivira_view_session_id";
const SESSION_ACTIVITY_KEY = "aivira_view_session_activity";
const RECENT_KEY = "aivira_recently_viewed";
const ANONYMOUS_TTL = 180 * 24 * 60 * 60 * 1000;
const SESSION_TTL = 30 * 60 * 1000;
const MAX_GUEST_RECENT = 12;

export function getViewerIdentity(now = Date.now()) {
  let anonymousId = localStorage.getItem(ANONYMOUS_KEY);
  const anonymousCreatedAt = Number(localStorage.getItem(ANONYMOUS_CREATED_KEY) || 0);
  if (!anonymousId || !anonymousCreatedAt || now - anonymousCreatedAt > ANONYMOUS_TTL) {
    anonymousId = crypto.randomUUID();
    localStorage.setItem(ANONYMOUS_KEY, anonymousId);
    localStorage.setItem(ANONYMOUS_CREATED_KEY, String(now));
  }

  let sessionId = sessionStorage.getItem(SESSION_KEY);
  const lastActivity = Number(sessionStorage.getItem(SESSION_ACTIVITY_KEY) || 0);
  if (!sessionId || !lastActivity || now - lastActivity > SESSION_TTL) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  sessionStorage.setItem(SESSION_ACTIVITY_KEY, String(now));
  return { anonymousId, sessionId };
}

export function rotateAnonymousIdentity() {
  localStorage.removeItem(ANONYMOUS_KEY);
  localStorage.removeItem(ANONYMOUS_CREATED_KEY);
  return getViewerIdentity().anonymousId;
}

export function readGuestRecentlyViewed() {
  try {
    const rows = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

export function rememberGuestProduct(product) {
  if (!product?.slug) return;
  const row = { ...product, lastViewedAt: new Date().toISOString() };
  const rows = readGuestRecentlyViewed().filter((item) => item.slug !== product.slug);
  localStorage.setItem(RECENT_KEY, JSON.stringify([row, ...rows].slice(0, MAX_GUEST_RECENT)));
  window.dispatchEvent(new Event("aivira-recently-viewed"));
}

export function removeGuestRecentlyViewed(productId) {
  const rows = readGuestRecentlyViewed().filter(
    (item) => String(item.productId ?? item.id) !== String(productId)
  );
  localStorage.setItem(RECENT_KEY, JSON.stringify(rows));
  window.dispatchEvent(new Event("aivira-recently-viewed"));
}

export function clearGuestRecentlyViewed() {
  localStorage.removeItem(RECENT_KEY);
  window.dispatchEvent(new Event("aivira-recently-viewed"));
}

export function getAnonymousIdForClaim() {
  return localStorage.getItem(ANONYMOUS_KEY);
}
