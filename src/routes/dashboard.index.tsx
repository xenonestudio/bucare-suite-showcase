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
import { API_URL } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [realCitas, setRealCitas] = useState<any[]>([]);
  const [loadingCitas, setLoadingCitas] = useState(true);
  const [todayVisits, setTodayVisits] = useState<number | string>("...");
  const [realClientes, setRealClientes] = useState<any[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  // Estados de Analítica detallada
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

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

  // Fetch de analíticas y KPIs consolidados
  useEffect(() => {
    if (!["SUPERADMIN", "ADMIN", "VENTAS"].includes(userRole)) return;
    
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/analytics/kpis`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setAnalyticsData(json.data);
          }
        }
      } catch (err) {
        console.error("Error fetching analytics KPIs:", err);
      } finally {
        setLoadingAnalytics(false);
      }
    };
    fetchAnalytics();
    
    // Intervalo de actualización en vivo de analíticas (cada 10 segundos)
    const interval = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(interval);
  }, [userRole]);

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/citas`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          const list = json.data || [];
          
          // Filter to today's appointments
          const todayStr = new Date().toLocaleDateString("en-CA");
          const todayCitas = list.filter((c: any) => {
            try {
              const cDateStr = new Date(c.fecha).toLocaleDateString("en-CA");
              return cDateStr === todayStr;
            } catch {
              return false;
            }
          });
          
          // Map to match the expected structure of citasHoy
          const mapped = todayCitas.map((c: any) => {
            const dateObj = new Date(c.fecha);
            const horaStr = dateObj.toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true
            });
            return {
              id: c.id,
              cliente: c.cliente?.fullName || c.cliente?.email || "Cliente sin nombre",
              asesor: "Asesor Bucare",
              hora: horaStr,
              estado: c.estado === "CONFIRMADO" ? "Confirmado" : c.estado === "PENDIENTE" ? "Pendiente" : c.estado,
              tipo: c.tipoPropiedad === "LOCAL" ? "Bucare Plaza" : "Bucare Suite",
            };
          });
          
          setRealCitas(mapped);
          setIsOffline(false);
        } else {
          setIsOffline(true);
        }
      } catch (err) {
        console.error("Error fetching today's appointments:", err);
        setIsOffline(true);
      } finally {
        setLoadingCitas(false);
      }
    };
    fetchCitas();
  }, []);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/visits/today`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const json = await res.json();
          setTodayVisits(json.data || 0);
          setIsOffline(false);
        } else {
          setIsOffline(true);
        }
      } catch (err) {
        console.error("Error fetching today's visits:", err);
        setIsOffline(true);
      }
    };
    fetchVisits();
  }, []);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem("token");
        const resUsers = await fetch(`${API_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const resCitas = await fetch(`${API_URL}/citas`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (resUsers.ok && resCitas.ok) {
          const jsonUsers = await resUsers.json();
          const jsonCitas = await resCitas.json();
          
          const usersList = jsonUsers.data || [];
          const citasList = jsonCitas.data || [];
          
          const clientsOnly = usersList.filter((u: any) => u.role === "CLIENTE");
          
          const mappedClients = clientsOnly.map((u: any) => {
            const userCitas = citasList.filter((c: any) => c.clienteId === u.id);
            userCitas.sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
            
            const lastCita = userCitas[0];
            
            let interes = "Por definir";
            let presupuesto = "—";
            if (lastCita) {
              interes = lastCita.tipoPropiedad === "LOCAL" ? "Bucare Plaza (Local)" : "Bucare Suite";
              presupuesto = lastCita.tipoPropiedad === "LOCAL" ? "$250K" : "$180K";
            }
            
            let ultimaVisita = "—";
            if (lastCita) {
              ultimaVisita = new Date(lastCita.fecha).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "short",
                year: "numeric"
              });
            } else {
              ultimaVisita = new Date(u.createdAt).toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "short",
                year: "numeric"
              });
            }
            
            return {
              id: u.id,
              nombre: u.fullName || u.email || "Cliente",
              interes,
              presupuesto,
              ultima: ultimaVisita,
              estado: u.isActive ? "Activo" : "Inactivo",
            };
          });
          
          mappedClients.sort((a: any, b: any) => b.id.localeCompare(a.id));
          setRealClientes(mappedClients.slice(0, 5));
          setIsOffline(false);
        } else {
          setIsOffline(true);
        }
      } catch (err) {
        console.error("Error fetching clients for dashboard:", err);
        setIsOffline(true);
      } finally {
        setLoadingClientes(false);
      }
    };
    fetchClients();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", paddingBottom: "48px" }}>
      
      {/* ── HERO BIENVENIDA ── */}
      <div style={{ borderRadius: "20px", overflow: "hidden", flexShrink: 0, position: "relative" }}>
        <div style={{ position: "relative", height: "clamp(180px, 30vw, 250px)" }}>
          <img
            src="/modelos/Imagen_modelo01.jpg"
            alt="Bucare Suite"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          <div className="hero-overlay" style={{ position: "absolute", inset: 0 }} />
          <div style={{ position: "absolute", bottom: "20px", left: "20px", right: "20px" }}>
            <p style={{ color: "var(--dash-accent)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "4px" }}>
              Panel de Control
            </p>
            <h1 style={{ color: "var(--dash-text)", fontFamily: "var(--font-display)", fontSize: "clamp(1.2rem,4vw,2.4rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1, margin: 0 }}>
              ¡Bienvenido a Bucare Suite!
            </h1>
            <p style={{ color: "rgba(232,237,233,0.65)", fontSize: "0.75rem", marginTop: "6px" }}>
              Sistema administrativo consolidado · {new Date().toLocaleDateString("es-VE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "1fr" }}>
        {/* Ficha de Perfil del Usuario */}
        <div style={{ ...S.card, padding: "30px", background: "rgba(255,255,255,0.02)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "20px", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "24px", marginBottom: "24px" }}>
            <Avatar style={{ height: "64px", width: "64px", fontSize: "1.2rem", fontWeight: 800 }}>
              <AvatarFallback style={{ background: "var(--dash-accent)", color: "#0D1810" }}>
                {userEmail.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 style={{ ...S.text, fontSize: "1.3rem", fontWeight: 800, margin: 0 }}>
                {userEmail.split("@")[0]}
              </h2>
              <p style={{ ...S.muted, fontSize: "0.78rem", marginTop: "4px" }}>
                Sesión activa como: <Badge className="bg-[#E1B668]/15 text-[#E1B668] border-[#E1B668]/30 font-bold ml-1">{userRole}</Badge>
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gap: "16px", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.03)" }}>
              <span style={{ ...S.muted, fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", display: "block" }}>Correo Registrado</span>
              <span style={{ ...S.text, fontSize: "0.85rem", fontWeight: 600, display: "block", marginTop: "4px" }}>{userEmail}</span>
            </div>
            <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.03)" }}>
              <span style={{ ...S.muted, fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", display: "block" }}>Rol de Acceso</span>
              <span style={{ ...S.text, fontSize: "0.85rem", fontWeight: 600, display: "block", marginTop: "4px" }}>{userRole}</span>
            </div>
          </div>
        </div>
      </div>
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
        const res = await fetch(`${API_URL}/citas`, {
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
