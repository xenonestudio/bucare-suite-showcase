import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto — Bucare Suite" },
      { name: "description", content: "Agenda una visita privada o solicita información sobre las residencias de Bucare Suite en San Cristóbal, Nueva Guayana." },
      { property: "og:title", content: "Contacto — Bucare Suite" },
      { property: "og:description", content: "Reserva tu visita a Bucare Suite en Nueva Guayana." },
    ],
  }),
  component: Contacto,
});

function Contacto() {
  const [sent, setSent] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between px-6 md:px-10 py-6 border-b border-border">
        <Link to="/" className="text-display text-lg tracking-widest">BUCARE</Link>
        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link to="/" className="hover:opacity-60 transition">Inicio</Link>
          <Link to="/residencias" className="hover:opacity-60 transition">Residencias</Link>
          <Link to="/areas" className="hover:opacity-60 transition">Áreas</Link>
          <Link to="/contacto" className="hover:opacity-60 transition font-medium">Contacto</Link>
        </nav>
        <Link to="/" className="flex items-center gap-2 text-sm">
          <ArrowLeft className="w-4 h-4" /> Volver
        </Link>
      </header>

      <div className="hidden md:flex items-center justify-between px-10 py-4 text-[11px] tracking-[0.2em] uppercase text-muted-foreground border-b border-border">
        <span>Contacto</span>
        <span>Agenda una visita privada</span>
        <span>QQJC+93C San Cristóbal</span>
      </div>

      <section className="grid md:grid-cols-2 min-h-[calc(100vh-120px)]">
        {/* Left: info */}
        <div className="px-6 md:px-14 py-16 md:py-24 border-r border-border flex flex-col justify-between">
          <div>
            <h1 className="text-display text-5xl md:text-7xl uppercase leading-[0.9]">
              Hablemos<br />de tu próximo<br />hogar
            </h1>
            <p className="mt-8 max-w-md text-sm text-muted-foreground">
              Nuestro equipo te atiende de lunes a sábado. Responde este formulario y agendaremos una visita privada al edificio o una llamada.
            </p>
          </div>

          <div className="mt-16 space-y-6 text-sm">
            <div className="flex items-start gap-4">
              <MapPin className="w-4 h-4 mt-1 shrink-0" />
              <div>
                <div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Dirección</div>
                QQJC+93C San Cristóbal 5001<br />Nueva Guayana
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Phone className="w-4 h-4 mt-1 shrink-0" />
              <div>
                <div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Teléfono</div>
                +58 000 000 0000
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Mail className="w-4 h-4 mt-1 shrink-0" />
              <div>
                <div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-1">Email</div>
                hola@bucaresuite.com
              </div>
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div className="px-6 md:px-14 py-16 md:py-24 bg-muted/30">
          {sent ? (
            <div className="h-full flex flex-col justify-center">
              <div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-4">Mensaje enviado</div>
              <h2 className="text-display text-3xl md:text-4xl uppercase leading-tight">
                Gracias.<br />Te contactaremos<br />pronto.
              </h2>
              <button
                onClick={() => setSent(false)}
                className="mt-10 self-start flex items-center gap-2 text-sm border-b border-foreground pb-0.5"
              >
                Enviar otro mensaje <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); setSent(true); }}
              className="space-y-8 max-w-lg"
            >
              <div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">Formulario</div>

              <Field label="Nombre completo" name="name" placeholder="Tu nombre" required />
              <Field label="Email" name="email" type="email" placeholder="tu@email.com" required />
              <Field label="Teléfono" name="phone" placeholder="+58 000 000 0000" />

              <div>
                <label className="block text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-2">Interés</label>
                <select className="w-full bg-transparent border-b border-border py-3 text-sm focus:outline-none focus:border-foreground">
                  <option>Agendar una visita</option>
                  <option>Información de residencias</option>
                  <option>Planes de financiamiento</option>
                  <option>Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-2">Mensaje</label>
                <textarea
                  rows={4}
                  placeholder="Cuéntanos qué buscas…"
                  className="w-full bg-transparent border-b border-border py-3 text-sm focus:outline-none focus:border-foreground resize-none"
                />
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 text-sm border-b border-foreground pb-0.5"
              >
                Enviar mensaje <ArrowUpRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

function Field({ label, name, type = "text", placeholder, required }: {
  label: string; name: string; type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-2">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full bg-transparent border-b border-border py-3 text-sm focus:outline-none focus:border-foreground placeholder:text-muted-foreground/60"
      />
    </div>
  );
}
