import { createFileRoute, Outlet, redirect, Link, useRouterState, useRouter } from "@tanstack/react-router";
import {
  LogOut, Bell, Settings, Plus, User, ShieldCheck, ChevronDown,
  LayoutDashboard, Calendar, Users, FileText, Menu, X, Building2,
  ChevronRight, Home, MessageSquare, Loader2
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { clearAuth, getInitials } from "@/lib/auth";
import { getApiUrl } from "../lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) throw redirect({ to: "/login" });
    }
  },
  component: DashboardLayout,
});

/** Decodifica el campo `exp` de un JWT sin verificar firma */
function getTokenExp(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}


const NAV_ITEMS = [
  { to: "/dashboard",          icon: LayoutDashboard, label: "Dashboard",    roles: [] },
  { to: "/dashboard/citas",    icon: Calendar,        label: "Citas",         roles: [] },
  { to: "/dashboard/clientes", icon: Users,           label: "Clientes",      roles: ["SUPERADMIN","ADMIN","CONTADOR","VENTAS"] },
  { to: "/dashboard/chat",     icon: MessageSquare,   label: "Asistente IA",  roles: ["SUPERADMIN","ADMIN"] },
  { to: "/dashboard/configuracion", icon: Settings,   label: "Configuración", roles: ["SUPERADMIN","ADMIN"] },
  { to: "/dashboard/reportes", icon: FileText,        label: "Reportes",      roles: ["SUPERADMIN","ADMIN","CONTADOR","VENTAS"] },
];

const SIDEBAR_EXPANDED = 240;
const SIDEBAR_COLLAPSED = 72;
const DESKTOP_BREAKPOINT = 1024;

