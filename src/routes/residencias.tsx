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
  description: string;
  plan: string;
  render: string;
};

// TODO: reemplazar imágenes con los planos y renders reales del cliente
const placeholder = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600";
const placeholderPlan = "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1600";

const models: Model[] = [
  { id: "A", name: "MODELO A", area: "62 m²", bedrooms: "1 hab.", bathrooms: "1 baño", description: "Suite compacta con vista abierta y cocina integrada al salón principal.", plan: placeholderPlan, render: placeholder },
  { id: "B", name: "MODELO B", area: "78 m²", bedrooms: "2 hab.", bathrooms: "2 baños", description: "Distribución balanceada con área social amplia y dormitorios en ala privada.", plan: placeholderPlan, render: placeholder },
  { id: "C", name: "MODELO C", area: "94 m²", bedrooms: "2 hab.", bathrooms: "2 baños", description: "Residencia con estudio adicional y terraza continua al comedor.", plan: placeholderPlan, render: placeholder },
  { id: "D", name: "MODELO D", area: "112 m²", bedrooms: "3 hab.", bathrooms: "2 baños", description: "Tipología familiar con cocina cerrada opcional y vestier en suite principal.", plan: placeholderPlan, render: placeholder },
  { id: "E", name: "MODELO E", area: "138 m²", bedrooms: "3 hab.", bathrooms: "3 baños", description: "Planta amplia con doble exposición y balcón continuo en fachada.", plan: placeholderPlan, render: placeholder },
  { id: "F", name: "PENTHOUSE", area: "196 m²", bedrooms: "4 hab.", bathrooms: "4 baños", description: "Ático de dos niveles con terraza panorámica y acceso privado por ascensor.", plan: placeholderPlan, render: placeholder },
];

function Residencias() {
  const [activeId, setActiveId] = useState(models[0].id);
  const active = models.find((m) => m.id === activeId) ?? models[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 md:px-10 py-6 border-b border-border">
        <Link to="/" className="text-display text-lg tracking-widest">BUCARE</Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link to="/" className="hover:opacity-60 transition">Inicio</Link>
          <Link to="/residencias" className="hover:opacity-60 transition font-medium">Residencias</Link>
          <Link to="/areas" className="hover:opacity-60 transition">Áreas</Link>
          <a href="/#contacto" className="hover:opacity-60 transition">Contacto</a>
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
          <div className="md:col-span-8 lg:col-span-9">
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
              <div className="md:col-span-5">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
                  Tipología {active.id}
                </div>
                <h2 className="text-display text-3xl md:text-5xl uppercase">{active.name}</h2>
              </div>
              <div className="md:col-span-4 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Área</div>
                  <div className="text-display text-xl mt-1">{active.area}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Hab.</div>
                  <div className="text-display text-xl mt-1">{active.bedrooms}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Baños</div>
                  <div className="text-display text-xl mt-1">{active.bathrooms}</div>
                </div>
              </div>
              <p className="md:col-span-3 text-sm text-muted-foreground leading-relaxed">
                {active.description}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/#contacto"
                className="inline-flex items-center gap-2 text-sm tracking-[0.15em] uppercase bg-foreground text-background px-5 py-3 rounded-sm"
              >
                Agendar visita <ArrowUpRight className="w-4 h-4" />
              </a>
              <a
                href="/#contacto"
                className="inline-flex items-center gap-2 text-sm tracking-[0.15em] uppercase border border-foreground px-5 py-3 rounded-sm"
              >
                Solicitar ficha técnica
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
