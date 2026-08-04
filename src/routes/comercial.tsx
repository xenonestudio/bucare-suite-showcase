import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  MapPin, Phone, Mail, Instagram, Facebook, ArrowRight,
  ChevronDown, Menu, X, Building2, Users, Layers, Car,
  Coffee, ShoppingBag, Scissors, Zap, Shield, Star
} from "lucide-react";

export const Route = createFileRoute("/comercial")({
  head: () => ({
    meta: [
      { title: "Bucare Plaza — Plaza Comercial Premium | San Cristóbal" },
      { name: "description", content: "Bucare Plaza: el centro comercial boutique más exclusivo de Nueva Guayana. Espacios comerciales de primer nivel, arquitectura contemporánea y alto flujo peatonal." },
      { property: "og:title", content: "Bucare Plaza — Plaza Comercial Premium" },
      { property: "og:description", content: "Espacios comerciales de primer nivel y arquitectura contemporánea en Nueva Guayana." },
      { property: "og:image", content: "/logo.webp" },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "shortcut icon", href: "/favicon.ico" },
    ],
  }),
  component: BucarePlazaPage,
});

// ── Data ─────────────────────────────────────────────────────────────────────
const LOCALES = [
  { id: "01", nombre: "Hábito Café", categoria: "Gastronomía & Café", img: "/comercial/025.webp", desc: "Experiencia gastronómica curada con los mejores granos de especialidad. Terraza abierta con vista a la plaza.", area: "85 m²", status: "Ancla" },
  { id: "02", nombre: "Coralia Boutique", categoria: "Moda & Estilo", img: "/comercial/029.webp", desc: "Espacio fashion de alto nivel con selección curada de moda contemporánea y accesorios de diseñador.", area: "65 m²", status: "Activo" },
  { id: "03", nombre: "Beauty Lab", categoria: "Salud & Belleza", img: "/comercial/030.webp", desc: "Centro de estética y bienestar con los últimos tratamientos dermatológicos y cosméticos de vanguardia.", area: "70 m²", status: "Activo" },
  { id: "04", nombre: "Motors", categoria: "Automóvil & Lifestyle", img: "/comercial/028.webp", desc: "Showroom premium para vehículos y accesorios de alto rendimiento en un espacio arquitectónico único.", area: "120 m²", status: "Disponible" },
];

const VENTAJAS = [
  { num: "01", titulo: "Ubicación Estratégica Premium", desc: "Posicionado en el eje comercial más activo de San Cristóbal, con acceso directo desde las principales vías y visibilidad desde ambas calles laterales. Flujo peatonal estimado de 2,500 personas diarias." },
  { num: "02", titulo: "Arquitectura Contemporánea de Alto Impacto", desc: "Fachada moderna de concreto, vidrio templado y detalles en madera natural. Un edificio pensado para que cada local tenga presencia visual máxima desde el exterior." },
  { num: "03", titulo: "Concepto Mixto Comercial + Residencial", desc: "La planta baja alberga locales comerciales y la planta alta oficinas boutique y consultorios. Esto garantiza un flujo constante de clientes residentes de Bucare Suite durante todo el día." },
  { num: "04", titulo: "Seguridad y Operación 24/7", desc: "CCTV de última generación, personal de vigilancia y control de acceso vehicular. Tu negocio protegido en todo momento con sistemas integrados al edificio." },
  { num: "05", titulo: "Estacionamiento Privado Exclusivo", desc: "20 puestos de estacionamiento techados con iluminación LED, reservados para clientes y arrendatarios. Sin estrés de parqueo para tus visitantes." },
];

