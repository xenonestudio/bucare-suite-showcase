import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/areas")({
  head: () => ({
    meta: [
      { title: "Áreas Comunes — Bucare Suite | Coworking, Gym, Terraza" },
      { name: "description", content: "Descubre las áreas comunes de Bucare Suite: coworking, plaza central, lobby, entrada, gym y terraza social en San Cristóbal, Nueva Guayana." },
      { property: "og:title", content: "Áreas Comunes — Bucare Suite" },
      { property: "og:description", content: "Coworking, plaza, lobby, gym y terraza social en Bucare Suite, San Cristóbal." },
      { property: "og:url", content: "https://bucaresuite.com/areas" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://bucaresuite.com/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Áreas Comunes — Bucare Suite" },
      { name: "twitter:description", content: "Coworking, gym, terraza social y más en Bucare Suite, Nueva Guayana." },
      { name: "twitter:image", content: "https://bucaresuite.com/og-image.jpg" },
    ],
    links: [
      { rel: "canonical", href: "https://bucaresuite.com/areas" },
    ],
  }),
  component: Areas,
});

function Areas() {
  const { content, loading } = useSiteContent();
  const areasData = content.areas;
  const areasList = areasData.list || [];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      {/* Meta strip */}
      <div className="hidden md:flex items-center justify-between px-10 py-3 text-[11px] tracking-[0.2em] uppercase text-muted-foreground border-b border-border/40">
        <span>Áreas comunes</span>
        <span>{areasList.length} espacios compartidos</span>
        <span>QQJC+93C San Cristóbal</span>
      </div>

      {/* Title */}
      <section className="px-5 sm:px-8 md:px-10 py-8 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-end">
          <h1 className="md:col-span-8 text-display text-3xl sm:text-5xl md:text-7xl uppercase leading-[0.95] font-bold whitespace-pre-line">
            {loading ? <Skeleton className="h-16 w-3/4 bg-primary/10" /> : areasData.title}
          </h1>
          <div className="md:col-span-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full bg-primary/10" />
                <Skeleton className="h-4 w-11/12 bg-primary/10" />
                <Skeleton className="h-4 w-4/5 bg-primary/10" />
              </div>
            ) : (
              areasData.subtitle
            )}
          </div>
        </div>
      </section>

      {/* Responsive Grid */}
      <section className="px-4 sm:px-6 md:px-10 pb-16 sm:pb-24 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[360px] sm:h-[400px] rounded-lg bg-primary/5 border border-border/40" />
            ))
          ) : (
            areasList.map((area, i) => (
              <article
                key={area.id || i}
                className="relative overflow-hidden rounded-md group bg-muted border border-border/50 h-[360px] sm:h-[400px] flex flex-col justify-end"
              >
                <img
                  src={area.img}
                  alt={area.name}
                  width={1600}
                  height={1200}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                <div className="relative z-10 p-5 sm:p-6 text-white">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/70 font-semibold mb-1">
                    Espacio {String(i + 1).padStart(2, "0")}
                  </div>
                  <h2 className="text-display text-xl sm:text-2xl uppercase font-bold text-white mb-2 flex items-center justify-between">
                    <span>{area.name}</span>
                    <ArrowUpRight className="w-5 h-5 shrink-0 text-white/80 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed line-clamp-3">
                    {area.description}
                  </p>
                </div>
              </article>
            ))
          )}
        </div>
      </section>


      {/* CTA */}
      <section className="px-4 sm:px-6 md:px-10 pb-16 sm:pb-24">
        <div className="border border-border rounded-md p-6 sm:p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-muted/20">
          <div>
            <h3 className="text-display text-xl sm:text-3xl md:text-4xl uppercase font-bold">Vive el edificio completo</h3>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md">
              Agenda una visita privada y recorre cada una de las áreas comunes de Bucare Suite.
            </p>
          </div>
          <Link
            to="/contacto"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase bg-primary text-primary-foreground px-6 py-3.5 rounded-md hover:opacity-90 transition-opacity"
          >
            Reservar visita <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
