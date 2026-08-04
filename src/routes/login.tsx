import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import heroBuilding from "@/assets/hero-building.jpg";
import { useState } from "react";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";

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
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Credenciales inválidas");
      }

      // Guardar el token
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(data.data.user));

      // Reclamar / vincular sesión de chat si navegó previamente como invitado
      const guestToken = localStorage.getItem("bucare_guest_token");
      if (guestToken) {
        try {
          await fetch("/api/v1/chat/claim-guest-session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.data.token}`,
            },
            body: JSON.stringify({ guestToken }),
          });
        } catch (claimErr) {
          console.error("Error al vincular sesión de chat invitado:", claimErr);
        }
      }

      // Redirigir al home o dashboard
      navigate({ to: "/" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-background text-foreground">
      {/* Left: Visual background (hidden on small screens) */}
      <div className="relative hidden md:block overflow-hidden">
        <img src={heroBuilding} alt="Bucare Suite" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative h-full flex flex-col justify-between p-10 text-white">
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="Bucare Suite" className="h-16 w-auto brightness-200 object-contain" />
          </Link>
          <div>
            <div className="text-[11px] tracking-[0.2em] uppercase opacity-80 mb-2 font-semibold">Portal privado</div>
            <h2 className="text-display text-4xl uppercase leading-[0.95] max-w-sm font-bold">
              Bienvenido<br />de vuelta
            </h2>
          </div>
        </div>
      </div>

      {/* Right: Form Container */}
      <div className="flex flex-col px-5 sm:px-8 md:px-14 py-6 sm:py-10 md:py-14 justify-between">
        <div className="flex items-center justify-between">
          <Link to="/" className="md:hidden flex items-center">
            <img src="/logo.png" alt="Bucare Suite" className="h-14 w-auto object-contain" />
          </Link>
          <Link to="/" className="ml-auto inline-flex items-center gap-2 text-xs sm:text-sm font-medium hover:opacity-75 transition-opacity">
            <ArrowLeft className="w-4 h-4" /> Volver al inicio
          </Link>
        </div>

        <div className="my-auto py-8 max-w-md mx-auto w-full">
          <div className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground font-semibold mb-3">Acceso seguro</div>
          <h1 className="text-display text-3xl sm:text-4xl md:text-5xl uppercase leading-[0.95] font-bold mb-8 sm:mb-10">
            Accede a<br />tu cuenta
          </h1>

          {error && (
            <div className="mb-4 text-xs font-semibold text-red-500 border border-red-500/20 bg-red-500/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <Field 
              label="Correo electrónico" 
              name="email" 
              type="email" 
              placeholder="tu@email.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
            <Field 
              label="Contraseña" 
              name="password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                <input type="checkbox" className="accent-primary rounded-xs" />
                Recordarme
              </label>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">¿Olvidaste tu contraseña?</a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-3.5 text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase rounded-md hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4 text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
            <span className="flex-1 h-px bg-border" /> o <span className="flex-1 h-px bg-border" />
          </div>

          <div className="mb-8">
            <GoogleLoginButton
              text="Ingresar con Google"
              onSuccess={(data) => {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                navigate({ to: "/" });
              }}
              onError={(msg) => setError(msg)}
            />
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
            ¿No tienes una cuenta aún?{" "}
            <Link to="/registro" className="text-foreground font-semibold inline-flex items-center gap-1 border-b border-foreground pb-0.5 hover:opacity-75">
              Crear cuenta <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>

        <div className="text-center text-[10px] uppercase tracking-widest text-muted-foreground">
          © 2026 Bucare Suite — Todos los derechos reservados
        </div>
      </div>
    </div>
  );
}

function Field({ 
  label, name, type = "text", placeholder, value, onChange, autoComplete 
}: {
  label: string; name: string; type?: string; placeholder?: string;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
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
        value={value}
        onChange={onChange}
        required
        autoComplete={autoComplete}
        className="w-full bg-transparent border-b border-border py-3 text-xs sm:text-sm focus:outline-none focus:border-foreground placeholder:text-muted-foreground/60"
      />
    </div>
  );
}
