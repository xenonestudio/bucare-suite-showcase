import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  MoreVertical,
  Mail,
  Phone,
  CalendarDays,
  Filter,
  Download,
  Users,
  UserCheck,
  UserX,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Ban,
  CheckCircle2,
  ShieldCheck,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/dashboard/clientes")({
  component: DashboardUsuarios,
});

// ─── Types ────────────────────────────────────────────────────────────────────
interface Usuario {
  id: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  birthDate?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

type RoleFilter = "TODOS" | "CLIENTE" | "ADMIN" | "SUPERADMIN" | "VENTAS" | "CONTADOR" | "PROYECTO";
type StatusFilter = "todos" | "activo" | "inactivo";

interface EditForm {
  fullName: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
}

interface CreateForm {
  fullName: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  password: string;
}

import { getApiUrl } from "@/lib/api";

const ITEMS_PER_PAGE = 10;

// ─── Role Badge ───────────────────────────────────────────────────────────────
const ROLE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  SUPERADMIN: { bg: "rgba(225,182,104,0.15)", text: "#E1B668", border: "rgba(225,182,104,0.3)" },
  ADMIN:      { bg: "rgba(99,179,237,0.12)",  text: "#63B3ED", border: "rgba(99,179,237,0.3)"  },
  VENTAS:     { bg: "rgba(104,211,145,0.12)", text: "#68D391", border: "rgba(104,211,145,0.3)" },
  CONTADOR:   { bg: "rgba(183,148,246,0.12)", text: "#B794F6", border: "rgba(183,148,246,0.3)" },
  PROYECTO:   { bg: "rgba(246,173,85,0.12)",  text: "#F6AD55", border: "rgba(246,173,85,0.3)"  },
  CLIENTE:    { bg: "rgba(255,255,255,0.06)", text: "var(--dash-muted)", border: "rgba(255,255,255,0.1)" },
};

