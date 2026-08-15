import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { getApiUrl } from "../lib/api";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet";
import { Copy, Terminal } from "lucide-react";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página no encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          La página que está buscando no existe o ha sido movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  const copyError = () => {
    const errorText = `${error.name}: ${error.message}\n\n${error.stack || "Sin stack trace"}`;
    navigator.clipboard.writeText(errorText);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          No pudimos cargar esta página
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo salió mal de nuestro lado. Por favor intenta refrescar la página o vuelve al inicio.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Reintentar
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Ir al inicio
          </a>
        </div>

        <div className="mt-8">
          <Sheet>
            <SheetTrigger asChild>
              <button className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Terminal className="h-4 w-4" />
                <span>Ver consola de desarrollo</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] sm:h-[60vh] flex flex-col">
              <SheetHeader className="flex flex-row items-start sm:items-center justify-between space-y-0 pb-4">
                <div className="space-y-1 text-left">
                  <SheetTitle>Consola de Error</SheetTitle>
                  <SheetDescription>Detalles técnicos para depuración.</SheetDescription>
                </div>
                <button
                  onClick={copyError}
                  className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent focus:ring-2 focus:ring-ring focus:outline-none"
                >
                  <Copy className="h-4 w-4" />
                  Copiar Error
                </button>
              </SheetHeader>
              <div className="flex-1 overflow-auto rounded-md bg-black p-4 text-left font-mono text-sm text-red-400">
                <div className="font-bold text-red-500 mb-2">{error.name}: {error.message}</div>
                <pre className="whitespace-pre-wrap break-all">{error.stack}</pre>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Bucare Suite — Inversión & Apartamentos de Lujo en Venezuela" },
      { name: "description", content: "Bucare Suite: apartamentos contemporáneos de alta gama en San Cristóbal, Nueva Guayana. Excelente oportunidad de inversión en bienes raíces en Venezuela para residentes y venezolanos en el exterior." },
      { name: "keywords", content: "apartamentos de lujo san cristobal, invertir en venezuela, bienes raices venezuela, comprar apartamento venezuela desde exterior, inmuebles tachira, bucare suite, apartamentos venezuela, inversion inmobiliaria venezuela" },
      { name: "author", content: "Bucare Suite" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      { name: "geo.region", content: "VE-V" },
      { name: "geo.placename", content: "San Cristóbal, Táchira, Venezuela" },
      { name: "geo.position", content: "7.7667;-72.2250" },
      { name: "ICBM", content: "7.7667, -72.2250" },
      { property: "og:site_name", content: "Bucare Suite" },
      { property: "og:locale", content: "es_VE" },
      { property: "og:title", content: "Bucare Suite — Inversión & Apartamentos de Lujo en Venezuela" },
      { property: "og:description", content: "Apartamentos contemporáneos de alta gama en San Cristóbal. Oportunidad de inversión inmobiliaria de alta plusvalía en Venezuela." },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://bucaresuite.com/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Bucare Suite — Inversión & Apartamentos de Lujo en Venezuela" },
      { name: "twitter:description", content: "Apartamentos de alta gama en San Cristóbal. Tu inversión segura en Venezuela." },
      { name: "twitter:image", content: "https://bucaresuite.com/og-image.jpg" },
      { name: "theme-color", content: "#213B26" },
    ],
    links: [
      { rel: "preload", href: "/hero-building.webp", as: "image", type: "image/webp", fetchPriority: "high" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "shortcut icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", href: "/logo.png" },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "alternate", hrefLang: "es-VE", href: "https://bucaresuite.com/" },
      { rel: "alternate", hrefLang: "es", href: "https://bucaresuite.com/" },
      { rel: "alternate", hrefLang: "x-default", href: "https://bucaresuite.com/" },
      // Preload critical latin font weights to avoid FOIT / layout shifts
      { rel: "preload", href: "/fonts/inter_UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" },
      { rel: "preload", href: "/fonts/archivo_k3kPo8UDI-1M0wlSV9XAw6lQkqWY8Q82sLydOxI.woff2", as: "font", type: "font/woff2", crossOrigin: "anonymous" },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-TR4LL865');`
          }}
        />
        {/* End Google Tag Manager */}
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "RealEstateAgent",
              "name": "Bucare Suite",
              "url": "https://bucaresuite.com",
              "logo": "https://bucaresuite.com/logo.png",
              "image": "https://bucaresuite.com/og-image.jpg",
              "description": "Apartamentos contemporáneos de alta gama en San Cristóbal, Nueva Guayana. Arquitectura inteligente, elegancia atemporal y alta plusvalía.",
              "priceRange": "$$$$",
              "currenciesAccepted": "USD, EUR",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "QQJC+93C",
                "addressLocality": "San Cristóbal",
                "addressRegion": "Táchira",
                "addressCountry": "VE"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 7.7667,
                "longitude": -72.2250
              },
              "areaServed": [
                { "@type": "Country", "name": "Venezuela" },
                { "@type": "Country", "name": "United States" },
                { "@type": "Country", "name": "Spain" },
                { "@type": "Country", "name": "Colombia" },
                { "@type": "Country", "name": "Chile" },
                { "@type": "Country", "name": "Panama" }
              ],
              "knowsLanguage": ["es", "en"],
              "sameAs": [
                "https://www.instagram.com/bucaresuite/"
              ]
            }),
          }}
        />
      </head>
      <body>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TR4LL865"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}
        {children}
        <Scripts />
      </body>
    </html>
  );
}

import { FloatingChatWidget } from "../components/FloatingChatWidget";
import { SiteContentProvider } from "../contexts/SiteContentContext";
import { initTracker } from "../lib/tracker";


function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");
  const isOfflinePage = location.pathname === "/offline";

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Inicializar el rastreador de visitantes único globalmente
      initTracker();

      let sessionId = sessionStorage.getItem("bucare_session_id");
      if (!sessionId) {
        sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem("bucare_session_id", sessionId);

        fetch(getApiUrl("/api/v1/visits"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        }).catch((err) => console.error("Error al registrar la visita:", err));
      }

      // Registrar Service Worker para notificaciones push
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js")
          .then((reg) => {
            console.log("Service Worker registrado correctamente:", reg);
            reg.update();
          })
          .catch((err) => console.error("Error al registrar el Service Worker:", err));
      }
    }
  }, []);


  return (
    <QueryClientProvider client={queryClient}>
      <SiteContentProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        {!isDashboard && !isOfflinePage && <FloatingChatWidget />}
      </SiteContentProvider>
    </QueryClientProvider>
  );
}
