import { Link, useLocation } from "@tanstack/react-router";
import { ArrowUpRight, Menu, X, Phone, LayoutDashboard, User, LogOut } from "lucide-react";
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

  // Close mobile drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const navLinks = [
    { name: "Inicio", href: "/" },
    { name: "Residencias", href: "/residencias" },
    { name: "Áreas", href: "/areas" },
    { name: "Contacto", href: "/contacto" },
    ...(isAuthenticated
      ? [{ name: "Dashboard", href: "/dashboard", isDashboard: true }]
      : [{ name: "Ingresar", href: "/login", isDashboard: false }]),
  ];

  return (
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

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 lg:gap-10">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`relative py-1 text-[18px] font-medium tracking-wide transition-all duration-300 text-[#f5f2ec] flex items-center gap-1.5 ${
                  isActive
                    ? "font-bold text-[#f5f2ec]"
                    : "opacity-80 hover:opacity-100 hover:text-white"
                } ${link.isDashboard ? "text-accent font-semibold" : ""}`}
              >
                {link.isDashboard && <LayoutDashboard className="w-4 h-4 text-accent" />}
                <span>{link.name}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#f5f2ec] rounded-full animate-fade-in" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* CTA Button & Mobile Toggle */}
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

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2.5 rounded-full transition-all focus:outline-none border border-white/20 bg-white/10 text-[#f5f2ec] hover:bg-white/20"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 top-0 z-50 bg-neutral-950/98 backdrop-blur-2xl flex flex-col justify-between px-6 py-6 md:hidden animate-fade-in text-[#f5f2ec]">
          {/* Mobile Drawer Top */}
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
            <Link to="/" className="flex items-center" onClick={() => setIsOpen(false)}>
              <img src="/logo.png" alt="Bucare Suite" className="h-14 w-auto brightness-0 invert object-contain" />
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full bg-neutral-900 border border-neutral-700 text-[#f5f2ec]"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User info header if logged in */}
          {isAuthenticated && userEmail && (
            <div className="mt-4 p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent text-neutral-950 font-bold flex items-center justify-center text-xs">
                {userEmail[0].toUpperCase()}
              </div>
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-[#f5f2ec] truncate">{userEmail}</span>
                <span className="text-[10px] text-accent font-medium">Sesión Activa</span>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <div className="flex flex-col gap-6 my-auto py-6">
            <span className="text-[11px] tracking-[0.25em] uppercase text-neutral-400 font-semibold">
              Menú Principal
            </span>
            <nav className="flex flex-col gap-3">
              {navLinks.map((link, index) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                      isActive
                        ? "bg-[#f5f2ec] text-neutral-950 border-[#f5f2ec] font-bold shadow-md"
                        : "bg-neutral-900/60 border-neutral-800 text-[#f5f2ec] hover:bg-neutral-900 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-mono text-neutral-400">0{index + 1}</span>
                      <span className="text-[18px] font-bold tracking-wide">{link.name}</span>
                    </div>
                    <ArrowUpRight className="w-5 h-5 opacity-70" />
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer Info & CTA */}
          <div className="flex flex-col gap-3 pt-4 border-t border-neutral-800">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full border border-primary bg-primary text-white font-bold text-xs uppercase tracking-widest shadow-md transition-opacity hover:bg-primary/90 text-center"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Ir a Mi Panel de Control</span>
              </Link>
            ) : (
              <Link
                to="/contacto"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-full border border-[#f5f2ec] bg-[#f5f2ec] text-neutral-950 font-bold text-xs uppercase tracking-widest shadow-md transition-opacity hover:opacity-90 text-center"
              >
                <span>Reservar Visita Privada</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            )}

            <div className="flex items-center justify-between text-[11px] text-neutral-400 uppercase tracking-widest pt-1">
              <span>San Cristóbal</span>
              <span>Nueva Guayana</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
