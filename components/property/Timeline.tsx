"use client";

import { PIPELINE_STAGES } from "@/lib/config";
import { formatDatetime }  from "@/lib/utils";
import { cn }              from "@/lib/utils/cn";
import type { PipelineStage } from "@prisma/client";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface TimelineLog {
  id:         string;
  stage:      string;
  createdAt:  string;
  note?:      string | null;
  changedBy?: {
    firstName: string;
    lastName:  string;
    role:      string;
  } | null;
}

// ── Composant ─────────────────────────────────────────────────────────────────
export function Timeline({ logs }: { logs: TimelineLog[] }) {
  if (!logs.length) {
    return (
      <p className="text-sm text-charcoal-muted italic py-4">
        Aucun historique disponible.
      </p>
    );
  }

  return (
    <div className="relative">
      {/* Ligne verticale continue */}
      <div className="absolute left-[15px] top-4 bottom-0 w-0.5 bg-sand-dark rounded-full" />

      <div className="space-y-0">
        {logs.map((log, idx) => {
          const cfg    = PIPELINE_STAGES[log.stage as PipelineStage];
          const color  = cfg?.color ?? "#6B7280";
          const label  = cfg?.label ?? log.stage;
          const isLast = idx === logs.length - 1;

          return (
            <div
              key={log.id}
              className={cn("relative flex gap-4", !isLast && "pb-6")}
            >
              {/* Dot coloré */}
              <div
                className="relative z-10 w-[30px] h-[30px] rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white shadow-sm"
                style={{ background: color }}
              >
                <span className="text-white text-[9px] font-bold">
                  {(idx + 1).toString().padStart(2, "0")}
                </span>
              </div>

              {/* Contenu */}
              <div className="flex-1 min-w-0 pt-0.5">
                {/* Étape + date */}
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <p
                    className="text-sm font-semibold"
                    style={{ color }}
                  >
                    {label}
                  </p>
                  <time className="text-xs text-charcoal-muted whitespace-nowrap flex-shrink-0">
                    {formatDatetime(log.createdAt)}
                  </time>
                </div>

                {/* Modifié par */}
                {log.changedBy && (
                  <p className="text-xs text-charcoal-muted mt-0.5">
                    Par{" "}
                    <span className="font-medium text-charcoal">
                      {log.changedBy.firstName} {log.changedBy.lastName}
                    </span>
                    {" "}·{" "}
                    <span className="capitalize">{log.changedBy.role.toLowerCase()}</span>
                  </p>
                )}

                {/* Note */}
                {log.note && (
                  <div className="mt-2 bg-sand rounded-xl px-3 py-2">
                    <p className="text-xs text-charcoal italic leading-relaxed">
                      "{log.note}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
