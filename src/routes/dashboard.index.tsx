import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from "recharts";
import {
  Users, CreditCard, Activity, TrendingUp, Calendar, ChevronRight,
  ArrowUpRight, Building2, Clock, Search, MapPin, Percent, Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/dashboard/")({ component: DashboardIndex });

// ── Data ─────────────────────────────────────────────────────────────────────
const dataTendencias = [
  { name: "Ene", ventas: 3, ingresos: 148000 },
  { name: "Feb", ventas: 5, ingresos: 225000 },
  { name: "Mar", ventas: 4, ingresos: 198000 },
  { name: "Abr", ventas: 7, ingresos: 312000 },
  { name: "May", ventas: 6, ingresos: 285000 },
  { name: "Jun", ventas: 9, ingresos: 421000 },
  { name: "Jul", ventas: 11, ingresos: 512000 },
];

const distribucionProyectos = [
  { name: "Bucare Suite",  value: 58, color: "#E1B668" },
  { name: "Bucare Plaza",  value: 30, color: "#213B26" },
  { name: "Disponibles",   value: 12, color: "#3a5c40" },
];

const citasHoy = [
  { id: 1, cliente: "María Rodríguez",  asesor: "Carlos Silva",   hora: "10:30 AM", estado: "Confirmado",  tipo: "Suite 3A" },
  { id: 2, cliente: "Juan Pérez",       asesor: "Ana Gómez",      hora: "11:15 AM", estado: "En Visita",   tipo: "Plaza PH-1" },
  { id: 3, cliente: "Elena Martínez",   asesor: "Carlos Silva",   hora: "02:00 PM", estado: "Pendiente",   tipo: "Suite 2B" },
  { id: 4, cliente: "Luis Torres",      asesor: "Sofía Ruiz",     hora: "03:30 PM", estado: "Confirmado",  tipo: "Plaza T-4" },
  { id: 5, cliente: "Carmen Delgado",   asesor: "Ana Gómez",      hora: "04:15 PM", estado: "Pendiente",   tipo: "Suite 1C" },
];

const clientesRecientes = [
  { id: 101, nombre: "Gabriel Mendoza",    interes: "Suite 3A",   presupuesto: "$180K", estado: "Activo",    ultima: "24 Jul 2026" },
  { id: 102, nombre: "Valentina Castillo", interes: "Plaza PH-1", presupuesto: "$320K", estado: "Cerrado",   ultima: "28 Jul 2026" },
  { id: 103, nombre: "Roberto Morales",    interes: "Suite 2B",   presupuesto: "$155K", estado: "Seguimiento", ultima: "29 Jul 2026" },
  { id: 104, nombre: "Lucía Fernández",    interes: "Plaza T-4",  presupuesto: "$240K", estado: "Activo",    ultima: "15 Jul 2026" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
const S = {
  card: {
    background: "var(--dash-card)",
    border: "1px solid var(--dash-border)",
    borderRadius: "16px",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  } as React.CSSProperties,
  text:  { color: "var(--dash-text)" }  as React.CSSProperties,
  muted: { color: "var(--dash-muted)" } as React.CSSProperties,
  accent:{ color: "var(--dash-accent)"}  as React.CSSProperties,
};

function estadoBadge(estado: string) {
  if (estado === "En Visita")   return { bg: "rgba(225,182,104,0.18)", color: "#E1B668",   border: "rgba(225,182,104,0.4)" };
  if (estado === "Confirmado")  return { bg: "rgba(33,59,38,0.5)",     color: "#6fcf7c",   border: "rgba(111,207,124,0.3)" };
  if (estado === "Cerrado")     return { bg: "rgba(33,59,38,0.5)",     color: "#6fcf7c",   border: "rgba(111,207,124,0.3)" };
  if (estado === "Seguimiento") return { bg: "rgba(225,182,104,0.18)", color: "#E1B668",   border: "rgba(225,182,104,0.4)" };
  return { bg: "rgba(255,255,255,0.06)", color: "#8B9983", border: "rgba(255,255,255,0.1)" };
}

// ── Component ─────────────────────────────────────────────────────────────────
function DashboardIndex() {
  const [userRole,  setUserRole]  = useState<string>("SUPERADMIN");
  const [userEmail, setUserEmail] = useState<string>("xenonestudio@gmail.com");
  const [busqueda,  setBusqueda]  = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const p = JSON.parse(stored);
          if (p.role)  setUserRole(p.role);
          if (p.email) setUserEmail(p.email);
        } catch { /* ignore */ }
      }
    }
  }, []);

  if (userRole === "CLIENTE") return <ClientDashboardView />;

  const citasFiltradas = citasHoy.filter(c =>
    c.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.asesor.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.tipo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", paddingBottom: "48px" }}>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div style={{ position: "relative", borderRadius: "20px", overflow: "hidden", height: "320px", flexShrink: 0 }}>
        <img
          src="/modelos/Imagen_modelo01.jpg"
          alt="Bucare Suite"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        <div className="hero-overlay" style={{ position: "absolute", inset: 0 }} />

        {/* Title */}
        <div style={{ position: "absolute", bottom: "24px", left: "28px", right: "28px" }}>
          <p style={{ color: "var(--dash-accent)", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "6px" }}>
            Panel de Control
          </p>
          <h1 style={{ color: "var(--dash-text)", fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem,4vw,2.8rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, margin: 0 }}>
            Bucare Suite &amp; Plaza
          </h1>
          <p style={{ color: "rgba(232,237,233,0.65)", fontSize: "0.82rem", marginTop: "6px" }}>
            Gestión Inmobiliaria · {new Date().toLocaleDateString("es-VE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Floating stat cards */}
        <div style={{ position: "absolute", top: "20px", right: "20px", display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {[
            { label: "Unidades Libres", value: "24",   sub: "disponibles hoy",    icon: Home },
            { label: "Ocupación",       value: "89%",  sub: "tasa actual",         icon: Percent },
          ].map(({ label, value, sub, icon: Icon }) => (
            <div key={label} className="glass-card" style={{ padding: "14px 18px", minWidth: "130px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                <Icon size={12} style={{ color: "var(--dash-accent)" }} />
                <span style={{ color: "var(--dash-muted)", fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</span>
              </div>
              <div style={{ color: "var(--dash-text)", fontFamily: "var(--font-display)", fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}>
                {value}
              </div>
              <div style={{ color: "var(--dash-muted)", fontSize: "0.62rem", marginTop: "4px" }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── KPI GRID ─────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gap: "14px", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        {[
          {
            label: "Ingresos del Mes", value: "$512,000", trend: "+21.6% vs mes ant.",
            icon: CreditCard, color: "var(--dash-accent)",
            show: ["SUPERADMIN","CONTADOR"].includes(userRole),
          },
          {
            label: "Clientes Activos", value: "2,350", trend: "+180 esta semana",
            icon: Users, color: "#6fcf7c", show: true,
          },
          {
            label: "Visitas del Día", value: "12", trend: "en curso ahora",
            icon: Activity, color: "var(--dash-accent)", show: true, live: true,
          },
          {
            label: "Tasa de Cierre", value: "34%", trend: "de leads a contratos",
            icon: TrendingUp, color: "#6fcf7c", show: true,
          },
        ].filter(k => k.show).map(({ label, value, trend, icon: Icon, color, live }) => (
          <div
            key={label}
            style={{ ...S.card, padding: "20px", position: "relative", overflow: "hidden" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--dash-border-hover)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.4)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--dash-border)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
          >
            {/* Accent bar */}
            <div style={{ position: "absolute", top: 0, left: 0, width: "3px", height: "100%", background: color, borderRadius: "16px 0 0 16px" }} />
            <div style={{ paddingLeft: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                <span style={{ ...S.muted, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>
                <div style={{ padding: "7px", borderRadius: "10px", background: "rgba(225,182,104,0.1)" }}>
                  <Icon size={15} style={{ color }} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span className="dash-stat-number">{value}</span>
                {live && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full" style={{ background: "#6fcf7c", opacity: 0.75 }} />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: "#6fcf7c" }} />
                  </span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "8px" }}>
                <ArrowUpRight size={12} style={{ color }} />
                <span style={{ color, fontSize: "0.7rem", fontWeight: 600 }}>{trend}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── CHART + CITAS ────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "1fr 1fr" }} className="lg:grid-cols-[3fr_2fr]">

        {/* Area Chart */}
        {["SUPERADMIN","CONTADOR"].includes(userRole) && (
          <div style={{ ...S.card, padding: "24px" }}>
            <div style={{ marginBottom: "20px" }}>
              <h3 style={{ ...S.text, fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, margin: 0 }}>
                Ingresos por Ventas
              </h3>
              <p style={{ ...S.muted, fontSize: "0.72rem", marginTop: "4px" }}>Evolución mensual consolidada — 2026</p>
            </div>
            <div style={{ height: "240px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dataTendencias} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#E1B668" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#E1B668" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#6B7F6E", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7F6E", fontSize: 11 }}
                    tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                  <RechartsTooltip
                    contentStyle={{
                      background: "var(--dash-sidebar)",
                      border: "1px solid var(--dash-border-hover)",
                      borderRadius: "10px",
                      color: "var(--dash-text)",
                      fontSize: "12px",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                    }}
                    labelStyle={{ color: "var(--dash-accent)" }}
                    formatter={(v: number) => [`$${v.toLocaleString()}`, "Ingresos"]}
                  />
                  <Area type="monotone" dataKey="ingresos" stroke="#E1B668" strokeWidth={2.5}
                    fillOpacity={1} fill="url(#gIngresos)" dot={false} activeDot={{ r: 5, fill: "#E1B668" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Citas del Día */}
        <div style={{ ...S.card, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "20px 20px 14px", borderBottom: "1px solid var(--dash-border)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <h3 style={{ ...S.text, fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, margin: 0 }}>
                Citas de Hoy
              </h3>
              <span style={{
                padding: "2px 10px", borderRadius: "99px", fontSize: "0.68rem", fontWeight: 700,
                background: "var(--dash-accent-dim)", color: "var(--dash-accent)", border: "1px solid var(--dash-border-hover)",
              }}>
                {citasFiltradas.length} agendadas
              </span>
            </div>
            <div style={{ position: "relative" }}>
              <Search size={13} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--dash-muted)" }} />
              <input
                type="text"
                placeholder="Buscar cliente, asesor o unidad..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                style={{
                  width: "100%", padding: "8px 10px 8px 30px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid var(--dash-border)",
                  borderRadius: "10px", fontSize: "0.75rem",
                  color: "var(--dash-text)", outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "12px", maxHeight: "320px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {citasFiltradas.length === 0 ? (
              <p style={{ ...S.muted, textAlign: "center", fontSize: "0.75rem", padding: "32px 0" }}>Sin resultados.</p>
            ) : citasFiltradas.map(cita => {
              const b = estadoBadge(cita.estado);
              return (
                <div key={cita.id}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--dash-border)", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Avatar style={{ height: "34px", width: "34px", flexShrink: 0 }}>
                      <AvatarFallback style={{ background: "var(--dash-accent-dim)", color: "var(--dash-accent)", fontSize: "0.65rem", fontWeight: 800 }}>
                        {cita.cliente.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p style={{ ...S.text, fontSize: "0.78rem", fontWeight: 600, margin: 0 }}>{cita.cliente}</p>
                      <p style={{ ...S.muted, fontSize: "0.65rem", marginTop: "2px" }}>
                        {cita.asesor} · <span style={{ ...S.accent }}>{cita.tipo}</span>
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                    <span style={{ padding: "2px 9px", borderRadius: "99px", fontSize: "0.6rem", fontWeight: 700, background: b.bg, color: b.color, border: `1px solid ${b.border}` }}>
                      {cita.estado}
                    </span>
                    <span style={{ ...S.muted, fontSize: "0.62rem", display: "flex", alignItems: "center", gap: "3px" }}>
                      <Clock size={10} /> {cita.hora}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── PROYECTOS ────────────────────────────────────────────────────── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <div>
            <p style={{ ...S.muted, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", margin: 0 }}>03 Proyectos</p>
            <h2 style={{ ...S.text, fontFamily: "var(--font-display)", fontSize: "1.3rem", fontWeight: 800, letterSpacing: "-0.02em", margin: "4px 0 0" }}>
              Bucare Suite &amp; Bucare Plaza
            </h2>
          </div>
          <Button size="sm" style={{ background: "var(--dash-accent)", color: "#0D1810", border: "none", fontSize: "0.72rem", fontWeight: 700, borderRadius: "10px", cursor: "pointer" }}>
            Ver todos
          </Button>
        </div>

        <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
          {[
            {
              name: "Bucare Suite",
              img: "/modelos/Imagen_modelo02.jpg",
              tipo: "Residencias de Lujo",
              precio: "Desde $148,000",
              vendido: 72,
              unidades: "48 unidades · 12 disponibles",
              tag: "EN VENTA",
            },
            {
              name: "Bucare Plaza",
              img: "/modelos/Imagen_modelo03.jpg",
              tipo: "Apartamentos Premium",
              precio: "Desde $225,000",
              vendido: 58,
              unidades: "60 unidades · 25 disponibles",
              tag: "PREVENTAS",
            },
          ].map(proj => (
            <div key={proj.name}
              style={{ position: "relative", borderRadius: "16px", overflow: "hidden", height: "240px", cursor: "pointer" }}
              className="group"
            >
              <img src={proj.img} alt={proj.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(13,24,16,0.95) 0%, rgba(13,24,16,0.3) 60%, transparent 100%)",
              }} />
              {/* Tag */}
              <span style={{
                position: "absolute", top: "14px", left: "14px",
                padding: "3px 10px", borderRadius: "99px",
                fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.1em",
                background: "var(--dash-accent)", color: "#0D1810",
              }}>
                {proj.tag}
              </span>
              {/* Info */}
              <div style={{ position: "absolute", bottom: "16px", left: "16px", right: "16px" }}>
                <p style={{ ...S.muted, fontSize: "0.65rem", margin: "0 0 2px" }}>{proj.tipo}</p>
                <h3 style={{ color: "var(--dash-text)", fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 800, margin: "0 0 10px", letterSpacing: "-0.02em" }}>
                  {proj.name}
                </h3>
                {/* Progress */}
                <div style={{ marginBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ ...S.muted, fontSize: "0.62rem" }}>{proj.unidades}</span>
                    <span style={{ color: "var(--dash-accent)", fontSize: "0.62rem", fontWeight: 700 }}>{proj.vendido}% vendido</span>
                  </div>
                  <div style={{ height: "4px", borderRadius: "99px", background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${proj.vendido}%`, background: "var(--dash-accent)", borderRadius: "99px" }} />
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--dash-text)", fontSize: "0.82rem", fontWeight: 700 }}>{proj.precio}</span>
                  <span style={{ ...S.accent, fontSize: "0.7rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                    Ver unidades <ChevronRight size={12} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── TABS Analytics + Clientes ────────────────────────────────────── */}
      <Tabs defaultValue="analytics" className="w-full">
        <TabsList style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: "12px", padding: "4px", display: "inline-flex", marginBottom: "20px" }}>
          {[["analytics","Analítica"],["clients","Clientes"]].map(([v, l]) => (
            <TabsTrigger key={v} value={v}
              style={{ fontSize: "0.78rem", padding: "6px 18px", borderRadius: "9px" }}
              className="data-[state=active]:!bg-[--dash-accent] data-[state=active]:!text-[#0D1810] data-[state=active]:!font-bold text-[--dash-muted] transition-all">
              {l}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Analytics */}
        <TabsContent value="analytics" className="animate-fade-in">
          <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
            {/* Donut */}
            <div style={{ ...S.card, padding: "24px" }}>
              <h3 style={{ ...S.text, fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700, margin: "0 0 4px" }}>
                Distribución por Proyecto
              </h3>
              <p style={{ ...S.muted, fontSize: "0.7rem", margin: "0 0 16px" }}>Unidades vendidas este mes</p>
              <div style={{ height: "200px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={distribucionProyectos} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                      {distribucionProyectos.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ background: "var(--dash-sidebar)", border: "1px solid var(--dash-border-hover)", borderRadius: "8px", color: "var(--dash-text)", fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: "grid", gap: "8px", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--dash-border)" }}>
                {distribucionProyectos.map((d, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: d.color, flexShrink: 0 }} />
                    <span style={{ ...S.muted, fontSize: "0.72rem" }}>{d.name}</span>
                    <span style={{ ...S.text, fontSize: "0.72rem", fontWeight: 700, marginLeft: "auto" }}>{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Disponibilidad */}
            <div style={{ ...S.card, padding: "24px" }}>
              <h3 style={{ ...S.text, fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700, margin: "0 0 4px" }}>
                Disponibilidad por Tipo
              </h3>
              <p style={{ ...S.muted, fontSize: "0.7rem", margin: "0 0 20px" }}>Ocupación actual de unidades</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {[
                  { label: "Suite — Tipo A (1 hab)",  val: 85 },
                  { label: "Suite — Tipo B (2 hab)",  val: 60 },
                  { label: "Plaza — Apartamento PH",  val: 40 },
                  { label: "Plaza — Townhouse",       val: 92 },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ ...S.text, fontSize: "0.73rem", fontWeight: 500 }}>{label}</span>
                      <span style={{ ...S.accent, fontSize: "0.73rem", fontWeight: 700 }}>{val}%</span>
                    </div>
                    <div style={{ height: "6px", borderRadius: "99px", background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${val}%`, background: val > 80 ? "#E1B668" : "#3a5c40", borderRadius: "99px", transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Clients */}
        <TabsContent value="clients" className="animate-fade-in">
          <div style={{ ...S.card, overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--dash-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ ...S.text, fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700, margin: 0 }}>
                  Clientes Recientes
                </h3>
                <p style={{ ...S.muted, fontSize: "0.7rem", margin: "4px 0 0" }}>Actividad reciente e historial</p>
              </div>
              <button style={{ padding: "6px 16px", borderRadius: "10px", fontSize: "0.72rem", fontWeight: 700, background: "var(--dash-accent)", color: "#0D1810", border: "none", cursor: "pointer" }}>
                + Nuevo Registro
              </button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--dash-border)" }}>
                    {["Cliente","Interés","Presupuesto","Última Visita","Estado",""].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", ...S.muted as React.CSSProperties, fontWeight: 600, fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clientesRecientes.map((c, i) => {
                    const b = estadoBadge(c.estado);
                    return (
                      <tr key={c.id}
                        style={{ borderBottom: "1px solid var(--dash-border)", transition: "background 0.15s", cursor: "pointer" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(225,182,104,0.05)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <Avatar style={{ height: "30px", width: "30px" }}>
                              <AvatarFallback style={{ background: "var(--dash-accent-dim)", color: "var(--dash-accent)", fontSize: "0.6rem", fontWeight: 800 }}>
                                {c.nombre.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span style={{ ...S.text, fontWeight: 600 }}>{c.nombre}</span>
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px", ...S.muted as React.CSSProperties }}>{c.interes}</td>
                        <td style={{ padding: "14px 16px", ...S.accent as React.CSSProperties, fontWeight: 700 }}>{c.presupuesto}</td>
                        <td style={{ padding: "14px 16px", ...S.muted as React.CSSProperties }}>{c.ultima}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ padding: "3px 10px", borderRadius: "99px", fontSize: "0.62rem", fontWeight: 700, background: b.bg, color: b.color, border: `1px solid ${b.border}` }}>
                            {c.estado}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "right" }}>
                          <button style={{ ...S.accent as React.CSSProperties, background: "none", border: "none", fontSize: "0.72rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: "3px", marginLeft: "auto" }}>
                            Ver <ChevronRight size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Client View ────────────────────────────────────────────────────────────────
function ClientDashboardView() {
  const [citas, setCitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const res = await fetch("https://bucaredemo.ddns.net/api/v1/citas", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json();
        if (json.success) setCitas(json.data.filter((c: any) => c.clienteId === user.id));
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchCitas();
  }, []);

  return (
    <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", paddingBottom: "32px" }}>
      {/* Citas card */}
      <div style={{ ...S.card, gridColumn: "span 2", padding: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
          <Calendar size={18} style={{ color: "var(--dash-accent)" }} />
          <h2 style={{ ...S.text, fontFamily: "var(--font-display)", fontSize: "1rem", fontWeight: 700, margin: 0 }}>Mis Citas Programadas</h2>
        </div>
        <p style={{ ...S.muted, fontSize: "0.72rem", margin: "0 0 16px" }}>Visitas a propiedades y asesorías</p>
        {loading ? (
          <p style={{ ...S.muted, fontSize: "0.75rem" }}>Cargando...</p>
        ) : citas.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px", border: "1px dashed var(--dash-border)", borderRadius: "12px" }}>
            <p style={{ ...S.muted, fontSize: "0.78rem" }}>No tienes citas programadas actualmente.</p>
          </div>
        ) : citas.map(cita => (
          <div key={cita.id}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--dash-border)", marginBottom: "8px" }}
          >
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ padding: "8px", borderRadius: "10px", background: "var(--dash-accent-dim)" }}>
                <Building2 size={15} style={{ color: "var(--dash-accent)" }} />
              </div>
              <div>
                <p style={{ ...S.text, fontSize: "0.82rem", fontWeight: 600, margin: 0 }}>Visita — {cita.tipoPropiedad}</p>
                <p style={{ ...S.muted, fontSize: "0.68rem", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Clock size={10} />
                  {new Date(cita.fecha).toLocaleDateString()} a las {new Date(cita.fecha).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
            {(() => { const b = estadoBadge(cita.estado); return (
              <span style={{ padding: "3px 10px", borderRadius: "99px", fontSize: "0.62rem", fontWeight: 700, background: b.bg, color: b.color, border: `1px solid ${b.border}` }}>
                {cita.estado}
              </span>
            ); })()}
          </div>
        ))}
      </div>

      {/* CTA card */}
      <div style={{ position: "relative", borderRadius: "16px", overflow: "hidden", padding: "24px" }}
        className="animate-fade-in">
        <img src="/modelos/Imagen_modelo04.jpg" alt="Propiedad"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div className="hero-overlay" style={{ position: "absolute", inset: 0 }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h3 style={{ color: "var(--dash-text)", fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 800, margin: "0 0 8px" }}>
            ¿Necesitas ayuda?
          </h3>
          <p style={{ color: "rgba(232,237,233,0.7)", fontSize: "0.75rem", margin: "0 0 16px", lineHeight: 1.5 }}>
            Tu asesor está disponible para resolver dudas o reprogramar tus citas.
          </p>
          <button style={{ width: "100%", padding: "10px", borderRadius: "10px", background: "var(--dash-accent)", color: "#0D1810", fontWeight: 700, fontSize: "0.78rem", border: "none", cursor: "pointer" }}>
            Contactar Asesor
          </button>
        </div>
      </div>
    </div>
  );
}
