// src/lib/api.ts
export type ConversionType = "pdf-to-docx" | "docx-to-pdf" | "xlsx-to-pdf";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

function extFor(type: ConversionType) {
  switch (type) {
    case "pdf-to-docx": return "docx";
    case "docx-to-pdf": return "pdf";
    case "xlsx-to-pdf": return "pdf";
  }
}

export async function convertFile(
  type: ConversionType,
  file: File,
  apiKey: string
): Promise<{ blob: Blob; filename: string }> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}/convert/${type}`, {
     method: "POST",
     headers: { "X-API-Key": apiKey },
   body: form,
   });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Conversion failed (${res.status})`);
  }

  const blob = await res.blob();

  // Try to read filename from header
  const cd = res.headers.get("content-disposition") || "";
  const m = cd.match(/filename\*=UTF-8''([^;]+)|filename="([^"]+)"/i);
  const fromHeader = decodeURIComponent(m?.[1] || m?.[2] || "");

  // If no header, derive from input name + correct target extension
  const targetExt = extFor(type);
  const baseName =
    file.name.replace(/\.[^.]+$/g, "") || "converted";
  const fallback = `${baseName}.${targetExt}`;

  const filename = fromHeader || fallback;
  return { blob, filename };
}
