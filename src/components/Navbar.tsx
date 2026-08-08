import { Link, useLocation } from "@tanstack/react-router";
import { ArrowUpRight, Menu, X, Phone, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";

interface NavbarProps {
  transparent?: boolean;
}

export function Navbar({ transparent = false }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      if (token) {
        setIsAuthenticated(true);
        if (user) {
          try {
            const parsed = JSON.parse(user);
            setUserEmail(parsed.email || "");
          } catch (e) {
            console.error("Error parsing user", e);
          }
        }
      }
    }
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const navLinks = [
    { name: "Inicio", href: "/" },
    { name: "Apartamentos", href: "/apartamentos" },
    { name: "Áreas Comunes", href: "/areas" },
    { name: "Contacto", href: "/contacto" },
    ...(!isAuthenticated ? [{ name: "Ingresar", href: "/login", isDashboard: false }] : []),
  ];

  return (
    <>
      {/* ─── Top Bar ─── */}
      <header
        className={`w-full z-40 transition-all duration-300 ${
          transparent
            ? "absolute top-0 inset-x-0 bg-neutral-950/40 backdrop-blur-md text-[#f5f2ec] border-b border-white/10"
            : "relative bg-neutral-900/90 backdrop-blur-xl border-b border-neutral-800 text-[#f5f2ec] shadow-md"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 sm:px-8 md:px-10 py-4 md:py-5">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center group gap-3">
            <img
              src="/logo.png"
              alt="Bucare Suite"
              className="h-14 sm:h-18 md:h-22 w-auto transition-transform duration-300 group-hover:scale-105 brightness-0 invert object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-10">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`relative py-1 text-[18px] font-medium tracking-wide transition-all duration-300 text-[#f5f2ec] flex items-center gap-1.5 ${
                    isActive ? "font-bold" : "opacity-80 hover:opacity-100 hover:text-white"
                  } ${"isDashboard" in link && link.isDashboard ? "text-accent font-semibold" : ""}`}
                >
                  {"isDashboard" in link && link.isDashboard && <LayoutDashboard className="w-4 h-4 text-accent" />}
                  <span>{link.name}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#f5f2ec] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* CTA + Hamburger */}
          <div className="flex items-center gap-3">
            <a
              href="tel:+584242831342"
              className="hidden lg:flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full border border-white/20 bg-white/5 text-[#f5f2ec] hover:bg-white/15 hover:border-white/40 transition-all duration-300"
            >
              <Phone className="w-3.5 h-3.5 text-accent" />
              <span>0424 283 1342</span>
            </a>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider border border-primary bg-primary text-white hover:bg-primary/90 transition-all duration-300 shadow-sm hover:scale-[1.02]"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Mi Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </Link>
            ) : (
              <Link
                to="/contacto"
                className="hidden sm:inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-[0.15em] border border-[#f5f2ec]/60 text-[#f5f2ec] hover:bg-[#f5f2ec] hover:text-neutral-950 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] group"
              >
                <span>Reservar Visita</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            )}

            {/* Hamburger button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2.5 rounded-full transition-all focus:outline-none border border-white/20 bg-white/10 text-[#f5f2ec] hover:bg-white/20"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ─── Mobile Full-Screen Glass Menu ─── */}
      {/* Rendered OUTSIDE header to avoid backdrop stacking context clipping */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "1.5rem",
          backgroundColor: "rgba(10, 10, 10, 0.92)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          color: "#f5f2ec",
          transition: "opacity 0.3s ease, transform 0.3s ease",
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? "scale(1)" : "scale(0.97)",
          pointerEvents: isOpen ? "auto" : "none",
        }}
        className="md:hidden"
      >
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1rem" }}>
          <Link to="/" onClick={() => setIsOpen(false)}>
            <img src="/logo.png" alt="Bucare Suite" style={{ height: "3rem", width: "auto", filter: "brightness(0) invert(1)", objectFit: "contain" }} />
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            style={{ padding: "0.5rem", borderRadius: "9999px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#f5f2ec", cursor: "pointer" }}
            aria-label="Cerrar menú"
          >
            <X style={{ width: "1.25rem", height: "1.25rem" }} />
          </button>
        </div>

        {/* Authenticated user badge */}
        {isAuthenticated && userEmail && (
          <div style={{ marginTop: "1rem", padding: "0.75rem", borderRadius: "0.75rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "2rem", height: "2rem", borderRadius: "9999px", background: "var(--color-accent, #c9a96e)", color: "#0a0a0a", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem" }}>
              {userEmail[0].toUpperCase()}
            </div>
            <div style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#f5f2ec", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userEmail}</span>
              <span style={{ fontSize: "0.625rem", color: "var(--color-accent, #c9a96e)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em" }}>Sesión Activa</span>
            </div>
          </div>
        )}

        {/* Nav links */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "1.5rem", padding: "2rem 0", overflowY: "auto" }}>
          <span style={{ fontSize: "0.625rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", fontWeight: 700 }}>
            Menú Principal
          </span>
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {navLinks.map((link, index) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.875rem 1rem",
                    borderRadius: "0.75rem",
                    border: isActive ? "1px solid #f5f2ec" : "1px solid rgba(255,255,255,0.08)",
                    background: isActive ? "#f5f2ec" : "rgba(255,255,255,0.04)",
                    color: isActive ? "#0a0a0a" : "#f5f2ec",
                    fontWeight: isActive ? 700 : 500,
                    textDecoration: "none",
                    transition: "background 0.2s ease, border-color 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span style={{ fontSize: "0.7rem", fontFamily: "monospace", color: isActive ? "#0a0a0a" : "rgba(255,255,255,0.3)" }}>0{index + 1}</span>
                    <span style={{ fontSize: "1.125rem", fontWeight: 700, letterSpacing: "0.02em" }}>{link.name}</span>
                  </div>
                  <ArrowUpRight style={{ width: "1rem", height: "1rem", opacity: 0.5 }} />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom CTA */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.875rem 1.5rem", borderRadius: "9999px", border: "1px solid #3b82f6", background: "#3b82f6", color: "#fff", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", textDecoration: "none" }}
            >
              <LayoutDashboard style={{ width: "1rem", height: "1rem" }} />
              <span>Ir a Mi Panel de Control</span>
            </Link>
          ) : (
            <Link
              to="/contacto"
              onClick={() => setIsOpen(false)}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.875rem 1.5rem", borderRadius: "9999px", border: "1px solid #f5f2ec", background: "#f5f2ec", color: "#0a0a0a", fontWeight: 700, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", textDecoration: "none" }}
            >
              <span>Reservar Visita Privada</span>
              <ArrowUpRight style={{ width: "1rem", height: "1rem" }} />
            </Link>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.625rem", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 600 }}>
            <span>San Cristóbal</span>
            <span>Nueva Guayana</span>
          </div>
        </div>
      </div>
    </>
  );
}
