import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  MessageSquare, Bot, User, Send, ShieldAlert, Pause, Play,
  Settings, RefreshCw, Building2, ShoppingBag, Clock, CheckCircle2, Cpu
} from "lucide-react";

export const Route = createFileRoute("/dashboard/chat")({
  component: AdminChatDashboard,
});

interface ChatSession {
  id: string;
  userId?: string;
  guestToken?: string;
  guestName?: string;
  project: "BUCARE_SUITE" | "BUCARE_PLAZA";
  isAiActive: boolean;
  updatedAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
  };
  messages: Array<{
    id: string;
    sender: "USER" | "AI" | "ADMIN";
    content: string;
    createdAt: string;
  }>;
}

interface AiConfig {
  project: string;
  systemPrompt: string;
  selectedModel?: string;
}

interface GeminiModelInfo {
  id: string;
  name: string;
  displayName: string;
  description?: string;
}

function AdminChatDashboard() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [adminInput, setAdminInput] = useState("");
  const [loadingReply, setLoadingReply] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [availableModels, setAvailableModels] = useState<GeminiModelInfo[]>([]);

  const [aiConfigs, setAiConfigs] = useState<{ [key: string]: { prompt: string; model: string } }>({
    BUCARE_SUITE: { prompt: "", model: "gemini-2.0-flash" },
    BUCARE_PLAZA: { prompt: "", model: "gemini-2.0-flash" },
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchSessions = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/v1/chat/admin/sessions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setSessions(json.data || []);
        if (!selectedSessionId && json.data.length > 0) {
          setSelectedSessionId(json.data[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching admin chat sessions:", err);
    }
  };

  const fetchSessionDetails = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`/api/v1/chat/admin/session/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setSelectedSession(json.data);
      }
    } catch (err) {
      console.error("Error fetching session details:", err);
    }
  };

  const fetchAiConfigs = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/v1/chat/admin/config", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        const cfgMap: { [key: string]: { prompt: string; model: string } } = {
          BUCARE_SUITE: { prompt: "", model: "gemini-2.0-flash" },
          BUCARE_PLAZA: { prompt: "", model: "gemini-2.0-flash" },
        };
        json.data.forEach((c: AiConfig) => {
          cfgMap[c.project] = {
            prompt: c.systemPrompt || "",
            model: c.selectedModel || "gemini-2.0-flash",
          };
        });
        setAiConfigs(cfgMap);
      }
    } catch (err) {
      console.error("Error fetching AI config:", err);
    }
  };

  const fetchAvailableModels = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoadingModels(true);
    try {
      const res = await fetch("/api/v1/chat/admin/available-models", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setAvailableModels(json.data || []);
      }
    } catch (err) {
      console.error("Error fetching available models:", err);
    } finally {
      setLoadingModels(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchAiConfigs();
    const interval = setInterval(() => {
      fetchSessions();
      if (selectedSessionId) fetchSessionDetails(selectedSessionId);
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedSessionId]);

  useEffect(() => {
    if (selectedSessionId) {
      fetchSessionDetails(selectedSessionId);
    }
  }, [selectedSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedSession?.messages]);

  const handleOpenConfigModal = () => {
    setShowConfigModal(true);
    fetchAvailableModels();
  };

  const handleToggleAi = async () => {
    if (!selectedSession) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const newStatus = !selectedSession.isAiActive;
    try {
      const res = await fetch(`/api/v1/chat/admin/session/${selectedSession.id}/toggle-ai`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isAiActive: newStatus }),
      });

      if (res.ok) {
        setSelectedSession((prev) => (prev ? { ...prev, isAiActive: newStatus } : null));
        fetchSessions();
      }
    } catch (err) {
      console.error("Error toggling AI status:", err);
    }
  };

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminInput.trim() || !selectedSession || loadingReply) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const text = adminInput.trim();
    setAdminInput("");
    setLoadingReply(true);

    try {
      const res = await fetch(`/api/v1/chat/admin/session/${selectedSession.id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text }),
      });

      if (res.ok) {
        await fetchSessionDetails(selectedSession.id);
        fetchSessions();
      }
    } catch (err) {
      console.error("Error sending admin reply:", err);
    } finally {
      setLoadingReply(false);
    }
  };

  const handleSaveConfig = async (projectKey: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const currentCfg = aiConfigs[projectKey];
    try {
      const res = await fetch("/api/v1/chat/admin/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          project: projectKey,
          systemPrompt: currentCfg.prompt,
          selectedModel: currentCfg.model,
        }),
      });

      if (res.ok) {
        alert(`Configuración guardada para ${projectKey} (Modelo: ${currentCfg.model})`);
      }
    } catch (err) {
      console.error("Error saving AI config:", err);
    }
  };

  return (
    <div style={{ background: "#0A0A0A", minHeight: "calc(100vh - 80px)", color: "#F0EDE8", padding: "24px" }}>
      {/* Top Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <div style={{ color: "#E1B668", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>
            Administración de Asistencia IA &amp; Chats
          </div>
          <h1 style={{ fontFamily: "'Archivo', sans-serif", fontSize: "1.8rem", fontWeight: 800, margin: "4px 0 0", color: "#F0EDE8" }}>
            Centro de Conversaciones y Control IA
          </h1>
        </div>

        <button
          onClick={handleOpenConfigModal}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 20px",
            borderRadius: "12px",
            background: "rgba(225, 182, 104, 0.12)",
            color: "#E1B668",
            border: "1px solid rgba(225, 182, 104, 0.3)",
            fontWeight: 600,
            fontSize: "0.85rem",
            cursor: "pointer",
          }}
        >
          <Settings size={18} /> Configurar Prompts y Modelos IA
        </button>
      </div>

      {/* Main Grid: Session list + Chat details */}
      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "20px", height: "720px" }}>
        {/* Left Panel: Sessions List */}
        <div
          style={{
            background: "#121212",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "16px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ padding: "16px", background: "#161616", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#F0EDE8" }}>Conversaciones ({sessions.length})</span>
            <button onClick={fetchSessions} style={{ background: "none", border: "none", color: "#8A8A8A", cursor: "pointer" }}>
              <RefreshCw size={16} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
            {sessions.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", color: "#6A6A6A", fontSize: "0.85rem" }}>
                No hay conversaciones activas aún.
              </div>
            ) : (
              sessions.map((s) => {
                const isSelected = s.id === selectedSessionId;
                const lastMsg = s.messages[0]?.content || "Sin mensajes";
                const displayName = s.user?.fullName || s.guestName || (s.user?.email ? s.user.email : "Visitante Invitado");
                const isGuest = !s.user;

                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSessionId(s.id)}
                    style={{
                      padding: "14px",
                      borderRadius: "12px",
                      background: isSelected ? "rgba(225, 182, 104, 0.12)" : "rgba(255, 255, 255, 0.02)",
                      border: isSelected ? "1px solid rgba(225, 182, 104, 0.3)" : "1px solid rgba(255, 255, 255, 0.04)",
                      marginBottom: "8px",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#F0EDE8", display: "flex", alignItems: "center", gap: "6px" }}>
                        {displayName}
                        {isGuest && (
                          <span style={{ fontSize: "0.6rem", background: "rgba(225, 182, 104, 0.15)", color: "#E1B668", padding: "1px 6px", borderRadius: "4px" }}>
                            Invitado
                          </span>
                        )}
                      </span>
                      <span
                        style={{
                          padding: "2px 8px",
                          borderRadius: "99px",
                          fontSize: "0.62rem",
                          fontWeight: 700,
                          background: s.project === "BUCARE_PLAZA" ? "rgba(33, 59, 38, 0.8)" : "rgba(225, 182, 104, 0.2)",
                          color: s.project === "BUCARE_PLAZA" ? "#4ADE80" : "#E1B668",
                        }}
                      >
                        {s.project === "BUCARE_PLAZA" ? "PLAZA" : "SUITE"}
                      </span>
                    </div>

                    <div style={{ fontSize: "0.78rem", color: "#8A8A8A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "8px" }}>
                      {lastMsg}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.68rem" }}>
                      <span style={{ color: s.isAiActive ? "#4ADE80" : "#E1B668", fontWeight: 600 }}>
                        {s.isAiActive ? "● IA Activa" : "● Intervención Humana"}
                      </span>
                      <span style={{ color: "#6A6A6A" }}>
                        {new Date(s.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel: Selected Chat Details */}
        <div
          style={{
            background: "#121212",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "16px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {selectedSession ? (
            <>
              {/* Header with AI Intervention Toggle */}
              <div
                style={{
                  padding: "16px 24px",
                  background: "#161616",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#F0EDE8" }}>
                      {selectedSession.user?.fullName || selectedSession.guestName || "Visitante Invitado"}
                    </span>
                    {selectedSession.user?.email ? (
                      <span style={{ color: "#8A8A8A", fontSize: "0.8rem" }}>({selectedSession.user.email})</span>
                    ) : (
                      <span style={{ fontSize: "0.68rem", color: "#E1B668", background: "rgba(225, 182, 104, 0.15)", padding: "2px 8px", borderRadius: "99px", fontWeight: 600 }}>
                        Visitante no registrado
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#6A6A6A", marginTop: "2px" }}>
                    Origen: <strong style={{ color: "#E1B668" }}>{selectedSession.project === "BUCARE_PLAZA" ? "Bucare Plaza Comercial" : "Bucare Suite Residencias"}</strong>
                  </div>
                </div>

                {/* Switch para Activar / Pausar IA */}
                <button
                  onClick={handleToggleAi}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    borderRadius: "10px",
                    background: selectedSession.isAiActive ? "rgba(74, 222, 128, 0.15)" : "rgba(225, 182, 104, 0.15)",
                    color: selectedSession.isAiActive ? "#4ADE80" : "#E1B668",
                    border: selectedSession.isAiActive ? "1px solid rgba(74, 222, 128, 0.3)" : "1px solid rgba(225, 182, 104, 0.3)",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  {selectedSession.isAiActive ? (
                    <>
                      <Bot size={16} /> IA Activa (Pausar para Intervenir)
                    </>
                  ) : (
                    <>
                      <Pause size={16} /> IA Pausada (Modo Intervención Humana)
                    </>
                  )}
                </button>
              </div>

              {/* Messages feed */}
              <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px" }}>
                {selectedSession.messages.map((m) => {
                  const isUser = m.sender === "USER";
                  const isAdmin = m.sender === "ADMIN";

                  return (
                    <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-start" : "flex-end" }}>
                      <span style={{ fontSize: "0.65rem", color: "#6A6A6A", marginBottom: "4px", padding: "0 4px" }}>
                        {isUser ? `Cliente (${selectedSession.user?.fullName || "Usuario"})` : isAdmin ? "Tú (Administrador)" : "IA Gemini"} ·{" "}
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <div
                        style={{
                          maxWidth: "75%",
                          padding: "12px 16px",
                          borderRadius: isUser ? "16px 16px 16px 2px" : "16px 16px 2px 16px",
                          background: isUser
                            ? "rgba(255, 255, 255, 0.06)"
                            : isAdmin
                            ? "linear-gradient(135deg, #213B26 0%, #16291A 100%)"
                            : "linear-gradient(135deg, #2A2518 0%, #1A160E 100%)",
                          color: "#F0EDE8",
                          fontSize: "0.88rem",
                          lineHeight: 1.6,
                          border: isUser
                            ? "1px solid rgba(255, 255, 255, 0.08)"
                            : isAdmin
                            ? "1px solid rgba(74, 222, 128, 0.3)"
                            : "1px solid rgba(225, 182, 104, 0.3)",
                        }}
                      >
                        {m.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Admin reply input */}
              <form
                onSubmit={handleSendAdminReply}
                style={{
                  padding: "16px",
                  background: "#161616",
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  display: "flex",
                  gap: "12px",
                }}
              >
                <input
                  type="text"
                  placeholder="Enviar respuesta directa como Administrador..."
                  value={adminInput}
                  onChange={(e) => setAdminInput(e.target.value)}
                  style={{
                    flex: 1,
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    color: "#F0EDE8",
                    fontSize: "0.88rem",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  disabled={loadingReply || !adminInput.trim()}
                  style={{
                    padding: "0 24px",
                    borderRadius: "12px",
                    background: "#E1B668",
                    color: "#0A0A0A",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    border: "none",
                    cursor: adminInput.trim() ? "pointer" : "default",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Send size={16} /> Responder
                </button>
              </form>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#6A6A6A" }}>
              Selecciona una conversación para gestionar
            </div>
          )}
        </div>
      </div>

      {/* Modal para Configuración de System Prompts y Modelo de IA */}
      {showConfigModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(10, 10, 10, 0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "740px",
              background: "#121212",
              border: "1px solid rgba(225, 182, 104, 0.3)",
              borderRadius: "20px",
              padding: "28px",
              position: "relative",
              boxShadow: "0 24px 48px rgba(0, 0, 0, 0.6)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <h3 style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: "1.3rem", color: "#F0EDE8", margin: 0 }}>
                  Configuración de Prompts y Modelos IA Gemini
                </h3>
                <div style={{ color: "#8A8A8A", fontSize: "0.78rem", marginTop: "4px" }}>
                  Consulta modelos disponibles directamente a la API de Google
                </div>
              </div>

              <button onClick={() => setShowConfigModal(false)} style={{ background: "none", border: "none", color: "#8A8A8A", cursor: "pointer", fontSize: "1.2rem" }}>
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Bucare Suite Config */}
              <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(225, 182, 104, 0.2)", borderRadius: "14px", padding: "18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <label style={{ color: "#E1B668", fontWeight: 700, fontSize: "0.9rem" }}>
                    Bucare Suite (Residencias)
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Cpu size={16} color="#E1B668" />
                    <select
                      value={aiConfigs["BUCARE_SUITE"]?.model || "gemini-2.0-flash"}
                      onChange={(e) =>
                        setAiConfigs((prev) => ({
                          ...prev,
                          BUCARE_SUITE: { ...prev.BUCARE_SUITE, model: e.target.value },
                        }))
                      }
                      style={{
                        background: "#1A1A1A",
                        border: "1px solid rgba(225, 182, 104, 0.3)",
                        borderRadius: "8px",
                        padding: "6px 12px",
                        color: "#F0EDE8",
                        fontSize: "0.8rem",
                        outline: "none",
                      }}
                    >
                      {availableModels.length === 0 ? (
                        <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                      ) : (
                        availableModels.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.displayName} ({m.id})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <textarea
                  rows={4}
                  placeholder="System prompt para Bucare Suite..."
                  value={aiConfigs["BUCARE_SUITE"]?.prompt || ""}
                  onChange={(e) =>
                    setAiConfigs((prev) => ({
                      ...prev,
                      BUCARE_SUITE: { ...prev.BUCARE_SUITE, prompt: e.target.value },
                    }))
                  }
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "10px",
                    padding: "12px",
                    color: "#F0EDE8",
                    fontSize: "0.85rem",
                    outline: "none",
                  }}
                />

                <button
                  onClick={() => handleSaveConfig("BUCARE_SUITE")}
                  style={{
                    marginTop: "10px",
                    padding: "8px 18px",
                    borderRadius: "8px",
                    background: "#E1B668",
                    color: "#0A0A0A",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Guardar Configuración Suite
                </button>
              </div>

              {/* Bucare Plaza Config */}
              <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(74, 222, 128, 0.2)", borderRadius: "14px", padding: "18px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <label style={{ color: "#4ADE80", fontWeight: 700, fontSize: "0.9rem" }}>
                    Bucare Plaza (Comercial)
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Cpu size={16} color="#4ADE80" />
                    <select
                      value={aiConfigs["BUCARE_PLAZA"]?.model || "gemini-2.0-flash"}
                      onChange={(e) =>
                        setAiConfigs((prev) => ({
                          ...prev,
                          BUCARE_PLAZA: { ...prev.BUCARE_PLAZA, model: e.target.value },
                        }))
                      }
                      style={{
                        background: "#1A1A1A",
                        border: "1px solid rgba(74, 222, 128, 0.3)",
                        borderRadius: "8px",
                        padding: "6px 12px",
                        color: "#F0EDE8",
                        fontSize: "0.8rem",
                        outline: "none",
                      }}
                    >
                      {availableModels.length === 0 ? (
                        <option value="gemini-2.0-flash">gemini-2.0-flash</option>
                      ) : (
                        availableModels.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.displayName} ({m.id})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <textarea
                  rows={4}
                  placeholder="System prompt para Bucare Plaza..."
                  value={aiConfigs["BUCARE_PLAZA"]?.prompt || ""}
                  onChange={(e) =>
                    setAiConfigs((prev) => ({
                      ...prev,
                      BUCARE_PLAZA: { ...prev.BUCARE_PLAZA, prompt: e.target.value },
                    }))
                  }
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "10px",
                    padding: "12px",
                    color: "#F0EDE8",
                    fontSize: "0.85rem",
                    outline: "none",
                  }}
                />

                <button
                  onClick={() => handleSaveConfig("BUCARE_PLAZA")}
                  style={{
                    marginTop: "10px",
                    padding: "8px 18px",
                    borderRadius: "8px",
                    background: "#4ADE80",
                    color: "#0A0A0A",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Guardar Configuración Plaza
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
