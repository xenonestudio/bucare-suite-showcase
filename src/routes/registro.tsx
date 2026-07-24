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
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-background text-foreground">
      {/* Form Container */}
      <div className="flex flex-col px-5 sm:px-8 md:px-14 py-6 sm:py-10 md:py-14 md:order-1 justify-between">
        <div className="flex items-center justify-between">
          <Link to="/" className="md:hidden flex items-center">
            <img src="/logo.png" alt="Bucare Suite" className="h-10 w-auto" />
          </Link>
          <Link to="/" className="ml-auto inline-flex items-center gap-2 text-xs sm:text-sm font-medium hover:opacity-75 transition-opacity">
            <ArrowLeft className="w-4 h-4" /> Volver al inicio
          </Link>
        </div>

        <div className="my-auto py-8 max-w-md mx-auto w-full">
          <div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-semibold mb-3">Registro de Usuario</div>
          <h1 className="text-display text-3xl sm:text-4xl md:text-5xl uppercase leading-[0.95] font-bold mb-8 sm:mb-10">
            Crea tu<br />cuenta
          </h1>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
            <Field label="Nombre completo" name="name" placeholder="Tu nombre y apellido" />
            <Field label="Correo electrónico" name="email" type="email" placeholder="tu@email.com" />
            <Field label="Contraseña" name="password" type="password" placeholder="Mínimo 8 caracteres" />
            <Field label="Confirmar contraseña" name="password2" type="password" placeholder="••••••••" />

            <label className="flex items-start gap-3 text-xs text-muted-foreground cursor-pointer pt-2">
              <input type="checkbox" className="mt-0.5 accent-primary rounded-xs shrink-0" />
              <span>Acepto los términos de servicio y la política de privacidad de Bucare Suite.</span>
            </label>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-3.5 text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase rounded-md hover:opacity-90 transition-opacity shadow-sm"
            >
              Crear cuenta
            </button>
          </form>

          <p className="mt-8 text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            ¿Ya tienes una cuenta registrada?{" "}
            <Link to="/login" className="text-foreground font-semibold inline-flex items-center gap-1 border-b border-foreground pb-0.5 hover:opacity-75">
              Ingresar <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>

        <div className="text-center text-[10px] uppercase tracking-widest text-muted-foreground">
          © 2026 Bucare Suite — Todos los derechos reservados
        </div>
      </div>

      {/* Visual Background */}
      <div className="relative hidden md:block overflow-hidden md:order-2">
        <img src={property1} alt="Bucare Suite" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative h-full flex flex-col justify-between p-10 text-white">
          <div className="ml-auto text-[11px] tracking-[0.2em] uppercase opacity-80 font-semibold">San Cristóbal — Nueva Guayana</div>
          <div>
            <div className="text-[11px] tracking-[0.2em] uppercase opacity-80 mb-3 font-semibold font-mono">Únete a la comunidad</div>
            <h2 className="text-display text-4xl uppercase leading-[0.95] max-w-sm font-bold">
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
      <label htmlFor={name} className="block text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-semibold mb-1.5">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className="w-full bg-transparent border-b border-border py-2.5 text-xs sm:text-sm focus:outline-none focus:border-foreground placeholder:text-muted-foreground/60"
      />
    </div>
  );
}
