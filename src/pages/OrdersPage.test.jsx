import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";
import OrdersPage from "./OrdersPage.jsx";
import i18n from "../i18n.js";
import { apiResponse, customerUser, order, pageResponse, paymentGroup, review } from "../test/mockData.js";
import { renderWithProviders, seedAuth } from "../test/render.jsx";
import { server } from "../test/server.js";

const API = "http://localhost/api/v1";

describe("OrdersPage payment actions", () => {
  it("renders list preview without requesting order detail", async () => {
    seedAuth(customerUser);
    const detailRequest = vi.fn();
    const summary = {
      ...order,
      items: undefined,
      itemCount: 3,
      previewItem: {
        productId: 10,
        productName: "Clean Architecture",
        thumbnailUrl: "https://example.test/order-cover.jpg"
      }
    };
    server.use(
      http.get(`${API}/orders`, () => HttpResponse.json(apiResponse(pageResponse([summary])))),
      http.get(`${API}/orders/:id`, () => {
        detailRequest();
        return HttpResponse.json(apiResponse(order));
      })
    );

    renderWithProviders(<OrdersPage onAuth={() => {}} />, { route: "/orders" });

    expect(await screen.findByText("Clean Architecture")).toBeInTheDocument();
    expect(screen.getByAltText("Clean Architecture")).toHaveAttribute("src", "https://example.test/order-cover.jpg");
    expect(screen.getByText(/\+2/)).toBeInTheDocument();
    expect(detailRequest).not.toHaveBeenCalled();
  });

  it("continues a pending online payment with the existing payment group", async () => {
    seedAuth(customerUser);
    const user = userEvent.setup();
    const pendingOrder = {
      ...order,
      orderStatus: "PENDING_PAYMENT",
      paymentMethod: "VNPAY",
      paymentStatus: "PENDING"
    };
    const getPaymentGroup = vi.fn();

    server.use(
      http.get(`${API}/orders`, () => HttpResponse.json(apiResponse(pageResponse([pendingOrder])))),
      http.get(`${API}/orders/:id`, () => HttpResponse.json(apiResponse(pendingOrder))),
      http.get(`${API}/payments/groups/:code`, ({ params }) => {
        getPaymentGroup(params.code);
        return HttpResponse.json(
          apiResponse({
            ...paymentGroup,
            paymentUrl: null,
            qrCodeUrl: "https://pay.example.test/qr.png"
          })
        );
      })
    );

    renderWithProviders(<OrdersPage onAuth={() => {}} />, { route: "/orders" });

    await screen.findByText(pendingOrder.orderCode);
    await user.click(screen.getByRole("button", { name: i18n.t("orders.detail") }));
    const continueButtons = await screen.findAllByRole("button", { name: i18n.t("orders.continuePayment") });
    await user.click(continueButtons.at(-1));

    await waitFor(() => expect(getPaymentGroup).toHaveBeenCalledWith(pendingOrder.paymentGroupCode));
    expect(await screen.findByRole("img", { name: i18n.t("checkout.scanQr") })).toHaveAttribute(
      "src",
      "https://pay.example.test/qr.png"
    );
  });

  it("retries failed online payments through the retry endpoint", async () => {
    seedAuth(customerUser);
    const user = userEvent.setup();
    const failedOrder = {
      ...order,
      orderStatus: "PAYMENT_FAILED",
      paymentMethod: "MOMO",
      paymentStatus: "FAILED"
    };
    const retryPayment = vi.fn();

    server.use(
      http.get(`${API}/orders`, () => HttpResponse.json(apiResponse(pageResponse([failedOrder])))),
      http.post(`${API}/payments/groups/:code/retry`, ({ params }) => {
        retryPayment(params.code);
        return HttpResponse.json(apiResponse({ ...paymentGroup, paymentUrl: null, qrCodeUrl: null }));
      })
    );

    renderWithProviders(<OrdersPage onAuth={() => {}} />, { route: "/orders" });

    await screen.findByText(failedOrder.orderCode);
    await user.click(screen.getByRole("button", { name: i18n.t("orders.retryPayment") }));

    await waitFor(() => expect(retryPayment).toHaveBeenCalledWith(failedOrder.paymentGroupCode));
  });

  it("does not offer online payment actions for COD orders", async () => {
    seedAuth(customerUser);
    renderWithProviders(<OrdersPage onAuth={() => {}} />, { route: "/orders" });

    await screen.findByText(order.orderCode);
    expect(screen.queryByRole("button", { name: i18n.t("orders.continuePayment") })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: i18n.t("orders.retryPayment") })).not.toBeInTheDocument();
  });

  it("disables review action for order items already reviewed by the backend", async () => {
    seedAuth(customerUser);
    const user = userEvent.setup();
    const completedOrder = {
      ...order,
      orderStatus: "COMPLETED",
      items: order.items.map((item) => ({ ...item, reviewed: true, reviewId: review.id }))
    };

    server.use(
      http.get(`${API}/orders`, () => HttpResponse.json(apiResponse(pageResponse([completedOrder])))),
      http.get(`${API}/orders/:id`, () => HttpResponse.json(apiResponse(completedOrder)))
    );

    renderWithProviders(<OrdersPage onAuth={() => {}} />, { route: "/orders" });

    await screen.findByText(completedOrder.orderCode);
    await user.click(screen.getByRole("button", { name: i18n.t("orders.detail") }));

    expect(await screen.findByRole("button", { name: i18n.t("orders.reviewSubmittedShort") })).toBeDisabled();
    expect(screen.queryByRole("button", { name: i18n.t("orders.writeReview") })).not.toBeInTheDocument();
  });

  it("marks an order item as reviewed after submit", async () => {
    seedAuth(customerUser);
    const user = userEvent.setup();
    const completedOrder = {
      ...order,
      orderStatus: "COMPLETED",
      items: order.items.map((item) => ({ ...item, reviewed: false, reviewId: null }))
    };
    const createReview = vi.fn();

    server.use(
      http.get(`${API}/orders`, () => HttpResponse.json(apiResponse(pageResponse([completedOrder])))),
      http.get(`${API}/orders/:id`, () => HttpResponse.json(apiResponse(completedOrder))),
      http.post(`${API}/orders/:orderId/items/:orderItemId/review`, async ({ params, request }) => {
        createReview({
          ...params,
          contentType: request.headers.get("content-type")
        });
        return HttpResponse.json(
          apiResponse({ ...review, orderId: Number(params.orderId), orderItemId: Number(params.orderItemId) })
        );
      })
    );

    renderWithProviders(<OrdersPage onAuth={() => {}} />, { route: "/orders" });

    await screen.findByText(completedOrder.orderCode);
    await user.click(screen.getByRole("button", { name: i18n.t("orders.detail") }));
    await user.click(await screen.findByRole("button", { name: i18n.t("orders.writeReview") }));
    await user.type(screen.getByPlaceholderText(i18n.t("product.reviewCommentPlaceholder")), "Good book quality.");
    await user.upload(
      screen.getByLabelText(i18n.t("product.selectReviewImages")),
      new File(["image"], "book.jpg", { type: "image/jpeg" })
    );
    await user.click(screen.getByRole("button", { name: i18n.t("product.submitReview") }));

    await waitFor(() => expect(createReview).toHaveBeenCalled());
    expect(createReview).toHaveBeenCalledWith(
      expect.objectContaining({
        contentType: expect.stringContaining("multipart/form-data")
      })
    );
    expect(await screen.findByRole("button", { name: i18n.t("orders.reviewSubmittedShort") })).toBeDisabled();
    expect(screen.queryByRole("button", { name: i18n.t("orders.writeReview") })).not.toBeInTheDocument();
  });
});
