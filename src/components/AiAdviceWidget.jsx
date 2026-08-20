import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Bot,
  ChevronDown,
  CircleHelp,
  LoaderCircle,
  Mic,
  MicOff,
  Send,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  X
} from "lucide-react";
import {
  createAdviceSession,
  getAdviceRecommendations,
  getAdviceSession,
  recordAdviceEvent,
  sendAdviceMessage,
  updateAdvicePreferences
} from "../api/aiAdviceApi.js";
import { formatVND } from "../utils/formatters.js";
import { normalizeBook } from "../utils/mappers.js";

const STORAGE_PREFIX = "aivira_ai_advice_session_";
const GUEST_ID_KEY = "aivira_ai_guest_id";
const FACEBOOK_URL = import.meta.env.VITE_FACEBOOK_URL || "https://www.facebook.com/";
const ZALO_URL = import.meta.env.VITE_ZALO_URL || "https://zalo.me/";

export default function AiAdviceWidget({ user }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState({});
  const inputRef = useRef(null);
  const endRef = useRef(null);
  const recognitionRef = useRef(null);
  const guestId = useMemo(() => {
    if (user) return null;
    const saved = localStorage.getItem(GUEST_ID_KEY);
    if (saved) return saved;
    const created = crypto.randomUUID();
    localStorage.setItem(GUEST_ID_KEY, created);
    return created;
  }, [user]);
  const identity = user?.id || user?.username || user?.email || "guest";
  const storageKey = `${STORAGE_PREFIX}${identity}`;
  const guestRequestOptions = user ? {} : {
    skipAuth: true,
    skipRefresh: true,
    headers: { "X-Guest-Id": guestId }
  };

  useEffect(() => {
    setSession(null);
    setMessages([]);
    setError("");
  }, [identity]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => () => recognitionRef.current?.stop?.(), []);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: "smooth", block: "end" });
  }, [loading, messages]);

  useEffect(() => {
    if (open && !session && !initializing) initialize();
  }, [open, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const quota = session?.quota;
  const quotaEmpty = quota && quota.remaining <= 0;
  const starterPrompts = useMemo(
    () => [t("advisor.promptOne"), t("advisor.promptTwo"), t("advisor.promptThree")],
    [t]
  );

  async function initialize() {
    setInitializing(true);
    setError("");
    const savedId = localStorage.getItem(storageKey);
    try {
      let loaded;
      if (savedId) {
        try {
          loaded = await getAdviceSession(savedId, guestRequestOptions);
        } catch (requestError) {
          if (requestError.status !== 404) throw requestError;
          localStorage.removeItem(storageKey);
        }
      }
      if (!loaded) {
        loaded = await createAdviceSession({
          locale: i18n.language?.startsWith("en") ? "en" : "vi",
          personalizationEnabled: Boolean(user)
        }, guestRequestOptions);
        localStorage.setItem(storageKey, loaded.id);
      }
      setSession(loaded);
      setMessages(loaded.messages || []);
    } catch (requestError) {
      setError(requestError.message || t("advisor.loadFailed"));
    } finally {
      setInitializing(false);
    }
  }

  async function submit(event, suggestedText) {
    event?.preventDefault();
    const content = String(suggestedText ?? input).trim();
    if (!content || !session || loading || quotaEmpty) return;
    const optimisticId = `local-${Date.now()}`;
    setInput("");
    setError("");
    setLoading(true);
    setMessages((current) => [
      ...current,
      { id: optimisticId, role: "USER", content, createdAt: new Date().toISOString() }
    ]);
    try {
      const assistant = await sendAdviceMessage(session.id, {
        clientMessageId: crypto.randomUUID(),
        content
      }, guestRequestOptions);
      setMessages((current) => [...current, assistant]);
      setSession((current) => ({ ...current, quota: assistant.quota || current.quota }));
    } catch (requestError) {
      setMessages((current) => current.filter((message) => message.id !== optimisticId));
      const details = requestError.data;
      let displayError = requestError.message || t("advisor.sendFailed");
      if (requestError.status === 429 && details) {
        setSession((current) => ({ ...current, quota: details }));
        if (details.resetsAt) {
          displayError = t("advisor.limitReset", { date: new Date(details.resetsAt).toLocaleDateString(i18n.language) });
        }
      }
      setInput(content);
      setError(displayError);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  async function togglePersonalization() {
    if (!session || loading) return;
    const next = !session.personalizationEnabled;
    setSession((current) => ({ ...current, personalizationEnabled: next }));
    try {
      const updated = await updateAdvicePreferences(session.id, next);
      setSession((current) => ({ ...current, ...updated }));
    } catch (requestError) {
      setSession((current) => ({ ...current, personalizationEnabled: !next }));
      setError(requestError.message || t("advisor.preferenceFailed"));
    }
  }

  async function loadMore(message) {
    const currentPage = message.recommendations?.page || 1;
    setMessages((current) => current.map((item) => item.id === message.id ? { ...item, loadingMore: true } : item));
    try {
      const next = await getAdviceRecommendations(session.id, message.id, currentPage + 1, guestRequestOptions);
      setMessages((current) => current.map((item) => item.id === message.id ? {
        ...item,
        loadingMore: false,
        recommendations: {
          ...next,
          items: [...(item.recommendations?.items || []), ...(next.items || [])]
        }
      } : item));
    } catch (requestError) {
      setMessages((current) => current.map((item) => item.id === message.id ? { ...item, loadingMore: false } : item));
      setError(requestError.message || t("advisor.moreFailed"));
    }
  }

  function trackClick(messageId, recommendationId) {
    if (!session) return;
    recordAdviceEvent(session.id, { eventType: "CLICK", messageId, recommendationId }, guestRequestOptions).catch(() => {});
  }

  async function sendFeedback(messageId, eventType) {
    if (!session) return;
    setFeedback((current) => ({ ...current, [messageId]: eventType }));
    try {
      await recordAdviceEvent(session.id, { eventType, messageId }, guestRequestOptions);
    } catch {
      setFeedback((current) => ({ ...current, [messageId]: undefined }));
    }
  }

  function toggleVoiceInput() {
    if (listening) {
      recognitionRef.current?.stop?.();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError(t("advisor.voiceUnsupported"));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = i18n.language?.startsWith("en") ? "en-US" : "vi-VN";
    recognition.interimResults = true;
    recognition.continuous = false;
    const originalInput = input.trim();

    recognition.onstart = () => {
      setError("");
      setListening(true);
    };
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || "")
        .join("")
        .trim();
      setInput([originalInput, transcript].filter(Boolean).join(" "));
    };
    recognition.onerror = (event) => {
      if (event.error !== "aborted") setError(t("advisor.voiceFailed"));
    };
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
      inputRef.current?.focus();
    };
    recognitionRef.current = recognition;
    recognition.start();
  }

  return (
    <>
      <div className={`fixed bottom-24 right-4 flex flex-col items-end gap-3 transition-all duration-200 sm:right-6 ${open ? "pointer-events-none -z-10 scale-90 opacity-0" : "z-[60] scale-100 opacity-100"}`}>
        <div
          className={`flex flex-col items-end gap-3 transition-all duration-300 ${contactOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
          aria-hidden={!contactOpen}
        >
          <ContactBubble
            label={t("advisor.facebook")}
            href={FACEBOOK_URL}
            color="bg-[#1877F2]"
            delay="100ms"
            icon={<FacebookIcon />}
          />
          <ContactBubble
            label={t("advisor.zalo")}
            href={ZALO_URL}
            color="bg-[#0068ff]"
            delay="50ms"
            icon={<ZaloIcon />}
          />
          <ContactBubble
            label={t("advisor.chatbot")}
            color="bg-gradient-to-br from-indigo-600 to-violet-600"
            icon={<Bot size={22} />}
            onClick={() => {
              setOpen(true);
              setContactOpen(false);
            }}
          />
        </div>

        <button
          type="button"
          className="group relative grid h-16 w-16 place-items-center rounded-full border border-white/70 bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-700 text-white shadow-[0_16px_40px_rgba(30,64,175,.42)] transition duration-300 hover:-translate-y-1 hover:scale-105 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-300"
          aria-label={t("advisor.contactOpen")}
          aria-expanded={contactOpen}
          onClick={() => setContactOpen((value) => !value)}
        >
          <span className="absolute inset-[-5px] -z-10 animate-pulse rounded-full bg-blue-500/20" />
          {contactOpen ? <X size={24} /> : <AiLogo />}
          {!contactOpen && <span className="absolute right-0 top-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />}
        </button>
      </div>

      {open && (
        <button
          type="button"
          aria-label={t("common.close")}
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[2px] sm:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      {open && (
        <section
          role="dialog"
          aria-modal="true"
          aria-label={t("advisor.title")}
          className="fixed inset-x-0 bottom-0 z-50 flex h-[88dvh] flex-col overflow-hidden rounded-t-[2rem] border border-slate-200 bg-white shadow-2xl sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[min(720px,calc(100vh-8rem))] sm:w-[430px] sm:rounded-[2rem]"
        >
          <header className="flex items-center justify-between bg-gradient-to-r from-slate-950 to-indigo-950 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10"><Bot size={22} /></span>
              <div>
                <h2 className="font-serif text-lg font-bold">{t("advisor.title")}</h2>
                <p className="text-xs text-blue-200">{t("advisor.powered")}</p>
              </div>
            </div>
            <button type="button" className="rounded-full p-2 hover:bg-white/10" aria-label={t("common.close")} onClick={() => setOpen(false)}>
              <ChevronDown size={21} />
            </button>
          </header>

          <>
              {user && (
              <div className="flex items-center justify-end border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-xs">
                <label className="flex cursor-pointer items-center gap-2 text-slate-600" title={t("advisor.personalizeHelp")}>
                  <CircleHelp size={14} className="text-blue-500" aria-hidden="true" />
                  <span className="font-medium">{t("advisor.personalize")}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(session?.personalizationEnabled)}
                    disabled={!session || loading}
                    onChange={togglePersonalization}
                    className="h-4 w-4 accent-blue-600"
                  />
                </label>
              </div>
              )}

              <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/70 p-4" aria-live="polite">
                {initializing && <LoadingBubble label={t("advisor.loadingSession")} />}
                {!initializing && messages.length === 0 && (
                  <div className="rounded-3xl rounded-tl-md border border-blue-100 bg-white p-4 text-sm leading-6 text-slate-700 shadow-sm">
                    <div className="mb-2 flex items-center gap-2 font-bold text-blue-700"><Sparkles size={16} /> {t("advisor.welcomeTitle")}</div>
                    <p>{t("advisor.welcomeCopy")}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {starterPrompts.map((prompt) => (
                        <button key={prompt} type="button" className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-left text-xs font-semibold text-blue-700 hover:bg-blue-100" onClick={(event) => submit(event, prompt)}>
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    feedback={feedback[message.id]}
                    onFeedback={sendFeedback}
                    onLoadMore={loadMore}
                    onTrackClick={trackClick}
                    t={t}
                  />
                ))}
                {loading && <LoadingBubble label={t("advisor.thinking")} />}
                {error && <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
                {quotaEmpty && <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">{t("advisor.limitReached")}</div>}
                <div ref={endRef} />
              </div>

              <form className="border-t border-slate-200 bg-white p-3" onSubmit={submit}>
                <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
                  <textarea
                    ref={inputRef}
                    rows={1}
                    maxLength={2000}
                    value={input}
                    disabled={!session || loading || quotaEmpty}
                    placeholder={quotaEmpty ? t("advisor.limitPlaceholder") : t("advisor.placeholder")}
                    className="max-h-28 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none"
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        submit(event);
                      }
                    }}
                  />
                  <button
                    type="button"
                    disabled={!session || loading || quotaEmpty}
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl transition disabled:cursor-not-allowed disabled:opacity-40 ${listening ? "animate-pulse bg-rose-100 text-rose-600 ring-2 ring-rose-200" : "text-slate-500 hover:bg-blue-100 hover:text-blue-700"}`}
                    aria-label={listening ? t("advisor.voiceStop") : t("advisor.voiceStart")}
                    title={listening ? t("advisor.voiceStop") : t("advisor.voiceStart")}
                    onClick={toggleVoiceInput}
                  >
                    {listening ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>
                  <button type="submit" disabled={!input.trim() || loading || !session || quotaEmpty} className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-white disabled:cursor-not-allowed disabled:opacity-40" aria-label={t("advisor.send")}>
                    <Send size={17} />
                  </button>
                </div>
              </form>
            </>
        </section>
      )}
    </>
  );
}

