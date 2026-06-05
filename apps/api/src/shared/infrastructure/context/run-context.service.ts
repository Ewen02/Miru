import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";

interface RunContext {
  /** Short id propagated across logs of the same cron / job / request. */
  runId: string;
  /** Logical label (cron name, use case name…). Optional, for observability. */
  scope?: string;
}

/**
 * Lightweight cron/job trace-id propagator via AsyncLocalStorage.
 * Lets any code deeper in the call stack pull the current `runId` from
 * `RunContextService.current()` to tag logs without threading it through
 * every signature.
 *
 * Not a replacement for OpenTelemetry — see CHANTIER-10 for proper metrics.
 * This is the minimum viable correlation id so a cron failure can be
 * tracked end-to-end without grep.
 */
@Injectable()
export class RunContextService {
  private readonly als = new AsyncLocalStorage<RunContext>();

  /** Run a callback inside a fresh context. Auto-generates a runId. */
  run<T>(scope: string, fn: () => Promise<T>): Promise<T> {
    const context: RunContext = { runId: shortId(), scope };
    return this.als.run(context, fn);
  }

  /** Returns the current context, or undefined if called outside a run(). */
  current(): RunContext | undefined {
    return this.als.getStore();
  }

  /** Convenience: runId of the current context, or `"no-context"` if none. */
  runId(): string {
    return this.als.getStore()?.runId ?? "no-context";
  }
}

function shortId(): string {
  // 8 chars is enough to disambiguate concurrent runs in logs without
  // bloating every line. Collision risk is negligible at our throughput.
  return randomUUID().slice(0, 8);
}
