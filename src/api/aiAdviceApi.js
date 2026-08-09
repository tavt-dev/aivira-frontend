import { query, request } from "./client.js";

export function createAdviceSession(payload) {
  return request("/ai-advice/sessions", { method: "POST", body: payload });
}

export function getAdviceSession(sessionId) {
  return request(`/ai-advice/sessions/${sessionId}`);
}

export function sendAdviceMessage(sessionId, payload) {
  return request(`/ai-advice/sessions/${sessionId}/messages`, { method: "POST", body: payload });
}

export function getAdviceRecommendations(sessionId, messageId, page) {
  return request(`/ai-advice/sessions/${sessionId}/messages/${messageId}/recommendations${query({ page })}`);
}

export function updateAdvicePreferences(sessionId, personalizationEnabled) {
  return request(`/ai-advice/sessions/${sessionId}/preferences`, {
    method: "PATCH",
    body: { personalizationEnabled }
  });
}

export function recordAdviceEvent(sessionId, payload) {
  return request(`/ai-advice/sessions/${sessionId}/events`, { method: "POST", body: payload });
}

export function getAdviceQuota() {
  return request("/ai-advice/quota");
}
