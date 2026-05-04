"use client";

import { useState, useRef, useEffect } from "react";

const INTENT_API_URL =
  process.env.NEXT_PUBLIC_INTENT_API_URL || "https://instill-api.fly.dev/parse";

type IntentResponse = {
  project: string;
  stack: string;
  market: string;
  features: string[];
  tools: string[];
  explanation: string;
  required_keys: string[];
};

export function InteractiveChatDemo() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IntentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(INTENT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: input.trim() }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data: IntentResponse = await res.json();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not reach the intent parser. Is the API running?"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* ── Input ── */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Build me a plus-size fashion store for Poland with BLIK payments..."
            className="flex-1 px-4 py-3 bg-surface border border-border rounded-xl text-text placeholder:text-muted focus:outline-hidden focus:border-accent transition-colors text-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-accent-glow hover:bg-violet-700 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {loading ? "Parsing..." : "Build →"}
          </button>
        </div>
      </form>

      {/* ── Error ── */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-400">{error}</p>
          <p className="text-xs text-muted mt-1">
            The intent parser API might not be running yet. Try the static demo
            below.
          </p>
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="space-y-4">
          <div className="flex justify-end mb-4">
            <div className="bg-accent-glow text-white rounded-2xl rounded-br-md px-5 py-3 max-w-[85%]">
              <p className="text-sm">{input}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-glow/20 border border-accent-glow/30 flex items-center justify-center text-xs shrink-0 mt-1">
              ⚡
            </div>
            <div className="bg-surface border border-border rounded-2xl rounded-bl-md px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse [animation-delay:0.4s]" />
                </span>
                <span className="text-xs text-muted font-mono">
                  Analyzing intent...
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Result ── */}
      {result && (
        <div className="space-y-4 animate-[fadeIn_0.4s_ease-out]">
          {/* User message */}
          <div className="flex justify-end mb-4">
            <div className="bg-accent-glow text-white rounded-2xl rounded-br-md px-5 py-3 max-w-[85%]">
              <p className="text-sm">{input}</p>
            </div>
          </div>

          {/* AI analysis */}
          <div className="flex gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-accent-glow/20 border border-accent-glow/30 flex items-center justify-center text-xs shrink-0 mt-1">
              ⚡
            </div>
            <div className="bg-surface border border-border rounded-2xl rounded-bl-md px-5 py-3 max-w-[85%]">
              <p className="text-xs text-muted mb-2 font-mono">
                Analyzing intent...
              </p>
              <p className="text-sm text-text leading-relaxed">
                {result.explanation}
              </p>
            </div>
          </div>

          {/* Config */}
          <details className="group mb-3 ml-11">
            <summary className="text-xs text-muted hover:text-accent cursor-pointer transition-colors inline-flex items-center gap-1 mb-2">
              <svg
                className="w-3 h-3 transition-transform group-open:rotate-90"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              See the generated config
            </summary>
            <div className="bg-bg border border-border/50 rounded-xl p-4 font-mono text-xs text-muted leading-relaxed overflow-x-auto">
              <pre>{`project: ${result.project}
stack: ${result.stack}
market: ${result.market}

features:
${result.features.map((f) => `  - ${f}`).join("\n")}

tools:
${result.tools.map((t) => `  - ${t}`).join("\n")}

required_keys:
${result.required_keys.map((k) => `  - ${k}`).join("\n")}`}</pre>
            </div>
          </details>

          {/* Required keys */}
          {result.required_keys.length > 0 && (
            <div className="flex gap-3 ml-11 mb-3">
              <div className="bg-surface border border-border rounded-2xl rounded-bl-md px-5 py-3 max-w-[85%]">
                <p className="text-xs text-muted mb-2 font-mono">
                  To build this, you&apos;ll need:
                </p>
                <div className="space-y-1.5">
                  {result.required_keys.map((key) => (
                    <div
                      key={key}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span className="text-accent">🔑</span>
                      <span className="text-text">{key}</span>
                      <span className="text-muted">— we&apos;ll guide you</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Build progress */}
          <div className="flex gap-3 ml-11">
            <div className="bg-surface border border-border rounded-2xl rounded-bl-md px-5 py-3 max-w-[85%]">
              <div className="flex items-center gap-3 mb-2">
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse [animation-delay:0.4s]" />
                </span>
                <span className="text-xs text-muted font-mono">Building...</span>
              </div>
              <div className="space-y-1">
                {["GitHub repo", "Next.js scaffold", "Payment integration", "Deploy"].map(
                  (step, i) => (
                    <div
                      key={step}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span
                        className={
                          i < 3
                            ? "text-success"
                            : "text-muted animate-pulse"
                        }
                      >
                        {i < 3 ? "✓" : "○"}
                      </span>
                      <span className={i < 3 ? "text-muted" : "text-text"}>
                        {step}
                      </span>
                      {i < 3 && (
                        <span className="text-zinc-700 font-mono">1.2s</span>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Live URL */}
          <div className="flex gap-3 mt-4 ml-11">
            <div className="bg-surface border border-success/30 rounded-2xl rounded-bl-md px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success" />
                <span className="text-xs text-muted">Live at</span>
                <span className="text-sm text-accent font-mono">
                  {result.project}.vercel.app
                </span>
                <span className="text-xs text-zinc-700">~4m</span>
              </div>
            </div>
          </div>

          {/* Try again */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setResult(null);
                setInput("");
                setError(null);
                inputRef.current?.focus();
              }}
              className="text-sm text-muted hover:text-accent transition-colors"
            >
              ← Try another idea
            </button>
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && !result && !error && (
        <div className="text-center py-8">
          <p className="text-sm text-muted">
            Type a business idea above and press Enter.{"\n"}
            Our intent parser will extract the structure and show you what gets
            built.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {[
              "E-commerce store",
              "SaaS dashboard",
              "Marketplace",
              "Blog + newsletter",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setInput(suggestion)}
                className="px-3 py-1.5 bg-surface border border-border hover:border-accent/50 rounded-lg text-xs text-muted hover:text-text transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
