import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot, Lock, Sparkles, UserCheck, UserPlus, LogIn, Clock } from "lucide-react";
import { GoogleLoginButton } from "./GoogleLoginButton";
import { RegisterWizardModal } from "./RegisterWizardModal";

import { useSiteContent } from "@/hooks/useSiteContent";
import { getApiUrl } from "@/lib/api";

interface Message {
  id: string;
  sender: "USER" | "AI" | "ADMIN";
  content: string;
  createdAt: string;
}

export function FloatingChatWidget() {
  const { content } = useSiteContent();
  const isChatVisible = content.settings?.aiEnabled !== false;

  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAiActive, setIsAiActive] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showWizardModal, setShowWizardModal] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [snoozedUntil, setSnoozedUntil] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      setIsAuthenticated(Boolean(localStorage.getItem("token")));
      const savedName = localStorage.getItem("bucare_guest_name");
      if (savedName) setGuestName(savedName);

      const savedSnooze = localStorage.getItem("bucare_register_snoozed_until");
      if (savedSnooze) {
        const val = Number(savedSnooze);
        if (!isNaN(val)) setSnoozedUntil(val);
      }
    }
  }, []);

  if (!isChatVisible) {
    return null;
  }


  const getProject = (): "BUCARE_PLAZA" | "BUCARE_SUITE" => {
    if (typeof window === "undefined") return "BUCARE_SUITE";
    return window.location.pathname.startsWith("/comercial") ? "BUCARE_PLAZA" : "BUCARE_SUITE";
  };

  const project = getProject();

  const getOrCreateGuestToken = (): string => {
    if (typeof window === "undefined") return "";
    let gToken = localStorage.getItem("bucare_guest_token");
    if (!gToken) {
      const array = new Uint8Array(16);
      if (typeof window.crypto !== "undefined") {
        window.crypto.getRandomValues(array);
      } else {
        for (let i = 0; i < 16; i++) array[i] = Math.floor(Math.random() * 256);
      }
      const randomHex = Array.from(array)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      gToken = `gst_${Date.now()}_${randomHex}`;
      localStorage.setItem("bucare_guest_token", gToken);
    }
    return gToken;
  };

  const fetchSession = async () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    const guestToken = getOrCreateGuestToken();
    const storedGuestName = localStorage.getItem("bucare_guest_name") || guestName;

    setIsAuthenticated(Boolean(token));

    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else if (guestToken) {
      headers["x-guest-token"] = guestToken;
      if (storedGuestName) headers["x-guest-name"] = storedGuestName;
    } else {
      return;
    }

    try {
      const res = await fetch(getApiUrl(`/api/v1/chat/session?project=${project}`), { headers });
      if (res.ok) {
        const json = await res.json();
        setMessages(json.data.messages || []);
        setIsAiActive(json.data.isAiActive ?? true);
      }
    } catch (err) {
      console.error("Error fetching chat session:", err);
    }
  };

  useEffect(() => {
    if (isOpen && mounted) {
      fetchSession();
      const interval = setInterval(fetchSession, 8000);
      return () => clearInterval(interval);
    }
  }, [isOpen, mounted, project]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Show tooltip after 4 seconds to catch attention dynamically
    const timer = setTimeout(() => {
      if (!isOpen) {
        setShowTooltip(true);
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!mounted) return null;

  const handleWidgetClick = () => {
    setIsOpen((prev) => !prev);
    setShowTooltip(false);
  };

  const handleAuthSuccess = async (data: { token: string; user: any }) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setIsAuthenticated(true);

    const guestToken = localStorage.getItem("bucare_guest_token");
    if (guestToken) {
      try {
        await fetch(getApiUrl("/api/v1/chat/claim-guest-session"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.token}`,
          },
          body: JSON.stringify({ guestToken }),
        });
      } catch (err) {
        console.error("Error claiming guest session:", err);
      }
    }

    fetchSession();
  };

  const handleSnoozeRegister = () => {
    const fiveHoursMs = Date.now() + 5 * 60 * 60 * 1000;
    localStorage.setItem("bucare_register_snoozed_until", fiveHoursMs.toString());
    setSnoozedUntil(fiveHoursMs);
  };

  // Detectar si el usuario indica su nombre
  const detectAndSaveGuestName = (text: string) => {
    if (isAuthenticated) return;
    const lower = text.toLowerCase().trim();
    let nameFound = "";

    if (lower.startsWith("me llamo ")) {
      nameFound = text.substring(9).trim();
    } else if (lower.startsWith("soy ")) {
      nameFound = text.substring(4).trim();
    } else if (lower.startsWith("mi nombre es ")) {
      nameFound = text.substring(13).trim();
    } else if (messages.length <= 4 && text.split(" ").length <= 3 && !lower.includes("hola") && !lower.includes("precio")) {
      nameFound = text.trim();
    }

    if (nameFound && nameFound.length >= 2 && nameFound.length <= 40) {
      setGuestName(nameFound);
      localStorage.setItem("bucare_guest_name", nameFound);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");
    setLoading(true);

    detectAndSaveGuestName(userText);

    const token = localStorage.getItem("token");
    const guestToken = getOrCreateGuestToken();
    const storedGuestName = localStorage.getItem("bucare_guest_name") || guestName;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else if (guestToken) {
      headers["x-guest-token"] = guestToken;
      if (storedGuestName) headers["x-guest-name"] = storedGuestName;
    }

    const tempUserMsg: Message = {
      id: Date.now().toString(),
      sender: "USER",
      content: userText,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await fetch(getApiUrl("/api/v1/chat/send"), {
        method: "POST",
        headers,
        body: JSON.stringify({ message: userText, project, guestName: storedGuestName }),
      });

      if (res.ok) {
        await fetchSession();
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setLoading(false);
    }
  };

  const userMessageCount = messages.filter((m) => m.sender === "USER").length;
  const isSnoozedActive = snoozedUntil !== null && Date.now() < snoozedUntil;

  // Mostrar la sugerencia de registro solo tras 3 a 5+ mensajes del cliente, si no está autenticado y no está pospuesto
  const shouldShowRegisterCard =
    !isAuthenticated &&
    !isSnoozedActive &&
    userMessageCount >= 3;

  return (
    <>
      {/* Tooltip / Mensaje de sugerencia dinámico */}
      {showTooltip && !isOpen && (
        <div
          onClick={() => {
            setIsOpen(true);
            setShowTooltip(false);
          }}
          style={{
            position: "fixed",
            bottom: "100px",
            right: "28px",
            zIndex: 9998,
            width: "250px",
            background: "#1E1E1E",
            color: "#F0EDE8",
            border: project === "BUCARE_PLAZA" ? "1px solid rgba(74, 222, 128, 0.4)" : "1px solid rgba(225, 182, 104, 0.4)",
            borderRadius: "14px",
            padding: "12px 16px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            fontSize: "0.82rem",
            cursor: "pointer",
            animation: "fadeInUp 0.4s ease-out",
            lineHeight: "1.4",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
            <span style={{ fontWeight: "700", color: project === "BUCARE_PLAZA" ? "#4ADE80" : "#E1B668", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Asistente IA</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowTooltip(false);
              }}
              style={{ background: "none", border: "none", color: "#8A8A8A", padding: 0, cursor: "pointer", display: "flex", alignItems: "center" }}
            >
              <X size={14} />
            </button>
          </div>
          ¿Tienes alguna duda sobre el proyecto? ¡Consúltame aquí en tiempo real!
          {/* Pequeño indicador/triángulo inferior apuntando al botón */}
          <div
            style={{
              position: "absolute",
              bottom: "-6px",
              right: "24px",
              width: "12px",
              height: "12px",
              background: "#1E1E1E",
              borderRight: project === "BUCARE_PLAZA" ? "1px solid rgba(74, 222, 128, 0.4)" : "1px solid rgba(225, 182, 104, 0.4)",
              borderBottom: project === "BUCARE_PLAZA" ? "1px solid rgba(74, 222, 128, 0.4)" : "1px solid rgba(225, 182, 104, 0.4)",
              transform: "rotate(45deg)",
            }}
          />
        </div>
      )}

      {/* Botón flotante inferior derecho */}
      <button
        onClick={handleWidgetClick}
        aria-label="Asistente de IA"
        style={{
          position: "fixed",
          bottom: "28px",
          right: "28px",
          zIndex: 9999,
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: project === "BUCARE_PLAZA"
            ? "linear-gradient(135deg, #213B26 0%, #16291A 100%)"
            : "linear-gradient(135deg, #2A2518 0%, #16130C 100%)",
          color: project === "BUCARE_PLAZA" ? "#4ADE80" : "#E1B668",
          border: project === "BUCARE_PLAZA" ? "1px solid rgba(74, 222, 128, 0.4)" : "1px solid rgba(225, 182, 104, 0.4)",
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.5)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {isOpen ? <X size={26} /> : <MessageSquare size={26} />}
      </button>

      {/* Drawer / Ventana flotante de Chat */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "98px",
            right: "28px",
            zIndex: 9999,
            width: "390px",
            maxHeight: "620px",
            height: "82vh",
            background: "#121212",
            border: project === "BUCARE_PLAZA" ? "1px solid rgba(74, 222, 128, 0.3)" : "1px solid rgba(225, 182, 104, 0.3)",
            borderRadius: "20px",
            boxShadow: "0 24px 48px rgba(0, 0, 0, 0.6)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 20px",
              background: "#161616",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: project === "BUCARE_PLAZA" ? "rgba(74, 222, 128, 0.15)" : "rgba(225, 182, 104, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: project === "BUCARE_PLAZA" ? "#4ADE80" : "#E1B668",
                }}
              >
                <Bot size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#F0EDE8" }}>
                  {project === "BUCARE_PLAZA" ? "Asistente Bucare Plaza" : "Asistente Bucare Suite"}
                </div>
                <div style={{ fontSize: "0.7rem", color: isAiActive ? "#4ADE80" : "#E1B668" }}>
                  {isAiActive ? "● IA Gemini en vivo" : "● Atendido por un asesor humano"}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              style={{ background: "none", border: "none", color: "#8A8A8A", cursor: "pointer" }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Banner si es Invitado / No autenticado */}
          {!isAuthenticated && (
            <div
              style={{
                padding: "8px 16px",
                background: "rgba(225, 182, 104, 0.1)",
                borderBottom: "1px solid rgba(225, 182, 104, 0.2)",
                fontSize: "0.74rem",
                color: "#E1B668",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>
                {guestName ? `Hola, ${guestName}` : "Chateando como visitante"}
              </span>
              <button
                onClick={() => setShowWizardModal(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#F0EDE8",
                  fontWeight: 700,
                  textDecoration: "underline",
                  fontSize: "0.72rem",
                  cursor: "pointer",
                }}
              >
                Registrarme ahora
              </button>
            </div>
          )}

          {/* Contenido / Historial de Mensajes */}
          <div
            style={{
              flex: 1,
              padding: "16px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {messages.map((m) => {
              const isUser = m.sender === "USER";
              const isAdmin = m.sender === "ADMIN";

              return (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isUser ? "flex-end" : "flex-start",
                  }}
                >
                  <span style={{ fontSize: "0.62rem", color: "#6A6A6A", marginBottom: "3px", padding: "0 4px" }}>
                    {isUser ? (guestName || "Tú") : isAdmin ? "Asesor Comercial" : "IA Gemini"}
                  </span>
                  <div
                    style={{
                      maxWidth: "82%",
                      padding: "10px 14px",
                      borderRadius: isUser ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                      background: isUser
                        ? project === "BUCARE_PLAZA"
                          ? "#213B26"
                          : "#2A2518"
                        : isAdmin
                        ? "rgba(74, 222, 128, 0.15)"
                        : "rgba(255, 255, 255, 0.05)",
                      color: "#F0EDE8",
                      fontSize: "0.85rem",
                      lineHeight: 1.5,
                      border: isUser
                        ? project === "BUCARE_PLAZA"
                          ? "1px solid rgba(74, 222, 128, 0.3)"
                          : "1px solid rgba(225, 182, 104, 0.3)"
                        : "1px solid rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}

            {/* Tarjeta Interactiva de Registro (después de 3 a 5 mensajes y si no está pospuesto) */}
            {shouldShowRegisterCard && (
              <div
                style={{
                  margin: "8px 0",
                  padding: "14px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, rgba(225, 182, 104, 0.08) 0%, rgba(20, 20, 20, 0.8) 100%)",
                  border: "1px solid rgba(225, 182, 104, 0.25)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Sparkles size={16} color="#E1B668" />
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#F0EDE8" }}>
                    Guarda tu consulta y personaliza tu atención
                  </span>
                </div>

                <p style={{ fontSize: "0.72rem", color: "#AAA", margin: 0, lineHeight: 1.4 }}>
                  Registrándote podrás acceder a precios preferenciales, agendar visitas guiadas y continuar tu chat desde cualquier dispositivo.
                </p>

                {/* Botón directo de Google Login */}
                <div style={{ marginTop: "4px" }}>
                  <GoogleLoginButton
                    text="Registrarme con Google"
                    onSuccess={handleAuthSuccess}
                    onError={(err) => console.error("Google Auth error:", err)}
                  />
                </div>

                {/* Opción discreta de Registro Clásico */}
                <button
                  type="button"
                  onClick={() => setShowWizardModal(true)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#8A8A8A",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    textDecoration: "underline",
                    cursor: "pointer",
                    textAlign: "center",
                    padding: "4px 0",
                  }}
                >
                  O usa el registro clásico por correo
                </button>

                {/* Botón estructurado "Más tarde" debajo del registro clásico */}
                <button
                  type="button"
                  onClick={handleSnoozeRegister}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "8px",
                    padding: "10px 14px",
                    color: "#FFFFFF",
                    fontSize: "0.76rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Clock size={15} color="#AAA" />
                  <span>Más tarde (Recordarme en 5 horas)</span>
                </button>
              </div>
            )}

            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#8A8A8A", fontSize: "0.78rem" }}>
                <Bot size={16} className="animate-spin" /> Escribiendo respuesta...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Formulario de Envío de Mensaje */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: "12px 16px",
              background: "#161616",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              gap: "8px",
            }}
          >
            <input
              type="text"
              placeholder="Escribe tu consulta o tu nombre aquí..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{
                flex: 1,
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "12px",
                padding: "10px 14px",
                color: "#F0EDE8",
                fontSize: "0.85rem",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                padding: "0 16px",
                borderRadius: "12px",
                background: project === "BUCARE_PLAZA" ? "#4ADE80" : "#E1B668",
                color: "#0A0A0A",
                fontWeight: 700,
                border: "none",
                cursor: input.trim() ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Modal Wizard de Registro Clásico */}
      <RegisterWizardModal
        isOpen={showWizardModal}
        onClose={() => setShowWizardModal(false)}
        initialName={guestName}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
