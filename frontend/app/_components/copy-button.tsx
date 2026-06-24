"use client";

import { useState } from "react";
import { Copy, Share2 } from "lucide-react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const [showManualCopy, setShowManualCopy] = useState(false);

  async function copyText() {
    setError(false);
    setShowManualCopy(false);

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        copyWithTextArea(text);
      }

      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      try {
        copyWithTextArea(text);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      } catch {
        setError(true);
        setShowManualCopy(true);
      }
    }
  }

  async function shareText() {
    setError(false);

    try {
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }

      window.location.href = `https://wa.me/?text=${encodeURIComponent(text)}`;
    } catch {
      setShowManualCopy(true);
    }
  }

  function copyWithTextArea(value: string) {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    const success = document.execCommand("copy");
    document.body.removeChild(textarea);

    if (!success) {
      throw new Error("Falha ao copiar.");
    }
  }

  return (
    <div className="grid gap-2">
      <div className="grid gap-2 sm:grid-cols-2">
        <button
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-card)] px-4 py-3 text-sm font-bold text-[var(--on-surface)] transition active:scale-[0.98] hover:border-[var(--primary)]"
          onClick={copyText}
          type="button"
        >
          <Copy className="h-4 w-4" />
          {copied ? "Texto copiado" : "Copiar texto"}
        </button>
        <button
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--primary)] px-4 py-3 text-sm font-bold text-white transition active:scale-[0.98] hover:bg-[var(--primary-strong)]"
          onClick={shareText}
          type="button"
        >
          <Share2 className="h-4 w-4" />
          Enviar no WhatsApp
        </button>
      </div>
      {error ? (
        <p className="text-xs font-medium text-[var(--error)]">
          Não foi possível copiar automaticamente. Use o botão de envio ou selecione o texto abaixo.
        </p>
      ) : null}
      {showManualCopy ? (
        <textarea
          className="min-h-40 w-full rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-card)] p-3 text-sm text-[var(--on-surface)] outline-none"
          onFocus={(event) => event.currentTarget.select()}
          readOnly
          value={text}
        />
      ) : null}
    </div>
  );
}
