"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, HelpCircle, X } from "lucide-react";

interface AdminModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  maxWidthClass?: string;
  children: React.ReactNode;
}

export function AdminModal({
  open,
  onClose,
  title,
  maxWidthClass = "max-w-lg",
  children,
}: AdminModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Modern Web Guidance fallback for <dialog closedby="any"> where unsupported (e.g. Safari)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return;

    const handleNativeClose = () => {
      dialog.returnValue = "";
      onClose();
    };
    dialog.addEventListener("close", handleNativeClose);

    let cleanupFallback: (() => void) | undefined;
    if (
      typeof HTMLDialogElement !== "undefined" &&
      !("closedBy" in HTMLDialogElement.prototype)
    ) {
      const outside = (e: PointerEvent, el: HTMLDialogElement) => {
        const r = el.getBoundingClientRect();
        return (
          e.clientX < r.left ||
          e.clientX > r.right ||
          e.clientY < r.top ||
          e.clientY > r.bottom
        );
      };
      let pressedOutside = false;
      const onPointerDown = (e: PointerEvent) => {
        pressedOutside = outside(e, dialog);
      };
      const onPointerUp = (e: PointerEvent) => {
        if (pressedOutside && outside(e, dialog)) {
          dialog.close();
        }
      };
      dialog.addEventListener("pointerdown", onPointerDown);
      dialog.addEventListener("pointerup", onPointerUp);
      cleanupFallback = () => {
        dialog.removeEventListener("pointerdown", onPointerDown);
        dialog.removeEventListener("pointerup", onPointerUp);
      };
    }

    return () => {
      dialog.removeEventListener("close", handleNativeClose);
      cleanupFallback?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      {...({ closedby: "any" } as React.DialogHTMLAttributes<HTMLDialogElement>)}
      className={`m-auto bg-white rounded-2xl w-[calc(100%-2rem)] ${maxWidthClass} max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-0 text-slate-800`}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <h2 id={titleId} className="text-sm sm:text-base font-bold text-slate-800">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="p-1.5 rounded-lg text-gray-400 hover:text-slate-700 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </dialog>
  );
}

export type ConfirmDialogVariant = "default" | "danger" | "success";

export interface ConfirmDialogConfig {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  showInput?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputDefaultValue?: string;
  inputRequired?: boolean;
  onConfirm: (inputValue?: string) => void;
}

const VARIANT_STYLES: Record<
  ConfirmDialogVariant,
  { iconWrap: string; icon: React.ElementType; confirmBtn: string }
> = {
  default: {
    iconWrap: "bg-gray-100 text-black",
    icon: HelpCircle,
    confirmBtn: "bg-black hover:bg-neutral-800 text-white",
  },
  danger: {
    iconWrap: "bg-rose-50 text-rose-600",
    icon: AlertTriangle,
    confirmBtn: "bg-rose-600 hover:bg-rose-700 text-white",
  },
  success: {
    iconWrap: "bg-emerald-50 text-emerald-600",
    icon: CheckCircle2,
    confirmBtn: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
};

export function AdminConfirmDialog({
  config,
  onClose,
}: {
  config: ConfirmDialogConfig | null;
  onClose: () => void;
}) {
  if (!config) return null;
  return (
    <AdminConfirmDialogInner
      key={config.title + (config.inputDefaultValue || "")}
      config={config}
      onClose={onClose}
    />
  );
}

function AdminConfirmDialogInner({
  config,
  onClose,
}: {
  config: ConfirmDialogConfig;
  onClose: () => void;
}) {
  const [inputValue, setInputValue] = useState(config.inputDefaultValue || "");
  const inputId = useId();
  const variant = VARIANT_STYLES[config.variant || "default"];
  const Icon = variant.icon;

  const canConfirm = !config.showInput
    ? true
    : !config.inputRequired || inputValue.trim().length > 0;

  return (
    <AdminModal open={true} onClose={onClose} title={config.title} maxWidthClass="max-w-sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${variant.iconWrap}`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="space-y-1 pt-0.5">
            {config.message && (
              <p className="text-xs text-gray-500 leading-relaxed">
                {config.message}
              </p>
            )}
          </div>
        </div>

        {config.showInput && (
          <div className="space-y-1.5">
            {config.inputLabel && (
              <label
                htmlFor={inputId}
                className="block text-xs font-semibold text-slate-700"
              >
                {config.inputLabel}
              </label>
            )}
            <textarea
              id={inputId}
              name="confirmNote"
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={config.inputPlaceholder}
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-slate-700 placeholder-gray-400 outline-none focus:border-black"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            autoFocus={!config.showInput && config.variant === "danger"}
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl border border-gray-200 text-slate-700 font-semibold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {config.cancelLabel || "Cancel"}
          </button>
          <button
            type="button"
            disabled={!canConfirm}
            onClick={() => {
              if (!canConfirm) return;
              config.onConfirm(config.showInput ? inputValue.trim() : undefined);
            }}
            className={`px-3.5 py-2 rounded-xl font-semibold text-xs shadow-2xs transition-colors cursor-pointer disabled:opacity-50 ${variant.confirmBtn}`}
          >
            {config.confirmLabel || "Confirm"}
          </button>
        </div>
      </div>
    </AdminModal>
  );
}
