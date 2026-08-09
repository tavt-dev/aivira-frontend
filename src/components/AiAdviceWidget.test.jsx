import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import AiAdviceWidget from "./AiAdviceWidget.jsx";
import { renderWithProviders } from "../test/render.jsx";
import { server } from "../test/server.js";
import { apiResponse, book, customerUser } from "../test/mockData.js";

const API = "http://localhost/api/v1";

describe("AiAdviceWidget", () => {
  it("asks guests to sign in", async () => {
    const onAuth = vi.fn();
    renderWithProviders(<AiAdviceWidget user={null} onAuth={onAuth} />);

    await userEvent.click(screen.getByRole("button", { name: /tư vấn sách bằng ai/i }));
    await userEvent.click(screen.getByRole("button", { name: "Đăng nhập" }));

    expect(onAuth).toHaveBeenCalledOnce();
  });

  it("creates a member session and renders recommended catalog books", async () => {
    server.use(
      http.post(`${API}/ai-advice/sessions`, () =>
        HttpResponse.json(
          apiResponse({
            id: "session-1",
            locale: "vi",
            personalizationEnabled: true,
            messages: [],
            quota: { limit: 30, used: 0, remaining: 30, resetsAt: "2026-09-01T00:00:00Z" }
          })
        )
      ),
      http.post(`${API}/ai-advice/sessions/session-1/messages`, () =>
        HttpResponse.json(
          apiResponse({
            id: 2,
            role: "ASSISTANT",
            content: "Mình tìm thấy một cuốn phù hợp.",
            status: "RECOMMENDATION",
            suggestedPrompts: [],
            quota: { limit: 30, used: 1, remaining: 29, resetsAt: "2026-09-01T00:00:00Z" },
            recommendations: {
              items: [{ id: 10, rank: 1, product: book, reason: "Phù hợp để bắt đầu.", matchedCriteria: ["dễ đọc"] }],
              page: 1,
              pageSize: 10,
              totalElements: 1,
              totalPages: 1,
              hasNext: false
            }
          })
        )
      )
    );

    renderWithProviders(<AiAdviceWidget user={customerUser} onAuth={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: /tư vấn sách bằng ai/i }));
    await screen.findByText(/Bạn đang muốn đọc gì/);
    await userEvent.type(screen.getByPlaceholderText(/Mô tả cuốn sách/), "Sách dễ đọc");
    await userEvent.click(screen.getByRole("button", { name: /Gửi yêu cầu tư vấn/i }));

    await screen.findByText("Mình tìm thấy một cuốn phù hợp.");
    expect(screen.getByText(book.productName)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/Còn 29\/30 lượt/)).toBeInTheDocument());
  });
});
