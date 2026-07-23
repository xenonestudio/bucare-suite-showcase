import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import property1 from "@/assets/property-1.jpg";

export const Route = createFileRoute("/registro")({
  head: () => ({
    meta: [
      { title: "Crear cuenta — Bucare Suite" },
      { name: "description", content: "Regístrate para acceder al portal de Bucare Suite y agendar visitas privadas." },
      { property: "og:title", content: "Crear cuenta — Bucare Suite" },
      { property: "og:description", content: "Portal privado de Bucare Suite." },
    ],
  }),
  component: Registro,
});

function Registro() {
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background text-foreground">
      {/* Left: form */}
      <div className="flex flex-col px-6 md:px-14 py-8 md:py-14 md:order-1">
        <div className="flex items-center justify-between">
          <Link to="/" className="md:hidden text-display text-lg tracking-widest">BUCARE</Link>
          <Link to="/" className="ml-auto flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full py-10">
          <div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-4">Registro</div>
          <h1 className="text-display text-4xl md:text-5xl uppercase leading-[0.95] mb-10">
            Crea tu<br />cuenta
          </h1>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <Field label="Nombre completo" name="name" placeholder="Tu nombre" />
            <Field label="Email" name="email" type="email" placeholder="tu@email.com" />
            <Field label="Contraseña" name="password" type="password" placeholder="Mínimo 8 caracteres" />
            <Field label="Confirmar contraseña" name="password2" type="password" placeholder="••••••••" />

            <label className="flex items-start gap-3 text-xs text-muted-foreground">
              <input type="checkbox" className="mt-0.5 accent-foreground" />
              <span>Acepto los términos de servicio y la política de privacidad de Bucare Suite.</span>
            </label>

            <button
              type="submit"
              className="w-full bg-foreground text-background py-4 text-sm tracking-[0.15em] uppercase hover:opacity-90 transition"
            >
              Crear cuenta
            </button>
          </form>

          <p className="mt-8 text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-foreground inline-flex items-center gap-1 border-b border-foreground pb-0.5">
              Ingresar <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>
      </div>

      {/* Right: visual */}
      <div className="relative hidden md:block overflow-hidden md:order-2">
        <img src={property1} alt="Bucare Suite" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative h-full flex flex-col justify-between p-10 text-white">
          <div className="ml-auto text-[11px] tracking-[0.2em] uppercase opacity-80">Nueva Guayana</div>
          <div>
            <div className="text-[11px] tracking-[0.2em] uppercase opacity-80 mb-3">Únete</div>
            <h2 className="text-display text-4xl uppercase leading-[0.95] max-w-sm">
              Vive Bucare<br />desde adentro
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, name, type = "text", placeholder }: {
  label: string; name: string; type?: string; placeholder?: string;
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
        className="w-full bg-transparent border-b border-border py-3 text-sm focus:outline-none focus:border-foreground placeholder:text-muted-foreground/60"
      />
    </div>
  );
}
