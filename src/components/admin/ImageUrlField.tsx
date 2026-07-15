"use client";

import { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

/** Drag-and-drop / click-to-browse image upload with a thumbnail preview.
 * Used for every admin image field (bead texture, charm, packaging, product
 * hero image) and, with a different `uploadEndpoint`, the customer-facing
 * checkout payment screenshot field. */
export function ImageUrlField({
  label,
  value,
  onChange,
  uploadEndpoint = "/api/admin/upload",
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  uploadEndpoint?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(uploadEndpoint, { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Could not upload this image.");
        return;
      }
      onChange(data.url);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) uploadFile(file);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer items-center gap-3 rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/40"
        )}
      >
        {value && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover" />
        )}
        <div className="flex flex-1 items-center gap-2">
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
          <span>{uploading ? "Uploading…" : "Drag & drop an image, or click to browse"}</span>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
