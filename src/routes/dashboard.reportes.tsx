import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend,
  ComposedChart, Line
} from "recharts";
import {
  Users, Activity, TrendingUp, TrendingDown, Calendar, Clock, MapPin,
  Monitor, Smartphone, Tablet, Wifi, Bell, BellOff, ArrowUpRight,
  ArrowDownRight, RefreshCw, CheckCircle, XCircle, AlertTriangle,
  BarChart3, Globe, UserCheck, UserX, Repeat, Eye, Minus, Download
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { API_URL } from "@/lib/api";
import { jsPDF } from "jspdf";


export const Route = createFileRoute("/dashboard/reportes")({ component: DashboardReportes });

// ── Paleta ────────────────────────────────────────────────────────────────────
const COLORS = {
  gold:    "#E1B668",
  green:   "#6fcf7c",
  blue:    "#60a5fa",
  purple:  "#a78bfa",
  red:     "#f87171",
  orange:  "#fb923c",
  teal:    "#2dd4bf",
  muted:   "#8B9983",
};

const PIE_COLORS = [COLORS.gold, COLORS.green, COLORS.blue, COLORS.purple, COLORS.orange, COLORS.teal, COLORS.red];

// ── Estilos base ──────────────────────────────────────────────────────────────
const S = {
  card:   { background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: "16px", transition: "border-color 0.2s ease, box-shadow 0.2s ease" } as React.CSSProperties,
  text:   { color: "var(--dash-text)" }   as React.CSSProperties,
  muted:  { color: "var(--dash-muted)" }  as React.CSSProperties,
  accent: { color: "var(--dash-accent)" } as React.CSSProperties,
};

const tooltipStyle = {
  background: "var(--dash-sidebar)", border: "1px solid var(--dash-border-hover)",
  borderRadius: "10px", color: "var(--dash-text)", fontSize: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
};

// ── Componente KPI Card ───────────────────────────────────────────────────────
function KpiCard({
  label, value, sub, icon: Icon, color, trend, trendValue, live = false, loading = false
}: {
  label: string; value: string; sub?: string; icon: any; color: string;
  trend?: "up" | "down" | "neutral"; trendValue?: string | number;
  live?: boolean; loading?: boolean;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div
      style={{ ...S.card, padding: "20px", position: "relative", overflow: "hidden", boxShadow: hover ? "0 8px 32px rgba(0,0,0,0.4)" : "none", borderColor: hover ? "var(--dash-border-hover)" : "var(--dash-border)" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{ position: "absolute", top: 0, left: 0, width: "3px", height: "100%", background: color, borderRadius: "16px 0 0 16px" }} />
      <div style={{ paddingLeft: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <span style={{ ...S.muted, fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</span>
          <div style={{ padding: "7px", borderRadius: "10px", background: `${color}18` }}>
            <Icon size={14} style={{ color }} />
          </div>
        </div>
        {loading ? (
          <Skeleton className="h-7 w-20 bg-white/5" />
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ ...S.text, fontSize: "1.6rem", fontFamily: "var(--font-display)", fontWeight: 800, lineHeight: 1 }}>{value}</span>
            {live && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full" style={{ background: color, opacity: 0.75 }} />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: color }} />
              </span>
            )}
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "8px" }}>
          {trend === "up"      && <ArrowUpRight   size={12} style={{ color: COLORS.green }} />}
          {trend === "down"    && <ArrowDownRight  size={12} style={{ color: COLORS.red }} />}
          {trend === "neutral" && <Minus           size={12} style={{ color: COLORS.muted }} />}
          <span style={{
            color: trend === "up" ? COLORS.green : trend === "down" ? COLORS.red : COLORS.muted,
            fontSize: "0.7rem", fontWeight: 600
          }}>
            {trendValue ?? sub ?? "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Componente SectionTitle ───────────────────────────────────────────────────
function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{ marginBottom: "4px" }}>
      <h3 style={{ ...S.text, fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700, margin: 0 }}>{title}</h3>
      {sub && <p style={{ ...S.muted, fontSize: "0.7rem", margin: "3px 0 0" }}>{sub}</p>}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
function DashboardReportes() {
  const [userRole,      setUserRole]      = useState<string>("SUPERADMIN");
  const [kpis,          setKpis]          = useState<any>(null);
  const [kpisCitas,     setKpisCitas]     = useState<any>(null);
  const [kpisClientes,  setKpisClientes]  = useState<any>(null);
  const [loading,       setLoading]       = useState(true);
  const [loadingCitas,  setLoadingCitas]  = useState(true);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [lastUpdate,    setLastUpdate]    = useState<Date>(new Date());

  const [exportingPdf,  setExportingPdf]  = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try { const p = JSON.parse(stored); if (p.role) setUserRole(p.role); }
      catch { /* ignore */ }
    }
  }, []);

  const fetchAll = useCallback(async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const r = await fetch(`${API_URL}/analytics/kpis`, { headers });
      if (r.ok) { const j = await r.json(); if (j.success) setKpis(j.data); }
    } catch { /* silent */ } finally { setLoading(false); }

    if (["SUPERADMIN", "ADMIN", "VENTAS"].includes(userRole)) {
      try {
        const r = await fetch(`${API_URL}/analytics/kpis/citas`, { headers });
        if (r.ok) { const j = await r.json(); if (j.success) setKpisCitas(j.data); }
      } catch { /* silent */ } finally { setLoadingCitas(false); }

      try {
        const r = await fetch(`${API_URL}/analytics/kpis/clientes`, { headers });
        if (r.ok) { const j = await r.json(); if (j.success) setKpisClientes(j.data); }
      } catch { /* silent */ } finally { setLoadingClientes(false); }
    } else {
      setLoadingCitas(false);
      setLoadingClientes(false);
    }

    setLastUpdate(new Date());
  }, [userRole]);

  useEffect(() => {
    if (!userRole) return;
    fetchAll();
    const iv = setInterval(fetchAll, 15000);
    return () => clearInterval(iv);
  }, [fetchAll, userRole]);

  // Función para exportar PDF profesional usando jsPDF
  const handleExportPdf = () => {
    setExportingPdf(true);
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const margin = 15;
      const contentWidth = 210 - (margin * 2);
      let y = 18;

      const darkGreen = [13, 24, 16];
      const gold = [225, 182, 104];

      const drawHeader = (pageNum: number) => {
        doc.setFillColor(darkGreen[0], darkGreen[1], darkGreen[2]);
        doc.rect(0, 0, 210, 32, "F");
        doc.setTextColor(gold[0], gold[1], gold[2]);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("BUCARE SUITE & SHOWCASE", margin, 14);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text("REPORTE ANALÍTICO DE NEGOCIO Y TRÁFICO", margin, 20);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        const dateStr = new Date().toLocaleString("es-VE");
        doc.text(`Generado: ${dateStr}`, 210 - margin - 45, 14);
        doc.text(`Página ${pageNum}`, 210 - margin - 15, 20);
      };

      const drawSeparator = (currY: number) => {
        doc.setDrawColor(gold[0], gold[1], gold[2]);
        doc.setLineWidth(0.4);
        doc.line(margin, currY, 210 - margin, currY);
      };

      // PÁGINA 1: RESUMEN GENERAL
      drawHeader(1);
      y = 42;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
      doc.text("1. KPIs PRINCIPALES DE TRÁFICO", margin, y);
      y += 6;

      const kpiList = [
        { label: "Visitas del Día", value: fmt(kpis?.visitasDia) },
        { label: "Visitas Semana", value: fmt(kpis?.visitasSemana) },
        { label: "Visitas Mes", value: fmt(kpis?.visitasMes) },
        { label: "Duración Media", value: fmtMin(kpis?.avgDurationSeconds ?? 0) },
        { label: "Tasa de Rebote", value: `${kpis?.tasaRebote ?? 0}%` },
        { label: "Visitantes Únicos", value: fmt(kpis?.totalVisitantes) }
      ];

      kpiList.forEach((kpi, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const cardX = margin + (col * (contentWidth / 2 + 3));
        const cardY = y + (row * 18);

        doc.setFillColor(248, 248, 248);
        doc.rect(cardX, cardY, (contentWidth / 2) - 3, 15, "F");
        doc.setDrawColor(220, 220, 220);
        doc.rect(cardX, cardY, (contentWidth / 2) - 3, 15, "S");
        doc.setFillColor(gold[0], gold[1], gold[2]);
        doc.rect(cardX, cardY, 1.5, 15, "F");
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.text(kpi.label, cardX + 4, cardY + 5.5);
        doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text(kpi.value, cardX + 4, cardY + 11);
      });

      y += 60;
      drawSeparator(y);
      y += 8;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
      doc.text("2. PUNTOS DE INTERÉS (PÁGINAS MÁS RECORRIDAS)", margin, y);
      y += 8;

      doc.setFillColor(darkGreen[0], darkGreen[1], darkGreen[2]);
      doc.rect(margin, y, contentWidth, 7, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Título de Página / Ruta", margin + 4, y + 5);
      doc.text("Visitas", 210 - margin - 20, y + 5);
      y += 7;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      const pages = kpis?.paginasMasVisitadas || [];
      if (pages.length === 0) {
        doc.text("No hay suficientes datos recopilados.", margin + 4, y + 6);
        y += 8;
      } else {
        pages.slice(0, 7).forEach((p: any, idx: number) => {
          if (idx % 2 === 1) {
            doc.setFillColor(249, 249, 249);
            doc.rect(margin, y, contentWidth, 7.5, "F");
          }
          doc.text(p.title || p.path, margin + 4, y + 5);
          doc.text(fmt(p.views), 210 - margin - 20, y + 5);
          y += 7.5;
        });
      }

      y += 6;
      drawSeparator(y);
      y += 8;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
      doc.text("3. ORÍGENES Y DISPOSITIVOS", margin, y);
      y += 8;

      const pwaRate = kpis?.totalVisitantes > 0 ? Math.round((kpis.pwaInstaladas / kpis.totalVisitantes) * 100) : 0;
      const pushRate = kpis?.totalVisitantes > 0 ? Math.round((kpis.pushHabilitadas / kpis.totalVisitantes) * 100) : 0;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(55, 55, 55);
      doc.text(`• Adopción de PWA (Instalaciones): ${pwaRate}% (${kpis?.pwaInstaladas ?? 0} usuarios)`, margin, y);
      y += 6;
      doc.text(`• Permisos de Notificaciones Push: ${pushRate}% (${kpis?.pushHabilitadas ?? 0} usuarios)`, margin, y);
      y += 8;

      doc.setFont("helvetica", "bold");
      doc.text("Principales Países de Origen:", margin, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      const countries = kpis?.paises || [];
      if (countries.length === 0) {
        doc.text("— Ningún país de origen identificado aún.", margin + 4, y);
        y += 6;
      } else {
        countries.slice(0, 4).forEach((c: any) => {
          doc.text(`  - ${c.country}: ${fmt(c.count)} visitas`, margin, y);
          y += 5.5;
        });
      }

      // PÁGINA 2: CITAS Y CLIENTES
      doc.addPage();
      drawHeader(2);
      y = 42;

      if (["SUPERADMIN", "ADMIN", "VENTAS"].includes(userRole) && kpisCitas) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
        doc.text("4. CITAS Y CONVERSIÓN DE NEGOCIO", margin, y);
        y += 6;

        const citaKpis = [
          { label: "Citas del Mes", value: fmt(kpisCitas.totalMes) },
          { label: "Citas Completadas", value: `${fmt(kpisCitas.completadas)} (${kpisCitas.tasaConversion}%)` },
          { label: "Citas Canceladas", value: `${fmt(kpisCitas.canceladas)} (${kpisCitas.tasaNoShow}%)` },
          { label: "Citas Hoy", value: fmt(kpisCitas.citasHoy) }
        ];

        citaKpis.forEach((kpi, idx) => {
          const col = idx % 2;
          const row = Math.floor(idx / 2);
          const cardX = margin + (col * (contentWidth / 2 + 3));
          const cardY = y + (row * 18);

          doc.setFillColor(248, 248, 248);
          doc.rect(cardX, cardY, (contentWidth / 2) - 3, 15, "F");
          doc.setDrawColor(220, 220, 220);
          doc.rect(cardX, cardY, (contentWidth / 2) - 3, 15, "S");
          doc.setFillColor(gold[0], gold[1], gold[2]);
          doc.rect(cardX, cardY, 1.5, 15, "F");
          doc.setTextColor(100, 100, 100);
          doc.setFontSize(8);
          doc.text(kpi.label, cardX + 4, cardY + 5.5);
          doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10.5);
          doc.text(kpi.value, cardX + 4, cardY + 11);
        });

        y += 42;
        drawSeparator(y);
        y += 8;

        if (kpisClientes) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
          doc.text("5. GESTIÓN Y CRECIMIENTO DE CLIENTES", margin, y);
          y += 6;

          const clientKpis = [
            { label: "Total Clientes Registrados", value: fmt(kpisClientes.totalClientes) },
            { label: "Nuevos Clientes (Mes)", value: fmt(kpisClientes.nuevosEstesMes) },
            { label: "Nuevos Clientes (Semana)", value: fmt(kpisClientes.nuevosSemana) },
            { label: "Tasa de Engagement", value: `${kpisClientes.engagementRate}% con citas` }
          ];

          clientKpis.forEach((kpi, idx) => {
            const col = idx % 2;
            const row = Math.floor(idx / 2);
            const cardX = margin + (col * (contentWidth / 2 + 3));
            const cardY = y + (row * 18);

            doc.setFillColor(248, 248, 248);
            doc.rect(cardX, cardY, (contentWidth / 2) - 3, 15, "F");
            doc.setDrawColor(220, 220, 220);
            doc.rect(cardX, cardY, (contentWidth / 2) - 3, 15, "S");
            doc.setFillColor(gold[0], gold[1], gold[2]);
            doc.rect(cardX, cardY, 1.5, 15, "F");
            doc.setTextColor(100, 100, 100);
            doc.setFontSize(8);
            doc.text(kpi.label, cardX + 4, cardY + 5.5);
            doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10.5);
            doc.text(kpi.value, cardX + 4, cardY + 11);
          });

          y += 42;
          drawSeparator(y);
          y += 8;
        }

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(darkGreen[0], darkGreen[1], darkGreen[2]);
        doc.text("6. VISITANTES RECIENTES DETECTADOS (FINGERPRINTS)", margin, y);
        y += 8;

        doc.setFillColor(darkGreen[0], darkGreen[1], darkGreen[2]);
        doc.rect(margin, y, contentWidth, 7, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.text("ID Fingerprint", margin + 3, y + 5);
        doc.text("Ubicación IP", margin + 35, y + 5);
        doc.text("Dispositivo", margin + 78, y + 5);
        doc.text("Duración", margin + 115, y + 5);
        doc.text("Usuario Asociado", margin + 140, y + 5);
        y += 7;

        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        doc.setFontSize(8);

        const recentVisits = kpis?.visitasRecientes || [];
        if (recentVisits.length === 0) {
          doc.text("No hay registros disponibles.", margin + 3, y + 5);
        } else {
          recentVisits.slice(0, 12).forEach((v: any, idx: number) => {
            if (idx % 2 === 1) {
              doc.setFillColor(249, 249, 249);
              doc.rect(margin, y, contentWidth, 7.5, "F");
            }
            doc.text(v.fingerprint, margin + 3, y + 5);
            doc.text(v.location || "Unknown", margin + 35, y + 5);
            doc.text(`${v.device || "desktop"} (${v.os || "?"})`, margin + 78, y + 5);
            doc.text(v.duration > 60 ? `${Math.floor(v.duration / 60)}m` : `${v.duration}s`, margin + 115, y + 5);
            doc.text(v.associatedUser || "Invitado Anónimo", margin + 140, y + 5);
            y += 7.5;
          });
        }
      } else {
        doc.setFont("helvetica", "bold");
        doc.text("Historial de Tráfico de Invitado", margin, y);
        y += 10;
        doc.setFont("helvetica", "normal");
        doc.text("No hay datos autorizados de citas o clientes para este perfil.", margin, y);
      }

      doc.save(`Reporte_Bucare_Suite_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
    } finally {
      setExportingPdf(false);
    }
  };

  const fmt = (n: number | undefined) => (n ?? 0).toLocaleString("es-VE");
  const fmtMin = (s: number) => {
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return m > 0 ? `${m}m ${ss}s` : `${ss}s`;
  };
  const trend = (v: number): "up" | "down" | "neutral" => v > 0 ? "up" : v < 0 ? "down" : "neutral";

  // Datos de dispositivos para pie chart
  const deviceData = kpis?.dispositivos?.map((d: any) => ({
    name: d.type === "mobile" ? "Móvil" : d.type === "tablet" ? "Tablet" : "Escritorio",
    value: d.count
  })) || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", paddingBottom: "56px" }}>

      {/* ── HEADER ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ ...S.text, fontFamily: "var(--font-display)", fontSize: "1.9rem", fontWeight: 800, margin: 0 }}>
            Reportes & Analítica
          </h1>
          <p style={{ ...S.muted, fontSize: "0.78rem", marginTop: "6px" }}>
            Monitoreo en tiempo real · Tráfico · Conversión · Retención
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={handleExportPdf}
            disabled={exportingPdf}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 16px", borderRadius: "10px", fontSize: "0.75rem",
              background: COLORS.gold, border: "none",
              color: "#0D1810", cursor: "pointer", fontWeight: 700, transition: "all 0.2s",
              opacity: exportingPdf ? 0.6 : 1
            }}
          >
            <Download size={13} /> {exportingPdf ? "Generando..." : "Descargar PDF"}
          </button>
          <button
            onClick={fetchAll}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "8px 16px", borderRadius: "10px", fontSize: "0.75rem",
              background: "rgba(225,182,104,0.1)", border: "1px solid rgba(225,182,104,0.25)",
              color: COLORS.gold, cursor: "pointer", fontWeight: 600, transition: "all 0.2s"
            }}
          >
            <RefreshCw size={13} /> Actualizar
            <span style={{ ...S.muted, fontSize: "0.65rem", marginLeft: "4px" }}>
              {lastUpdate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </button>
        </div>
      </div>

      {/* ── KPI PRINCIPAL GRID ── */}
      <div style={{ display: "grid", gap: "14px", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        <KpiCard label="En Vivo Ahora"     value={fmt(kpis?.enVivoCount)}    icon={Activity}   color={COLORS.gold}   live trendValue="navegando en este instante" loading={loading} />
        <KpiCard label="Visitas del Día"   value={fmt(kpis?.visitasDia)}     icon={Eye}        color={COLORS.green}  trendValue="acumulado de hoy" loading={loading} />
        <KpiCard label="Visitas Semana"    value={fmt(kpis?.visitasSemana)}   icon={BarChart3}  color={COLORS.blue}   trendValue="últimos 7 días" loading={loading} />
        <KpiCard label="Visitas del Mes"   value={fmt(kpis?.visitasMes)}     icon={TrendingUp} color={COLORS.purple}
          trend={trend(kpis?.tendenciaVisitas ?? 0)}
          trendValue={`${kpis?.tendenciaVisitas > 0 ? "+" : ""}${kpis?.tendenciaVisitas ?? 0}% vs mes ant.`}
          loading={loading}
        />
        <KpiCard label="Tiempo Promedio"   value={fmtMin(kpis?.avgDurationSeconds ?? 0)} icon={Clock} color={COLORS.orange} trendValue="duración media sesión" loading={loading} />
        <KpiCard label="Tasa de Rebote"    value={`${kpis?.tasaRebote ?? 0}%`}  icon={ArrowDownRight} color={COLORS.red} trendValue="sesiones sin interacción" loading={loading} />
        <KpiCard label="Visitantes Únicos" value={fmt(kpis?.totalVisitantes)}  icon={Users}    color={COLORS.teal}   trendValue="identificados con fingerprint" loading={loading} />
        {["SUPERADMIN","ADMIN","VENTAS"].includes(userRole) && (
          <KpiCard label="Citas Hoy"       value={fmt(kpisCitas?.citasHoy)}   icon={Calendar}  color={COLORS.gold}   trendValue="agendadas para hoy" loading={loadingCitas} />
        )}
      </div>

      {/* ── TABS PRINCIPALES ── */}
      <Tabs defaultValue="trafico" className="w-full">
        <TabsList style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: "12px", padding: "4px", display: "flex", flexWrap: "wrap", gap: "2px", marginBottom: "20px", width: "fit-content" }}>
          {[
            ["trafico",    "📊 Tráfico"],
            ["retencion",  "🔄 Retención"],
            ["citas",      "📅 Citas"],
            ["clientes",   "👥 Clientes"],
            ["dispositivos","🖥️ Dispositivos"],
            ["en_vivo",    "🟢 En Vivo"],
          ].map(([v, l]) => (
            <TabsTrigger key={v} value={v}
              style={{ fontSize: "0.75rem", padding: "6px 14px", borderRadius: "9px" }}
              className="data-[state=active]:!bg-[--dash-accent] data-[state=active]:!text-[#0D1810] data-[state=active]:!font-bold text-[--dash-muted] transition-all"
            >
              {l}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ══ TAB: TRÁFICO ══ */}
        <TabsContent value="trafico" className="animate-fade-in">
          <div style={{ display: "grid", gap: "18px", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>

            {/* Páginas más visitadas */}
            <div style={{ ...S.card, padding: "24px" }}>
              <SectionTitle title="Puntos de Interés" sub="Páginas con más tráfico del portal" />
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px", maxHeight: "320px", overflowY: "auto" }}>
                {loading ? [1,2,3,4,5].map(i => <Skeleton key={i} className="h-10 bg-white/5" />) :
                 !kpis?.paginasMasVisitadas?.length ? <span style={S.muted} className="text-xs">Sin datos aún.</span> :
                 kpis.paginasMasVisitadas.map((p: any, i: number) => {
                   const maxV = kpis.paginasMasVisitadas[0].views;
                   const pct  = Math.round((p.views / maxV) * 100);
                   return (
                     <div key={i} style={{ padding: "10px 12px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                         <span style={{ ...S.text, fontSize: "0.75rem", fontWeight: 600 }} className="truncate max-w-[75%]">{p.title}</span>
                         <Badge className="bg-[#E1B668]/10 text-[#E1B668] border-[#E1B668]/20 text-[10px] font-bold">{p.views} vistas</Badge>
                       </div>
                       <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
                         <div style={{ width: `${pct}%`, height: "100%", background: COLORS.gold, borderRadius: "4px", transition: "width 0.5s ease" }} />
                       </div>
                       <span style={{ ...S.muted, fontSize: "0.6rem" }} className="font-mono">{p.path}</span>
                     </div>
                   );
                 })}
              </div>
            </div>

            {/* Distribución Geográfica */}
            <div style={{ ...S.card, padding: "24px" }}>
              <SectionTitle title="Países de Origen" sub="Distribución geográfica de visitantes" />
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px", maxHeight: "320px", overflowY: "auto" }}>
                {loading ? [1,2,3,4].map(i => <Skeleton key={i} className="h-8 bg-white/5" />) :
                 !kpis?.paises?.length ? <span style={S.muted} className="text-xs">Sin datos de geolocalización.</span> :
                 kpis.paises.map((p: any, idx: number) => {
                   const total = kpis.paises.reduce((a: number, x: any) => a + x.count, 0);
                   const pct   = total > 0 ? Math.round((p.count / total) * 100) : 0;
                   return (
                     <div key={idx} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                       <MapPin size={12} style={{ color: PIE_COLORS[idx % PIE_COLORS.length], flexShrink: 0 }} />
                       <span style={{ ...S.text, fontSize: "0.78rem", minWidth: "100px" }}>{p.country}</span>
                       <div style={{ flex: 1, height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
                         <div style={{ width: `${pct}%`, height: "100%", background: PIE_COLORS[idx % PIE_COLORS.length], borderRadius: "4px" }} />
                       </div>
                       <span style={{ ...S.muted, fontSize: "0.72rem", fontWeight: 700, minWidth: "28px", textAlign: "right" }}>{pct}%</span>
                     </div>
                   );
                 })}
              </div>

              {/* PWA & Push */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px", marginTop: "16px" }}>
                <SectionTitle title="PWA & Permisos Push" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "12px" }}>
                  {[
                    { label: "PWA Instalada", icon: Wifi,  val: kpis?.pwaInstaladas ?? 0, total: kpis?.totalVisitantes ?? 1, color: COLORS.teal },
                    { label: "Push Activas",  icon: Bell,  val: kpis?.pushHabilitadas ?? 0, total: kpis?.totalVisitantes ?? 1, color: COLORS.green },
                  ].map(({ label, icon: Ic, val, total, color }) => (
                    <div key={label} style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                        <Ic size={12} style={{ color }} />
                        <span style={{ ...S.muted, fontSize: "0.62rem" }}>{label}</span>
                      </div>
                      <span style={{ ...S.text, fontSize: "1.2rem", fontFamily: "var(--font-display)", fontWeight: 800 }}>
                        {total > 0 ? `${Math.round((val / total) * 100)}%` : "0%"}
                      </span>
                      <span style={{ ...S.muted, fontSize: "0.6rem", display: "block", marginTop: "2px" }}>{val} usuarios</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ══ TAB: RETENCIÓN ══ */}
        <TabsContent value="retencion" className="animate-fade-in">
          <div style={{ display: "grid", gap: "18px", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>

            {/* Nuevos vs Recurrentes */}
            <div style={{ ...S.card, padding: "24px", gridColumn: "1 / -1" }}>
              <SectionTitle title="Nuevos vs. Visitantes Recurrentes" sub="Evolución semanal de los últimas 8 semanas" />
              <div style={{ height: "260px", marginTop: "20px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={kpis?.retencionSemanas || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="semana" axisLine={false} tickLine={false} tick={{ fill: "#6B7F6E", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7F6E", fontSize: 11 }} />
                    <RechartsTooltip contentStyle={tooltipStyle} labelStyle={{ color: COLORS.gold }} />
                    <Legend wrapperStyle={{ fontSize: "12px", color: "#8B9983", paddingTop: "12px" }} />
                    <defs>
                      <linearGradient id="gNuevos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={COLORS.blue}  stopOpacity={0.3} />
                        <stop offset="95%" stopColor={COLORS.blue}  stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area   type="monotone" dataKey="nuevos"       name="Nuevos"       stroke={COLORS.blue}   strokeWidth={2} fill="url(#gNuevos)" dot={false} />
                    <Line  type="monotone" dataKey="recurrentes"  name="Recurrentes"  stroke={COLORS.gold}   strokeWidth={2.5} dot={{ r: 4, fill: COLORS.gold }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Embudo de retención */}
            <div style={{ ...S.card, padding: "24px" }}>
              <SectionTitle title="Embudo de Fidelización" sub="Visitantes que han vuelto múltiples veces" />
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "20px" }}>
                {loading ? [1,2,3,4].map(i => <Skeleton key={i} className="h-10 bg-white/5" />) : [
                  { label: "Visitantes únicos totales", value: kpis?.embudo?.total ?? 0,        color: COLORS.blue,   icon: Users },
                  { label: "Retornaron 2+ veces",       value: kpis?.embudo?.retornaron2x ?? 0, color: COLORS.green,  icon: Repeat },
                  { label: "Retornaron 3+ veces",       value: kpis?.embudo?.retornaron3x ?? 0, color: COLORS.gold,   icon: Repeat },
                  { label: "Retornaron 4+ veces",       value: kpis?.embudo?.retornaron4x ?? 0, color: COLORS.purple, icon: Repeat },
                ].map(({ label, value, color, icon: Ic }) => {
                  const total = kpis?.embudo?.total || 1;
                  const pct   = Math.round((value / total) * 100);
                  return (
                    <div key={label}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <Ic size={13} style={{ color }} />
                          <span style={{ ...S.text, fontSize: "0.78rem" }}>{label}</span>
                        </div>
                        <span style={{ color, fontSize: "0.85rem", fontFamily: "var(--font-display)", fontWeight: 700 }}>
                          {fmt(value)} <span style={{ ...S.muted, fontSize: "0.65rem" }}>({pct}%)</span>
                        </span>
                      </div>
                      <div style={{ height: "5px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "4px", transition: "width 0.6s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tasa de rebote info */}
            <div style={{ ...S.card, padding: "24px" }}>
              <SectionTitle title="Calidad de Sesiones" sub="Indicadores de engagement del portal" />
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>
                {[
                  { label: "Tasa de Rebote",    value: `${kpis?.tasaRebote ?? 0}%`,             icon: ArrowDownRight, color: kpis?.tasaRebote > 50 ? COLORS.red : COLORS.green,  desc: "sesiones de una sola página" },
                  { label: "Tiempo Promedio",   value: fmtMin(kpis?.avgDurationSeconds ?? 0),    icon: Clock,          color: COLORS.gold,    desc: "por sesión de usuario" },
                  { label: "Visitas del Mes",   value: fmt(kpis?.visitasMes),                    icon: TrendingUp,     color: COLORS.blue,    desc: `${kpis?.tendenciaVisitas > 0 ? "+" : ""}${kpis?.tendenciaVisitas ?? 0}% vs mes anterior` },
                  { label: "Visitantes Únicos", value: fmt(kpis?.totalVisitantes),               icon: Users,          color: COLORS.teal,    desc: "dispositivos identificados" },
                ].map(({ label, value, icon: Ic, color, desc }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.02)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ padding: "8px", borderRadius: "8px", background: `${color}18` }}>
                        <Ic size={14} style={{ color }} />
                      </div>
                      <div>
                        <span style={{ ...S.text, fontSize: "0.78rem", fontWeight: 600, display: "block" }}>{label}</span>
                        <span style={{ ...S.muted, fontSize: "0.65rem" }}>{desc}</span>
                      </div>
                    </div>
                    {loading ? <Skeleton className="h-5 w-14 bg-white/5" /> :
                      <span style={{ color, fontSize: "1rem", fontFamily: "var(--font-display)", fontWeight: 800 }}>{value}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ══ TAB: CITAS ══ */}
        <TabsContent value="citas" className="animate-fade-in">
          {!["SUPERADMIN","ADMIN","VENTAS"].includes(userRole) ? (
            <div style={{ ...S.card, padding: "32px", textAlign: "center" }}>
              <span style={{ ...S.muted, fontSize: "0.85rem" }}>No tienes acceso a los reportes de citas.</span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

              {/* KPIs de citas */}
              <div style={{ display: "grid", gap: "14px", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
                <KpiCard label="Citas del Mes"    value={fmt(kpisCitas?.totalMes)}   icon={Calendar}      color={COLORS.blue}   trendValue="total agendadas"      loading={loadingCitas} />
                <KpiCard label="Completadas"      value={fmt(kpisCitas?.completadas)} icon={CheckCircle}   color={COLORS.green}  trendValue={`${kpisCitas?.tasaConversion ?? 0}% conversión`} loading={loadingCitas} />
                <KpiCard label="Canceladas"       value={fmt(kpisCitas?.canceladas)}  icon={XCircle}       color={COLORS.red}    trendValue={`${kpisCitas?.tasaNoShow ?? 0}% no-show`}    loading={loadingCitas} />
                <KpiCard label="Citas Hoy"        value={fmt(kpisCitas?.citasHoy)}    icon={Calendar}      color={COLORS.gold}   trendValue="programadas para hoy" loading={loadingCitas} />
                <KpiCard label="Próximas 24h"     value={fmt(kpisCitas?.proximas24h?.length)} icon={AlertTriangle} color={COLORS.orange} trendValue="requieren seguimiento" loading={loadingCitas} />
              </div>

              <div style={{ display: "grid", gap: "18px", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>

                {/* Evolución de citas */}
                <div style={{ ...S.card, padding: "24px" }}>
                  <SectionTitle title="Evolución Semanal de Citas" sub="Total, completadas y canceladas por semana" />
                  <div style={{ height: "240px", marginTop: "20px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={kpisCitas?.evolucionSemanas || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="semana" axisLine={false} tickLine={false} tick={{ fill: "#6B7F6E", fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7F6E", fontSize: 11 }} />
                        <RechartsTooltip contentStyle={tooltipStyle} />
                        <Legend wrapperStyle={{ fontSize: "11px", color: "#8B9983", paddingTop: "10px" }} />
                        <Bar dataKey="total"      name="Total"      fill={COLORS.blue}   radius={[4,4,0,0]} opacity={0.7} />
                        <Bar dataKey="completadas" name="Completadas" fill={COLORS.green}  radius={[4,4,0,0]} />
                        <Bar dataKey="canceladas"  name="Canceladas"  fill={COLORS.red}    radius={[4,4,0,0]} opacity={0.7} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Distribución por tipo */}
                <div style={{ ...S.card, padding: "24px" }}>
                  <SectionTitle title="Por Tipo de Propiedad" sub="Distribución de citas este mes" />
                  <div style={{ height: "180px", marginTop: "20px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={kpisCitas?.porTipo?.map((t: any) => ({ name: t.tipo, value: t.count })) || []}
                          cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                          {(kpisCitas?.porTipo || []).map((_: any, i: number) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                    {(kpisCitas?.porTipo || []).map((t: any, i: number) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "2px", background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span style={{ ...S.muted, fontSize: "0.7rem" }}>{t.tipo} ({t.count})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Próximas 24h */}
                <div style={{ ...S.card, overflow: "hidden", gridColumn: "1 / -1" }}>
                  <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--dash-border)", display: "flex", alignItems: "center", gap: "10px" }}>
                    <AlertTriangle size={16} style={{ color: COLORS.orange }} />
                    <div>
                      <h3 style={{ ...S.text, fontFamily: "var(--font-display)", fontSize: "0.9rem", fontWeight: 700, margin: 0 }}>
                        Próximas 24 Horas — Requieren Seguimiento
                      </h3>
                      <p style={{ ...S.muted, fontSize: "0.7rem", margin: "2px 0 0" }}>
                        {kpisCitas?.proximas24h?.length || 0} citas en las próximas 24 horas
                      </p>
                    </div>
                  </div>
                  {loadingCitas ? (
                    <div style={{ padding: "20px" }}><Skeleton className="h-12 bg-white/5" /></div>
                  ) : !kpisCitas?.proximas24h?.length ? (
                    <div style={{ padding: "32px", textAlign: "center", ...S.muted }}>Sin citas próximas en las próximas 24 horas. ✓</div>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid var(--dash-border)" }}>
                            {["Hora", "Cliente", "Tipo", "Estado", "Notas"].map(h => (
                              <th key={h} style={{ padding: "12px 16px", textAlign: "left", ...S.muted, fontWeight: 600, fontSize: "0.65rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {kpisCitas.proximas24h.map((c: any) => (
                            <tr key={c.id} style={{ borderBottom: "1px solid var(--dash-border)" }} className="hover:bg-white/2">
                              <td style={{ padding: "12px 16px", ...S.text, fontWeight: 700 }}>
                                {new Date(c.fecha).toLocaleString("es-VE", { hour: "2-digit", minute: "2-digit", month: "short", day: "numeric" })}
                              </td>
                              <td style={{ padding: "12px 16px" }}>
                                <span style={{ ...S.text, display: "block", fontWeight: 600 }}>{c.cliente?.fullName || "—"}</span>
                                <span style={{ ...S.muted, fontSize: "0.65rem" }}>{c.cliente?.email || c.cliente?.phone || ""}</span>
                              </td>
                              <td style={{ padding: "12px 16px", ...S.muted }}>{c.tipoPropiedad}</td>
                              <td style={{ padding: "12px 16px" }}>
                                <Badge className="text-[10px] font-bold" style={{
                                  background: c.estado === "CONFIRMADA" ? "rgba(111,207,124,0.15)" : "rgba(225,182,104,0.15)",
                                  color: c.estado === "CONFIRMADA" ? COLORS.green : COLORS.gold,
                                  border: `1px solid ${c.estado === "CONFIRMADA" ? COLORS.green : COLORS.gold}40`
                                }}>
                                  {c.estado}
                                </Badge>
                              </td>
                              <td style={{ padding: "12px 16px", ...S.muted, fontSize: "0.7rem" }}>{c.notas || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ══ TAB: CLIENTES ══ */}
        <TabsContent value="clientes" className="animate-fade-in">
          {!["SUPERADMIN","ADMIN","VENTAS"].includes(userRole) ? (
            <div style={{ ...S.card, padding: "32px", textAlign: "center" }}>
              <span style={{ ...S.muted, fontSize: "0.85rem" }}>No tienes acceso a los reportes de clientes.</span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

              {/* KPIs clientes */}
              <div style={{ display: "grid", gap: "14px", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
                <KpiCard label="Total Clientes"   value={fmt(kpisClientes?.totalClientes)}  icon={Users}    color={COLORS.blue}   trendValue="registrados" loading={loadingClientes} />
                <KpiCard label="Nuevos Este Mes"  value={fmt(kpisClientes?.nuevosEstesMes)} icon={UserCheck} color={COLORS.green}
                  trend={trend(kpisClientes?.tendencia ?? 0)}
                  trendValue={`${kpisClientes?.tendencia > 0 ? "+" : ""}${kpisClientes?.tendencia ?? 0}% vs mes ant.`}
                  loading={loadingClientes}
                />
                <KpiCard label="Nuevos Esta Semana" value={fmt(kpisClientes?.nuevosSemana)} icon={TrendingUp} color={COLORS.gold}  trendValue="últimos 7 días" loading={loadingClientes} />
                <KpiCard label="Con Citas Activas"  value={fmt(kpisClientes?.clientesConCitas)} icon={Calendar}  color={COLORS.purple} trendValue={`${kpisClientes?.engagementRate ?? 0}% de engagement`} loading={loadingClientes} />
                <KpiCard label="Sin Citas Aún"      value={fmt(kpisClientes?.clientesSinCitas)} icon={UserX}     color={COLORS.orange} trendValue="por convertir" loading={loadingClientes} />
              </div>

              <div style={{ display: "grid", gap: "18px", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))" }}>

                {/* Crecimiento semanal */}
                <div style={{ ...S.card, padding: "24px" }}>
                  <SectionTitle title="Crecimiento de Clientes" sub="Nuevos registros por semana (últimas 8 semanas)" />
                  <div style={{ height: "240px", marginTop: "20px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={kpisClientes?.crecimientoSemanas || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gClientes" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor={COLORS.green} stopOpacity={0.35} />
                            <stop offset="95%" stopColor={COLORS.green} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="semana" axisLine={false} tickLine={false} tick={{ fill: "#6B7F6E", fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "#6B7F6E", fontSize: 11 }} />
                        <RechartsTooltip contentStyle={tooltipStyle} labelStyle={{ color: COLORS.green }} />
                        <Area type="monotone" dataKey="nuevos" name="Nuevos clientes" stroke={COLORS.green} strokeWidth={2.5} fillOpacity={1} fill="url(#gClientes)" dot={{ r: 4, fill: COLORS.green }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Engagement donut */}
                <div style={{ ...S.card, padding: "24px" }}>
                  <SectionTitle title="Engagement de Clientes" sub="Distribución de clientes activos vs. pasivos" />
                  <div style={{ height: "180px", marginTop: "20px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Con citas", value: kpisClientes?.clientesConCitas || 0 },
                            { name: "Sin citas", value: kpisClientes?.clientesSinCitas || 0 },
                          ]}
                          cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value"
                        >
                          <Cell fill={COLORS.green} />
                          <Cell fill="rgba(255,255,255,0.08)" />
                        </Pie>
                        <RechartsTooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: COLORS.green }} />
                      <span style={{ ...S.muted, fontSize: "0.72rem" }}>Activos ({kpisClientes?.clientesConCitas || 0})</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "3px", background: "rgba(255,255,255,0.15)" }} />
                      <span style={{ ...S.muted, fontSize: "0.72rem" }}>Sin citas ({kpisClientes?.clientesSinCitas || 0})</span>
                    </div>
                  </div>

                  {/* Geo clientes */}
                  {kpisClientes?.geoClientes?.length > 0 && (
                    <div style={{ marginTop: "20px", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}>
                      <SectionTitle title="Ubicación de Clientes" />
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "10px" }}>
                        {kpisClientes.geoClientes.map((g: any, i: number) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <Globe size={11} style={{ color: PIE_COLORS[i % PIE_COLORS.length] }} />
                              <span style={{ ...S.text, fontSize: "0.75rem" }}>{g.country}</span>
                            </div>
                            <Badge className="text-[10px]" style={{ background: `${PIE_COLORS[i % PIE_COLORS.length]}18`, color: PIE_COLORS[i % PIE_COLORS.length], border: "none" }}>
                              {g.count}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ══ TAB: DISPOSITIVOS ══ */}
        <TabsContent value="dispositivos" className="animate-fade-in">
          <div style={{ display: "grid", gap: "18px", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>

            {/* Donut dispositivos */}
            <div style={{ ...S.card, padding: "24px" }}>
              <SectionTitle title="Tipo de Dispositivo" sub="Distribución de accesos por plataforma" />
              <div style={{ height: "200px", marginTop: "20px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={deviceData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                      {deviceData.map((_: any, i: number) => (
                        <Cell key={i} fill={[COLORS.blue, COLORS.gold, COLORS.teal][i % 3]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "16px" }}>
                {deviceData.map((d: any, i: number) => {
                  const total = deviceData.reduce((a: number, x: any) => a + x.value, 0);
                  const pct   = total > 0 ? Math.round((d.value / total) * 100) : 0;
                  const colors = [COLORS.blue, COLORS.gold, COLORS.teal];
                  const icons  = [Monitor, Smartphone, Tablet];
                  const Ic     = icons[i % icons.length];
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Ic size={14} style={{ color: colors[i % 3], flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ ...S.text, fontSize: "0.78rem" }}>{d.name}</span>
                          <span style={{ color: colors[i % 3], fontSize: "0.78rem", fontWeight: 700 }}>{pct}%</span>
                        </div>
                        <div style={{ height: "4px", background: "rgba(255,255,255,0.06)", borderRadius: "4px", marginTop: "4px", overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: colors[i % 3], borderRadius: "4px" }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PWA & Push detail */}
            <div style={{ ...S.card, padding: "24px" }}>
              <SectionTitle title="Adopción PWA & Notificaciones" sub="Estado de instalación y permisos de los visitantes" />
              <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "20px" }}>
                {[
                  { label: "PWA Instalada",    icon: Wifi,    val: kpis?.pwaInstaladas ?? 0,   total: kpis?.totalVisitantes ?? 1, color: COLORS.teal,  desc: "han instalado la app" },
                  { label: "Push Activas",      icon: Bell,    val: kpis?.pushHabilitadas ?? 0, total: kpis?.totalVisitantes ?? 1, color: COLORS.green, desc: "con notificaciones activas" },
                  { label: "Sin Push",          icon: BellOff, val: (kpis?.totalVisitantes ?? 0) - (kpis?.pushHabilitadas ?? 0), total: kpis?.totalVisitantes ?? 1, color: COLORS.red, desc: "sin permiso de notificaciones" },
                ].map(({ label, icon: Ic, val, total, color, desc }) => {
                  const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                  return (
                    <div key={label}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ padding: "7px", borderRadius: "8px", background: `${color}18` }}><Ic size={13} style={{ color }} /></div>
                          <div>
                            <span style={{ ...S.text, fontSize: "0.78rem", fontWeight: 600, display: "block" }}>{label}</span>
                            <span style={{ ...S.muted, fontSize: "0.65rem" }}>{fmt(val)} {desc}</span>
                          </div>
                        </div>
                        <span style={{ color, fontSize: "1.1rem", fontFamily: "var(--font-display)", fontWeight: 800 }}>{pct}%</span>
                      </div>
                      <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "6px", overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: "6px", transition: "width 0.7s ease" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ══ TAB: EN VIVO ══ */}
        <TabsContent value="en_vivo" className="animate-fade-in">
          <div style={{ ...S.card, overflow: "hidden" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--dash-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ ...S.text, fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700, margin: 0 }}>
                  Actividad de Tráfico — Tiempo Real
                </h3>
                <p style={{ ...S.muted, fontSize: "0.7rem", margin: "4px 0 0" }}>Historial de visitantes únicos identificados por fingerprint</p>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {kpis?.enVivoCount ?? 0} en vivo
              </Badge>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--dash-border)" }}>
                    {["ID Único","Ubicación","Dispositivo","Duración","PWA","Push","Usuario","Última Act."].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", ...S.muted, fontWeight: 600, fontSize: "0.63rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? [1,2,3,4,5].map(i => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--dash-border)" }}>
                      {[18,28,20,12,10,10,24,16].map((w, j) => (
                        <td key={j} style={{ padding: "14px 16px" }}><Skeleton className={`h-3 w-${w} bg-white/5 animate-pulse`} /></td>
                      ))}
                    </tr>
                  )) : !kpis?.visitasRecientes?.length ? (
                    <tr><td colSpan={8} style={{ padding: "40px", textAlign: "center", ...S.muted }}>No hay visitantes registrados aún.</td></tr>
                  ) : (
                    kpis.visitasRecientes.map((v: any, i: number) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--dash-border)", transition: "background 0.15s" }} className="hover:bg-white/2">
                        <td style={{ padding: "14px 16px", fontFamily: "monospace", ...S.text, fontWeight: 700, fontSize: "0.72rem" }}>
                          {v.fingerprint}...
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ ...S.text, fontSize: "0.75rem" }}>{v.location}</div>
                          <div style={{ ...S.muted, fontSize: "0.62rem", fontFamily: "monospace" }}>{v.ip}</div>
                        </td>
                        <td style={{ padding: "14px 16px", ...S.muted }}>
                          <span className="capitalize">{v.device}</span>
                          <div style={{ fontSize: "0.62rem" }}>{v.os} · {v.browser}</div>
                        </td>
                        <td style={{ padding: "14px 16px", ...S.text, fontWeight: 600 }}>
                          {v.duration > 60 ? `${Math.floor(v.duration / 60)}m ${v.duration % 60}s` : `${v.duration}s`}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          {v.isPwa ? <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">Sí</Badge>
                                   : <span style={{ ...S.muted, fontSize: "0.7rem" }}>No</span>}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          {v.isPush ? <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">Activo</Badge>
                                    : <span style={{ ...S.muted, fontSize: "0.7rem" }}>No</span>}
                        </td>
                        <td style={{ padding: "14px 16px", ...S.accent, fontWeight: 700, fontSize: "0.75rem" }}>
                          {v.associatedUser || <span className="opacity-40 text-gray-500 font-normal text-xs">Anónimo</span>}
                        </td>
                        <td style={{ padding: "14px 16px", ...S.muted, fontSize: "0.72rem" }}>
                          {new Date(v.lastActive).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
