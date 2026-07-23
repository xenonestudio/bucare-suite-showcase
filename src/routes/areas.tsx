import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/areas")({
  head: () => ({
    meta: [
      { title: "Áreas comunes — Bucare Suite" },
      { name: "description", content: "Descubre las 6 áreas comunes de Bucare Suite: coworking, plaza, lobby, entrada, gym y terraza social en San Cristóbal, Nueva Guayana." },
      { property: "og:title", content: "Áreas comunes — Bucare Suite" },
      { property: "og:description", content: "Coworking, plaza, lobby, entrada, gym y terraza social en Bucare Suite." },
    ],
  }),
  component: Areas,
});

type Area = {
  id: string;
  name: string;
  description: string;
  span: string;
  img: string;
};

const placeholder = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600";

const areas: Area[] = [
  {
    id: "coworking",
    name: "Coworking",
    description: "Espacio de trabajo compartido con iluminación natural, conectividad de alta velocidad y cabinas para videollamadas.",
    span: "md:col-span-4 md:row-span-2",
    img: placeholder,
  },
  {
    id: "plaza",
    name: "Plaza",
    description: "Plaza central paisajística con vegetación local, bancas y zonas de descanso al aire libre.",
    span: "md:col-span-4",
    img: placeholder,
  },
  {
    id: "lobby",
    name: "Lobby",
    description: "Recepción de doble altura con acabados en piedra, madera y iluminación cálida de bienvenida.",
    span: "md:col-span-4",
    img: placeholder,
  },
  {
    id: "entrada",
    name: "Entrada",
    description: "Acceso peatonal y vehicular con porte cochere, control de acceso y seguridad las 24 horas.",
    span: "md:col-span-4",
    img: placeholder,
  },
  {
    id: "gym",
    name: "Gym",
    description: "Gimnasio equipado con máquinas de cardio, pesas libres y zona funcional para entrenamiento completo.",
    span: "md:col-span-4",
    img: placeholder,
  },
  {
    id: "terraza",
    name: "Terraza social",
    description: "Rooftop con vistas a la ciudad, zona de lounge, barra gourmet y espacio para eventos sociales.",
    span: "md:col-span-4 md:row-span-2",
    img: placeholder,
  },
];

function Areas() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 md:px-10 py-6 border-b border-border">
        <Link to="/" className="text-display text-lg tracking-widest">BUCARE</Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link to="/" className="hover:opacity-60 transition">Inicio</Link>
          <Link to="/residencias" className="hover:opacity-60 transition">Residencias</Link>
          <Link to="/areas" className="hover:opacity-60 transition font-medium">Áreas</Link>
          <Link to="/contacto" className="hover:opacity-60 transition">Contacto</Link>
          <Link to="/login" className="hover:opacity-60 transition">Ingresar</Link>
        </nav>
        <Link to="/" className="flex items-center gap-2 text-sm">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
      </header>

      {/* Meta strip */}
      <div className="hidden md:flex items-center justify-between px-10 py-4 text-[11px] tracking-[0.2em] uppercase text-muted-foreground border-b border-border">
        <span>Áreas comunes</span>
        <span>6 espacios compartidos</span>
        <span>QQJC+93C San Cristóbal</span>
      </div>

      {/* Title */}
      <section className="px-6 md:px-10 py-12 md:py-20">
        <div className="grid md:grid-cols-12 gap-8">
          <h1 className="md:col-span-8 text-display text-4xl md:text-7xl uppercase leading-[0.9]">
            Vida más allá<br />de tu residencia
          </h1>
          <p className="md:col-span-4 text-sm text-muted-foreground self-end max-w-sm">
            Seis ambientes diseñados para trabajar, descansar, conectar y disfrutar sin salir de Bucare Suite.
          </p>
        </div>
      </section>

      {/* Bento grid */}
      <section className="px-4 md:px-10 pb-24">
        <div className="grid md:grid-cols-8 gap-4 md:gap-6">
          {areas.map((area, i) => (
            <article
              key={area.id}
              className={`relative overflow-hidden rounded-sm group bg-muted ${area.span}`}
            >
              <img
                src={area.img}
                alt={area.name}
                width={1600}
                height={1200}
                loading="lazy"
                className="w-full h-full min-h-[320px] md:min-h-0 object-cover group-hover:scale-[1.02] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 text-background">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] opacity-70 mb-2">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                    <h2 className="text-display text-2xl md:text-3xl uppercase">{area.name}</h2>
                    <p className="mt-2 text-sm opacity-80 max-w-md">{area.description}</p>
                  </div>
                  <ArrowUpRight className="w-6 h-6 shrink-0 opacity-80 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-10 pb-24">
        <div className="border border-border rounded-sm p-6 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-display text-2xl md:text-4xl uppercase">Vive el edificio completo</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">
              Agenda una visita privada y recorre cada una de las áreas comunes de Bucare Suite.
            </p>
          </div>
          <a
            href="/#contacto"
            className="inline-flex items-center gap-2 text-sm tracking-[0.15em] uppercase bg-foreground text-background px-5 py-3 rounded-sm"
          >
            Reservar visita <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
