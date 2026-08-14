import React, { useEffect, useState } from "react";
import { getApiUrl } from "@/lib/api";

interface GoogleLoginButtonProps {
  onSuccess: (data: { token: string; user: any }) => void;
  onError: (error: string) => void;
  text?: string;
}

declare global {
  interface Window {
    google?: any;
  }
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onError,
  text = "Continuar con Google",
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Client ID de Google OAuth
  const clientId =
    (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ||
    "426752395779-hou9j3f6cq5kqnqp3svc0ih9qjprpdou.apps.googleusercontent.com";

  useEffect(() => {
    const initGsi = () => {
      if (window.google?.accounts?.id && clientId) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            auto_select: false,
            use_fedcm_for_prompt: true,
            callback: async (response: any) => {
              if (!response?.credential) return;
              setIsLoading(true);
              try {
                const apiRes = await fetch(getApiUrl("/api/v1/auth/google"), {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ idToken: response.credential }),
                });

                const data = await apiRes.json();
                if (!apiRes.ok) {
                  throw new Error(data.message || "Error al autenticar con Google");
                }

                onSuccess(data.data);
              } catch (err: any) {
                onError(err.message || "Error de conexión con el servidor");
              } finally {
                setIsLoading(false);
              }
            },
          });
        } catch (e) {
          console.error("GSI Init error:", e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else if (!document.getElementById("google-gsi-script")) {
      const script = document.createElement("script");
      script.id = "google-gsi-script";
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initGsi;
      document.head.appendChild(script);
    }
  }, [clientId]);

  const handleGoogleClick = () => {
    if (!clientId) {
      onError("El CLIENT ID de Google OAuth no está configurado (VITE_GOOGLE_CLIENT_ID).");
      return;
    }

    if (!window.google?.accounts?.id) {
      onError("Cargando servicios de Google, por favor reintenta en un momento...");
      return;
    }

    setIsLoading(true);

    try {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setIsLoading(false);
          // Si One Tap fue bloqueado/omitido, redirigir al flujo de autorización estándar de Google
          const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&response_type=id_token&scope=openid%20email%20profile&redirect_uri=${encodeURIComponent(
            window.location.origin + "/login"
          )}&nonce=${Math.random().toString(36).substring(2)}`;

          window.location.href = redirectUrl;
        }
      });
    } catch (e: any) {
      setIsLoading(false);
      onError(e.message || "Error al abrir inicio de sesión de Google");
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleClick}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 bg-card text-foreground border border-border py-3.5 px-4 rounded-md text-xs sm:text-sm font-semibold tracking-[0.1em] uppercase hover:bg-muted/50 transition-all shadow-xs cursor-pointer disabled:opacity-50"
    >
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
      <span style={{ color: "#FFFFFF", fontWeight: 600 }}>{isLoading ? "Conectando..." : text}</span>
    </button>
  );
};
