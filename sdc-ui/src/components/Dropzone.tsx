// sdc-ui/src/components/Dropzone.tsx

"use client";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

type Props = {
  accept: Record<string, string[]>;
  onFile: (file: File) => void;
  disabled?: boolean;
};

export default function Dropzone({ accept, onFile, disabled }: Props) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted?.[0]) onFile(accepted[0]);
    },
    [onFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    onDrop,
    multiple: false,
    disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={`mt-2 rounded-2xl border-2 border-dashed p-8 text-center transition
      ${isDragActive ? "border-blue-500 bg-blue-50" : "border-neutral-300 bg-white"}
      ${disabled ? "opacity-60 pointer-events-none" : ""}`}
    >
      <input {...getInputProps()} />
      <p className="text-sm text-neutral-600">
        Drag & drop your file here, or <span className="font-medium">browse</span>
      </p>
      <p className="mt-1 text-xs text-neutral-500">Max 25 MB</p>
    </div>
  );
}
