import { createFileRoute, Outlet, redirect, Link, useRouterState, useRouter } from "@tanstack/react-router";
import {
  LogOut, Bell, Settings, Plus, User, ShieldCheck, ChevronDown,
  LayoutDashboard, Calendar, Users, FileText, Menu, X, Building2,
  ChevronRight, Home, MessageSquare
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { clearAuth, getInitials } from "@/lib/auth";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) throw redirect({ to: "/login" });
    }
  },
  component: DashboardLayout,
});

const NAV_ITEMS = [
  { to: "/dashboard",          icon: LayoutDashboard, label: "Dashboard",   roles: [] },
  { to: "/dashboard/citas",    icon: Calendar,        label: "Citas",        roles: [] },
  { to: "/dashboard/clientes", icon: Users,           label: "Clientes",     roles: ["SUPERADMIN","ADMIN","CONTADOR","VENTAS"] },
  { to: "/dashboard/chat",          icon: MessageSquare,   label: "Asistente IA", roles: ["SUPERADMIN","ADMIN"] },
  { to: "/dashboard/configuracion", icon: Settings,         label: "Configuración",roles: ["SUPERADMIN","ADMIN"] },
  { to: "/dashboard",          icon: FileText,        label: "Reportes",     roles: ["SUPERADMIN","CONTADOR"] },
];

function DashboardLayout() {
  const { user } = useAuth();
  const userEmail = user?.email || "usuario@bucare.com";
  const userRole = user?.role || "CLIENTE";

  const [collapsed, setCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const routerState = useRouterState();
  const router = useRouter();
  const currentPath = routerState.location.pathname;

  useEffect(() => {
    if (typeof window !== "undefined") {
      // Auto-collapse on small screens
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (!desktop) setCollapsed(true);
    }
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.navigate({ to: "/login" });
  };

  const visibleNav = NAV_ITEMS.filter(n =>
    n.roles.length === 0 || n.roles.includes(userRole)
  );

  const sidebarW = collapsed ? "72px" : "240px";

  return (
    <div className="dash-shell" style={{ fontFamily: "var(--font-sans)" }}>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className="dash-sidebar fixed top-0 left-0 h-full z-50 flex flex-col"
        style={{
          width: mobileOpen ? "240px" : (isDesktop ? sidebarW : "0px"),
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 h-16 border-b shrink-0"
          style={{ borderColor: "var(--dash-border)" }}>
          <div className="flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center"
            style={{ background: "var(--dash-accent)" }}>
            <span style={{ color: "#0D1810", fontWeight: 900, fontSize: "1.1rem", fontFamily: "var(--font-display)" }}>B</span>
          </div>
          {(!collapsed || mobileOpen) && (
            <div className="flex flex-col min-w-0 animate-fade-in">
              <span style={{ color: "var(--dash-text)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.9rem", lineHeight: 1 }}>
                Bucare
              </span>
              <span style={{ color: "var(--dash-muted)", fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "2px" }}>
                Suite & Plaza
              </span>
            </div>
          )}
        </div>

        {/* Project Pill */}
        {(!collapsed || mobileOpen) && (
          <div className="mx-3 mt-4 mb-2 px-3 py-2 rounded-lg flex items-center gap-2 animate-fade-in"
            style={{ background: "var(--dash-accent-dim)", border: "1px solid var(--dash-border-hover)" }}>
            <Building2 size={14} style={{ color: "var(--dash-accent)", flexShrink: 0 }} />
            <span style={{ color: "var(--dash-accent)", fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.05em" }}>
              PROYECTO ACTIVO
            </span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-2 mt-2 flex-1 overflow-y-auto">
          {visibleNav.map((item) => {
            const isActive = currentPath === item.to;
            return (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group"
                style={{
                  background: isActive ? "var(--dash-accent-dim)" : "transparent",
                  border: `1px solid ${isActive ? "var(--dash-border-hover)" : "transparent"}`,
                  textDecoration: "none",
                }}
              >
                <item.icon
                  size={18}
                  style={{ color: isActive ? "var(--dash-accent)" : "var(--dash-muted)", flexShrink: 0, transition: "color 0.2s" }}
                />
                {(!collapsed || mobileOpen) && (
                  <span style={{
                    color: isActive ? "var(--dash-text)" : "var(--dash-muted)",
                    fontSize: "0.82rem",
                    fontWeight: isActive ? 600 : 400,
                    transition: "color 0.2s",
                  }}>
                    {item.label}
                  </span>
                )}
                {isActive && (!collapsed || mobileOpen) && (
                  <ChevronRight size={14} style={{ color: "var(--dash-accent)", marginLeft: "auto" }} />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="px-2 pb-4 mt-auto border-t pt-3" style={{ borderColor: "var(--dash-border)" }}>
          {(!collapsed || mobileOpen) && (
            <div className="px-3 py-2 mb-2 animate-fade-in">
              <p style={{ color: "var(--dash-text)", fontSize: "0.75rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {userEmail}
              </p>
              <span style={{
                display: "inline-block",
                marginTop: "4px",
                padding: "1px 8px",
                borderRadius: "99px",
                fontSize: "0.6rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                background: "var(--dash-accent-dim)",
                color: "var(--dash-accent)",
                border: "1px solid var(--dash-border-hover)",
              }}>
                {userRole}
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            aria-label="Cerrar Sesión"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors"
            style={{ background: "transparent", border: "none", cursor: "pointer" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,80,80,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <LogOut size={16} style={{ color: "#e05555", flexShrink: 0 }} />
            {(!collapsed || mobileOpen) && (
              <span style={{ color: "#e05555", fontSize: "0.82rem" }}>Cerrar Sesión</span>
            )}
          </button>
        </div>

        {/* Collapse toggle — desktop only */}
        <button
          aria-label={collapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
          className="hidden lg:flex absolute -right-3 top-20 items-center justify-center w-6 h-6 rounded-full z-10 transition-colors"
          style={{
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
          className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6"
          style={{
            background: "rgba(13,24,16,0.85)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid var(--dash-border)",
          }}
        >
          {/* Mobile menu + breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              aria-label="Abrir menú"
              className="lg:hidden p-2 rounded-lg"
              style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", cursor: "pointer" }}
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={18} style={{ color: "var(--dash-text)" }} />
            </button>
            <div className="hidden md:flex items-center gap-2 text-xs" style={{ color: "var(--dash-muted)" }}>
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
            {/* Live pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", color: "var(--dash-muted)" }}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              En Vivo
            </div>

            {/* Quick action */}
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
                  <DropdownMenuItem style={{ color: "var(--dash-text)", cursor: "pointer" }}>
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
            <button 
              aria-label="Ver notificaciones"
              className="relative p-2 rounded-lg transition-colors"
              style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", cursor: "pointer" }}>
              <Bell size={15} style={{ color: "var(--dash-text)" }} />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--dash-accent)" }} />
            </button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1.5 rounded-xl transition-colors"
                  style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", cursor: "pointer" }}>
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
        <main className="flex-1 p-4 md:p-6 max-w-[1400px] w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
