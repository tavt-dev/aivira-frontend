import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Edit3, Eye, FileText, ImagePlus, Plus, RefreshCw, Send, Tags, Trash2, Undo2, Upload } from "lucide-react";

import {
  createAdminBlogCategory,
  createAdminBlogPost,
  deleteAdminBlogCategory,
  deleteAdminBlogImage,
  deleteAdminBlogPost,
  getAdminBlogCategories,
  getAdminBlogPost,
  getAdminBlogPosts,
  publishAdminBlogPost,
  unpublishAdminBlogPost,
  updateAdminBlogCategory,
  updateAdminBlogPost,
  uploadAdminBlogCover,
  uploadAdminBlogImage
} from "../../api/blogApi.js";
import { getAdminProducts } from "../../api/adminProductsApi.js";
import {
  Button,
  EmptyState,
  Modal,
  Pagination,
  Panel,
  StatusPill,
  useConfirm,
  useToast
} from "../../components/ui/index.jsx";
import { formatDateTime } from "../../utils/formatters.js";
import { pageMeta, pageRows } from "../../utils/mappers.js";

const EMPTY_POST = {
  title: "",
  slug: "",
  excerpt: "",
  contentHtml: "<p></p>",
  categoryId: "",
  seoTitle: "",
  metaDescription: "",
  coverAltText: "",
  relatedProductIds: []
};
const EMPTY_CATEGORY = { name: "", slug: "", description: "", displayOrder: 0, active: true };

