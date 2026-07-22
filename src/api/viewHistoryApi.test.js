import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./client.js", () => ({
  request: vi.fn(),
  query: (params) => `?page=${params.page}&size=${params.size}`
}));

import { request } from "./client.js";
import { claimAnonymousHistory, getRecentlyViewed, trackProductView } from "./viewHistoryApi.js";

describe("viewHistoryApi", () => {
  beforeEach(() => vi.clearAllMocks());

  it("tracks a product view without disabling optional authentication", () => {
    const body = { anonymousId: "visitor", source: "DIRECT" };
    trackProductView("clean-code", body);
    expect(request).toHaveBeenCalledWith("/products/clean-code/views", {
      method: "POST",
      body,
      skipRefresh: true
    });
  });

  it("loads and claims current-user history", () => {
    getRecentlyViewed({ page: 2, size: 20 });
    claimAnonymousHistory("visitor");
    expect(request).toHaveBeenCalledWith("/users/me/recently-viewed?page=2&size=20");
    expect(request).toHaveBeenCalledWith("/users/me/recently-viewed/claim", {
      method: "POST",
      body: { anonymousId: "visitor" }
    });
  });
});
