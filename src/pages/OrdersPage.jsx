import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertCircle,
  ArrowRight,
  Box,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  Filter,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  ShoppingBag,
  Star,
  Tag,
  Truck,
  User,
  X,
  XCircle,
  RotateCcw,
  Receipt,
  BadgeCheck
} from "lucide-react";

import { cancelOrder, getOrder, getOrders } from "../api/orderApi.js";
import { getPaymentGroup, retryPayment } from "../api/paymentApi.js";
import { createOrderItemReview } from "../api/reviewApi.js";
import ReviewForm from "../components/reviews/ReviewForm.jsx";
import { formatDateTime, formatVND } from "../utils/formatters.js";
import { normalizeOrder, normalizePaymentGroup, pageMeta as readPageMeta, pageRows } from "../utils/mappers.js";
import { getAccessToken, getCurrentUser } from "../utils/storage.js";
import { getTheme } from "../utils/theme.js";

/* ── Constants ─────────────────────────────── */
const ORDER_STATUSES = [
  "PENDING_CONFIRMATION",
  "PENDING_PAYMENT",
  "PAID",
  "CONFIRMED",
  "PACKING",
  "SHIPPING",
  "COMPLETED",
  "CANCELLED",
  "PAYMENT_FAILED",
  "EXPIRED",
  "REFUNDED"
];
const PAGE_SIZE_OPTIONS = [10, 20, 50];
const CANCELABLE_STATUSES = new Set(["PENDING_CONFIRMATION", "PENDING_PAYMENT"]);
const CONTINUE_PAYMENT_STATUSES = new Set(["PENDING"]);
const RETRY_PAYMENT_STATUSES = new Set(["FAILED", "CANCELLED", "EXPIRED"]);
const ONLINE_METHODS = new Set(["VNPAY", "MOMO"]);
const REVIEWED_ITEMS_CACHE_PREFIX = "aivira_reviewed_order_items";

/* ── Status palette ──────────────────────────*/
const STATUS_META = {
  PENDING_CONFIRMATION: { color: "#f0a500", bg: "rgba(240,165,0,0.14)", border: "rgba(240,165,0,0.35)", Icon: Clock },
  PENDING_PAYMENT: { color: "#f0a500", bg: "rgba(240,165,0,0.14)", border: "rgba(240,165,0,0.35)", Icon: CreditCard },
  PAID: { color: "#10d98a", bg: "rgba(16,217,138,0.12)", border: "rgba(16,217,138,0.35)", Icon: CheckCircle2 },
  CONFIRMED: { color: "#4f6ef7", bg: "rgba(79,110,247,0.14)", border: "rgba(79,110,247,0.35)", Icon: BadgeCheck },
  PACKING: { color: "#a78bfa", bg: "rgba(167,139,250,0.14)", border: "rgba(167,139,250,0.35)", Icon: Package },
  SHIPPING: { color: "#38bdf8", bg: "rgba(56,189,248,0.14)", border: "rgba(56,189,248,0.35)", Icon: Truck },
  COMPLETED: { color: "#10d98a", bg: "rgba(16,217,138,0.12)", border: "rgba(16,217,138,0.35)", Icon: CheckCircle2 },
  CANCELLED: { color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.35)", Icon: XCircle },
  PAYMENT_FAILED: { color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.35)", Icon: AlertCircle },
  EXPIRED: { color: "#64748b", bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.35)", Icon: Clock },
  REFUNDED: { color: "#a78bfa", bg: "rgba(167,139,250,0.14)", border: "rgba(167,139,250,0.35)", Icon: RotateCcw }
};

/* ── Token system ───────────────────────────── */
function tokens(isDark) {
  if (isDark)
    return {
      pageBg: "radial-gradient(ellipse at 60% 0%,rgba(30,24,80,0.9) 0%,#07091a 55%)",
      surface1: "rgba(10,15,42,0.95)",
      surface2: "rgba(16,22,58,0.88)",
      surface3: "rgba(22,28,70,0.75)",
      heroBg: "linear-gradient(135deg,rgba(12,17,48,0.98) 0%,rgba(8,12,35,0.99) 100%)",
      heroLine: "linear-gradient(90deg,transparent,#4f6ef7 40%,#a78bfa 70%,transparent)",
      border: "rgba(255,255,255,0.075)",
      borderMid: "rgba(255,255,255,0.14)",
      text1: "#e8eeff",
      text2: "#8892b0",
      text3: "#4a5578",
      accent: "#4f6ef7",
      accentGlow: "rgba(79,110,247,0.35)",
      gold: "#f0a500",
      emerald: "#10d98a",
      red: "#ef4444",
      orb1: "rgba(79,110,247,0.25)",
      orb2: "rgba(240,165,0,0.16)",
      orb3: "rgba(167,139,250,0.15)",
      skA: "rgba(255,255,255,0.03)",
      skB: "rgba(79,110,247,0.10)",
      skC: "rgba(167,139,250,0.08)",
      inputBg: "rgba(255,255,255,0.05)"
    };
  return {
    pageBg: "radial-gradient(ellipse at 60% 0%,rgba(210,220,255,0.35) 0%,#f0ede8 55%)",
    surface1: "rgba(255,252,246,0.97)",
    surface2: "rgba(250,247,241,0.92)",
    surface3: "rgba(244,241,234,0.88)",
    heroBg: "linear-gradient(135deg,rgba(15,23,42,0.97) 0%,rgba(22,30,58,0.98) 100%)",
    heroLine: "linear-gradient(90deg,transparent,#6d8fff 40%,#c4b5fd 70%,transparent)",
    border: "rgba(15,23,42,0.10)",
    borderMid: "rgba(15,23,42,0.18)",
    text1: "#0f172a",
    text2: "#334155",
    text3: "#94a3b8",
    accent: "#1d4ed8",
    accentGlow: "rgba(29,78,216,0.22)",
    gold: "#b45309",
    emerald: "#047857",
    red: "#b91c1c",
    orb1: "rgba(79,110,247,0.10)",
    orb2: "rgba(240,165,0,0.08)",
    orb3: "rgba(167,139,250,0.08)",
    skA: "rgba(15,23,42,0.05)",
    skB: "rgba(37,99,235,0.07)",
    skC: "rgba(139,92,246,0.05)",
    inputBg: "rgba(15,23,42,0.06)"
  };
}

function useTheme() {
  const [isDark, setIsDark] = useState(() => getTheme() === "dark");
  useEffect(() => {
    const sync = () => setIsDark(getTheme() === "dark");
    window.addEventListener("aivira-theme", sync);
    return () => window.removeEventListener("aivira-theme", sync);
  }, []);
  return isDark;
}

