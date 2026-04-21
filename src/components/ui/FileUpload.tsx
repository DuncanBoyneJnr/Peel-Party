"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileImage } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFile: (file: File | null) => void;
  label?: string;
  accept?: Record<string, string[]>;
  className?: string;
}

export default function FileUpload({
  onFile,
  label = "Upload your artwork",
  accept = { "image/*": [".png", ".jpg", ".jpeg", ".svg", ".pdf", ".ai", ".eps"] },
  className,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback(
    (accepted: File[]) => {
      const f = accepted[0] ?? null;
      setFile(f);
      onFile(f);
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept, maxFiles: 1 });

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    setFile(null);
    onFile(null);
  }

  return (
    <div className={className}>
      {label && <label className="block text-sm font-semibold text-[#111111] mb-2">{label}</label>}
      {file ? (
        <div className="flex items-center gap-3 p-4 bg-[#f9f7f4] border border-[#e5e1d8] rounded-xl">
          <FileImage size={20} className="text-[#ef8733] shrink-0" />
          <span className="text-sm text-[#111111] truncate flex-1">{file.name}</span>
          <button onClick={clear} className="text-[#6b7280] hover:text-red-500 cursor-pointer transition-colors" type="button" aria-label="Remove file">
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors text-center",
            isDragActive
              ? "border-[#ef8733] bg-[#fff7ed]"
              : "border-[#e5e1d8] bg-[#f9f7f4] hover:border-[#ef8733] hover:bg-[#fff7ed]"
          )}
        >
          <input {...getInputProps()} />
          <Upload size={24} className={isDragActive ? "text-[#ef8733]" : "text-[#6b7280]"} />
          <div>
            <p className="text-sm font-semibold text-[#111111]">
              {isDragActive ? "Drop your file here" : "Drag & drop or click to upload"}
            </p>
            <p className="text-xs text-[#6b7280] mt-1">PNG, JPG, SVG, PDF, AI, EPS accepted</p>
          </div>
        </div>
      )}
    </div>
  );
}
