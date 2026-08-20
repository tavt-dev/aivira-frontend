import { query, request } from "./client.js";

export function createAdviceSession(payload, options = {}) {
  return request("/ai-advice/sessions", { ...options, method: "POST", body: payload });
}

export function getAdviceSession(sessionId, options = {}) {
  return request(`/ai-advice/sessions/${sessionId}`, options);
}

export function sendAdviceMessage(sessionId, payload, options = {}) {
  return request(`/ai-advice/sessions/${sessionId}/messages`, { ...options, method: "POST", body: payload });
}

export function getAdviceRecommendations(sessionId, messageId, page, options = {}) {
  return request(`/ai-advice/sessions/${sessionId}/messages/${messageId}/recommendations${query({ page })}`, options);
}

export function updateAdvicePreferences(sessionId, personalizationEnabled) {
  return request(`/ai-advice/sessions/${sessionId}/preferences`, {
    method: "PATCH",
    body: { personalizationEnabled }
  });
}

export function recordAdviceEvent(sessionId, payload, options = {}) {
  return request(`/ai-advice/sessions/${sessionId}/events`, { ...options, method: "POST", body: payload });
}

export function getAdviceQuota() {
  return request("/ai-advice/quota");
}
