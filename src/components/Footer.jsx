import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Mail, MapPin } from "lucide-react";

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer 
      className="tw-footer relative overflow-hidden bg-slate-950 px-4 pb-6 pt-12 text-blue-100/60 antialiased md:px-8 md:pt-16"
      style={{ fontFamily: "'Roboto', sans-serif" }}
    >
      {/* Premium Animated Aurora Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30">
        <style>{`
          @keyframes aurora-1 {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.1; }
            50% { transform: translate(10%, -10%) scale(1.1); opacity: 0.2; }
          }
          @keyframes aurora-2 {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.1; }
            50% { transform: translate(-10%, 10%) scale(1.1); opacity: 0.2; }
          }
          @keyframes aurora-3 {
            0%, 100% { transform: translate(-50%, 0) scale(1); opacity: 0.05; }
            50% { transform: translate(-40%, 0) scale(1.5); opacity: 0.15; }
          }
        `}</style>
        
        {/* Moving glowing orbs (Darker colors) */}
        <div 
          className="absolute -left-1/4 bottom-0 h-[600px] w-[600px] rounded-full bg-blue-900 blur-[130px]" 
          style={{ animation: "aurora-1 15s ease-in-out infinite" }}
        />
        <div 
          className="absolute -right-1/4 top-0 h-[500px] w-[500px] rounded-full bg-indigo-900 blur-[120px]" 
          style={{ animation: "aurora-2 18s ease-in-out infinite reverse" }}
        />
        <div 
          className="absolute bottom-1/4 left-1/2 h-[400px] w-[800px] rounded-full bg-sky-900 blur-[150px]" 
          style={{ animation: "aurora-3 20s ease-in-out infinite" }}
        />

        {/* Cinematic Noise Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
        {/* Top glowing line */}
        <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        <div className="absolute left-1/2 right-0 top-0 h-[2px] w-1/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent blur-sm" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
        
        {/* BRAND */}
        <div className="lg:col-span-4">
          <Link to="/" className="group mb-5 inline-flex items-center gap-4">
             <img 
               src="/logo.png" 
               alt="Aivira Bookstore" 
               className="h-16 w-auto rounded-xl object-contain shadow-2xl transition-transform duration-500 group-hover:scale-105"
               style={{ boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}
             />
             <span className="flex flex-col leading-none text-white transition-opacity duration-500 group-hover:opacity-90">
               <span className="text-3xl font-black" style={{ fontFamily: "'Roboto', sans-serif" }}>
                 Aivira
               </span>
               <span className="mt-1 text-xs font-bold uppercase text-blue-200">
                 Bookstore
               </span>
             </span>
          </Link>
          <p className="max-w-sm text-sm font-light leading-relaxed text-blue-100/60">
            {t("footer.desc")}
          </p>

        </div>
        
        {/* LINKS GRID */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8 lg:gap-10">
          {/* CATEGORIES */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-blue-50/90">{t("common.categories")}</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link to="/category/business" className="transition-colors hover:text-blue-300">{t("footer.business")}</Link></li>
              <li><Link to="/category/self-help" className="transition-colors hover:text-blue-300">{t("footer.selfHelp")}</Link></li>
              <li><Link to="/category/literature" className="transition-colors hover:text-blue-300">{t("footer.literature")}</Link></li>
              <li><Link to="/category/skills" className="transition-colors hover:text-blue-300">{t("footer.skills")}</Link></li>
            </ul>
          </div>
          
          {/* AIVIRA */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-blue-50/90">Aivira</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li><Link to="/about" className="transition-colors hover:text-blue-300">{t("footer.ourStory")}</Link></li>
              <li><Link to="/account" className="transition-colors hover:text-blue-300">{t("common.account")}</Link></li>
              <li><Link to="/orders" className="transition-colors hover:text-blue-300">{t("footer.orderTracking")}</Link></li>
            </ul>
          </div>
          
          {/* CONTACT */}
          <div className="col-span-2 sm:col-span-1">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-blue-50/90">{t("footer.contact")}</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                <span className="transition-colors hover:text-blue-300">tavantien786@gmail.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                <span>{t("footer.location")}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-8 max-w-7xl border-t border-white/10 pt-3 text-center text-xs font-medium">
        <p>{t("footer.rights", { year })}</p>
      </div>

    </footer>
  );
}
