import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, CalendarDays, Newspaper, Search } from "lucide-react";

import { getBlogCategories, getBlogPosts } from "../api/blogApi.js";
import { EmptyState, ErrorState, Pagination, Skeleton } from "../components/ui/index.jsx";
import { formatDateTime } from "../utils/formatters.js";
import { pageMeta, pageRows } from "../utils/mappers.js";

export default function BlogPage() {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [payload, setPayload] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState(searchParams.get("keyword") || "");
  const categorySlug = searchParams.get("categorySlug") || "";
  const page = Number(searchParams.get("page") || 1);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    Promise.all([
      getBlogPosts(
        { keyword: searchParams.get("keyword"), categorySlug, page, size: 9 },
        { signal: controller.signal }
      ),
      getBlogCategories({ signal: controller.signal })
    ])
      .then(([posts, categoryRows]) => {
        setPayload(posts);
        setCategories(categoryRows || []);
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message || t("blog.loadFailed"));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [categorySlug, page, searchParams, t]);

  function updateParams(next) {
    const values = Object.fromEntries(searchParams.entries());
    Object.entries(next).forEach(([key, value]) => {
      if (value) values[key] = String(value);
      else delete values[key];
    });
    setSearchParams(values);
  }

  function submit(event) {
    event.preventDefault();
    updateParams({ keyword: keyword.trim(), page: "" });
  }

  const posts = pageRows(payload);
  const meta = pageMeta(payload, { page, size: 9 });

  return (
    <div className="min-h-screen bg-[#faf8f5] pb-24 pt-24 dark:bg-[#040d1e]">
      <header className="relative overflow-hidden bg-slate-950 px-4 py-20 text-white md:px-8">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-blue-600/25 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-blue-300">
            <Newspaper size={15} /> {t("blog.eyebrow")}
          </span>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl font-black md:text-7xl">{t("blog.title")}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">{t("blog.subtitle")}</p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <form
          onSubmit={submit}
          className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:flex-row"
        >
          <label className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder={t("blog.search")}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-slate-950"
            />
          </label>
          <button className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700" type="submit">
            {t("common.search")}
          </button>
        </form>

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => updateParams({ categorySlug: "", page: "" })}
            className={`rounded-full px-4 py-2 text-sm font-bold ${!categorySlug ? "bg-slate-950 text-white dark:bg-blue-600" : "border border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"}`}
          >
            {t("common.all")}
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => updateParams({ categorySlug: category.slug, page: "" })}
              className={`rounded-full px-4 py-2 text-sm font-bold ${categorySlug === category.slug ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300"}`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="mt-10">
          {loading && <Skeleton rows={6} />}
          {!loading && error && <ErrorState title={t("blog.loadFailed")}>{error}</ErrorState>}
          {!loading && !error && !posts.length && (
            <EmptyState title={t("blog.empty")}>{t("blog.emptyCopy")}</EmptyState>
          )}
          {!loading && !error && posts.length > 0 && (
            <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} language={i18n.language} t={t} />
              ))}
            </div>
          )}
        </div>
        <Pagination loading={loading} meta={meta} onPage={(nextPage) => updateParams({ page: nextPage })} t={t} />
      </main>
    </div>
  );
}

export function BlogCard({ post, language, t }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.04]"
    >
      <div className="aspect-[16/10] overflow-hidden bg-slate-200">
        <img
          src={post.coverUrl}
          alt={post.coverAltText || post.title}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
      </div>
      <div className="p-6">
        <div className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-wider text-blue-600">
          <span>{post.category?.name}</span>
          <span className="inline-flex items-center gap-1 text-slate-400">
            <CalendarDays size={13} /> {formatDateTime(post.publishedAt, language)}
          </span>
        </div>
        <h2 className="mt-4 line-clamp-2 font-serif text-2xl font-black text-slate-950 transition group-hover:text-blue-700 dark:text-white">
          {post.title}
        </h2>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{post.excerpt}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-600">
          {t("blog.readMore")} <ArrowRight size={15} />
        </span>
      </div>
    </Link>
  );
}
