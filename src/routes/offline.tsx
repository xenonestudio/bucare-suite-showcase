import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { WifiOff, AlertCircle, Eye, EyeOff, Terminal, Lock, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getApiUrl } from "@/lib/api";

export const Route = createFileRoute("/offline")({
  head: () => ({
    meta: [
      { title: "Servicio Desconectado — Bucare Suite" },
      { name: "description", content: "El sistema se encuentra fuera de línea temporalmente debido a problemas de comunicación con el servidor." },
    ],
  }),
  component: OfflinePage,
});

const PASSWORD_HASH = "61aa8670c8a4f45cbc8bec8562fc1b8a544fad1a027f7aee8028214aef044c61";
const KEY = "#198923AC782lsroosevelt##";

function OfflinePage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [decryptedLogs, setDecryptedLogs] = useState<any[]>([]);
  const [checking, setChecking] = useState(false);

  // Reconnection state
  const [countdown, setCountdown] = useState(10);
  const [currentDelay, setCurrentDelay] = useState(10);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isOnline, setIsOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const fromPath = searchParams?.get("from") || "/";

  // Monitor network status
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnlineStatus = () => setIsOnline(true);
    const handleOfflineStatus = () => setIsOnline(false);

    window.addEventListener("online", handleOnlineStatus);
    window.addEventListener("offline", handleOfflineStatus);

    return () => {
      window.removeEventListener("online", handleOnlineStatus);
      window.removeEventListener("offline", handleOfflineStatus);
    };
  }, []);

  const handleRetry = () => {
    window.location.href = fromPath;
  };

  const attemptReconnection = async () => {
    setIsVerifying(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      
      let success = false;
      try {
        // Try /health check first
        const response = await fetch(getApiUrl("/health"), {
          method: "GET",
          signal: controller.signal,
        });
        if (response.status < 500) {
          success = true;
        }
      } catch (err) {
        // Fallback to / base endpoint check
        const response = await fetch(getApiUrl("/"), {
          method: "GET",
          signal: controller.signal,
        });
        if (response.status < 500) {
          success = true;
        }
      }

      clearTimeout(timeoutId);
      
      if (success) {
        window.location.href = fromPath;
        return;
      }
    } catch (e) {
      console.log("Auto-reconnection check failed:", e);
    }
    
    setIsVerifying(false);
    // Exponential backoff: double the delay up to 60s
    const nextDelay = Math.min(currentDelay * 2, 60);
    setCurrentDelay(nextDelay);
    setCountdown(nextDelay);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isVerifying) return;
    if (!isOnline) return; // Wait until local internet is online

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          attemptReconnection();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVerifying, isOnline, currentDelay]);

  const verifyPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setChecking(true);

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

      if (hashHex === PASSWORD_HASH) {
        setIsUnlocked(true);
        const rawLogs = localStorage.getItem("backend_offline_logs");
        if (rawLogs) {
          try {
            let decrypted = "";
            let raw = window.atob(rawLogs);
            for (let i = 0; i < raw.length; i++) {
              decrypted += String.fromCharCode(raw.charCodeAt(i) ^ KEY.charCodeAt(i % KEY.length));
            }
            const logsArray = JSON.parse(decrypted);
            
            // Clean/filter logs older than 24h
            const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
            const filteredLogs = (Array.isArray(logsArray) ? logsArray : [])
              .filter((log: any) => new Date(log.timestamp).getTime() > oneDayAgo);

            setDecryptedLogs(filteredLogs.reverse());
          } catch (e) {
            console.error("Decryption failed:", e);
            setPasswordError("Error al descifrar los registros.");
          }
        }
      } else {
        setPasswordError("Acceso denegado. Contraseña inválida.");
      }
    } catch (err) {
      console.error(err);
      setPasswordError("Error interno de verificación.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F110E] text-[#F0EDE8] flex flex-col justify-between font-sans p-6 sm:p-12 relative overflow-hidden select-none">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#E1B668]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header bar */}
      <header className="flex flex-col items-center justify-center border-b border-white/5 pb-6 z-10 gap-4">
        <img src="/logo.png" alt="Bucare Suite Logo" className="h-20 w-auto brightness-0 invert object-contain" />
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-red-500 animate-pulse" : "bg-orange-500"}`} />
          <span className={`text-[10px] uppercase tracking-widest font-bold ${isOnline ? "text-red-400" : "text-orange-400"}`}>
            {isOnline ? "Offline" : "Sin Red"}
          </span>
        </div>
      </header>

      {/* Main warning container */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto py-12 z-10 text-center">
        <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-full mb-6">
          <WifiOff className={`w-10 h-10 animate-pulse ${isOnline ? "text-[#e05555]" : "text-orange-400"}`} />
        </div>
        <h1 className="text-display text-2xl sm:text-4xl uppercase font-bold tracking-tight text-white mb-3">
          {isOnline ? "Conexión Perdida" : "Sin Internet"}
        </h1>
        <p className="text-sm text-gray-400 leading-relaxed mb-6">
          {isOnline 
            ? "No pudimos conectar con los servicios centrales de Bucare. Esto puede deberse a mantenimiento del servidor o una caída temporal del servicio."
            : "No detectamos una conexión a internet activa en tu dispositivo. Por favor, revisa tu red local o wifi."
          }
        </p>

        <div className="mb-8 p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center gap-2.5 text-xs text-gray-350 min-h-[44px] w-full">
          {!isOnline ? (
            <>
              <AlertCircle className="w-4 h-4 text-orange-400 animate-pulse" />
              <span>Esperando que se restablezca tu conexión a internet...</span>
            </>
          ) : isVerifying ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#E1B668]" />
              <span>Verificando conexión con el servidor...</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 rounded-full bg-[#E1B668] animate-pulse" />
              <span>
                Próximo intento en <span className="font-bold text-[#E1B668]">{countdown}s</span>
                {currentDelay > 10 && <span className="text-gray-500 text-[10px] ml-1.5">(Backoff activo: {currentDelay}s)</span>}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <Button
            onClick={handleRetry}
            disabled={!isOnline}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#E1B668] hover:bg-[#E1B668]/90 disabled:opacity-40 text-[#0F110E] font-bold px-6 py-4 rounded-md tracking-wider uppercase text-xs"
          >
            <RefreshCw className="w-4 h-4" /> Reintentar Conexión
          </Button>
          <a
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/10 hover:bg-white/5 text-gray-300 font-bold px-6 py-4 rounded-md tracking-wider uppercase text-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </a>
        </div>
      </main>

      {/* Bottom hidden log trigger */}
      <footer className="border-t border-white/5 pt-8 z-10 flex flex-col items-center gap-4">
        {!isUnlocked ? (
          <form onSubmit={verifyPassword} className="flex flex-col items-center gap-3 w-full max-w-xs">
            <div className="relative w-full">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Acceso a consola de desarrollo..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/5 border-white/10 text-xs text-center pr-10 focus:border-[#E1B668]/40 placeholder:text-gray-600 rounded-md"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {passwordError && (
              <span className="text-[10px] text-[#e05555] font-semibold">{passwordError}</span>
            )}
            <button
              type="submit"
              disabled={checking || !password}
              className="text-[10px] uppercase tracking-widest text-[#E1B668]/80 hover:text-[#E1B668] disabled:opacity-40 font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Lock size={10} /> {checking ? "Validando..." : "Desbloquear Consola"}
            </button>
          </form>
        ) : (
          <div className="w-full max-w-2xl bg-black/60 border border-white/10 rounded-lg p-5 font-mono text-left animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2 text-xs text-green-400">
                <Terminal size={14} />
                <span>Consola de Registros Desconectados (Cifrado XOR Activo)</span>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem("backend_offline_logs");
                  setDecryptedLogs([]);
                }}
                className="text-[10px] uppercase tracking-wider text-red-400 hover:text-red-300 font-bold"
              >
                Limpiar Historial
              </button>
            </div>

            {decryptedLogs.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">Sin registros de errores en el historial local (filtrado 24h activo).</p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-3.5 pr-2 custom-scrollbar">
                {decryptedLogs.map((log, index) => (
                  <div key={index} className="text-xs border-b border-white/5 pb-2.5 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between text-gray-500 text-[10px] mb-1">
                      <span>{new Date(log.timestamp).toLocaleString("es-VE")}</span>
                      <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-900/30 font-semibold uppercase tracking-wide">
                        {log.method}
                      </span>
                    </div>
                    <div className="text-gray-300 font-semibold truncate">
                      Endpoint: <span className="text-[#E1B668]">{log.endpoint}</span>
                    </div>
                    <div className="text-red-400 text-[11px] mt-1 bg-red-950/20 p-2 rounded border border-red-950/30 whitespace-pre-wrap leading-relaxed">
                      {log.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <p className="text-[9px] text-gray-600 uppercase tracking-widest mt-2">
          Bucare Suite &copy; 2026. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
