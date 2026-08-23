import { describe, expect, it } from "vitest";

import { restoreLegacyBlogLinks } from "./BlogPostPage.jsx";

describe("restoreLegacyBlogLinks", () => {
  it("restores product and category links removed by the legacy sanitizer", () => {
    const html = restoreLegacyBlogLinks(
      "<p><a><strong>Clean Code</strong></a></p><p><a>Xem sách Programming →</a></p>",
      [{ productName: "Clean Code", slug: "clean-code" }]
    );

    expect(html).toContain('href="/product/clean-code"');
    expect(html).toContain('href="/category/programming"');
  });
});
