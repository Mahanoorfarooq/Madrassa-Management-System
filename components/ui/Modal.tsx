import { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-surface shadow-lg border border-borderSoft/70 animate-fade-up">
        <div className="flex items-center justify-between border-b border-borderSoft/70 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] text-gray-500 hover:text-gray-800 hover:bg-surfaceMuted"
          >
            <span>بند کریں</span>
          </button>
        </div>
        <div className="p-4 text-sm text-gray-700">{children}</div>
      </div>
    </div>
  );
}
