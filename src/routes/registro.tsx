import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import property1 from "@/assets/property-1.jpg";
import { useState } from "react";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";

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
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    passwordConfirm: "",
    phoneNumber: "",
    birthDate: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.passwordConfirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
          birthDate: formData.birthDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al crear la cuenta");
      }

      // Redirigir al login
      navigate({ to: "/login" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 bg-background text-foreground">
      {/* Form Container */}
      <div className="flex flex-col px-5 sm:px-8 md:px-14 py-6 sm:py-10 md:py-14 md:order-1 justify-between">
        <div className="flex items-center justify-between">
          <Link to="/" className="md:hidden flex items-center">
            <img src="/logo.png" alt="Bucare Suite" className="h-14 w-auto object-contain" />
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

          {error && (
            <div className="mb-4 text-xs font-semibold text-red-500 border border-red-500/20 bg-red-500/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <Field label="Nombre completo" name="fullName" placeholder="Tu nombre y apellido" value={formData.fullName} onChange={handleChange} autoComplete="name" />
            <Field label="Correo electrónico" name="email" type="email" placeholder="tu@email.com" value={formData.email} onChange={handleChange} autoComplete="email" />
            <Field label="Teléfono" name="phoneNumber" type="tel" placeholder="+584120000000" value={formData.phoneNumber} onChange={handleChange} autoComplete="tel" />
            <Field label="Fecha de Nacimiento" name="birthDate" type="date" placeholder="YYYY-MM-DD" value={formData.birthDate} onChange={handleChange} autoComplete="bday" />
            
            <div className="grid grid-cols-2 gap-4">
              <Field label="Contraseña" name="password" type="password" placeholder="Mínimo 8 caracteres" value={formData.password} onChange={handleChange} autoComplete="new-password" />
              <Field label="Confirmar" name="passwordConfirm" type="password" placeholder="••••••••" value={formData.passwordConfirm} onChange={handleChange} autoComplete="new-password" />
            </div>

            <label className="flex items-start gap-3 text-xs text-muted-foreground cursor-pointer pt-2">
              <input type="checkbox" required className="mt-0.5 accent-primary rounded-xs shrink-0" />
              <span>Acepto los términos de servicio y la política de privacidad de Bucare Suite.</span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-3.5 text-xs sm:text-sm font-semibold tracking-[0.15em] uppercase rounded-md hover:opacity-90 transition-opacity shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-4 text-[11px] tracking-[0.2em] uppercase text-muted-foreground">
            <span className="flex-1 h-px bg-border" /> o <span className="flex-1 h-px bg-border" />
          </div>

          <div className="mb-6">
            <GoogleLoginButton
              text="Registrarse con Google"
              onSuccess={(data) => {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                navigate({ to: "/" });
              }}
              onError={(msg) => setError(msg)}
            />
          </div>

          <p className="mt-6 text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
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

function Field({ 
  label, name, type = "text", placeholder, value, onChange, autoComplete 
}: {
  label: string; name: string; type?: string; placeholder?: string;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
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
        value={value}
        onChange={onChange}
        required
        autoComplete={autoComplete}
        className="w-full bg-transparent border-b border-border py-2.5 text-xs sm:text-sm focus:outline-none focus:border-foreground placeholder:text-muted-foreground/60"
      />
    </div>
  );
}
