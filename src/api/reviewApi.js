import { query, request } from "./client.js";

export function getProductReviews(slug, params = {}, options = {}) {
  return request(`/products/${encodeURIComponent(slug)}/reviews${query(params)}`, {
    ...options,
    skipAuth: options.skipAuth ?? true
  });
}

export function createOrderItemReview(orderId, orderItemId, body) {
  const { files = [], ...review } = body;
  const formData = new FormData();
  formData.append("review", new Blob([JSON.stringify({ ...review, images: [] })], { type: "application/json" }));
  files.forEach((file) => formData.append("images", file));

  return request(`/orders/${encodeURIComponent(orderId)}/items/${encodeURIComponent(orderItemId)}/review`, {
    method: "POST",
    body: formData
  });
}

export function updateReview(reviewId, body) {
  return request(`/reviews/${encodeURIComponent(reviewId)}`, { method: "PUT", body });
}

export function deleteReview(reviewId) {
  return request(`/reviews/${encodeURIComponent(reviewId)}`, { method: "DELETE" });
}
