import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import ProductPage from "./ProductPage.jsx";
import i18n from "../i18n.js";
import { apiResponse, book, customerUser, pageResponse, review } from "../test/mockData.js";
import { renderWithProviders, seedAuth } from "../test/render.jsx";
import { server } from "../test/server.js";
import { getStoredCheckoutCartItemIds } from "../utils/checkoutSelection.js";

const API = "http://localhost/api/v1";

describe("ProductPage", () => {
  it("renders book metadata and public reviews from backend data", async () => {
    renderWithProviders(
      <Routes>
        <Route path="/product/:slug" element={<ProductPage onAuth={() => {}} />} />
      </Routes>,
      { route: "/product/clean-architecture" }
    );

    expect(await screen.findByRole("heading", { name: /Clean Architecture/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Robert C\. Martin/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/9780134494166/i)).toBeInTheDocument();
    expect(screen.getByText(/Prentice Hall/i)).toBeInTheDocument();
    expect(await screen.findByText(/Clear writing and excellent book quality/i)).toBeInTheDocument();
    expect(screen.getByText(/Thanks for reading with Aivira/i)).toBeInTheDocument();
  });

  it("shows every active product image when media type is lowercase", async () => {
    const user = userEvent.setup();
    const backCoverUrl = "https://example.test/clean-architecture-back.jpg";
    server.use(
      http.get(`${API}/products/:slug`, ({ params }) => HttpResponse.json(apiResponse({
        ...book,
        slug: params.slug,
        media: [
          ...book.media.map((item) => ({ ...item, mediaType: "image" })),
          {
            id: 502,
            mediaUrl: backCoverUrl,
            mediaType: "image",
            altText: "Back cover",
            primary: false,
            active: true,
            sortOrder: 1
          }
        ]
      })))
    );

    renderWithProviders(
      <Routes>
        <Route path="/product/:slug" element={<ProductPage onAuth={() => {}} />} />
      </Routes>,
      { route: "/product/clean-architecture" }
    );

    const backCover = await screen.findByRole("img", { name: "Back cover" });
    await user.click(backCover.closest("button"));

    expect(screen.getByRole("button", { name: /Open image gallery/i }).querySelector("img"))
      .toHaveAttribute("src", backCoverUrl);
  });

  it("opens review images in a lightbox and closes with Escape", async () => {
    const user = userEvent.setup();
    const reviewImageUrl = "https://example.test/reviews/reader-photo.jpg";
    server.use(
      http.get(`${API}/products/:slug/reviews`, () => HttpResponse.json(apiResponse(pageResponse([{
        ...review,
        approved: true,
        visible: true,
        images: [{ id: 901, imageUrl:reviewImageUrl, imagePublicId:"reviews/reader-photo", sortOrder:0 }]
      }]))))
    );

    renderWithProviders(
      <Routes>
        <Route path="/product/:slug" element={<ProductPage onAuth={() => {}} />} />
      </Routes>,
      { route: "/product/clean-architecture" }
    );

    await user.click(await screen.findByRole("button", { name: i18n.t("product.openReviewImage", { index:1 }) }));
    const dialog = screen.getByRole("dialog", { name: i18n.t("product.reviewImageAlt", { index:1 }) });
    expect(dialog.querySelector("img")).toHaveAttribute("src", reviewImageUrl);

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog", { name: i18n.t("product.reviewImageAlt", { index:1 }) })).not.toBeInTheDocument());
  });

  it("adds the selected variation and opens checkout with its cart item", async () => {
    seedAuth(customerUser);
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/product/:slug" element={<ProductPage onAuth={() => {}} />} />
        <Route path="/checkout" element={<div>Checkout target</div>} />
      </Routes>,
      { route: "/product/clean-architecture" }
    );

    await screen.findByRole("heading", { name: /Clean Architecture/i });
    await user.click(screen.getByRole("button", { name: i18n.t("product.checkout") }));

    expect(await screen.findByText("Checkout target")).toBeInTheDocument();
    await waitFor(() => expect(getStoredCheckoutCartItemIds()).toEqual([701]));
  });

  it("opens authentication instead of checkout when the reader is logged out", async () => {
    const onAuth = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/product/:slug" element={<ProductPage onAuth={onAuth} />} />
        <Route path="/checkout" element={<div>Checkout target</div>} />
      </Routes>,
      { route: "/product/clean-architecture" }
    );

    await screen.findByRole("heading", { name: /Clean Architecture/i });
    await user.click(screen.getByRole("button", { name: i18n.t("product.checkout") }));

    expect(onAuth).toHaveBeenCalledOnce();
    expect(screen.queryByText("Checkout target")).not.toBeInTheDocument();
    expect(getStoredCheckoutCartItemIds()).toEqual([]);
  });
});
