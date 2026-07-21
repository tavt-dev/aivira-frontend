import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./client.js", () => ({
  query: (params) => {
    const value = new URLSearchParams(params).toString();
    return value ? `?${value}` : "";
  },
  request: vi.fn()
}));

import { request } from "./client.js";
import { getBlogPosts, publishAdminBlogPost, uploadAdminBlogCover } from "./blogApi.js";

describe("blogApi", () => {
  beforeEach(() => request.mockReset());

  it("loads public posts without authentication", () => {
    getBlogPosts({ page: 2, categorySlug: "news" });
    expect(request).toHaveBeenCalledWith("/blog/posts?page=2&categorySlug=news", { skipAuth: true });
  });

  it("publishes a post through the admin endpoint", () => {
    publishAdminBlogPost(12);
    expect(request).toHaveBeenCalledWith("/admin/blog/posts/12/publish", { method: "PUT" });
  });

  it("uploads a cover as multipart data", () => {
    const file = new File(["cover"], "cover.jpg", { type: "image/jpeg" });
    uploadAdminBlogCover(7, file, "Cover alt");
    const [, options] = request.mock.calls[0];
    expect(options.method).toBe("POST");
    expect(options.body.get("file")).toBe(file);
    expect(options.body.get("altText")).toBe("Cover alt");
  });
});