function RoleBadge({ role }: { role: string }) {
  const style = ROLE_STYLES[role] ?? ROLE_STYLES.CLIENTE;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 9px",
        borderRadius: "99px",
        fontSize: "0.6rem",
        fontWeight: 700,
        letterSpacing: "0.07em",
        background: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
      }}
    >
      {role}
    </span>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, icon: Icon, accent,
}: {
  label: string; value: number | string; icon: React.ElementType; accent: string;
}) {
  return (
    <div
      style={{
        background: "var(--dash-card)",
        border: "1px solid var(--dash-border)",
        borderRadius: "16px",
        padding: "20px 22px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: "42px", height: "42px", borderRadius: "12px",
          background: `${accent}18`,
          border: `1px solid ${accent}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={18} style={{ color: accent }} />
      </div>
      <div>
        <p style={{ fontSize: "0.65rem", fontWeight: 600, color: "var(--dash-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {label}
        </p>
        <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--dash-text)", lineHeight: 1.1, fontFamily: "var(--font-display)" }}>
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr>
      {[1,2,3,4,5,6].map(i => (
        <td key={i} style={{ padding: "14px 16px" }}>
          <div style={{
            height: i === 1 ? "36px" : "14px",
            width: i === 1 ? "160px" : "80px",
            borderRadius: "8px",
            background: "rgba(255,255,255,0.05)",
            animation: "pulse 1.5s ease-in-out infinite",
          }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function DashboardUsuarios() {
  const router = useRouter();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<StatusFilter>("todos");
  const [filtroRol, setFiltroRol] = useState<RoleFilter>("TODOS");
  const [pagina, setPagina] = useState(1);
  const [userRole, setUserRole] = useState<string>("SUPERADMIN");

  // Modales
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState<CreateForm>({
    fullName: "", email: "", phoneNumber: "", birthDate: "", password: "",
  });
  const [editForm, setEditForm] = useState<EditForm>({
    fullName: "", phoneNumber: "", role: "CLIENTE", isActive: true,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.role) setUserRole(parsed.role);
        } catch {}
      }
    }
  }, []);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(getApiUrl("/api/v1/users"), {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (!res.ok) {
        if (res.status === 401) return; // handled globally
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      const json = await res.json();
      setUsuarios(json.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsuarios(); }, [fetchUsuarios]);

  // ── Create ────────────────────────────────────────────────────────────────
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(getApiUrl("/api/v1/users"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...createForm, role: "CLIENTE" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? json.error?.message ?? "Error al registrar");
      await fetchUsuarios();
      setShowCreate(false);
      setCreateForm({ fullName: "", email: "", phoneNumber: "", birthDate: "", password: "" });
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit ──────────────────────────────────────────────────────────────────
  const openEdit = (u: Usuario) => {
    setSelectedUser(u);
    setEditForm({ fullName: u.fullName ?? "", phoneNumber: u.phoneNumber ?? "", role: u.role, isActive: u.isActive });
    setFormError(null);
    setShowEdit(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);
    setFormError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(getApiUrl(`/api/v1/users/${selectedUser.id}`), {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? json.error?.message ?? "Error al actualizar");
      setUsuarios(prev => prev.map(u => u.id === selectedUser.id ? { ...u, ...editForm } : u));
      setShowEdit(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Suspend / Reactivate ──────────────────────────────────────────────────
  const handleToggleActive = async (id: string, newActive: boolean) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(getApiUrl(`/api/v1/users/${id}`), {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newActive }),
      });
      if (res.ok) {
        setUsuarios(prev => prev.map(u => u.id === id ? { ...u, isActive: newActive } : u));
      }
    } catch {}
  };

  // ── Export CSV ────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const headers = ["ID", "Nombre", "Email", "Teléfono", "Rol", "Estado", "Fecha Nacimiento", "Fecha Registro"];
    const rows = filtered.map(u => [
      u.id,
      u.fullName ?? "",
      u.email,
      u.phoneNumber ?? "",
      u.role,
      u.isActive ? "Activo" : "Suspendido",
      u.birthDate ? formatDate(u.birthDate) : "",
      formatDate(u.createdAt),
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `usuarios_bucare_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Filtering & Pagination ────────────────────────────────────────────────
  const filtered = usuarios.filter(u => {
    const term = busqueda.toLowerCase();
    const matchSearch =
      (u.fullName ?? "").toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.phoneNumber ?? "").toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term);
    const matchEstado =
      filtroEstado === "todos" ? true :
      filtroEstado === "activo" ? u.isActive : !u.isActive;
    const matchRol = filtroRol === "TODOS" ? true : u.role === filtroRol;
    return matchSearch && matchEstado && matchRol;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((pagina - 1) * ITEMS_PER_PAGE, pagina * ITEMS_PER_PAGE);

  const kpiTotal   = usuarios.length;
  const kpiActivos = usuarios.filter(u => u.isActive).length;
  const kpiInact   = usuarios.filter(u => !u.isActive).length;

  const getInitials = (name?: string, email?: string) => {
    if (name) return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
    return (email ?? "?").substring(0, 2).toUpperCase();
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
    } catch { return iso; }
  };

  // ── Access Guard ──────────────────────────────────────────────────────────
  if (!["SUPERADMIN", "ADMIN", "CONTADOR", "VENTAS"].includes(userRole)) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 16px", textAlign: "center" }}>
        <AlertCircle size={56} style={{ color: "#e05555", marginBottom: "16px" }} />
        <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--dash-text)" }}>Acceso Denegado</h2>
        <p style={{ fontSize: "0.82rem", color: "var(--dash-muted)", marginTop: "8px", maxWidth: "380px" }}>
          No tienes permisos para acceder al Directorio de Usuarios.
        </p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  const canManage = ["SUPERADMIN", "ADMIN"].includes(userRole);
  const canCreate = ["SUPERADMIN", "ADMIN", "VENTAS"].includes(userRole);

  const ROLE_FILTERS: RoleFilter[] = ["TODOS", "CLIENTE", "ADMIN", "VENTAS", "CONTADOR", "PROYECTO", "SUPERADMIN"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", paddingBottom: "48px", animation: "fadeIn 0.3s ease" }}>
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px", borderBottom: "1px solid var(--dash-border)", paddingBottom: "20px" }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--dash-text)", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>
            Usuarios
          </h1>
          <p style={{ fontSize: "0.78rem", color: "var(--dash-muted)", marginTop: "4px" }}>
            Directorio completo de usuarios registrados en la plataforma.
          </p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
          <button
            onClick={fetchUsuarios}
            disabled={loading}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "7px 14px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: 600,
              background: "var(--dash-card)", border: "1px solid var(--dash-border)",
              color: "var(--dash-text)", cursor: "pointer",
            }}
          >
            <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
            Actualizar
          </button>
          <button
            onClick={handleExportCSV}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "7px 14px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: 600,
              background: "var(--dash-card)", border: "1px solid var(--dash-border)",
              color: "var(--dash-text)", cursor: "pointer",
            }}
          >
            <Download size={13} />
            Exportar CSV
          </button>
          {canCreate && (
            <button
              onClick={() => { setFormError(null); setShowCreate(true); }}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "7px 16px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: 700,
                background: "var(--dash-accent)", color: "#0D1810", border: "none", cursor: "pointer",
              }}
            >
              <Plus size={14} />
              Registrar Cliente
            </button>
          )}
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <KpiCard label="Total Usuarios" value={kpiTotal}   icon={Users}      accent="#E1B668" />
        <KpiCard label="Activos"        value={kpiActivos} icon={UserCheck}  accent="#68D391" />
        <KpiCard label="Suspendidos"    value={kpiInact}   icon={UserX}      accent="#FC8181" />
      </div>

      {/* ── Table Card ──────────────────────────────────────────────────────── */}
      <div style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", borderRadius: "16px", overflow: "hidden" }}>
        {/* Filters */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--dash-border)", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "1", minWidth: "200px", maxWidth: "320px" }}>
            <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--dash-muted)" }} />
            <input
              placeholder="Buscar por nombre, email, teléfono, rol..."
              value={busqueda}
              onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
              style={{
                width: "100%", paddingLeft: "34px", paddingRight: "12px", paddingTop: "8px", paddingBottom: "8px",
                borderRadius: "10px", fontSize: "0.78rem",
                background: "rgba(255,255,255,0.04)", border: "1px solid var(--dash-border)",
                color: "var(--dash-text)", outline: "none",
              }}
            />
          </div>

          {/* Status filter */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {(["todos", "activo", "inactivo"] as StatusFilter[]).map(f => (
              <button
                key={f}
                onClick={() => { setFiltroEstado(f); setPagina(1); }}
                style={{
                  padding: "5px 12px", borderRadius: "99px", fontSize: "0.7rem", fontWeight: 600, cursor: "pointer",
                  background: filtroEstado === f ? "var(--dash-accent)" : "transparent",
                  color: filtroEstado === f ? "#0D1810" : "var(--dash-muted)",
                  border: filtroEstado === f ? "1px solid transparent" : "1px solid var(--dash-border)",
                }}
              >
                {f === "todos" ? "Todos" : f === "activo" ? "Activos" : "Suspendidos"}
              </button>
            ))}
          </div>

          {/* Role filter */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {ROLE_FILTERS.map(r => (
              <button
                key={r}
                onClick={() => { setFiltroRol(r); setPagina(1); }}
                style={{
                  padding: "5px 10px", borderRadius: "99px", fontSize: "0.65rem", fontWeight: 700, cursor: "pointer",
                  letterSpacing: "0.05em",
                  background: filtroRol === r ? "rgba(225,182,104,0.18)" : "transparent",
                  color: filtroRol === r ? "#E1B668" : "var(--dash-muted)",
                  border: filtroRol === r ? "1px solid rgba(225,182,104,0.35)" : "1px solid var(--dash-border)",
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                {["Usuario","Contacto","Rol","Nacimiento","Registro","Estado",""].map(h => (
                  <th key={h} style={{ padding: "10px 16px", fontSize: "0.62rem", fontWeight: 700, color: "var(--dash-muted)", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: h ? "left" : "right" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1,2,3,4,5].map(i => <SkeletonRow key={i} />)}
            </tbody>
          </table>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "48px 16px", textAlign: "center" }}>
            <AlertCircle size={36} style={{ color: "#e05555" }} />
            <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--dash-text)" }}>No se pudo cargar el directorio</p>
            <p style={{ fontSize: "0.75rem", color: "var(--dash-muted)" }}>{error}</p>
            <button onClick={fetchUsuarios} style={{ padding: "8px 20px", borderRadius: "10px", background: "#e05555", color: "#fff", border: "none", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <RefreshCw size={13} /> Reintentar
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", padding: "64px 16px", textAlign: "center" }}>
            <Users size={40} style={{ color: "var(--dash-muted)", opacity: 0.4 }} />
            <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--dash-text)" }}>
              {busqueda ? "Sin resultados para tu búsqueda" : "Aún no hay usuarios registrados"}
            </p>
            <p style={{ fontSize: "0.75rem", color: "var(--dash-muted)" }}>
              {busqueda ? "Intenta con otro término o cambia los filtros" : "Usa el botón Registrar Cliente para agregar el primero"}
            </p>
          </div>
        )}

        {/* Table */}
        {!loading && !error && filtered.length > 0 && (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                    {["Usuario","Contacto","Rol","Nacimiento","Registro","Estado","Acciones"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", fontSize: "0.62rem", fontWeight: 700, color: "var(--dash-muted)", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: h === "Acciones" ? "right" : "left", whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(u => (
                    <tr
                      key={u.id}
                      style={{ borderTop: "1px solid var(--dash-border)", transition: "background 0.15s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.025)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      {/* Avatar + Name */}
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{
                            width: "36px", height: "36px", borderRadius: "50%",
                            background: "var(--dash-accent-dim)",
                            border: "1px solid var(--dash-border-hover)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "0.7rem", fontWeight: 800, color: "var(--dash-accent)",
                            flexShrink: 0,
                          }}>
                            {getInitials(u.fullName, u.email)}
                          </div>
                          <div>
                            <p style={{ fontWeight: 600, color: "var(--dash-text)", fontSize: "0.8rem" }}>{u.fullName ?? "Sin nombre"}</p>
                            <p style={{ fontSize: "0.65rem", color: "var(--dash-muted)", marginTop: "2px" }}>
                              ID: {u.id.substring(0, 8)}…
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.73rem", color: "var(--dash-muted)" }}>
                            <Mail size={11} /> {u.email}
                          </span>
                          {u.phoneNumber && (
                            <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.73rem", color: "var(--dash-muted)" }}>
                              <Phone size={11} /> {u.phoneNumber}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Role */}
                      <td style={{ padding: "12px 16px" }}>
                        <RoleBadge role={u.role} />
                      </td>

                      {/* Birth Date */}
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.73rem", color: "var(--dash-muted)" }}>
                          <CalendarDays size={11} />
                          {u.birthDate ? formatDate(u.birthDate) : "—"}
                        </span>
                      </td>

                      {/* Created At */}
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ fontSize: "0.73rem", color: "var(--dash-muted)" }}>
                          {formatDate(u.createdAt)}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "5px",
                          padding: "3px 10px", borderRadius: "99px", fontSize: "0.65rem", fontWeight: 700,
                          background: u.isActive ? "rgba(104,211,145,0.12)" : "rgba(255,255,255,0.05)",
                          color: u.isActive ? "#68D391" : "var(--dash-muted)",
                          border: `1px solid ${u.isActive ? "rgba(104,211,145,0.25)" : "rgba(255,255,255,0.08)"}`,
                        }}>
                          {u.isActive ? <CheckCircle2 size={10} /> : <X size={10} />}
                          {u.isActive ? "Activo" : "Suspendido"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button style={{ padding: "6px", borderRadius: "8px", background: "transparent", border: "1px solid var(--dash-border)", cursor: "pointer", color: "var(--dash-muted)", display: "inline-flex", alignItems: "center" }}>
                              <MoreVertical size={14} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" style={{ background: "var(--dash-sidebar)", border: "1px solid var(--dash-border)", color: "var(--dash-text)", minWidth: "160px" }}>
                            <DropdownMenuLabel style={{ fontSize: "0.65rem", color: "var(--dash-muted)" }}>Opciones</DropdownMenuLabel>
                            <DropdownMenuSeparator style={{ background: "var(--dash-border)" }} />
                            <DropdownMenuItem
                              onClick={() => { setSelectedUser(u); setShowDetail(true); }}
                              style={{ fontSize: "0.78rem", cursor: "pointer", gap: "8px", color: "var(--dash-text)" }}
                            >
                              <Eye size={13} style={{ color: "var(--dash-accent)" }} /> Ver Detalle
                            </DropdownMenuItem>
                            {canManage && (
                              <DropdownMenuItem
                                onClick={() => openEdit(u)}
                                style={{ fontSize: "0.78rem", cursor: "pointer", gap: "8px", color: "var(--dash-text)" }}
                              >
                                <Pencil size={13} style={{ color: "var(--dash-accent)" }} /> Editar
                              </DropdownMenuItem>
                            )}
                            {canManage && u.isActive && (
                              <DropdownMenuItem
                                onClick={() => handleToggleActive(u.id, false)}
                                style={{ fontSize: "0.78rem", cursor: "pointer", gap: "8px", color: "#FC8181" }}
                              >
                                <Ban size={13} /> Suspender
                              </DropdownMenuItem>
                            )}
                            {canManage && !u.isActive && (
                              <DropdownMenuItem
                                onClick={() => handleToggleActive(u.id, true)}
                                style={{ fontSize: "0.78rem", cursor: "pointer", gap: "8px", color: "#68D391" }}
                              >
                                <CheckCircle2 size={13} /> Reactivar
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderTop: "1px solid var(--dash-border)", background: "rgba(255,255,255,0.01)" }}>
              <p style={{ fontSize: "0.72rem", color: "var(--dash-muted)" }}>
                Mostrando <strong style={{ color: "var(--dash-text)" }}>{(pagina - 1) * ITEMS_PER_PAGE + 1}–{Math.min(pagina * ITEMS_PER_PAGE, filtered.length)}</strong> de <strong style={{ color: "var(--dash-text)" }}>{filtered.length}</strong> usuarios
              </p>
              <div style={{ display: "flex", gap: "4px" }}>
                <button
                  onClick={() => setPagina(p => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                  style={{ width: "28px", height: "28px", borderRadius: "8px", background: "var(--dash-card)", border: "1px solid var(--dash-border)", color: "var(--dash-text)", cursor: pagina === 1 ? "not-allowed" : "pointer", opacity: pagina === 1 ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <ChevronLeft size={13} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - pagina) <= 1)
                  .map((p, idx, arr) => (
                    <span key={p}>
                      {idx > 0 && arr[idx-1] !== p - 1 && (
                        <span style={{ fontSize: "0.7rem", color: "var(--dash-muted)", padding: "0 4px", display: "inline-flex", alignItems: "center" }}>…</span>
                      )}
                      <button
                        onClick={() => setPagina(p)}
                        style={{
                          width: "28px", height: "28px", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 700,
                          background: p === pagina ? "var(--dash-accent)" : "var(--dash-card)",
                          color: p === pagina ? "#0D1810" : "var(--dash-text)",
                          border: `1px solid ${p === pagina ? "transparent" : "var(--dash-border)"}`,
                          cursor: "pointer",
                        }}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
                <button
                  onClick={() => setPagina(p => Math.min(totalPages, p + 1))}
                  disabled={pagina === totalPages}
                  style={{ width: "28px", height: "28px", borderRadius: "8px", background: "var(--dash-card)", border: "1px solid var(--dash-border)", color: "var(--dash-text)", cursor: pagina === totalPages ? "not-allowed" : "pointer", opacity: pagina === totalPages ? 0.4 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Modal: Crear Usuario ────────────────────────────────────────────── */}
      <Dialog open={showCreate} onOpenChange={o => { setShowCreate(o); setFormError(null); }}>
        <DialogContent className="sm:max-w-[460px]" style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "var(--dash-text)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Plus size={18} style={{ color: "var(--dash-accent)" }} /> Registrar Nuevo Cliente
            </DialogTitle>
            <DialogDescription style={{ color: "var(--dash-muted)" }}>
              Completa los datos para crear el acceso del cliente en la plataforma.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate}>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "8px 0" }}>
              {formError && (
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", padding: "10px 12px", borderRadius: "10px", background: "rgba(224,85,85,0.08)", border: "1px solid rgba(224,85,85,0.2)", color: "#FC8181", fontSize: "0.75rem" }}>
                  <AlertCircle size={14} style={{ flexShrink: 0, marginTop: "1px" }} /> {formError}
                </div>
              )}
              <FormField label="Nombre Completo *">
                <input required value={createForm.fullName} onChange={e => setCreateForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Ej. María García" style={inputStyle} />
              </FormField>
              <FormField label="Correo Electrónico *">
                <input required type="email" value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} placeholder="correo@ejemplo.com" style={inputStyle} />
              </FormField>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <FormField label="Teléfono *">
                  <input required value={createForm.phoneNumber} onChange={e => setCreateForm(f => ({ ...f, phoneNumber: e.target.value }))} placeholder="+58 412 1234567" style={inputStyle} />
                </FormField>
                <FormField label="Fecha Nacimiento *">
                  <input required type="date" value={createForm.birthDate} onChange={e => setCreateForm(f => ({ ...f, birthDate: e.target.value }))} style={inputStyle} />
                </FormField>
              </div>
              <FormField label="Contraseña temporal *">
                <input required type="password" minLength={8} value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} placeholder="Mínimo 8 caracteres" style={inputStyle} />
              </FormField>
            </div>
            <DialogFooter style={{ paddingTop: "16px", borderTop: "1px solid var(--dash-border)", gap: "8px" }}>
              <button type="button" onClick={() => setShowCreate(false)} style={{ ...btnGhost }}>Cancelar</button>
              <button type="submit" disabled={submitting} style={{ ...btnAccent }}>
                {submitting ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Guardando…</> : "Guardar Cliente"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Editar Usuario ───────────────────────────────────────────── */}
      <Dialog open={showEdit} onOpenChange={o => { setShowEdit(o); setFormError(null); }}>
        <DialogContent className="sm:max-w-[420px]" style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "var(--dash-text)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Pencil size={16} style={{ color: "var(--dash-accent)" }} /> Editar Usuario
            </DialogTitle>
            <DialogDescription style={{ color: "var(--dash-muted)", fontSize: "0.75rem" }}>
              {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit}>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px", padding: "8px 0" }}>
              {formError && (
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-start", padding: "10px 12px", borderRadius: "10px", background: "rgba(224,85,85,0.08)", border: "1px solid rgba(224,85,85,0.2)", color: "#FC8181", fontSize: "0.75rem" }}>
                  <AlertCircle size={14} style={{ flexShrink: 0, marginTop: "1px" }} /> {formError}
                </div>
              )}
              <FormField label="Nombre Completo">
                <input value={editForm.fullName} onChange={e => setEditForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Nombre completo" style={inputStyle} />
              </FormField>
              <FormField label="Teléfono">
                <input value={editForm.phoneNumber} onChange={e => setEditForm(f => ({ ...f, phoneNumber: e.target.value }))} placeholder="+58 412 1234567" style={inputStyle} />
              </FormField>
              {userRole === "SUPERADMIN" && (
                <FormField label="Rol">
                  <select value={editForm.role} onChange={e => setEditForm(f => ({ ...f, role: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
                    {["CLIENTE","VENTAS","CONTADOR","PROYECTO","ADMIN","SUPERADMIN"].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </FormField>
              )}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--dash-border)" }}>
                <div>
                  <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--dash-text)" }}>Estado de cuenta</p>
                  <p style={{ fontSize: "0.65rem", color: "var(--dash-muted)", marginTop: "2px" }}>Suspender deshabilitará el acceso del usuario</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditForm(f => ({ ...f, isActive: !f.isActive }))}
                  style={{
                    width: "42px", height: "24px", borderRadius: "99px", border: "none", cursor: "pointer",
                    background: editForm.isActive ? "var(--dash-accent)" : "rgba(255,255,255,0.1)",
                    position: "relative", transition: "background 0.2s",
                  }}
                >
                  <span style={{
                    position: "absolute", top: "3px",
                    left: editForm.isActive ? "21px" : "3px",
                    width: "18px", height: "18px", borderRadius: "50%",
                    background: editForm.isActive ? "#0D1810" : "var(--dash-muted)",
                    transition: "left 0.2s",
                  }} />
                </button>
              </div>
            </div>
            <DialogFooter style={{ paddingTop: "16px", borderTop: "1px solid var(--dash-border)", gap: "8px" }}>
              <button type="button" onClick={() => setShowEdit(false)} style={{ ...btnGhost }}>Cancelar</button>
              <button type="submit" disabled={submitting} style={{ ...btnAccent }}>
                {submitting ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Guardando…</> : "Guardar Cambios"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Ver Detalle ──────────────────────────────────────────────── */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="sm:max-w-[420px]" style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "var(--dash-text)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Eye size={16} style={{ color: "var(--dash-accent)" }} /> Detalle de Usuario
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {/* Avatar */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", padding: "20px 0 24px" }}>
                <div style={{
                  width: "64px", height: "64px", borderRadius: "50%",
                  background: "var(--dash-accent-dim)", border: "2px solid var(--dash-border-hover)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.4rem", fontWeight: 800, color: "var(--dash-accent)",
                }}>
                  {getInitials(selectedUser.fullName, selectedUser.email)}
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontWeight: 700, fontSize: "1rem", color: "var(--dash-text)" }}>{selectedUser.fullName ?? "Sin nombre"}</p>
                  <p style={{ fontSize: "0.75rem", color: "var(--dash-muted)", marginTop: "2px" }}>{selectedUser.email}</p>
                  <div style={{ marginTop: "8px", display: "flex", gap: "8px", justifyContent: "center" }}>
                    <RoleBadge role={selectedUser.role} />
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: "4px",
                      padding: "2px 9px", borderRadius: "99px", fontSize: "0.6rem", fontWeight: 700,
                      background: selectedUser.isActive ? "rgba(104,211,145,0.12)" : "rgba(255,255,255,0.05)",
                      color: selectedUser.isActive ? "#68D391" : "var(--dash-muted)",
                      border: `1px solid ${selectedUser.isActive ? "rgba(104,211,145,0.25)" : "rgba(255,255,255,0.08)"}`,
                    }}>
                      {selectedUser.isActive ? <CheckCircle2 size={9} /> : <X size={9} />}
                      {selectedUser.isActive ? "Activo" : "Suspendido"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detail rows */}
              <div style={{ borderTop: "1px solid var(--dash-border)" }}>
                {[
                  { icon: ShieldCheck,   label: "ID",             value: selectedUser.id },
                  { icon: Mail,          label: "Correo",         value: selectedUser.email },
                  { icon: Phone,         label: "Teléfono",       value: selectedUser.phoneNumber ?? "—" },
                  { icon: CalendarDays,  label: "Nacimiento",     value: selectedUser.birthDate ? formatDate(selectedUser.birthDate) : "—" },
                  { icon: CalendarDays,  label: "Registro",       value: formatDate(selectedUser.createdAt) },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 4px", borderBottom: "1px solid var(--dash-border)" }}>
                    <Icon size={14} style={{ color: "var(--dash-accent)", flexShrink: 0 }} />
                    <span style={{ fontSize: "0.7rem", color: "var(--dash-muted)", width: "80px", flexShrink: 0 }}>{label}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--dash-text)", wordBreak: "break-all" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <button onClick={() => setShowDetail(false)} style={{ ...btnGhost }}>Cerrar</button>
            {canManage && selectedUser && (
              <button onClick={() => { setShowDetail(false); openEdit(selectedUser); }} style={{ ...btnAccent }}>
                <Pencil size={13} /> Editar
              </button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <label style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--dash-muted)", letterSpacing: "0.04em" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  borderRadius: "10px",
  fontSize: "0.8rem",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid var(--dash-border)",
  color: "var(--dash-text)",
  outline: "none",
  boxSizing: "border-box",
};

const btnAccent: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: "6px",
  padding: "8px 18px", borderRadius: "10px", fontSize: "0.78rem", fontWeight: 700,
  background: "var(--dash-accent)", color: "#0D1810", border: "none", cursor: "pointer",
};

const btnGhost: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: "6px",
  padding: "8px 16px", borderRadius: "10px", fontSize: "0.78rem", fontWeight: 600,
  background: "transparent", color: "var(--dash-muted)", border: "1px solid var(--dash-border)", cursor: "pointer",
};
