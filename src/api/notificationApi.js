import { query, request } from "./client.js";
import { getAccessToken } from "../utils/storage.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1";

export function getNotifications(params = {}) {
  return request(`/notifications${query(params)}`);
}

export function getUnreadNotificationCount() {
  return request("/notifications/unread-count");
}

export function markNotificationRead(notificationId) {
  return request(`/notifications/${notificationId}/read`, { method: "PATCH" });
}

export function markAllNotificationsRead() {
  return request("/notifications/read-all", { method: "PATCH" });
}

export async function streamNotifications({ signal, onNotification }) {
  const token = getAccessToken();
  if (!token) return;

  const response = await fetch(`${API_BASE_URL}/notifications/stream`, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "text/event-stream",
      Authorization: `Bearer ${token}`
    },
    signal
  });

  if (!response.ok) {
    const error = new Error(`Notification stream failed (${response.status})`);
    error.status = response.status;
    throw error;
  }

  if (!response.body) return;
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (!signal.aborted) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");

    let boundary = buffer.indexOf("\n\n");
    while (boundary >= 0) {
      const block = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      dispatchSseBlock(block, onNotification);
      boundary = buffer.indexOf("\n\n");
    }
  }
}

function dispatchSseBlock(block, onNotification) {
  let eventName = "message";
  const dataLines = [];

  block.split("\n").forEach((line) => {
    if (line.startsWith("event:")) eventName = line.slice(6).trim();
    if (line.startsWith("data:")) dataLines.push(line.slice(5).trimStart());
  });

  if (eventName !== "notification.created" || dataLines.length === 0) return;
  try {
    onNotification?.(JSON.parse(dataLines.join("\n")));
  } catch {
    // Ignore malformed events; the next REST sync restores canonical state.
  }
}
