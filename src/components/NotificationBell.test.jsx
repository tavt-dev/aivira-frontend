import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import NotificationBell from "./NotificationBell.jsx";
import { renderWithProviders, seedAuth } from "../test/render.jsx";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead
} from "../api/notificationApi.js";

vi.mock("../api/notificationApi.js", () => ({
  getNotifications: vi.fn(),
  getUnreadNotificationCount: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  markNotificationRead: vi.fn(),
  streamNotifications: vi.fn(() => new Promise(() => {}))
}));

const notification = {
  id: 10,
  type: "ORDER_SHIPPING",
  title: "Đơn hàng đang được giao",
  message: "Đơn hàng ORD10 đang trên đường giao đến bạn.",
  actionUrl: "/orders/10",
  read: false,
  createdAt: "2026-08-22T08:00:00Z"
};

describe("NotificationBell", () => {
  beforeEach(() => {
    seedAuth();
    getNotifications.mockResolvedValue({ data: [notification] });
    getUnreadNotificationCount.mockResolvedValue({ unreadCount: 1 });
    markNotificationRead.mockResolvedValue({ ...notification, read: true });
    markAllNotificationsRead.mockResolvedValue({ updatedCount: 1 });
  });

  it("loads notifications and marks one as read before navigation", async () => {
    renderWithProviders(<NotificationBell />);

    const bell = await screen.findByRole("button", { name: /thông báo|notifications/i });
    await waitFor(() => expect(getUnreadNotificationCount).toHaveBeenCalled());
    fireEvent.click(bell);

    const row = await screen.findByRole("button", { name: /Đơn hàng đang được giao/i });
    fireEvent.click(row);

    await waitFor(() => expect(markNotificationRead).toHaveBeenCalledWith(10));
  });

  it("marks all loaded notifications as read", async () => {
    renderWithProviders(<NotificationBell />);
    const bell = await screen.findByRole("button", { name: /thông báo|notifications/i });
    fireEvent.click(bell);

    const markAll = await screen.findByTitle(/đánh dấu tất cả|mark all/i);
    fireEvent.click(markAll);

    await waitFor(() => expect(markAllNotificationsRead).toHaveBeenCalled());
  });
});