function ContactBubble({ label, href, color, icon, onClick, delay = "0ms" }) {
  const className = `group flex items-center gap-3 rounded-full text-sm font-bold text-slate-800 transition duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200`;
  const content = (
    <>
      <span className="rounded-full border border-slate-200/80 bg-white px-3 py-2 shadow-lg transition group-hover:border-blue-200">{label}</span>
      <span className={`grid h-12 w-12 place-items-center rounded-full border-2 border-white text-white shadow-[0_10px_28px_rgba(15,23,42,.24)] ${color}`}>{icon}</span>
    </>
  );

  if (href) {
    return <a href={href} target="_blank" rel="noreferrer" className={className} style={{ transitionDelay: delay }}>{content}</a>;
  }
  return <button type="button" className={className} style={{ transitionDelay: delay }} onClick={onClick}>{content}</button>;
}

function AiLogo() {
  return (
    <svg viewBox="0 0 40 40" className="h-10 w-10" aria-hidden="true">
      <defs>
        <linearGradient id="ai-mark" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#67e8f9" />
          <stop offset="1" stopColor="#c4b5fd" />
        </linearGradient>
      </defs>
      <path d="M20 5.5 23.2 14l8.3 3.2-8.3 3.2L20 29l-3.2-8.6-8.3-3.2 8.3-3.2L20 5.5Z" fill="none" stroke="url(#ai-mark)" strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx="30.5" cy="9" r="2.2" fill="#fff" />
      <path d="M28 29.5h7M31.5 26v7" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
      <text x="10" y="36" fill="#fff" fontSize="8" fontWeight="900" letterSpacing="1">AI</text>
    </svg>
  );
}

