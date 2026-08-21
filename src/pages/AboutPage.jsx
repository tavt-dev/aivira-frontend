import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion, useInView, useScroll, useTransform } from "motion/react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Eye,
  Heart,
  PackageCheck,
  Quote,
  Search,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

/* ── Tiny CountUp hook ───────────────────────────── */
function useCountUp(target, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    if (!inView) return;
    const isNumeric = /^\d+/.test(String(target));
    if (!isNumeric) { setCount(target); return; }
    const numericPart = parseInt(String(target).replace(/\D/g, ""), 10);
    const suffix = String(target).replace(/^\d+/, "");
    let start = 0;
    const step = Math.ceil(numericPart / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= numericPart) { clearInterval(timer); setCount(numericPart + suffix); }
      else setCount(start + suffix);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return { count, ref };
}

/* ── Stagger container variant ──────────────────── */
const staggerContainer = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } };
const fadeUp = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } } };
const fadeLeft = { hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } } };
const fadeRight = { hidden: { opacity: 0, x: 30 }, visible: { opacity: 1, x: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.88 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } };

/* ── Eyebrow badge ─────────────────────────────── */
function Eyebrow({ children }) {
  return (
    <p className="mb-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.26em] text-blue-600 dark:text-blue-400">
      <Sparkles size={12} />
      {children}
    </p>
  );
}

/* ── Section heading ─────────────────────────────── */
function SectionHeading({ children, className = "" }) {
  return (
    <h2
      className={`about-serif text-3xl text-slate-900 dark:text-blue-50 md:text-5xl ${className}`}
    >
      {children}
    </h2>
  );
}

/* ── Stat item with CountUp ─────────────────────── */
function StatItem({ value, label }) {
  const { count, ref } = useCountUp(value);
  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      className="flex flex-col items-center gap-2 px-8 text-center"
    >
      <span className="about-stat-number text-5xl md:text-6xl">{count || value}</span>
      <span className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-blue-300/70">
        {label}
      </span>
    </motion.div>
  );
}

/* ── Value card ─────────────────────────────────── */
function ValueCard({ icon: Icon, title, copy, accent }) {
  return (
    <motion.article
      variants={fadeUp}
      className="about-value-card rounded-3xl border border-slate-200/80 bg-white p-7 dark:border-white/[0.07] dark:bg-white/[0.04] md:p-9"
    >
      <div
        className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: accent + "18" }}
      >
        <Icon size={26} style={{ color: accent }} />
      </div>
      <h3 className="about-serif text-xl text-slate-900 dark:text-blue-50">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">{copy}</p>
    </motion.article>
  );
}

/* ── Step card ──────────────────────────────────── */
function StepCard({ icon: Icon, number, title, copy }) {
  return (
    <motion.div
      variants={scaleIn}
      className="relative flex flex-col items-start rounded-3xl border border-slate-200/80 bg-white p-7 dark:border-white/[0.07] dark:bg-white/[0.04] md:p-9"
    >
      <span className="absolute right-6 top-5 font-black text-slate-100 dark:text-white/[0.04]"
        style={{ fontSize: "4.5rem", lineHeight: 1, fontFamily: "var(--f-serif)" }}>
        {number}
      </span>
      <div className="relative mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
        <Icon size={22} />
      </div>
      <h3 className="about-serif text-xl text-slate-900 dark:text-blue-50">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-500 dark:text-blue-100/60">{copy}</p>
    </motion.div>
  );
}