function reviewCacheKey() {
  const user = getCurrentUser();
  const owner = user?.id || user?.username || user?.email || "guest";
  return `${REVIEWED_ITEMS_CACHE_PREFIX}:${owner}`;
}

function reviewItemKey(orderId, itemId) {
  return `${orderId}:${itemId}`;
}

function readReviewedItemKeys() {
  try {
    const parsed = JSON.parse(localStorage.getItem(reviewCacheKey()) || "[]");
    return Array.isArray(parsed) ? parsed.filter(Boolean).map(String) : [];
  } catch {
    return [];
  }
}

function writeReviewedItemKeys(keys) {
  localStorage.setItem(reviewCacheKey(), JSON.stringify([...new Set(keys.map(String))]));
}

function itemWasReviewed(orderId, item, reviewedItemKeys) {
  return Boolean(item?.reviewed || item?.reviewId || reviewedItemKeys.includes(reviewItemKey(orderId, item?.id)));
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function OrdersPage({ onAuth }) {
  const { t, i18n } = useTranslation();
  const isDark = useTheme();
  const tk = tokens(isDark);

  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [pageMeta, setPageMeta] = useState(emptyMeta());
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewBusy, setReviewBusy] = useState(false);
  const [reviewedItemKeys, setReviewedItemKeys] = useState(readReviewedItemKeys);
  const [paymentAction, setPaymentAction] = useState(null);
  const [message, setMessage] = useState("");
  const [msgSuccess, setMsgSuccess] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [paymentBusy, setPaymentBusy] = useState("");
  const [retryTick, setRetryTick] = useState(0);

  const filters = useMemo(() => readFilters(searchParams), [searchParams]);
  const loggedIn = Boolean(getAccessToken());

  useEffect(() => {
    setReviewedItemKeys(readReviewedItemKeys());
  }, [loggedIn]);

  useEffect(() => {
    if (!loggedIn) return;
    setLoading(true);
    setLoadError(false);
    getOrders({ status: filters.status || undefined, page: filters.page, size: filters.size })
      .then((page) => {
        setOrders(pageRows(page).map(normalizeOrder));
        setPageMeta(readPageMeta(page, { page: filters.page, size: filters.size }));
      })
      .catch((err) => {
        console.error("Orders request failed", err);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, [filters.page, filters.size, filters.status, loggedIn, retryTick]);

  function updateFilters(overrides) {
    const next = { ...filters, ...overrides };
    const params = new URLSearchParams();
    if (next.status) params.set("status", next.status);
    if (Number(next.page) > 1) params.set("page", String(next.page));
    if (Number(next.size) !== 20) params.set("size", String(next.size));
    setSearchParams(params, { replace: false });
  }

  async function viewDetail(order) {
    setMessage("");
    setPaymentAction(null);
    setDetailLoading(true);
    try {
      setSelected(normalizeOrder(await getOrder(order.id)));
    } catch (err) {
      setMessage(err.message || t("orders.detailFailed"));
    } finally {
      setDetailLoading(false);
    }
  }

  async function confirmCancel(e) {
    e.preventDefault();
    if (!cancelTarget) return;
    setMessage("");
    try {
      const updated = normalizeOrder(await cancelOrder(cancelTarget.id, cancelReason || t("orders.cancelReason")));
      setOrders((cur) => cur.map((o) => (o.id === updated.id ? updated : o)));
      if (selected?.id === updated.id) setSelected(updated);
      setCancelTarget(null);
      setCancelReason("");
      setMsgSuccess(true);
      setMessage(t("orders.cancelled"));
    } catch (err) {
      setMsgSuccess(false);
      setMessage(err.message || t("orders.cancelFailed"));
    }
  }

  async function retry(order) {
    setMessage("");
    setPaymentAction(null);
    setPaymentBusy(`retry-${order.id}`);
    try {
      const res = normalizePaymentGroup(await retryPayment(order.paymentGroupCode));
      showPaymentAction(res, {
        redirecting: t("orders.retryRedirecting"),
        qrReady: t("orders.retryQrReady"),
        pending: t("orders.retryPending")
      });
    } catch (err) {
      console.error("Retry payment failed", err);
      setMsgSuccess(false);
      setMessage(t("orders.retryFailed", "Không thể tạo lại phiên thanh toán. Vui lòng thử lại."));
    } finally {
      setPaymentBusy("");
    }
  }

  async function continuePayment(order) {
    setMessage("");
    setPaymentAction(null);
    setPaymentBusy(`continue-${order.id}`);
    try {
      const res = normalizePaymentGroup(await getPaymentGroup(order.paymentGroupCode));
      showPaymentAction(res, {
        redirecting: t("orders.continueRedirecting"),
        qrReady: t("orders.continueQrReady"),
        pending: t("orders.continuePending")
      });
    } catch (err) {
      console.error("Continue payment failed", err);
      setMsgSuccess(false);
      setMessage(t("orders.retryFailed", "Không thể tạo lại phiên thanh toán. Vui lòng thử lại."));
    } finally {
      setPaymentBusy("");
    }
  }

  function showPaymentAction(paymentGroup, messages) {
    const url = paymentGroup.paymentUrl || paymentGroup.deeplink;
    if (url) {
      setPaymentAction({ url, qrCodeUrl: "", message: messages.redirecting });
      window.setTimeout(() => window.location.assign(url), 900);
    } else if (paymentGroup.qrCodeUrl) {
      setPaymentAction({ url: "", qrCodeUrl: paymentGroup.qrCodeUrl, message: messages.qrReady });
    } else {
      setPaymentAction({ url: "", qrCodeUrl: "", message: messages.pending });
    }
  }

  async function submitReview(body) {
    if (!reviewTarget) return;
    setReviewBusy(true);
    setMessage("");
    try {
      const review = await createOrderItemReview(reviewTarget.orderId, reviewTarget.item.id, body);
      markItemReviewed(reviewTarget.orderId, reviewTarget.item.id, review?.id);
      setReviewTarget(null);
      setMsgSuccess(true);
      setMessage(t("orders.reviewSubmitted"));
    } catch (err) {
      if (err.errorCode === "REVIEW_ALREADY_EXISTS" || err.status === 409) {
        markItemReviewed(reviewTarget.orderId, reviewTarget.item.id);
        setReviewTarget(null);
        setMsgSuccess(true);
        setMessage(t("orders.reviewSubmitted"));
        return;
      }
      setMsgSuccess(false);
      setMessage(err.message || t("orders.reviewFailed"));
    } finally {
      setReviewBusy(false);
    }
  }

  function markItemReviewed(orderId, itemId, reviewId) {
    const itemKey = reviewItemKey(orderId, itemId);
    const applyReview = (order) => {
      if (!order || String(order.id) !== String(orderId)) return order;
      return {
        ...order,
        items: (order.items || []).map((item) =>
          String(item.id) === String(itemId) ? { ...item, reviewed: true, reviewId: reviewId ?? item.reviewId } : item
        )
      };
    };

    setOrders((cur) => cur.map(applyReview));
    setSelected((cur) => applyReview(cur));
    setReviewedItemKeys((cur) => {
      if (cur.includes(itemKey)) return cur;
      const next = [...cur, itemKey];
      writeReviewedItemKeys(next);
      return next;
    });
  }

  return (
    <div className="relative w-full overflow-hidden" style={{ background: tk.pageBg, minHeight: "100vh" }}>
      {/* Dot-grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle,${isDark ? "rgba(79,110,247,0.10)" : "rgba(37,99,235,0.06)"} 1px,transparent 1px)`,
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at 50% 0%,black 0%,transparent 65%)"
        }}
      />
      {/* Orbs */}
      <div
        className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full"
        style={{ background: `radial-gradient(circle,${tk.orb1} 0%,transparent 70%)`, filter: "blur(80px)" }}
      />
      <div
        className="pointer-events-none absolute -left-32 top-[40%] h-[400px] w-[400px] rounded-full"
        style={{ background: `radial-gradient(circle,${tk.orb2} 0%,transparent 70%)`, filter: "blur(90px)" }}
      />
      <div
        className="pointer-events-none absolute bottom-[18%] right-[22%] h-[320px] w-[320px] rounded-full"
        style={{ background: `radial-gradient(circle,${tk.orb3} 0%,transparent 70%)`, filter: "blur(80px)" }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-20 md:px-8">
        {/* Hero bar */}
        <OrdersHeroBar tk={tk} isDark={isDark} t={t} />

        {/* Toast */}
        <AnimatePresence>
          {message && (
            <motion.div
              key="toast"
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6 flex items-center gap-3 rounded-2xl px-5 py-4"
              style={{
                background: msgSuccess ? "rgba(16,217,138,0.12)" : "rgba(239,68,68,0.10)",
                border: `1px solid ${msgSuccess ? "rgba(16,217,138,0.4)" : "rgba(239,68,68,0.4)"}`,
                backdropFilter: "blur(20px)"
              }}
            >
              {msgSuccess ? <CheckCircle2 size={16} color={tk.emerald} /> : <AlertCircle size={16} color={tk.red} />}
              <span className="text-sm font-bold" style={{ color: msgSuccess ? tk.emerald : tk.red }}>
                {message}
              </span>
              <button
                type="button"
                aria-label={t("common.close", "Đóng")}
                onClick={() => setMessage("")}
                className="ml-auto rounded-md p-1 opacity-60 outline-none hover:opacity-100 focus-visible:ring-2 focus-visible:ring-current"
              >
                <X size={14} color={msgSuccess ? tk.emerald : tk.red} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Not logged in */}
        {!loggedIn && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center gap-6 rounded-[28px] px-8 py-20 text-center"
            style={{ background: tk.surface1, border: `1px solid ${tk.border}`, backdropFilter: "blur(24px)" }}
          >
            <div
              className="flex h-20 w-20 items-center justify-center rounded-[24px]"
              style={{
                background: "linear-gradient(135deg,#2a3ecc,#4f6ef7)",
                boxShadow: "0 16px 40px rgba(79,110,247,0.4)"
              }}
            >
              <ShoppingBag size={32} color="#fff" />
            </div>
            <div>
              <h2 className="text-2xl font-black" style={{ color: tk.text1, fontFamily: "var(--f-serif)" }}>
                {t("orders.loginRequired")}
              </h2>
              <p className="mt-2 text-sm" style={{ color: tk.text2 }}>
                {t("orders.loginToContinue", "Đăng nhập để xem lịch sử đơn hàng")}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={onAuth}
              className="rounded-full px-8 py-4 text-sm font-black uppercase tracking-wider text-white"
              style={{
                background: "linear-gradient(135deg,#2a3ecc,#4f6ef7)",
                boxShadow: "0 8px 28px rgba(79,110,247,0.45)"
              }}
            >
              {t("common.login")}
            </motion.button>
          </motion.div>
        )}

        {/* Main content */}
        {loggedIn && (
          <>
            {/* Filter bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6 overflow-hidden rounded-[22px]"
              style={{ background: tk.surface1, border: `1px solid ${tk.border}`, backdropFilter: "blur(24px)" }}
            >
              <div className="flex items-center gap-3 px-5 pt-4">
                <Filter size={15} style={{ color: tk.accent }} />
                <span className="text-sm font-black tracking-normal" style={{ color: tk.text2 }}>
                  {t("orders.filterStatus")}
                </span>
              </div>
              <div className="grid items-end gap-4 p-5 sm:grid-cols-2 lg:grid-cols-[minmax(220px,320px)_180px_auto]">
                <label className="grid gap-2 text-[13px] font-semibold" style={{ color: tk.text2 }}>
                  {t("orders.filterStatus", "Trạng thái")}
                  <PremiumSelect
                    aria-label={t("orders.filterStatus", "Lọc theo trạng thái")}
                    value={filters.status}
                    disabled={loading}
                    tk={tk}
                    isDark={isDark}
                    onChange={(e) => updateFilters({ status: e.target.value, page: 1 })}
                  >
                    <option value="">{t("orders.allStatuses", "Tất cả trạng thái")}</option>
                    {ORDER_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {statusLabel(s, t)}
                      </option>
                    ))}
                  </PremiumSelect>
                </label>
                <label className="grid gap-2 text-[13px] font-semibold" style={{ color: tk.text2 }}>
                  {t("orders.pageSize", "Số đơn mỗi trang")}
                  <PremiumSelect
                    aria-label={t("orders.pageSize", "Số đơn mỗi trang")}
                    value={filters.size}
                    disabled={loading}
                    tk={tk}
                    isDark={isDark}
                    onChange={(e) => updateFilters({ size: Number(e.target.value), page: 1 })}
                  >
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {t("catalog.perPage", { count: n })}
                      </option>
                    ))}
                  </PremiumSelect>
                </label>
                {filters.status && (
                  <button
                    type="button"
                    onClick={() => updateFilters({ status: "", page: 1 })}
                    className="h-[42px] rounded-xl px-4 text-sm font-bold outline-none transition hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500"
                    style={{ color: tk.accent, border: `1px solid ${tk.border}` }}
                  >
                    {t("orders.clearFilters", "Xóa bộ lọc")}
                  </button>
                )}
              </div>
            </motion.div>

            {/* Orders list */}
            {loading ? (
              <OrdersSkeleton tk={tk} isDark={isDark} />
            ) : loadError ? (
              <OrdersErrorState
                tk={tk}
                t={t}
                onRetry={() => setRetryTick((value) => value + 1)}
                onClose={() => setLoadError(false)}
              />
            ) : orders.length === 0 ? (
              <EmptyOrders
                tk={tk}
                isDark={isDark}
                t={t}
                filtered={Boolean(filters.status)}
                onClear={() => updateFilters({ status: "", page: 1 })}
              />
            ) : (
              <div className="grid gap-4">
                <AnimatePresence>
                  {orders.map((order, i) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.45, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <OrderCard
                        order={order}
                        language={i18n.language}
                        tk={tk}
                        isDark={isDark}
                        onCancel={() => {
                          setCancelTarget(order);
                          setCancelReason("");
                        }}
                        onDetail={() => viewDetail(order)}
                        onContinuePayment={() => continuePayment(order)}
                        onRetry={() => retry(order)}
                        paymentBusy={paymentBusy}
                        t={t}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Pagination */}
            {pageMeta.totalPages > 1 && (
              <OrderPagination
                meta={pageMeta}
                filters={filters}
                loading={loading}
                tk={tk}
                updateFilters={updateFilters}
                t={t}
              />
            )}
          </>
        )}
      </div>

      {/* ── Detail Drawer (portal) ── */}
      {createPortal(
        <AnimatePresence>
          {(Boolean(selected) || detailLoading) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 flex"
              style={{ zIndex: 9990, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
              onClick={() => {
                setSelected(null);
                setPaymentAction(null);
              }}
            >
              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="ml-auto flex h-full w-full max-w-[640px] flex-col overflow-hidden"
                style={{ background: tokens(getTheme() === "dark").surface1, backdropFilter: "blur(32px)" }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Drawer header */}
                <div
                  className="relative flex items-center gap-4 border-b px-6 py-5 flex-shrink-0"
                  style={{ borderColor: tokens(getTheme() === "dark").border }}
                >
                  <div
                    className="absolute left-0 right-0 top-0 h-[1.5px]"
                    style={{ background: tokens(getTheme() === "dark").heroLine }}
                  />
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                    style={{ background: "rgba(79,110,247,0.15)", color: "#4f6ef7" }}
                  >
                    <Receipt size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-[0.6rem] font-black uppercase tracking-[0.18em]"
                      style={{ color: tokens(getTheme() === "dark").text3 }}
                    >
                      {t("orders.detail")}
                    </p>
                    <h2
                      className="truncate text-base font-black"
                      style={{ color: tokens(getTheme() === "dark").text1 }}
                    >
                      {selected?.orderCode || selected?.id || t("common.loading")}
                    </h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      setSelected(null);
                      setPaymentAction(null);
                    }}
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full transition-all"
                    style={{
                      background: tokens(getTheme() === "dark").surface2,
                      color: tokens(getTheme() === "dark").text2
                    }}
                  >
                    <X size={18} />
                  </motion.button>
                </div>

                {/* Drawer body */}
                <div className="flex-1 overflow-y-auto px-6 py-6" style={{ scrollbarWidth: "thin" }}>
                  {detailLoading ? (
                    <DrawerSkeleton tk={tokens(getTheme() === "dark")} isDark={getTheme() === "dark"} />
                  ) : selected ? (
                    <OrderDetailContent
                      order={selected}
                      language={getTheme() === "dark" ? "vi" : "vi"}
                      tk={tokens(getTheme() === "dark")}
                      isDark={getTheme() === "dark"}
                      onCancel={() => {
                        setCancelTarget(selected);
                        setCancelReason("");
                      }}
                      onContinuePayment={() => continuePayment(selected)}
                      onRetry={() => retry(selected)}
                      onReview={(item) => setReviewTarget({ orderId: selected.id, item })}
                      paymentAction={paymentAction}
                      reviewedItemKeys={reviewedItemKeys}
                      t={t}
                    />
                  ) : null}
                </div>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ── Cancel Modal (portal) ── */}
      {createPortal(
        <AnimatePresence>
          {Boolean(cancelTarget) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 flex items-center justify-center p-4"
              style={{ zIndex: 9995, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(10px)" }}
              onClick={() => setCancelTarget(null)}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-md overflow-hidden rounded-[28px]"
                style={{
                  background: tokens(getTheme() === "dark").surface1,
                  border: `1px solid rgba(239,68,68,0.3)`,
                  backdropFilter: "blur(28px)",
                  boxShadow: "0 40px 120px rgba(0,0,0,0.55)"
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal top bar */}
                <div
                  className="absolute left-0 right-0 top-0 h-[1.5px]"
                  style={{ background: "linear-gradient(90deg,transparent,#ef4444 40%,#f87171 70%,transparent)" }}
                />
                <div className="p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444" }}
                    >
                      <XCircle size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black" style={{ color: tokens(getTheme() === "dark").text1 }}>
                        {t("orders.cancelOrder")}
                      </h3>
                      <p className="text-xs font-semibold" style={{ color: tokens(getTheme() === "dark").text3 }}>
                        {cancelTarget?.orderCode || cancelTarget?.id}
                      </p>
                    </div>
                  </div>
                  <form onSubmit={confirmCancel} className="grid gap-4">
                    <textarea
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      placeholder={t("orders.cancelReasonPlaceholder")}
                      rows={4}
                      className="w-full resize-none rounded-2xl px-4 py-3 text-sm font-medium outline-none transition-all"
                      style={{
                        background: tokens(getTheme() === "dark").inputBg,
                        border: `1px solid ${tokens(getTheme() === "dark").border}`,
                        color: tokens(getTheme() === "dark").text1,
                        minHeight: "100px"
                      }}
                    />
                    <div className="flex justify-end gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        onClick={() => setCancelTarget(null)}
                        className="rounded-full px-6 py-3 text-sm font-bold"
                        style={{
                          background: tokens(getTheme() === "dark").surface2,
                          border: `1px solid ${tokens(getTheme() === "dark").border}`,
                          color: tokens(getTheme() === "dark").text1
                        }}
                      >
                        {t("common.close")}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02, y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        className="rounded-full px-6 py-3 text-sm font-black text-white"
                        style={{
                          background: "linear-gradient(135deg,#b91c1c,#ef4444)",
                          boxShadow: "0 6px 20px rgba(239,68,68,0.4)"
                        }}
                      >
                        {t("orders.confirmCancel")}
                      </motion.button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* ── Review Modal (portal) ── */}
      {createPortal(
        <AnimatePresence>
          {Boolean(reviewTarget) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 flex items-center justify-center p-4"
              style={{ zIndex: 9995, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(10px)" }}
              onClick={() => setReviewTarget(null)}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-md overflow-hidden rounded-[28px]"
                style={{
                  background: tokens(getTheme() === "dark").surface1,
                  border: `1px solid rgba(79,110,247,0.3)`,
                  backdropFilter: "blur(28px)",
                  boxShadow: "0 40px 120px rgba(0,0,0,0.55)"
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="absolute left-0 right-0 top-0 h-[1.5px]"
                  style={{ background: "linear-gradient(90deg,transparent,#4f6ef7 40%,#a78bfa 70%,transparent)" }}
                />
                <div className="p-6">
                  <div className="mb-5 flex items-center gap-3">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{ background: "rgba(79,110,247,0.15)", color: "#4f6ef7" }}
                    >
                      <Star size={20} />
                    </div>
                    <div>
                      <h3
                        className="text-base font-black leading-tight"
                        style={{ color: tokens(getTheme() === "dark").text1 }}
                      >
                        {reviewTarget
                          ? t("orders.reviewTitle", { book: reviewTarget.item.productName || reviewTarget.item.title })
                          : ""}
                      </h3>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => setReviewTarget(null)}
                      className="ml-auto flex h-8 w-8 items-center justify-center rounded-full"
                      style={{
                        background: tokens(getTheme() === "dark").surface2,
                        color: tokens(getTheme() === "dark").text2
                      }}
                    >
                      <X size={14} />
                    </motion.button>
                  </div>
                  <ReviewForm busy={reviewBusy} onCancel={() => setReviewTarget(null)} onSubmit={submitReview} />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

/* ── Hero bar ──────────────────────────────── */
function OrdersHeroBar({ tk, t }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative mb-6 overflow-hidden rounded-[20px] px-6 py-5 sm:px-7"
      style={{
        background: tk.heroBg,
        border: "1px solid rgba(255,255,255,0.07)"
      }}
    >
      <div className="absolute left-0 right-0 top-0 h-[1.5px]" style={{ background: tk.heroLine }} />
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full"
        style={{ background: "radial-gradient(circle,rgba(79,110,247,0.2) 0%,transparent 70%)" }}
      />
      <div className="relative flex items-center gap-4">
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl"
          style={{
            background: "linear-gradient(135deg,#2a3ecc,#4f6ef7)",
            boxShadow: "0 8px 24px rgba(79,110,247,0.5)"
          }}
        >
          <ShoppingBag size={22} color="#fff" />
        </div>
        <div>
          <h1 className="text-2xl font-bold md:text-[28px]" style={{ color: "#fff" }}>
            {t("orders.title", "Đơn hàng của tôi")}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,.72)" }}>
            {t("orders.heroDescription", "Theo dõi và quản lý các đơn hàng bạn đã đặt")}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Order card ──────────────────────────────── */
function OrderProductPreview({ item, tk, t }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="row-span-2 h-[88px] w-16 overflow-hidden rounded-[9px]" style={{ background: tk.surface2 }}>
      {item?.thumbnailUrl && !failed ? (
        <img
          src={item.thumbnailUrl}
          onError={() => setFailed(true)}
          alt={item.productName || t("orders.bookCover", "Bìa sách")}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <ShoppingBag size={22} style={{ color: tk.text3 }} />
        </div>
      )}
    </div>
  );
}

function OrderStatusBadge({ status, t }) {
  const meta = STATUS_META[status] || STATUS_META.EXPIRED;
  return (
    <span
      className="inline-flex h-7 shrink-0 items-center rounded-full px-3 text-xs font-bold"
      style={{ background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color }}
    >
      {statusLabel(status, t)}
    </span>
  );
}

function OrderCard({ order, language, tk, isDark, onCancel, onDetail, onContinuePayment, onRetry, paymentBusy, t }) {
  const [copied, setCopied] = useState(false);
  const firstItem = order.previewItem || order.items?.[0];
  const itemCount = Number(
    order.itemCount || order.items?.reduce((sum, item) => sum + Number(item.quantity || 1), 0) || 0
  );
  const code = order.orderCode || String(order.id || "");
  const busy = paymentBusy === `retry-${order.id}` || paymentBusy === `continue-${order.id}`;
  const payAction = canRetry(order) ? onRetry : canContinuePayment(order) ? onContinuePayment : null;
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Copy order code failed", error);
    }
  }
  return (
    <motion.article
      whileHover={{ y: -2 }}
      className="rounded-[18px] p-4 sm:p-5"
      style={{ background: tk.surface1, border: `1px solid ${tk.border}` }}
    >
      <div className="grid gap-4 sm:grid-cols-[64px_minmax(0,1fr)] lg:grid-cols-[64px_minmax(0,1fr)_170px]">
        <OrderProductPreview item={firstItem} tk={tk} t={t} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="line-clamp-2 text-[16px] font-bold leading-snug" style={{ color: tk.text1 }}>
                {firstItem?.productName || t("orders.productUnavailable", "Sản phẩm không còn khả dụng")}
              </h2>
              {itemCount > 1 && (
                <p className="mt-1 text-[13px]" style={{ color: tk.text2 }}>
                  +{itemCount - 1} {t("orders.otherProducts", "sản phẩm khác")}
                </p>
              )}
            </div>
            <OrderStatusBadge status={order.orderStatus} t={t} />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-4">
            <MetaItem
              label={t("orders.createdAt")}
              value={
                order.createdAt ? formatDateTime(order.createdAt, language) : t("account.notUpdated", "Chưa cập nhật")
              }
              tk={tk}
            />
            <MetaItem
              label={t("orders.paymentMethod")}
              value={order.paymentMethod || t("account.notUpdated", "Chưa cập nhật")}
              tk={tk}
            />
            <MetaItem label={t("orders.items")} value={`${itemCount} ${t("orders.products", "sản phẩm")}`} tk={tk} />
            <MetaItem label={t("common.total")} value={formatVND(order.totalAmount, language)} tk={tk} highlight />
          </dl>
          <div
            className="mt-4 flex items-center gap-2 border-t pt-3 text-[13px]"
            style={{ borderColor: tk.border, color: tk.text2 }}
          >
            <span>{t("orders.orderCode", "Mã đơn")}:</span>
            <span className="truncate">{code}</span>
            <button
              type="button"
              onClick={copyCode}
              title={copied ? t("orders.codeCopied", "Đã sao chép mã đơn") : t("orders.copyCode", "Sao chép mã đơn")}
              aria-label={t("orders.copyCode", "Sao chép mã đơn")}
              className="rounded-md p-1 outline-none hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <Copy size={14} />
            </button>
            {copied && (
              <span role="status" className="text-xs font-semibold" style={{ color: tk.emerald }}>
                {t("orders.codeCopied", "Đã sao chép mã đơn")}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-1 lg:flex-col">
          {payAction && (
            <button
              type="button"
              disabled={busy}
              onClick={payAction}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              style={{ background: tk.accent }}
            >
              {busy ? <RotateCcw className="animate-spin" size={14} /> : <CreditCard size={14} />}{" "}
              {busy
                ? t("orders.processing", "Đang xử lý...")
                : canRetry(order)
                  ? t("orders.retryPayment")
                  : t("orders.continuePayment")}
            </button>
          )}
          <button
            type="button"
            aria-label={t("orders.detail")}
            onClick={onDetail}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            style={{
              background: isDark ? "rgba(79,110,247,.15)" : "rgba(29,78,216,.1)",
              border: `1px solid ${tk.border}`,
              color: tk.accent
            }}
          >
            {t("orders.viewDetail", "Xem chi tiết")}
            <ChevronRight size={13} />
          </button>
          {canCancel(order) && (
            <button
              type="button"
              onClick={onCancel}
              className="flex flex-1 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold"
              style={{ background: "rgba(239,68,68,.1)", color: tk.red }}
            >
              {t("common.cancel")}
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}

/* ── Meta item ─────────────────────────────── */
function MetaItem({ icon: Icon, label, value, tk, highlight }) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-[12px] font-medium" style={{ color: tk.text2 }}>
        {Icon && <Icon size={11} style={{ color: tk.accent }} />} {label}
      </dt>
      <dd
        className={`mt-1 ${highlight ? "text-[15px] font-bold" : "text-sm font-semibold"}`}
        style={{ color: highlight ? tk.accent : tk.text1 }}
      >
        {value}
      </dd>
    </div>
  );
}

/* ── Order detail content (inside drawer) ─── */
function OrderDetailContent({
  order,
  language,
  tk,
  isDark,
  onCancel,
  onContinuePayment,
  onRetry,
  onReview,
  paymentAction,
  reviewedItemKeys,
  t
}) {
  return (
    <div className="grid gap-6">
      {/* Status strip */}
      <div className="flex flex-wrap gap-2">
        {[order.orderStatus, order.paymentStatus].filter(Boolean).map((s, i) => {
          const meta = STATUS_META[s] || STATUS_META["EXPIRED"];
          const { Icon: SI } = meta;
          return (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider"
              style={{ background: meta.bg, border: `1px solid ${meta.border}`, color: meta.color }}
            >
              <SI size={12} />
              {statusLabel(s, t)}
            </span>
          );
        })}
      </div>

      {/* Payment + Shipping cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <DetailCard title={t("orders.payment")} icon={CreditCard} tk={tk} isDark={isDark}>
          <DetailRow icon={CreditCard} label={t("orders.paymentMethod")} value={order.paymentMethod || "-"} tk={tk} />
          <DetailRow icon={CheckCircle2} label={t("orders.paymentStatus")} value={order.paymentStatus || "-"} tk={tk} />
          <DetailRow icon={Tag} label={t("orders.paymentGroup")} value={order.paymentGroupCode || "-"} tk={tk} />
          <DetailRow
            icon={Calendar}
            label={t("orders.paidAt")}
            value={formatDateTime(order.paidAt, language)}
            tk={tk}
          />
        </DetailCard>
        <DetailCard title={t("orders.shipping")} icon={Truck} tk={tk} isDark={isDark}>
          <DetailRow
            icon={User}
            label={t("checkout.recipientName")}
            value={order.shippingRecipientName || "-"}
            tk={tk}
          />
          <DetailRow icon={Phone} label={t("checkout.phoneNumber")} value={order.shippingPhoneNumber || "-"} tk={tk} />
          <DetailRow icon={MapPin} label={t("checkout.addressLine")} value={shippingAddress(order) || "-"} tk={tk} />
        </DetailCard>
      </div>

      {/* Order items */}
      <div>
        <p className="mb-3 text-[0.6rem] font-black uppercase tracking-[0.18em]" style={{ color: tk.text3 }}>
          {t("orders.items", "Sản phẩm")}
        </p>
        <div className="grid gap-3">
          {(order.items || []).map((item, i) => {
            const reviewed = itemWasReviewed(order.id, item, reviewedItemKeys);
            return (
              <motion.div
                key={item.id || item.productId || item.productName}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="overflow-hidden rounded-2xl"
                style={{ background: tk.surface2, border: `1px solid ${tk.border}` }}
              >
                <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{ background: isDark ? "rgba(79,110,247,0.12)" : "rgba(29,78,216,0.08)" }}
                    >
                      <Box size={16} style={{ color: tk.accent }} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold" style={{ color: tk.text1 }}>
                        {item.productName || item.title} <span style={{ color: tk.text3 }}>× {item.quantity}</span>
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {[item.sku, item.variationSize, item.variationColor].filter(Boolean).map((v, j) => (
                          <span
                            key={j}
                            className="rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase"
                            style={{ background: tk.surface3, color: tk.text3 }}
                          >
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <strong className="text-base font-black" style={{ color: tk.text1 }}>
                      {formatVND(item.lineTotal)}
                    </strong>
                    {Number(item.discountAmount || 0) > 0 && (
                      <span className="text-xs font-bold" style={{ color: tk.emerald }}>
                        -{formatVND(item.discountAmount)}
                      </span>
                    )}
                    {order.orderStatus === "COMPLETED" && (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        disabled={reviewed}
                        onClick={() => onReview(item)}
                        className="rounded-full px-4 py-2 text-xs font-black uppercase tracking-wider transition-all"
                        style={
                          reviewed
                            ? {
                                background: isDark ? "rgba(16,217,138,0.10)" : "rgba(4,120,87,0.08)",
                                color: tk.emerald,
                                border: `1px solid ${isDark ? "rgba(16,217,138,0.25)" : "rgba(4,120,87,0.2)"}`
                              }
                            : {
                                background: isDark ? "rgba(79,110,247,0.15)" : "rgba(29,78,216,0.10)",
                                color: tk.accent,
                                border: `1px solid ${isDark ? "rgba(79,110,247,0.35)" : "rgba(29,78,216,0.25)"}`
                              }
                        }
                      >
                        {reviewed ? t("orders.reviewSubmittedShort") : t("orders.writeReview")}
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Payment action / QR */}
      {paymentAction && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="overflow-hidden rounded-2xl p-5 text-center"
          style={{ background: "rgba(79,110,247,0.12)", border: "1px solid rgba(79,110,247,0.3)" }}
        >
          <p className="font-bold" style={{ color: "#93a8ff" }}>
            {paymentAction.message}
          </p>
          {paymentAction.url && (
            <a
              href={paymentAction.url}
              className="mt-4 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-black text-white"
              style={{
                background: "linear-gradient(135deg,#2a3ecc,#4f6ef7)",
                boxShadow: "0 6px 20px rgba(79,110,247,0.45)"
              }}
            >
              {t("checkout.continuePayment")} <ArrowRight size={15} />
            </a>
          )}
          {paymentAction.qrCodeUrl && (
            <img
              className="mx-auto mt-4 max-h-56 rounded-2xl"
              src={paymentAction.qrCodeUrl}
              alt={t("checkout.scanQr")}
            />
          )}
        </motion.div>
      )}

      {/* Refund */}
      {order.refund && (
        <DetailCard title={t("orders.refund")} icon={RotateCcw} tk={tk} isDark={isDark}>
          <DetailRow icon={Tag} label={t("orders.refundCode")} value={order.refund.refundCode || "-"} tk={tk} />
          <DetailRow icon={Receipt} label={t("common.amount")} value={formatVND(order.refund.amount)} tk={tk} />
          <DetailRow icon={CheckCircle2} label={t("orders.refundStatus")} value={order.refund.status || "-"} tk={tk} />
          <DetailRow
            icon={Calendar}
            label={t("orders.refundedAt")}
            value={formatDateTime(order.refund.refundedAt, language)}
            tk={tk}
          />
        </DetailCard>
      )}

      {/* Order summary */}
      <DetailCard title={t("checkout.summary")} icon={Receipt} tk={tk} isDark={isDark}>
        <SummaryRow label={t("checkout.subtotal")} value={formatVND(order.subtotal)} tk={tk} />
        <SummaryRow
          label={t("orders.discount")}
          value={formatVND(-Number(order.discountAmount || 0))}
          tk={tk}
          colored={Number(order.discountAmount || 0) > 0}
        />
        <SummaryRow label={t("checkout.shippingFee")} value={formatVND(order.shippingFee)} tk={tk} />
        <div className="h-px mt-2" style={{ background: tk.border }} />
        <SummaryRow label={t("checkout.finalTotal")} value={formatVND(order.totalAmount)} tk={tk} strong />
        <SummaryRow label={t("orders.createdAt")} value={formatDateTime(order.createdAt, language)} tk={tk} />
      </DetailCard>

      {/* Actions */}
      <div className="flex flex-wrap justify-end gap-2 pt-2">
        {canContinuePayment(order) && (
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={onContinuePayment}
            className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-black text-white"
            style={{
              background: "linear-gradient(135deg,#2a3ecc,#4f6ef7)",
              boxShadow: "0 6px 20px rgba(79,110,247,0.4)"
            }}
          >
            <CreditCard size={14} />
            {t("orders.continuePayment")}
          </motion.button>
        )}
        {canRetry(order) && (
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={onRetry}
            className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-black"
            style={{ background: "rgba(240,165,0,0.12)", border: "1px solid rgba(240,165,0,0.3)", color: "#f0a500" }}
          >
            <RefreshCw size={14} />
            {t("orders.retryPayment")}
          </motion.button>
        )}
        {canCancel(order) && (
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-black text-white"
            style={{
              background: "linear-gradient(135deg,#b91c1c,#ef4444)",
              boxShadow: "0 6px 20px rgba(239,68,68,0.4)"
            }}
          >
            <XCircle size={14} />
            {t("common.cancel")}
          </motion.button>
        )}
      </div>
    </div>
  );
}

/* ── Detail card ───────────────────────────── */
function DetailCard({ title, icon: Icon, children, tk }) {
  return (
    <div className="overflow-hidden rounded-2xl" style={{ background: tk.surface2, border: `1px solid ${tk.border}` }}>
      <div className="flex items-center gap-3 border-b px-5 py-4" style={{ borderColor: tk.border }}>
        <Icon size={14} style={{ color: tk.accent }} />
        <h3 className="text-xs font-black uppercase tracking-wider" style={{ color: tk.text1 }}>
          {title}
        </h3>
      </div>
      <div className="grid gap-3 p-5">{children}</div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, tk }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={13} style={{ color: tk.accent, marginTop: 2, flexShrink: 0 }} />
      <div>
        <dt className="text-[0.6rem] font-black uppercase tracking-[0.14em]" style={{ color: tk.text3 }}>
          {label}
        </dt>
        <dd className="mt-0.5 text-sm font-semibold break-all" style={{ color: tk.text1 }}>
          {value}
        </dd>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, tk, strong, colored }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm" style={{ color: tk.text2 }}>
        {label}
      </span>
      <span
        className={strong ? "text-base font-black" : "text-sm font-semibold"}
        style={{ color: colored ? tk.emerald : strong ? tk.text1 : tk.text2 }}
      >
        {value}
      </span>
    </div>
  );
}

/* ── Premium select ────────────────────────── */
function PremiumSelect({ children, value, onChange, disabled, tk, isDark: _isDark, ...props }) {
  return (
    <select
      {...props}
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={{
        background: tk.inputBg,
        border: `1px solid ${tk.border}`,
        color: tk.text1,
        borderRadius: "12px",
        padding: "10px 16px",
        fontSize: "0.875rem",
        fontWeight: 700,
        outline: "none",
        width: "100%",
        backdropFilter: "blur(12px)",
        opacity: disabled ? 0.5 : 1
      }}
    >
      {children}
    </select>
  );
}

/* ── Empty state ───────────────────────────── */
function OrdersErrorState({ t, onRetry, onClose }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800"
    >
      <AlertCircle size={19} />
      <p className="min-w-[220px] flex-1 text-sm font-semibold">
        {t("orders.loadFailed", "Không thể tải danh sách đơn hàng. Vui lòng thử lại.")}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-bold"
      >
        {t("common.retry", "Thử lại")}
      </button>
      <button type="button" onClick={onClose} aria-label={t("common.close", "Đóng")} className="rounded-lg p-2">
        <X size={17} />
      </button>
    </div>
  );
}

function OrderPagination({ meta, filters, loading, tk, updateFilters, t }) {
  const start = Math.max(1, Math.min(Math.max(1, meta.totalPages - 4), filters.page - 2));
  const pages = Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => start + i);
  const change = (page) => {
    updateFilters({ page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const from = (meta.currentPage - 1) * filters.size + 1,
    to = Math.min(meta.currentPage * filters.size, meta.totalElements || meta.currentPage * filters.size);
  return (
    <nav
      aria-label={t("orders.pagination", "Phân trang đơn hàng")}
      className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl p-4"
      style={{ background: tk.surface1, border: `1px solid ${tk.border}` }}
    >
      <p className="text-sm" style={{ color: tk.text2 }}>
        {from}–{to} / {meta.totalElements || to} {t("orders.orders", "đơn hàng")}
      </p>
      <div className="flex gap-1">
        <button
          aria-label={t("catalog.previousPage")}
          disabled={!meta.hasPrevious || loading}
          onClick={() => change(filters.page - 1)}
          className="grid h-9 w-9 place-items-center rounded-lg disabled:opacity-40"
          style={{ border: `1px solid ${tk.border}` }}
        >
          <ChevronLeft size={16} />
        </button>
        {pages.map((page) => (
          <button
            key={page}
            aria-current={page === filters.page ? "page" : undefined}
            onClick={() => change(page)}
            className="h-9 min-w-9 rounded-lg px-2 text-sm font-bold"
            style={{
              background: page === filters.page ? tk.accent : "transparent",
              color: page === filters.page ? "white" : tk.text1
            }}
          >
            {page}
          </button>
        ))}
        <button
          aria-label={t("catalog.nextPage")}
          disabled={!meta.hasNext || loading}
          onClick={() => change(filters.page + 1)}
          className="grid h-9 w-9 place-items-center rounded-lg disabled:opacity-40"
          style={{ border: `1px solid ${tk.border}` }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}

function EmptyOrders({ tk, isDark, t, filtered, onClear }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center gap-5 rounded-[28px] px-8 py-20 text-center"
      style={{ background: tk.surface1, border: `1px dashed ${tk.border}`, backdropFilter: "blur(20px)" }}
    >
      <div
        className="flex h-20 w-20 items-center justify-center rounded-[24px]"
        style={{ background: isDark ? "rgba(79,110,247,0.12)" : "rgba(29,78,216,0.08)" }}
      >
        <ShoppingBag size={32} style={{ color: tk.accent }} />
      </div>
      <div>
        <h3 className="text-2xl font-black" style={{ color: tk.text1, fontFamily: "var(--f-serif)" }}>
          {filtered
            ? t("orders.noMatches", "Không tìm thấy đơn hàng phù hợp")
            : t("orders.empty", "Bạn chưa có đơn hàng nào")}
        </h3>
        <p className="mt-2 text-sm" style={{ color: tk.text3 }}>
          {filtered
            ? t("orders.noMatchesSub", "Hãy thử thay đổi trạng thái.")
            : t("orders.emptySub", "Khám phá các đầu sách phù hợp và bắt đầu mua sắm.")}
        </p>
      </div>
      {filtered ? (
        <button
          type="button"
          onClick={onClear}
          className="rounded-xl px-5 py-3 text-sm font-bold text-white"
          style={{ background: tk.accent }}
        >
          {t("orders.clearFilters", "Xóa bộ lọc")}
        </button>
      ) : (
        <Link
          to="/category"
          className="rounded-xl px-5 py-3 text-sm font-bold text-white"
          style={{ background: tk.accent }}
        >
          {t("orders.exploreBooks", "Khám phá sách")}
        </Link>
      )}
    </motion.div>
  );
}

/* ── Skeletons ─────────────────────────────── */
function OrdersSkeleton({ tk }) {
  const sh = { "--sa": tk.skA, "--sb": tk.skB, "--sc": tk.skC };
  return (
    <div className="grid gap-4" aria-busy="true" aria-label="Loading orders">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          aria-hidden="true"
          className="overflow-hidden rounded-[18px] p-5"
          style={{ background: tk.surface1, border: `1px solid ${tk.border}` }}
        >
          <div className="mb-4 flex items-center gap-4">
            <div
              className="catalog-dynamic-shimmer h-[88px] w-16 rounded-lg"
              style={{ ...sh, animationDelay: `${i * 80}ms` }}
            />
            <div
              className="catalog-dynamic-shimmer h-6 w-40 rounded-full"
              style={{ ...sh, animationDelay: `${i * 80}ms` }}
            />
            <div
              className="catalog-dynamic-shimmer h-6 w-24 rounded-full"
              style={{ ...sh, animationDelay: `${i * 80 + 40}ms` }}
            />
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            {[...Array(4)].map((_, j) => (
              <div
                key={j}
                className="catalog-dynamic-shimmer h-10 rounded-xl"
                style={{ ...sh, animationDelay: `${i * 80 + j * 30}ms` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function DrawerSkeleton({ tk }) {
  const sh = { "--sa": tk.skA, "--sb": tk.skB, "--sc": tk.skC };
  return (
    <div className="grid gap-5">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="catalog-dynamic-shimmer rounded-2xl"
          style={{ ...sh, height: i === 0 ? 48 : i < 3 ? 120 : 80, animationDelay: `${i * 60}ms` }}
        />
      ))}
    </div>
  );
}

/* ── Utils ─────────────────────────────────── */
function canCancel(order) {
  return CANCELABLE_STATUSES.has(order?.orderStatus);
}
function canContinuePayment(order) {
  return (
    ONLINE_METHODS.has(order?.paymentMethod) &&
    CONTINUE_PAYMENT_STATUSES.has(order?.paymentStatus) &&
    Boolean(order?.paymentGroupCode)
  );
}
function canRetry(order) {
  return (
    ONLINE_METHODS.has(order?.paymentMethod) &&
    RETRY_PAYMENT_STATUSES.has(order?.paymentStatus) &&
    Boolean(order?.paymentGroupCode)
  );
}
function statusLabel(s, t) {
  return t(`orders.statusLabels.${s}`, { defaultValue: s || "-" });
}
function shippingAddress(order) {
  return [order.shippingAddressLine, order.shippingWard, order.shippingDistrict, order.shippingCity]
    .filter(Boolean)
    .join(", ");
}
function readFilters(searchParams) {
  return {
    status: searchParams.get("status") || "",
    page: positiveInt(searchParams.get("page"), 1),
    size: positiveInt(searchParams.get("size"), 20)
  };
}
function positiveInt(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}
function emptyMeta() {
  return readPageMeta([], { page: 1, size: 20, totalPages: 0 });
}
