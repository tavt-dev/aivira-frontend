import { afterEach, describe, expect, it, vi } from "vitest";
import { createOrderItemReview } from "./reviewApi.js";

describe("createOrderItemReview", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends review JSON and selected files as multipart form data", async () => {
    const image = new File(["image"], "book.jpg", { type: "image/jpeg" });
    const fetchMock = vi.fn(async (_url, options) => {
      expect(options.method).toBe("POST");
      expect(options.headers.has("Content-Type")).toBe(false);
      expect(options.body).toBeInstanceOf(FormData);
      expect(options.body.getAll("images")).toEqual([image]);

      const reviewPart = options.body.get("review");
      expect(reviewPart.type).toBe("application/json");
      expect(JSON.parse(await readBlob(reviewPart))).toEqual({
        rating: 5,
        comment: "Good book quality.",
        images: []
      });

      return new Response(JSON.stringify({ data: { id: 99 } }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const response = await createOrderItemReview(21, 31, {
      rating: 5,
      comment: "Good book quality.",
      files: [image]
    });

    expect(response).toEqual({ id: 99 });
    expect(fetchMock).toHaveBeenCalledOnce();
  });
});

function readBlob(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}
