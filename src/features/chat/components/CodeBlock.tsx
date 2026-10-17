import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  language: string;
  codeText: string;
  children: ReactNode;
}

export function CodeBlock({ language, codeText, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — silently ignore
    }
  };

  return (
    <div className="my-3 overflow-hidden rounded-md border border-border bg-[var(--code-bg,theme(colors.secondary))]">
      <div className="flex items-center justify-between border-b border-border bg-secondary/60 px-3 py-1.5">
        <span className="font-mono text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {language}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "inline-flex items-center gap-1.5 rounded px-1.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          )}
          aria-label="Copiar código"
        >
          {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
      <pre className="hljs overflow-x-auto p-3 text-[13px] leading-relaxed">
        <code>{children}</code>
      </pre>
    </div>
  );
}
