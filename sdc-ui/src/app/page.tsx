// sdc-ui/src/app/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { convertFile, type ConversionType } from "@/lib/api";
import Dropzone from "@/components/Dropzone";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const FormSchema = z.object({
  apiKey: z.string().min(1, "API Key is required"),
  type: z.enum(["pdf-to-docx", "docx-to-pdf", "xlsx-to-pdf"]),
});

const ACCEPT_MAP: Record<ConversionType, Record<string, string[]>> = {
  "pdf-to-docx": { "application/pdf": [".pdf"] },
  "docx-to-pdf": {
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  },
  "xlsx-to-pdf": {
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  },
};

type FormValues = z.infer<typeof FormSchema>;

type HistoryItem = {
  ts: string;
  type: ConversionType;
  inName: string;
  outName: string;
  ok: boolean;
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const defaultKey = process.env.NEXT_PUBLIC_DEFAULT_API_KEY ?? "";
  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: { apiKey: defaultKey, type: "pdf-to-docx" },
  });

  // Persist API key in localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sdc_api_key");
    if (saved) form.setValue("apiKey", saved);
  }, []); // eslint-disable-line

  useEffect(() => {
    const sub = form.watch((v) => {
      if (v.apiKey) localStorage.setItem("sdc_api_key", v.apiKey);
    });
    return () => sub.unsubscribe();
  }, [form]);

const t = form.watch("type");
const accept: Record<string, string[]> = useMemo(() => ACCEPT_MAP[t], [t]);

  async function onConvert() {
    if (!file) {
      toast.error("Please add a file to convert.");
      return;
    }
    const { apiKey, type } = form.getValues();
    setBusy(true);
    setProgress(20);

    try {
      const { blob, filename } = await convertFile(type, file, apiKey);
      setProgress(80);

      // trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "converted";
      a.click();
      URL.revokeObjectURL(url);

      setProgress(100);
      toast.success(`Downloaded: ${filename}`);
      setHistory((h) => [
        {
          ts: new Date().toLocaleString(),
          type,
          inName: file.name,
          outName: filename,
          ok: true,
        },
        ...h.slice(0, 9),
      ]);
      } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Conversion failed";
      toast.error(msg);
      setHistory((h) => [
        {
          ts: new Date().toLocaleString(),
          type: form.getValues("type"),
          inName: file.name,
          outName: "-",
          ok: false,
        },
        ...h.slice(0, 9),
      ]);
    } finally {
      setBusy(false);
      setTimeout(() => setProgress(0), 500);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      {/* Hero */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          Secure Document Converter
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Offline. Fast. No third-party uploads.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Convert a file</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Type */}
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label>Conversion type</Label>
              <select
                className="mt-1 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.watch("type")}
                onChange={(e) => form.setValue("type", e.target.value as FormValues["type"])}
              >
                <option value="pdf-to-docx">PDF → DOCX</option>
                <option value="docx-to-pdf">DOCX → PDF</option>
                <option value="xlsx-to-pdf">XLSX → PDF</option>
              </select>
            </div>

            <div>
              <Label>API Key</Label>
              <Input
                placeholder="Enter API key"
                {...form.register("apiKey")}
                className="mt-1"
              />
            </div>
          </div>

          {/* File */}
          <div>
            <Label>File</Label>
            <Dropzone accept={accept} onFile={setFile} disabled={busy} />
            {file && (
              <p className="mt-2 text-sm text-neutral-600">
                Selected: <span className="font-medium">{file.name}</span> (
                {Math.round(file.size / 1024)} KB)
              </p>
            )}
          </div>

          {/* Progress */}
          {busy && (
            <div>
              <Label>Progress</Label>
              <Progress value={progress} className="mt-1 h-2" />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              disabled={busy || !file || !form.getValues("apiKey")}
              onClick={onConvert}
            >
              {busy ? "Converting…" : "Convert & Download"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setFile(null);
                setProgress(0);
              }}
              disabled={busy}
            >
              Clear
            </Button>
          </div>

          <Separator className="my-2" />

          {/* History */}
          <div>
            <h3 className="mb-2 text-sm font-medium text-neutral-700">
              Recent conversions
            </h3>
            {history.length === 0 ? (
              <p className="text-sm text-neutral-500">No conversions yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-left text-sm">
                  <thead className="bg-neutral-50 text-neutral-600">
                    <tr>
                      <th className="px-3 py-2">Time</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Input</th>
                      <th className="px-3 py-2">Output</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-3 py-2">{h.ts}</td>
                        <td className="px-3 py-2">{h.type}</td>
                        <td className="px-3 py-2">{h.inName}</td>
                        <td className="px-3 py-2">{h.outName}</td>
                        <td className="px-3 py-2">
                          {h.ok ? (
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                              Success
                            </span>
                          ) : (
                            <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-700">
                              Failed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="mt-6 text-center text-xs text-neutral-500">
        Built with FastAPI & LibreOffice • Runs offline
      </p>
    </main>
  );
}
