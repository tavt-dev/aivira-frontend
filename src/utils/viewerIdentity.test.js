import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  clearGuestRecentlyViewed,
  getViewerIdentity,
  readGuestRecentlyViewed,
  rememberGuestProduct
} from "./viewerIdentity.js";

describe("viewerIdentity", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.stubGlobal("crypto", {
      randomUUID: vi
        .fn()
        .mockReturnValueOnce("11111111-1111-4111-8111-111111111111")
        .mockReturnValueOnce("22222222-2222-4222-8222-222222222222")
    });
  });

  it("creates and reuses anonymous and active session identities", () => {
    const first = getViewerIdentity(1000);
    const second = getViewerIdentity(2000);

    expect(first).toEqual({
      anonymousId: "11111111-1111-4111-8111-111111111111",
      sessionId: "22222222-2222-4222-8222-222222222222"
    });
    expect(second).toEqual(first);
  });

  it("keeps the newest guest product first without duplicates", () => {
    rememberGuestProduct({ id: 1, slug: "clean-code", title: "Clean Code" });
    rememberGuestProduct({ id: 1, slug: "clean-code", title: "Clean Code updated" });

    expect(readGuestRecentlyViewed()).toHaveLength(1);
    expect(readGuestRecentlyViewed()[0].title).toBe("Clean Code updated");
    clearGuestRecentlyViewed();
    expect(readGuestRecentlyViewed()).toEqual([]);
  });
});
