import { query, request } from "./client.js";

export function getBlogPosts(params = {}, options = {}) {
  return request(`/blog/posts${query(params)}`, { ...options, skipAuth: options.skipAuth ?? true });
}

export function getBlogPost(slug, options = {}) {
  return request(`/blog/posts/${encodeURIComponent(slug)}`, { ...options, skipAuth: options.skipAuth ?? true });
}

export function getBlogCategories(options = {}) {
  return request("/blog/categories", { ...options, skipAuth: options.skipAuth ?? true });
}

export function getAdminBlogPosts(params = {}) {
  return request(`/admin/blog/posts${query(params)}`);
}

export function getAdminBlogPost(id) {
  return request(`/admin/blog/posts/${encodeURIComponent(id)}`);
}

export function createAdminBlogPost(body) {
  return request("/admin/blog/posts", { method: "POST", body });
}

export function updateAdminBlogPost(id, body) {
  return request(`/admin/blog/posts/${encodeURIComponent(id)}`, { method: "PUT", body });
}

export function publishAdminBlogPost(id) {
  return request(`/admin/blog/posts/${encodeURIComponent(id)}/publish`, { method: "PUT" });
}

export function unpublishAdminBlogPost(id) {
  return request(`/admin/blog/posts/${encodeURIComponent(id)}/unpublish`, { method: "PUT" });
}

export function deleteAdminBlogPost(id) {
  return request(`/admin/blog/posts/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function getAdminBlogCategories() {
  return request("/admin/blog/categories");
}

export function createAdminBlogCategory(body) {
  return request("/admin/blog/categories", { method: "POST", body });
}

export function updateAdminBlogCategory(id, body) {
  return request(`/admin/blog/categories/${encodeURIComponent(id)}`, { method: "PUT", body });
}

export function deleteAdminBlogCategory(id) {
  return request(`/admin/blog/categories/${encodeURIComponent(id)}`, { method: "DELETE" });
}

export function uploadAdminBlogCover(id, file, altText = "") {
  return upload(`/admin/blog/posts/${encodeURIComponent(id)}/cover`, file, altText);
}

export function deleteAdminBlogCover(id) {
  return request(`/admin/blog/posts/${encodeURIComponent(id)}/cover`, { method: "DELETE" });
}

export function uploadAdminBlogImage(id, file, altText = "") {
  return upload(`/admin/blog/posts/${encodeURIComponent(id)}/images`, file, altText);
}

export function deleteAdminBlogImage(postId, assetId) {
  return request(`/admin/blog/posts/${encodeURIComponent(postId)}/images/${encodeURIComponent(assetId)}`, {
    method: "DELETE"
  });
}

function upload(path, file, altText) {
  const body = new FormData();
  body.append("file", file);
  if (altText) body.append("altText", altText);
  return request(path, { method: "POST", body });
}
