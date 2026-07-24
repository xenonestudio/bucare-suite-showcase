import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, Eye } from "lucide-react";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/residencias")({
  head: () => ({
    meta: [
      { title: "Residencias — Bucare Suite" },
      { name: "description", content: "Explora los 6 modelos de residencias disponibles en Bucare Suite, San Cristóbal, Nueva Guayana. Planos y renders de cada tipología." },
      { property: "og:title", content: "Residencias — Bucare Suite" },
      { property: "og:description", content: "6 modelos de residencias en Bucare Suite, San Cristóbal, Nueva Guayana." },
    ],
  }),
  component: Residencias,
});

type Model = {
  id: string;
  name: string;
  area: string;
  bedrooms: string;
  bathrooms: string;
  balcony: string;
  distribution: string[];
  plan: string;
  render: string;
};

const models: Model[] = [
  { 
    id: "01", name: "MODELO 01", area: "31.60 m²", bedrooms: "1 hab.", bathrooms: "1 baño", balcony: "Jardinera / Balcón frontal",
    distribution: ["Acceso / Ingreso central.", "Baño completo accesible cerca de la entrada.", "Área integradora de comedor y cocina lineal.", "Habitación principal integrada con vista y salida hacia el balcón/jardinera."],
    plan: "/modelos/mapa_modelo01.jpg", render: "/modelos/Imagen_modelo01.jpg"
  },
  { 
    id: "02", name: "MODELO 02", area: "45.03 m²", bedrooms: "1 hab.", bathrooms: "1 baño", balcony: "Balcón / Área verde frontal",
    distribution: ["Acceso / Ingreso con área de recibidor.", "Baño completo.", "Cocina en L / Comedor auxiliar circular.", "Zona de trabajo o escritorio.", "Habitación espaciosa con salida a balcón con jardines."],
    plan: "/modelos/mapa_modelo02.jpg", render: "/modelos/Imagen_modelo02.jpg"
  },
  { 
    id: "03", name: "MODELO 03", area: "56.70 m²", bedrooms: "2 hab.", bathrooms: "2 baños", balcony: "Balcón",
    distribution: ["Ingreso a la zona social (sala de estar).", "Cocina abierta integrada con barra/comedor.", "2 habitaciones (habitación principal con baño privado y habitación secundaria).", "2 baños completos.", "Balcón continuo en la fachada posterior/lateral."],
    plan: "/modelos/mapa_modelo03.jpg", render: "/modelos/Imagen_modelo03.jpg"
  },
  { 
    id: "04", name: "MODELO 04", area: "63.23 m²", bedrooms: "2 hab.", bathrooms: "2 baños", balcony: "Balcón",
    distribution: ["Ingreso con recibidor.", "Cocina amplia integrada a comedor central.", "Sala de estar acogedora.", "Habitación principal de gran tamaño y habitación secundaria.", "2 baños completos.", "Balcón."],
    plan: "/modelos/mapa_modelo04.jpg", render: "/modelos/Imagen_modelo04.jpg"
  },
  { 
    id: "05", name: "MODELO 05", area: "73.88 m²", bedrooms: "2 hab.", bathrooms: "2 baños", balcony: "Balcones amplios",
    distribution: ["Acceso con área de cocina en isla / barra desayunadora y área de servicios.", "Sala de estar amplia con salida directa a amplio balcón con vegetación.", "2 habitaciones de excelente tamaño.", "2 baños completos.", "Balcones extensos con jardineras."],
    plan: "/modelos/mapa_modelo05.jpg", render: "/modelos/Imagen_modelo05.jpg"
  },
  { 
    id: "06", name: "MODELO 06", area: "86.91 m²", bedrooms: "3 hab.", bathrooms: "2 baños", balcony: "Balcones",
    distribution: ["Es el modelo de mayor área del condominio.", "Acceso/Ingreso directo a área social con sala y amplio comedor.", "Cocina moderna en L integrando la zona social.", "3 habitaciones (habitación principal con baño suite y 2 habitaciones secundarias/estudio).", "2 baños completos.", "Múltiples balcón/jardineras que bordean los espacios principales."],
    plan: "/modelos/mapa_modelo06.jpg", render: "/modelos/Imagen_modelo06.jpg"
  },
];

