import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  User, ShieldCheck, Mail, Phone, CalendarDays, Loader2, Save,
  Camera, Lock, CheckCircle2, AlertCircle, Upload
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/dashboard/perfil")({
  component: PerfilView,
});

const API_BASE = "/api/v1";

function PerfilView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    birthDate: "",
    avatarUrl: "",
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "" }>({ text: "", type: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const token = localStorage.getItem("token");
        if (!storedUser.id) return;

        const res = await fetch(`${API_BASE}/users/${storedUser.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) {
          setUserData(json.data);
          setFormData({
            fullName: json.data.fullName || "",
            phoneNumber: json.data.phoneNumber || "",
            birthDate: json.data.birthDate || "",
            avatarUrl: json.data.avatarUrl || "",
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleAvatarFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setMessage({ text: "La imagen excede el límite de 10MB.", type: "error" });
      return;
    }

    setUploadingAvatar(true);
    setMessage({ text: "", type: "" });

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_BASE}/upload`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ image: base64, fileName: `avatar_${userData?.id || "user"}` }),
        });

        const json = await res.json();
        if (res.ok && json.success && json.data?.url) {
          const uploadedUrl = json.data.url;
          setFormData((prev) => ({ ...prev, avatarUrl: uploadedUrl }));
          setMessage({ text: "Foto de perfil cargada. Recuerda guardar los cambios.", type: "success" });
        } else {
          setMessage({ text: json.message || "Error al subir la imagen.", type: "error" });
        }
        setUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Avatar upload error:", err);
      setMessage({ text: "Error de conexión al subir la imagen.", type: "error" });
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: "", type: "" });

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/users/${userData.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          birthDate: formData.birthDate,
          avatarUrl: formData.avatarUrl,
        })
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setUserData(json.data);
        // Sync updated user object into localStorage so UI components update immediately
        const existingStored = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUserLocal = {
          ...existingStored,
          fullName: json.data.fullName,
          avatarUrl: json.data.avatarUrl,
          phoneNumber: json.data.phoneNumber,
        };
        localStorage.setItem("user", JSON.stringify(updatedUserLocal));

        setMessage({ text: "Perfil y avatar actualizados con éxito.", type: "success" });
      } else {
        setMessage({ text: json.message || "Error al actualizar la información.", type: "error" });
      }
    } catch (e) {
      setMessage({ text: "Error de red al intentar guardar.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin text-accent w-8 h-8" />
      </div>
    );
  }

  const initials = userData?.fullName
    ? userData.fullName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
    : userData?.email?.substring(0, 2).toUpperCase() || "U";

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12 max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-5 gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-accent">
            Configuración de Cuenta
          </span>
          <h1 className="text-2xl font-display font-bold text-white mt-1">
            Mi Perfil de Usuario
          </h1>
          <p className="text-xs text-neutral-400">
            Actualiza tus datos personales y tu fotografía de avatar.
          </p>
        </div>
      </div>

      {/* Main Profile Card */}
      <Card className="bg-[#121212] border-white/10 shadow-xl overflow-hidden">
        {/* Header Avatar Banner */}
        <CardHeader className="bg-gradient-to-r from-neutral-900 to-neutral-950 border-b border-white/10 p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar container with upload hover */}
            <div className="relative group flex-shrink-0">
              <Avatar className="h-24 w-24 border-2 border-accent/40 shadow-lg bg-neutral-900">
                <AvatarImage src={formData.avatarUrl} alt={userData?.fullName || "Avatar"} className="object-cover" />
                <AvatarFallback className="bg-accent text-neutral-950 font-display font-bold text-2xl">
                  {initials}
                </AvatarFallback>
              </Avatar>

              {/* Upload Overlay Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 rounded-full bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                title="Cambiar foto de perfil"
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-6 h-6 animate-spin text-accent" />
                ) : (
                  <>
                    <Camera className="w-5 h-5 text-accent" />
                    <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Cambiar</span>
                  </>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFileSelect}
              />
            </div>

            {/* User Meta Info */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left flex-1">
              <CardTitle className="text-2xl font-bold text-white font-display">
                {formData.fullName || userData?.fullName || "Usuario Bucare"}
              </CardTitle>
              <p className="text-xs text-neutral-400 mt-1">{userData?.email}</p>

              <div className="flex items-center gap-2 mt-3 flex-wrap justify-center sm:justify-start">
                <Badge variant="outline" className="bg-accent/15 text-accent border-accent/30 text-xs font-semibold px-3 py-1">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                  Rol: {userData?.role || "CLIENTE"}
                </Badge>
                {formData.avatarUrl && (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[11px] px-2.5 py-0.5">
                    Avatar personalizado
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 flex flex-col gap-6 text-white">
          {/* Email field (Read Only) */}
          <div className="grid gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-accent" /> Correo Electrónico (Registrado)
            </label>
            <Input
              value={userData?.email || ""}
              disabled
              className="bg-neutral-900/60 border-white/10 text-neutral-400 cursor-not-allowed"
            />
            <span className="text-[11px] text-neutral-500">
              El correo está vinculado a tu cuenta y no se puede modificar directamente.
            </span>
          </div>

          {/* Full Name */}
          <div className="grid gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-accent" /> Nombre Completo
            </label>
            <Input
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Ej. Juan Pérez"
              className="bg-neutral-900 border-white/15 text-white placeholder:text-neutral-500 focus:border-accent"
            />
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="grid gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-accent" /> Teléfono de Contacto
              </label>
              <Input
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="Ej. +58 424 123 4567"
                className="bg-neutral-900 border-white/15 text-white placeholder:text-neutral-500 focus:border-accent"
              />
            </div>

            <div className="grid gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-accent" /> Fecha de Nacimiento
              </label>
              <Input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="bg-neutral-900 border-white/15 text-white focus:border-accent"
              />
            </div>
          </div>

          {/* Feedback Message */}
          {message.text && (
            <div
              className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 border ${
                message.type === "success"
                  ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
                  : "bg-red-950/40 text-red-400 border-red-500/30"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="border-white/15 bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold"
            >
              <Upload className="w-3.5 h-3.5 mr-2 text-accent" />
              Subir Nueva Foto
            </Button>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-accent text-neutral-950 hover:bg-accent/90 font-bold text-xs uppercase tracking-wider px-6 shadow-md"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Guardar Cambios
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
