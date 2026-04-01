"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Upload, X, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

import { createClient }  from "@/lib/supabase/client";
import { cn }            from "@/lib/utils/cn";
import { MAX_FILE_SIZE_MB } from "@/lib/config";

// ── Types ─────────────────────────────────────────────────────────────────────

interface FileItem {
  id:        string;
  file:      File;
  preview?:  string;   // data URL pour les images
  progress:  number;   // 0-100
  url?:      string;   // URL publique Supabase après upload
  error?:    string;
}

export interface FileUploadProps {
  /** Label affiché au-dessus de la zone */
  label?:             string;
  /** Types MIME acceptés, ex: "image/*" ou ".pdf,.doc" */
  accept?:            string;
  /** Autoriser plusieurs fichiers */
  multiple?:          boolean;
  /** Nombre max de fichiers */
  maxFiles?:          number;
  /** Taille max par fichier en Mo (défaut : MAX_FILE_SIZE_MB) */
  maxSizeMB?:         number;
  /** Bucket Supabase Storage */
  bucket:             string;
  /** Dossier dans le bucket, ex: "properties/photos" */
  folder?:            string;
  /** Appelé à chaque changement de la liste des URLs uploadées */
  onUploadComplete:   (urls: string[]) => void;
  className?:         string;
}

// ── Composant ─────────────────────────────────────────────────────────────────