function FacebookIcon() {
  return <span className="text-2xl font-black leading-none" aria-hidden="true">f</span>;
}

function ZaloIcon() {
  return <span className="text-[11px] font-black tracking-[-.04em]" aria-hidden="true">Zalo</span>;
}

function MessageBubble({ message, feedback, onFeedback, onLoadMore, onTrackClick, t }) {
  const isUser = message.role === "USER";
  return (
    <div className={isUser ? "ml-10" : "mr-3"}>
      <div className={isUser
        ? "ml-auto w-fit max-w-full rounded-3xl rounded-br-md bg-blue-600 px-4 py-3 text-sm leading-6 text-white shadow-sm"
        : "rounded-3xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm"}>
        {message.content}
      </div>
      {!isUser && message.status === "DEGRADED_RECOMMENDATION" && (
        <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          {t("advisor.degraded")}
        </div>
      )}
      {!isUser && message.recommendations?.items?.length > 0 && (
        <div className="mt-3 space-y-3">
          {message.recommendations.items.map((recommendation) => (
            <RecommendationCard key={recommendation.id} messageId={message.id} recommendation={recommendation} onTrackClick={onTrackClick} t={t} />
          ))}
          {message.recommendations.hasNext && (
            <button type="button" disabled={message.loadingMore} className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-3 py-2.5 text-xs font-bold text-blue-700 disabled:opacity-50" onClick={() => onLoadMore(message)}>
              {message.loadingMore && <LoaderCircle className="animate-spin" size={14} />}
              {t("advisor.loadMore")}
            </button>
          )}
        </div>
      )}
      {!isUser && (
        <div className="mt-2 flex items-center gap-1 text-slate-400">
          <span className="mr-1 text-[11px]">{t("advisor.helpfulQuestion")}</span>
          <button type="button" aria-label={t("advisor.helpful")} className={`rounded-full p-1.5 ${feedback === "HELPFUL" ? "bg-emerald-100 text-emerald-700" : "hover:bg-slate-200"}`} onClick={() => onFeedback(message.id, "HELPFUL")}><ThumbsUp size={13} /></button>
          <button type="button" aria-label={t("advisor.notHelpful")} className={`rounded-full p-1.5 ${feedback === "NOT_HELPFUL" ? "bg-rose-100 text-rose-700" : "hover:bg-slate-200"}`} onClick={() => onFeedback(message.id, "NOT_HELPFUL")}><ThumbsDown size={13} /></button>
        </div>
      )}
    </div>
  );
}

