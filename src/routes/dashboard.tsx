import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { LogOut, LayoutDashboard, Users, FileText, Bell, Search, Settings } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    // Check if user is authenticated (simple localStorage check for now)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        throw redirect({
          to: "/login",
        });
      }
    }
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container flex h-16 items-center px-4 md:px-6">
          <div className="flex items-center gap-6 mr-6">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg leading-none">B</span>
              </div>
              <span className="hidden font-bold sm:inline-block text-primary">
                Bucare Suite
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link
              to="/dashboard"
              className="transition-colors hover:text-foreground/80 text-foreground"
            >
              Dashboard
            </Link>
            <Link
              to="/dashboard"
              className="transition-colors hover:text-foreground/80 text-muted-foreground"
            >
              Usuarios
            </Link>
            <Link
              to="/dashboard"
              className="transition-colors hover:text-foreground/80 text-muted-foreground"
            >
              Reportes
            </Link>
          </nav>

          <div className="flex flex-1 items-center justify-between gap-4 md:justify-end">
            <div className="w-full max-w-sm flex-1 md:w-auto md:flex-none">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Buscar..."
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 pl-8 md:w-[300px]"
                />
              </div>
            </div>
            
            <nav className="flex items-center gap-2">
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent/20 hover:text-accent-foreground h-9 w-9">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="sr-only">Notificaciones</span>
              </button>
              
              <button 
                onClick={handleLogout}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-destructive/10 hover:text-destructive h-9 w-9"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4 text-muted-foreground" />
                <span className="sr-only">Cerrar sesión</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container px-4 md:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
