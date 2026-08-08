import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, Maximize2, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";


export const Route = createFileRoute("/apartamentos")({
  head: () => ({
    meta: [
      { title: "Apartamentos — Bucare Suite" },
      { name: "description", content: "Explora los 6 modelos de apartamentos disponibles en Bucare Suite, San Cristóbal, Nueva Guayana. Planos y renders de cada tipología." },
      { property: "og:title", content: "Apartamentos — Bucare Suite" },
      { property: "og:description", content: "6 modelos de apartamentos en Bucare Suite, San Cristóbal, Nueva Guayana." },
      { property: "og:image", content: "/logo.webp" },
    ],
  }),
  component: Apartamentos,
});

type Model = {
  id: string;
  name: string;
  area: string;
  bedrooms: string;
  bathrooms: string;
  balcony: string;
  parking?: string;
  distribution: string[];
  plan: string;
  render: string;
  gallery?: string[];
};

function Apartamentos() {
  const { content } = useSiteContent();
  const resData = content.apartamentos;
  const models = resData.models || [];

  const [activeId, setActiveId] = useState(models[0]?.id || "01");
  const [viewTab, setViewTab] = useState<"both" | "render" | "plan">("both");
  const [zoomModal, setZoomModal] = useState<{ open: boolean; src: string; title: string }>({ open: false, src: "", title: "" });
  const [zoomScale, setZoomScale] = useState(1);

  const active = models.find((m) => m.id === activeId) ?? models[0];

  const handleZoomIn = () => setZoomScale((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomScale((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoomScale(1);


  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      {/* Meta strip */}
      <div className="hidden md:flex items-center justify-between px-10 py-3 text-[11px] tracking-[0.2em] uppercase text-muted-foreground border-b border-border/40">
        <span>Apartamentos</span>
        <span>{models.length} tipologías disponibles</span>
        <span>QQJC+93C San Cristóbal</span>
      </div>

      {/* Header section */}
      <section className="px-5 sm:px-8 md:px-10 py-8 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-end">
          <h1 className="md:col-span-8 text-display text-3xl sm:text-5xl md:text-7xl uppercase leading-[0.95] font-bold whitespace-pre-line">
            {resData.title}
          </h1>
          <p className="md:col-span-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {resData.subtitle}
          </p>
        </div>
      </section>

      {/* Estructura del Proyecto */}
      <section className="px-4 sm:px-6 md:px-10 pb-14 border-t border-border/40">
        <div className="pt-8 sm:pt-10">
          {/* Label */}
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground font-semibold mb-8">
            Estructura del Proyecto
          </p>

          {/* Stats row */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-0 mb-10">
            {[
              { value: "2", label: "Torres" },
              { value: "6", label: "Pisos c/u" },
              { value: "76", label: "Apartamentos" },
              { value: "33", label: "Módulo A" },
              { value: "43", label: "Módulo B" },
            ].map(({ value, label }, i) => (
              <div key={i} className="border-l border-border/60 px-4 sm:px-6 py-2 first:border-l-0 sm:first:border-l">
                <div className="text-display text-3xl sm:text-5xl text-primary font-bold leading-none">{value}</div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-1.5 font-medium">{label}</div>
              </div>
            ))}
          </div>

          {/* Two-column breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border/40">
            {/* Módulo A */}
            <div className="bg-background py-6 pr-6 md:pr-10 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-[0.18em] text-accent font-semibold">Módulo A</span>
                <span className="text-[10px] text-muted-foreground tracking-wider uppercase">Torre Principal &amp; Servicios</span>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary shrink-0 mt-0.5">—</span>
                  <span><strong className="text-foreground/80">Planta Baja:</strong> Lobby premium, Coworking, Gimnasio, Administración y 3 unidades residenciales.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary shrink-0 mt-0.5">—</span>
                  <span><strong className="text-foreground/80">Pisos 1–6:</strong> 30 apartamentos con vistas panorámicas.</span>
                </li>
              </ul>
              <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground uppercase tracking-wider">Total</span>
                <span className="text-display text-lg text-accent">33</span>
              </div>
            </div>

            {/* Módulo B */}
            <div className="bg-background py-6 pl-6 md:pl-10 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-[0.18em] text-accent font-semibold">Módulo B</span>
                <span className="text-[10px] text-muted-foreground tracking-wider uppercase">Torre Habitacional</span>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary shrink-0 mt-0.5">—</span>
                  <span><strong className="text-foreground/80">Uso exclusivo:</strong> Bloque 100% residencial para máxima privacidad y confort.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary shrink-0 mt-0.5">—</span>
                  <span>43 apartamentos distribuidos en 6 niveles.</span>
                </li>
              </ul>
              <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs font-semibold">
                <span className="text-muted-foreground uppercase tracking-wider">Total</span>
                <span className="text-display text-lg text-accent">43</span>
              </div>
            </div>
          </div>
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
                <figure
                  onClick={() => setZoomModal({ open: true, src: active.render, title: `Render Arquitectónico — ${active.name}` })}
                  className="relative overflow-hidden rounded-md bg-muted border border-border group cursor-zoom-in"
                >
                  <img
                    src={active.render}
                    alt={`Render ${active.name}`}
                    width={1600}
                    height={1200}
                    className="w-full h-[280px] sm:h-[380px] md:h-[500px] object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                  />
                  <figcaption className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.2em] bg-background/90 font-semibold px-2.5 py-1 rounded-xs shadow-xs">
                    Render Arquitectónico
                  </figcaption>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-semibold text-xs uppercase tracking-wider">
                    <Maximize2 size={16} /> Ver Pantalla Completa & Zoom
                  </div>
                </figure>
              )}

              {(viewTab === "both" || viewTab === "plan") && (
                <figure
                  onClick={() => setZoomModal({ open: true, src: active.plan, title: `Plano de Distribución — ${active.name}` })}
                  className="relative overflow-hidden rounded-md bg-white border border-border group cursor-zoom-in"
                >
                  <img
                    src={active.plan}
                    alt={`Plano ${active.name}`}
                    width={1600}
                    height={1200}
                    className="w-full h-[280px] sm:h-[380px] md:h-[500px] object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                  />
                  <figcaption className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.2em] bg-background/90 text-foreground font-semibold px-2.5 py-1 rounded-xs shadow-xs border border-border">
                    Plano de Distribución
                  </figcaption>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-semibold text-xs uppercase tracking-wider">
                    <Maximize2 size={16} /> Ver Pantalla Completa & Zoom
                  </div>
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
                <div className="inline-flex items-center gap-1.5 mt-3 px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-semibold tracking-wider uppercase rounded-xs">
                  {active.parking || (active.id === "06" ? "2 puestos de estacionamiento" : "1 puesto de estacionamiento")}
                </div>
              </div>

              <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-5 gap-4 bg-muted/30 p-4 rounded-md border border-border/50">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">Área</div>
                  <div className="text-display text-lg sm:text-xl mt-0.5 text-primary font-bold">{active.area}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">Estacionamiento</div>
                  <div className="text-xs sm:text-sm mt-0.5 text-primary font-semibold">{active.parking || (active.id === "06" ? "2 puestos" : "1 puesto")}</div>
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

              {/* Plan de Financiamiento */}
              {(() => {
                const total = active.financingTotal || {
                  "01": "43.895", "02": "61.640", "03": "79.845", "04": "88.015", "05": "101.170", "06": "118.980"
                }[active.id];
                const inicial = active.financingInicial || {
                  "01": "15.365", "02": "21.575", "03": "27.945", "04": "30.805", "05": "35.410", "06": "41.645"
                }[active.id];
                const cuotasNro = active.financingCuotasNro || "12";
                const cuotaMonto = active.financingCuotasMonto || {
                  "01": "2.195", "02": "3.275", "03": "4.380", "04": "4.875", "05": "5.670", "06": "6.750"
                }[active.id];
                const cuotaUnica = active.financingCuotaUnica || "5.000";

                if (!total) return null;
                return (
                  <div className="md:col-span-12 mt-6 pt-6 border-t border-border">
                    {/* Section label */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                        Plan de Financiamiento
                      </div>
                      <div className="text-[10px] text-muted-foreground italic">
                        * Precios Agosto 2026 · Sujetos a cambios
                      </div>
                    </div>

                    {/* Price Total Hero */}
                    <div className="bg-primary/5 border border-primary/20 rounded-md px-5 py-4 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-1">
                          Precio Total del Apartamento
                        </div>
                        <div className="text-display text-3xl sm:text-4xl font-bold text-primary leading-none">
                          ${total} <span className="text-sm font-normal text-muted-foreground">USD</span>
                        </div>
                      </div>
                      <div className="shrink-0 inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/25 rounded-xs text-[10px] font-semibold uppercase tracking-wider text-primary">
                        Inicial 35% + {cuotasNro} Cuotas + Cuota Única
                      </div>
                    </div>

                    {/* Financing breakdown cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Card: Inicial */}
                      <div className="bg-background border border-border/60 rounded-md p-4">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-2">
                          Inicial (35%)
                        </div>
                        <div className="text-display text-2xl font-bold text-foreground leading-none">
                          ${inicial}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1">USD · Pago al reservar</div>
                      </div>

                      {/* Card: Cuotas */}
                      <div className="bg-background border border-border/60 rounded-md p-4">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-2">
                          {cuotasNro} Cuotas Mensuales
                        </div>
                        <div className="text-display text-2xl font-bold text-foreground leading-none">
                          ${cuotaMonto}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1">USD / mes · Durante construcción</div>
                      </div>

                      {/* Card: Cuota Única */}
                      <div className="bg-background border border-border/60 rounded-md p-4">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground font-semibold mb-2">
                          Cuota Única al Cierre
                        </div>
                        <div className="text-display text-2xl font-bold text-foreground leading-none">
                          ${cuotaUnica}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1">USD · Al momento de entrega</div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Galería del Modelo */}
              {active && (
                <div className="md:col-span-12 mt-6">
                  <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3 font-semibold">
                    Galería del Modelo
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(active.gallery && active.gallery.length > 0
                      ? active.gallery
                      : [active.render, active.plan].filter(Boolean)
                    ).map((imgUrl, index) => (
                      <div
                        key={index}
                        onClick={() => setZoomModal({ open: true, src: imgUrl, title: `Galería — ${active.name}` })}
                        className="relative aspect-video sm:aspect-square overflow-hidden rounded-md border border-border bg-muted cursor-zoom-in group"
                      >
                        <img
                          src={imgUrl}
                          alt={`${active.name} vista ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Maximize2 className="text-white w-5 h-5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

      {/* Modal Visor Pantalla Completa & Zoom */}
      <Dialog
        open={zoomModal.open}
        onOpenChange={(open) => {
          if (!open) setZoomScale(1);
          setZoomModal((prev) => ({ ...prev, open }));
        }}
      >
        <DialogContent className="max-w-[95vw] w-full max-h-[92vh] h-full p-0 overflow-hidden bg-black/95 border border-white/10 text-white flex flex-col">
          {/* Header del Modal con Controles */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40 backdrop-blur-md shrink-0">
            <DialogTitle className="text-sm sm:text-base font-semibold tracking-wide text-white">
              {zoomModal.title}
            </DialogTitle>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                className="h-8 px-2.5 bg-white/10 hover:bg-white/20 text-white border-white/20"
                title="Acercar (Zoom In)"
              >
                <ZoomIn size={16} />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                className="h-8 px-2.5 bg-white/10 hover:bg-white/20 text-white border-white/20"
                title="Alejar (Zoom Out)"
              >
                <ZoomOut size={16} />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetZoom}
                className="h-8 px-2.5 bg-white/10 hover:bg-white/20 text-white border-white/20"
                title="Restablecer (Reset)"
              >
                <RotateCcw size={14} />
              </Button>
              <span className="text-xs font-mono text-white/70 min-w-[42px] text-center">
                {Math.round(zoomScale * 100)}%
              </span>
            </div>
          </div>

          {/* Área de Visualización Panorámica */}
          <div className="flex-1 overflow-auto p-4 flex items-center justify-center relative cursor-grab active:cursor-grabbing select-none">
            <img
              src={zoomModal.src}
              alt={zoomModal.title}
              style={{ transform: `scale(${zoomScale})` }}
              className="max-w-full max-h-full object-contain transition-transform duration-200 ease-out origin-center"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