const STATS = [
  { valor: "1,200", unidad: "m²", label: "Área Total Construida" },
  { valor: "8",     unidad: "+",  label: "Locales Comerciales" },
  { valor: "2",     unidad: "",   label: "Niveles" },
  { valor: "20",    unidad: "",   label: "Puestos de Parking" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const C = {
  bg:     "#0A0A0A",
  card:   "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.09)",
  text:   "#F0EDE8",
  muted:  "#8A8A8A",
  gold:   "#E1B668",
  green:  "#213B26",
};

// ── Component ─────────────────────────────────────────────────────────────────
function BucarePlazaPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(0);
  const [scrolled, setScrolled] = useState(false);
  const [carouselIdx, setCarouselIdx] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const navLinks = [
    { label: "El Proyecto", id: "proyecto" },
    { label: "Espacios",    id: "espacios"  },
    { label: "Ventajas",    id: "ventajas"  },
    { label: "Galería",     id: "galeria"   },
  ];

  const prevSlide = () => setCarouselIdx(i => (i - 1 + LOCALES.length) % LOCALES.length);
  const nextSlide = () => setCarouselIdx(i => (i + 1) % LOCALES.length);

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: "'Inter', sans-serif", overflowX: "hidden" }}>

      {/* ══ NAVBAR ══════════════════════════════════════════════════════════ */}
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 5vw",
        background: scrolled ? "rgba(10,10,10,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.border}` : "none",
        transition: "all 0.35s ease",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: "72px",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <img 
            src="/comercial/logo_plaza.png" 
            alt="Bucare Plaza Logo" 
            style={{ 
              height: "52px", 
              objectFit: "contain",
              filter: "brightness(0) invert(1)" 
            }} 
          />
        </div>

        {/* Desktop nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: "32px" }} className="hidden-mobile">
          {navLinks.map(n => (
            <button key={n.id} onClick={() => scrollTo(n.id)}
              style={{ background: "none", border: "none", color: "#FFFFFF", fontSize: "0.95rem", fontWeight: 500, cursor: "pointer", transition: "color 0.2s", padding: 0 }}
              onMouseEnter={e => (e.currentTarget.style.color = C.gold)}
              onMouseLeave={e => (e.currentTarget.style.color = "#FFFFFF")}>
              {n.label}
            </button>
          ))}
          <button onClick={() => scrollTo("contacto")}
            style={{
              padding: "9px 22px", borderRadius: "99px",
              background: C.text, color: C.bg,
              fontWeight: 700, fontSize: "0.8rem", border: "none", cursor: "pointer",
              transition: "background 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = C.gold)}
            onMouseLeave={e => (e.currentTarget.style.background = C.text)}>
            Consultar Local
          </button>
        </nav>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(v => !v)}
          style={{ background: "none", border: "none", cursor: "pointer", display: "none" }}
          className="show-mobile">
          {menuOpen ? <X size={24} color={C.text} /> : <Menu size={24} color={C.text} />}
        </button>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 99,
          background: "rgba(10,10,10,0.97)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: "32px",
        }}>
          {navLinks.map(n => (
            <button key={n.id} onClick={() => scrollTo(n.id)}
              style={{ background: "none", border: "none", color: C.text, fontFamily: "'Archivo', sans-serif", fontSize: "2rem", fontWeight: 700, cursor: "pointer" }}>
              {n.label}
            </button>
          ))}
          <button onClick={() => scrollTo("contacto")}
            style={{ marginTop: "16px", padding: "12px 36px", borderRadius: "99px", background: C.gold, color: C.bg, fontWeight: 700, fontSize: "1rem", border: "none", cursor: "pointer" }}>
            Consultar Local
          </button>
        </div>
      )}

      {/* ══ HERO ════════════════════════════════════════════════════════════ */}
      <section style={{ position: "relative", height: "100dvh", minHeight: "600px", display: "flex", alignItems: "flex-end" }}>
        <img src="/comercial/025.jpeg" alt="Bucare Plaza"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        {/* Gradient overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(10,10,10,1) 0%, rgba(10,10,10,0.6) 40%, rgba(10,10,10,0.15) 100%)",
        }} />

        {/* Floating stat card — top right */}
        <div style={{
          position: "absolute", top: "100px", right: "5vw",
          background: "rgba(10,10,10,0.72)", backdropFilter: "blur(16px)",
          border: `1px solid rgba(225,182,104,0.3)`, borderRadius: "16px",
          padding: "18px 24px", minWidth: "160px",
        }}>
          <div style={{ color: C.muted, fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "6px" }}>Ocupación</div>
          <div style={{ color: C.gold, fontFamily: "'Archivo', sans-serif", fontSize: "2.4rem", fontWeight: 900, lineHeight: 1, letterSpacing: "-0.04em" }}>87%</div>
          <div style={{ color: C.muted, fontSize: "0.65rem", marginTop: "4px" }}>locales activos</div>
        </div>

        {/* Hero content */}
        <div style={{ position: "relative", zIndex: 1, padding: "0 5vw 8vh", width: "100%", maxWidth: "900px" }}>
          <p style={{ color: C.gold, fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px" }}>
            Plaza Comercial · San Cristóbal
          </p>
          <h1 style={{
            fontFamily: "'Archivo', sans-serif", fontWeight: 900,
            fontSize: "clamp(3.5rem, 10vw, 8rem)", letterSpacing: "-0.04em",
            lineHeight: 0.9, margin: "0 0 24px", color: C.text,
          }}>
            bucare<br />plaza<span style={{ color: C.gold }}>.</span>
          </h1>
          <p style={{ color: "rgba(240,237,232,0.65)", fontSize: "clamp(1rem, 2.5vw, 1.2rem)", maxWidth: "480px", lineHeight: 1.5, marginBottom: "36px" }}>
            El escenario comercial donde las mejores marcas de la ciudad encuentran su hogar.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button onClick={() => scrollTo("espacios")}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "14px 28px", borderRadius: "99px",
                background: C.gold, color: C.bg, fontWeight: 700, fontSize: "0.88rem",
                border: "none", cursor: "pointer", transition: "transform 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.03)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}>
              Ver Espacios <ArrowRight size={16} />
            </button>
            <button onClick={() => scrollTo("proyecto")}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "14px 28px", borderRadius: "99px",
                background: "rgba(255,255,255,0.08)", color: C.text,
                fontWeight: 600, fontSize: "0.88rem",
                border: `1px solid ${C.border}`, cursor: "pointer",
                backdropFilter: "blur(8px)",
              }}>
              El Proyecto
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: "absolute", bottom: "32px", right: "5vw", display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "1px", height: "48px", background: `linear-gradient(to bottom, transparent, ${C.gold})` }} />
          <span style={{ color: C.muted, fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", writingMode: "vertical-rl" }}>Scroll</span>
        </div>
      </section>

      {/* ══ STATS BAR ═══════════════════════════════════════════════════════ */}
      <section style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, padding: "48px 5vw" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "32px", maxWidth: "960px", margin: "0 auto" }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Archivo', sans-serif", fontSize: "clamp(2.5rem, 5vw, 3.5rem)", fontWeight: 900, letterSpacing: "-0.05em", lineHeight: 1, color: C.text }}>
                {s.valor}<span style={{ color: C.gold }}>{s.unidad}</span>
              </div>
              <div style={{ color: C.muted, fontSize: "0.72rem", marginTop: "8px", letterSpacing: "0.05em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ EL PROYECTO ════════════════════════════════════════════════════ */}
      <section id="proyecto" style={{ padding: "120px 5vw" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>
          {/* Text */}
          <div>
            <p style={{ color: C.gold, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "20px" }}>01 El Proyecto</p>
            <h2 style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.03em", lineHeight: 1.05, margin: "0 0 24px", color: C.text }}>
              Diseñado para el<br /><span style={{ color: C.gold }}>éxito de tu marca.</span>
            </h2>
            <p style={{ color: C.muted, fontSize: "0.95rem", lineHeight: 1.8, marginBottom: "20px" }}>
              Bucare Plaza es la plaza comercial boutique del proyecto Bucare, concebida como un ecosistema de marcas curadas que comparten valores: calidad, diseño y experiencia de cliente.
            </p>
            <p style={{ color: C.muted, fontSize: "0.95rem", lineHeight: 1.8, marginBottom: "36px" }}>
              Ubicada en la planta baja del complejo Bucare Suite &amp; Plaza, tiene frente a dos calles principales y comparte flujo de visitas con los residentes de las 60 unidades habitacionales de la torre.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { icon: MapPin, text: "San Cristóbal, Estado Táchira" },
                { icon: Building2, text: "Planta baja + segunda planta de oficinas" },
                { icon: Users, text: "Flujo estimado: 2,500 personas/día" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(225,182,104,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={16} color={C.gold} />
                  </div>
                  <span style={{ color: C.text, fontSize: "0.85rem" }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div style={{ position: "relative" }}>
            <div style={{ borderRadius: "20px", overflow: "hidden", aspectRatio: "4/3" }}>
              <img src="/comercial/027.jpeg" alt="Bucare Plaza día"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.5s ease" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")} />
            </div>
            {/* Floating label */}
            <div style={{
              position: "absolute", bottom: "24px", left: "24px",
              background: "rgba(10,10,10,0.82)", backdropFilter: "blur(12px)",
              border: `1px solid rgba(225,182,104,0.3)`, borderRadius: "14px",
              padding: "14px 20px",
            }}>
              <div style={{ color: C.gold, fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "2px" }}>En Preventa</div>
              <div style={{ color: C.text, fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.02em" }}>Locales Disponibles</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ LOCALES / MÓDULOS ═══════════════════════════════════════════════ */}
      <section id="espacios" style={{ padding: "80px 0 120px" }}>
        <div style={{ padding: "0 5vw", marginBottom: "48px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <p style={{ color: C.gold, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "12px" }}>02 Espacios Comerciales</p>
            <h2 style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", letterSpacing: "-0.03em", lineHeight: 1.05, margin: 0, color: C.text }}>
              Marcas que definen<br />la experiencia.
            </h2>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={prevSlide}
              style={{ width: "44px", height: "44px", borderRadius: "50%", background: C.card, border: `1px solid ${C.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = C.gold)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}>
              <ChevronDown size={18} color={C.text} style={{ transform: "rotate(90deg)" }} />
            </button>
            <button onClick={nextSlide}
              style={{ width: "44px", height: "44px", borderRadius: "50%", background: C.card, border: `1px solid ${C.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = C.gold)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = C.border)}>
              <ChevronDown size={18} color={C.text} style={{ transform: "rotate(-90deg)" }} />
            </button>
          </div>
        </div>

        {/* Cards carousel */}
        <div style={{ paddingLeft: "5vw", display: "flex", gap: "20px", overflowX: "auto", scrollbarWidth: "none", paddingBottom: "8px" }}>
          {LOCALES.map((local, i) => {
            const isActive = i === carouselIdx;
            return (
              <div key={local.id}
                style={{
                  flexShrink: 0,
                  width: isActive ? "clamp(280px, 35vw, 420px)" : "clamp(200px, 22vw, 280px)",
                  borderRadius: "20px", overflow: "hidden",
                  border: `1px solid ${isActive ? "rgba(225,182,104,0.4)" : C.border}`,
                  background: C.card, cursor: "pointer",
                  transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
                  boxShadow: isActive ? "0 20px 60px rgba(225,182,104,0.12)" : "none",
                }}
                onClick={() => setCarouselIdx(i)}>
                {/* Image */}
                <div style={{ aspectRatio: isActive ? "4/3" : "1/1", overflow: "hidden", position: "relative" }}>
                  <img src={local.img} alt={local.nombre}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.06)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")} />
                  <div style={{ position: "absolute", top: "14px", left: "14px" }}>
                    <span style={{
                      padding: "3px 10px", borderRadius: "99px", fontSize: "0.6rem", fontWeight: 700,
                      background: local.status === "Disponible" ? "rgba(225,182,104,0.9)" : "rgba(33,59,38,0.9)",
                      color: local.status === "Disponible" ? C.bg : "#a3d9a5",
                    }}>
                      {local.status}
                    </span>
                  </div>
                  <div style={{ position: "absolute", top: "14px", right: "14px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: "99px", fontSize: "0.6rem", fontWeight: 600, background: "rgba(10,10,10,0.6)", color: C.muted, backdropFilter: "blur(8px)" }}>
                      {local.id}
                    </span>
                  </div>
                </div>
                {/* Info */}
                <div style={{ padding: "20px" }}>
                  <div style={{ color: C.muted, fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>{local.categoria}</div>
                  <h3 style={{ color: C.text, fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: isActive ? "1.2rem" : "0.95rem", margin: "0 0 8px", letterSpacing: "-0.02em" }}>{local.nombre}</h3>
                  {isActive && <p style={{ color: C.muted, fontSize: "0.8rem", lineHeight: 1.6, margin: "0 0 14px" }}>{local.desc}</p>}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ color: C.gold, fontSize: "0.78rem", fontWeight: 700 }}>{local.area}</span>
                    {isActive && (
                      <button onClick={() => document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" })}
                        style={{ display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", color: C.gold, fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
                        Consultar <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ flexShrink: 0, width: "5vw" }} />
        </div>
      </section>

      {/* ══ ¿POR QUÉ BUCARE PLAZA? ══════════════════════════════════════════ */}
      <section id="ventajas" style={{ padding: "80px 5vw 120px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "start" }}>
          {/* Left: title + image */}
          <div>
            <p style={{ color: C.gold, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "20px" }}>03 Por qué Bucare Plaza</p>
            <h2 style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.03em", lineHeight: 1.05, margin: "0 0 40px", color: C.text }}>
              Todo lo que tu<br />negocio necesita.
            </h2>
            <div style={{ borderRadius: "20px", overflow: "hidden", aspectRatio: "4/5", position: "relative" }}>
              <img src="/comercial/030.jpeg" alt="Bucare Plaza exterior"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              <div style={{
                position: "absolute", bottom: "20px", left: "20px", right: "20px",
                background: "rgba(10,10,10,0.82)", backdropFilter: "blur(12px)",
                border: `1px solid rgba(225,182,104,0.25)`, borderRadius: "14px",
                padding: "16px 20px",
              }}>
                <div style={{ color: C.muted, fontSize: "0.62rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>Tu marca merece</div>
                <div style={{ color: C.text, fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.02em" }}>El mejor escenario.</div>
                <button onClick={() => scrollTo("contacto")}
                  style={{ marginTop: "12px", padding: "8px 20px", borderRadius: "99px", background: C.gold, color: C.bg, fontWeight: 700, fontSize: "0.75rem", border: "none", cursor: "pointer" }}>
                  Ver espacios →
                </button>
              </div>
            </div>
          </div>

          {/* Right: accordion */}
          <div style={{ paddingTop: "80px" }}>
            {VENTAJAS.map((v, i) => (
              <div key={v.num}
                style={{
                  borderBottom: `1px solid ${i === activeAccordion ? "rgba(225,182,104,0.3)" : C.border}`,
                  transition: "border-color 0.3s",
                }}>
                <button
                  onClick={() => setActiveAccordion(activeAccordion === i ? null : i)}
                  style={{
                    width: "100%", background: "none", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "24px 0", textAlign: "left", gap: "16px",
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <span style={{ color: C.gold, fontSize: "0.72rem", fontWeight: 700, fontFamily: "'Archivo', sans-serif", flexShrink: 0 }}>({v.num})</span>
                    <span style={{ color: activeAccordion === i ? C.text : C.muted, fontSize: "0.92rem", fontWeight: 600, transition: "color 0.2s" }}>{v.titulo}</span>
                  </div>
                  <ChevronDown size={16} color={activeAccordion === i ? C.gold : C.muted}
                    style={{ flexShrink: 0, transform: activeAccordion === i ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }} />
                </button>
                <div style={{
                  maxHeight: activeAccordion === i ? "200px" : "0px",
                  overflow: "hidden",
                  transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)",
                }}>
                  <p style={{ color: C.muted, fontSize: "0.84rem", lineHeight: 1.75, paddingBottom: "24px", paddingLeft: "42px" }}>
                    {v.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ GALERÍA ════════════════════════════════════════════════════════ */}
      <section id="galeria" style={{ padding: "0 5vw 120px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <p style={{ color: C.gold, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "20px" }}>04 Galería</p>
          <h2 style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", letterSpacing: "-0.03em", lineHeight: 1.05, margin: "0 0 40px", color: C.text }}>
            Una arquitectura que<br />habla por sí sola.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gridTemplateRows: "auto auto", gap: "12px" }}>
            <div style={{ gridRow: "span 2", borderRadius: "20px", overflow: "hidden", aspectRatio: "3/4" }}>
              <img src="/comercial/029.jpeg" alt="Vista exterior día"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.5s ease" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")} />
            </div>
            <div style={{ borderRadius: "20px", overflow: "hidden" }}>
              <img src="/comercial/028.jpeg" alt="Vista frontal"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.5s ease" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")} />
            </div>
            <div style={{ borderRadius: "20px", overflow: "hidden" }}>
              <img src="/comercial/030.jpeg" alt="Vista lateral"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.5s ease" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")} />
            </div>
          </div>
        </div>
      </section>

      {/* ══ CONTACTO ════════════════════════════════════════════════════════ */}
      <section id="contacto" style={{ padding: "0 5vw 120px" }}>
        <div style={{
          maxWidth: "1200px", margin: "0 auto",
          borderRadius: "24px", overflow: "hidden",
          display: "grid", gridTemplateColumns: "1fr 1fr",
          border: `1px solid ${C.border}`,
        }}>
          {/* Left: image + overlay */}
          <div style={{ position: "relative" }}>
            <img src="/comercial/027.jpeg" alt="Contacto"
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to right, rgba(10,10,10,0.85) 0%, rgba(10,10,10,0.3) 100%)",
            }} />
            <div style={{ position: "absolute", inset: 0, padding: "48px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <h2 style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 900, fontSize: "clamp(1.8rem, 3vw, 2.5rem)", letterSpacing: "-0.04em", color: C.text, margin: "0 0 12px" }}>
                Tu próximo local<br />empieza aquí.
              </h2>
              <p style={{ color: "rgba(240,237,232,0.65)", fontSize: "0.88rem", lineHeight: 1.6 }}>
                Agenda una visita y conoce los espacios disponibles de primera mano.
              </p>
              <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { icon: Phone, text: "+58 412-000-0000" },
                  { icon: Mail, text: "comercial@bucareplaza.com" },
                  { icon: MapPin, text: "San Cristóbal, Estado Táchira" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Icon size={15} color={C.gold} />
                    <span style={{ color: "rgba(240,237,232,0.8)", fontSize: "0.82rem" }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div style={{ background: "#111111", padding: "48px" }}>
            <p style={{ color: C.gold, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "12px" }}>Consultar Disponibilidad</p>
            <h3 style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-0.02em", color: C.text, margin: "0 0 32px" }}>
              Hablemos de tu proyecto.
            </h3>
            <form onSubmit={e => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { label: "Nombre completo", type: "text", placeholder: "Tu nombre" },
                { label: "Correo electrónico", type: "email", placeholder: "tu@correo.com" },
                { label: "Teléfono", type: "tel", placeholder: "+58 000-000-0000" },
              ].map(field => (
                <div key={field.label}>
                  <label style={{ display: "block", color: C.muted, fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>
                    {field.label}
                  </label>
                  <input type={field.type} placeholder={field.placeholder}
                    style={{
                      width: "100%", boxSizing: "border-box",
                      padding: "12px 16px", borderRadius: "10px",
                      background: "rgba(255,255,255,0.04)",
                      border: `1px solid ${C.border}`,
                      color: C.text, fontSize: "0.88rem",
                      outline: "none", transition: "border-color 0.2s",
                    }}
                    onFocus={e => (e.currentTarget.style.borderColor = C.gold)}
                    onBlur={e => (e.currentTarget.style.borderColor = C.border)} />
                </div>
              ))}
              <div>
                <label style={{ display: "block", color: C.muted, fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>
                  ¿Qué tipo de local te interesa?
                </label>
                <select style={{
                  width: "100%", padding: "12px 16px", borderRadius: "10px",
                  background: "#1a1a1a", border: `1px solid ${C.border}`,
                  color: C.text, fontSize: "0.88rem", outline: "none", cursor: "pointer",
                }}>
                  <option value="">Seleccionar...</option>
                  <option>Local comercial planta baja</option>
                  <option>Oficina / consultorio planta alta</option>
                  <option>Ambos</option>
                </select>
              </div>
              <button type="submit"
                style={{
                  marginTop: "8px", width: "100%", padding: "14px",
                  borderRadius: "12px", background: C.gold, color: C.bg,
                  fontWeight: 700, fontSize: "0.9rem", border: "none",
                  cursor: "pointer", transition: "transform 0.2s, opacity 0.2s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                Enviar Consulta <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════════════════ */}
      <footer style={{ borderTop: `1px solid ${C.border}`, padding: "60px 5vw 40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "48px", marginBottom: "48px", flexWrap: "wrap" }}>
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
                <img 
                  src="/comercial/logo_plaza.png" 
                  alt="Bucare Plaza Logo" 
                  style={{ 
                    height: "44px", 
                    objectFit: "contain",
                    filter: "brightness(0) invert(1)" 
                  }} 
                />
              </div>
              <p style={{ color: C.muted, fontSize: "0.82rem", lineHeight: 1.7, maxWidth: "300px", marginBottom: "20px" }}>
                El centro comercial boutique que redefine la experiencia de compra en San Cristóbal. Parte del ecosistema Bucare Suite &amp; Plaza.
              </p>
              <div style={{ display: "flex", gap: "12px" }}>
                {[Instagram, Facebook].map((Icon, i) => (
                  <a key={i} href="#" style={{
                    width: "36px", height: "36px", borderRadius: "50%",
                    background: C.card, border: `1px solid ${C.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "border-color 0.2s",
                  }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.borderColor = C.gold)}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.borderColor = C.border)}>
                    <Icon size={15} color={C.muted} />
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <div style={{ color: C.muted, fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>Navegación</div>
              {navLinks.map(n => (
                <button key={n.id} onClick={() => scrollTo(n.id)}
                  style={{ display: "block", background: "none", border: "none", color: C.muted, fontSize: "0.82rem", marginBottom: "10px", cursor: "pointer", padding: 0, textAlign: "left", transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = C.text)}
                  onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>
                  {n.label}
                </button>
              ))}
            </div>

            {/* Contact */}
            <div>
              <div style={{ color: C.muted, fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "16px" }}>Contacto</div>
              {[
                { icon: Phone, text: "+58 412-000-0000" },
                { icon: Mail, text: "comercial@bucareplaza.com" },
                { icon: MapPin, text: "San Cristóbal, Táchira" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <Icon size={13} color={C.gold} />
                  <span style={{ color: C.muted, fontSize: "0.8rem" }}>{text}</span>
                </div>
              ))}
              <Link to="/" style={{ display: "inline-block", marginTop: "8px", color: C.muted, fontSize: "0.75rem", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = C.gold)}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = C.muted)}>
                ← Bucare Suite
              </Link>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 900, fontSize: "clamp(2rem, 8vw, 5rem)", letterSpacing: "-0.05em", color: "rgba(255,255,255,0.04)", lineHeight: 1, userSelect: "none" }}>
              bucare plaza.
            </div>
            <span style={{ color: C.muted, fontSize: "0.72rem" }}>© 2026 Bucare Suite & Plaza. Todos los derechos reservados.</span>
          </div>
        </div>
      </footer>

      {/* ══ RESPONSIVE STYLES ════════════════════════════════════════════ */}
      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: block !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
        @media (max-width: 900px) {
          #proyecto > div,
          #ventajas > div,
          #contacto > div > div { grid-template-columns: 1fr !important; }
          footer > div > div:first-child { grid-template-columns: 1fr !important; }
          #galeria > div > div { grid-template-columns: 1fr !important; }
        }
        ::-webkit-scrollbar { display: none; }
        * { -webkit-font-smoothing: antialiased; }
      `}</style>
    </div>
  );
}
