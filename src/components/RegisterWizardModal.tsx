import React, { useState, useEffect } from "react";
import { X, ArrowRight, ArrowLeft, CheckCircle2, User, Mail, Phone, Lock, Calendar, Sparkles } from "lucide-react";

interface RegisterWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialName?: string;
  onSuccess: (data: { token: string; user: any }) => void;
}

export const RegisterWizardModal: React.FC<RegisterWizardModalProps> = ({
  isOpen,
  onClose,
  initialName = "",
  onSuccess,
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: initialName,
    email: "",
    phoneNumber: "",
    password: "",
    passwordConfirm: "",
    birthDate: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialName && !formData.fullName) {
      setFormData((prev) => ({ ...prev, fullName: initialName }));
    }
  }, [initialName]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (step === 1) {
      if (!formData.fullName.trim()) {
        setError("Por favor ingresa tu nombre completo.");
        return;
      }
      if (!formData.email.trim() || !formData.email.includes("@")) {
        setError("Por favor ingresa un correo electrónico válido.");
        return;
      }
      setStep(2);
    }
  };

  const handleFinalRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.password || formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (formData.password !== formData.passwordConfirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      // 1. Crear cuenta
      const regRes = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phoneNumber: formData.phoneNumber.trim() || undefined,
          birthDate: formData.birthDate || undefined,
        }),
      });

      const regData = await regRes.json();
      if (!regRes.ok) {
        throw new Error(regData.message || "Error al crear la cuenta.");
      }

      // 2. Autenticar inmediatamente (Login)
      const loginRes = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const loginData = await loginRes.json();
      if (!loginRes.ok) {
        throw new Error("Cuenta creada con éxito. Por favor inicia sesión.");
      }

      setStep(3);
      setTimeout(() => {
        onSuccess(loginData.data);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado durante el registro.");
    } finally {
      setLoading(false);
    }
  };

  return (
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
          maxWidth: "480px",
          background: "#121212",
          border: "1px solid rgba(225, 182, 104, 0.3)",
          borderRadius: "24px",
          padding: "28px",
          position: "relative",
          boxShadow: "0 24px 48px rgba(0, 0, 0, 0.6)",
        }}
      >
        {/* Header con botón cerrar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={18} color="#E1B668" />
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#E1B668", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Registro Rápido
            </span>
          </div>

          <button onClick={onClose} style={{ background: "none", border: "none", color: "#8A8A8A", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        {/* Indicador de Pasos (Wizard Progress) */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}>
          <div style={{ flex: 1, height: "4px", borderRadius: "2px", background: step >= 1 ? "#E1B668" : "rgba(255,255,255,0.1)" }} />
          <div style={{ flex: 1, height: "4px", borderRadius: "2px", background: step >= 2 ? "#E1B668" : "rgba(255,255,255,0.1)" }} />
          <div style={{ flex: 1, height: "4px", borderRadius: "2px", background: step >= 3 ? "#4ADE80" : "rgba(255,255,255,0.1)" }} />
        </div>

        {error && (
          <div style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#EF4444", fontSize: "0.8rem", marginBottom: "16px" }}>
            {error}
          </div>
        )}

        {/* PASO 1: DATOS PERSONALES */}
        {step === 1 && (
          <form onSubmit={handleNextStep}>
            <h2 style={{ fontFamily: "'Archivo', sans-serif", fontSize: "1.3rem", fontWeight: 800, color: "#F0EDE8", margin: "0 0 6px" }}>
              Tus datos de contacto
            </h2>
            <p style={{ fontSize: "0.8rem", color: "#8A8A8A", margin: "0 0 20px" }}>
              Crea tu cuenta para vincular tu chat y guardar tus preferencias.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#AAA", marginBottom: "6px" }}>
                  Nombre Completo *
                </label>
                <div style={{ position: "relative" }}>
                  <User size={16} style={{ position: "absolute", left: "14px", top: "14px", color: "#6A6A6A" }} />
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="Ej. Carlos Mendoza"
                    value={formData.fullName}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: "12px",
                      padding: "12px 14px 12px 40px",
                      color: "#F0EDE8",
                      fontSize: "0.88rem",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#AAA", marginBottom: "6px" }}>
                  Correo Electrónico *
                </label>
                <div style={{ position: "relative" }}>
                  <Mail size={16} style={{ position: "absolute", left: "14px", top: "14px", color: "#6A6A6A" }} />
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="tu@correo.com"
                    value={formData.email}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: "12px",
                      padding: "12px 14px 12px 40px",
                      color: "#F0EDE8",
                      fontSize: "0.88rem",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#AAA", marginBottom: "6px" }}>
                  Teléfono (Opcional)
                </label>
                <div style={{ position: "relative" }}>
                  <Phone size={16} style={{ position: "absolute", left: "14px", top: "14px", color: "#6A6A6A" }} />
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="+58 412 1234567"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: "12px",
                      padding: "12px 14px 12px 40px",
                      color: "#F0EDE8",
                      fontSize: "0.88rem",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                marginTop: "24px",
                padding: "14px",
                borderRadius: "12px",
                background: "#E1B668",
                color: "#0A0A0A",
                fontWeight: 800,
                fontSize: "0.9rem",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              Siguiente Paso <ArrowRight size={18} />
            </button>
          </form>
        )}

        {/* PASO 2: CONTRASEÑA & PREFERENCIAS */}
        {step === 2 && (
          <form onSubmit={handleFinalRegister}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ background: "none", border: "none", color: "#E1B668", cursor: "pointer", padding: 0 }}
              >
                <ArrowLeft size={18} />
              </button>
              <h2 style={{ fontFamily: "'Archivo', sans-serif", fontSize: "1.3rem", fontWeight: 800, color: "#F0EDE8", margin: 0 }}>
                Crea tu contraseña
              </h2>
            </div>
            <p style={{ fontSize: "0.8rem", color: "#8A8A8A", margin: "0 0 20px" }}>
              Protege el acceso a tu portal y agendamiento de visitas.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#AAA", marginBottom: "6px" }}>
                  Contraseña *
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} style={{ position: "absolute", left: "14px", top: "14px", color: "#6A6A6A" }} />
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: "12px",
                      padding: "12px 14px 12px 40px",
                      color: "#F0EDE8",
                      fontSize: "0.88rem",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#AAA", marginBottom: "6px" }}>
                  Confirmar Contraseña *
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={16} style={{ position: "absolute", left: "14px", top: "14px", color: "#6A6A6A" }} />
                  <input
                    type="password"
                    name="passwordConfirm"
                    required
                    placeholder="Repite tu contraseña"
                    value={formData.passwordConfirm}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: "12px",
                      padding: "12px 14px 12px 40px",
                      color: "#F0EDE8",
                      fontSize: "0.88rem",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#AAA", marginBottom: "6px" }}>
                  Fecha de Nacimiento (Opcional)
                </label>
                <div style={{ position: "relative" }}>
                  <Calendar size={16} style={{ position: "absolute", left: "14px", top: "14px", color: "#6A6A6A" }} />
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: "12px",
                      padding: "12px 14px 12px 40px",
                      color: "#F0EDE8",
                      fontSize: "0.88rem",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  padding: "14px 20px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "#8A8A8A",
                  fontWeight: 700,
                  fontSize: "0.88rem",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  cursor: "pointer",
                }}
              >
                Atrás
              </button>

              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "12px",
                  background: "#4ADE80",
                  color: "#0A0A0A",
                  fontWeight: 800,
                  fontSize: "0.9rem",
                  border: "none",
                  cursor: loading ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {loading ? "Creando Cuenta..." : "Completar Registro"}
              </button>
            </div>
          </form>
        )}

        {/* PASO 3: ÉXITO */}
        {step === 3 && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <CheckCircle2 size={54} color="#4ADE80" style={{ margin: "0 auto 16px" }} />
            <h2 style={{ fontFamily: "'Archivo', sans-serif", fontSize: "1.4rem", fontWeight: 800, color: "#F0EDE8", margin: "0 0 8px" }}>
              ¡Registro Completado!
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#8A8A8A", margin: 0 }}>
              Tu conversación de chat ha sido vinculada exitosamente a tu cuenta.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
