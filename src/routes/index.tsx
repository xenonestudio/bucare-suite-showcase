import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import heroBuilding from "@/assets/hero-building.jpg";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";


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

const nav = ["Inicio", "Residencias", "Servicios", "Contacto"];

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
    <div className="min-h-screen bg-background text-foreground">
      {/* Top meta bar */}
      <div className="hidden md:flex items-center justify-between px-10 py-4 text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
        <span>2026</span>
        <span>Real Estate — Nueva Guayana</span>
        <span>QQJC+93C San Cristóbal</span>
      </div>

      {/* Hero */}
      <section className="px-4 md:px-10 pb-10">
        <div className="relative overflow-hidden rounded-sm">
          <img
            src={heroBuilding}
            alt="Bucare Suite edificio residencial de lujo"
            width={1920}
            height={1200}
            className="w-full h-[88vh] min-h-[600px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-black/30" />

          {/* Nav overlay */}
          <header className="absolute top-0 inset-x-0 flex items-center justify-between px-6 md:px-10 py-6">
            <div className="text-display text-lg tracking-widest">BUCARE</div>
            <nav className="hidden md:flex items-center gap-8 text-sm">
            <Link to="/" className="hover:opacity-60 transition">Inicio</Link>
            <Link to="/residencias" className="hover:opacity-60 transition">Residencias</Link>
            <Link to="/areas" className="hover:opacity-60 transition">Áreas</Link>
            <Link to="/contacto" className="hover:opacity-60 transition">Contacto</Link>
            <Link to="/login" className="hover:opacity-60 transition">Ingresar</Link>
            </nav>
            <Link to="/contacto" className="flex items-center gap-2 text-sm border-b border-foreground pb-0.5">
              Reservar visita <ArrowUpRight className="w-4 h-4" />
            </Link>
          </header>

          {/* Hero text */}
          <div className="absolute inset-0 flex flex-col justify-between px-6 md:px-14 pt-32 pb-10">
            <div className="max-w-4xl">
              <h1 className="text-display text-[14vw] md:text-[9vw] leading-[0.9] text-foreground">
                HOGARES QUE<br />TE INSPIRAN
              </h1>
              <p className="mt-8 max-w-sm text-sm text-foreground/80">
                Traemos estilo, serenidad y lujo a través de arquitectura inteligente en el corazón de Nueva Guayana.
              </p>
              <a href="#residencias" className="mt-10 inline-flex items-center gap-2 text-sm tracking-[0.15em] uppercase border-b border-foreground pb-1">
                Explorar residencias <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full bg-muted-foreground/60 border-2 border-background" />
                  <div className="w-10 h-10 rounded-full bg-muted-foreground/40 border-2 border-background" />
                  <div className="w-10 h-10 rounded-full bg-muted-foreground/80 border-2 border-background" />
                </div>
                <div>
                  <div className="text-display text-2xl">50+</div>
                  <div className="text-xs text-foreground/70 max-w-[180px]">Especialistas dedicados a un vivir sostenible</div>
                </div>
              </div>

              <div className="hidden md:block bg-background/85 backdrop-blur-sm rounded-sm p-3 w-[320px]">
                <img src={property3} alt="Vista residencia" width={1000} height={700} loading="lazy" className="w-full h-40 object-cover rounded-sm" />
                <div className="mt-3">
                  <div className="text-sm font-medium">Encuentra el hogar que se ajusta a tu estilo</div>
                  <div className="mt-3 flex gap-2">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className={`h-px flex-1 ${i===1?"bg-foreground":"bg-foreground/25"}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Properties */}
      <section id="residencias" className="px-4 md:px-10 py-16 md:py-24">
        <div className="border border-border rounded-sm p-6 md:p-10">
          <div className="grid md:grid-cols-12 gap-6 md:gap-10 mb-10">
            <h2 className="md:col-span-6 text-display text-3xl md:text-5xl uppercase">
              ¿Y si tu próximo hogar<br />ya te estuviera esperando?
            </h2>
            <p className="md:col-span-3 text-xs uppercase tracking-[0.15em] text-muted-foreground leading-relaxed">
              Explora residencias completamente curadas — cuidadosamente seleccionadas, listas cuando tú lo estés.
            </p>
            <a href="#" className="md:col-span-3 flex items-start justify-end gap-2 text-sm tracking-[0.15em] uppercase">
              Ver todas las residencias <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative overflow-hidden rounded-sm group">
              <img src={properties[0].img} alt={properties[0].name} width={1200} height={900} loading="lazy" className="w-full h-[520px] object-cover group-hover:scale-[1.02] transition-transform duration-700" />
              <div className="absolute inset-x-0 bottom-0 p-6 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent text-background">
                <div className="text-display text-xl uppercase tracking-wide">{properties[0].name}</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-display text-2xl">{properties[0].price}</span>
                  <span className="text-xs opacity-80">/ {properties[0].area}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-rows-2 gap-6">
              {properties.slice(1).map((p) => (
                <div key={p.name} className="relative overflow-hidden rounded-sm group">
                  <img src={p.img} alt={p.name} width={1000} height={700} loading="lazy" className="w-full h-[248px] object-cover group-hover:scale-[1.02] transition-transform duration-700" />
                  <div className="absolute inset-x-0 bottom-0 p-5 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent text-background">
                    <div className="text-display text-lg uppercase tracking-wide">{p.name}</div>
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 md:px-10 pb-24">
        <div className="grid md:grid-cols-12 gap-10">
          <h2 className="md:col-span-5 text-display text-3xl md:text-5xl uppercase">
            Todo lo que necesitas<br />saber antes de encontrar<br />tu próximo hogar
          </h2>
          <div className="md:col-span-7">
            {faqs.map((f, i) => (
              <details key={f.q} className="border-t border-border py-6 group" open={i===0}>
                <summary className="flex items-start gap-6 cursor-pointer list-none">
                  <span className="text-xs text-muted-foreground mt-1 w-8">{String(i+1).padStart(2,"0")}</span>
                  <span className="text-display text-lg md:text-xl uppercase flex-1">{f.q}</span>
                  <span className="text-xl group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-4 pl-14 pr-8 text-sm text-muted-foreground leading-relaxed max-w-2xl">{f.a}</p>
              </details>
            ))}
            <div className="border-t border-border" />
          </div>
        </div>
      </section>

      {/* Contact / Footer */}
      <footer id="contacto" className="bg-foreground text-background px-4 md:px-10 py-16">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-6">
            <div className="text-xs tracking-[0.2em] uppercase opacity-60 mb-6">Visítanos</div>
            <h3 className="text-display text-4xl md:text-6xl uppercase leading-none">
              Bucare Suite<br />Nueva Guayana
            </h3>
            <a href="#" className="mt-8 inline-flex items-center gap-2 text-sm tracking-[0.15em] uppercase border-b border-background pb-1">
              Reservar una visita <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
          <div className="md:col-span-3 text-sm space-y-2">
            <div className="text-xs uppercase tracking-[0.15em] opacity-60 mb-3">Dirección</div>
            <p>QQJC+93C</p>
            <p>San Cristóbal 5001</p>
            <p>Nueva Guayana</p>
          </div>
          <div className="md:col-span-3 text-sm space-y-2">
            <div className="text-xs uppercase tracking-[0.15em] opacity-60 mb-3">Contacto</div>
            <p>hola@bucaresuite.com</p>
            <p>+58 (000) 000 0000</p>
            <p className="opacity-60 pt-6">© 2026 Bucare Suite</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