function Residencias() {
  const [activeId, setActiveId] = useState(models[0].id);
  const [viewTab, setViewTab] = useState<"both" | "render" | "plan">("both");
  const active = models.find((m) => m.id === activeId) ?? models[0];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      {/* Meta strip */}
      <div className="hidden md:flex items-center justify-between px-10 py-3 text-[11px] tracking-[0.2em] uppercase text-muted-foreground border-b border-border/40">
        <span>Residencias</span>
        <span>6 tipologías disponibles</span>
        <span>QQJC+93C San Cristóbal</span>
      </div>

      {/* Header section */}
      <section className="px-5 sm:px-8 md:px-10 py-8 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-end">
          <h1 className="md:col-span-8 text-display text-3xl sm:text-5xl md:text-7xl uppercase leading-[0.95] font-bold">
            Seis formas<br />de vivir Bucare
          </h1>
          <p className="md:col-span-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Cada modelo está pensado para un ritmo de vida distinto. Selecciona una tipología para conocer su plano y ver cómo se materializa.
          </p>
        </div>
      </section>

      {/* Split screen: sidebar + detail */}
      <section className="px-4 sm:px-6 md:px-10 pb-16 sm:pb-24 flex-1">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border-t border-border pt-6">
          {/* Horizontal scrollable model selector on mobile, vertical list on desktop */}
          <aside className="md:col-span-4 lg:col-span-3">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3 font-semibold">
              Modelos disponibles
            </div>

            {/* Mobile horizontal scroll tabs */}
            <div className="flex md:hidden overflow-x-auto gap-2 pb-4 scrollbar-none snap-x">
              {models.map((m) => {
                const isActive = m.id === activeId;
                return (
                  <button
                    key={m.id}
                    onClick={() => setActiveId(m.id)}
                    className={`snap-start shrink-0 px-4 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all border ${
                      isActive
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {m.name} ({m.bedrooms})
                  </button>
                );
              })}
            </div>

            {/* Desktop vertical list */}
            <ul className="hidden md:flex flex-col">
              {models.map((m, i) => {
                const isActive = m.id === activeId;
                return (
                  <li key={m.id}>
                    <button
                      onClick={() => setActiveId(m.id)}
                      className={`w-full text-left flex items-start gap-4 py-4 border-t border-border transition-colors ${
                        isActive ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="text-xs mt-1 w-6 shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="text-display text-base lg:text-lg uppercase block">{m.name}</span>
                        <span className="text-xs opacity-70">{m.area} · {m.bedrooms}</span>
                      </span>
                      <ArrowUpRight
                        className={`w-4 h-4 mt-1 transition-transform ${
                          isActive ? "rotate-0 text-primary" : "-rotate-45 opacity-50"
                        }`}
                      />
                    </button>
                  </li>
                );
              })}
              <li className="border-t border-border" />
            </ul>
          </aside>

          {/* Detail View */}
          <div key={active.id} className="md:col-span-8 lg:col-span-9 animate-fade-in">
            {/* View Mode Switcher for small screens */}
            <div className="flex md:hidden items-center justify-center gap-2 mb-4 bg-muted/60 p-1 rounded-md">
              <button
                onClick={() => setViewTab("both")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition-colors ${
                  viewTab === "both" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground"
                }`}
              >
                Ambos
              </button>
              <button
                onClick={() => setViewTab("render")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition-colors ${
                  viewTab === "render" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground"
                }`}
              >
                Render
              </button>
              <button
                onClick={() => setViewTab("plan")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-sm transition-colors ${
                  viewTab === "plan" ? "bg-background shadow-xs text-foreground" : "text-muted-foreground"
                }`}
              >
                Plano
              </button>
            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(viewTab === "both" || viewTab === "render") && (
                <figure className="relative overflow-hidden rounded-md bg-muted border border-border">
                  <img
                    src={active.render}
                    alt={`Render ${active.name}`}
                    width={1600}
                    height={1200}
                    className="w-full h-[280px] sm:h-[380px] md:h-[500px] object-cover"
                  />
                  <figcaption className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.2em] bg-background/90 font-semibold px-2.5 py-1 rounded-xs shadow-xs">
                    Render Arquitectónico
                  </figcaption>
                </figure>
              )}

              {(viewTab === "both" || viewTab === "plan") && (
                <figure className="relative overflow-hidden rounded-md bg-white border border-border">
                  <img
                    src={active.plan}
                    alt={`Plano ${active.name}`}
                    width={1600}
                    height={1200}
                    className="w-full h-[280px] sm:h-[380px] md:h-[500px] object-contain p-2"
                  />
                  <figcaption className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.2em] bg-background/90 text-foreground font-semibold px-2.5 py-1 rounded-xs shadow-xs border border-border">
                    Plano de Distribución
                  </figcaption>
                </figure>
              )}
            </div>

            {/* Specs & Description */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-8 pt-8 border-t border-border">
              <div className="md:col-span-4">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1 font-medium">
                  Tipología {active.id}
                </div>
                <h2 className="text-display text-2xl sm:text-4xl uppercase font-bold">{active.name}</h2>
              </div>

              <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-muted/30 p-4 rounded-md border border-border/50">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">Área</div>
                  <div className="text-display text-lg sm:text-xl mt-0.5 text-primary font-bold">{active.area}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">Habitaciones</div>
                  <div className="text-display text-lg sm:text-xl mt-0.5 text-primary font-bold">{active.bedrooms}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">Baños</div>
                  <div className="text-display text-lg sm:text-xl mt-0.5 text-primary font-bold">{active.bathrooms}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">Balcón</div>
                  <div className="text-xs sm:text-sm mt-0.5 text-primary font-semibold">{active.balcony}</div>
                </div>
              </div>

              <div className="md:col-span-12 mt-4">
                <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3 font-semibold">
                  Distribución Interna
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {active.distribution.map((item, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/90 bg-background p-2.5 rounded-sm border border-border/40">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/contacto"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase bg-primary text-primary-foreground px-6 py-3.5 rounded-md hover:opacity-90 transition-opacity"
              >
                Agendar visita <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contacto"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase border border-border hover:bg-accent px-6 py-3.5 rounded-md transition-colors"
              >
                Solicitar información
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
