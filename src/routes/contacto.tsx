import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Mail, MapPin, Phone, Instagram, Globe } from "lucide-react";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useSiteContent } from "@/hooks/useSiteContent";
import { Skeleton } from "@/components/ui/skeleton";


export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto — Bucare Suite | Agenda tu Visita" },
      { name: "description", content: "Agenda una visita privada o solicita información sobre los apartamentos de Bucare Suite en San Cristóbal, Nueva Guayana. Recorridos presenciales y virtuales." },
      { property: "og:title", content: "Contacto — Bucare Suite | Agenda tu Visita" },
      { property: "og:description", content: "Reserva tu visita a Bucare Suite en Nueva Guayana y conoce los apartamentos disponibles." },
      { property: "og:url", content: "https://bucaresuite.com/contacto" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://bucaresuite.com/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Contacto — Bucare Suite" },
      { name: "twitter:description", content: "Agenda una visita privada a Bucare Suite. Recorridos presenciales y virtuales." },
      { name: "twitter:image", content: "https://bucaresuite.com/og-image.jpg" },
    ],
    links: [
      { rel: "canonical", href: "https://bucaresuite.com/contacto" },
    ],
  }),
  component: Contacto,
});

function Contacto() {
  const [sent, setSent] = useState(false);
  const { content, loading } = useSiteContent();
  const c = content.contacto;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      {/* Meta strip */}
      <div className="hidden md:flex items-center justify-between px-10 py-3 text-[11px] tracking-[0.2em] uppercase text-muted-foreground border-b border-border/40">
        <span>Contacto</span>
        <span>Agenda una visita privada</span>
        <span>QQJC+93C San Cristóbal</span>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 flex-1">
        {/* Left: Info */}
        <div className="px-5 sm:px-8 md:px-14 py-10 sm:py-16 md:py-24 border-b lg:border-b-0 lg:border-r border-border flex flex-col justify-between">
          <div>
            <h1 className="text-display text-3xl sm:text-5xl md:text-7xl uppercase leading-[0.95] font-bold whitespace-pre-line">
              {loading ? <Skeleton className="h-16 w-3/4 bg-primary/10" /> : c.title}
            </h1>
            <div className="mt-4 sm:mt-8 max-w-md text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-primary/10" />
                  <Skeleton className="h-4 w-5/6 bg-primary/10" />
                </div>
              ) : (
                c.subtitle
              )}
            </div>
          </div>

          <div className="mt-10 sm:mt-16 space-y-6 text-xs sm:text-sm">
            <div className="flex items-start gap-4">
              <MapPin className="w-4 h-4 mt-1 text-primary shrink-0" />
              <div>
                <div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-semibold mb-0.5">Dirección</div>
                <div>{loading ? <Skeleton className="h-4 w-48 bg-primary/10" /> : c.address}</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Phone className="w-4 h-4 mt-1 text-primary shrink-0" />
              <div>
                <div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-semibold mb-0.5">Teléfono</div>
                <div>{loading ? <Skeleton className="h-4 w-32 bg-primary/10" /> : c.phone}</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Mail className="w-4 h-4 mt-1 text-primary shrink-0" />
              <div>
                <div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-semibold mb-0.5">Email</div>
                <div>{loading ? <Skeleton className="h-4 w-40 bg-primary/10" /> : c.email}</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Instagram className="w-4 h-4 mt-1 text-primary shrink-0" />
              <div>
                <div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-semibold mb-0.5">Instagram</div>
                <a href="https://www.instagram.com/bucaresuite/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  @bucaresuite
                </a>
              </div>
            </div>

            <div className="pt-4 border-t border-border/50">
              <div className="flex items-start gap-3 p-3.5 rounded-lg bg-primary/5 border border-primary/20">
                <Globe className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <div className="text-xs">
                  <div className="font-semibold text-foreground">¿Resides en el exterior?</div>
                  <div className="text-muted-foreground mt-0.5">Coordinamos presentaciones virtuales 1 a 1 y brindamos asesoría legal/financiera para inversión remota segura.</div>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Right: Form */}
        <div className="px-5 sm:px-8 md:px-14 py-10 sm:py-16 md:py-24 bg-muted/30 flex items-center">
          {sent ? (
            <div className="w-full max-w-lg py-12 flex flex-col justify-center animate-fade-in">
              <div className="text-[11px] tracking-[0.2em] uppercase text-primary font-semibold mb-3">Mensaje enviado con éxito</div>
              <h2 className="text-display text-2xl sm:text-4xl uppercase leading-tight font-bold">
                Gracias.<br />Te contactaremos<br />muy pronto.
              </h2>
              <p className="mt-4 text-xs sm:text-sm text-muted-foreground">
                Un asesor especializado revisará tus preferencias y se pondrá en contacto contigo.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-8 self-start inline-flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-wider border-b border-foreground pb-0.5 hover:opacity-70 transition-opacity"
              >
                Enviar otro mensaje <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); setSent(true); }}
              className="space-y-6 sm:space-y-8 w-full max-w-lg"
            >
              <div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-semibold">Formulario de Reserva</div>

              <Field label="Nombre completo" name="name" placeholder="Tu nombre y apellido" required />
              <Field label="Correo electrónico" name="email" type="email" placeholder="tu@email.com" required />
              <Field label="Teléfono / WhatsApp" name="phone" placeholder="+58 424 000 0000" />

              <div>
                <label className="block text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-semibold mb-2">Motivo de Interés</label>
                <select className="w-full bg-transparent border-b border-border py-3 text-xs sm:text-sm focus:outline-none focus:border-foreground">
                  <option>Agendar una visita guiada</option>
                  <option>Información de modelos y apartamentos</option>
                  <option>Planes de financiamiento</option>
                  <option>Inversión inmobiliaria</option>
                  <option>Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-semibold mb-2">Mensaje o comentarios</label>
                <textarea
                  rows={4}
                  placeholder="Cuéntanos qué tipología buscas o tus fechas de preferencia..."
                  className="w-full bg-transparent border-b border-border py-3 text-xs sm:text-sm focus:outline-none focus:border-foreground resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase bg-primary text-primary-foreground px-8 py-3.5 rounded-md hover:opacity-90 active:scale-[0.98] transition-all duration-200 group"
              >
                Enviar mensaje <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Field({ label, name, type = "text", placeholder, required }: {
  label: string; name: string; type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-semibold mb-2">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full bg-transparent border-b border-border py-3 text-xs sm:text-sm focus:outline-none focus:border-foreground placeholder:text-muted-foreground/60"
      />
    </div>
  );
}