export function FileUpload({
  label       = "Fichiers",
  accept      = "image/*",
  multiple    = true,
  maxFiles    = 20,
  maxSizeMB   = MAX_FILE_SIZE_MB,
  bucket,
  folder      = "uploads",
  onUploadComplete,
  className,
}: FileUploadProps) {
  const inputRef             = useRef<HTMLInputElement>(null);
  const [items, setItems]    = useState<FileItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const supabase             = createClient();

  // Notifie le parent à chaque changement d'URLs complètes
  useEffect(() => {
    const urls = items.filter((i) => i.url).map((i) => i.url!);
    onUploadComplete(urls);
  }, [items, onUploadComplete]);

  // ── Upload vers Supabase ────────────────────────────────────────────────────
  const uploadFile = useCallback(
    async (item: FileItem) => {
      const ext  = item.file.name.split(".").pop() ?? "bin";
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      // Démarre le progress
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, progress: 10 } : i))
      );

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, item.file, { upsert: false });

      if (error) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === item.id ? { ...i, error: error.message, progress: 0 } : i
          )
        );
        return;
      }

      // Récupère l'URL publique
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(data.path);

      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, url: publicUrl, progress: 100, error: undefined } : i
        )
      );
    },
    [bucket, folder, supabase]
  );

  // ── Traitement des fichiers ─────────────────────────────────────────────────
  const processFiles = useCallback(
    (fileList: FileList | File[]) => {
      const remaining = maxFiles - items.length;
      if (remaining <= 0) return;

      const files = Array.from(fileList).slice(0, remaining);

      const newItems: FileItem[] = files
        .filter((file) => {
          if (file.size > maxSizeMB * 1024 * 1024) return false; // taille max
          return true;
        })
        .map((file) => ({
          id:       `${Date.now()}-${Math.random()}`,
          file,
          preview:  file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : undefined,
          progress: 0,
        }));

      setItems((prev) => [...prev, ...newItems]);

      // Lance les uploads immédiatement
      newItems.forEach((item) => uploadFile(item));
    },
    [items.length, maxFiles, maxSizeMB, uploadFile]
  );

  // ── Drag & Drop ─────────────────────────────────────────────────────────────
  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setDragging(true);  };
  const onDragLeave = ()                    => { setDragging(false); };
  const onDrop      = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    processFiles(e.dataTransfer.files);
  };

  // ── Suppression ─────────────────────────────────────────────────────────────
  const remove = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter((i) => i.id !== id);
    });
  };

  const isImage = accept.includes("image");

  return (
    <div className={cn("w-full", className)}>
      {/* Label */}
      <label className="block text-sm font-medium text-charcoal mb-2">{label}</label>

      {/* Drop zone */}
      {items.length < maxFiles && (
        <div
          role="button"
          tabIndex={0}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center gap-2",
            "border-2 border-dashed rounded-xl p-6 cursor-pointer",
            "transition-all duration-200 select-none",
            dragging
              ? "border-[#635BFF] bg-[#635BFF]/5"
              : "border-sand-dark hover:border-charcoal-muted/50 hover:bg-sand/50"
          )}
        >
          <Upload
            className={cn(
              "w-7 h-7 transition-colors",
              dragging ? "text-[#635BFF]" : "text-charcoal-muted"
            )}
          />
          <div className="text-center">
            <p className="text-sm font-medium text-charcoal">
              Glissez vos fichiers ici{" "}
              <span className="text-[#635BFF]">ou cliquez pour parcourir</span>
            </p>
            <p className="text-xs text-charcoal-muted mt-1">
              {isImage ? "JPG, PNG, WEBP" : "PDF, DOC"} — Max {maxSizeMB} Mo par fichier
              {multiple && ` · ${maxFiles - items.length} emplacement(s) restant(s)`}
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            className="sr-only"
            onChange={(e) => e.target.files && processFiles(e.target.files)}
          />
        </div>
      )}

      {/* Liste des fichiers */}
      {items.length > 0 && (
        <div
          className={cn(
            "mt-3",
            isImage
              ? "grid grid-cols-3 sm:grid-cols-4 gap-3"
              : "space-y-2"
          )}
        >
          {items.map((item) => (
            <FileCard
              key={item.id}
              item={item}
              isImage={isImage}
              onRemove={() => remove(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Carte fichier ─────────────────────────────────────────────────────────────

function FileCard({
  item,
  isImage,
  onRemove,
}: {
  item:     FileItem;
  isImage:  boolean;
  onRemove: () => void;
}) {
  const isUploading = item.progress > 0 && item.progress < 100 && !item.error;
  const isDone      = item.progress === 100 && !!item.url;
  const hasError    = !!item.error;

  if (isImage) {
    return (
      <div className="relative group rounded-xl overflow-hidden bg-sand-dark aspect-square">
        {/* Preview image */}
        {item.preview ? (
          <img
            src={item.preview}
            alt={item.file.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-sand">
            <FileText className="w-8 h-8 text-charcoal-muted" />
          </div>
        )}

        {/* Overlay état */}
        {!isDone && (
          <div className="absolute inset-0 bg-obsidian/50 flex flex-col items-center justify-center gap-1">
            {isUploading && (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            )}
            {hasError && (
              <AlertCircle className="w-5 h-5 text-danger" />
            )}
            {/* Progress bar */}
            {isUploading && (
              <div className="w-3/4 h-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#635BFF] transition-all duration-300"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Badge succès */}
        {isDone && (
          <div className="absolute top-1.5 right-1.5">
            <CheckCircle2 className="w-4 h-4 text-success drop-shadow-md" />
          </div>
        )}

        {/* Bouton suppression */}
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-obsidian/70 hover:bg-danger flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
          aria-label="Supprimer"
        >
          <X className="w-3 h-3 text-white" />
        </button>
      </div>
    );
  }

  // Vue document (PDF, etc.)
  return (
    <div className="flex items-center gap-3 bg-sand rounded-xl px-3 py-2.5">
      <div className="w-8 h-8 rounded-lg bg-[#635BFF]/10 flex items-center justify-center flex-shrink-0">
        <FileText className="w-4 h-4 text-[#635BFF]" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-obsidian truncate">{item.file.name}</p>
        <p className="text-xs text-charcoal-muted">
          {(item.file.size / 1024 / 1024).toFixed(1)} Mo
        </p>
        {/* Progress */}
        {isUploading && (
          <div className="mt-1 h-1 bg-sand-dark rounded-full overflow-hidden">
            <div
              className="h-full bg-[#635BFF] transition-all duration-300"
              style={{ width: `${item.progress}%` }}
            />
          </div>
        )}
        {hasError && (
          <p className="text-xs text-danger mt-0.5">{item.error}</p>
        )}
      </div>

      <div className="flex-shrink-0">
        {isUploading && <Loader2 className="w-4 h-4 text-[#635BFF] animate-spin" />}
        {isDone      && <CheckCircle2 className="w-4 h-4 text-success" />}
        {hasError    && <AlertCircle  className="w-4 h-4 text-danger"  />}
        {!isUploading && !isDone && !hasError && (
          <button
            type="button"
            onClick={onRemove}
            className="text-charcoal-muted hover:text-danger transition-colors"
            aria-label="Supprimer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
