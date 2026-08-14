import React, { useState } from "react";
import { UploadCloud, Loader2, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

import { getApiUrl } from "@/lib/api";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

/**
 * Optimiza y comprime una imagen en el cliente convirtiéndola a WebP
 * redimensionando proporcionalmente para SEO y velocidad de carga web.
 */
function optimizeImage(file: File, maxWidth = 1920, maxHeight = 1080, quality = 0.82): Promise<{ base64: string; optimizedName: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;

      // Escalar proporcionalmente si excede los límites máximos
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("No se pudo obtener el contexto 2D del Canvas"));
        return;
      }

      // Dibujar imagen optimizada
      ctx.drawImage(img, 0, 0, width, height);

      // Exportar en formato WebP comprimido (SEO & Carga rápida)
      const base64 = canvas.toDataURL("image/webp", quality);
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      const optimizedName = `${nameWithoutExt}.webp`;

      resolve({ base64, optimizedName });
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };

    img.src = objectUrl;
  });
}

export function ImageUploader({ value, onChange, label }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Por favor arrastre un archivo de imagen válido (.jpg, .png, .webp, .svg)");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert("El archivo excede el tamaño máximo permitido de 20MB.");
      return;
    }

    setUploading(true);
    setUploadProgress(20);

    try {
      // 1. Optimización WebP asíncrona en cliente
      setUploadProgress(40);
      const { base64, optimizedName } = await optimizeImage(file);

      // 2. Subida al servidor backend
      setUploadProgress(75);
      const token = localStorage.getItem("token");

      const res = await fetch(getApiUrl("/api/v1/upload"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64,
          fileName: optimizedName,
        }),
      });

      setUploadProgress(100);
      const json = await res.json();
      if (res.ok && json.success && json.data?.url) {
        onChange(json.data.url);
      } else {
        alert(json.message || "Error al subir la imagen.");
      }
    } catch (e: any) {
      alert("Error procesando u optimizando la imagen: " + e.message);
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 300);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-xs font-semibold block" style={{ color: "var(--dash-muted)" }}>
          {label}
        </label>
      )}

      {/* Área interactiva única de Arrastrar y Soltar */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative group rounded-xl overflow-hidden border-2 transition-all duration-200 h-32 flex flex-col items-center justify-center text-center ${
          isDragging
            ? "border-emerald-400 bg-emerald-500/15 ring-4 ring-emerald-500/20 scale-[1.01]"
            : uploading
            ? "border-emerald-500/50 bg-black/40"
            : value
            ? "border-white/15 bg-black/40"
            : "border-dashed border-white/20 hover:border-white/40 bg-black/20"
        }`}
      >
        {/* Capa de fondo si ya existe una imagen */}
        {value && !isDragging && !uploading && (
          <>
            <img src={value} alt="Vista previa" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/70 transition-colors flex flex-col items-center justify-center p-2 opacity-90 group-hover:opacity-100">
              <UploadCloud className="h-6 w-6 text-white/80 group-hover:text-emerald-400 group-hover:scale-110 transition-all mb-1" />
              <span className="text-[11px] font-semibold text-white tracking-wide">
                Arrastra una nueva imagen para cambiar
              </span>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
                className="mt-2 h-6 px-2 text-[10px] gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} /> Eliminar foto
              </Button>
            </div>
          </>
        )}

        {/* Estado de Carga y Optimización WebP Asíncrona */}
        {uploading && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center p-3 text-emerald-400 gap-2 animate-fade-in z-20">
            <div className="flex items-center gap-2 text-emerald-400">
              <Sparkles className="h-5 w-5 animate-pulse" />
              <span className="text-xs font-semibold tracking-wide text-white">Optimizando y convirtiendo a WebP...</span>
            </div>
            <div className="w-3/4 bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-emerald-400 h-full transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Estado Visual al Arrastrar Sobre el Elemento */}
        {isDragging && !uploading && (
          <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center text-emerald-400 gap-2 p-2 z-30 animate-fade-in">
            <UploadCloud className="h-9 w-9 animate-bounce text-emerald-300" />
            <span className="text-xs font-bold text-white tracking-wide">
              ¡Suelta la imagen! Se optimizará para Web automáticamente.
            </span>
          </div>
        )}

        {/* Estado Inicial Vacio */}
        {!value && !isDragging && !uploading && (
          <div className="flex flex-col items-center justify-center p-4">
            <UploadCloud className="h-8 w-8 mb-2 text-emerald-400/80 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-semibold tracking-wide" style={{ color: "var(--dash-text)" }}>
              Arrastra y suelta tu imagen (Hasta 20MB)
            </p>
            <p className="text-[10px] mt-1 text-emerald-400/90 flex items-center gap-1 font-medium">
              <Sparkles size={11} /> Auto-optimización WebP & SEO activada
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
