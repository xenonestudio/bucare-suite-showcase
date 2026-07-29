import { createFileRoute } from "@tanstack/react-router";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line
} from "recharts";
import { Users, CreditCard, Activity, TrendingUp, Calendar, ChevronRight, CheckCircle2, Clock } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
});

const dataTendencias = [
  { name: "Ene", pacientes: 400, ingresos: 2400 },
  { name: "Feb", pacientes: 300, ingresos: 1398 },
  { name: "Mar", pacientes: 200, ingresos: 9800 },
  { name: "Abr", pacientes: 278, ingresos: 3908 },
  { name: "May", pacientes: 189, ingresos: 4800 },
  { name: "Jun", pacientes: 239, ingresos: 3800 },
  { name: "Jul", pacientes: 349, ingresos: 4300 },
];

const proximasCitas = [
  { id: 1, paciente: "Maria Rodriguez", doctor: "Dr. Carlos Silva", fecha: "Hoy, 10:30 AM", estado: "Confirmado", tipo: "General" },
  { id: 2, paciente: "Juan Perez", doctor: "Dra. Ana Gomez", fecha: "Hoy, 11:15 AM", estado: "En Sala", tipo: "Cardiología" },
  { id: 3, paciente: "Elena Martinez", doctor: "Dr. Carlos Silva", fecha: "Hoy, 02:00 PM", estado: "Pendiente", tipo: "Odontología" },
  { id: 4, paciente: "Luis Torres", doctor: "Dra. Sofia Ruiz", fecha: "Mañana, 09:00 AM", estado: "Pendiente", tipo: "Pediatría" },
];

function DashboardIndex() {
  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-primary">
            Resumen General
          </h1>
          <p className="text-muted-foreground mt-1">
            Bienvenido a Bucare Suite. Aquí tienes el estado actual.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-border text-foreground hover:bg-muted">
            <Calendar className="mr-2 h-4 w-4" />
            Filtrar por fecha
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            Nueva Consulta
          </Button>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border-border/60 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ingresos del Mes
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">$45,231.89</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center text-emerald-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              +20.1% desde el mes pasado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-border/60 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pacientes Nuevos
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center">
              <Users className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">+2,350</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <span className="text-emerald-600 mr-1">+180</span> esta semana
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-border/60 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Consultas Activas
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">12</div>
            <p className="text-xs text-muted-foreground mt-1">
              En progreso ahora mismo
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-border/60 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Satisfacción
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">98.2%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Basado en encuestas recientes
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart */}
        <Card className="col-span-1 lg:col-span-4 bg-white border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-primary">Tendencia de Pacientes</CardTitle>
            <CardDescription>
              Evolución de pacientes atendidos en los últimos 7 meses.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataTendencias} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFEBE1" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#8B9983', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#8B9983', fontSize: 12 }}
                  />
                  <RechartsTooltip 
                    cursor={{ fill: '#F5F2EC' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #A39B93', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar 
                    dataKey="pacientes" 
                    fill="#213B26" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Table / List */}
        <Card className="col-span-1 lg:col-span-3 bg-white border-border/60 shadow-sm flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg text-primary">Próximas Citas</CardTitle>
              <CardDescription>Para el día de hoy</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-primary h-8 px-2">
              Ver todas <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="space-y-4 mt-2">
              {proximasCitas.map((cita) => (
                <div key={cita.id} className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarFallback className="bg-muted text-primary font-medium text-xs">
                        {cita.paciente.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-foreground leading-none">{cita.paciente}</p>
                      <div className="flex items-center text-xs text-muted-foreground mt-1.5">
                        <Clock className="mr-1 h-3 w-3" />
                        {cita.fecha} • {cita.tipo}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Badge 
                      variant="outline" 
                      className={
                        cita.estado === "En Sala" ? "bg-accent/10 text-accent-foreground border-accent/20" :
                        cita.estado === "Confirmado" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        "bg-muted text-muted-foreground border-border"
                      }
                    >
                      {cita.estado}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
