import { Link, useLocation } from "@tanstack/react-router";
import { ArrowUpRight, Menu, X, Phone } from "lucide-react";
import { useState, useEffect } from "react";

interface NavbarProps {
  transparent?: boolean;
}

export function Navbar({ transparent = false }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll detection for sticky background transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    { name: "Ingresar", href: "/login" },
  ];

  // Dynamic header styles based on transparent prop & scroll state
  const isOverlayTransparent = transparent && !scrolled;

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isOverlayTransparent
          ? "absolute top-0 inset-x-0 bg-gradient-to-b from-black/70 via-black/30 to-transparent text-white border-b border-white/10"
          : "bg-background/90 backdrop-blur-xl border-b border-border/60 text-foreground shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 md:px-10 py-3 sm:py-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center group gap-3">
          <img
            src="/logo.png"
            alt="Bucare Suite"
            className={`h-10 sm:h-12 md:h-14 w-auto transition-transform duration-300 group-hover:scale-105 ${
              isOverlayTransparent ? "brightness-200" : ""
            }`}
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-neutral-500/10 dark:bg-white/5 backdrop-blur-md p-1.5 rounded-full border border-border/30">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                  isActive
                    ? isOverlayTransparent
                      ? "bg-white text-neutral-950 shadow-sm"
                      : "bg-primary text-primary-foreground shadow-sm"
                    : isOverlayTransparent
                    ? "text-white/90 hover:text-white hover:bg-white/10"
                    : "text-foreground/80 hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* CTA Button & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <a
            href="tel:+584242831342"
            className={`hidden lg:flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              isOverlayTransparent
                ? "border-white/20 text-white/90 hover:bg-white/10"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-primary" />
            <span>0424 283 1342</span>
          </a>

          <Link
            to="/contacto"
            className={`hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] group ${
              isOverlayTransparent
                ? "bg-white text-neutral-950 hover:bg-neutral-100"
                : "bg-primary text-primary-foreground hover:opacity-95"
            }`}
          >
            <span>Reservar Visita</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`md:hidden p-2.5 rounded-full transition-all focus:outline-none border ${
              isOverlayTransparent
                ? "bg-black/30 border-white/20 text-white hover:bg-white/20"
                : "bg-muted border-border text-foreground hover:bg-muted/80"
            }`}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 top-0 z-50 bg-background/98 backdrop-blur-2xl flex flex-col justify-between px-6 py-6 md:hidden animate-fade-in text-foreground">
          {/* Mobile Drawer Top */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <Link to="/" className="flex items-center" onClick={() => setIsOpen(false)}>
              <img src="/logo.png" alt="Bucare Suite" className="h-10 w-auto" />
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full bg-muted border border-border text-foreground"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-6 my-auto py-6">
            <span className="text-[11px] tracking-[0.25em] uppercase text-muted-foreground font-semibold">
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
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary font-bold shadow-sm"
                        : "bg-muted/40 border-border/50 text-foreground hover:bg-muted font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono opacity-60">0{index + 1}</span>
                      <span className="text-lg uppercase tracking-wide">{link.name}</span>
                    </div>
                    <ArrowUpRight className="w-5 h-5 opacity-70" />
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Footer Info & CTA */}
          <div className="flex flex-col gap-4 pt-4 border-t border-border">
            <Link
              to="/contacto"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-full bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest shadow-md transition-opacity hover:opacity-90 text-center"
            >
              <span>Reservar Visita Privada</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground uppercase tracking-widest pt-1">
              <span>San Cristóbal</span>
              <span>Nueva Guayana</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
