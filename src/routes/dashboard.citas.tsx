import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, AlertCircle, CalendarDays, Building2, Trash2, Clock, RefreshCw, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/dashboard/citas")({
  component: DashboardCitas,
});

interface Cita {
  id: string;
  clienteId: string;
  fecha: string;
  tipoPropiedad: string;
  estado: string;
  notas?: string;
}

const API_BASE = "/api/v1";

function DashboardCitas() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCitas = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/citas`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Error fetching citas");
      const json = await res.json();
      setCitas(json.data ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCitas();
    const interval = setInterval(fetchCitas, 6000);
    return () => clearInterval(interval);
  }, [fetchCitas]);

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_BASE}/citas/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCitas();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12">
      <div className="flex justify-between items-center border-b border-border/40 pb-5">
        <div>
          <h1 className="text-2xl font-display font-bold text-primary">Gestión de Citas</h1>
          <p className="text-sm text-muted-foreground">Citas y visitas agendadas en vivo por los clientes y el Asistente IA.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchCitas} className="text-xs h-9">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Actualizar
          </Button>
        </div>
      </div>

      <Card className="shadow-2xs">
        <CardContent className="p-0">
          {loading && citas.length === 0 ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>
          ) : error ? (
            <div className="p-12 text-center text-destructive">{error}</div>
          ) : citas.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">No hay citas registradas.</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/20 text-[11px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3.5 px-6">Fecha &amp; Hora</th>
                  <th className="py-3.5 px-6">Propiedad</th>
                  <th className="py-3.5 px-6">Detalles / Notas de Cita</th>
                  <th className="py-3.5 px-6">Estado</th>
                  <th className="py-3.5 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {citas.map((cita) => {
                  const dateObj = new Date(cita.fecha);
                  const formattedDate = dateObj.toLocaleDateString("es-ES", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  });
                  const formattedTime = dateObj.toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr key={cita.id} className="hover:bg-muted/10 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 font-medium text-foreground">
                          <CalendarDays className="w-4 h-4 text-primary" />
                          <span>{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formattedTime}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <Badge
                          variant="outline"
                          className={
                            cita.tipoPropiedad === "LOCAL"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          }
                        >
                          <Building2 className="w-3 h-3 mr-1" />
                          {cita.tipoPropiedad === "LOCAL" ? "Bucare Plaza (Local)" : "Bucare Suite (Apartamento)"}
                        </Badge>
                      </td>

                      <td className="py-4 px-6 max-w-md">
                        <div className="text-xs text-foreground/90 whitespace-pre-line leading-relaxed bg-muted/20 p-2.5 rounded-md border border-border/40 font-sans">
                          {cita.notas || "Sin observaciones adicionales"}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <Badge variant="outline" className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                          {cita.estado}
                        </Badge>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(cita.id)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
