import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, UserRound } from "lucide-react";

import { getBlogPost } from "../api/blogApi.js";
import { ErrorState, Skeleton } from "../components/ui/index.jsx";
import { formatDateTime } from "../utils/formatters.js";

export default function BlogPostPage() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setPost(null);
    setError("");
    getBlogPost(slug, { signal: controller.signal })
      .then(setPost)
      .catch((requestError) => {
        if (requestError.name !== "AbortError") setError(requestError.message || t("blog.notFound"));
      });
    return () => controller.abort();
  }, [slug, t]);

  useEffect(() => {
    if (!post) return;
    document.title = `${post.seoTitle || post.title} | Aivira`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = post.metaDescription || post.excerpt || "";
    return () => {
      document.title = "Aivira Bookstore";
    };
  }, [post]);

  if (error)
    return (
      <div className="mx-auto min-h-screen max-w-4xl px-4 pb-24 pt-32">
        <ErrorState title={t("blog.notFound")}>{error}</ErrorState>
      </div>
    );
  if (!post)
    return (
      <div className="mx-auto min-h-screen max-w-4xl px-4 pb-24 pt-32">
        <Skeleton rows={8} />
      </div>
    );

  return (
    <article className="min-h-screen bg-[#faf8f5] pb-24 pt-24 dark:bg-[#040d1e]">
      <header className="mx-auto max-w-5xl px-4 py-12 text-center md:px-8">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-blue-600">
          <ArrowLeft size={16} /> {t("blog.back")}
        </Link>
        <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-blue-600">{post.category?.name}</p>
        <h1 className="mt-4 font-serif text-4xl font-black leading-tight text-slate-950 dark:text-white md:text-6xl">
          {post.title}
        </h1>
        <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">{post.excerpt}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-5 text-sm text-slate-500">
          <span className="inline-flex items-center gap-2">
            <UserRound size={16} />
            {post.author?.displayName || "Aivira"}
          </span>
          <span className="inline-flex items-center gap-2">
            <CalendarDays size={16} />
            {formatDateTime(post.publishedAt, i18n.language)}
          </span>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <img
          src={post.coverUrl}
          alt={post.coverAltText || post.title}
          className="max-h-[640px] w-full rounded-3xl object-cover shadow-2xl"
        />
      </div>
      <div className="mx-auto mt-12 max-w-3xl px-4 md:px-8">
        <div
          className="blog-content text-slate-700 dark:text-slate-200"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </div>
      {post.relatedProducts?.length > 0 && (
        <section className="mx-auto mt-16 max-w-5xl border-t border-slate-200 px-4 pt-10 dark:border-white/10 md:px-8">
          <h2 className="font-serif text-3xl font-black text-slate-950 dark:text-white">{t("blog.relatedBooks")}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {post.relatedProducts.map((book) => (
              <Link
                key={book.id}
                to={`/product/${book.slug}`}
                className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-300 dark:border-white/10 dark:bg-white/5"
              >
                <img src={book.thumbnailUrl} alt={book.productName} className="h-24 w-16 rounded-lg object-cover" />
                <span>
                  <strong className="line-clamp-2 text-slate-950 dark:text-white">{book.productName}</strong>
                  <small className="mt-2 block text-slate-500">{book.bookAuthor}</small>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
