import React, { useState } from "react";
import { UploadCloud, Loader2, X, Film } from "lucide-react";
import { Button } from "@/components/ui/button";

import { getApiUrl } from "@/lib/api";

interface VideoUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export function VideoUploader({ value, onChange, label }: VideoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const processFile = async (file: File) => {
    if (!file.type.startsWith("video/")) {
      alert("Por favor sube un archivo de video válido (.mp4, .webm, .ogg)");
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      alert("El video excede el tamaño máximo permitido de 20MB.");
      return;
    }

    setUploading(true);
    setUploadProgress(20);

    try {
      setUploadProgress(40);
      const reader = new FileReader();

      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
      });

      reader.readAsDataURL(file);
      const base64 = await base64Promise;

      setUploadProgress(70);
      const token = localStorage.getItem("token");

      const res = await fetch(getApiUrl("/api/v1/upload"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64,
          fileName: file.name,
        }),
      });

      setUploadProgress(100);
      const json = await res.json();
      if (res.ok && json.success && json.data?.url) {
        onChange(json.data.url);
      } else {
        alert(json.message || "Error al subir el video.");
      }
    } catch (e: any) {
      alert("Error procesando el video: " + e.message);
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
        {/* Vista previa del video */}
        {value && !isDragging && !uploading && (
          <>
            <video
              src={value}
              muted
              playsInline
              autoPlay
              loop
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/80 transition-colors flex flex-col items-center justify-center p-2 opacity-95 group-hover:opacity-100">
              <Film className="h-6 w-6 text-white/80 group-hover:text-emerald-400 group-hover:scale-110 transition-all mb-1" />
              <span className="text-[11px] font-semibold text-white tracking-wide">
                Arrastra un nuevo video para cambiar
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
                <X size={12} /> Eliminar video
              </Button>
            </div>
          </>
        )}

        {/* Estado de Carga */}
        {uploading && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center p-3 text-emerald-400 gap-2 z-20">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-xs font-semibold tracking-wide text-white">Subiendo video...</span>
            </div>
            <div className="w-3/4 bg-white/10 h-1.5 rounded-full overflow-hidden mt-1">
              <div
                className="bg-emerald-400 h-full transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Estado al Arrastrar */}
        {isDragging && !uploading && (
          <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center text-emerald-400 gap-2 p-2 z-30">
            <UploadCloud className="h-9 w-9 animate-bounce text-emerald-300" />
            <span className="text-xs font-bold text-white tracking-wide">
              ¡Suelta el video para subirlo!
            </span>
          </div>
        )}

        {/* Estado Vacío */}
        {!value && !isDragging && !uploading && (
          <div className="flex flex-col items-center justify-center p-4">
            <Film className="h-8 w-8 mb-2 text-emerald-400/80 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-semibold tracking-wide" style={{ color: "var(--dash-text)" }}>
              Arrastra y suelta tu video (Hasta 20MB)
            </p>
            <p className="text-[10px] mt-1 text-muted-foreground">
              Formatos recomendados: .mp4, .webm
            </p>
          </div>
        )}
      </div>
      <input
        type="file"
        accept="video/*"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
          }
        }}
        className="hidden"
        id="video-file-input"
      />
      {!value && !uploading && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => document.getElementById("video-file-input")?.click()}
          className="w-full text-xs h-7 border-white/10 hover:bg-white/5 mt-1"
        >
          Seleccionar Archivo
        </Button>
      )}
    </div>
  );
}
