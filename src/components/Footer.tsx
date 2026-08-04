import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

export function Footer() {
  const { content } = useSiteContent();
  const c = content.contacto;

  return (
    <footer className="bg-neutral-900 text-neutral-200 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <img src="/logo.png" alt="Bucare Suite" className="h-16 md:h-20 w-auto brightness-0 invert object-contain" />
            </Link>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-xs">
              Residencias contemporáneas de alta gama en San Cristóbal, Nueva Guayana. Arquitectura inteligente y serenidad atemporal.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-4">
              Navegación
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/residencias" className="hover:text-white transition-colors">
                  Residencias
                </Link>
              </li>
              <li>
                <Link to="/areas" className="hover:text-white transition-colors">
                  Áreas Comunes
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Location / Info */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-4">
              Ubicación & Contacto
            </h4>
            <address className="not-italic text-xs text-neutral-400 space-y-2 leading-relaxed whitespace-pre-line">
              <p>{c.address}</p>
              <p className="pt-2 text-neutral-300">{c.phone}</p>
              <p className="text-neutral-300">{c.email}</p>
            </address>
          </div>


          {/* Action */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-4">
              Visitas Privadas
            </h4>
            <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
              Agende un recorrido guiado presencial o virtual con nuestros asesores.
            </p>
            <Link
              to="/contacto"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-xs font-medium transition-opacity hover:opacity-90"
            >
              Reservar Visita <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© 2026 Bucare Suite. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link to="/" className="hover:text-neutral-300 transition-colors">
              Privacidad
            </Link>
            <Link to="/" className="hover:text-neutral-300 transition-colors">
              Términos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
