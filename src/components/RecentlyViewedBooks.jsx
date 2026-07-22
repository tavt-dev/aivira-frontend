import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Clock3, Trash2 } from "lucide-react";

import {
  clearRecentlyViewed,
  getRecentlyViewed,
  removeRecentlyViewed
} from "../api/viewHistoryApi.js";
import { useConfirm } from "./ui/index.jsx";
import { formatVND } from "../utils/formatters.js";
import { normalizeBook, pageMeta, pageRows } from "../utils/mappers.js";
import { getAccessToken } from "../utils/storage.js";
import {
  clearGuestRecentlyViewed,
  readGuestRecentlyViewed,
  removeGuestRecentlyViewed
} from "../utils/viewerIdentity.js";

export default function RecentlyViewedBooks({ manage = false, limit = 8 }) {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const authenticated = Boolean(getAccessToken());

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (authenticated) {
        const payload = await getRecentlyViewed({ page, size: manage ? 20 : limit });
        setRows(pageRows(payload).map((item) => ({ ...item, book: normalizeBook(item.product) })));
        setMeta(pageMeta(payload));
      } else {
        setRows(readGuestRecentlyViewed().slice(0, limit).map((book) => ({ book: normalizeBook(book) })));
        setMeta({ totalPages: 1 });
      }
    } catch (requestError) {
      setError(requestError.message || t("recentlyViewed.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [authenticated, limit, manage, page, t]);

  useEffect(() => {
    load();
    window.addEventListener("aivira-recently-viewed", load);
    window.addEventListener("aivira-auth", load);
    return () => {
      window.removeEventListener("aivira-recently-viewed", load);
      window.removeEventListener("aivira-auth", load);
    };
  }, [load]);

  async function remove(item) {
    const productId = item.book.productId ?? item.book.id;
    if (authenticated) await removeRecentlyViewed(productId);
    else removeGuestRecentlyViewed(productId);
    await load();
  }

  async function clear() {
    const accepted = await confirm({
      title: t("recentlyViewed.clearTitle"),
      message: t("recentlyViewed.clearConfirm"),
      confirmLabel: t("recentlyViewed.clear"),
      cancelLabel: t("common.cancel"),
      danger: true
    });
    if (!accepted) return;
    if (authenticated) await clearRecentlyViewed();
    else clearGuestRecentlyViewed();
    setPage(1);
    await load();
  }

  if (!loading && !error && rows.length === 0 && !manage) return null;

  return (
    <section className="bg-[#f8f6f1] px-4 py-16 dark:bg-[#060f20] md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-blue-600 dark:text-blue-400">
              <Clock3 size={15} /> {t("recentlyViewed.eyebrow")}
            </p>
            <h2 className="mt-3 font-serif text-3xl font-black text-slate-950 dark:text-white md:text-4xl">
              {t("recentlyViewed.title")}
            </h2>
          </div>
          {manage && rows.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10"
            >
              <Trash2 size={15} /> {t("recentlyViewed.clear")}
            </button>
          )}
        </div>

        {loading && <div className="h-64 animate-pulse rounded-3xl bg-slate-200 dark:bg-white/5" />}
        {!loading && error && <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">{error}</div>}
        {!loading && !error && rows.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-white/10">
            {t("recentlyViewed.empty")}
          </div>
        )}
        {!loading && !error && rows.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
            {rows.map((item) => (
              <article key={item.book.slug} className="group relative min-w-0">
                <Link to={`/product/${item.book.slug}`} state={{ viewSource: "RECOMMENDATION" }}>
                  <div className="aspect-[2/3] overflow-hidden rounded-2xl bg-slate-200 shadow-sm">
                    <img
                      src={item.book.image}
                      alt={item.book.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="mt-3 line-clamp-2 text-sm font-bold text-slate-900 dark:text-white">{item.book.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{item.book.author}</p>
                  <p className="mt-1 text-sm font-black text-blue-600 dark:text-blue-400">{formatVND(item.book.price)}</p>
                </Link>
                {manage && (
                  <button
                    type="button"
                    onClick={() => remove(item)}
                    aria-label={t("recentlyViewed.remove")}
                    className="absolute right-2 top-2 rounded-full bg-white/90 p-2 text-red-600 shadow hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </article>
            ))}
          </div>
        )}

        {manage && meta.totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-3">
            <button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border px-4 py-2 disabled:opacity-40">
              {t("recentlyViewed.previous")}
            </button>
            <span className="px-3 py-2 text-sm text-slate-500">{page}/{meta.totalPages}</span>
            <button disabled={page >= meta.totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border px-4 py-2 disabled:opacity-40">
              {t("recentlyViewed.next")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
