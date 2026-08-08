import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  Shield,
  ShieldCheck,
  UserCheck,
  Users,
  Loader2,
  AlertCircle,
  RefreshCw,
  Pencil,
  Ban,
  CheckCircle2,
  Phone,
  Check,
  Filter,
  SlidersHorizontal,
  Building2,
  Bot,
  Mail,
  Save,
  Globe,
  Trash2,
  Images,
  ArrowLeft,
  ArrowRight,
  LayoutDashboard,
  Share2,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { VideoUploader } from "@/components/ui/VideoUploader";

export const Route = createFileRoute("/dashboard/configuracion")({

  beforeLoad: () => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");
      if (!token) throw redirect({ to: "/login" });
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          if (!["SUPERADMIN", "ADMIN"].includes(user.role)) {
            throw redirect({ to: "/dashboard" });
          }
        } catch {
          throw redirect({ to: "/dashboard" });
        }
      }
    }
  },
  component: DashboardConfiguracion,
});

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface UserItem {
  id: string;
  email: string;
  fullName: string | null;
  phoneNumber: string | null;
  birthDate: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const ROLES_INFO: Record<string, { label: string; color: string; bg: string; desc: string }> = {
  SUPERADMIN: {
    label: "Super Admin",
    color: "#a855f7",
    bg: "rgba(168,85,247,0.12)",
    desc: "Acceso total al sistema, configuraciones globales y gestión de usuarios.",
  },
  ADMIN: {
    label: "Administrador",
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    desc: "Gestión de proyectos, usuarios, clientes y reportes operativos.",
  },
  CONTADOR: {
    label: "Contabilidad",
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    desc: "Acceso a reportes financieros, estados de cuenta y facturación.",
  },
  VENTAS: {
    label: "Ventas",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    desc: "Gestión de clientes, citas y ventas de propiedades.",
  },
  PROYECTO: {
    label: "Proyecto / Obra",
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.12)",
    desc: "Monitoreo de avances de construcción y especificaciones de la obra.",
  },
  CLIENTE: {
    label: "Cliente",
    color: "#64748b",
    bg: "rgba(100,116,139,0.12)",
    desc: "Acceso como comprador para consultar citas y estado de su inmueble.",
  },
};

const PERMISSIONS_MATRIX = [
  { feature: "Acceso a Dashboard General", roles: ["SUPERADMIN", "ADMIN", "CONTADOR", "VENTAS", "PROYECTO", "CLIENTE"] },
  { feature: "Gestión de Citas", roles: ["SUPERADMIN", "ADMIN", "VENTAS", "CLIENTE"] },
  { feature: "Gestión de Clientes", roles: ["SUPERADMIN", "ADMIN", "CONTADOR", "VENTAS"] },
  { feature: "Asistente IA (Chat Bot)", roles: ["SUPERADMIN", "ADMIN"] },
  { feature: "Reportes Financieros", roles: ["SUPERADMIN", "CONTADOR"] },
  { feature: "Configuración de Sistema & Usuarios", roles: ["SUPERADMIN", "ADMIN"] },
];

function getInitials(nameOrEmail: string | null): string {
  if (!nameOrEmail) return "U";
  const parts = nameOrEmail.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return nameOrEmail.substring(0, 2).toUpperCase();
}

import { useSiteContent, DEFAULT_SITE_CONTENT, SiteContentData } from "@/hooks/useSiteContent";

