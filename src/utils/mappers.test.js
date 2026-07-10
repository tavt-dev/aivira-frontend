import { describe, expect, it } from "vitest";
import { normalizeBook, normalizeOrder, pageMeta, pageRows } from "./mappers.js";

describe("pagination mappers", () => {
  it("extracts rows from supported backend page shapes", () => {
    expect(pageRows({ content: [1] })).toEqual([1]);
    expect(pageRows({ data: [2] })).toEqual([2]);
    expect(pageRows({ items: [3] })).toEqual([3]);
    expect(pageRows([4])).toEqual([4]);
  });

  it("normalizes explicit PageResponse metadata", () => {
    expect(
      pageMeta({
        content: ["book"],
        currentPage: 2,
        totalPages: 4,
        pageSize: 10,
        totalElements: 31,
        hasNext: true,
        hasPrevious: true
      })
    ).toEqual({
      currentPage: 2,
      totalPages: 4,
      pageSize: 10,
      totalElements: 31,
      hasNext: true,
      hasPrevious: true
    });
  });

  it("falls back safely for empty or raw array payloads", () => {
    expect(pageMeta(null)).toEqual({
      currentPage: 1,
      totalPages: 1,
      pageSize: 20,
      totalElements: 0,
      hasNext: false,
      hasPrevious: false
    });
    expect(pageMeta(["a", "b"], { page: 1, size: 12 })).toEqual({
      currentPage: 1,
      totalPages: 1,
      pageSize: 12,
      totalElements: 2,
      hasNext: false,
      hasPrevious: false
    });
  });

  it("uses real product rating values without a fake default", () => {
    expect(normalizeBook({ averageRating: 4.25 }).rating).toBe(4.25);
    expect(normalizeBook({}).rating).toBe(0);
  });

  it("normalizes the order preview contract and image aliases", () => {
    const order = normalizeOrder({
      id: 1,
      itemCount: 3,
      previewItem: { productId: 9, productName: "Clean Architecture", imageUrl: "/cover.jpg" }
    });

    expect(order.previewItem).toEqual(
      expect.objectContaining({
        productId: 9,
        productName: "Clean Architecture",
        thumbnailUrl: "/cover.jpg"
      })
    );
    expect(order.itemCount).toBe(3);
  });

  it("keeps a missing order preview empty instead of inventing a product name", () => {
    const order = normalizeOrder({ id: 1, itemCount: 0 });
    expect(order.previewItem).toBeNull();
    expect(order.items).toEqual([]);
  });
});
