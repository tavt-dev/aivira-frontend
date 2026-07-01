import { screen, waitFor } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import PaymentResultPage from "./PaymentResultPage.jsx";
import { getPaymentGroup } from "../api/paymentApi.js";
import { renderWithProviders, seedAuth } from "../test/render.jsx";

vi.mock("../api/paymentApi.js", () => ({
  getPaymentGroup: vi.fn(() =>
    Promise.resolve({
      paymentCode: "PAY123",
      paymentGroupCode: "PAY123",
      method: "VNPAY",
      status: "SUCCESS",
      amount: 579000
    })
  ),
  retryPayment: vi.fn()
}));

describe("PaymentResultPage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("looks up backend payment group when redirect provides a paymentGroupCode", async () => {
    seedAuth();

    renderPaymentResult("/payment-result?paymentGroupCode=PAY123&method=VNPAY&status=SUCCESS");

    await waitFor(() => expect(getPaymentGroup).toHaveBeenCalledWith("PAY123"));
    expect(await screen.findByText("PAY123")).toBeInTheDocument();
    expect(screen.getAllByText("SUCCESS").length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: /retry payment/i })).not.toBeInTheDocument();
  });

  it("shows provider redirect status without crashing when the user is not logged in", async () => {
    renderPaymentResult("/payment-result?paymentGroupCode=PAY123&method=MOMO&status=SUCCESS");

    expect(await screen.findByText("PAY123")).toBeInTheDocument();
    expect(screen.getAllByText("SUCCESS").length).toBeGreaterThan(0);
    expect(getPaymentGroup).not.toHaveBeenCalled();
  });

  it("shows a readable provider return error", async () => {
    renderPaymentResult("/payment-result?method=VNPAY&status=FAILED&errorCode=PAYMENT-003");

    expect(await screen.findByText(/PAYMENT-003/)).toBeInTheDocument();
    expect(screen.getAllByText("FAILED").length).toBeGreaterThan(0);
  });
});

function renderPaymentResult(route) {
  return renderWithProviders(
    <Routes>
      <Route path="/payment-result" element={<PaymentResultPage />} />
    </Routes>,
    { route }
  );
}