/* ── Testimonial card ───────────────────────────── */
function TestimonialCard({ quote, name, location }) {
  return (
    <motion.div
      variants={fadeUp}
      className="about-testimonial-card dark:about-testimonial-card relative flex min-w-[300px] max-w-sm flex-col gap-5 p-7 md:min-w-[340px] dark:bg-white/[0.04]"
    >
      <Quote
        size={36}
        className="text-blue-200 dark:text-blue-400/30"
        style={{ fontFamily: "var(--f-serif)" }}
      />
      <p className="flex-1 text-base leading-7 text-slate-700 dark:text-blue-100/80">
        {quote}
      </p>
      <div className="flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-white/[0.06]">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-black text-white">
          {name[0]}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 dark:text-blue-50">{name}</p>
          <p className="text-xs text-slate-400 dark:text-blue-300/50">{location}</p>
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════
   ABOUT PAGE
   ══════════════════════════════════════════════════ */
export default function AboutPage() {
  const { t } = useTranslation();

  /* Hero parallax */
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  /* Data from translations */
  const stats = [
    { value: t("about.statBooksValue"), label: t("about.statBooksLabel") },
    { value: t("about.statReadersValue"), label: t("about.statReadersLabel") },
    { value: t("about.statYearValue"), label: t("about.statYearLabel") },
  ];

  const timelineItems = t("about.timeline", { returnObjects: true });

  const valueCards = [
    { icon: Sparkles, title: t("about.curatedTitle"), copy: t("about.curatedCopy"), accent: "#2563eb" },
    { icon: Eye, title: t("about.transparentTitle"), copy: t("about.transparentCopy"), accent: "#7c3aed" },
    { icon: Heart, title: t("about.readerTitle"), copy: t("about.readerCopy"), accent: "#db2777" },
    { icon: Zap, title: t("about.seamlessTitle"), copy: t("about.seamlessCopy"), accent: "#059669" },
  ];

  const steps = [
    { icon: Search, number: "01", title: t("about.discover"), copy: t("about.discoverCopy") },
    { icon: BookOpen, number: "02", title: t("about.choose"), copy: t("about.chooseCopy") },
    { icon: PackageCheck, number: "03", title: t("about.receive"), copy: t("about.receiveCopy") },
  ];

  const testimonials = t("about.testimonials", { returnObjects: true });
  const pressItems = t("about.pressItems", { returnObjects: true });

  return (
    <div className="overflow-hidden bg-[#faf8f5] text-slate-900 dark:bg-[#040d1e] dark:text-slate-100">

      {/* ── SEO ──────────────────────────────────── */}
      <title>About Aivira — Our Story, Values & Mission</title>

      {/* ════════════════════════════════════════
          SECTION 1 — HERO CINEMATIC
          ════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative flex min-h-screen items-center overflow-hidden bg-[#faf8f5] dark:bg-[#040d1e]"
      >
        {/* Cream mesh gradient */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_0%_0%,rgba(219,234,254,0.55),transparent),radial-gradient(ellipse_50%_60%_at_100%_100%,rgba(199,210,254,0.35),transparent)]" />
          <div className="about-grain absolute inset-0 opacity-60" />
        </div>

        {/* Decorative ring */}
        <div className="pointer-events-none absolute -right-32 top-1/2 h-[700px] w-[700px] -translate-y-1/2 rounded-full border border-blue-200/30 dark:border-blue-400/10" />
        <div className="pointer-events-none absolute -right-16 top-1/2 h-[480px] w-[480px] -translate-y-1/2 rounded-full border border-indigo-200/20 dark:border-indigo-400/[0.06]" />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-16 px-4 pb-20 pt-28 md:px-8 lg:grid-cols-2">

          {/* Left content */}
          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            className="flex flex-col"
          >
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-blue-200/70 bg-white/70 px-4 py-2 backdrop-blur-sm dark:border-blue-400/20 dark:bg-white/5"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
              <span className="text-xs font-black uppercase tracking-[0.24em] text-blue-600 dark:text-blue-400">
                {t("about.eyebrow")}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="about-serif text-[2.9rem] leading-[1.06] text-slate-900 dark:text-blue-50 md:text-[4rem] lg:text-[4.5rem]"
            >
              {t("about.heroTitle")}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="mt-7 max-w-lg text-lg leading-relaxed text-slate-500 dark:text-blue-100/65"
              style={{ fontFamily: "var(--f-ui)" }}
            >
              {t("about.heroCopy")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-9 flex flex-wrap gap-3"
            >
              <Link
                to="/category/all"
                className="group inline-flex items-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-[0_8px_30px_rgba(37,99,235,0.35)] transition-all duration-300 hover:scale-105 hover:bg-blue-500 hover:shadow-[0_12px_40px_rgba(37,99,235,0.5)]"
              >
                {t("about.exploreBooks")} <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/80 px-7 py-3.5 text-sm font-bold text-slate-700 backdrop-blur-sm transition-all duration-300 hover:border-blue-200 hover:bg-blue-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-blue-100 dark:hover:bg-white/10"
              >
                {t("about.readJournal")}
              </Link>
            </motion.div>
          </motion.div>

          {/* Right — floating book card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="relative mx-auto w-full max-w-sm"
          >
            {/* Glow background */}
            <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-blue-200/40 to-indigo-200/30 blur-2xl" />

            {/* Glass card */}
            <div className="about-glass about-float relative flex aspect-square items-center justify-center rounded-[3rem] p-12">
              <div className="absolute inset-5 rounded-[2.5rem] border border-white/30 dark:border-white/[0.05]" />
              <div className="absolute -right-3 -top-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-[0_8px_24px_rgba(37,99,235,0.4)]">
                <Sparkles size={20} className="text-white" />
              </div>
              <img
                src="/logo.png"
                alt="Aivira Bookstore"
                className="relative w-48 rounded-3xl object-contain shadow-[0_30px_80px_rgba(0,0,0,0.18)]"
              />
            </div>

            {/* Floating micro-tags */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8 }}
              className="absolute -bottom-4 -left-4 flex items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-2.5 shadow-lg dark:border-white/10 dark:bg-slate-800"
            >
              <BookOpen size={16} className="text-blue-600" />
              <span className="text-xs font-bold text-slate-700 dark:text-blue-100">500+ curated titles</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1 }}
              className="absolute -right-5 top-8 flex items-center gap-2 rounded-2xl border border-slate-100 bg-white px-4 py-2.5 shadow-lg dark:border-white/10 dark:bg-slate-800"
            >
              <Users size={16} className="text-emerald-500" />
              <span className="text-xs font-bold text-slate-700 dark:text-blue-100">10K+ readers</span>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-blue-400/60">
            {t("about.scrollDown")}
          </span>
          <ChevronDown size={18} className="about-bounce text-slate-400 dark:text-blue-400/50" />
        </motion.div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 2 — STATS COUNTER
          ════════════════════════════════════════ */}
      <section className="border-y border-slate-100 bg-white/80 px-4 py-12 backdrop-blur-sm dark:border-white/[0.05] dark:bg-white/[0.02] md:px-8 md:py-16">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mx-auto grid max-w-4xl grid-cols-1 divide-y divide-slate-100 dark:divide-white/[0.05] sm:grid-cols-3 sm:divide-x sm:divide-y-0"
        >
          {stats.map((s) => (
            <StatItem key={s.label} value={s.value} label={s.label} />
          ))}
        </motion.div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 3 — OUR STORY + TIMELINE
          ════════════════════════════════════════ */}
      <section className="px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-24">

          {/* Left: Story copy */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
          >
            <motion.div variants={fadeLeft}>
              <Eyebrow>{t("about.storyEyebrow")}</Eyebrow>
              <SectionHeading className="max-w-lg">{t("about.storyTitle")}</SectionHeading>
            </motion.div>

            <motion.div variants={fadeLeft} className="mt-8 space-y-5 text-base leading-8 text-slate-500 dark:text-blue-100/65">
              <p>{t("about.storyCopy1")}</p>
              <p>{t("about.storyCopy2")}</p>
            </motion.div>

            {/* Promise card */}
            <motion.div
              variants={fadeUp}
              className="mt-10 flex items-start gap-5 rounded-3xl border border-blue-100/80 bg-blue-50/60 p-6 dark:border-blue-400/10 dark:bg-blue-500/[0.06] md:p-7"
            >
              <div className="mt-0.5 flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="mb-1 text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                  {t("about.promise")}
                </p>
                <p className="about-serif text-xl leading-snug text-slate-800 dark:text-blue-50">
                  {t("about.promiseCopy")}
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Timeline */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="relative pl-6 lg:pt-12"
          >
            <p className="mb-8 text-xs font-black uppercase tracking-[0.24em] text-slate-400 dark:text-blue-400/60">
              {t("about.timelineLabel")}
            </p>

            {/* Vertical line */}
            <div className="about-timeline-line absolute left-0 top-16 h-[calc(100%-4rem)] w-0.5 rounded-full" />

            <div className="space-y-10">
              {Array.isArray(timelineItems) && timelineItems.map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeRight}
                  className="relative"
                >
                  {/* Dot */}
                  <div className="absolute -left-[1.625rem] top-1.5 h-4 w-4 rounded-full border-2 border-blue-500 bg-white dark:bg-[#040d1e]" />
                  <span className="about-serif text-sm italic text-blue-600 dark:text-blue-400">{item.year}</span>
                  <h3 className="mt-1 text-base font-black text-slate-900 dark:text-blue-50">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-blue-100/55">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 4 — CORE VALUES
          ════════════════════════════════════════ */}
      <section className="bg-[#f5f0e8] px-4 py-24 dark:bg-white/[0.02] md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="mb-14 text-center"
          >
            <motion.div variants={fadeUp}>
              <Eyebrow>{t("about.valuesEyebrow")}</Eyebrow>
              <SectionHeading>{t("about.valuesTitle")}</SectionHeading>
            </motion.div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {valueCards.map((v) => (
              <ValueCard key={v.title} {...v} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 5 — HOW IT WORKS
          ════════════════════════════════════════ */}
      <section className="px-4 py-24 md:px-8 md:py-32">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="mb-14"
          >
            <motion.div variants={fadeUp} className="max-w-2xl">
              <Eyebrow>{t("about.experienceEyebrow")}</Eyebrow>
              <SectionHeading>{t("about.experienceTitle")}</SectionHeading>
            </motion.div>
          </motion.div>

          {/* Steps with connector */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="relative grid gap-5 lg:grid-cols-3"
          >
            {/* Dashed connector lines (desktop only) */}
            <div className="pointer-events-none absolute left-0 right-0 top-14 hidden h-0.5 lg:block" aria-hidden>
              <div
                className="absolute inset-0 mx-[37%]"
                style={{
                  background: "repeating-linear-gradient(90deg, #bfdbfe 0px, #bfdbfe 6px, transparent 6px, transparent 16px)",
                  opacity: 0.7
                }}
              />
            </div>

            {steps.map((s) => (
              <StepCard key={s.title} {...s} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 6 — TEAM / BUILT WITH LOVE
          ════════════════════════════════════════ */}
      <section className="overflow-hidden bg-white px-4 py-24 dark:bg-white/[0.025] md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

            {/* Left: Quote card */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
              className="relative"
            >
              <div className="absolute -left-6 -top-6 h-64 w-64 rounded-full bg-blue-100/50 blur-3xl dark:bg-blue-500/10" />
              <div className="relative rounded-[2.5rem] border border-blue-100/80 bg-gradient-to-br from-blue-50 to-indigo-50/60 p-8 dark:border-blue-400/10 dark:from-blue-500/[0.06] dark:to-indigo-500/[0.04] md:p-10">
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-600 shadow-[0_8px_24px_rgba(37,99,235,0.3)]">
                    <BookOpen size={28} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">Aivira</p>
                    <p className="text-sm font-medium text-slate-500 dark:text-blue-300/60">Est. 2022, Hanoi</p>
                  </div>
                </div>
                <blockquote className="about-serif-italic text-xl leading-relaxed text-slate-700 dark:text-blue-100/80 md:text-2xl">
                  {t("about.teamQuote")}
                </blockquote>
                {/* Star rating */}
                <div className="mt-6 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-amber-400">★</span>
                  ))}
                  <span className="ml-2 text-xs text-slate-400">10,000+ happy readers</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Narrative */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div variants={fadeRight}>
                <Eyebrow>{t("about.teamEyebrow")}</Eyebrow>
                <SectionHeading>{t("about.teamTitle")}</SectionHeading>
                <p className="mt-7 text-base leading-8 text-slate-500 dark:text-blue-100/65">
                  {t("about.teamCopy")}
                </p>
              </motion.div>

              <motion.div variants={fadeRight} className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: "📚", label: "500+ books", sub: "Curated catalog" },
                  { icon: "❤️", label: "Reader-first", sub: "Every decision" },
                  { icon: "🇻🇳", label: "Made in Hanoi", sub: "Vietnam" },
                  { icon: "✨", label: "Hand-picked", sub: "Every title" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 dark:border-white/[0.06] dark:bg-white/[0.03]"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <p className="mt-2 text-sm font-black text-slate-800 dark:text-blue-50">{item.label}</p>
                    <p className="text-xs text-slate-400 dark:text-blue-300/50">{item.sub}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 7 — TESTIMONIALS
          ════════════════════════════════════════ */}
      <section className="overflow-hidden bg-[#f5f0e8] px-4 py-24 dark:bg-white/[0.02] md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-14"
          >
            <motion.div variants={fadeUp}>
              <Eyebrow>{t("about.testimonialsEyebrow")}</Eyebrow>
              <SectionHeading>{t("about.testimonialsTitle")}</SectionHeading>
            </motion.div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-5 md:grid-cols-3"
          >
            {Array.isArray(testimonials) && testimonials.map((t_item, i) => (
              <TestimonialCard
                key={i}
                quote={t_item.quote}
                name={t_item.name}
                location={t_item.location}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 8 — PRESS / PARTNERS
          ════════════════════════════════════════ */}
      <section className="border-y border-slate-100 bg-white px-4 py-16 dark:border-white/[0.05] dark:bg-white/[0.02] md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-10 text-center"
          >
            <p className="text-xs font-black uppercase tracking-[0.26em] text-slate-400 dark:text-blue-400/60">
              {t("about.pressEyebrow")}
            </p>
            <p className="about-serif mt-3 text-xl text-slate-500 dark:text-blue-100/50">
              {t("about.pressTitle")}
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap items-center justify-center gap-4 md:gap-6"
          >
            {Array.isArray(pressItems) && pressItems.map((name) => (
              <motion.div
                key={name}
                variants={fadeUp}
                className="about-press-badge cursor-default rounded-full border border-slate-200 bg-slate-50 px-6 py-2.5 text-sm font-bold text-slate-500 dark:border-white/[0.07] dark:bg-white/[0.04] dark:text-blue-200/50"
              >
                {name}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          SECTION 9 — CTA DARK
          ════════════════════════════════════════ */}
      <section className="px-4 py-24 md:px-8 md:py-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] px-6 py-20 text-center text-white md:px-16 md:py-24"
          style={{ background: "linear-gradient(135deg, #020c1b 0%, #0a1628 40%, #0f2040 100%)" }}
        >
          {/* Aurora orbs */}
          <div className="about-aurora-orb-1 pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />
          <div className="about-aurora-orb-2 pointer-events-none absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />

          {/* Top glow line */}
          <div className="pointer-events-none absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />

          <div className="relative z-10 mx-auto max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5"
            >
              <Sparkles size={12} className="text-blue-300" />
              <span className="text-xs font-black uppercase tracking-widest text-blue-300">Aivira Bookstore</span>
            </motion.div>

            <h2 className="about-serif text-4xl text-white md:text-6xl">
              {t("about.ctaTitle")}
            </h2>
            <p className="mx-auto mt-6 max-w-2xl leading-7 text-blue-200/70">
              {t("about.ctaCopy")}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/category/all"
                className="group inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-[0_0_40px_rgba(37,99,235,0.4)] transition-all duration-300 hover:scale-105 hover:bg-blue-500 hover:shadow-[0_0_60px_rgba(56,189,248,0.5)]"
              >
                {t("about.ctaButton")}
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-8 py-4 text-sm font-bold text-white/80 transition-all duration-300 hover:border-white/30 hover:bg-white/5 hover:text-white"
              >
                {t("about.readJournal")}
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
