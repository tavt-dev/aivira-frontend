import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ImagePlus, Trash2 } from "lucide-react";
import RatingStars from "./RatingStars.jsx";

const MAX_REVIEW_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);
const IMAGE_ACCEPT = [...ALLOWED_IMAGE_TYPES].join(",");

export default function ReviewForm({ title, onSubmit, onCancel, busy = false }) {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const imagesRef = useRef([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => () => {
    imagesRef.current.forEach((image) => revokePreview(image.previewUrl));
  }, []);

  function submit(event) {
    event.preventDefault();
    const nextRating = Number(rating);
    const nextComment = comment.trim();

    if (nextRating < 1 || nextRating > 5) {
      setError(t("product.reviewRatingInvalid"));
      return;
    }
    if (!nextComment) {
      setError(t("product.reviewCommentRequired"));
      return;
    }
    setError("");
    onSubmit?.({
      rating: nextRating,
      comment: nextComment,
      files: images.map((image) => image.file)
    });
  }

  function selectImages(event) {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = "";
    if (!selectedFiles.length) return;

    const existingKeys = new Set(images.map((image) => fileKey(image.file)));
    if (selectedFiles.some((file) => existingKeys.has(fileKey(file))) || hasDuplicateFiles(selectedFiles)) {
      setError(t("product.reviewImageDuplicate"));
      return;
    }
    if (images.length + selectedFiles.length > MAX_REVIEW_IMAGES) {
      setError(t("product.reviewImageLimit", { count: MAX_REVIEW_IMAGES }));
      return;
    }
    if (selectedFiles.some((file) => !ALLOWED_IMAGE_TYPES.has(file.type))) {
      setError(t("product.reviewImageTypeInvalid"));
      return;
    }
    if (selectedFiles.some((file) => file.size > MAX_IMAGE_SIZE)) {
      setError(t("product.reviewImageTooLarge"));
      return;
    }

    setError("");
    setImages((current) => [
      ...current,
      ...selectedFiles.map((file) => ({
        id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${fileKey(file)}`,
        file,
        previewUrl: createPreview(file)
      }))
    ]);
  }

  function removeImage(id) {
    setImages((current) => {
      const image = current.find((item) => item.id === id);
      revokePreview(image?.previewUrl);
      return current.filter((item) => item.id !== id);
    });
    setError("");
  }

  return (
    <form className="grid gap-5" onSubmit={submit}>
      {title && <h3 className="font-serif text-3xl font-bold text-slate-950">{title}</h3>}
      <label className="grid gap-2">
        <span className="text-sm font-black uppercase tracking-wider text-slate-400">{t("product.reviewRating")}</span>
        <RatingStars value={rating} onChange={setRating} />
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-black uppercase tracking-wider text-slate-400">{t("product.reviewComment")}</span>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          maxLength={2000}
          rows={5}
          disabled={busy}
          className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:opacity-60"
          placeholder={t("product.reviewCommentPlaceholder")}
        />
      </label>
      <div className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-black uppercase tracking-wider text-slate-400">
            {t("product.reviewImages")} ({images.length}/{MAX_REVIEW_IMAGES})
          </span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy || images.length >= MAX_REVIEW_IMAGES}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ImagePlus size={14} />
            {t("product.selectReviewImages")}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept={IMAGE_ACCEPT}
            multiple
            disabled={busy}
            className="hidden"
            onChange={selectImages}
            aria-label={t("product.selectReviewImages")}
          />
        </div>
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {images.map((image, index) => (
              <div key={image.id} className="relative aspect-square overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
                {image.previewUrl ? (
                  <img
                    className="h-full w-full object-cover"
                    src={image.previewUrl}
                    alt={t("product.reviewImageAlt", { index: index + 1 })}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center"><ImagePlus size={22} className="text-slate-300" /></div>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(image.id)}
                  disabled={busy}
                  className="absolute right-1.5 top-1.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-rose-600 shadow-sm transition hover:bg-rose-50 disabled:opacity-50"
                  aria-label={t("product.removeReviewImage", { name: image.file.name })}
                  title={t("product.removeReviewImage", { name: image.file.name })}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</p>}
      <p className="text-sm font-semibold text-slate-500">{t("product.reviewModerationNotice")}</p>
      <div className="flex flex-wrap justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("common.cancel")}
          </button>
        )}
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white hover:bg-blue-600 disabled:cursor-wait disabled:opacity-60"
        >
          {busy ? t("common.working") : t("product.submitReview")}
        </button>
      </div>
    </form>
  );
}

function fileKey(file) {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

function hasDuplicateFiles(files) {
  return new Set(files.map(fileKey)).size !== files.length;
}

function createPreview(file) {
  return typeof URL.createObjectURL === "function" ? URL.createObjectURL(file) : "";
}

function revokePreview(previewUrl) {
  if (previewUrl && typeof URL.revokeObjectURL === "function") URL.revokeObjectURL(previewUrl);
}