function RecommendationCard({ messageId, recommendation, onTrackClick, t }) {
  const book = normalizeBook(recommendation.product);
  return (
    <Link
      to={`/product/${book.slug}`}
      className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
      onClick={() => onTrackClick(messageId, recommendation.id)}
    >
      <img src={book.image} alt="" className="h-24 w-16 shrink-0 rounded-lg object-cover" />
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600">#{recommendation.rank} · {book.catLabel}</div>
        <h3 className="line-clamp-2 text-sm font-bold text-slate-950">{book.title}</h3>
        <p className="truncate text-xs text-slate-500">{book.author}</p>
        <p className="mt-1 text-sm font-black text-blue-700">{formatVND(book.price)}</p>
        <p className="mt-1 line-clamp-3 text-xs leading-5 text-slate-600">{recommendation.reason}</p>
        {recommendation.matchedCriteria?.length > 0 && <p className="mt-1 text-[10px] font-semibold text-emerald-700">{t("advisor.matches")}: {recommendation.matchedCriteria.join(" · ")}</p>}
      </div>
    </Link>
  );
}

function LoadingBubble({ label }) {
  return (
    <div className="mr-16 flex w-fit items-center gap-2 rounded-3xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
      <LoaderCircle className="animate-spin text-blue-600" size={16} /> {label}
    </div>
  );
}
