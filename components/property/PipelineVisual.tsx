"use client";

import { Check } from "lucide-react";
import { PIPELINE_STAGES } from "@/lib/config";
import { cn } from "@/lib/utils/cn";
import type { PipelineStage } from "@prisma/client";

// ── Ordre des étapes ──────────────────────────────────────────────────────────
const STAGE_ORDER: PipelineStage[] = [
  "DECLARED",
  "VALIDATED",
  "IN_REVIEW",
  "MANDATE_SIGNED",
  "COMPROMISE_SIGNED",
  "DEED_SIGNED",
  "COMMISSION_VALIDATED",
  "COMMISSION_PAID",
];

// ── Composant ─────────────────────────────────────────────────────────────────
export function PipelineVisual({
  currentStage,
  className,
}: {
  currentStage: PipelineStage | string;
  className?: string;
}) {
  const currentIdx = STAGE_ORDER.indexOf(currentStage as PipelineStage);

  return (
    <div className={cn("w-full", className)}>
      {/* ── Desktop (horizontal) ── */}
      <div className="hidden md:flex items-center w-full">
        {STAGE_ORDER.map((stage, idx) => {
          const cfg     = PIPELINE_STAGES[stage];
          const isDone  = idx < currentIdx;
          const isActive = idx === currentIdx;
          const isPending = idx > currentIdx;
          const isLast  = idx === STAGE_ORDER.length - 1;

          return (
            <div key={stage} className="flex items-center flex-1 min-w-0">
              {/* Cercle + label */}
              <div className="flex flex-col items-center flex-shrink-0" style={{ minWidth: 48 }}>
                {/* Cercle */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    "border-2 transition-all duration-300 relative",
                    isDone   && "bg-success border-success",
                    isActive && "bg-[#635BFF] border-[#635BFF] shadow-[0_0_0_4px_rgba(201,151,58,0.2)]",
                    isPending && "bg-white border-sand-dark"
                  )}
                >
                  {isDone && <Check className="w-3.5 h-3.5 text-white" />}
                  {isActive && (
                    <div className="w-3 h-3 rounded-full bg-white" />
                  )}
                  {isPending && (
                    <div className="w-2.5 h-2.5 rounded-full bg-sand-dark" />
                  )}
                  {/* Pulse pour l'étape active */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full bg-[#635BFF]/30 animate-ping" />
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "text-[10px] font-medium text-center leading-tight mt-1.5",
                    "w-14 break-words",
                    isDone   && "text-success",
                    isActive && "text-[#635BFF] font-semibold",
                    isPending && "text-charcoal-muted"
                  )}
                >
                  {cfg.label}
                </span>
              </div>

              {/* Connecteur */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-0.5 mb-5 rounded-full overflow-hidden">
                  {/* Ligne colorée selon avancement */}
                  <div
                    className={cn(
                      "h-full rounded-full",
                      isDone       ? "bg-success"   :
                      isActive     ? "bg-[#635BFF]/40"   :
                      /* pending */ "bg-sand-dark"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Mobile (vertical compact) ── */}
      <div className="flex md:hidden flex-col gap-0">
        {STAGE_ORDER.map((stage, idx) => {
          const cfg     = PIPELINE_STAGES[stage];
          const isDone  = idx < currentIdx;
          const isActive = idx === currentIdx;
          const isPending = idx > currentIdx;
          const isLast  = idx === STAGE_ORDER.length - 1;

          return (
            <div key={stage} className="flex gap-3">
              {/* Colonne gauche: cercle + ligne */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0",
                    "border-2 transition-all",
                    isDone   && "bg-success border-success",
                    isActive && "bg-[#635BFF] border-[#635BFF]",
                    isPending && "bg-white border-sand-dark"
                  )}
                >
                  {isDone  && <Check className="w-3 h-3 text-white" />}
                  {isActive && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                  {isPending && <div className="w-2 h-2 rounded-full bg-sand-dark" />}
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      "w-0.5 flex-1 min-h-[20px] rounded-full mt-0.5",
                      isDone ? "bg-success/50" : "bg-sand-dark"
                    )}
                  />
                )}
              </div>

              {/* Colonne droite: texte */}
              <div className={cn("pb-4", isLast && "pb-0")}>
                <p
                  className={cn(
                    "text-xs font-semibold leading-none",
                    isDone   && "text-success",
                    isActive && "text-[#635BFF]",
                    isPending && "text-charcoal-muted"
                  )}
                >
                  {cfg.label}
                </p>
                {isActive && (
                  <span className="text-[10px] text-[#635BFF]/70 mt-0.5 block">En cours</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
