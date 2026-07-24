import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import { useState } from "react";

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
  const active = models.find((m) => m.id === activeId) ?? models[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 md:px-10 py-4 border-b border-border">
        <Link to="/" className="flex items-center">
          <img src="/logo.png" alt="Bucare Suite" className="h-14 md:h-20 w-auto" />
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link to="/" className="hover:opacity-60 transition">Inicio</Link>
          <Link to="/residencias" className="hover:opacity-60 transition font-medium">Residencias</Link>
          <Link to="/areas" className="hover:opacity-60 transition">Áreas</Link>
          <Link to="/contacto" className="hover:opacity-60 transition">Contacto</Link>
          <Link to="/login" className="hover:opacity-60 transition">Ingresar</Link>
        </nav>
        <Link to="/" className="flex items-center gap-2 text-sm">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
      </header>

      {/* Meta strip */}
      <div className="hidden md:flex items-center justify-between px-10 py-4 text-[11px] tracking-[0.2em] uppercase text-muted-foreground border-b border-border">
        <span>Residencias</span>
        <span>6 tipologías disponibles</span>
        <span>QQJC+93C San Cristóbal</span>
      </div>

      {/* Title */}
      <section className="px-6 md:px-10 py-12 md:py-20">
        <div className="grid md:grid-cols-12 gap-8">
          <h1 className="md:col-span-8 text-display text-4xl md:text-7xl uppercase leading-[0.9]">
            Seis formas<br />de vivir Bucare
          </h1>
          <p className="md:col-span-4 text-sm text-muted-foreground self-end max-w-sm">
            Cada modelo está pensado para un ritmo de vida distinto. Selecciona una tipología para conocer su plano y ver cómo se materializa.
          </p>
        </div>
      </section>

      {/* Split screen: sidebar + detail */}
      <section className="px-4 md:px-10 pb-24">
        <div className="grid md:grid-cols-12 gap-6 border-t border-border pt-6">
          {/* Sidebar model selector */}
          <aside className="md:col-span-4 lg:col-span-3">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
              Modelos
            </div>
            <ul className="flex flex-col">
              {models.map((m, i) => {
                const isActive = m.id === activeId;
                return (
                  <li key={m.id}>
                    <button
                      onClick={() => setActiveId(m.id)}
                      className={`w-full text-left flex items-start gap-4 py-4 border-t border-border transition-colors ${
                        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="text-xs mt-1 w-8 shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="text-display text-lg uppercase block">{m.name}</span>
                        <span className="text-xs opacity-70">{m.area} · {m.bedrooms}</span>
                      </span>
                      <ArrowUpRight
                        className={`w-4 h-4 mt-1 transition-transform ${
                          isActive ? "rotate-0" : "-rotate-45 opacity-50"
                        }`}
                      />
                    </button>
                  </li>
                );
              })}
              <li className="border-t border-border" />
            </ul>
          </aside>

          {/* Detail */}
          <div key={active.id} className="md:col-span-8 lg:col-span-9 animate-fade-in">
            <div className="grid md:grid-cols-2 gap-4">
              <figure className="relative overflow-hidden rounded-sm bg-muted">
                <img
                  src={active.render}
                  alt={`Render ${active.name}`}
                  width={1600}
                  height={1200}
                  className="w-full h-[420px] md:h-[560px] object-cover"
                />
                <figcaption className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.2em] bg-background/85 px-2 py-1 rounded-sm">
                  Render
                </figcaption>
              </figure>
              <figure className="relative overflow-hidden rounded-sm bg-muted">
                <img
                  src={active.plan}
                  alt={`Plano ${active.name}`}
                  width={1600}
                  height={1200}
                  className="w-full h-[420px] md:h-[560px] object-contain bg-white"
                />
                <figcaption className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.2em] bg-background/85 px-2 py-1 rounded-sm">
                  Plano
                </figcaption>
              </figure>
            </div>

            <div className="grid md:grid-cols-12 gap-6 mt-8 pt-8 border-t border-border">
              <div className="md:col-span-4">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
                  Modelo {active.id}
                </div>
                <h2 className="text-display text-3xl md:text-5xl uppercase">{active.name}</h2>
              </div>
              <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Área</div>
                  <div className="text-display text-xl mt-1 text-primary">{active.area}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Habitaciones</div>
                  <div className="text-display text-xl mt-1 text-primary">{active.bedrooms}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Baños</div>
                  <div className="text-display text-xl mt-1 text-primary">{active.bathrooms}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Balcón</div>
                  <div className="text-sm mt-1 text-primary font-medium">{active.balcony}</div>
                </div>
              </div>
              
              <div className="md:col-span-12 mt-4">
                <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-3">Distribución</div>
                <ul className="grid md:grid-cols-2 gap-x-6 gap-y-2">
                  {active.distribution.map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-foreground/80">
                      <span className="text-accent mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/contacto"
                className="inline-flex items-center gap-2 text-sm tracking-[0.15em] uppercase bg-primary text-background px-5 py-3 rounded-sm hover:bg-primary/90 transition-colors"
              >
                Agendar visita <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contacto"
                className="inline-flex items-center gap-2 text-sm tracking-[0.15em] uppercase border border-primary text-primary px-5 py-3 rounded-sm hover:bg-primary/10 transition-colors"
              >
                Solicitar ficha técnica
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
