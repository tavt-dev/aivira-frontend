import { query, request } from "./client.js";

export function trackProductView(slug, body) {
  return request(`/products/${encodeURIComponent(slug)}/views`, {
    method: "POST",
    body,
    skipRefresh: true
  });
}

export function getRecentlyViewed(params = {}) {
  return request(`/users/me/recently-viewed${query(params)}`);
}

export function removeRecentlyViewed(productId) {
  return request(`/users/me/recently-viewed/${encodeURIComponent(productId)}`, { method: "DELETE" });
}

export function clearRecentlyViewed() {
  return request("/users/me/recently-viewed", { method: "DELETE" });
}

export function claimAnonymousHistory(anonymousId) {
  return request("/users/me/recently-viewed/claim", { method: "POST", body: { anonymousId } });
}
