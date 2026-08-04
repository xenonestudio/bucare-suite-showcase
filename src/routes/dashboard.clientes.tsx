import { createFileRoute } from "@tanstack/react-router";
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
  Building2,
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
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/dashboard/clientes")({
  component: DashboardClientes,
});

// ─── Types ───────────────────────────────────────────────────────────────────
interface Cliente {
  id: string;
  email: string;
  fullName?: string;
  phoneNumber?: string;
  birthDate?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface FormCliente {
  fullName: string;
  email: string;
  phoneNumber: string;
  birthDate: string;
  password: string;
}

const API_BASE = "https://bucaredemo.ddns.net/api/v1";
const ITEMS_PER_PAGE = 8;

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <Card className="bg-white border-border/60 shadow-2xs relative overflow-hidden group hover:shadow-md transition-all duration-200">
      <div className={`absolute top-0 left-0 w-1 h-full ${color}`} />
      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              {label}
            </p>
            <p className="text-2xl font-bold font-display text-foreground">
              {value}
            </p>
          </div>
          <div className={`p-2.5 rounded-lg ${color.replace("bg-", "bg-").replace("600", "100").replace("primary", "primary/10")} mt-0.5`}>
            <Icon className={`w-4 h-4 ${color.replace("bg-", "text-").replace("/60", "")}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function DashboardClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<"todos" | "activo" | "inactivo">("todos");
  const [pagina, setPagina] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>("SUPERADMIN");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed.role) setUserRole(parsed.role);
        } catch (e) {
          console.error("Error parsing stored user", e);
        }
      }
    }
  }, []);

  const [form, setForm] = useState<FormCliente>({
    fullName: "",
    email: "",
    phoneNumber: "",
    birthDate: "",
    password: "",
  });

  // ── Fetch ────────────────────────────────────────────────────────────────────
  const fetchClientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/users?role=CLIENTE`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      const json = await res.json();
      setClientes(json.data ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...form, role: "CLIENTE" }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message ?? "Error al registrar cliente");
      }
      await fetchClientes();
      setIsModalOpen(false);
      setForm({ fullName: "", email: "", phoneNumber: "", birthDate: "", password: "" });
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Suspend ──────────────────────────────────────────────────────────────────
  const handleSuspender = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE}/users/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: false }),
      });
      setClientes((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isActive: false } : c))
      );
    } catch {
      // silent fail — UI stays consistent
    }
  };

  // ── Filtering & Pagination ───────────────────────────────────────────────────
  const filtered = clientes.filter((c) => {
    const term = busqueda.toLowerCase();
    const matchSearch =
      (c.fullName ?? "").toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term) ||
      (c.phoneNumber ?? "").toLowerCase().includes(term);
    const matchEstado =
      filtroEstado === "todos"
        ? true
        : filtroEstado === "activo"
        ? c.isActive
        : !c.isActive;
    return matchSearch && matchEstado;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (pagina - 1) * ITEMS_PER_PAGE,
    pagina * ITEMS_PER_PAGE
  );

  const kpiTotal = clientes.length;
  const kpiActivos = clientes.filter((c) => c.isActive).length;
  const kpiInactivos = clientes.filter((c) => !c.isActive).length;

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
    }
    return (email ?? "?").substring(0, 2).toUpperCase();
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  if (!["SUPERADMIN", "ADMIN", "CONTADOR", "VENTAS"].includes(userRole)) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-xl font-bold text-primary font-display">Acceso Denegado</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          No tienes permisos para acceder al Directorio de Clientes. Si necesitas este acceso, por favor contacta al administrador del sistema.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12 animate-fade-in">
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-primary tracking-tight">
            Gestión de Clientes
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Directorio completo de clientes registrados en la plataforma.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchClientes}
            disabled={loading}
            className="text-xs h-9 bg-white border-border/60 hover:bg-muted/40 shadow-2xs"
          >
            <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-9 bg-white border-border/60 hover:bg-muted/40 shadow-2xs"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Exportar CSV
          </Button>

          {/* ── New Client Modal ──────────────────────────────────────────── */}
          {["SUPERADMIN", "ADMIN", "VENTAS"].includes(userRole) && (
            <Dialog open={isModalOpen} onOpenChange={(o) => { setIsModalOpen(o); setFormError(null); }}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-white hover:bg-primary/90 shadow-sm text-xs font-semibold h-9">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Registrar Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[460px] bg-white border-border/60">
              <DialogHeader>
                <DialogTitle className="text-primary font-display font-bold text-xl">
                  Registrar Nuevo Cliente
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm">
                  Completa los datos para crear el acceso del cliente en la plataforma.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  {formError && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      {formError}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 grid gap-1.5">
                      <Label className="text-xs font-semibold text-foreground">
                        Nombre Completo <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        required
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        placeholder="Ej. María García"
                        className="bg-muted/30 border-border/50 focus-visible:ring-primary text-sm"
                      />
                    </div>
                    <div className="col-span-2 grid gap-1.5">
                      <Label className="text-xs font-semibold text-foreground">
                        Correo Electrónico <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="correo@ejemplo.com"
                        className="bg-muted/30 border-border/50 focus-visible:ring-primary text-sm"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs font-semibold text-foreground">Teléfono <span className="text-destructive">*</span></Label>
                      <Input
                        required
                        value={form.phoneNumber}
                        onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                        placeholder="+58 412 1234567"
                        className="bg-muted/30 border-border/50 focus-visible:ring-primary text-sm"
                      />
                    </div>
                    <div className="grid gap-1.5">
                      <Label className="text-xs font-semibold text-foreground">
                        Fecha Nacimiento <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        required
                        type="date"
                        value={form.birthDate}
                        onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                        className="bg-muted/30 border-border/50 focus-visible:ring-primary text-sm"
                      />
                    </div>
                    <div className="col-span-2 grid gap-1.5">
                      <Label className="text-xs font-semibold text-foreground">
                        Contraseña temporal <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        required
                        type="password"
                        minLength={8}
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="Mínimo 8 caracteres"
                        className="bg-muted/30 border-border/50 focus-visible:ring-primary text-sm"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter className="gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="text-xs h-9"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-primary hover:bg-primary/90 text-white text-xs h-9 min-w-28"
                  >
                    {submitting ? (
                      <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Guardando...</>
                    ) : (
                      "Guardar Cliente"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          )}
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Total Clientes" value={kpiTotal} icon={Users} color="bg-primary" />
        <KpiCard label="Clientes Activos" value={kpiActivos} icon={UserCheck} color="bg-emerald-600" />
        <KpiCard label="Suspendidos" value={kpiInactivos} icon={UserX} color="bg-muted-foreground" />
      </div>

      {/* ── Table Card ──────────────────────────────────────────────────────── */}
      <Card className="bg-white border-border/60 shadow-2xs">
        <CardHeader className="pb-4 border-b border-border/30">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email o teléfono..."
                value={busqueda}
                onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
                className="pl-9 bg-muted/30 border-border/50 focus-visible:ring-primary text-sm h-9"
              />
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              {(["todos", "activo", "inactivo"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => { setFiltroEstado(f); setPagina(1); }}
                  className={`text-[11px] font-medium px-3 py-1.5 rounded-full border transition-all capitalize ${
                    filtroEstado === f
                      ? "bg-primary text-white border-primary"
                      : "bg-white border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {f === "todos" ? "Todos" : f === "activo" ? "Activos" : "Suspendidos"}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Cargando clientes...</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <AlertCircle className="w-8 h-8 text-destructive/70" />
              <p className="text-sm font-medium text-foreground">No se pudo cargar el directorio</p>
              <p className="text-xs text-muted-foreground">{error}</p>
              <Button size="sm" onClick={fetchClientes} className="mt-2 text-xs h-8 bg-primary text-white hover:bg-primary/90">
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Reintentar
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Users className="w-10 h-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-foreground">
                {busqueda ? "Sin resultados para tu búsqueda" : "Aún no hay clientes registrados"}
              </p>
              <p className="text-xs text-muted-foreground">
                {busqueda ? "Intenta con otro término" : "Usa el botón Registrar Cliente para agregar el primero"}
              </p>
            </div>
          )}

          {/* Table */}
          {!loading && !error && filtered.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-muted/20 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-6">Cliente</th>
                      <th className="py-3 px-6">Contacto</th>
                      <th className="py-3 px-6">Nacimiento</th>
                      <th className="py-3 px-6">Registro</th>
                      <th className="py-3 px-6">Estado</th>
                      <th className="py-3 px-6 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {paginated.map((cliente) => (
                      <tr
                        key={cliente.id}
                        className="hover:bg-muted/10 transition-colors group"
                      >
                        {/* Name + Avatar */}
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-primary/20 shrink-0">
                              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                {getInitials(cliente.fullName, cliente.email)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors leading-tight">
                                {cliente.fullName ?? "Sin nombre"}
                              </p>
                              <p className="text-[11px] text-muted-foreground mt-0.5">
                                ID: {cliente.id.substring(0, 8)}…
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-6">
                          <div className="flex flex-col gap-1">
                            <span className="flex items-center text-xs text-muted-foreground">
                              <Mail className="w-3 h-3 mr-1.5 shrink-0" />
                              {cliente.email}
                            </span>
                            {cliente.phoneNumber && (
                              <span className="flex items-center text-xs text-muted-foreground">
                                <Phone className="w-3 h-3 mr-1.5 shrink-0" />
                                {cliente.phoneNumber}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Birth Date */}
                        <td className="py-3.5 px-6">
                          <span className="flex items-center text-xs text-muted-foreground">
                            <CalendarDays className="w-3.5 h-3.5 mr-1.5 opacity-70 shrink-0" />
                            {cliente.birthDate ? formatDate(cliente.birthDate) : "—"}
                          </span>
                        </td>

                        {/* Registration Date */}
                        <td className="py-3.5 px-6">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(cliente.createdAt)}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-6">
                          <Badge
                            variant="outline"
                            className={
                              cliente.isActive
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold text-[11px]"
                                : "bg-muted/60 text-muted-foreground border-border text-[11px]"
                            }
                          >
                            {cliente.isActive ? "Activo" : "Suspendido"}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-6 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white border-border/60 w-40">
                              <DropdownMenuLabel className="text-[11px] text-muted-foreground">
                                Opciones
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-xs cursor-pointer gap-2">
                                <Eye className="w-3.5 h-3.5 text-primary" />
                                Ver Detalle
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-xs cursor-pointer gap-2">
                                <Pencil className="w-3.5 h-3.5 text-primary" />
                                Editar
                              </DropdownMenuItem>
                              {cliente.isActive && ["SUPERADMIN", "ADMIN"].includes(userRole) && (
                                <DropdownMenuItem
                                  className="text-xs cursor-pointer gap-2 text-destructive focus:text-destructive"
                                  onClick={() => handleSuspender(cliente.id)}
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                  Suspender
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

              {/* ── Pagination ──────────────────────────────────────────────── */}
              <div className="flex items-center justify-between px-6 py-3 border-t border-border/40 bg-muted/10">
                <p className="text-xs text-muted-foreground">
                  Mostrando{" "}
                  <span className="font-semibold text-foreground">
                    {(pagina - 1) * ITEMS_PER_PAGE + 1}–
                    {Math.min(pagina * ITEMS_PER_PAGE, filtered.length)}
                  </span>{" "}
                  de{" "}
                  <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
                  clientes
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 border-border/60"
                    onClick={() => setPagina((p) => Math.max(1, p - 1))}
                    disabled={pagina === 1}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - pagina) <= 1)
                    .map((p, idx, arr) => (
                      <>
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span key={`ellipsis-${p}`} className="text-xs text-muted-foreground px-1">…</span>
                        )}
                        <Button
                          key={p}
                          variant={p === pagina ? "default" : "outline"}
                          size="icon"
                          className={`h-7 w-7 text-xs ${p === pagina ? "bg-primary text-white border-primary" : "border-border/60"}`}
                          onClick={() => setPagina(p)}
                        >
                          {p}
                        </Button>
                      </>
                    ))}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7 border-border/60"
                    onClick={() => setPagina((p) => Math.min(totalPages, p + 1))}
                    disabled={pagina === totalPages}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
