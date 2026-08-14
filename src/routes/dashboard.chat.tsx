import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { getApiUrl } from "@/lib/api";
import {
  MessageSquare, Bot, User, Send, ShieldAlert, Pause, Play,
  Settings, RefreshCw, Building2, ShoppingBag, Clock, CheckCircle2, Cpu, ArrowLeft,
  Smartphone, QrCode, AlertCircle, Radio, Loader2, Pencil, Download, Upload,
  Mail, Briefcase, Calendar, FileText
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

interface WhatsAppStatus {
  connected: boolean;
  initializing: boolean;
  phone?: string;
  qrCode?: string | null;
  qrAscii?: string | null;
}

function AdminChatDashboard() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [adminInput, setAdminInput] = useState("");
  const [loadingReply, setLoadingReply] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showWaModal, setShowWaModal] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [availableModels, setAvailableModels] = useState<GeminiModelInfo[]>([]);

  // WhatsApp bot status state
  const [waStatus, setWaStatus] = useState<WhatsAppStatus>({
    connected: false,
    initializing: false,
  });
  const [waLoading, setWaLoading] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [testMsg, setTestMsg] = useState("");
  const [waFeedback, setWaFeedback] = useState({ text: "", type: "" });

  const [aiConfigs, setAiConfigs] = useState<{ [key: string]: { prompt: string; model: string; autoRotate: boolean } }>({
    BUCARE_SUITE: { prompt: "", model: "gemini-2.0-flash", autoRotate: true },
    BUCARE_PLAZA: { prompt: "", model: "gemini-2.0-flash", autoRotate: true },
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 1024 : false);

  // Nuevos estados para soporte WhatsApp multi-sesión
  const [activeTab, setActiveTab] = useState<'web' | 'whatsapp'>('web');
  const [waChats, setWaChats] = useState<any[]>([]);
  const [selectedWaChatId, setSelectedWaChatId] = useState<string | null>(null);
  const [selectedWaChat, setSelectedWaChat] = useState<any | null>(null);
  const [waInput, setWaInput] = useState("");
  const [simulatedMessageText, setSimulatedMessageText] = useState("");
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [phoneToInit, setPhoneToInit] = useState("");
  const [waContacts, setWaContacts] = useState<any[]>([]);

  // Estados para personalización del contacto de WhatsApp
  const [showEditContactModal, setShowEditContactModal] = useState(false);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [contactNameInput, setContactNameInput] = useState("");
  const [contactAvatarInput, setContactAvatarInput] = useState("");
  const [contactBirthDateInput, setContactBirthDateInput] = useState("");
  const [contactEmailInput, setContactEmailInput] = useState("");
  const [contactCompanyInput, setContactCompanyInput] = useState("");
  const [contactNotesInput, setContactNotesInput] = useState("");
  const [isUpdatingContact, setIsUpdatingContact] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchSessions = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(getApiUrl("/api/v1/chat/admin/sessions"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setSessions(json.data || []);
        if (!selectedSessionId && json.data.length > 0 && !isMobile) {
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
      const res = await fetch(getApiUrl(`/api/v1/chat/admin/session/${id}`), {
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
      const res = await fetch(getApiUrl("/api/v1/chat/admin/config"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        const cfgMap: { [key: string]: { prompt: string; model: string; autoRotate: boolean } } = {
          BUCARE_SUITE: { prompt: "", model: "gemini-2.0-flash", autoRotate: true },
          BUCARE_PLAZA: { prompt: "", model: "gemini-2.0-flash", autoRotate: true },
        };
        json.data.forEach((c: any) => {
          cfgMap[c.project] = {
            prompt: c.systemPrompt || "",
            model: c.selectedModel || "gemini-2.0-flash",
            autoRotate: c.autoRotateModel !== undefined ? Boolean(c.autoRotateModel) : true,
          };
        });
        setAiConfigs(cfgMap);
      }
    } catch (err) {
      console.error("Error fetching AI config:", err);
    }
  };

  const fetchWaStatus = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(getApiUrl("/api/v1/whatsapp/status"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setWaStatus(json.data || {});
      }
    } catch (err) {
      console.error("Error fetching WhatsApp status:", err);
    }
  };

  const fetchWaChats = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(getApiUrl("/api/v1/whatsapp/chats"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setWaChats(json.data || []);
        if (!selectedWaChatId && json.data.length > 0 && !isMobile) {
          setSelectedWaChatId(json.data[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching WhatsApp chats:", err);
    }
  };

  const fetchWaContacts = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(getApiUrl("/api/v1/whatsapp/contacts"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setWaContacts(json.data || []);
      }
    } catch (err) {
      console.error("Error fetching WhatsApp contacts:", err);
    }
  };

  const fetchWaChatDetails = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      // Sincronizar mensajes desde la API externa en segundo plano (sin bloquear)
      fetch(getApiUrl(`/api/v1/whatsapp/chats/${id}/sync-messages`), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch((err) => console.warn("[WA Sync] Error sincronizando mensajes:", err));

      // Cargar chat y mensajes locales (pueden ya tener los externos sincronizados)
      const chatRes = await fetch(getApiUrl("/api/v1/whatsapp/chats"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (chatRes.ok) {
        const chatJson = await chatRes.json();
        const foundChat = chatJson.data.find((c: any) => c.id === id);
        if (foundChat) {
          const msgRes = await fetch(getApiUrl(`/api/v1/whatsapp/chats/${id}/messages`), {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (msgRes.ok) {
            const msgJson = await msgRes.json();
            setSelectedWaChat({
              ...foundChat,
              messages: msgJson.data || [],
            });

            // Re-fetch mensajes 1.5s después para capturar los externos recién sincronizados
            setTimeout(async () => {
              try {
                const msgRes2 = await fetch(getApiUrl(`/api/v1/whatsapp/chats/${id}/messages`), {
                  headers: { Authorization: `Bearer ${token}` },
                });
                if (msgRes2.ok) {
                  const msgJson2 = await msgRes2.json();
                  setSelectedWaChat((prev: any) => prev?.id === id ? { ...prev, messages: msgJson2.data || [] } : prev);
                }
              } catch (_) {}
            }, 1500);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching WhatsApp chat details:", err);
    }
  };

  const handleSyncChats = async () => {
    setWaLoading(true);
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(getApiUrl("/api/v1/whatsapp/sync"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        alert(json.message);
        fetchWaChats();
      } else {
        alert(json.message || "Error al sincronizar chats.");
      }
    } catch (err) {
      console.error("Error syncing chats:", err);
      alert("Error de red al sincronizar.");
    } finally {
      setWaLoading(false);
    }
  };

  const fetchAvailableModels = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoadingModels(true);
    try {
      const res = await fetch(getApiUrl("/api/v1/chat/admin/available-models"), {
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
    fetchWaStatus();
    if (activeTab === 'whatsapp') {
      fetchWaChats();
      fetchWaContacts();
      if (selectedWaChatId) fetchWaChatDetails(selectedWaChatId);
    }

    const interval = setInterval(() => {
      fetchWaStatus();
      if (activeTab === 'web') {
        fetchSessions();
        if (selectedSessionId) fetchSessionDetails(selectedSessionId);
      } else {
        fetchWaChats();
        fetchWaContacts();
        if (selectedWaChatId) fetchWaChatDetails(selectedWaChatId);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [selectedSessionId, selectedWaChatId, activeTab]);

  useEffect(() => {
    if (selectedSessionId && activeTab === 'web') {
      fetchSessionDetails(selectedSessionId);
    }
  }, [selectedSessionId, activeTab]);

  useEffect(() => {
    if (selectedWaChatId && activeTab === 'whatsapp') {
      fetchWaChatDetails(selectedWaChatId);
    }
  }, [selectedWaChatId, activeTab]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedSession?.messages, selectedWaChat?.messages]);

  const handleOpenConfigModal = () => {
    setShowConfigModal(true);
    fetchAvailableModels();
  };

  const handleOpenWaModal = () => {
    setShowWaModal(true);
    fetchWaStatus();
  };

  useEffect(() => {
    if (!showWaModal) return;
    fetchWaStatus();
    const interval = setInterval(fetchWaStatus, 2000);
    return () => clearInterval(interval);
  }, [showWaModal]);

  const handleInitWa = async () => {
    setWaLoading(true);
    const token = localStorage.getItem("token");
    try {
      await fetch(getApiUrl("/api/v1/whatsapp/init"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ phone: "584249999999" }),
      });
      setTimeout(fetchWaStatus, 1500);
    } catch (e) {
      console.error(e);
    } finally {
      setWaLoading(false);
    }
  };

  const handleRestartWa = async () => {
    setWaLoading(true);
    const token = localStorage.getItem("token");
    try {
      await fetch(getApiUrl("/api/v1/whatsapp/restart"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setTimeout(fetchWaStatus, 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setWaLoading(false);
    }
  };

  const handleSendTestWa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone.trim() || !testMsg.trim()) return;

    setWaLoading(true);
    setWaFeedback({ text: "", type: "" });
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(getApiUrl("/api/v1/whatsapp/send"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone: testPhone.trim(), message: testMsg.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setWaFeedback({ text: "¡Mensaje enviado exitosamente vía WhatsApp!", type: "success" });
        setTestMsg("");
      } else {
        setWaFeedback({ text: json.message || "No se pudo enviar el mensaje.", type: "error" });
      }
    } catch (e) {
      setWaFeedback({ text: "Error de red al enviar mensaje.", type: "error" });
    } finally {
      setWaLoading(false);
    }
  };

  const handleToggleAi = async () => {
    if (!selectedSession) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const newStatus = !selectedSession.isAiActive;
    try {
      const res = await fetch(getApiUrl(`/api/v1/chat/admin/session/${selectedSession.id}/toggle-ai`), {
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
      const res = await fetch(getApiUrl(`/api/v1/chat/admin/session/${selectedSession.id}/reply`), {
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
      const res = await fetch(getApiUrl("/api/v1/chat/admin/config"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          project: projectKey,
          systemPrompt: currentCfg.prompt,
          selectedModel: currentCfg.model,
          autoRotateModel: currentCfg.autoRotate,
        }),
      });

      if (res.ok) {
        alert("Configuración guardada correctamente.");
      }
    } catch (err) {
      console.error("Error saving AI config:", err);
    }
  };

  const handleToggleWaAi = async () => {
    if (!selectedWaChat) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    const newStatus = !selectedWaChat.isAiActive;
    try {
      const res = await fetch(getApiUrl(`/api/v1/whatsapp/chats/${selectedWaChat.id}/toggle-ai`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isAiActive: newStatus }),
      });

      if (res.ok) {
        setSelectedWaChat((prev: any) => (prev ? { ...prev, isAiActive: newStatus } : null));
        fetchWaChats();
      }
    } catch (err) {
      console.error("Error toggling WhatsApp AI status:", err);
    }
  };

  const handleSimulateIncoming = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulatedMessageText.trim() || !selectedWaChat) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const text = simulatedMessageText.trim();
    setSimulatedMessageText("");

    try {
      await fetch(getApiUrl("/api/v1/whatsapp/simulate-incoming"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: selectedWaChat.contactPhone,
          message: text,
        }),
      });
      setTimeout(async () => {
        await fetchWaChatDetails(selectedWaChat.id);
        fetchWaChats();
      }, 1500);
    } catch (err) {
      console.error("Error simulating incoming WhatsApp message:", err);
    }
  };

  const handleInitWaWithPhone = async (phoneArg?: string) => {
    const phoneToUse = (phoneArg || phoneToInit).trim() || "584249999999";
    setWaLoading(true);
    const token = localStorage.getItem("token");
    try {
      await fetch(getApiUrl("/api/v1/whatsapp/init"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ phone: phoneToUse }),
      });
      setWaFeedback({ text: `Simulando conexión de cuenta: +${phoneToUse}...`, type: "success" });
      setPhoneToInit("");
      setTimeout(() => {
        fetchWaStatus();
        fetchWaChats();
      }, 1500);
    } catch (e) {
      console.error(e);
      setWaFeedback({ text: "Error conectando cuenta de WhatsApp.", type: "error" });
    } finally {
      setWaLoading(false);
    }
  };

  const handleDisconnectWa = async () => {
    setWaLoading(true);
    const token = localStorage.getItem("token");
    try {
      await fetch(getApiUrl("/api/v1/whatsapp/disconnect"), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      setWaFeedback({ text: "Cerrando sesión de WhatsApp...", type: "success" });
      setTimeout(() => {
        fetchWaStatus();
        setWaChats([]);
        setSelectedWaChat(null);
        setSelectedWaChatId(null);
      }, 1500);
    } catch (e) {
      console.error(e);
    } finally {
      setWaLoading(false);
    }
  };

  const handleSendWaMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!waInput.trim() || !selectedWaChat || waLoading) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const text = waInput.trim();
    setWaInput("");
    setWaLoading(true);

    try {
      const res = await fetch(getApiUrl("/api/v1/whatsapp/send"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone: selectedWaChat.contactPhone,
          message: text,
        }),
      });

      if (res.ok) {
        await fetchWaChatDetails(selectedWaChat.id);
        fetchWaChats();
      }
    } catch (err) {
      console.error("Error sending WhatsApp message:", err);
    } finally {
      setWaLoading(false);
    }
  };

  const handleSyncWaMessages = async () => {
    if (!selectedWaChat || waLoading) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    setWaLoading(true);
    try {
      const res = await fetch(getApiUrl(`/api/v1/whatsapp/chats/${selectedWaChat.id}/sync-messages`), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) {
        // Recargar los mensajes actualizados
        const msgRes = await fetch(getApiUrl(`/api/v1/whatsapp/chats/${selectedWaChat.id}/messages`), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (msgRes.ok) {
          const msgJson = await msgRes.json();
          setSelectedWaChat((prev: any) => prev ? { ...prev, messages: msgJson.data || [] } : prev);
        }
        if (json.data?.synced > 0) {
          setWaFeedback({ text: `✓ ${json.data.synced} mensajes nuevos sincronizados.`, type: "success" });
        } else {
          setWaFeedback({ text: `✓ Conversación actualizada (${json.data?.total ?? 0} mensajes en API).`, type: "success" });
        }
        setTimeout(() => setWaFeedback({ text: "", type: "" }), 3000);
        fetchWaChats();
      } else {
        setWaFeedback({ text: json.message || "Error al sincronizar mensajes.", type: "error" });
        setTimeout(() => setWaFeedback({ text: "", type: "" }), 4000);
      }
    } catch (err) {
      console.error("Error syncing WA messages:", err);
      setWaFeedback({ text: "Error de red al sincronizar.", type: "error" });
      setTimeout(() => setWaFeedback({ text: "", type: "" }), 4000);
    } finally {
      setWaLoading(false);
    }
  };

  const handleOpenEditContactModal = (contact: any) => {
    setEditingContactId(contact.id);
    setContactNameInput(contact.name || "");
    setContactAvatarInput(contact.avatarUrl || "");
    setContactBirthDateInput(contact.birthDate ? contact.birthDate.split('T')[0] : "");
    setContactEmailInput(contact.email || "");
    setContactCompanyInput(contact.company || "");
    setContactNotesInput(contact.notes || "");
    setShowEditContactModal(true);
  };

  const handleSaveContactUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContactId) return;

    setIsUpdatingContact(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(getApiUrl(`/api/v1/whatsapp/contacts/${editingContactId}`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: contactNameInput,
          avatarUrl: contactAvatarInput,
          birthDate: contactBirthDateInput || null,
          email: contactEmailInput,
          company: contactCompanyInput,
          notes: contactNotesInput,
        }),
      });

      if (res.ok) {
        setShowEditContactModal(false);
        fetchWaChats();
        if (selectedWaChat) {
          fetchWaChatDetails(selectedWaChat.id);
        }
      }
    } catch (err) {
      console.error("Error updating contact:", err);
    } finally {
      setIsUpdatingContact(false);
    }
  };

  const handleExportVcf = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(getApiUrl("/api/v1/whatsapp/contacts/export"), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `contactos_whatsapp_${waStatus.phone || 'sesion'}.vcf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Error exporting VCF:", err);
    }
  };

  const handleImportVcf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const vcfContent = event.target?.result as string;
      if (!vcfContent) return;

      try {
        const res = await fetch(getApiUrl("/api/v1/whatsapp/contacts/import"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ vcfContent }),
        });

        if (res.ok) {
          const json = await res.json();
          alert(`Importación exitosa: ${json.message}`);
          fetchWaChats();
        } else {
          const json = await res.json();
          alert(`Error al importar: ${json.message}`);
        }
      } catch (err) {
        console.error("Error importing VCF:", err);
        alert("Error de red al importar contactos.");
      }
    };
    reader.readAsText(file);
  };

  const showSessionsList = !isMobile || (activeTab === 'web' ? !selectedSessionId : !selectedWaChatId);
  const showChatPanel = !isMobile || (activeTab === 'web' ? selectedSessionId : selectedWaChatId);

  return (
    <div style={{ background: "#0A0A0A", minHeight: "calc(100vh - 80px)", color: "#F0EDE8", padding: "24px" }}>
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent: "space-between",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? "16px" : "0",
          marginBottom: "24px",
        }}
      >
        <div>
          <div style={{ color: "#E1B668", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>
            Administración de Asistencia IA &amp; Chats
          </div>
          <h1 style={{ fontFamily: "'Archivo', sans-serif", fontSize: "1.8rem", fontWeight: 800, margin: "4px 0 0", color: "#F0EDE8" }}>
            Centro de Conversaciones y Control IA
          </h1>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", width: isMobile ? "100%" : "auto" }}>
          {/* Botón WhatsApp */}
          <button
            onClick={handleOpenWaModal}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "12px",
              background: waStatus.connected ? "rgba(74, 222, 128, 0.12)" : "rgba(225, 182, 104, 0.12)",
              color: waStatus.connected ? "#4ADE80" : "#E1B668",
              border: waStatus.connected ? "1px solid rgba(74, 222, 128, 0.3)" : "1px solid rgba(225, 182, 104, 0.3)",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              flex: isMobile ? 1 : "auto",
              justifyContent: "center",
            }}
          >
            <Smartphone size={18} />
            <span>{waStatus.connected ? `● WhatsApp +${waStatus.phone}` : "📱 Conectar WhatsApp (QR)"}</span>
          </button>

          {/* Botón Config Prompts */}
          <button
            onClick={handleOpenConfigModal}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.05)",
              color: "#F0EDE8",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              flex: isMobile ? 1 : "auto",
              justifyContent: "center",
            }}
          >
            <Settings size={18} /> Prompts IA
          </button>
        </div>
      </div>

      {/* Main Grid: Session list + Chat details */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "minmax(280px, 340px) 1fr",
          gap: "20px",
          height: "calc(100svh - 180px)",
          minHeight: "500px",
        }}
      >
        {/* Left Panel: Sessions List */}
        {showSessionsList && (
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
            {/* Tabs Selector: Web vs WhatsApp */}
            <div style={{ display: "flex", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", background: "#161616" }}>
              <button
                onClick={() => setActiveTab('web')}
                style={{
                  flex: 1,
                  padding: "12px 8px",
                  background: activeTab === 'web' ? "rgba(225, 182, 104, 0.08)" : "none",
                  border: "none",
                  borderBottom: activeTab === 'web' ? "2px solid #E1B668" : "2px solid transparent",
                  color: activeTab === 'web' ? "#E1B668" : "#8A8A8A",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  transition: "all 0.2s ease"
                }}
              >
                <MessageSquare size={14} /> Chats Web
              </button>
              <button
                onClick={() => setActiveTab('whatsapp')}
                style={{
                  flex: 1,
                  padding: "12px 8px",
                  background: activeTab === 'whatsapp' ? "rgba(74, 222, 128, 0.08)" : "none",
                  border: "none",
                  borderBottom: activeTab === 'whatsapp' ? "2px solid #4ADE80" : "2px solid transparent",
                  color: activeTab === 'whatsapp' ? "#4ADE80" : "#8A8A8A",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  transition: "all 0.2s ease"
                }}
              >
                <Smartphone size={14} /> WhatsApp
              </button>
            </div>

            <div
              style={{
                padding: "16px",
                background: "#161616",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#F0EDE8" }}>
                  {activeTab === 'web' ? `Conversaciones Web (${sessions.length})` : `Chats WhatsApp (${waChats.length})`}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {activeTab === 'whatsapp' && (
                    <button
                      onClick={handleSyncChats}
                      disabled={waLoading}
                      style={{
                        background: "rgba(74, 222, 128, 0.12)",
                        border: "1px solid rgba(74, 222, 128, 0.3)",
                        borderRadius: "6px",
                        color: "#4ADE80",
                        padding: "4px 8px",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                      title="Sincronizar chats desde la API de WhatsApp"
                    >
                      <RefreshCw size={12} className={waLoading ? "animate-spin" : ""} />
                      {waLoading ? "Sincronizando..." : "Sincronizar"}
                    </button>
                  )}
                  <button
                    onClick={activeTab === 'web' ? fetchSessions : fetchWaChats}
                    style={{ background: "none", border: "none", color: "#8A8A8A", cursor: "pointer" }}
                    title="Actualizar"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>

              {activeTab === 'whatsapp' && waStatus.connected && (
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={handleExportVcf}
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      padding: "6px 8px",
                      borderRadius: "6px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#8A8A8A",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                    title="Exportar contactos a VCF"
                  >
                    <Download size={12} /> Exportar VCF
                  </button>
                  <label
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      padding: "6px 8px",
                      borderRadius: "6px",
                      background: "rgba(74, 222, 128, 0.05)",
                      border: "1px solid rgba(74, 222, 128, 0.15)",
                      color: "#4ADE80",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                    title="Importar contactos desde VCF"
                  >
                    <Upload size={12} /> Importar VCF
                    <input
                      type="file"
                      accept=".vcf"
                      onChange={handleImportVcf}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              )}
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
              {activeTab === 'web' ? (
                sessions.length === 0 ? (
                  <div style={{ padding: "32px", textAlign: "center", color: "#6A6A6A", fontSize: "0.85rem" }}>
                    No hay conversaciones activas aún.
                  </div>
                ) : (
                  sessions.map((s) => {
                    const isSelected = s.id === selectedSessionId;
                    const lastMsg = s.messages[0]?.content || "Sin mensajes";
                    const displayName = s.user?.fullName || s.guestName || (s.user?.email ? s.user.email : "Visitante Invitado");
                    const isGuest = !s.user;
                    const isWa = s.guestToken?.startsWith("wa_");

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
                            {isWa && (
                              <span style={{ fontSize: "0.6rem", background: "rgba(74, 222, 128, 0.15)", color: "#4ADE80", padding: "1px 6px", borderRadius: "4px" }}>
                                WhatsApp
                              </span>
                            )}
                            {isGuest && !isWa && (
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
                )
              ) : (
                /* Lista de Chats WhatsApp */
                waChats.length === 0 ? (
                  <div style={{ padding: "32px", textAlign: "center", color: "#6A6A6A", fontSize: "0.85rem" }}>
                    No hay chats de WhatsApp registrados. {!waStatus.connected && "Conecta tu cuenta para sincronizar mensajes."}
                  </div>
                ) : (
                  waChats.map((c) => {
                    const isSelected = c.id === selectedWaChatId;
                    const displayName = c.contactName || `Cliente +${c.contactPhone}`;
                    const lastMsg = c.lastMessage || "Sin mensajes";

                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedWaChatId(c.id)}
                        style={{
                          padding: "14px",
                          borderRadius: "12px",
                          background: isSelected ? "rgba(74, 222, 128, 0.12)" : "rgba(255, 255, 255, 0.02)",
                          border: isSelected ? "1px solid rgba(74, 222, 128, 0.3)" : "1px solid rgba(255, 255, 255, 0.04)",
                          marginBottom: "8px",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                          display: "flex",
                          gap: "12px",
                          alignItems: "center",
                        }}
                      >
                        {/* Avatar */}
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            flexShrink: 0,
                          }}
                        >
                          {c.contact?.avatarUrl ? (
                            <img src={c.contact.avatarUrl} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#4ADE80" }}>
                              {displayName.substring(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>

                        {/* Detalles */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                            <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#F0EDE8", display: "flex", alignItems: "center", gap: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {displayName}
                            </span>
                            <span style={{ fontSize: "0.62rem", color: "#4ADE80", background: "rgba(74, 222, 128, 0.15)", padding: "2px 8px", borderRadius: "99px", fontWeight: 600, flexShrink: 0 }}>
                              WA
                            </span>
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "#8A8A8A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: "4px" }}>
                            {lastMsg}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.68rem" }}>
                            <span style={{ color: c.isAiActive ? "#4ADE80" : "#E1B668", fontWeight: 600 }}>
                              {c.isAiActive ? "● Bot IA Activo" : "● Humano"}
                            </span>
                            <span style={{ color: "#6A6A6A" }}>
                              {new Date(c.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )
              )}
            </div>
          </div>
        )}

        {/* Right Panel: Selected Chat Details */}
        {showChatPanel && (
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
            {activeTab === 'web' ? (
              selectedSession ? (
                <>
                  {/* Header with AI Intervention Toggle */}
                  <div
                    style={{
                      padding: "16px 24px",
                      background: "#161616",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                      display: "flex",
                      alignItems: isMobile ? "flex-start" : "center",
                      justifyContent: "space-between",
                      flexDirection: isMobile ? "column" : "row",
                      gap: isMobile ? "12px" : "0",
                    }}
                  >
                    <div>
                      {isMobile && (
                        <button
                          onClick={() => setSelectedSessionId(null)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#E1B668",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            marginBottom: "8px",
                            padding: 0,
                          }}
                        >
                          <ArrowLeft size={16} /> Conversaciones
                        </button>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
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
                        Origen: <strong style={{ color: "#E1B668" }}>{selectedSession.project === "BUCARE_PLAZA" ? "Bucare Plaza Comercial" : "Bucare Suite Apartamentos"}</strong>
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
                        width: isMobile ? "100%" : "auto",
                        justifyContent: "center",
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
                              maxWidth: "85%",
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
              )
            ) : (
              /* Panel de Conversación WhatsApp */
              selectedWaChat ? (
                <>
                  {/* Header WhatsApp */}
                  <div
                    style={{
                      padding: "16px 24px",
                      background: "#161616",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                      display: "flex",
                      alignItems: isMobile ? "flex-start" : "center",
                      justifyContent: "space-between",
                      flexDirection: isMobile ? "column" : "row",
                      gap: isMobile ? "12px" : "0",
                    }}
                  >
                    <div>
                      {isMobile && (
                        <button
                          onClick={() => setSelectedWaChatId(null)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#4ADE80",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            marginBottom: "8px",
                            padding: 0,
                          }}
                        >
                          <ArrowLeft size={16} /> Chats WhatsApp
                        </button>
                      )}
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div
                          style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "50%",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            flexShrink: 0,
                          }}
                        >
                          {selectedWaChat.contact?.avatarUrl ? (
                            <img src={selectedWaChat.contact.avatarUrl} alt={selectedWaChat.contactName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <span style={{ fontSize: "1.1rem", fontWeight: 700, color: "#4ADE80" }}>
                              {(selectedWaChat.contactName || selectedWaChat.contactPhone).substring(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>

                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#F0EDE8" }}>
                              {selectedWaChat.contactName || `Cliente +${selectedWaChat.contactPhone}`}
                            </span>
                            {selectedWaChat.contact && (
                              <button
                                onClick={() => handleOpenEditContactModal(selectedWaChat.contact)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#8A8A8A",
                                  cursor: "pointer",
                                  padding: "4px",
                                  borderRadius: "6px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  transition: "all 0.2s",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "#4ADE80")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "#8A8A8A")}
                                title="Editar detalles de contacto"
                              >
                                <Pencil size={14} />
                              </button>
                            )}
                          </div>
                          <div style={{ color: "#8A8A8A", fontSize: "0.8rem", marginTop: "2px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                            <span>Teléfono: <strong style={{ color: "#4ADE80" }}>+{selectedWaChat.contactPhone}</strong></span>
                            {selectedWaChat.contact?.company && (
                              <span>Empresa: <strong style={{ color: "#F0EDE8" }}>{selectedWaChat.contact.company}</strong></span>
                            )}
                            {selectedWaChat.contact?.birthDate && (
                              <span>Cumpleaños: <strong style={{ color: "#F0EDE8" }}>{new Date(selectedWaChat.contact.birthDate).toLocaleDateString()}</strong></span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "10px", width: isMobile ? "100%" : "auto", alignItems: "center" }}>
                      {waFeedback.text && (
                        <span style={{
                          fontSize: "0.72rem",
                          color: waFeedback.type === "success" ? "#4ADE80" : "#F87171",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          background: waFeedback.type === "success" ? "rgba(74,222,128,0.1)" : "rgba(248,113,113,0.1)",
                          border: `1px solid ${waFeedback.type === "success" ? "rgba(74,222,128,0.25)" : "rgba(248,113,113,0.25)"}`,
                          whiteSpace: "nowrap",
                        }}>
                          {waFeedback.text}
                        </span>
                      )}

                      <button
                        onClick={handleSyncWaMessages}
                        disabled={waLoading}
                        title="Traer mensajes reales desde WhatsApp"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 14px",
                          borderRadius: "10px",
                          background: "rgba(74, 222, 128, 0.08)",
                          color: "#4ADE80",
                          border: "1px solid rgba(74, 222, 128, 0.2)",
                          fontWeight: 600,
                          fontSize: "0.78rem",
                          cursor: waLoading ? "default" : "pointer",
                          opacity: waLoading ? 0.6 : 1,
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => { if (!waLoading) e.currentTarget.style.background = "rgba(74,222,128,0.18)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(74,222,128,0.08)"; }}
                      >
                        <RefreshCw size={14} style={{ animation: waLoading ? "spin 1s linear infinite" : "none" }} />
                        {waLoading ? "Sincronizando..." : "Actualizar"}
                      </button>

                      <button
                        onClick={handleToggleWaAi}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px 16px",
                          borderRadius: "10px",
                          background: selectedWaChat.isAiActive ? "rgba(74, 222, 128, 0.15)" : "rgba(225, 182, 104, 0.15)",
                          color: selectedWaChat.isAiActive ? "#4ADE80" : "#E1B668",
                          border: selectedWaChat.isAiActive ? "1px solid rgba(74, 222, 128, 0.3)" : "1px solid rgba(225, 182, 104, 0.3)",
                          fontWeight: 700,
                          fontSize: "0.8rem",
                          cursor: "pointer",
                        }}
                      >
                        {selectedWaChat.isAiActive ? (
                          <>
                            <Bot size={16} /> Bot Activo (Pausar)
                          </>
                        ) : (
                          <>
                            <Pause size={16} /> Bot Pausado (Responder Manual)
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Messages feed WhatsApp */}
                  <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px", background: "rgba(0,0,0,0.2)" }}>
                    {selectedWaChat.messages.length === 0 ? (
                      <div style={{ padding: "40px", textAlign: "center", color: "#6A6A6A" }}>Sin mensajes en esta conversación.</div>
                    ) : (
                      selectedWaChat.messages.map((m: any) => {
                        const isUser = m.sender === "USER";
                        const isAdmin = m.sender === "ADMIN";

                        return (
                          <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: isUser ? "flex-start" : "flex-end" }}>
                            <span style={{ fontSize: "0.65rem", color: "#6A6A6A", marginBottom: "4px", padding: "0 4px" }}>
                              {isUser ? "Cliente (WhatsApp)" : isAdmin ? "Tú (Administrador)" : "IA Gemini (WhatsApp)"} ·{" "}
                              {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <div
                              style={{
                                maxWidth: "85%",
                                padding: "12px 16px",
                                borderRadius: isUser ? "16px 16px 16px 2px" : "16px 16px 2px 16px",
                                background: isUser
                                  ? "rgba(255, 255, 255, 0.06)"
                                  : isAdmin
                                  ? "linear-gradient(135deg, #122a16 0%, #0c1c0f 100%)"
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
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Formulario envío WhatsApp */}
                  <form
                    onSubmit={handleSendWaMessage}
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
                      placeholder="Enviar mensaje de WhatsApp..."
                      value={waInput}
                      onChange={(e) => setWaInput(e.target.value)}
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
                      disabled={waLoading || !waInput.trim()}
                      style={{
                        padding: "0 24px",
                        borderRadius: "12px",
                        background: "#4ADE80",
                        color: "#0A0A0A",
                        fontWeight: 700,
                        fontSize: "0.88rem",
                        border: "none",
                        cursor: waInput.trim() ? "pointer" : "default",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <Send size={16} /> Enviar
                    </button>
                  </form>
                </>
              ) : (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#6A6A6A" }}>
                  Selecciona una conversación de WhatsApp para gestionar
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Modal para WhatsApp Automation & QR Code */}
      {showWaModal && (
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
              maxWidth: "680px",
              background: "#121212",
              border: "1px solid rgba(74, 222, 128, 0.3)",
              borderRadius: "20px",
              padding: "clamp(16px, 4vw, 28px)",
              position: "relative",
              boxShadow: "0 24px 48px rgba(0, 0, 0, 0.6)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <h3 style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: "1.3rem", color: "#F0EDE8", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                  <Smartphone className="text-emerald-400" /> Control Bot de WhatsApp (WA-Automate)
                </h3>
                <div style={{ color: "#8A8A8A", fontSize: "0.78rem", marginTop: "4px" }}>
                  Conecta el bot de IA a WhatsApp mediante código QR para auto-responder a clientes y notificar citas.
                </div>
              </div>

              <button onClick={() => setShowWaModal(false)} style={{ background: "none", border: "none", color: "#8A8A8A", cursor: "pointer", fontSize: "1.2rem" }}>
                ✕
              </button>
            </div>

            {/* Status Card */}
            <div style={{ background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "14px", padding: "18px", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <span style={{ fontSize: "0.7rem", color: "#8A8A8A", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.1em" }}>ESTADO DE CONEXIÓN</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                    <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: waStatus.connected ? "#4ADE80" : "#E1B668" }} />
                    <span style={{ fontSize: "1.1rem", fontWeight: 800, color: waStatus.connected ? "#4ADE80" : "#E1B668" }}>
                      {waStatus.connected ? "Conectado y Operativo" : waStatus.qrCode ? "Pendiente por Vincular (Código QR listo)" : "Desconectado"}
                    </span>
                  </div>
                  {waStatus.phone && (
                    <div style={{ fontSize: "0.8rem", color: "#8A8A8A", marginTop: "4px" }}>
                      Línea activa: <strong style={{ color: "#F0EDE8" }}>+{waStatus.phone}</strong>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  {waStatus.connected ? (
                    <button
                      onClick={handleDisconnectWa}
                      disabled={waLoading}
                      style={{ padding: "8px 14px", borderRadius: "8px", background: "#EF4444", color: "#FFFFFF", fontWeight: 700, fontSize: "0.78rem", border: "none", cursor: "pointer" }}
                    >
                      {waLoading ? "Desconectando..." : "Desconectar Cuenta"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleInitWaWithPhone()}
                      disabled={waLoading}
                      style={{ padding: "8px 14px", borderRadius: "8px", background: "#4ADE80", color: "#0A0A0A", fontWeight: 700, fontSize: "0.78rem", border: "none", cursor: "pointer" }}
                    >
                      {waLoading ? "Iniciando..." : "Iniciar Sesión"}
                    </button>
                  )}
                  <button
                    onClick={handleRestartWa}
                    disabled={waLoading}
                    style={{ padding: "8px 14px", borderRadius: "8px", background: "rgba(255,255,255,0.08)", color: "#F0EDE8", border: "1px solid rgba(255,255,255,0.15)", fontSize: "0.78rem", cursor: "pointer" }}
                  >
                    Reiniciar
                  </button>
                </div>
              </div>
            </div>

            {/* Selector de Número de Teléfono (Multi-Sesión) */}
            {!waStatus.connected && (
              <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "14px", padding: "18px", marginBottom: "20px" }}>
                <h4 style={{ color: "#F0EDE8", fontWeight: 700, margin: "0 0 12px", fontSize: "0.9rem" }}>
                  Seleccionar Número de Teléfono para Conectar
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => handleInitWaWithPhone("584241111111")}
                      disabled={waLoading}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "8px",
                        background: "rgba(225, 182, 104, 0.12)",
                        border: "1px solid rgba(225, 182, 104, 0.3)",
                        color: "#E1B668",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Bucare Suite (+584241111111)
                    </button>
                    <button
                      onClick={() => handleInitWaWithPhone("584242222222")}
                      disabled={waLoading}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "8px",
                        background: "rgba(74, 222, 128, 0.12)",
                        border: "1px solid rgba(74, 222, 128, 0.3)",
                        color: "#4ADE80",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Bucare Plaza (+584242222222)
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                    <input
                      type="text"
                      placeholder="Número personalizado (ej. 584249999999)"
                      value={phoneToInit}
                      onChange={(e) => setPhoneToInit(e.target.value)}
                      style={{
                        flex: 1,
                        background: "rgba(255, 255, 255, 0.05)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        color: "#F0EDE8",
                        fontSize: "0.85rem",
                        outline: "none",
                      }}
                    />
                    <button
                      onClick={() => handleInitWaWithPhone()}
                      disabled={waLoading || !phoneToInit.trim()}
                      style={{
                        padding: "0 16px",
                        borderRadius: "8px",
                        background: "#E1B668",
                        color: "#0A0A0A",
                        fontWeight: 700,
                        fontSize: "0.8rem",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Conectar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Loading / Initializing State Banner */}
            {!waStatus.connected && waStatus.initializing && !waStatus.qrCode && (
              <div style={{ background: "rgba(59, 130, 246, 0.08)", border: "1px solid rgba(59, 130, 246, 0.3)", borderRadius: "16px", padding: "24px", textAlign: "center", marginBottom: "20px" }}>
                <Loader2 className="animate-spin" style={{ margin: "0 auto 12px", color: "#3B82F6", width: "28px", height: "28px" }} />
                <h4 style={{ color: "#3B82F6", fontWeight: 800, margin: "0 0 6px", fontSize: "1rem" }}>
                  Iniciando navegador y generando Código QR...
                </h4>
                <p style={{ color: "#8A8A8A", fontSize: "0.8rem", margin: 0 }}>
                  Por favor espera unos segundos mientras se prepara la sesión de WhatsApp Web.
                </p>
              </div>
            )}

            {/* QR Code Scanner Display - PNG image */}
            {waStatus.qrCode && !waStatus.connected && (
              <div style={{ background: "rgba(225, 182, 104, 0.08)", border: "1px solid rgba(225, 182, 104, 0.3)", borderRadius: "16px", padding: "20px", textAlign: "center", marginBottom: "20px" }}>
                <h4 style={{ color: "#E1B668", fontWeight: 800, margin: "0 0 8px", fontSize: "1rem" }}>
                  Escanea el Código QR con tu WhatsApp
                </h4>
                <p style={{ color: "#8A8A8A", fontSize: "0.78rem", margin: "0 0 16px" }}>
                  Abre WhatsApp en tu teléfono inteligente → Ajustes / Configuración → <strong>Dispositivos vinculados</strong> → Vincular un dispositivo.
                </p>
                <div style={{ background: "#FFFFFF", padding: "16px", borderRadius: "16px", display: "inline-block", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
                  <img src={waStatus.qrCode} alt="WhatsApp QR Code" style={{ width: "220px", height: "220px", display: "block", objectFit: "contain" }} />
                </div>
              </div>
            )}

            {/* QR Code ASCII fallback - shown while PNG is loading */}
            {waStatus.qrAscii && !waStatus.qrCode && !waStatus.connected && (
              <div style={{ background: "rgba(225, 182, 104, 0.08)", border: "1px solid rgba(225, 182, 104, 0.3)", borderRadius: "16px", padding: "20px", textAlign: "center", marginBottom: "20px" }}>
                <h4 style={{ color: "#E1B668", fontWeight: 800, margin: "0 0 8px", fontSize: "1rem" }}>
                  Escanea el Código QR con tu WhatsApp
                </h4>
                <p style={{ color: "#8A8A8A", fontSize: "0.78rem", margin: "0 0 16px" }}>
                  Abre WhatsApp en tu teléfono → Ajustes → <strong>Dispositivos vinculados</strong> → Vincular un dispositivo.
                </p>
                <div style={{ background: "#111", padding: "12px 16px", borderRadius: "12px", display: "inline-block", boxShadow: "0 8px 24px rgba(0,0,0,0.5)", textAlign: "left" }}>
                  <pre style={{ color: "#fff", fontSize: "5px", lineHeight: "6px", letterSpacing: "0px", margin: 0, fontFamily: "monospace", whiteSpace: "pre" }}>{waStatus.qrAscii}</pre>
                </div>
                <p style={{ color: "#8A8A8A", fontSize: "0.7rem", margin: "8px 0 0" }}>QR en modo texto — aléjate un poco para escanearlo mejor</p>
              </div>
            )}

            {/* Manual Test Message Form */}
            <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "14px", padding: "18px" }}>
              <h4 style={{ color: "#F0EDE8", fontWeight: 700, margin: "0 0 12px", fontSize: "0.9rem" }}>
                Prueba de Envío Directo por WhatsApp
              </h4>

              <form onSubmit={handleSendTestWa} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "#8A8A8A", textTransform: "uppercase", fontWeight: 600 }}>Número Telefónico del Cliente (ej. 584241234567)</label>
                  <input
                    type="text"
                    placeholder="Ej. 584241234567"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#F0EDE8", fontSize: "0.85rem", marginTop: "4px", outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.7rem", color: "#8A8A8A", textTransform: "uppercase", fontWeight: 600 }}>Mensaje a Enviar</label>
                  <textarea
                    rows={3}
                    placeholder="Escribe un mensaje de prueba..."
                    value={testMsg}
                    onChange={(e) => setTestMsg(e.target.value)}
                    style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#F0EDE8", fontSize: "0.85rem", marginTop: "4px", outline: "none" }}
                  />
                </div>

                {waFeedback.text && (
                  <div style={{ fontSize: "0.78rem", color: waFeedback.type === "success" ? "#4ADE80" : "#F87171" }}>
                    {waFeedback.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={waLoading || !testPhone.trim() || !testMsg.trim()}
                  style={{ padding: "10px", borderRadius: "8px", background: "#E1B668", color: "#0A0A0A", fontWeight: 700, fontSize: "0.82rem", border: "none", cursor: "pointer" }}
                >
                  {waLoading ? "Enviando..." : "Enviar Mensaje WhatsApp"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

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
              padding: "clamp(16px, 4vw, 28px)",
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
                <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", flexDirection: isMobile ? "column" : "row", gap: isMobile ? "12px" : "0", marginBottom: "12px" }}>
                  <label style={{ color: "#E1B668", fontWeight: 700, fontSize: "0.9rem" }}>
                    Bucare Suite (Apartamentos)
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", width: isMobile ? "100%" : "auto" }}>
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
                        flex: isMobile ? 1 : "auto",
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

                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", marginBottom: "16px" }}>
                  <input
                    type="checkbox"
                    id="auto-rotate-suite"
                    checked={aiConfigs["BUCARE_SUITE"]?.autoRotate !== false}
                    onChange={(e) =>
                      setAiConfigs((prev) => ({
                        ...prev,
                        BUCARE_SUITE: { ...prev.BUCARE_SUITE, autoRotate: e.target.checked },
                      }))
                    }
                    style={{ cursor: "pointer", accentColor: "#E1B668" }}
                  />
                  <label htmlFor="auto-rotate-suite" style={{ color: "#8A8A8A", fontSize: "0.78rem", cursor: "pointer", userSelect: "none" }}>
                    Activar cambio automático de modelo ante fallas (Rotación Inteligente)
                  </label>
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
                    width: isMobile ? "100%" : "auto",
                  }}
                >
                  Guardar Configuración Suite
                </button>
              </div>

              {/* Bucare Plaza Config */}
              <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(74, 222, 128, 0.2)", borderRadius: "14px", padding: "18px" }}>
                <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", flexDirection: isMobile ? "column" : "row", gap: isMobile ? "12px" : "0", marginBottom: "12px" }}>
                  <label style={{ color: "#4ADE80", fontWeight: 700, fontSize: "0.9rem" }}>
                    Bucare Plaza (Comercial)
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", width: isMobile ? "100%" : "auto" }}>
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
                        flex: isMobile ? 1 : "auto",
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

                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px", marginBottom: "16px" }}>
                  <input
                    type="checkbox"
                    id="auto-rotate-plaza"
                    checked={aiConfigs["BUCARE_PLAZA"]?.autoRotate !== false}
                    onChange={(e) =>
                      setAiConfigs((prev) => ({
                        ...prev,
                        BUCARE_PLAZA: { ...prev.BUCARE_PLAZA, autoRotate: e.target.checked },
                      }))
                    }
                    style={{ cursor: "pointer", accentColor: "#4ADE80" }}
                  />
                  <label htmlFor="auto-rotate-plaza" style={{ color: "#8A8A8A", fontSize: "0.78rem", cursor: "pointer", userSelect: "none" }}>
                    Activar cambio automático de modelo ante fallas (Rotación Inteligente)
                  </label>
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
                    width: isMobile ? "100%" : "auto",
                  }}
                >
                  Guardar Configuración Plaza
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Simular Mensaje Entrante de Cliente WhatsApp */}
      {showSimulateModal && (
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
              maxWidth: "500px",
              background: "#121212",
              border: "1px solid rgba(74, 222, 128, 0.3)",
              borderRadius: "20px",
              padding: "24px",
              position: "relative",
              boxShadow: "0 24px 48px rgba(0, 0, 0, 0.6)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "#F0EDE8", margin: 0 }}>
                Simular Mensaje de Cliente (WhatsApp)
              </h3>
              <button onClick={() => setShowSimulateModal(false)} style={{ background: "none", border: "none", color: "#8A8A8A", cursor: "pointer", fontSize: "1.2rem" }}>
                ✕
              </button>
            </div>

            <p style={{ color: "#8A8A8A", fontSize: "0.8rem", marginBottom: "16px", lineHeight: 1.5 }}>
              Envía un mensaje de prueba simulando ser el cliente actual (+{selectedWaChat?.contactPhone}). Esto disparará la auto-respuesta del bot si está activo.
            </p>

            <form onSubmit={handleSimulateIncoming} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <textarea
                rows={3}
                required
                placeholder="Escribe el mensaje del cliente..."
                value={simulatedMessageText}
                onChange={(e) => setSimulatedMessageText(e.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "10px",
                  padding: "12px",
                  color: "#F0EDE8",
                  fontSize: "0.88rem",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "10px",
                  borderRadius: "8px",
                  background: "#4ADE80",
                  color: "#0A0A0A",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Enviar Simulación
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Editar Perfil del Contacto de WhatsApp */}
      {showEditContactModal && (
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
              maxWidth: "520px",
              background: "#121212",
              border: "1px solid rgba(74, 222, 128, 0.3)",
              borderRadius: "20px",
              padding: "24px",
              position: "relative",
              boxShadow: "0 24px 48px rgba(0, 0, 0, 0.6)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <h3 style={{ fontFamily: "'Archivo', sans-serif", fontWeight: 800, fontSize: "1.15rem", color: "#F0EDE8", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Pencil size={18} className="text-emerald-400" /> Editar Detalles de Contacto
              </h3>
              <button onClick={() => setShowEditContactModal(false)} style={{ background: "none", border: "none", color: "#8A8A8A", cursor: "pointer", fontSize: "1.2rem" }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveContactUpdate} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ fontSize: "0.7rem", color: "#8A8A8A", textTransform: "uppercase", fontWeight: 600 }}>Nombre del Contacto</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Pérez"
                  value={contactNameInput}
                  onChange={(e) => setContactNameInput(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#F0EDE8", fontSize: "0.85rem", marginTop: "4px", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.7rem", color: "#8A8A8A", textTransform: "uppercase", fontWeight: 600 }}>URL del Avatar / Imagen</label>
                <input
                  type="url"
                  placeholder="Ej. https://url-de-la-imagen.png"
                  value={contactAvatarInput}
                  onChange={(e) => setContactAvatarInput(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#F0EDE8", fontSize: "0.85rem", marginTop: "4px", outline: "none" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "#8A8A8A", textTransform: "uppercase", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                    <Calendar size={12} /> Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    value={contactBirthDateInput}
                    onChange={(e) => setContactBirthDateInput(e.target.value)}
                    style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#F0EDE8", fontSize: "0.85rem", marginTop: "4px", outline: "none" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.7rem", color: "#8A8A8A", textTransform: "uppercase", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                    <Mail size={12} /> Correo Electrónico
                  </label>
                  <input
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={contactEmailInput}
                    onChange={(e) => setContactEmailInput(e.target.value)}
                    style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#F0EDE8", fontSize: "0.85rem", marginTop: "4px", outline: "none" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.7rem", color: "#8A8A8A", textTransform: "uppercase", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                  <Briefcase size={12} /> Empresa / Organización
                </label>
                <input
                  type="text"
                  placeholder="Ej. Bucare Development"
                  value={contactCompanyInput}
                  onChange={(e) => setContactCompanyInput(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#F0EDE8", fontSize: "0.85rem", marginTop: "4px", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.7rem", color: "#8A8A8A", textTransform: "uppercase", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                  <FileText size={12} /> Notas Adicionales
                </label>
                <textarea
                  rows={3}
                  placeholder="Notas libres sobre el cliente..."
                  value={contactNotesInput}
                  onChange={(e) => setContactNotesInput(e.target.value)}
                  style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#F0EDE8", fontSize: "0.85rem", marginTop: "4px", outline: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button
                  type="button"
                  onClick={() => setShowEditContactModal(false)}
                  style={{ flex: 1, padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.08)", color: "#F0EDE8", border: "1px solid rgba(255,255,255,0.15)", fontSize: "0.85rem", cursor: "pointer" }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingContact}
                  style={{ flex: 1, padding: "10px", borderRadius: "8px", background: "#4ADE80", color: "#0A0A0A", fontWeight: 700, fontSize: "0.85rem", border: "none", cursor: "pointer" }}
                >
                  {isUpdatingContact ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
