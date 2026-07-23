import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import heroBuilding from "@/assets/hero-building.jpg";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Ingresar — Bucare Suite" },
      { name: "description", content: "Accede a tu cuenta de propietario o visitante de Bucare Suite." },
      { property: "og:title", content: "Ingresar — Bucare Suite" },
      { property: "og:description", content: "Portal privado de Bucare Suite." },
    ],
  }),
  component: Login,
});

function Login() {
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background text-foreground">
      {/* Left: visual */}
      <div className="relative hidden md:block overflow-hidden">
        <img src={heroBuilding} alt="Bucare Suite" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative h-full flex flex-col justify-between p-10 text-white">
          <Link to="/" className="text-display text-lg tracking-widest">BUCARE</Link>
          <div>
            <div className="text-[11px] tracking-[0.2em] uppercase opacity-80 mb-3">Portal privado</div>
            <h2 className="text-display text-4xl uppercase leading-[0.95] max-w-sm">
              Bienvenido<br />de vuelta
            </h2>
          </div>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex flex-col px-6 md:px-14 py-8 md:py-14">
        <div className="flex items-center justify-between">
          <Link to="/" className="md:hidden text-display text-lg tracking-widest">BUCARE</Link>
          <Link to="/" className="ml-auto flex items-center gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" /> Volver
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-4">Ingresar</div>
          <h1 className="text-display text-4xl md:text-5xl uppercase leading-[0.95] mb-10">
            Accede a<br />tu cuenta
          </h1>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <Field label="Email" name="email" type="email" placeholder="tu@email.com" />
            <Field label="Contraseña" name="password" type="password" placeholder="••••••••" />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" className="accent-foreground" />
                Recordarme
              </label>
              <a href="#" className="text-muted-foreground hover:text-foreground transition">¿Olvidaste tu contraseña?</a>
            </div>

            <button
              type="submit"
              className="w-full bg-foreground text-background py-4 text-sm tracking-[0.15em] uppercase hover:opacity-90 transition"
            >
              Ingresar
            </button>
          </form>

          <div className="my-8 flex items-center gap-4 text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
            <span className="flex-1 h-px bg-border" /> o <span className="flex-1 h-px bg-border" />
          </div>

          <p className="text-sm text-muted-foreground">
            ¿No tienes cuenta?{" "}
            <Link to="/registro" className="text-foreground inline-flex items-center gap-1 border-b border-foreground pb-0.5">
              Crear cuenta <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </p>
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
