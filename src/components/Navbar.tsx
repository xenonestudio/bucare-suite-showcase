import { Link, useLocation } from "@tanstack/react-router";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

interface NavbarProps {
  transparent?: boolean;
}

export function Navbar({ transparent = false }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Prevent scrolling when mobile menu is open
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

  return (
    <header
      className={`w-full z-40 transition-colors ${
        transparent
          ? "absolute top-0 inset-x-0 bg-gradient-to-b from-black/50 via-black/20 to-transparent text-white border-b border-white/10"
          : "relative bg-background border-b border-border text-foreground"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 md:px-10 py-3 md:py-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center group">
          <img
            src="/logo.png"
            alt="Bucare Suite"
            className="h-12 sm:h-14 md:h-16 w-auto transition-transform group-hover:scale-105"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`transition-opacity hover:opacity-75 relative py-1 ${
                  isActive ? "font-semibold opacity-100" : "opacity-80"
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* CTA & Mobile Toggle */}
        <div className="flex items-center gap-4">
          <Link
            to="/contacto"
            className={`hidden sm:inline-flex items-center gap-2 text-xs sm:text-sm font-medium border-b pb-0.5 transition-colors ${
              transparent
                ? "border-white hover:border-white/70 text-white"
                : "border-foreground hover:border-foreground/70 text-foreground"
            }`}
          >
            Reservar visita <ArrowUpRight className="w-4 h-4" />
          </Link>

          {/* Hamburger button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md transition-colors hover:bg-white/10 focus:outline-none"
            aria-label="Abrir menú"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 top-[60px] z-50 bg-background/95 backdrop-blur-md flex flex-col justify-between px-6 py-8 md:hidden animate-fade-in text-foreground">
          <div className="flex flex-col gap-6">
            <span className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground border-b border-border pb-2">
              Navegación
            </span>
            <nav className="flex flex-col gap-5 text-2xl font-serif">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`flex items-center justify-between py-2 border-b border-border/40 transition-colors ${
                      isActive ? "text-primary font-bold" : "text-foreground/90"
                    }`}
                  >
                    <span>{link.name}</span>
                    <ArrowUpRight className="w-5 h-5 opacity-60" />
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex flex-col gap-4 pt-6 border-t border-border">
            <Link
              to="/contacto"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-md bg-primary text-primary-foreground font-medium text-sm transition-opacity hover:opacity-90 text-center"
            >
              Reservar visita <ArrowUpRight className="w-4 h-4" />
            </Link>
            <div className="text-center text-xs text-muted-foreground tracking-widest uppercase mt-2">
              San Cristóbal — Nueva Guayana
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