export default function AdminBlogPage() {
  const { t, i18n } = useTranslation();
  const toast = useToast();
  const confirm = useConfirm();
  const [tab, setTab] = useState("posts");
  const [postsPayload, setPostsPayload] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [keyword, setKeyword] = useState("");
  const [postOpen, setPostOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [postForm, setPostForm] = useState(EMPTY_POST);
  const [categoryForm, setCategoryForm] = useState(EMPTY_CATEGORY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [postRows, categoryRows, productRows] = await Promise.all([
        getAdminBlogPosts({ page, size: 12, status, keyword }),
        getAdminBlogCategories(),
        getAdminProducts({ page: 1, size: 100 })
      ]);
      setPostsPayload(postRows);
      setCategories(categoryRows || []);
      setProducts(pageRows(productRows));
    } catch (error) {
      notify(toast, "error", error.message || t("adminBlog.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [keyword, page, status, t, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const posts = pageRows(postsPayload);
  const meta = pageMeta(postsPayload, { page, size: 12 });
  const selectedProducts = useMemo(() => new Set(postForm.relatedProductIds.map(Number)), [postForm.relatedProductIds]);

  function startPost() {
    setEditingPostId(null);
    setPostForm(EMPTY_POST);
    setPostOpen(true);
  }

  async function editPost(id) {
    try {
      const post = await getAdminBlogPost(id);
      setEditingPostId(id);
      setPostForm({
        title: post.title || "",
        slug: post.slug || "",
        excerpt: post.excerpt || "",
        contentHtml: post.contentHtml || "<p></p>",
        categoryId: post.category?.id || "",
        seoTitle: post.seoTitle || "",
        metaDescription: post.metaDescription || "",
        coverAltText: post.coverAltText || "",
        relatedProductIds: (post.relatedProducts || []).map((book) => book.id),
        coverUrl: post.coverUrl,
        assets: post.assets || [],
        status: post.status
      });
      setPostOpen(true);
    } catch (error) {
      notify(toast, "error", error.message);
    }
  }

  async function savePost(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const body = {
        ...postForm,
        categoryId: Number(postForm.categoryId),
        relatedProductIds: postForm.relatedProductIds.map(Number)
      };
      delete body.coverUrl;
      delete body.assets;
      delete body.status;
      const saved = editingPostId ? await updateAdminBlogPost(editingPostId, body) : await createAdminBlogPost(body);
      setEditingPostId(saved.id);
      setPostForm((current) => ({
        ...current,
        ...saved,
        categoryId: saved.category?.id || current.categoryId,
        relatedProductIds: (saved.relatedProducts || []).map((book) => book.id)
      }));
      notify(toast, "success", t("adminBlog.saved"));
      await load();
    } catch (error) {
      notify(toast, "error", error.message || t("adminBlog.saveFailed"));
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(post) {
    try {
      if (post.status === "PUBLISHED") await unpublishAdminBlogPost(post.id);
      else await publishAdminBlogPost(post.id);
      notify(toast, "success", post.status === "PUBLISHED" ? t("adminBlog.unpublished") : t("adminBlog.published"));
      await load();
    } catch (error) {
      notify(toast, "error", error.message);
    }
  }

  async function removePost(post) {
    if (
      !(await confirm({
        title: t("common.delete"),
        message: t("adminBlog.confirmDelete", { title: post.title }),
        danger: true
      }))
    )
      return;
    try {
      await deleteAdminBlogPost(post.id);
      notify(toast, "success", t("adminBlog.deleted"));
      await load();
    } catch (error) {
      notify(toast, "error", error.message);
    }
  }

  function startCategory(category) {
    setEditingCategoryId(category?.id || null);
    setCategoryForm(category ? { ...EMPTY_CATEGORY, ...category } : EMPTY_CATEGORY);
    setCategoryOpen(true);
  }

  async function saveCategory(event) {
    event.preventDefault();
    setSaving(true);
    try {
      if (editingCategoryId) await updateAdminBlogCategory(editingCategoryId, categoryForm);
      else await createAdminBlogCategory(categoryForm);
      notify(toast, "success", t("adminBlog.categorySaved"));
      setCategoryOpen(false);
      await load();
    } catch (error) {
      notify(toast, "error", error.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeCategory(category) {
    if (
      !(await confirm({
        title: t("common.delete"),
        message: t("adminBlog.confirmDeleteCategory", { name: category.name }),
        danger: true
      }))
    )
      return;
    try {
      await deleteAdminBlogCategory(category.id);
      notify(toast, "success", t("adminBlog.categoryDeleted"));
      await load();
    } catch (error) {
      notify(toast, "error", error.message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">CMS</p>
          <h1 className="mt-1 text-3xl font-black text-slate-950 dark:text-white">{t("adminBlog.title")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t("adminBlog.subtitle")}</p>
        </div>
        <Button onClick={tab === "posts" ? startPost : () => startCategory()}>
          <Plus size={16} />
          {tab === "posts" ? t("adminBlog.newPost") : t("adminBlog.newCategory")}
        </Button>
      </div>

      <div className="flex gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
        {[
          { id: "posts", icon: FileText, label: t("adminBlog.posts") },
          { id: "categories", icon: Tags, label: t("adminBlog.categories") }
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold ${tab === id ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-950" : "text-slate-500"}`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {tab === "posts" ? (
        <Panel>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row">
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder={t("adminBlog.search")}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="">{t("common.all")}</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
            </select>
            <Button variant="secondary" onClick={load}>
              <RefreshCw size={15} />
              {t("common.update")}
            </Button>
          </div>
          {loading ? (
            <div className="py-16 text-center text-slate-400">{t("common.loading")}</div>
          ) : posts.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {posts.map((post) => (
                <div key={post.id} className="flex gap-4 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                  <img
                    src={post.coverUrl || "https://placehold.co/240x160?text=Draft"}
                    alt=""
                    className="h-28 w-36 rounded-xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <StatusPill status={post.status} />
                      <span className="text-xs text-slate-400">{post.category?.name}</span>
                    </div>
                    <h2 className="mt-2 line-clamp-2 font-bold text-slate-950 dark:text-white">{post.title}</h2>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatDateTime(post.publishedAt || post.updatedAt, i18n.language)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => editPost(post.id)}
                        className="rounded-lg border px-2.5 py-1.5 text-xs font-bold"
                      >
                        <Edit3 size={13} className="inline" /> Edit
                      </button>
                      <button
                        onClick={() => changeStatus(post)}
                        className="rounded-lg border px-2.5 py-1.5 text-xs font-bold"
                      >
                        {post.status === "PUBLISHED" ? (
                          <Undo2 size={13} className="inline" />
                        ) : (
                          <Send size={13} className="inline" />
                        )}{" "}
                        {post.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                      </button>
                      {post.status === "PUBLISHED" && (
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border px-2.5 py-1.5 text-xs font-bold"
                        >
                          <Eye size={13} className="inline" /> View
                        </a>
                      )}
                      <button
                        onClick={() => removePost(post)}
                        className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-bold text-red-600"
                      >
                        <Trash2 size={13} className="inline" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title={t("adminBlog.emptyPosts")} />
          )}
          <Pagination loading={loading} meta={meta} onPage={setPage} t={t} />
        </Panel>
      ) : (
        <Panel>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <div key={category.id} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-bold text-slate-950 dark:text-white">{category.name}</h2>
                    <code className="text-xs text-indigo-500">/{category.slug}</code>
                  </div>
                  <StatusPill status={category.active ? "ACTIVE" : "INACTIVE"} />
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-slate-500">{category.description || "—"}</p>
                <div className="mt-4 flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => startCategory(category)}>
                    <Edit3 size={14} />
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => removeCategory(category)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {!categories.length && !loading && <EmptyState title={t("adminBlog.emptyCategories")} />}
        </Panel>
      )}

      <PostModal
        open={postOpen}
        onClose={() => setPostOpen(false)}
        form={postForm}
        setForm={setPostForm}
        categories={categories}
        products={products}
        selectedProducts={selectedProducts}
        editingId={editingPostId}
        saving={saving}
        onSave={savePost}
        onReload={() => editingPostId && editPost(editingPostId)}
        toast={toast}
        t={t}
      />
      <Modal
        open={categoryOpen}
        onClose={() => setCategoryOpen(false)}
        title={editingCategoryId ? t("adminBlog.editCategory") : t("adminBlog.newCategory")}
        footer={
          <Button type="submit" form="blog-category-form" loading={saving}>
            {t("common.save")}
          </Button>
        }
      >
        <form id="blog-category-form" onSubmit={saveCategory} className="grid gap-4">
          <Field label="Name">
            <input
              required
              minLength={2}
              maxLength={150}
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
            />
          </Field>
          <Field label="Slug">
            <input
              maxLength={255}
              value={categoryForm.slug}
              onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
            />
          </Field>
          <Field label="Description">
            <textarea
              rows={3}
              maxLength={1000}
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
            />
          </Field>
          <Field label="Display order">
            <input
              type="number"
              min="0"
              value={categoryForm.displayOrder}
              onChange={(e) => setCategoryForm({ ...categoryForm, displayOrder: Number(e.target.value) })}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm font-bold">
            <input
              type="checkbox"
              checked={categoryForm.active}
              onChange={(e) => setCategoryForm({ ...categoryForm, active: e.target.checked })}
            />{" "}
            Active
          </label>
        </form>
      </Modal>
    </div>
  );
}

function PostModal({
  open,
  onClose,
  form,
  setForm,
  categories,
  products,
  selectedProducts,
  editingId,
  saving,
  onSave,
  onReload,
  toast,
  t
}) {
  async function uploadCover(event) {
    const file = event.target.files?.[0];
    if (!file || !editingId) return;
    try {
      const post = await uploadAdminBlogCover(editingId, file, form.coverAltText);
      setForm((current) => ({ ...current, coverUrl: post.coverUrl }));
      notify(toast, "success", t("adminBlog.coverUploaded"));
    } catch (error) {
      notify(toast, "error", error.message);
    }
  }
  async function uploadImage(event) {
    const file = event.target.files?.[0];
    if (!file || !editingId) return;
    try {
      const asset = await uploadAdminBlogImage(editingId, file, "");
      const html = `<figure><img src="${asset.url}" alt=""><figcaption></figcaption></figure>`;
      setForm((current) => ({
        ...current,
        contentHtml: `${current.contentHtml}\n${html}`,
        assets: [...(current.assets || []), asset]
      }));
      await navigator.clipboard?.writeText(html);
      notify(toast, "success", t("adminBlog.imageUploaded"));
    } catch (error) {
      notify(toast, "error", error.message);
    }
  }
  async function removeAsset(asset) {
    try {
      await deleteAdminBlogImage(editingId, asset.id);
      await onReload();
    } catch (error) {
      notify(toast, "error", error.message);
    }
  }
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={editingId ? t("adminBlog.editPost") : t("adminBlog.newPost")}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t("common.close")}
          </Button>
          <Button type="submit" form="blog-post-form" loading={saving}>
            {t("common.save")}
          </Button>
        </>
      }
    >
      <form id="blog-post-form" onSubmit={onSave} className="grid gap-5 lg:grid-cols-2">
        <div className="grid content-start gap-4">
          <Field label="Title">
            <input
              required
              minLength={5}
              maxLength={255}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Slug">
              <input maxLength={255} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </Field>
            <Field label="Category">
              <select
                required
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                <option value="">—</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Excerpt">
            <textarea
              required
              rows={3}
              maxLength={500}
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="SEO title">
              <input
                maxLength={70}
                value={form.seoTitle}
                onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
              />
            </Field>
            <Field label="Meta description">
              <textarea
                rows={2}
                maxLength={160}
                value={form.metaDescription}
                onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Cover alt text">
            <input
              maxLength={255}
              value={form.coverAltText}
              onChange={(e) => setForm({ ...form, coverAltText: e.target.value })}
            />
          </Field>
          <div className="rounded-xl border border-dashed border-slate-300 p-4 dark:border-slate-700">
            <div className="flex items-center gap-3">
              {form.coverUrl && <img src={form.coverUrl} alt="" className="h-20 w-28 rounded-lg object-cover" />}
              <label
                className={`inline-flex cursor-pointer items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-bold text-indigo-600 ${!editingId ? "pointer-events-none opacity-40" : ""}`}
              >
                <Upload size={15} />
                {t("adminBlog.uploadCover")}
                <input type="file" accept="image/*" onChange={uploadCover} className="hidden" />
              </label>
            </div>
            {!editingId && <p className="mt-2 text-xs text-amber-600">{t("adminBlog.saveBeforeUpload")}</p>}
          </div>
          <Field label={t("adminBlog.relatedBooks")}>
            <div className="max-h-48 overflow-auto rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              {products.map((book) => (
                <label key={book.id} className="flex gap-2 py-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedProducts.has(Number(book.id))}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        relatedProductIds: e.target.checked
                          ? [...form.relatedProductIds, book.id]
                          : form.relatedProductIds.filter((id) => Number(id) !== Number(book.id))
                      })
                    }
                  />
                  <span>{book.productName}</span>
                </label>
              ))}
            </div>
          </Field>
        </div>
        <div className="grid content-start gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">HTML content</span>
            <label
              className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold ${!editingId ? "pointer-events-none opacity-40" : ""}`}
            >
              <ImagePlus size={14} />
              {t("adminBlog.uploadContentImage")}
              <input type="file" accept="image/*" onChange={uploadImage} className="hidden" />
            </label>
          </div>
          <textarea
            required
            rows={18}
            value={form.contentHtml}
            onChange={(e) => setForm({ ...form, contentHtml: e.target.value })}
            className="rounded-xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs leading-6 text-emerald-300 dark:border-slate-700"
          />
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-500">Preview</p>
            <div
              className="blog-content max-h-80 overflow-auto rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-950"
              dangerouslySetInnerHTML={{ __html: form.contentHtml }}
            />
          </div>
          {form.assets?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.assets.map((asset) => (
                <button type="button" key={asset.id} onClick={() => removeAsset(asset)} className="group relative">
                  <img src={asset.url} alt={asset.altText || ""} className="h-16 w-20 rounded-lg object-cover" />
                  <span className="absolute inset-0 grid place-items-center rounded-lg bg-red-900/70 text-white opacity-0 group-hover:opacity-100">
                    <Trash2 size={15} />
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
      {label}
      <span className="blog-admin-field contents">{children}</span>
    </label>
  );
}

function notify(showToast, variant, message) {
  showToast({ variant, message: message || "Unexpected error" });
}
