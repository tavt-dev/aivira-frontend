import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  BookOpen,
  ChevronRight,
  ExternalLink,
  LayoutDashboard,
  CreditCard,
  LogOut,
  Moon,
  Percent,
  Shield,
  ShoppingBag,
  Star,
  Sun,
  Tag,
  Users,
  Menu,
  X,
  Newspaper
} from "lucide-react";
import { getTheme, toggleTheme } from "../../utils/theme.js";
import { logout as logoutRequest } from "../../api/authApi.js";
import LanguageSwitcher from "../../components/LanguageSwitcher.jsx";
import NotificationBell from "../../components/NotificationBell.jsx";
import { clearAuth, getCurrentUser, getRefreshToken } from "../../utils/storage.js";

/* ── Nav items ──────────────────────────────── */
const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "admin.dashboard", icon: LayoutDashboard, group: "main" },
  { to: "/admin/products",  label: "admin.products",  icon: BookOpen,         group: "main" },
  { to: "/admin/categories",label: "admin.categories",icon: Tag,              group: "main" },
  { to: "/admin/blog",      label: "admin.blog",      icon: Newspaper,        group: "main" },
  { to: "/admin/orders",    label: "admin.orders",    icon: ShoppingBag,      group: "sales" },
  { to: "/admin/discounts", label: "admin.discounts", icon: Percent,          group: "sales" },
  { to: "/admin/payments",  label: "admin.payments",  icon: CreditCard,       group: "sales" },
  { to: "/admin/reviews",   label: "admin.reviews",   icon: Star,             group: "people" },
  { to: "/admin/users",     label: "admin.users",     icon: Users,            group: "people" },
  { to: "/admin/permissions",label:"admin.permissions",icon: Shield,          group: "people" },
];

export default function AdminLayout() {
  const { t } = useTranslation();
  const [user, setUser]           = useState(getCurrentUser());
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark]       = useState(() => getTheme() === "dark");
  const navigate = useNavigate();

  /* ── Theme sync ── */
  useEffect(() => {
    const sync = () => setIsDark(getTheme() === "dark");
    window.addEventListener("aivira-theme", sync);
    return () => window.removeEventListener("aivira-theme", sync);
  }, []);

  /* ── Auth sync ── */
  useEffect(() => {
    const sync = () => setUser(getCurrentUser());
    window.addEventListener("aivira-auth", sync);
    return () => window.removeEventListener("aivira-auth", sync);
  }, []);

  function handleToggleTheme() { toggleTheme(); }

  async function logout() {
    const rt = getRefreshToken();
    try { if (rt) await logoutRequest(rt); } catch { /* ignore */ }
    finally {
      clearAuth();
      navigate("/?auth=login&next=/admin/dashboard", { replace: true });
    }
  }

  /* ── Group nav items ── */
  const groups = ["main", "sales", "people"];

  /* ── Sidebar inner ── */
  const SidebarContent = () => (
    <div className="admin-sidebar-inner">
      {/* Top accent bar */}
      <div className="admin-sidebar-top-bar" />

      {/* Brand */}
      <div className="admin-brand">
        <motion.div
          whileHover={{ scale: 1.08, rotate: 3 }}
          whileTap={{ scale: 0.94 }}
          className="admin-brand-icon"
        >
          <BookOpen size={18} color="#fff" />
        </motion.div>
        <Link to="/admin/dashboard" className="admin-brand-text">
          <span className="admin-brand-sub">{t("admin.panel")}</span>
          <span className="admin-brand-name">{t("admin.brand", "Aivira")}</span>
        </Link>
        <button
          type="button"
          className="admin-close-btn lg:hidden"
          onClick={() => setMobileOpen(false)}
        >
          <X size={18} />
        </button>
      </div>

      {/* Divider */}
      <div className="admin-divider" />

      {/* Nav */}
      <nav className="admin-nav">
        {groups.map((group) => {
          const items = NAV_ITEMS.filter((n) => n.group === group);
          if (!items.length) return null;
          return (
            <div key={group} className="admin-nav-group">

              {items.map(({ to, label, icon: Icon }, i) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    isActive ? "admin-nav-link admin-nav-link--active" : "admin-nav-link"
                  }
                >
                  {({ isActive }) => (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.04 }}
                      className="admin-nav-link-inner"
                    >
                      <span className={`admin-nav-icon ${isActive ? "admin-nav-icon--active" : ""}`}>
                        <Icon size={15} />
                      </span>
                      <span className="admin-nav-label">{t(label)}</span>
                      {isActive && (
                        <motion.span
                          layoutId="sidebar-pill"
                          className="admin-nav-chevron"
                          initial={false}
                          transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        >
                          <ChevronRight size={12} />
                        </motion.span>
                      )}
                    </motion.div>
                  )}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>


      {/* Bottom actions */}
      <div className="admin-sidebar-footer">
        <div className="admin-divider" style={{ marginBottom: "12px" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <Link
            to="/"
            target="_blank"
            className="admin-footer-link"
          >
            <ExternalLink size={14} />
            <span>{t("common.backToBookstore", "Về Bookstore")}</span>
          </Link>

          {/* Logout button — prominent */}
          <motion.button
            whileHover={{ scale: 1.01, x: 2 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={logout}
            className="admin-logout-btn"
          >
            <span className="admin-logout-icon">
              <LogOut size={15} />
            </span>
            <span>{t("admin.logout", "Đăng xuất")}</span>
          </motion.button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`admin-shell ${isDark ? "admin-dark" : "admin-light"}`}>
      {/* ── Mobile overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="admin-overlay"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Fixed Sidebar (desktop) ── */}
      <aside className="admin-sidebar admin-sidebar--desktop">
        <SidebarContent />
      </aside>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            className="admin-sidebar admin-sidebar--mobile"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main area ── */}
      <div className="admin-main">
        {/* Top bar */}
        <header className="admin-topbar">
          {/* Mobile menu toggle */}
          <button
            type="button"
            className="admin-menu-btn"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>


          {/* Right actions */}
          <div className="admin-topbar-right">
            <LanguageSwitcher compact />

            {/* Theme toggle */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={handleToggleTheme}
              title={isDark ? t("common.switchToLight") : t("common.switchToDark")}
              className={`admin-theme-btn ${isDark ? "admin-theme-btn--dark" : "admin-theme-btn--light"}`}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isDark ? "moon" : "sun"}
                  initial={{ scale: 0, rotate: -90, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0, rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isDark ? <Sun size={15} /> : <Moon size={15} />}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            <NotificationBell admin />

            {/* User chip */}
            <div className="admin-user-chip">
              <div className="admin-chip-avatar">
                {(user?.username || user?.email || "A")[0].toUpperCase()}
              </div>
              <span className="admin-chip-name">
                {user?.username || user?.email || t("admin.admin", "Admin")}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