function DashboardLayout() {
  const { user } = useAuth();
  const userEmail = user?.email || "usuario@bucare.com";
  const userRole  = user?.role  || "CLIENTE";

  const [collapsed,   setCollapsed]   = useState(false);
  const [isDesktop,   setIsDesktop]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  // ── Guardia de Token: verificación periódica de expiración ──────────────────
  const routerState = useRouterState();
  const router      = useRouter();
  const currentPath = routerState.location.pathname;

  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.navigate({ to: "/login" });
        return;
      }
      const exp = getTokenExp(token);
      if (exp === null || Date.now() / 1000 >= exp) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        try {
          localStorage.setItem("auth_expired_reason", "Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
        } catch (_) {}
        window.location.href = "/login?expired=1";
      }
    };

    checkToken(); // verificar de inmediato al montar
    const interval = setInterval(checkToken, 30_000); // cada 30 segundos
    return () => clearInterval(interval);
  }, []);
  // ────────────────────────────────────────────────────────────────────────────

  // --- Estados de Notificaciones (Campana) ---
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(getApiUrl("/api/v1/notifications"), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setNotifications(json.data);
          setUnreadCount(json.data.filter((n: any) => !n.read).length);
        }
      }
    } catch (e) {
      console.error("Error al buscar notificaciones:", e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(getApiUrl("/api/v1/notifications/read-all"), {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (e) {
      console.error("Error al marcar como leídas:", e);
    }
  };

  // --- Estados de Formulario Wizard (Nueva Cita) ---
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [clientsList, setClientsList] = useState<any[]>([]);
  
  const [selectedClientId, setSelectedClientId] = useState("");
  const [isNewClient, setIsNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  
  const [propiedadInteres, setPropiedadInteres] = useState("APARTAMENTO");
  const [citaFecha, setCitaFecha] = useState("");
  const [citaHora, setCitaHora] = useState("");
  const [citaNotas, setCitaNotas] = useState("");
  
  const [submittingWizard, setSubmittingWizard] = useState(false);

  // --- Estados y Lógica de Modal de Notificaciones Push ---
  const [showPushModal, setShowPushModal] = useState(false);
  const [notificationsSupported, setNotificationsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const supported = "serviceWorker" in navigator && "PushManager" in window;
      setNotificationsSupported(supported);
      if (supported && Notification.permission !== "granted") {
        const dismissed = localStorage.getItem("dismissed_notification_prompt");
        if (!dismissed) {
          const timer = setTimeout(() => {
            setShowPushModal(true);
          }, 3000);
          return () => clearTimeout(timer);
        }
      }
    }
  }, []);

  const handleEnablePush = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Permiso de notificaciones denegado. Puedes activarlo manualmente en la configuración de tu navegador.");
        setShowPushModal(false);
        return;
      }

      const res = await fetch(getApiUrl("/api/v1/notifications/vapid-public-key"));
      if (!res.ok) throw new Error("No se pudo obtener la clave VAPID");
      const json = await res.json();
      const vapidPublicKey = json.publicKey;

      const reg = await navigator.serviceWorker.ready;
      
      const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
      };

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      const token = localStorage.getItem("token");
      const subJSON = sub.toJSON();

      await fetch(getApiUrl("/api/v1/notifications/subscribe"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          endpoint: subJSON.endpoint,
          keys: subJSON.keys
        })
      });

      setShowPushModal(false);
    } catch (err) {
      console.error("Error subscribing to push:", err);
      setShowPushModal(false);
    }
  };

  const handleDismissPush = () => {
    localStorage.setItem("dismissed_notification_prompt", "true");
    setShowPushModal(false);
  };

  const fetchClientsForWizard = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(getApiUrl("/api/v1/users"), {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setClientsList(json.data.filter((u: any) => u.role === "CLIENTE"));
        }
      }
    } catch (e) {
      console.error("Error al buscar clientes:", e);
    }
  };

  useEffect(() => {
    if (isWizardOpen) {
      fetchClientsForWizard();
      setWizardStep(1);
      setSelectedClientId("");
      setIsNewClient(false);
      setNewClientName("");
      setNewClientEmail("");
      setNewClientPhone("");
      setPropiedadInteres("APARTAMENTO");
      setCitaFecha("");
      setCitaHora("");
      setCitaNotas("");
    }
  }, [isWizardOpen]);

  const handleCreateCitaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingWizard(true);
    try {
      const token = localStorage.getItem("token");
      let clientId = selectedClientId;

      if (isNewClient) {
        if (!newClientName || !newClientEmail) {
          throw new Error("Por favor completa el nombre y correo del nuevo cliente");
        }
        
        // Limpiar el teléfono para asegurar que cumpla con el regex o usar uno por defecto válido
        const cleanedPhone = newClientPhone.trim() || "+584120000000";

        const clientRes = await fetch(getApiUrl("/api/v1/auth/register"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: newClientName,
            email: newClientEmail,
            phoneNumber: cleanedPhone,
            birthDate: "1990-01-01", // Requerido por el validador Zod del backend
            password: "BucareTempPassword123!",
            role: "CLIENTE"
          })
        });
        if (!clientRes.ok) {
          const errData = await clientRes.json();
          console.error("Error de registro del servidor:", errData);
          
          const serverMessage = errData.error?.message || errData.message;
          const zodError = errData.errors && errData.errors[0]?.message;
          
          throw new Error(zodError || serverMessage || "Error al registrar al nuevo cliente");
        }
        const clientData = await clientRes.json();
        clientId = clientData.data?.user?.id || clientData.data?.id;
      }

      if (!clientId) {
        throw new Error("Por favor selecciona o registra un cliente");
      }

      if (!citaFecha || !citaHora) {
        throw new Error("Por favor completa la fecha y la hora para la cita");
      }

      // Convertir hora HH:MM a formato de fecha local completa para enviar como fecha a citasRepository
      const fechaCitaStr = `${citaFecha}T${citaHora}:00`;

      const citaRes = await fetch(getApiUrl("/api/v1/citas"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          clienteId: clientId,
          fecha: fechaCitaStr,
          tipoPropiedad: propiedadInteres,
          notas: citaNotas
        })
      });

      if (!citaRes.ok) {
        throw new Error("Error al agendar la cita");
      }

      alert("¡Cita creada con éxito!");
      setIsWizardOpen(false);
      router.invalidate();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmittingWizard(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);



  // Responsive detection with resize listener
  const checkDesktop = useCallback(() => {
    if (typeof window !== "undefined") {
      const desktop = window.innerWidth >= DESKTOP_BREAKPOINT;
      setIsDesktop(desktop);
      if (!desktop) {
        setCollapsed(false); // reset collapse on mobile
        setMobileOpen(false);
      }
    }
  }, []);

  useEffect(() => {
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, [checkDesktop]);

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false); }, [currentPath]);

  // Lock scroll when mobile drawer open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleLogout = () => {
    clearAuth();
    router.navigate({ to: "/login" });
  };

  const visibleNav = NAV_ITEMS.filter(n =>
    n.roles.length === 0 || n.roles.includes(userRole)
  );

  const sidebarW = collapsed ? `${SIDEBAR_COLLAPSED}px` : `${SIDEBAR_EXPANDED}px`;
  const showLabels = !collapsed || mobileOpen;

  return (
    <div className="dash-shell" style={{ fontFamily: "var(--font-sans)" }}>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 40,
            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className="dash-sidebar"
        style={{
          position: "fixed",
          top: 0, left: 0,
          height: "100%",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          // Desktop: always visible, animated width
          // Mobile: slide in from left
          width: isDesktop ? sidebarW : `${SIDEBAR_EXPANDED}px`,
          transform: isDesktop ? "translateX(0)" : (mobileOpen ? "translateX(0)" : "translateX(-100%)"),
          transition: "width 0.25s ease, transform 0.28s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-4 shrink-0"
          style={{ height: "64px", borderBottom: "1px solid var(--dash-border)" }}
        >
          <div
            className="flex-shrink-0 rounded-xl flex items-center justify-center"
            style={{ width: "36px", height: "36px", background: "var(--dash-accent)" }}
          >
            <span style={{ color: "#0D1810", fontWeight: 900, fontSize: "1.1rem", fontFamily: "var(--font-display)" }}>B</span>
          </div>
          {showLabels && (
            <div className="flex flex-col min-w-0 animate-fade-in">
              <span style={{ color: "var(--dash-text)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.9rem", lineHeight: 1 }}>
                Bucare
              </span>
              <span style={{ color: "var(--dash-muted)", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "2px" }}>
                Suite & Plaza
              </span>
            </div>
          )}
          {/* Close button — mobile only */}
          {!isDesktop && (
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Cerrar menú"
              style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", padding: "4px", color: "var(--dash-muted)" }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Project Pill */}
        {showLabels && (
          <div
            className="mx-3 mt-4 mb-2 px-3 py-2 rounded-lg flex items-center gap-2 animate-fade-in"
            style={{ background: "var(--dash-accent-dim)", border: "1px solid var(--dash-border-hover)" }}
          >
            <Building2 size={14} style={{ color: "var(--dash-accent)", flexShrink: 0 }} />
            <span style={{ color: "var(--dash-accent)", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.05em" }}>
              PROYECTO ACTIVO
            </span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-2 mt-2 overflow-y-auto" style={{ flex: 1 }}>
          {visibleNav.map((item) => {
            const isActive = currentPath === item.to;
            return (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl transition-all duration-200"
                style={{
                  padding: "10px 12px",
                  background: isActive ? "var(--dash-accent-dim)" : "transparent",
                  border: `1px solid ${isActive ? "var(--dash-border-hover)" : "transparent"}`,
                  textDecoration: "none",
                }}
              >
                <item.icon
                  size={18}
                  style={{ color: isActive ? "var(--dash-accent)" : "var(--dash-muted)", flexShrink: 0, transition: "color 0.2s" }}
                />
                {showLabels && (
                  <span style={{
                    color: isActive ? "var(--dash-text)" : "var(--dash-muted)",
                    fontSize: "0.82rem",
                    fontWeight: isActive ? 600 : 400,
                    transition: "color 0.2s",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {item.label}
                  </span>
                )}
                {isActive && showLabels && (
                  <ChevronRight size={14} style={{ color: "var(--dash-accent)", marginLeft: "auto", flexShrink: 0 }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="px-2 pb-4 mt-auto pt-3" style={{ borderTop: "1px solid var(--dash-border)" }}>
          {showLabels && (
            <div className="px-3 py-2 mb-2 animate-fade-in">
              <p style={{ color: "var(--dash-text)", fontSize: "0.75rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {userEmail}
              </p>
              <span style={{
                display: "inline-block", marginTop: "4px",
                padding: "1px 8px", borderRadius: "99px",
                fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em",
                background: "var(--dash-accent-dim)", color: "var(--dash-accent)",
                border: "1px solid var(--dash-border-hover)",
              }}>
                {userRole}
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            aria-label="Cerrar Sesión"
            className="w-full flex items-center gap-3 rounded-xl transition-colors"
            style={{ padding: "8px 12px", background: "transparent", border: "none", cursor: "pointer" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,80,80,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <LogOut size={16} style={{ color: "#e05555", flexShrink: 0 }} />
            {showLabels && (
              <span style={{ color: "#e05555", fontSize: "0.82rem" }}>Cerrar Sesión</span>
            )}
          </button>
        </div>

        {/* Collapse toggle — desktop only */}
        <button
          aria-label={collapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
          className="hidden lg:flex absolute items-center justify-center rounded-full z-10 transition-colors"
          style={{
            top: "76px", right: "-12px",
            width: "24px", height: "24px",
            background: "var(--dash-sidebar)",
            border: "1px solid var(--dash-border-hover)",
            cursor: "pointer",
          }}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed
            ? <ChevronRight size={12} style={{ color: "var(--dash-accent)" }} />
            : <X size={12} style={{ color: "var(--dash-accent)" }} />
          }
        </button>
      </aside>

      {/* ── Main area ── */}
      <div
        className="flex flex-col flex-1 min-h-screen transition-all duration-300"
        style={{ marginLeft: isDesktop ? sidebarW : "0px" }}
      >
        {/* Top bar */}
        <header
          className="sticky top-0 z-30 flex items-center justify-between"
          style={{
            height: "64px",
            padding: "0 16px",
            background: "rgba(13,24,16,0.9)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid var(--dash-border)",
          }}
        >
          {/* Mobile hamburger + breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              aria-label="Abrir menú"
              className="lg:hidden rounded-lg transition-colors"
              style={{ padding: "8px", background: "var(--dash-card)", border: "1px solid var(--dash-border)", cursor: "pointer" }}
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={18} style={{ color: "var(--dash-text)" }} />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs" style={{ color: "var(--dash-muted)" }}>
              <Home size={12} />
              <span>/</span>
              <span style={{ color: "var(--dash-text)", fontWeight: 500 }}>
                {currentPath === "/dashboard" ? "Panel de Control" :
                 currentPath.includes("citas") ? "Citas" :
                 currentPath.includes("clientes") ? "Clientes" :
                 currentPath.includes("perfil") ? "Perfil" :
                 currentPath.includes("configuracion") ? "Configuración" : "Dashboard"}
              </span>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Live pill — hidden on very small screens */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", color: "var(--dash-muted)" }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              En Vivo
            </div>

            {/* Quick action — hidden on very small screens */}
            {userRole !== "CLIENTE" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors"
                    style={{ background: "var(--dash-accent)", color: "#0D1810", border: "none", cursor: "pointer" }}>
                    <Plus size={14} />
                    Nuevo
                    <ChevronDown size={11} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44"
                  style={{ background: "var(--dash-sidebar)", border: "1px solid var(--dash-border)", color: "var(--dash-text)" }}>
                  <DropdownMenuLabel style={{ color: "var(--dash-muted)", fontSize: "0.7rem" }}>Crear Nuevo</DropdownMenuLabel>
                  <DropdownMenuSeparator style={{ background: "var(--dash-border)" }} />
                  <DropdownMenuItem onClick={() => setIsWizardOpen(true)} style={{ color: "var(--dash-text)", cursor: "pointer" }}>
                    <Calendar size={14} className="mr-2" style={{ color: "var(--dash-accent)" }} /> Nueva Cita
                  </DropdownMenuItem>
                  {["SUPERADMIN","ADMIN","VENTAS"].includes(userRole) && (
                    <DropdownMenuItem style={{ color: "var(--dash-text)", cursor: "pointer" }}>
                      <Users size={14} className="mr-2" style={{ color: "var(--dash-accent)" }} /> Registrar Cliente
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Bell */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Ver notificaciones"
                  className="relative rounded-lg transition-colors"
                  style={{ padding: "8px", background: "var(--dash-card)", border: "1px solid var(--dash-border)", cursor: "pointer" }}
                >
                  <Bell size={15} style={{ color: "var(--dash-text)" }} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full"
                      style={{ background: "var(--dash-accent)" }} />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto"
                style={{ background: "var(--dash-sidebar)", border: "1px solid var(--dash-border)", color: "var(--dash-text)" }}>
                <DropdownMenuLabel className="flex justify-between items-center py-2 px-3 text-xs font-bold border-b border-[var(--dash-border)]">
                  <span>Notificaciones ({unreadCount})</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead} 
                      className="text-[10px] text-[var(--dash-accent)] hover:underline cursor-pointer"
                    >
                      Marcar todo leído
                    </button>
                  )}
                </DropdownMenuLabel>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[var(--dash-muted)]">
                    No tienes notificaciones
                  </div>
                ) : (
                  notifications.map((n) => (
                    <DropdownMenuItem 
                      key={n.id} 
                      className="flex flex-col gap-1 items-start py-2.5 px-3 border-b border-[rgba(255,255,255,0.03)] cursor-pointer"
                      style={{ 
                        opacity: n.read ? 0.6 : 1, 
                        background: n.read ? "transparent" : "rgba(225,182,104,0.03)" 
                      }}
                    >
                      <div className="flex justify-between w-full text-xs font-semibold">
                        <span style={{ color: n.read ? "var(--dash-text)" : "var(--dash-accent)" }}>{n.title}</span>
                        <span className="text-[9px] text-[var(--dash-muted)]">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-[var(--dash-muted)] text-left leading-relaxed">{n.body}</p>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl transition-colors"
                  style={{ padding: "6px", background: "var(--dash-card)", border: "1px solid var(--dash-border)", cursor: "pointer" }}>
                  <Avatar className="h-7 w-7">
                    <AvatarFallback style={{ background: "var(--dash-accent)", color: "#0D1810", fontSize: "0.65rem", fontWeight: 800 }}>
                      {getInitials(userEmail)}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown size={12} style={{ color: "var(--dash-muted)" }} className="hidden sm:block pr-0.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52"
                style={{ background: "var(--dash-sidebar)", border: "1px solid var(--dash-border)", color: "var(--dash-text)" }}>
                <div className="flex flex-col gap-1 p-2">
                  <p style={{ color: "var(--dash-text)", fontSize: "0.75rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {userEmail}
                  </p>
                  <span style={{
                    display: "inline-block", width: "fit-content",
                    padding: "1px 8px", borderRadius: "99px",
                    fontSize: "0.6rem", fontWeight: 700,
                    background: "var(--dash-accent-dim)", color: "var(--dash-accent)",
                    border: "1px solid var(--dash-border-hover)",
                  }}>
                    <ShieldCheck size={9} style={{ display: "inline", marginRight: "3px", verticalAlign: "middle" }} />
                    {userRole}
                  </span>
                </div>
                <DropdownMenuSeparator style={{ background: "var(--dash-border)" }} />
                <DropdownMenuItem asChild style={{ color: "var(--dash-text)", cursor: "pointer" }}>
                  <Link to="/dashboard/perfil" className="flex items-center w-full">
                    <User size={14} className="mr-2" style={{ color: "var(--dash-muted)" }} /> Mi Perfil
                  </Link>
                </DropdownMenuItem>
                {["SUPERADMIN", "ADMIN"].includes(userRole) && (
                  <DropdownMenuItem asChild style={{ color: "var(--dash-text)", cursor: "pointer" }}>
                    <Link to="/dashboard/configuracion" className="flex items-center w-full">
                      <Settings size={14} className="mr-2" style={{ color: "var(--dash-muted)" }} /> Configuración
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator style={{ background: "var(--dash-border)" }} />
                <DropdownMenuItem onClick={handleLogout} style={{ color: "#e05555", cursor: "pointer" }}>
                  <LogOut size={14} className="mr-2" /> Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 w-full mx-auto animate-fade-in" style={{ maxWidth: "1400px" }}>
          <Outlet />
        </main>
      </div>

      {/* ── Wizard: Agendar Nueva Cita ── */}
      <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
        <DialogContent 
          className="sm:max-w-[480px]" 
          style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: "var(--dash-text)" }}>
              <Calendar size={18} style={{ color: "var(--dash-accent)" }} /> Agendar Nueva Cita
            </DialogTitle>
            <DialogDescription style={{ color: "var(--dash-muted)" }}>
              Paso {wizardStep} de 3: {
                wizardStep === 1 ? "Seleccionar Cliente" :
                wizardStep === 2 ? "Fecha y Propiedad" : "Observaciones y Confirmación"
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCitaSubmit} className="space-y-4 py-2">
            {/* STEP 1: Seleccionar o Registrar Cliente */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg border border-white/5 bg-white/[0.01]">
                  <div>
                    <span className="text-xs font-semibold block">¿Es un cliente nuevo?</span>
                    <span className="text-[10px]" style={{ color: "var(--dash-muted)" }}>
                      Activa si no está en la base de datos
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isNewClient}
                    onChange={(e) => setIsNewClient(e.target.checked)}
                    className="h-4 w-4 accent-[var(--dash-accent)] cursor-pointer"
                  />
                </div>

                {!isNewClient ? (
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-400">Seleccionar Cliente Existente</Label>
                    <select
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      className="w-full mt-1 p-2 rounded-md text-xs font-medium cursor-pointer"
                      style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", color: "var(--dash-text)" }}
                    >
                      <option value="">-- Seleccionar --</option>
                      {clientsList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.fullName || c.email} ({c.email})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-400">Nombre Completo</Label>
                      <Input
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        placeholder="Ej. Juan Pérez"
                        className="bg-[rgba(255,255,255,0.02)] text-white border-[rgba(255,255,255,0.08)]"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-400">Correo Electrónico</Label>
                      <Input
                        type="email"
                        value={newClientEmail}
                        onChange={(e) => setNewClientEmail(e.target.value)}
                        placeholder="Ej. juan@correo.com"
                        className="bg-[rgba(255,255,255,0.02)] text-white border-[rgba(255,255,255,0.08)]"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-400">Número de Teléfono</Label>
                      <Input
                        value={newClientPhone}
                        onChange={(e) => setNewClientPhone(e.target.value)}
                        placeholder="Ej. +58 412 1234567"
                        className="bg-[rgba(255,255,255,0.02)] text-white border-[rgba(255,255,255,0.08)]"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    disabled={!isNewClient ? !selectedClientId : (!newClientName || !newClientEmail)}
                    onClick={() => setWizardStep(2)}
                    className="text-xs font-semibold px-5 py-2 rounded-lg"
                    style={{ background: "var(--dash-accent)", color: "#0D1810" }}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: Detalles de la Cita */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-400">Propiedad de Interés</Label>
                  <select
                    value={propiedadInteres}
                    onChange={(e) => setPropiedadInteres(e.target.value)}
                    className="w-full mt-1 p-2 rounded-md text-xs font-medium cursor-pointer"
                    style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", color: "var(--dash-text)" }}
                  >
                    <option value="APARTAMENTO">Bucare Suite (Residencial)</option>
                    <option value="LOCAL">Bucare Plaza (Comercial)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-400">Fecha</Label>
                    <Input
                      type="date"
                      value={citaFecha}
                      onChange={(e) => setCitaFecha(e.target.value)}
                      className="bg-[rgba(255,255,255,0.02)] text-white border-[rgba(255,255,255,0.08)] cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-400">Hora</Label>
                    <Input
                      type="time"
                      value={citaHora}
                      onChange={(e) => setCitaHora(e.target.value)}
                      className="bg-[rgba(255,255,255,0.02)] text-white border-[rgba(255,255,255,0.08)] cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setWizardStep(1)}
                    className="text-xs text-gray-400"
                  >
                    Atrás
                  </Button>
                  <Button
                    type="button"
                    disabled={!citaFecha || !citaHora}
                    onClick={() => setWizardStep(3)}
                    className="text-xs font-semibold px-5 py-2 rounded-lg"
                    style={{ background: "var(--dash-accent)", color: "#0D1810" }}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Observaciones y Confirmación */}
            {wizardStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-400">Detalles / Notas de la Cita</Label>
                  <textarea
                    rows={4}
                    value={citaNotas}
                    onChange={(e) => setCitaNotas(e.target.value)}
                    placeholder="Escribe aquí observaciones o requerimientos del cliente..."
                    className="w-full mt-1 p-2 rounded-md text-xs font-medium bg-[rgba(255,255,255,0.02)] text-white border border-[rgba(255,255,255,0.08)] outline-none resize-none"
                  />
                </div>

                <div className="p-3 border border-[rgba(255,255,255,0.05)] rounded-lg bg-[rgba(255,255,255,0.01)] text-xs space-y-2">
                  <h4 className="font-bold text-[var(--dash-accent)] mb-1 uppercase tracking-wide text-[10px]">Resumen de Cita</h4>
                  <p><strong>Cliente:</strong> {isNewClient ? `${newClientName} (Nuevo)` : clientsList.find(c => c.id === selectedClientId)?.fullName || "Seleccionado"}</p>
                  <p><strong>Propiedad:</strong> {propiedadInteres === "APARTAMENTO" ? "Bucare Suite" : "Bucare Plaza (Local)"}</p>
                  <p><strong>Fecha/Hora:</strong> {citaFecha} a las {citaHora}</p>
                </div>

                <DialogFooter className="pt-3 border-t border-white/10 flex justify-between items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setWizardStep(2)}
                    className="text-xs text-gray-400"
                  >
                    Atrás
                  </Button>
                  <Button
                    type="submit"
                    disabled={submittingWizard}
                    className="text-xs font-semibold"
                    style={{ background: "var(--dash-accent)", color: "#0D1810" }}
                  >
                    {submittingWizard ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar y Agendar"}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Permiso de Notificaciones Push */}
      <Dialog open={showPushModal} onOpenChange={setShowPushModal}>
        <DialogContent
          className="max-w-[400px] border-[rgba(255,255,255,0.08)] text-[#F0EDE8] rounded-2xl"
          style={{ background: "var(--dash-card)" }}
        >
          <DialogHeader className="flex flex-col items-center text-center space-y-3">
            <div className="p-3.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Bell className="w-8 h-8 animate-bounce" />
            </div>
            <DialogTitle className="text-lg font-bold text-white">¡No te pierdas de nada!</DialogTitle>
            <DialogDescription className="text-gray-400 text-xs leading-relaxed">
              Activa las notificaciones automáticas fuera del navegador para recibir alertas sobre tus citas, mensajes de IA y notificaciones importantes de Bucare Suite directo en tu dispositivo.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 flex flex-col sm:flex-row gap-2 w-full justify-center">
            <Button
              type="button"
              onClick={handleEnablePush}
              className="w-full text-xs font-semibold py-2.5 rounded-xl shadow-lg transition-transform hover:scale-[1.01]"
              style={{ background: "var(--dash-accent)", color: "#0D1810" }}
            >
              Activar Notificaciones
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={handleDismissPush}
              className="w-full text-xs text-gray-500 hover:text-white"
            >
              Recordar más tarde
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
