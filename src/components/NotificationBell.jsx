import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, CircleAlert, PackageCheck, RefreshCw, Truck, X } from "lucide-react";
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
  streamNotifications
} from "../api/notificationApi.js";
import { getAccessToken } from "../utils/storage.js";

const PAGE_SIZE = 10;
const RECONNECT_DELAY_MS = 3000;

export default function NotificationBell({ admin = false, inverted = false }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const seenIdsRef = useRef(new Set());
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sync = useCallback(async ({ quiet = false } = {}) => {
    if (!getAccessToken()) {
      setItems([]);
      setUnreadCount(0);
      return;
    }
    if (!quiet) setLoading(true);
    try {
      const [page, count] = await Promise.all([
        getNotifications({ page: 1, size: PAGE_SIZE }),
        getUnreadNotificationCount()
      ]);
      const notifications = page?.data || [];
      seenIdsRef.current = new Set(notifications.map((notification) => notification.id));
      setItems(notifications);
      setUnreadCount(Number(count?.unreadCount || 0));
      setError("");
    } catch {
      if (!quiet) setError(t("notifications.loadFailed"));
    } finally {
      if (!quiet) setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    sync({ quiet: true });
    const handleAuth = () => sync({ quiet: true });
    window.addEventListener("aivira-auth", handleAuth);
    return () => window.removeEventListener("aivira-auth", handleAuth);
  }, [sync]);

  useEffect(() => {
    if (!getAccessToken()) return undefined;
    let stopped = false;
    let controller;
    let retryTimer;

    const connect = async () => {
      controller = new AbortController();
      try {
        await streamNotifications({
          signal: controller.signal,
          onNotification: (notification) => {
            if (seenIdsRef.current.has(notification.id)) return;
            seenIdsRef.current.add(notification.id);
            setItems((current) => [notification, ...current.filter((item) => item.id !== notification.id)].slice(0, PAGE_SIZE));
            setUnreadCount((count) => count + (notification.read ? 0 : 1));
          }
        });
      } catch {
        // A REST sync on reconnect restores events missed while offline.
      }
      if (!stopped) {
        retryTimer = window.setTimeout(async () => {
          await sync({ quiet: true });
          connect();
        }, RECONNECT_DELAY_MS);
      }
    };

    connect();
    return () => {
      stopped = true;
      controller?.abort();
      window.clearTimeout(retryTimer);
    };
  }, [sync]);

  useEffect(() => {
    const closeOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const closeEscape = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", closeOutside);
    window.addEventListener("keydown", closeEscape);
    return () => {
      document.removeEventListener("mousedown", closeOutside);
      window.removeEventListener("keydown", closeEscape);
    };
  }, []);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next) await sync();
  }

  async function openNotification(notification) {
    if (!notification.read) {
      try {
        await markNotificationRead(notification.id);
        setItems((current) => current.map((item) => item.id === notification.id ? { ...item, read: true } : item));
        setUnreadCount((count) => Math.max(0, count - 1));
      } catch {
        setError(t("notifications.markReadFailed"));
        return;
      }
    }
    setOpen(false);
    if (notification.actionUrl) navigate(notification.actionUrl);
  }

  async function markAll() {
    try {
      await markAllNotificationsRead();
      setItems((current) => current.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
    } catch {
      setError(t("notifications.markReadFailed"));
    }
  }

  if (!getAccessToken()) return null;

  const buttonClass = admin
    ? "admin-notif-btn"
    : [
        "relative rounded-full p-2 transition-colors hover:bg-slate-500/10",
        inverted ? "text-white" : "text-slate-700"
      ].join(" ");

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        className={buttonClass}
        aria-label={t("notifications.title")}
        aria-expanded={open}
      >
        <Bell className="h-5 w-5" size={admin ? 15 : undefined} />
        {unreadCount > 0 && (
          <span className={admin ? "admin-notif-dot" : "absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-black text-white ring-2 ring-white"}>
            {!admin && (unreadCount > 99 ? "99+" : unreadCount)}
          </span>
        )}
      </button>

      {open && (
        <section className="absolute right-0 top-[calc(100%+12px)] z-[80] w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl shadow-slate-950/20">
          <header className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h2 className="text-sm font-black">{t("notifications.title")}</h2>
              <p className="text-xs font-semibold text-slate-500">
                {t("notifications.unread", { count: unreadCount })}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button type="button" onClick={markAll} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50" title={t("notifications.markAllRead")}>
                  <CheckCheck className="h-4 w-4" />
                </button>
              )}
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label={t("common.close", "Close")}>
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          <div className="max-h-[28rem] overflow-y-auto">
            {loading && <NotificationLoading label={t("common.loading", "Loading...")} />}
            {!loading && error && (
              <button type="button" onClick={() => sync()} className="flex w-full items-center justify-center gap-2 px-4 py-8 text-sm font-bold text-red-600">
                <RefreshCw className="h-4 w-4" /> {error}
              </button>
            )}
            {!loading && !error && items.length === 0 && (
              <div className="px-6 py-12 text-center">
                <Bell className="mx-auto h-8 w-8 text-slate-300" />
                <p className="mt-3 text-sm font-bold text-slate-500">{t("notifications.empty")}</p>
              </div>
            )}
            {!loading && !error && items.map((notification) => (
              <NotificationRow
                key={notification.id}
                notification={notification}
                locale={i18n.language}
                onClick={() => openNotification(notification)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function NotificationRow({ notification, locale, onClick }) {
  const Icon = notificationIcon(notification.type);
  return (
    <button
      type="button"
      onClick={onClick}
      className={["flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-blue-50/60", notification.read ? "bg-white" : "bg-blue-50/35"].join(" ")}
    >
      <span className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-blue-100 text-blue-700">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-start gap-2">
          <strong className="line-clamp-1 flex-1 text-sm text-slate-900">{notification.title}</strong>
          {!notification.read && <span className="mt-1.5 h-2 w-2 flex-none rounded-full bg-blue-600" />}
        </span>
        <span className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{notification.message}</span>
        <time className="mt-1 block text-[11px] font-semibold text-slate-400">{formatTime(notification.createdAt, locale)}</time>
      </span>
    </button>
  );
}

function NotificationLoading({ label }) {
  return <div className="px-6 py-10 text-center text-sm font-semibold text-slate-500">{label}</div>;
}

function notificationIcon(type) {
  if (type === "ORDER_SHIPPING") return Truck;
  if (["ORDER_COMPLETED", "ORDER_CONFIRMED"].includes(type)) return PackageCheck;
  if (["ORDER_CANCELLED", "ORDER_REFUNDED"].includes(type)) return CircleAlert;
  return Bell;
}

function formatTime(value, locale) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale?.startsWith("vi") ? "vi-VN" : "en-US", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}