export function DashboardConfiguracion() {
  const { user: currentUser } = useAuth();
  const { content: fetchedContent, refetch: refetchContent } = useSiteContent();
  const [siteForm, setSiteForm] = useState<SiteContentData>(DEFAULT_SITE_CONTENT);
  const [savingPortal, setSavingPortal] = useState(false);
  const [portalSuccess, setPortalSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (fetchedContent) {
      setSiteForm(fetchedContent);
      if (fetchedContent.contacto) {
        setProjectSettings((prev) => ({
          ...prev,
          contactEmail: fetchedContent.contacto.email || prev.contactEmail,
          contactPhone: fetchedContent.contacto.phone || prev.contactPhone,
        }));
      }
      if (fetchedContent.settings?.aiEnabled !== undefined) {
        setProjectSettings((prev) => ({
          ...prev,
          aiEnabled: fetchedContent.settings!.aiEnabled,
        }));
      }
    }
  }, [fetchedContent]);


  const saveSectionData = async (section: keyof SiteContentData, dataToSave: any) => {
    try {
      const token = localStorage.getItem("token");
      await fetch("/api/v1/site-content", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          section,
          data: dataToSave,
        }),
      });
      refetchContent();
    } catch (e) {
      console.error("Auto-save error:", e);
    }
  };

  const handleSavePortalSection = async (section: keyof SiteContentData) => {
    setSavingPortal(true);
    setPortalSuccess(null);
    try {
      await saveSectionData(section, siteForm[section]);
      setPortalSuccess(`¡Sección de ${section.toUpperCase().replace("_", " ")} guardada correctamente!`);
      setTimeout(() => setPortalSuccess(null), 4000);
    } catch (e: any) {
      alert("Error de conexión: " + e.message);
    } finally {
      setSavingPortal(false);
    }
  };


  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configuraciones Generales del Proyecto
  const [projectSettings, setProjectSettings] = useState({
    projectName: "Bucare Suite & Plaza",
    contactEmail: "contacto@bucare.com",
    contactPhone: "+58 414 1234567",
    currency: "USD ($)",
    projectStatus: "Ventas Abiertas",
    aiModel: "gemini-2.0-flash",
    aiEnabled: true,
    notificationEmail: "alertas@bucare.com",
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Filtros de Usuarios
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("TODOS");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("TODOS");


  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  // Formulario Nuevo Usuario
  const [createForm, setCreateForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    birthDate: "",
    password: "",
    role: "VENTAS",
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Formulario Edición de Usuario
  const [editRole, setEditRole] = useState("CLIENTE");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editLoading, setEditLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/v1/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Error al obtener el listado de usuarios.");
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setUsers(data.data);
      } else {
        throw new Error("Respuesta inválida del servidor.");
      }
    } catch (err: any) {
      setError(err.message || "No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Manejador Guardar Configuración General
  const handleSaveGeneralSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);

    try {
      await saveSectionData("settings" as any, { aiEnabled: projectSettings.aiEnabled });
      await saveSectionData("contacto" as any, siteForm.contacto);
      setSavingSettings(false);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 4000);
    } catch (err) {
      setSavingSettings(false);
    }
  };


  // Manejadores de Usuarios
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/v1/users", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "No se pudo registrar el usuario.");
      }

      setIsCreateOpen(false);
      setCreateForm({
        fullName: "",
        email: "",
        phoneNumber: "",
        birthDate: "",
        password: "",
        role: "VENTAS",
      });
      fetchUsers();
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const openEditModal = (user: UserItem) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setEditIsActive(user.isActive);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setEditLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/v1/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: editRole,
          isActive: editIsActive,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Error al actualizar usuario.");
      }

      setIsEditOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || "Error al actualizar.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleToggleStatus = async (user: UserItem) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/v1/users/${user.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !user.isActive,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtrado de usuarios
  const filteredUsers = users.filter((u) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (u.fullName || "").toLowerCase().includes(searchLower) ||
      (u.email || "").toLowerCase().includes(searchLower) ||
      (u.phoneNumber || "").includes(searchTerm);

    const matchesRole = selectedRoleFilter === "TODOS" || u.role === selectedRoleFilter;
    const matchesStatus =
      selectedStatusFilter === "TODOS" ||
      (selectedStatusFilter === "ACTIVOS" && u.isActive) ||
      (selectedStatusFilter === "INACTIVOS" && !u.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Métricas
  const totalUsers = users.length;
  const activeUsersCount = users.filter((u) => u.isActive).length;
  const adminUsersCount = users.filter((u) => ["SUPERADMIN", "ADMIN"].includes(u.role)).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header de la sección */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: "var(--dash-text)", fontFamily: "var(--font-display)" }}
            >
              Configuración & Roles
            </h1>
            <Badge
              variant="outline"
              className="gap-1.5 text-xs font-semibold"
              style={{
                background: "var(--dash-accent-dim)",
                color: "var(--dash-accent)",
                borderColor: "var(--dash-border-hover)",
              }}
            >
              <ShieldCheck size={12} /> Exclusivo Administradores
            </Badge>
          </div>
          <p className="text-sm mt-1" style={{ color: "var(--dash-muted)" }}>
            Ajustes generales del proyecto Bucare, gestión de usuarios, asignación de roles y matriz de permisos.
          </p>
        </div>
      </div>

      {/* Tabs Principales */}
      <Tabs defaultValue="general" className="w-full space-y-4">
        <TabsList
          className="p-1 rounded-xl flex flex-wrap"
          style={{ background: "var(--dash-sidebar)", border: "1px solid var(--dash-border)" }}
        >
          <TabsTrigger value="general" className="gap-2 text-xs font-medium">
            <SlidersHorizontal size={14} /> General & Proyecto
          </TabsTrigger>
          <TabsTrigger value="portal" className="gap-2 text-xs font-medium">
            <Globe size={14} /> Imágenes & Portal Público
          </TabsTrigger>
          <TabsTrigger value="usuarios" className="gap-2 text-xs font-medium">
            <Users size={14} /> Usuarios y Roles
          </TabsTrigger>
          <TabsTrigger value="matriz" className="gap-2 text-xs font-medium">
            <ShieldCheck size={14} /> Matriz de Permisos
          </TabsTrigger>
        </TabsList>


        {/* ── Pestaña 1: General del Proyecto ── */}
        <TabsContent value="general" className="space-y-4">
          <form onSubmit={handleSaveGeneralSettings} className="space-y-4">
            {settingsSuccess && (
              <div
                className="p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in"
                style={{
                  background: "rgba(34,197,94,0.15)",
                  border: "1px solid rgba(34,197,94,0.3)",
                  color: "#22c55e",
                }}
              >
                <CheckCircle2 size={16} /> Configuración del proyecto actualizada correctamente.
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Información del Proyecto */}
              <Card style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)" }}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2" style={{ color: "var(--dash-text)" }}>
                    <Building2 size={16} style={{ color: "var(--dash-accent)" }} /> Datos del Proyecto
                  </CardTitle>
                  <CardDescription style={{ color: "var(--dash-muted)" }}>
                    Información general visible en los módulos del sistema.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                      Nombre del Proyecto / Plataforma
                    </Label>
                    <Input
                      value={projectSettings.projectName}
                      onChange={(e) => setProjectSettings({ ...projectSettings, projectName: e.target.value })}
                      className="mt-1 text-xs"
                      style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                        Moneda Base
                      </Label>
                      <Input
                        value={projectSettings.currency}
                        onChange={(e) => setProjectSettings({ ...projectSettings, currency: e.target.value })}
                        className="mt-1 text-xs"
                        style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                        Estado Actual
                      </Label>
                      <select
                        value={projectSettings.projectStatus}
                        onChange={(e) => setProjectSettings({ ...projectSettings, projectStatus: e.target.value })}
                        className="w-full mt-1 p-2 rounded-md text-xs font-medium cursor-pointer"
                        style={{ background: "var(--dash-sidebar)", border: "1px solid var(--dash-border)", color: "var(--dash-text)" }}
                      >
                        <option value="En Desarrollo">En Desarrollo</option>
                        <option value="Ventas Abiertas">Ventas Abiertas</option>
                        <option value="Entrega Próxima">Entrega Próxima</option>
                        <option value="Vendido 100%">Vendido 100%</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Canales de Contacto */}
              <Card style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)" }}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2" style={{ color: "var(--dash-text)" }}>
                    <Mail size={16} style={{ color: "var(--dash-accent)" }} /> Canales de Contacto y Alertas
                  </CardTitle>
                  <CardDescription style={{ color: "var(--dash-muted)" }}>
                    Información oficial de contacto que se muestra en /contacto y en el pie de página (Footer).
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                      Correo Institucional de Contacto
                    </Label>
                    <Input
                      type="email"
                      value={siteForm.contacto?.email || ""}
                      onChange={(e) => {
                        const updated = { ...siteForm.contacto, email: e.target.value };
                        setSiteForm({ ...siteForm, contacto: updated });
                        setProjectSettings({ ...projectSettings, contactEmail: e.target.value });
                      }}
                      className="mt-1 text-xs"
                      style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                    />
                  </div>

                  <div>
                    <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                      Teléfono Corporativo
                    </Label>
                    <Input
                      value={siteForm.contacto?.phone || ""}
                      onChange={(e) => {
                        const updated = { ...siteForm.contacto, phone: e.target.value };
                        setSiteForm({ ...siteForm, contacto: updated });
                        setProjectSettings({ ...projectSettings, contactPhone: e.target.value });
                      }}
                      className="mt-1 text-xs"
                      style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                    />
                  </div>

                  <div>
                    <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                      Dirección Corporativa
                    </Label>
                    <Input
                      value={siteForm.contacto?.address || ""}
                      onChange={(e) => {
                        const updated = { ...siteForm.contacto, address: e.target.value };
                        setSiteForm({ ...siteForm, contacto: updated });
                      }}
                      className="mt-1 text-xs"
                      style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Configuración de Asistente IA */}
              <Card className="md:col-span-2" style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)" }}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2" style={{ color: "var(--dash-text)" }}>
                    <Bot size={16} style={{ color: "var(--dash-accent)" }} /> Asistente de Inteligencia Artificial (Bucare AI)
                  </CardTitle>
                  <CardDescription style={{ color: "var(--dash-muted)" }}>
                    Parámetros de atención y visibilidad del chat automático con IA.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg border border-white/10" style={{ background: "var(--dash-sidebar)" }}>
                    <div>
                      <span className="text-xs font-semibold block" style={{ color: "var(--dash-text)" }}>
                        Respuesta Automática con IA en Chat
                      </span>
                      <span className="text-[11px]" style={{ color: "var(--dash-muted)" }}>
                        Activa o desactiva el servicio de chat automático con IA para clientes en la web.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={projectSettings.aiEnabled}
                      onChange={(e) => setProjectSettings({ ...projectSettings, aiEnabled: e.target.checked })}
                      className="h-4 w-4 accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>


            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={savingSettings}
                className="gap-2 font-semibold shadow-lg"
                style={{ background: "var(--dash-accent)", color: "#0D1810", border: "none" }}
              >
                {savingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
                Guardar Configuración General
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* ── Pestaña 2: Gestión de Contenidos e Imágenes del Portal ── */}
        <TabsContent value="portal" className="space-y-6">
          {portalSuccess && (
            <div
              className="p-4 rounded-xl flex items-center gap-3 text-sm font-semibold animate-fade-in shadow-md"
              style={{
                background: "rgba(34,197,94,0.15)",
                border: "1px solid rgba(34,197,94,0.3)",
                color: "#22c55e",
              }}
            >
              <CheckCircle2 size={18} /> {portalSuccess}
            </div>
          )}

          <Tabs defaultValue="p_hero" className="w-full space-y-4">
            <TabsList
              className="p-1 rounded-xl flex flex-wrap"
              style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)" }}
            >
              <TabsTrigger value="p_hero" className="text-xs">1. Inicio / Hero</TabsTrigger>
              <TabsTrigger value="p_proximo" className="text-xs">2. ¿Próximo Hogar?</TabsTrigger>
              <TabsTrigger value="p_apartamentos" className="text-xs">3. Apartamentos (6 Modelos)</TabsTrigger>
              <TabsTrigger value="p_areas" className="text-xs">4. Áreas Comunes</TabsTrigger>
              <TabsTrigger value="p_contacto" className="text-xs">5. Contacto & Footer</TabsTrigger>
              <TabsTrigger value="p_comercial" className="text-xs">6. Comercial (Plaza)</TabsTrigger>
              <TabsTrigger value="p_faq" className="text-xs">7. Preguntas Frecuentes (FAQ Home)</TabsTrigger>
            </TabsList>


            {/* Sub-Pestaña: Hero */}
            <TabsContent value="p_hero" className="space-y-4">
              <Card style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)" }}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2" style={{ color: "var(--dash-text)" }}>
                    <Globe size={18} style={{ color: "var(--dash-accent)" }} /> Sección de Inicio (Hero Principal)
                  </CardTitle>
                  <CardDescription style={{ color: "var(--dash-muted)" }}>
                    Edite el titular, subtítulo, estadísticas e imágenes de fondo de la portada principal.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                        Título Principal del Hero (Soporta saltos de línea)
                      </Label>
                      <textarea
                        rows={3}
                        value={siteForm.hero.title}
                        onChange={(e) => setSiteForm({ ...siteForm, hero: { ...siteForm.hero, title: e.target.value } })}
                        className="mt-1 w-full p-2.5 rounded-md text-xs font-semibold"
                        style={{ background: "var(--dash-sidebar)", border: "1px solid var(--dash-border)", color: "var(--dash-text)" }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                        Subtítulo Descriptivo
                      </Label>
                      <textarea
                        rows={3}
                        value={siteForm.hero.subtitle}
                        onChange={(e) => setSiteForm({ ...siteForm, hero: { ...siteForm.hero, subtitle: e.target.value } })}
                        className="mt-1 w-full p-2.5 rounded-md text-xs"
                        style={{ background: "var(--dash-sidebar)", border: "1px solid var(--dash-border)", color: "var(--dash-text)" }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-4">
                      <ImageUploader
                        label="Imagen Principal de Fondo (Hero - Fallback)"
                        value={siteForm.hero.mainImage}
                        onChange={(url) => setSiteForm({ ...siteForm, hero: { ...siteForm.hero, mainImage: url } })}
                      />
                      <VideoUploader
                        label="Video de Fondo (Hero - Reproducción Automática y Bucle)"
                        value={siteForm.hero.mainVideo || ""}
                        onChange={(url) => setSiteForm({ ...siteForm, hero: { ...siteForm.hero, mainVideo: url } })}
                      />
                    </div>

                    <div className="space-y-3">
                      <ImageUploader
                        label="Imagen Tarjeta Secundaria (Inferior Derecha)"
                        value={siteForm.hero.cardImage}
                        onChange={(url) => setSiteForm({ ...siteForm, hero: { ...siteForm.hero, cardImage: url } })}
                      />
                      <div>
                        <Label className="text-xs block" style={{ color: "var(--dash-muted)" }}>
                          Texto de Tarjeta Secundaria
                        </Label>
                        <Input
                          value={siteForm.hero.cardText}
                          onChange={(e) => setSiteForm({ ...siteForm, hero: { ...siteForm.hero, cardText: e.target.value } })}
                          className="mt-1 text-xs"
                          style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                        Número de Estadística Destacada (Ej. 50+)
                      </Label>
                      <Input
                        value={siteForm.hero.statsNumber}
                        onChange={(e) => setSiteForm({ ...siteForm, hero: { ...siteForm.hero, statsNumber: e.target.value } })}
                        className="mt-1 text-xs"
                        style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                        Texto de Estadística Destacada
                      </Label>
                      <Input
                        value={siteForm.hero.statsLabel}
                        onChange={(e) => setSiteForm({ ...siteForm, hero: { ...siteForm.hero, statsLabel: e.target.value } })}
                        className="mt-1 text-xs"
                        style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <Button
                      onClick={() => handleSavePortalSection("hero")}
                      disabled={savingPortal}
                      className="gap-2 font-semibold"
                      style={{ background: "var(--dash-accent)", color: "#0D1810" }}
                    >
                      {savingPortal ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
                      Guardar Sección Hero
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sub-Pestaña: ¿Próximo Hogar? */}
            <TabsContent value="p_proximo" className="space-y-4">
              <Card style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)" }}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2" style={{ color: "var(--dash-text)" }}>
                    <Building2 size={18} style={{ color: "var(--dash-accent)" }} /> Sección "¿Y si tu próximo hogar ya te estuviera esperando?"
                  </CardTitle>
                  <CardDescription style={{ color: "var(--dash-muted)" }}>
                    Gestione el título, subtítulo y las 3 imágenes / tarjetas de apartamentos destacados.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                        Título de la Sección
                      </Label>
                      <textarea
                        rows={2}
                        value={siteForm.proximo_hogar.title}
                        onChange={(e) => setSiteForm({ ...siteForm, proximo_hogar: { ...siteForm.proximo_hogar, title: e.target.value } })}
                        className="mt-1 w-full p-2.5 rounded-md text-xs font-semibold"
                        style={{ background: "var(--dash-sidebar)", border: "1px solid var(--dash-border)", color: "var(--dash-text)" }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                        Subtítulo Descriptivo
                      </Label>
                      <textarea
                        rows={2}
                        value={siteForm.proximo_hogar.subtitle}
                        onChange={(e) => setSiteForm({ ...siteForm, proximo_hogar: { ...siteForm.proximo_hogar, subtitle: e.target.value } })}
                        className="mt-1 w-full p-2.5 rounded-md text-xs"
                        style={{ background: "var(--dash-sidebar)", border: "1px solid var(--dash-border)", color: "var(--dash-text)" }}
                      />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <Label className="text-xs font-semibold block" style={{ color: "var(--dash-text)" }}>
                      Propiedades Destacadas (3 Tarjetas)
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {siteForm.proximo_hogar.properties.map((prop, idx) => (
                        <div key={idx} className="p-3 rounded-lg border border-white/10 space-y-2" style={{ background: "var(--dash-sidebar)" }}>
                          <span className="text-[11px] font-bold block" style={{ color: "var(--dash-accent)" }}>
                            Tarjeta {idx + 1}
                          </span>
                          <div>
                            <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>Nombre</Label>
                            <Input
                              value={prop.name}
                              onChange={(e) => {
                                const newProps = siteForm.proximo_hogar.properties.map((p, i) => 
                                  i === idx ? { ...p, name: e.target.value } : p
                                );
                                setSiteForm({ ...siteForm, proximo_hogar: { ...siteForm.proximo_hogar, properties: newProps } });
                              }}
                              className="mt-0.5 text-xs"
                              style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>Precio</Label>
                              <Input
                                value={prop.price}
                                onChange={(e) => {
                                  const newProps = siteForm.proximo_hogar.properties.map((p, i) => 
                                    i === idx ? { ...p, price: e.target.value } : p
                                  );
                                  setSiteForm({ ...siteForm, proximo_hogar: { ...siteForm.proximo_hogar, properties: newProps } });
                                }}
                                className="mt-0.5 text-xs"
                                style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                              />
                            </div>
                            <div>
                              <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>Área/m²</Label>
                              <Input
                                value={prop.area}
                                onChange={(e) => {
                                  const newProps = siteForm.proximo_hogar.properties.map((p, i) => 
                                    i === idx ? { ...p, area: e.target.value } : p
                                  );
                                  setSiteForm({ ...siteForm, proximo_hogar: { ...siteForm.proximo_hogar, properties: newProps } });
                                }}
                                className="mt-0.5 text-xs"
                                style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                              />
                            </div>
                          </div>
                          <div>
                            <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>
                              Enlace (ej: /apartamentos, /contacto o https://...)
                            </Label>
                            <Input
                              value={prop.link || ""}
                              placeholder="/apartamentos o https://..."
                              onChange={(e) => {
                                const newProps = siteForm.proximo_hogar.properties.map((p, i) => 
                                  i === idx ? { ...p, link: e.target.value } : p
                                );
                                setSiteForm({ ...siteForm, proximo_hogar: { ...siteForm.proximo_hogar, properties: newProps } });
                              }}
                              className="mt-0.5 text-xs"
                              style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                            />
                          </div>
                          <ImageUploader
                            label="Imagen de la propiedad"
                            value={prop.img}
                            onChange={(url) => {
                              const newProps = [...siteForm.proximo_hogar.properties];
                              newProps[idx].img = url;
                              const updatedSection = { ...siteForm.proximo_hogar, properties: newProps };
                              setSiteForm({ ...siteForm, proximo_hogar: updatedSection });
                              saveSectionData("proximo_hogar", updatedSection);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>


                  <div className="flex justify-end pt-3">
                    <Button
                      onClick={() => handleSavePortalSection("proximo_hogar")}
                      disabled={savingPortal}
                      className="gap-2 font-semibold"
                      style={{ background: "var(--dash-accent)", color: "#0D1810" }}
                    >
                      {savingPortal ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
                      Guardar Sección Próximo Hogar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sub-Pestaña: Apartamentos (6 Modelos) */}
            <TabsContent value="p_apartamentos" className="space-y-4">
              <Card style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)" }}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2" style={{ color: "var(--dash-text)" }}>
                    <Building2 size={18} style={{ color: "var(--dash-accent)" }} /> Página Apartamentos (6 Modelos)
                  </CardTitle>
                  <CardDescription style={{ color: "var(--dash-muted)" }}>
                    Configure los títulos generales y actualice renders, planos y detalles de cada uno de los 6 modelos.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                        Título Principal de Apartamentos
                      </Label>
                      <textarea
                        rows={2}
                        value={siteForm.apartamentos.title}
                        onChange={(e) => setSiteForm({ ...siteForm, apartamentos: { ...siteForm.apartamentos, title: e.target.value } })}
                        className="mt-1 w-full p-2.5 rounded-md text-xs font-semibold"
                        style={{ background: "var(--dash-sidebar)", border: "1px solid var(--dash-border)", color: "var(--dash-text)" }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                        Subtítulo Descriptivo
                      </Label>
                      <textarea
                        rows={2}
                        value={siteForm.apartamentos.subtitle}
                        onChange={(e) => setSiteForm({ ...siteForm, apartamentos: { ...siteForm.apartamentos, subtitle: e.target.value } })}
                        className="mt-1 w-full p-2.5 rounded-md text-xs"
                        style={{ background: "var(--dash-sidebar)", border: "1px solid var(--dash-border)", color: "var(--dash-text)" }}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <Label className="text-xs font-semibold block" style={{ color: "var(--dash-text)" }}>
                      Listado de Tipologías / Modelos
                    </Label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {siteForm.apartamentos.models.map((mod, idx) => (
                        <div key={mod.id || idx} className="p-4 rounded-xl border border-white/10 space-y-3" style={{ background: "var(--dash-sidebar)" }}>
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <span className="text-xs font-bold" style={{ color: "var(--dash-accent)" }}>
                              {mod.name} (ID: {mod.id})
                            </span>
                            <span className="text-[11px] text-muted-foreground">{mod.bedrooms} · {mod.bathrooms}</span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <div>
                              <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>Área</Label>
                              <Input
                                value={mod.area}
                                onChange={(e) => {
                                  const newMods = [...siteForm.apartamentos.models];
                                  newMods[idx].area = e.target.value;
                                  setSiteForm({ ...siteForm, apartamentos: { ...siteForm.apartamentos, models: newMods } });
                                }}
                                className="mt-0.5 text-xs"
                                style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                              />
                            </div>
                            <div>
                              <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>Estacionamiento</Label>
                              <Input
                                value={mod.parking || ""}
                                onChange={(e) => {
                                  const newMods = [...siteForm.apartamentos.models];
                                  newMods[idx].parking = e.target.value;
                                  setSiteForm({ ...siteForm, apartamentos: { ...siteForm.apartamentos, models: newMods } });
                                }}
                                className="mt-0.5 text-xs"
                                style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                              />
                            </div>
                            <div>
                              <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>Habitaciones</Label>
                              <Input
                                value={mod.bedrooms}
                                onChange={(e) => {
                                  const newMods = [...siteForm.apartamentos.models];
                                  newMods[idx].bedrooms = e.target.value;
                                  setSiteForm({ ...siteForm, apartamentos: { ...siteForm.apartamentos, models: newMods } });
                                }}
                                className="mt-0.5 text-xs"
                                style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                              />
                            </div>
                            <div>
                              <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>Baños</Label>
                              <Input
                                value={mod.bathrooms}
                                onChange={(e) => {
                                  const newMods = [...siteForm.apartamentos.models];
                                  newMods[idx].bathrooms = e.target.value;
                                  setSiteForm({ ...siteForm, apartamentos: { ...siteForm.apartamentos, models: newMods } });
                                }}
                                className="mt-0.5 text-xs"
                                style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                              />
                            </div>
                          </div>

                          {/* Balcón */}
                          <div>
                            <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>Balcón / Terraza</Label>
                            <Input
                              value={mod.balcony || ""}
                              onChange={(e) => {
                                const newMods = [...siteForm.apartamentos.models];
                                newMods[idx].balcony = e.target.value;
                                setSiteForm({ ...siteForm, apartamentos: { ...siteForm.apartamentos, models: newMods } });
                              }}
                              className="mt-0.5 text-xs"
                              style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                            />
                          </div>

                          {/* Distribución Interna */}
                          <div className="pt-2 border-t border-white/5 space-y-2">
                            <Label className="text-[11px] font-bold" style={{ color: "var(--dash-accent)" }}>Distribución Interna</Label>
                            <div className="space-y-1.5">
                              {(mod.distribution || []).map((item: string, dIdx: number) => (
                                <div key={dIdx} className="flex gap-1.5 items-center">
                                  <Input
                                    value={item}
                                    onChange={(e) => {
                                      const newMods = [...siteForm.apartamentos.models];
                                      const dist = [...(newMods[idx].distribution || [])];
                                      dist[dIdx] = e.target.value;
                                      newMods[idx] = { ...newMods[idx], distribution: dist };
                                      setSiteForm({ ...siteForm, apartamentos: { ...siteForm.apartamentos, models: newMods } });
                                    }}
                                    className="text-xs flex-1 h-7"
                                    style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                                  />
                                  <button
                                    onClick={() => {
                                      const newMods = [...siteForm.apartamentos.models];
                                      const dist = (newMods[idx].distribution || []).filter((_: string, i: number) => i !== dIdx);
                                      newMods[idx] = { ...newMods[idx], distribution: dist };
                                      setSiteForm({ ...siteForm, apartamentos: { ...siteForm.apartamentos, models: newMods } });
                                    }}
                                    className="text-xs px-1.5 py-1 rounded shrink-0"
                                    style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}
                                  >✕</button>
                                </div>
                              ))}
                              <button
                                onClick={() => {
                                  const newMods = [...siteForm.apartamentos.models];
                                  const dist = [...(newMods[idx].distribution || []), ""];
                                  newMods[idx] = { ...newMods[idx], distribution: dist };
                                  setSiteForm({ ...siteForm, apartamentos: { ...siteForm.apartamentos, models: newMods } });
                                }}
                                className="text-[10px] px-2.5 py-1 rounded"
                                style={{ background: "rgba(225,182,104,0.1)", color: "var(--dash-accent)", border: "1px solid rgba(225,182,104,0.3)" }}
                              >+ Agregar ítem</button>
                            </div>
                          </div>

                          {/* Sección: Financiamiento y Costos */}
                          <div className="pt-2 border-t border-white/5 space-y-2">
                            <Label className="text-[11px] font-bold" style={{ color: "var(--dash-accent)" }}>Planes de Financiamiento</Label>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                              <div>
                                <Label className="text-[9px]" style={{ color: "var(--dash-muted)" }}>Precio Total</Label>
                                <Input
                                  value={mod.financingTotal || ""}
                                  onChange={(e) => {
                                    const newMods = [...siteForm.apartamentos.models];
                                    newMods[idx].financingTotal = e.target.value;
                                    setSiteForm({ ...siteForm, apartamentos: { ...siteForm.apartamentos, models: newMods } });
                                  }}
                                  className="mt-0.5 text-xs h-8"
                                  style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                                  placeholder="43.895"
                                />
                              </div>
                              <div>
                                <Label className="text-[9px]" style={{ color: "var(--dash-muted)" }}>Inicial (35%)</Label>
                                <Input
                                  value={mod.financingInicial || ""}
                                  onChange={(e) => {
                                    const newMods = [...siteForm.apartamentos.models];
                                    newMods[idx].financingInicial = e.target.value;
                                    setSiteForm({ ...siteForm, apartamentos: { ...siteForm.apartamentos, models: newMods } });
                                  }}
                                  className="mt-0.5 text-xs h-8"
                                  style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                                  placeholder="15.365"
                                />
                              </div>
                              <div>
                                <Label className="text-[9px]" style={{ color: "var(--dash-muted)" }}>Monto Cuota</Label>
                                <Input
                                  value={mod.financingCuotasMonto || ""}
                                  onChange={(e) => {
                                    const newMods = [...siteForm.apartamentos.models];
                                    newMods[idx].financingCuotasMonto = e.target.value;
                                    setSiteForm({ ...siteForm, apartamentos: { ...siteForm.apartamentos, models: newMods } });
                                  }}
                                  className="mt-0.5 text-xs h-8"
                                  style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                                  placeholder="2.195"
                                />
                              </div>
                              <div>
                                <Label className="text-[9px]" style={{ color: "var(--dash-muted)" }}>N° Cuotas</Label>
                                <Input
                                  value={mod.financingCuotasNro || ""}
                                  onChange={(e) => {
                                    const newMods = [...siteForm.apartamentos.models];
                                    newMods[idx].financingCuotasNro = e.target.value;
                                    setSiteForm({ ...siteForm, apartamentos: { ...siteForm.apartamentos, models: newMods } });
                                  }}
                                  className="mt-0.5 text-xs h-8"
                                  style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                                  placeholder="12"
                                />
                              </div>
                              <div>
                                <Label className="text-[9px]" style={{ color: "var(--dash-muted)" }}>Cuota Única</Label>
                                <Input
                                  value={mod.financingCuotaUnica || ""}
                                  onChange={(e) => {
                                    const newMods = [...siteForm.apartamentos.models];
                                    newMods[idx].financingCuotaUnica = e.target.value;
                                    setSiteForm({ ...siteForm, apartamentos: { ...siteForm.apartamentos, models: newMods } });
                                  }}
                                  className="mt-0.5 text-xs h-8"
                                  style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                                  placeholder="5.000"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <ImageUploader
                              label="Render Arquitectónico Principal"
                              value={mod.render}
                              onChange={(url) => {
                                const newMods = [...siteForm.apartamentos.models];
                                newMods[idx].render = url;
                                const updatedRes = { ...siteForm.apartamentos, models: newMods };
                                setSiteForm({ ...siteForm, apartamentos: updatedRes });
                                saveSectionData("apartamentos", updatedRes);
                              }}
                            />
                            <ImageUploader
                              label="Plano / Distribución Principal"
                              value={mod.plan}
                              onChange={(url) => {
                                const newMods = [...siteForm.apartamentos.models];
                                newMods[idx].plan = url;
                                const updatedRes = { ...siteForm.apartamentos, models: newMods };
                                setSiteForm({ ...siteForm, apartamentos: updatedRes });
                                saveSectionData("apartamentos", updatedRes);
                              }}
                            />
                          </div>

                          {/* Seccion Galería del Modelo (1 a 12 imágenes) */}
                          <div className="pt-3 border-t border-white/10 space-y-3">
                            {(() => {
                              const modelGallery = mod.gallery && mod.gallery.length > 0
                                ? mod.gallery
                                : [mod.render, mod.plan].filter(Boolean);

                              const updateGallery = (newGallery: string[]) => {
                                const newMods = [...siteForm.apartamentos.models];
                                newMods[idx] = { ...newMods[idx], gallery: newGallery };
                                const updatedRes = { ...siteForm.apartamentos, models: newMods };
                                setSiteForm({ ...siteForm, apartamentos: updatedRes });
                                saveSectionData("apartamentos", updatedRes);
                              };

                              const handleAddImage = () => {
                                if (modelGallery.length >= 12) return;
                                const nextImg = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80";
                                updateGallery([...modelGallery, nextImg]);
                              };

                              const handleRemoveImage = (imgIdx: number) => {
                                if (modelGallery.length <= 1) return;
                                updateGallery(modelGallery.filter((_, i) => i !== imgIdx));
                              };

                              const handleMoveImage = (imgIdx: number, dir: "left" | "right") => {
                                const targetIdx = dir === "left" ? imgIdx - 1 : imgIdx + 1;
                                if (targetIdx < 0 || targetIdx >= modelGallery.length) return;
                                const copy = [...modelGallery];
                                const temp = copy[imgIdx];
                                copy[imgIdx] = copy[targetIdx];
                                copy[targetIdx] = temp;
                                updateGallery(copy);
                              };

                              const handleImageChange = (imgIdx: number, newUrl: string) => {
                                const copy = [...modelGallery];
                                copy[imgIdx] = newUrl;
                                updateGallery(copy);
                              };

                              return (
                                <>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Images size={14} style={{ color: "var(--dash-accent)" }} />
                                      <span className="text-xs font-semibold" style={{ color: "var(--dash-text)" }}>
                                        Galería del Modelo
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] px-1.5 py-0 font-mono"
                                        style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)" }}
                                      >
                                        {modelGallery.length} / 12 imágenes
                                      </Badge>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      disabled={modelGallery.length >= 12}
                                      onClick={handleAddImage}
                                      className="h-7 px-2 text-[11px] gap-1 font-semibold"
                                      style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)" }}
                                    >
                                      <Plus size={12} /> Añadir Imagen
                                    </Button>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                    {modelGallery.map((imgUrl, imgIdx) => (
                                      <div
                                        key={imgIdx}
                                        className="p-2.5 rounded-lg border border-white/5 space-y-2 relative"
                                        style={{ background: "var(--dash-card)" }}
                                      >
                                        <div className="flex items-center justify-between text-[11px]">
                                          <span className="font-semibold text-muted-foreground">
                                            Imagen {imgIdx + 1}
                                          </span>
                                          <div className="flex items-center gap-1">
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              disabled={imgIdx === 0}
                                              onClick={() => handleMoveImage(imgIdx, "left")}
                                              className="h-6 w-6 p-0"
                                              title="Mover atrás"
                                            >
                                              <ArrowLeft size={12} />
                                            </Button>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              disabled={imgIdx === modelGallery.length - 1}
                                              onClick={() => handleMoveImage(imgIdx, "right")}
                                              className="h-6 w-6 p-0"
                                              title="Mover adelante"
                                            >
                                              <ArrowRight size={12} />
                                            </Button>
                                            <Button
                                              type="button"
                                              variant="ghost"
                                              size="sm"
                                              disabled={modelGallery.length <= 1}
                                              onClick={() => handleRemoveImage(imgIdx)}
                                              className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-950/40"
                                              title="Eliminar imagen de la galería"
                                            >
                                              <Trash2 size={12} />
                                            </Button>
                                          </div>
                                        </div>

                                        <ImageUploader
                                          label=""
                                          value={imgUrl}
                                          onChange={(newUrl) => handleImageChange(imgIdx, newUrl)}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </>
                              );
                            })()}
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <Button
                      onClick={() => handleSavePortalSection("apartamentos")}
                      disabled={savingPortal}
                      className="gap-2 font-semibold"
                      style={{ background: "var(--dash-accent)", color: "#0D1810" }}
                    >
                      {savingPortal ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
                      Guardar Todos los Modelos de Apartamentos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sub-Pestaña: Áreas Comunes */}
            <TabsContent value="p_areas" className="space-y-4">
              <Card style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)" }}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2" style={{ color: "var(--dash-text)" }}>
                    <Globe size={18} style={{ color: "var(--dash-accent)" }} /> Página Áreas Comunes
                  </CardTitle>
                  <CardDescription style={{ color: "var(--dash-muted)" }}>
                    Gestione títulos, descripciones e imágenes de los espacios compartidos.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                        Título Principal de Áreas Comunes
                      </Label>
                      <textarea
                        rows={2}
                        value={siteForm.areas.title}
                        onChange={(e) => setSiteForm({ ...siteForm, areas: { ...siteForm.areas, title: e.target.value } })}
                        className="mt-1 w-full p-2.5 rounded-md text-xs font-semibold"
                        style={{ background: "var(--dash-sidebar)", border: "1px solid var(--dash-border)", color: "var(--dash-text)" }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                        Subtítulo Descriptivo
                      </Label>
                      <textarea
                        rows={2}
                        value={siteForm.areas.subtitle}
                        onChange={(e) => setSiteForm({ ...siteForm, areas: { ...siteForm.areas, subtitle: e.target.value } })}
                        className="mt-1 w-full p-2.5 rounded-md text-xs"
                        style={{ background: "var(--dash-sidebar)", border: "1px solid var(--dash-border)", color: "var(--dash-text)" }}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <Label className="text-xs font-semibold block" style={{ color: "var(--dash-text)" }}>
                      Espacios Comunes (6 Espacios)
                    </Label>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {siteForm.areas.list.map((area, idx) => (
                        <div key={area.id || idx} className="p-3 rounded-xl border border-white/10 space-y-2" style={{ background: "var(--dash-sidebar)" }}>
                          <span className="text-xs font-bold block" style={{ color: "var(--dash-accent)" }}>
                            Espacio {idx + 1}: {area.name}
                          </span>
                          <div>
                            <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>Nombre del Espacio</Label>
                            <Input
                              value={area.name}
                              onChange={(e) => {
                                const newList = [...siteForm.areas.list];
                                newList[idx].name = e.target.value;
                                setSiteForm({ ...siteForm, areas: { ...siteForm.areas, list: newList } });
                              }}
                              className="mt-0.5 text-xs"
                              style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                            />
                          </div>
                          <div>
                            <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>Descripción</Label>
                            <textarea
                              rows={2}
                              value={area.description}
                              onChange={(e) => {
                                const newList = [...siteForm.areas.list];
                                newList[idx].description = e.target.value;
                                setSiteForm({ ...siteForm, areas: { ...siteForm.areas, list: newList } });
                              }}
                              className="mt-0.5 w-full p-2 rounded-md text-xs"
                              style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", color: "var(--dash-text)" }}
                            />
                          </div>
                          <ImageUploader
                            label="Imagen del espacio"
                            value={area.img}
                            onChange={(url) => {
                              const newList = [...siteForm.areas.list];
                              newList[idx].img = url;
                              setSiteForm({ ...siteForm, areas: { ...siteForm.areas, list: newList } });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <Button
                      onClick={() => handleSavePortalSection("areas")}
                      disabled={savingPortal}
                      className="gap-2 font-semibold"
                      style={{ background: "var(--dash-accent)", color: "#0D1810" }}
                    >
                      {savingPortal ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
                      Guardar Áreas Comunes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            {/* Sub-Pestaña: Contacto & Footer */}
            <TabsContent value="p_contacto" className="space-y-4">
              <Card style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)" }}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2" style={{ color: "var(--dash-text)" }}>
                    <Globe size={18} style={{ color: "var(--dash-accent)" }} /> Página Contacto & Información del Footer
                  </CardTitle>
                  <CardDescription style={{ color: "var(--dash-muted)" }}>
                    Configure los textos de la página /contacto así como el teléfono, email y dirección que se mostrarán tanto en /contacto como en el Footer del portal.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                        Título Principal de Contacto
                      </Label>
                      <textarea
                        rows={3}
                        value={siteForm.contacto?.title || ""}
                        onChange={(e) => setSiteForm({ ...siteForm, contacto: { ...siteForm.contacto, title: e.target.value } })}
                        className="mt-1 w-full p-2.5 rounded-md text-xs font-semibold"
                        style={{ background: "var(--dash-sidebar)", border: "1px solid var(--dash-border)", color: "var(--dash-text)" }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                        Subtítulo / Mensaje de Introducción
                      </Label>
                      <textarea
                        rows={3}
                        value={siteForm.contacto?.subtitle || ""}
                        onChange={(e) => setSiteForm({ ...siteForm, contacto: { ...siteForm.contacto, subtitle: e.target.value } })}
                        className="mt-1 w-full p-2.5 rounded-md text-xs"
                        style={{ background: "var(--dash-sidebar)", border: "1px solid var(--dash-border)", color: "var(--dash-text)" }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div>
                      <Label className="text-xs font-semibold block mb-1" style={{ color: "var(--dash-text)" }}>
                        Dirección (Se muestra en /contacto y Footer)
                      </Label>
                      <textarea
                        rows={3}
                        value={siteForm.contacto?.address || ""}
                        onChange={(e) => setSiteForm({ ...siteForm, contacto: { ...siteForm.contacto, address: e.target.value } })}
                        className="w-full p-2.5 rounded-md text-xs"
                        style={{ background: "var(--dash-sidebar)", border: "1px solid var(--dash-border)", color: "var(--dash-text)" }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold block mb-1" style={{ color: "var(--dash-text)" }}>
                        Teléfono(s) de Contacto
                      </Label>
                      <Input
                        value={siteForm.contacto?.phone || ""}
                        onChange={(e) => setSiteForm({ ...siteForm, contacto: { ...siteForm.contacto, phone: e.target.value } })}
                        className="mt-1 text-xs"
                        style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold block mb-1" style={{ color: "var(--dash-text)" }}>
                        Correo Electrónico de Contacto
                      </Label>
                      <Input
                        value={siteForm.contacto?.email || ""}
                        onChange={(e) => setSiteForm({ ...siteForm, contacto: { ...siteForm.contacto, email: e.target.value } })}
                        className="mt-1 text-xs"
                        style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <Button
                      onClick={() => handleSavePortalSection("contacto")}
                      disabled={savingPortal}
                      className="gap-2 font-semibold"
                      style={{ background: "var(--dash-accent)", color: "#0D1810" }}
                    >
                      {savingPortal ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
                      Guardar Información de Contacto & Footer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sub-Pestaña: Comercial (Plaza) */}
            <TabsContent value="p_comercial" className="space-y-4 animate-fade-in">
              {/* 1. Hero & Cabecera */}
              <Card style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)" }}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2" style={{ color: "var(--dash-text)" }}>
                    <Globe size={18} style={{ color: "var(--dash-accent)" }} /> Hero &amp; Portada Principal (Bucare Plaza)
                  </CardTitle>
                  <CardDescription style={{ color: "var(--dash-muted)" }}>
                    Configure el titular de portada, subtítulo explicativo de cabecera y la imagen de fondo.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                        Título de Portada (Soporta saltos de línea con Enter)
                      </Label>
                      <textarea
                        rows={3}
                        value={siteForm.comercial?.hero?.title || ""}
                        onChange={(e) => setSiteForm({
                          ...siteForm,
                          comercial: {
                            ...siteForm.comercial,
                            hero: { ...siteForm.comercial.hero, title: e.target.value }
                          }
                        })}
                        className="mt-1 w-full p-2.5 rounded-md text-xs font-semibold"
                        style={{ background: "var(--dash-sidebar)", border: "1px solid var(--dash-border)", color: "var(--dash-text)" }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                        Subtítulo Explicativo
                      </Label>
                      <textarea
                        rows={3}
                        value={siteForm.comercial?.hero?.subtitle || ""}
                        onChange={(e) => setSiteForm({
                          ...siteForm,
                          comercial: {
                            ...siteForm.comercial,
                            hero: { ...siteForm.comercial.hero, subtitle: e.target.value }
                          }
                        })}
                        className="mt-1 w-full p-2.5 rounded-md text-xs"
                        style={{ background: "var(--dash-sidebar)", border: "1px solid var(--dash-border)", color: "var(--dash-text)" }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div>
                      <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                        Ocupación (Stats Valor)
                      </Label>
                      <Input
                        value={siteForm.comercial?.hero?.statsNumber || ""}
                        onChange={(e) => setSiteForm({
                          ...siteForm,
                          comercial: {
                            ...siteForm.comercial,
                            hero: { ...siteForm.comercial.hero, statsNumber: e.target.value }
                          }
                        })}
                        className="mt-1 text-xs font-bold"
                        style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                        Ocupación Leyenda (Stats Label)
                      </Label>
                      <Input
                        value={siteForm.comercial?.hero?.statsLabel || ""}
                        onChange={(e) => setSiteForm({
                          ...siteForm,
                          comercial: {
                            ...siteForm.comercial,
                            hero: { ...siteForm.comercial.hero, statsLabel: e.target.value }
                          }
                        })}
                        className="mt-1 text-xs"
                        style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                      />
                    </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                        Imagen Principal (Hero Background - Fallback)
                      </Label>
                      <div className="mt-1">
                        <ImageUploader
                          value={siteForm.comercial?.hero?.mainImage || ""}
                          onChange={(url) => setSiteForm({
                            ...siteForm,
                            comercial: {
                              ...siteForm.comercial,
                              hero: { ...siteForm.comercial.hero, mainImage: url }
                            }
                          })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                        Video Principal (Hero Background - Reproducción Automática y Bucle)
                      </Label>
                      <div className="mt-1">
                        <VideoUploader
                          value={siteForm.comercial?.hero?.video || ""}
                          onChange={(url) => setSiteForm({
                            ...siteForm,
                            comercial: {
                              ...siteForm.comercial,
                              hero: { ...siteForm.comercial.hero, video: url }
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                  </div>
                </CardContent>
              </Card>

              {/* Redes Sociales del Footer */}
              <Card style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)" }}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2" style={{ color: "var(--dash-text)" }}>
                    <Share2 size={18} style={{ color: "var(--dash-accent)" }} /> Redes Sociales del Footer
                  </CardTitle>
                  <CardDescription style={{ color: "var(--dash-muted)" }}>
                    Configure los enlaces para las redes sociales en el pie de página comercial.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>Enlace de Instagram</Label>
                      <Input
                        value={siteForm.comercial?.socials?.instagram || ""}
                        onChange={(e) => {
                          const updated = {
                            ...siteForm.comercial,
                            socials: {
                              ...(siteForm.comercial?.socials || {}),
                              instagram: e.target.value
                            }
                          };
                          setSiteForm({ ...siteForm, comercial: updated });
                          saveSectionData("comercial", updated);
                        }}
                        className="mt-1 text-xs"
                        style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>Enlace de Facebook</Label>
                      <Input
                        value={siteForm.comercial?.socials?.facebook || ""}
                        onChange={(e) => {
                          const updated = {
                            ...siteForm.comercial,
                            socials: {
                              ...(siteForm.comercial?.socials || {}),
                              facebook: e.target.value
                            }
                          };
                          setSiteForm({ ...siteForm, comercial: updated });
                          saveSectionData("comercial", updated);
                        }}
                        className="mt-1 text-xs"
                        style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 2. Sección El Proyecto */}
              <Card style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)" }}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2" style={{ color: "var(--dash-text)" }}>
                    <Building2 size={18} style={{ color: "var(--dash-accent)" }} /> Sección "El Proyecto"
                  </CardTitle>
                  <CardDescription style={{ color: "var(--dash-muted)" }}>
                    Edite los títulos y párrafos detallados de la sección del proyecto comercial.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                        Subtítulo de Sección (ej: 01 El Proyecto)
                      </Label>
                      <Input
                        value={siteForm.comercial?.proyecto?.subtitle || ""}
                        onChange={(e) => setSiteForm({
                          ...siteForm,
                          comercial: {
                            ...siteForm.comercial,
                            proyecto: { ...siteForm.comercial.proyecto, subtitle: e.target.value }
                          }
                        })}
                        className="mt-1 text-xs"
                        style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                        Título Principal del Proyecto
                      </Label>
                      <Input
                        value={siteForm.comercial?.proyecto?.title || ""}
                        onChange={(e) => setSiteForm({
                          ...siteForm,
                          comercial: {
                            ...siteForm.comercial,
                            proyecto: { ...siteForm.comercial.proyecto, title: e.target.value }
                          }
                        })}
                        className="mt-1 text-xs"
                        style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                        Párrafo de Introducción 1
                      </Label>
                      <textarea
                        rows={3}
                        value={siteForm.comercial?.proyecto?.desc1 || ""}
                        onChange={(e) => setSiteForm({
                          ...siteForm,
                          comercial: {
                            ...siteForm.comercial,
                            proyecto: { ...siteForm.comercial.proyecto, desc1: e.target.value }
                          }
                        })}
                        className="mt-1 w-full p-2.5 rounded-md text-xs"
                        style={{ background: "var(--dash-sidebar)", border: "1px solid var(--dash-border)", color: "var(--dash-text)" }}
                      />
                    </div>
                    <div>
                      <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                        Párrafo de Introducción 2
                      </Label>
                      <textarea
                        rows={3}
                        value={siteForm.comercial?.proyecto?.desc2 || ""}
                        onChange={(e) => setSiteForm({
                          ...siteForm,
                          comercial: {
                            ...siteForm.comercial,
                            proyecto: { ...siteForm.comercial.proyecto, desc2: e.target.value }
                          }
                        })}
                        className="mt-1 w-full p-2.5 rounded-md text-xs"
                        style={{ background: "var(--dash-sidebar)", border: "1px solid var(--dash-border)", color: "var(--dash-text)" }}
                      />
                    </div>
                  </div>

                  {/* Bullets */}
                  <div>
                    <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                      Puntos Destacados (íconos de bala)
                    </Label>
                    <div className="mt-2 space-y-2">
                      {(siteForm.comercial?.proyecto?.bullets || []).map((b: { text: string }, idx: number) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <Input
                            value={b.text}
                            onChange={(e) => {
                              const bullets = [...(siteForm.comercial?.proyecto?.bullets || [])];
                              bullets[idx] = { text: e.target.value };
                              setSiteForm({ ...siteForm, comercial: { ...siteForm.comercial, proyecto: { ...siteForm.comercial.proyecto, bullets } } });
                            }}
                            className="text-xs flex-1"
                            style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                          />
                          <button
                            onClick={() => {
                              const bullets = (siteForm.comercial?.proyecto?.bullets || []).filter((_: any, i: number) => i !== idx);
                              setSiteForm({ ...siteForm, comercial: { ...siteForm.comercial, proyecto: { ...siteForm.comercial.proyecto, bullets } } });
                            }}
                            className="text-xs px-2 py-1 rounded"
                            style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}
                          >✕</button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const bullets = [...(siteForm.comercial?.proyecto?.bullets || []), { text: "" }];
                          setSiteForm({ ...siteForm, comercial: { ...siteForm.comercial, proyecto: { ...siteForm.comercial.proyecto, bullets } } });
                        }}
                        className="text-xs px-3 py-1.5 rounded"
                        style={{ background: "rgba(225,182,104,0.1)", color: "var(--dash-accent)", border: "1px solid rgba(225,182,104,0.3)" }}
                      >+ Agregar punto</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                        Imagen de "El Proyecto" (Preventa - Fallback)
                      </Label>
                      <div className="mt-1">
                        <ImageUploader
                          value={siteForm.comercial?.proyecto?.image || ""}
                          onChange={(url) => setSiteForm({
                            ...siteForm,
                            comercial: {
                              ...siteForm.comercial,
                              proyecto: { ...siteForm.comercial.proyecto, image: url }
                            }
                          })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                        Video de "El Proyecto" (Preventa - Reproducción Automática y Bucle)
                      </Label>
                      <div className="mt-1">
                        <VideoUploader
                          value={siteForm.comercial?.proyecto?.video || ""}
                          onChange={(url) => setSiteForm({
                            ...siteForm,
                            comercial: {
                              ...siteForm.comercial,
                              proyecto: { ...siteForm.comercial.proyecto, video: url }
                            }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 3. Métricas y Estadísticas */}
              <Card style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)" }}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2" style={{ color: "var(--dash-text)" }}>
                    <SlidersHorizontal size={18} style={{ color: "var(--dash-accent)" }} /> Barra de Estadísticas (4 Métricas)
                  </CardTitle>
                  <CardDescription style={{ color: "var(--dash-muted)" }}>
                    Configure las cifras cuantitativas de la plaza comercial.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {(siteForm.comercial?.stats || []).map((s, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-lg border"
                        style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)" }}
                      >
                        <Label className="text-[10px] uppercase tracking-wider block mb-2" style={{ color: "var(--dash-accent)" }}>
                          Métrica {idx + 1}
                        </Label>
                        <div className="space-y-2">
                          <div>
                            <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>Valor</Label>
                            <Input
                              value={s.valor}
                              onChange={(e) => {
                                const newStats = [...siteForm.comercial.stats];
                                newStats[idx].valor = e.target.value;
                                setSiteForm({ ...siteForm, comercial: { ...siteForm.comercial, stats: newStats } });
                              }}
                              className="h-7 text-xs font-semibold"
                              style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                            />
                          </div>
                          <div>
                            <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>Unidad</Label>
                            <Input
                              value={s.unidad}
                              onChange={(e) => {
                                const newStats = [...siteForm.comercial.stats];
                                newStats[idx].unidad = e.target.value;
                                setSiteForm({ ...siteForm, comercial: { ...siteForm.comercial, stats: newStats } });
                              }}
                              className="h-7 text-xs font-semibold"
                              style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                            />
                          </div>
                          <div>
                            <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>Etiqueta</Label>
                            <Input
                              value={s.label}
                              onChange={(e) => {
                                const newStats = [...siteForm.comercial.stats];
                                newStats[idx].label = e.target.value;
                                setSiteForm({ ...siteForm, comercial: { ...siteForm.comercial, stats: newStats } });
                              }}
                              className="h-7 text-xs"
                              style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 4. Ventajas Comerciales */}
              <Card style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)" }}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2" style={{ color: "var(--dash-text)" }}>
                    <Shield size={18} style={{ color: "var(--dash-accent)" }} /> Ventajas Competitivas
                  </CardTitle>
                  <CardDescription style={{ color: "var(--dash-muted)" }}>
                    Edite los títulos y descripciones detalladas de las 5 ventajas de la plaza.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(siteForm.comercial?.ventajas || []).map((v, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-lg border space-y-2.5"
                        style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)" }}
                      >
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] uppercase font-bold" style={{ color: "var(--dash-accent)" }}>
                            Ventaja {v.num}
                          </Label>
                        </div>
                        <div>
                          <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>Título</Label>
                          <Input
                            value={v.titulo}
                            onChange={(e) => {
                              const newVent = [...siteForm.comercial.ventajas];
                              newVent[idx].titulo = e.target.value;
                              setSiteForm({ ...siteForm, comercial: { ...siteForm.comercial, ventajas: newVent } });
                            }}
                            className="h-8 text-xs font-semibold"
                            style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                          />
                        </div>
                        <div>
                          <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>Descripción Corta</Label>
                          <textarea
                            rows={2}
                            value={v.desc}
                            onChange={(e) => {
                              const newVent = [...siteForm.comercial.ventajas];
                              newVent[idx].desc = e.target.value;
                              setSiteForm({ ...siteForm, comercial: { ...siteForm.comercial, ventajas: newVent } });
                            }}
                            className="w-full p-2 rounded-md text-xs"
                            style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", color: "var(--dash-text)" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 5. Locales & Marcas Comerciales */}
              <Card style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)" }}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2" style={{ color: "var(--dash-text)" }}>
                    <Images size={18} style={{ color: "var(--dash-accent)" }} /> Marcas y Locales Comerciales
                  </CardTitle>
                  <CardDescription style={{ color: "var(--dash-muted)" }}>
                    Gestione y configure los 4 locales destacados para el carrusel de espacios de Bucare Plaza.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {(siteForm.comercial?.locales || []).map((l, idx) => (
                      <div
                        key={l.id}
                        className="p-4 rounded-xl border space-y-3"
                        style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)" }}
                      >
                        <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: "var(--dash-border)" }}>
                          <span className="text-xs font-bold font-mono" style={{ color: "var(--dash-accent)" }}>
                            LOCAL {l.id}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>Nombre de Marca</Label>
                            <Input
                              value={l.nombre}
                              onChange={(e) => {
                                const newLocs = [...siteForm.comercial.locales];
                                newLocs[idx].nombre = e.target.value;
                                setSiteForm({ ...siteForm, comercial: { ...siteForm.comercial, locales: newLocs } });
                              }}
                              className="h-8 text-xs font-bold"
                              style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                            />
                          </div>
                          <div>
                            <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>Categoría</Label>
                            <Input
                              value={l.categoria}
                              onChange={(e) => {
                                const newLocs = [...siteForm.comercial.locales];
                                newLocs[idx].categoria = e.target.value;
                                setSiteForm({ ...siteForm, comercial: { ...siteForm.comercial, locales: newLocs } });
                              }}
                              className="h-8 text-xs"
                              style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>Área Comercial</Label>
                            <Input
                              value={l.area}
                              onChange={(e) => {
                                const newLocs = [...siteForm.comercial.locales];
                                newLocs[idx].area = e.target.value;
                                setSiteForm({ ...siteForm, comercial: { ...siteForm.comercial, locales: newLocs } });
                              }}
                              className="h-8 text-xs"
                              style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                            />
                          </div>
                          <div>
                            <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>Estado / Status (ej: Ancla, Activo, Disponible)</Label>
                            <Input
                              value={l.status}
                              onChange={(e) => {
                                const newLocs = [...siteForm.comercial.locales];
                                newLocs[idx].status = e.target.value;
                                setSiteForm({ ...siteForm, comercial: { ...siteForm.comercial, locales: newLocs } });
                              }}
                              className="h-8 text-xs"
                              style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>Descripción de Marca</Label>
                          <textarea
                            rows={2}
                            value={l.desc}
                            onChange={(e) => {
                              const newLocs = [...siteForm.comercial.locales];
                              newLocs[idx].desc = e.target.value;
                              setSiteForm({ ...siteForm, comercial: { ...siteForm.comercial, locales: newLocs } });
                            }}
                            className="w-full p-2 rounded-md text-xs"
                            style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", color: "var(--dash-text)" }}
                          />
                        </div>

                        <div>
                          <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>Fotografía del Local</Label>
                          <div className="mt-1">
                            <ImageUploader
                              value={l.img}
                              onChange={(url) => {
                                const newLocs = [...siteForm.comercial.locales];
                                newLocs[idx].img = url;
                                setSiteForm({ ...siteForm, comercial: { ...siteForm.comercial, locales: newLocs } });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 6. Distribución de Áreas */}
              <Card style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)" }}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2" style={{ color: "var(--dash-text)" }}>
                    <LayoutDashboard size={18} style={{ color: "var(--dash-accent)" }} /> 02 Distribución de Áreas
                  </CardTitle>
                  <CardDescription style={{ color: "var(--dash-muted)" }}>
                    Configure los textos, métricas y listados de locales de Planta Baja y Planta Alta.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">

                  {/* Header texts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[10px] uppercase tracking-wider block mb-1.5" style={{ color: "var(--dash-accent)" }}>Subtítulo (etiqueta dorada)</Label>
                      <Input
                        value={siteForm.comercial?.distribucion?.subtitulo || ""}
                        onChange={(e) => setSiteForm({ ...siteForm, comercial: { ...siteForm.comercial, distribucion: { ...siteForm.comercial.distribucion, subtitulo: e.target.value } } })}
                        className="h-8 text-xs"
                        style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase tracking-wider block mb-1.5" style={{ color: "var(--dash-accent)" }}>Título principal (usa \n para salto de línea)</Label>
                      <Input
                        value={siteForm.comercial?.distribucion?.titulo || ""}
                        onChange={(e) => setSiteForm({ ...siteForm, comercial: { ...siteForm.comercial, distribucion: { ...siteForm.comercial.distribucion, titulo: e.target.value } } })}
                        className="h-8 text-xs font-semibold"
                        style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                      />
                    </div>
                  </div>

                  {/* Opciones de Visibilidad de Subtotales */}
                  <div className="p-3 rounded-lg border flex items-center justify-between" style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)" }}>
                    <div>
                      <span className="text-xs font-semibold block" style={{ color: "var(--dash-text)" }}>
                        Mostrar Subtotales de Áreas
                      </span>
                      <span className="text-[11px]" style={{ color: "var(--dash-muted)" }}>
                        Si se desmarca, se ocultarán las filas de "Subtotal Planta Baja" y "Subtotal Planta Alta" en la página pública /comercial.
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      id="showSubtotalsToggle"
                      checked={siteForm.comercial?.distribucion?.showSubtotals !== false}
                      onChange={(e) =>
                        setSiteForm({
                          ...siteForm,
                          comercial: {
                            ...siteForm.comercial,
                            distribucion: {
                              ...siteForm.comercial.distribucion,
                              showSubtotals: e.target.checked,
                            },
                          },
                        })
                      }
                      className="h-4 w-4 accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  {/* Stats grid */}
                  <div>
                    <Label className="text-[10px] uppercase tracking-wider block mb-2" style={{ color: "var(--dash-muted)" }}>Métricas de resumen</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {(siteForm.comercial?.distribucion?.statsGrid || []).map((st, idx) => (
                        <div key={idx} className="p-3 rounded-lg border space-y-2" style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)" }}>
                          <Label className="text-[10px] font-bold" style={{ color: "var(--dash-accent)" }}>Métrica {idx + 1}</Label>
                          <div>
                            <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>Valor</Label>
                            <Input value={st.value} onChange={(e) => { const g = [...siteForm.comercial.distribucion.statsGrid]; g[idx] = { ...g[idx], value: e.target.value }; setSiteForm({ ...siteForm, comercial: { ...siteForm.comercial, distribucion: { ...siteForm.comercial.distribucion, statsGrid: g } } }); }} className="h-7 text-xs font-bold" style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }} />
                          </div>
                          <div>
                            <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>Unidad (ej: m², dejar vacío si no aplica)</Label>
                            <Input value={st.unit || ""} onChange={(e) => { const g = [...siteForm.comercial.distribucion.statsGrid]; g[idx] = { ...g[idx], unit: e.target.value }; setSiteForm({ ...siteForm, comercial: { ...siteForm.comercial, distribucion: { ...siteForm.comercial.distribucion, statsGrid: g } } }); }} className="h-7 text-xs" style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }} />
                          </div>
                          <div>
                            <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>Etiqueta</Label>
                            <Input value={st.label} onChange={(e) => { const g = [...siteForm.comercial.distribucion.statsGrid]; g[idx] = { ...g[idx], label: e.target.value }; setSiteForm({ ...siteForm, comercial: { ...siteForm.comercial, distribucion: { ...siteForm.comercial.distribucion, statsGrid: g } } }); }} className="h-7 text-xs" style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Planta Baja & Alta side by side */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Planta Baja */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 border-b pb-2" style={{ borderColor: "var(--dash-border)" }}>
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--dash-accent)" }}>Planta Baja</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>Encabezado</Label>
                          <Input value={siteForm.comercial?.distribucion?.plantaBaja?.label || ""} onChange={(e) => setSiteForm({ ...siteForm, comercial: { ...siteForm.comercial, distribucion: { ...siteForm.comercial.distribucion, plantaBaja: { ...siteForm.comercial.distribucion.plantaBaja, label: e.target.value } } } })} className="h-7 text-xs font-semibold" style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }} />
                        </div>
                        <div>
                          <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>Rango (ej: Locales del 1 al 5)</Label>
                          <Input value={siteForm.comercial?.distribucion?.plantaBaja?.rangLabel || ""} onChange={(e) => setSiteForm({ ...siteForm, comercial: { ...siteForm.comercial, distribucion: { ...siteForm.comercial.distribucion, plantaBaja: { ...siteForm.comercial.distribucion.plantaBaja, rangLabel: e.target.value } } } })} className="h-7 text-xs" style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        {(siteForm.comercial?.distribucion?.plantaBaja?.items || []).map((item, idx) => (
                          <div key={idx} className="grid grid-cols-2 gap-2 p-2 rounded-lg" style={{ background: "var(--dash-sidebar)", border: "1px solid var(--dash-border)" }}>
                            <div>
                              <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>Nombre</Label>
                              <Input value={item.name} onChange={(e) => { const items = [...siteForm.comercial.distribucion.plantaBaja.items]; items[idx] = { ...items[idx], name: e.target.value }; setSiteForm({ ...siteForm, comercial: { ...siteForm.comercial, distribucion: { ...siteForm.comercial.distribucion, plantaBaja: { ...siteForm.comercial.distribucion.plantaBaja, items } } } }); }} className="h-7 text-xs" style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }} />
                            </div>
                            <div>
                              <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>Área</Label>
                              <Input value={item.area} onChange={(e) => { const items = [...siteForm.comercial.distribucion.plantaBaja.items]; items[idx] = { ...items[idx], area: e.target.value }; setSiteForm({ ...siteForm, comercial: { ...siteForm.comercial, distribucion: { ...siteForm.comercial.distribucion, plantaBaja: { ...siteForm.comercial.distribucion.plantaBaja, items } } } }); }} className="h-7 text-xs" style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase tracking-wider" style={{ color: "var(--dash-muted)" }}>Subtotal</Label>
                        <Input value={siteForm.comercial?.distribucion?.plantaBaja?.subtotal || ""} onChange={(e) => setSiteForm({ ...siteForm, comercial: { ...siteForm.comercial, distribucion: { ...siteForm.comercial.distribucion, plantaBaja: { ...siteForm.comercial.distribucion.plantaBaja, subtotal: e.target.value } } } })} className="h-7 text-xs font-bold" style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)", color: "var(--dash-accent)" }} />
                      </div>
                    </div>

                    {/* Planta Alta */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 border-b pb-2" style={{ borderColor: "var(--dash-border)" }}>
                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--dash-accent)" }}>Planta Alta</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>Encabezado</Label>
                          <Input value={siteForm.comercial?.distribucion?.plantaAlta?.label || ""} onChange={(e) => setSiteForm({ ...siteForm, comercial: { ...siteForm.comercial, distribucion: { ...siteForm.comercial.distribucion, plantaAlta: { ...siteForm.comercial.distribucion.plantaAlta, label: e.target.value } } } })} className="h-7 text-xs font-semibold" style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }} />
                        </div>
                        <div>
                          <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>Rango (ej: Locales del 6 al 10)</Label>
                          <Input value={siteForm.comercial?.distribucion?.plantaAlta?.rangLabel || ""} onChange={(e) => setSiteForm({ ...siteForm, comercial: { ...siteForm.comercial, distribucion: { ...siteForm.comercial.distribucion, plantaAlta: { ...siteForm.comercial.distribucion.plantaAlta, rangLabel: e.target.value } } } })} className="h-7 text-xs" style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        {(siteForm.comercial?.distribucion?.plantaAlta?.items || []).map((item, idx) => (
                          <div key={idx} className="grid grid-cols-2 gap-2 p-2 rounded-lg" style={{ background: "var(--dash-sidebar)", border: "1px solid var(--dash-border)" }}>
                            <div>
                              <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>Nombre</Label>
                              <Input value={item.name} onChange={(e) => { const items = [...siteForm.comercial.distribucion.plantaAlta.items]; items[idx] = { ...items[idx], name: e.target.value }; setSiteForm({ ...siteForm, comercial: { ...siteForm.comercial, distribucion: { ...siteForm.comercial.distribucion, plantaAlta: { ...siteForm.comercial.distribucion.plantaAlta, items } } } }); }} className="h-7 text-xs" style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }} />
                            </div>
                            <div>
                              <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>Área</Label>
                              <Input value={item.area} onChange={(e) => { const items = [...siteForm.comercial.distribucion.plantaAlta.items]; items[idx] = { ...items[idx], area: e.target.value }; setSiteForm({ ...siteForm, comercial: { ...siteForm.comercial, distribucion: { ...siteForm.comercial.distribucion, plantaAlta: { ...siteForm.comercial.distribucion.plantaAlta, items } } } }); }} className="h-7 text-xs" style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div>
                        <Label className="text-[10px] uppercase tracking-wider" style={{ color: "var(--dash-muted)" }}>Subtotal</Label>
                        <Input value={siteForm.comercial?.distribucion?.plantaAlta?.subtotal || ""} onChange={(e) => setSiteForm({ ...siteForm, comercial: { ...siteForm.comercial, distribucion: { ...siteForm.comercial.distribucion, plantaAlta: { ...siteForm.comercial.distribucion.plantaAlta, subtotal: e.target.value } } } })} className="h-7 text-xs font-bold" style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)", color: "var(--dash-accent)" }} />
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>

              {/* Botón de Guardado General */}
              <div className="flex justify-end pt-3">
                <Button
                  onClick={() => handleSavePortalSection("comercial" as any)}
                  disabled={savingPortal}
                  className="gap-2 font-semibold"
                  style={{ background: "var(--dash-accent)", color: "#0D1810" }}
                >
                  {savingPortal ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
                  Guardar Cambios de Bucare Plaza
                </Button>
              </div>
            </TabsContent>

            {/* Sub-Pestaña: FAQ (Todo lo que necesitas saber...) */}
            <TabsContent value="p_faq" className="space-y-4 animate-fade-in">
              <Card style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)" }}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2" style={{ color: "var(--dash-text)" }}>
                    <Globe size={18} style={{ color: "var(--dash-accent)" }} /> Preguntas Frecuentes (FAQ Home)
                  </CardTitle>
                  <CardDescription style={{ color: "var(--dash-muted)" }}>
                    Edite el título principal de la sección "Todo lo que necesitas saber..." y los ítems numerados adyacentes del Home.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                      Título Principal de la Sección (Soporta saltos de línea con Enter)
                    </Label>
                    <textarea
                      rows={3}
                      value={siteForm.faq?.title || ""}
                      onChange={(e) =>
                        setSiteForm({
                          ...siteForm,
                          faq: { ...(siteForm.faq || { title: "", items: [] }), title: e.target.value },
                        })
                      }
                      className="mt-1 w-full p-2.5 rounded-md text-xs font-semibold"
                      style={{ background: "var(--dash-sidebar)", border: "1px solid var(--dash-border)", color: "var(--dash-text)" }}
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold block" style={{ color: "var(--dash-text)" }}>
                        Ítems Enumerados (Preguntas y Respuestas)
                      </Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const currentItems = siteForm.faq?.items || [];
                          const newItems = [...currentItems, { q: "Nueva Pregunta", a: "Respuesta descriptiva aquí." }];
                          setSiteForm({
                            ...siteForm,
                            faq: { ...(siteForm.faq || { title: "", items: [] }), items: newItems },
                          });
                        }}
                        className="gap-1 text-xs"
                      >
                        <Plus size={14} /> Añadir Pregunta
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {(siteForm.faq?.items || []).map((item, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl border border-white/10 space-y-3 relative"
                          style={{ background: "var(--dash-sidebar)" }}
                        >
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <span className="text-xs font-bold" style={{ color: "var(--dash-accent)" }}>
                              Ítem {String(idx + 1).padStart(2, "0")}
                            </span>
                            <div className="flex items-center gap-1">
                              {idx > 0 && (
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-muted-foreground hover:text-white"
                                  onClick={() => {
                                    const items = [...(siteForm.faq?.items || [])];
                                    const temp = items[idx];
                                    items[idx] = items[idx - 1];
                                    items[idx - 1] = temp;
                                    setSiteForm({
                                      ...siteForm,
                                      faq: { ...(siteForm.faq || { title: "", items: [] }), items },
                                    });
                                  }}
                                >
                                  ↑
                                </Button>
                              )}
                              {idx < (siteForm.faq?.items?.length || 0) - 1 && (
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-muted-foreground hover:text-white"
                                  onClick={() => {
                                    const items = [...(siteForm.faq?.items || [])];
                                    const temp = items[idx];
                                    items[idx] = items[idx + 1];
                                    items[idx + 1] = temp;
                                    setSiteForm({
                                      ...siteForm,
                                      faq: { ...(siteForm.faq || { title: "", items: [] }), items },
                                    });
                                  }}
                                >
                                  ↓
                                </Button>
                              )}
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                onClick={() => {
                                  const items = (siteForm.faq?.items || []).filter((_, i) => i !== idx);
                                  setSiteForm({
                                    ...siteForm,
                                    faq: { ...(siteForm.faq || { title: "", items: [] }), items },
                                  });
                                }}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>

                          <div>
                            <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>
                              Pregunta (Título del ítem)
                            </Label>
                            <Input
                              value={item.q}
                              onChange={(e) => {
                                const items = [...(siteForm.faq?.items || [])];
                                items[idx] = { ...items[idx], q: e.target.value };
                                setSiteForm({
                                  ...siteForm,
                                  faq: { ...(siteForm.faq || { title: "", items: [] }), items },
                                });
                              }}
                              className="mt-1 text-xs font-semibold"
                              style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                            />
                          </div>

                          <div>
                            <Label className="text-[10px]" style={{ color: "var(--dash-muted)" }}>
                              Respuesta (Descripción del ítem)
                            </Label>
                            <textarea
                              rows={2}
                              value={item.a}
                              onChange={(e) => {
                                const items = [...(siteForm.faq?.items || [])];
                                items[idx] = { ...items[idx], a: e.target.value };
                                setSiteForm({
                                  ...siteForm,
                                  faq: { ...(siteForm.faq || { title: "", items: [] }), items },
                                });
                              }}
                              className="mt-1 w-full p-2.5 rounded-md text-xs"
                              style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", color: "var(--dash-text)" }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <Button
                      onClick={() => handleSavePortalSection("faq")}
                      disabled={savingPortal}
                      className="gap-2 font-semibold"
                      style={{ background: "var(--dash-accent)", color: "#0D1810" }}
                    >
                      {savingPortal ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save size={16} />}
                      Guardar Sección FAQ Home
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>


        {/* ── Pestaña 3: Usuarios y Roles ── */}
        <TabsContent value="usuarios" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="gap-2 font-semibold shadow-lg transition-all"
              style={{
                background: "var(--dash-accent)",
                color: "#0D1810",
                border: "none",
              }}
            >
              <Plus size={16} /> Nuevo Usuario
            </Button>
          </div>

          {/* Tarjetas de Métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)" }}>
              <CardContent className="p-4 flex items-center gap-4">
                <div
                  className="p-3 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e" }}
                >
                  <Users size={22} />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--dash-muted)" }}>
                    Total Usuarios
                  </p>
                  <h3 className="text-2xl font-bold" style={{ color: "var(--dash-text)" }}>
                    {totalUsers}
                  </h3>
                </div>
              </CardContent>
            </Card>

            <Card style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)" }}>
              <CardContent className="p-4 flex items-center gap-4">
                <div
                  className="p-3 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(59,130,246,0.12)", color: "#3b82f6" }}
                >
                  <UserCheck size={22} />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--dash-muted)" }}>
                    Cuentas Activas
                  </p>
                  <h3 className="text-2xl font-bold" style={{ color: "var(--dash-text)" }}>
                    {activeUsersCount}
                  </h3>
                </div>
              </CardContent>
            </Card>

            <Card style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)" }}>
              <CardContent className="p-4 flex items-center gap-4">
                <div
                  className="p-3 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(168,85,247,0.12)", color: "#a855f7" }}
                >
                  <Shield size={22} />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--dash-muted)" }}>
                    Administradores
                  </p>
                  <h3 className="text-2xl font-bold" style={{ color: "var(--dash-text)" }}>
                    {adminUsersCount}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Barra de Búsqueda y Filtros */}
          <Card style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)" }}>
            <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--dash-muted)" }}
                />
                <Input
                  placeholder="Buscar por nombre, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 text-xs"
                  style={{
                    background: "var(--dash-sidebar)",
                    borderColor: "var(--dash-border)",
                    color: "var(--dash-text)",
                  }}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <div className="flex items-center gap-1 text-xs" style={{ color: "var(--dash-muted)" }}>
                  <Filter size={13} />
                  <span>Rol:</span>
                </div>
                <select
                  value={selectedRoleFilter}
                  onChange={(e) => setSelectedRoleFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                  style={{
                    background: "var(--dash-sidebar)",
                    border: "1px solid var(--dash-border)",
                    color: "var(--dash-text)",
                  }}
                >
                  <option value="TODOS">Todos los roles</option>
                  <option value="SUPERADMIN">Super Admin</option>
                  <option value="ADMIN">Administrador</option>
                  <option value="CONTADOR">Contabilidad</option>
                  <option value="VENTAS">Ventas</option>
                  <option value="PROYECTO">Proyecto</option>
                  <option value="CLIENTE">Cliente</option>
                </select>

                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                  style={{
                    background: "var(--dash-sidebar)",
                    border: "1px solid var(--dash-border)",
                    color: "var(--dash-text)",
                  }}
                >
                  <option value="TODOS">Todos los estados</option>
                  <option value="ACTIVOS">Solo Activos</option>
                  <option value="INACTIVOS">Solo Inactivos</option>
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchUsers}
                  className="p-2 h-8 w-8 ml-auto md:ml-0"
                  style={{ background: "transparent", borderColor: "var(--dash-border)" }}
                >
                  <RefreshCw size={14} style={{ color: "var(--dash-muted)" }} />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabla de usuarios */}
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mb-3" style={{ color: "var(--dash-accent)" }} />
              <p className="text-sm" style={{ color: "var(--dash-muted)" }}>
                Cargando directorio de usuarios...
              </p>
            </div>
          ) : error ? (
            <div
              className="p-4 rounded-xl flex items-center gap-3"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}
            >
              <AlertCircle size={20} />
              <span className="text-sm">{error}</span>
            </div>
          ) : (
            <Card style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)" }} className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead
                    style={{
                      background: "var(--dash-sidebar)",
                      borderBottom: "1px solid var(--dash-border)",
                      color: "var(--dash-muted)",
                    }}
                  >
                    <tr>
                      <th className="p-3.5 font-semibold">Usuario</th>
                      <th className="p-3.5 font-semibold">Contacto</th>
                      <th className="p-3.5 font-semibold">Rol Asignado</th>
                      <th className="p-3.5 font-semibold">Estado</th>
                      <th className="p-3.5 font-semibold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center" style={{ color: "var(--dash-muted)" }}>
                          No se encontraron usuarios coincidiendo con los criterios seleccionados.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const roleMeta = ROLES_INFO[u.role] || ROLES_INFO.CLIENTE;
                        const isSelf = currentUser?.email === u.email;

                        return (
                          <tr
                            key={u.id}
                            className="transition-colors hover:bg-white/[0.02]"
                            style={{ borderColor: "var(--dash-border)" }}
                          >
                            <td className="p-3.5">
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border border-white/10">
                                  <AvatarFallback
                                    style={{
                                      background: roleMeta.bg,
                                      color: roleMeta.color,
                                      fontWeight: 700,
                                    }}
                                  >
                                    {getInitials(u.fullName || u.email)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col min-w-0">
                                  <span className="font-semibold truncate" style={{ color: "var(--dash-text)" }}>
                                    {u.fullName || "Sin nombre registrado"}
                                    {isSelf && (
                                      <span
                                        className="ml-2 text-[10px] px-1.5 py-0.5 rounded font-mono"
                                        style={{ background: "var(--dash-accent-dim)", color: "var(--dash-accent)" }}
                                      >
                                        Tú
                                      </span>
                                    )}
                                  </span>
                                  <span className="text-[11px] truncate" style={{ color: "var(--dash-muted)" }}>
                                    {u.email}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="p-3.5">
                              <div className="flex flex-col gap-1 text-[11px]" style={{ color: "var(--dash-muted)" }}>
                                {u.phoneNumber ? (
                                  <span className="flex items-center gap-1">
                                    <Phone size={11} /> {u.phoneNumber}
                                  </span>
                                ) : (
                                  <span className="italic opacity-60">Sin teléfono</span>
                                )}
                              </div>
                            </td>

                            <td className="p-3.5">
                              <Badge
                                variant="outline"
                                className="font-semibold text-[11px] border"
                                style={{
                                  background: roleMeta.bg,
                                  color: roleMeta.color,
                                  borderColor: roleMeta.color + "40",
                                }}
                              >
                                {roleMeta.label}
                              </Badge>
                            </td>

                            <td className="p-3.5">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="h-2 w-2 rounded-full"
                                  style={{ background: u.isActive ? "#22c55e" : "#ef4444" }}
                                />
                                <span
                                  className="font-medium"
                                  style={{ color: u.isActive ? "var(--dash-text)" : "var(--dash-muted)" }}
                                >
                                  {u.isActive ? "Activo" : "Inactivo"}
                                </span>
                              </div>
                            </td>

                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditModal(u)}
                                  className="h-8 px-2 text-xs gap-1"
                                  style={{ color: "var(--dash-accent)" }}
                                >
                                  <Pencil size={13} /> Modificar Rol
                                </Button>

                                {!isSelf && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleToggleStatus(u)}
                                    className="h-8 px-2 text-xs gap-1"
                                    style={{ color: u.isActive ? "#ef4444" : "#22c55e" }}
                                  >
                                    {u.isActive ? (
                                      <>
                                        <Ban size={13} /> Desactivar
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle2 size={13} /> Activar
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* ── Pestaña 3: Matriz de Permisos ── */}
        <TabsContent value="matriz" className="space-y-4">
          <Card style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)" }}>
            <CardHeader>
              <CardTitle className="text-base" style={{ color: "var(--dash-text)" }}>
                Matriz de Control de Acceso (RBAC)
              </CardTitle>
              <CardDescription style={{ color: "var(--dash-muted)" }}>
                Detalle de capacidades y privilegios otorgados según el rol del usuario en la plataforma Bucare.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--dash-border)" }}>
                      <th className="p-3 font-semibold" style={{ color: "var(--dash-text)" }}>
                        Módulo / Funcionalidad
                      </th>
                      {Object.keys(ROLES_INFO).map((rKey) => (
                        <th key={rKey} className="p-3 text-center font-semibold" style={{ color: ROLES_INFO[rKey].color }}>
                          {ROLES_INFO[rKey].label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {PERMISSIONS_MATRIX.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-medium" style={{ color: "var(--dash-text)" }}>
                          {item.feature}
                        </td>
                        {Object.keys(ROLES_INFO).map((rKey) => {
                          const hasAccess = item.roles.includes(rKey);
                          return (
                            <td key={rKey} className="p-3 text-center">
                              {hasAccess ? (
                                <span
                                  className="inline-flex items-center justify-center h-6 w-6 rounded-full"
                                  style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e" }}
                                >
                                  <Check size={14} />
                                </span>
                              ) : (
                                <span
                                  className="inline-flex items-center justify-center h-6 w-6 rounded-full opacity-30"
                                  style={{ background: "rgba(255,255,255,0.05)", color: "var(--dash-muted)" }}
                                >
                                  -
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Modal: Registrar Nuevo Usuario ── */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent
          className="sm:max-w-[500px]"
          style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: "var(--dash-text)" }}>
              <UserCheck size={18} style={{ color: "var(--dash-accent)" }} /> Registrar Nuevo Usuario
            </DialogTitle>
            <DialogDescription style={{ color: "var(--dash-muted)" }}>
              Cree un nuevo usuario en la plataforma con el rol deseado.
            </DialogDescription>
          </DialogHeader>

          {createError && (
            <div
              className="p-3 rounded-lg text-xs flex items-center gap-2"
              style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}
            >
              <AlertCircle size={14} />
              <span>{createError}</span>
            </div>
          )}

          <form onSubmit={handleCreateSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                  Nombre Completo
                </Label>
                <Input
                  required
                  placeholder="Ej. María Pérez"
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                  className="mt-1 text-xs"
                  style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                />
              </div>

              <div>
                <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                  Correo Electrónico
                </Label>
                <Input
                  required
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="mt-1 text-xs"
                  style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                    Teléfono
                  </Label>
                  <Input
                    required
                    placeholder="+58 414 1234567"
                    value={createForm.phoneNumber}
                    onChange={(e) => setCreateForm({ ...createForm, phoneNumber: e.target.value })}
                    className="mt-1 text-xs"
                    style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                  />
                </div>

                <div>
                  <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                    Fecha Nacimiento
                  </Label>
                  <Input
                    required
                    type="date"
                    value={createForm.birthDate}
                    onChange={(e) => setCreateForm({ ...createForm, birthDate: e.target.value })}
                    className="mt-1 text-xs"
                    style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                  Contraseña Inicial
                </Label>
                <Input
                  required
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="mt-1 text-xs"
                  style={{ background: "var(--dash-card)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
                />
              </div>

              <div>
                <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                  Rol en el Sistema
                </Label>
                <select
                  value={createForm.role}
                  onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                  className="w-full mt-1 p-2 rounded-md text-xs font-medium cursor-pointer"
                  style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", color: "var(--dash-text)" }}
                >
                  <option value="VENTAS">Ventas</option>
                  <option value="CONTADOR">Contabilidad</option>
                  <option value="PROYECTO">Proyecto / Obra</option>
                  <option value="ADMIN">Administrador</option>
                  <option value="SUPERADMIN">Super Admin</option>
                  <option value="CLIENTE">Cliente</option>
                </select>
              </div>
            </div>

            <DialogFooter className="pt-3 border-t border-white/10">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreateOpen(false)}
                className="text-xs"
                style={{ color: "var(--dash-muted)" }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createLoading}
                className="text-xs font-semibold"
                style={{ background: "var(--dash-accent)", color: "#0D1810" }}
              >
                {createLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar Usuario"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Editar Rol / Estado de Usuario ── */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent
          className="sm:max-w-[420px]"
          style={{ background: "var(--dash-sidebar)", borderColor: "var(--dash-border)", color: "var(--dash-text)" }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: "var(--dash-text)" }}>
              <Pencil size={18} style={{ color: "var(--dash-accent)" }} /> Modificar Acceso y Rol
            </DialogTitle>
            <DialogDescription style={{ color: "var(--dash-muted)" }}>
              Actualice los permisos para <strong className="text-white">{selectedUser?.email}</strong>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div>
              <Label className="text-xs" style={{ color: "var(--dash-muted)" }}>
                Asignar Rol
              </Label>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="w-full mt-1 p-2 rounded-md text-xs font-medium cursor-pointer"
                style={{ background: "var(--dash-card)", border: "1px solid var(--dash-border)", color: "var(--dash-text)" }}
              >
                <option value="SUPERADMIN">Super Admin</option>
                <option value="ADMIN">Administrador</option>
                <option value="CONTADOR">Contabilidad</option>
                <option value="VENTAS">Ventas</option>
                <option value="PROYECTO">Proyecto / Obra</option>
                <option value="CLIENTE">Cliente</option>
              </select>
              <p className="text-[11px] mt-1.5" style={{ color: "var(--dash-muted)" }}>
                {ROLES_INFO[editRole]?.desc}
              </p>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-white/10" style={{ background: "var(--dash-card)" }}>
              <div>
                <span className="text-xs font-semibold block" style={{ color: "var(--dash-text)" }}>
                  Estado de la Cuenta
                </span>
                <span className="text-[11px]" style={{ color: "var(--dash-muted)" }}>
                  {editIsActive ? "El usuario puede iniciar sesión" : "Acceso bloqueado al sistema"}
                </span>
              </div>
              <input
                type="checkbox"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
                className="h-4 w-4 accent-emerald-500 cursor-pointer"
              />
            </div>

            <DialogFooter className="pt-3 border-t border-white/10">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditOpen(false)}
                className="text-xs"
                style={{ color: "var(--dash-muted)" }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={editLoading}
                className="text-xs font-semibold"
                style={{ background: "var(--dash-accent)", color: "#0D1810" }}
              >
                {editLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Actualizar Cambios"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
