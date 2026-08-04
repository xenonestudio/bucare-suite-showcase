import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { User, ShieldCheck, Mail, Phone, CalendarDays, Loader2, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/perfil")({
  component: PerfilView,
});

const API_BASE = "https://bucaredemo.ddns.net/api/v1";

function PerfilView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    birthDate: ""
  });
  const [message, setMessage] = useState({ text: "", type: "" });

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
            birthDate: json.data.birthDate || ""
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
        body: JSON.stringify(formData)
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setMessage({ text: "Perfil actualizado correctamente.", type: "success" });
      } else {
        setMessage({ text: json.message || "Error al actualizar.", type: "error" });
      }
    } catch (e) {
      setMessage({ text: "Error de red.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12 max-w-3xl mx-auto w-full">
      <div className="flex justify-between items-center border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-display font-bold text-primary">Mi Perfil</h1>
          <p className="text-sm text-muted-foreground">Gestiona tu información personal y de contacto.</p>
        </div>
      </div>

      <Card className="shadow-2xs">
        <CardHeader className="bg-muted/20 border-b border-border/40">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center shadow-sm">
              <span className="text-white font-display font-bold text-2xl">
                {userData?.email?.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <CardTitle className="text-xl">{userData?.fullName || "Usuario"}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px]">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  {userData?.role}
                </Badge>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 flex flex-col gap-5">
          <div className="grid gap-2">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" /> Correo Electrónico (Solo Lectura)
            </label>
            <Input value={userData?.email || ""} disabled className="bg-muted/50" />
          </div>
          
          <div className="grid gap-2">
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Nombre Completo
            </label>
            <Input 
              value={formData.fullName} 
              onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
              placeholder="Ej. Juan Pérez" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="grid gap-2">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Teléfono
              </label>
              <Input 
                value={formData.phoneNumber} 
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} 
                placeholder="Ej. +1 234 567 8900" 
              />
            </div>
            
            <div className="grid gap-2">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" /> Fecha de Nacimiento
              </label>
              <Input 
                type="date"
                value={formData.birthDate} 
                onChange={(e) => setFormData({...formData, birthDate: e.target.value})} 
              />
            </div>
          </div>

          {message.text && (
            <div className={`p-3 rounded-md text-sm ${message.type === "success" ? "bg-emerald-50 text-emerald-600" : "bg-destructive/10 text-destructive"}`}>
              {message.text}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-border/40 mt-2">
            <Button onClick={handleSave} disabled={saving} className="bg-primary text-white hover:bg-primary/90">
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Guardar Cambios
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
