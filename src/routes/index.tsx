import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import heroBuilding from "@/assets/hero-building.jpg";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bucare Suite — Residencias en Nueva Guayana" },
      { name: "description", content: "Bucare Suite: residencias contemporáneas en San Cristóbal, Nueva Guayana. Diseño, serenidad y lujo a través de arquitectura inteligente." },
      { property: "og:title", content: "Bucare Suite — Residencias en Nueva Guayana" },
      { property: "og:description", content: "Residencias contemporáneas en San Cristóbal, Nueva Guayana." },
    ],
  }),
  component: Index,
});

const properties = [
  { name: "PENTHOUSE BUCARE", price: "$524,000", area: "$6,390/m²", img: property1, big: true },
  { name: "VISTA CORDILLERA", img: property2 },
  { name: "SUITE MIRADOR", img: property3 },
];

const faqs = [
  { q: "¿Dónde se ubica Bucare Suite?", a: "En QQJC+93C, San Cristóbal 5001, Nueva Guayana. Un enclave privado con acceso rápido al centro y a los principales corredores de la ciudad." },
  { q: "¿Qué tipologías de residencia ofrecen?", a: "Suites de 1 y 2 habitaciones, penthouses y áticos con terraza. Cada unidad está finalizada con acabados premium y grandes ventanales." },
  { q: "¿Cómo puedo agendar una visita?", a: "Reserve una visita privada desde el botón superior o contáctenos directamente. Coordinamos recorridos guiados presenciales y virtuales." },
  { q: "¿Ofrecen planes de financiamiento?", a: "Sí. Trabajamos con planes personalizados y aliados financieros para adaptarnos a distintos perfiles de inversión." },
];

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top meta bar */}
      <div className="hidden md:flex items-center justify-between px-10 py-3 text-[11px] tracking-[0.2em] uppercase text-muted-foreground border-b border-border/40">
        <span>2026</span>
        <span>Real Estate — Nueva Guayana</span>
        <span>QQJC+93C San Cristóbal</span>
      </div>

      {/* Hero */}
      <section className="px-2 sm:px-4 md:px-10 pb-8 sm:pb-10 pt-2 sm:pt-4">
        <div className="relative overflow-hidden rounded-md sm:rounded-sm">
          <img
            src={heroBuilding}
            alt="Bucare Suite edificio residencial de lujo"
            width={1920}
            height={1200}
            className="w-full h-[75vh] sm:h-[85vh] md:h-[88vh] min-h-[460px] sm:min-h-[580px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/70" />

          {/* Nav overlay */}
          <Navbar transparent />

          {/* Hero text */}
          <div className="absolute inset-0 flex flex-col justify-between px-5 sm:px-8 md:px-14 pt-28 sm:pt-32 pb-8 sm:pb-10 text-white">
            <div className="max-w-3xl">
              <h1 className="text-display text-3xl sm:text-5xl md:text-[5vw] leading-[1.0] sm:leading-[0.9] font-bold tracking-tight text-white animate-fade-in-up">
                HOGARES QUE<br />TE INSPIRAN
              </h1>
              <p className="mt-4 sm:mt-6 max-w-md text-xs sm:text-sm text-neutral-200 leading-relaxed animate-fade-in-up delay-100">
                Traemos estilo, serenidad y lujo a través de arquitectura inteligente en el corazón de Nueva Guayana.
              </p>
              <a
                href="#residencias"
                className="mt-6 sm:mt-8 inline-flex items-center gap-2 text-xs sm:text-sm tracking-[0.15em] uppercase border-b border-white pb-1 animate-fade-in-up delay-200 group hover:border-white/70"
              >
                Explorar residencias <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 sm:gap-8 pt-4">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/40" />
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/30 backdrop-blur-md border-2 border-white/40" />
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/40 backdrop-blur-md border-2 border-white/40" />
                </div>
                <div>
                  <div className="text-display text-xl sm:text-2xl font-bold">50+</div>
                  <div className="text-[11px] sm:text-xs text-neutral-200 max-w-[180px]">
                    Especialistas dedicados a un vivir sostenible
                  </div>
                </div>
              </div>

              <div className="hidden lg:block bg-black/40 backdrop-blur-md border border-white/10 rounded-md p-3 w-[280px]">
                <img
                  src={property3}
                  alt="Vista residencia"
                  width={1000}
                  height={700}
                  loading="lazy"
                  className="w-full h-32 object-cover rounded"
                />
                <div className="mt-2 text-xs text-neutral-200 font-medium">
                  Encuentra el hogar que se ajusta a tu estilo
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Properties */}
      <section id="residencias" className="px-4 sm:px-6 md:px-10 py-12 sm:py-16 md:py-24">
        <div className="border border-border rounded-lg p-5 sm:p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-10">
            <div className="max-w-xl">
              <h2 className="text-display text-2xl sm:text-4xl md:text-5xl uppercase font-bold leading-tight">
                ¿Y si tu próximo hogar<br />ya te estuviera esperando?
              </h2>
              <p className="mt-3 text-xs sm:text-sm uppercase tracking-[0.15em] text-muted-foreground leading-relaxed">
                Explora residencias completamente curadas — cuidadosamente seleccionadas, listas cuando tú lo estés.
              </p>
            </div>
            <Link
              to="/residencias"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium tracking-[0.15em] uppercase border-b border-foreground pb-1 self-start md:self-end hover:opacity-70 transition-opacity"
            >
              Ver todas las residencias <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="relative overflow-hidden rounded-md group">
              <img
                src={properties[0].img}
                alt={properties[0].name}
                width={1200}
                height={900}
                loading="lazy"
                className="w-full h-[320px] sm:h-[420px] lg:h-[520px] object-cover group-hover:scale-[1.02] transition-transform duration-700"
              />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-end justify-between bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white gap-2 sm:gap-0">
                <div className="text-display text-lg sm:text-xl uppercase tracking-wide font-bold">{properties[0].name}</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-display text-xl sm:text-2xl font-bold">{properties[0].price}</span>
                  <span className="text-xs opacity-80">/ {properties[0].area}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2 gap-6">
              {properties.slice(1).map((p) => (
                <div key={p.name} className="relative overflow-hidden rounded-md group cursor-pointer">
                  <img
                    src={p.img}
                    alt={p.name}
                    width={1000}
                    height={700}
                    loading="lazy"
                    className="w-full h-[200px] sm:h-[248px] object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex items-end justify-between bg-gradient-to-t from-black/80 to-transparent text-white">
                    <div className="text-display text-base sm:text-lg uppercase tracking-wide font-bold">{p.name}</div>
                    <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 sm:px-6 md:px-10 pb-16 sm:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          <h2 className="lg:col-span-5 text-display text-2xl sm:text-4xl md:text-5xl uppercase font-bold leading-tight">
            Todo lo que necesitas<br className="hidden sm:inline" /> saber antes de encontrar<br className="hidden sm:inline" /> tu próximo hogar
          </h2>
          <div className="lg:col-span-7">
            {faqs.map((f, i) => (
              <details key={f.q} className="border-t border-border py-4 sm:py-6 group" open={i === 0}>
                <summary className="flex items-start gap-4 sm:gap-6 cursor-pointer list-none select-none">
                  <span className="text-xs text-muted-foreground mt-1 w-6 sm:w-8 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-display text-base sm:text-lg md:text-xl uppercase flex-1 font-semibold group-hover:text-primary transition-colors">
                    {f.q}
                  </span>
                  <span className="text-xl group-open:rotate-45 transition-transform duration-300 ease-out shrink-0">+</span>
                </summary>
                <p className="mt-3 sm:mt-4 pl-10 sm:pl-14 pr-2 sm:pr-8 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl animate-fade-in">
                  {f.a}
                </p>
              </details>
            ))}
            <div className="border-t border-border" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
