import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2, AlertCircle, CalendarDays, Building2, Trash2, Clock, RefreshCw, FileText, CheckCircle2, Clock4, Users } from "lucide-react";
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  const totalCitas = citas.length;
  const pendientes = citas.filter(c => c.estado === 'PENDIENTE').length;
  const confirmadas = citas.filter(c => c.estado === 'CONFIRMADO').length;

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12 w-full text-[#F0EDE8]">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center border-b border-[rgba(255,255,255,0.08)] pb-5 gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-[#E1B668]">Gestión de Citas</h1>
          <p className="text-sm text-gray-400">Citas y visitas agendadas en vivo por los clientes y el Asistente IA.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={fetchCitas} 
            className="text-xs h-9 w-full md:w-auto border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.08)] text-[#F0EDE8]"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Actualizar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] rounded-xl">
          <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-400">Total Citas</CardTitle>
            <CalendarDays className="w-4 h-4 text-[#E1B668]" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-[#F0EDE8]">{totalCitas}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] rounded-xl">
          <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-400">Pendientes</CardTitle>
            <Clock4 className="w-4 h-4 text-amber-400" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-[#F0EDE8]">{pendientes}</div>
          </CardContent>
        </Card>

        <Card className="bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] rounded-xl">
          <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-400">Confirmadas</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-[#4ADE80]" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-[#F0EDE8]">{confirmadas}</div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-xl shadow-2xl overflow-hidden">
        {loading && citas.length === 0 ? (
          <div className="p-16 flex justify-center"><Loader2 className="animate-spin text-[#E1B668]" /></div>
        ) : error ? (
          <div className="p-16 text-center text-[#e05555] bg-[rgba(224,85,85,0.05)] border border-[#e05555]/20 m-4 rounded-xl">{error}</div>
        ) : citas.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center text-gray-400">
            <div className="bg-[rgba(255,255,255,0.03)] p-4 rounded-full mb-4 border border-[rgba(255,255,255,0.05)]">
              <CalendarDays className="w-8 h-8 text-[#E1B668]/60" />
            </div>
            <p className="text-lg font-medium text-[#F0EDE8]">No hay citas registradas</p>
            <p className="text-sm mt-1">Las citas agendadas aparecerán aquí.</p>
          </div>
        ) : isMobile ? (
          <div className="flex flex-col p-4 gap-4">
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
                <div key={cita.id} className="flex flex-col gap-3 bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 font-medium text-[#F0EDE8]">
                        <CalendarDays className="w-4 h-4 text-[#E1B668]" />
                        <span>{formattedDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formattedTime}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider ${cita.estado === 'CONFIRMADO' ? 'bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/30' : cita.estado === 'PENDIENTE' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-[rgba(255,255,255,0.1)] text-[#F0EDE8] border-[rgba(255,255,255,0.2)]'}`}>
                      {cita.estado}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <Badge
                      variant="outline"
                      className={`
                        ${cita.tipoPropiedad === "LOCAL"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }
                      `}
                    >
                      <Building2 className="w-3 h-3 mr-1" />
                      {cita.tipoPropiedad === "LOCAL" ? "Bucare Plaza (Local)" : "Bucare Suite"}
                    </Badge>
                  </div>

                  <div className="text-xs text-gray-300 whitespace-pre-line leading-relaxed bg-[rgba(0,0,0,0.2)] p-3 rounded-lg border border-[rgba(255,255,255,0.04)] font-sans mt-1">
                    {cita.notas || "Sin observaciones adicionales"}
                  </div>
                  
                  <div className="flex justify-end mt-2 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                     <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(cita.id)}
                        className="text-[#e05555] hover:bg-[rgba(224,85,85,0.1)] hover:text-[#e05555] h-8 text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Eliminar
                      </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[rgba(0,0,0,0.2)] text-[11px] uppercase tracking-wider text-gray-400 border-b border-[rgba(255,255,255,0.08)]">
                <tr>
                  <th className="py-4 px-6 font-semibold">Fecha &amp; Hora</th>
                  <th className="py-4 px-6 font-semibold">Propiedad</th>
                  <th className="py-4 px-6 font-semibold">Detalles / Notas</th>
                  <th className="py-4 px-6 font-semibold">Estado</th>
                  <th className="py-4 px-6 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
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
                    <tr key={cita.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 font-medium text-[#F0EDE8]">
                          <CalendarDays className="w-4 h-4 text-[#E1B668]" />
                          <span>{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
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
                          {cita.tipoPropiedad === "LOCAL" ? "Bucare Plaza (Local)" : "Bucare Suite"}
                        </Badge>
                      </td>

                      <td className="py-4 px-6 max-w-sm whitespace-normal">
                        <div className="text-xs text-gray-300 whitespace-pre-line leading-relaxed bg-[rgba(0,0,0,0.2)] p-2.5 rounded-lg border border-[rgba(255,255,255,0.04)] font-sans">
                          {cita.notas || "Sin observaciones adicionales"}
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider ${cita.estado === 'CONFIRMADO' ? 'bg-[#4ADE80]/10 text-[#4ADE80] border-[#4ADE80]/30' : cita.estado === 'PENDIENTE' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-[rgba(255,255,255,0.1)] text-[#F0EDE8] border-[rgba(255,255,255,0.2)]'}`}>
                          {cita.estado}
                        </Badge>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(cita.id)}
                          className="text-[#e05555] hover:bg-[rgba(224,85,85,0.1)] hover:text-[#e05555] transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
