import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const typeConfig = {
    success: {
      icon: CheckCircle2,
      border: 'border-emerald-700/80 bg-stone-900',
      text: 'text-emerald-300',
      iconColor: 'text-emerald-400',
    },
    error: {
      icon: AlertCircle,
      border: 'border-red-700/80 bg-stone-900',
      text: 'text-red-300',
      iconColor: 'text-red-400',
    },
    info: {
      icon: Info,
      border: 'border-amber-700/80 bg-stone-900',
      text: 'text-amber-300',
      iconColor: 'text-amber-400',
    },
  }[toast.type];

  const Icon = typeConfig.icon;

  return (
    <div className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl ${typeConfig.border} text-stone-100 max-w-sm`}
      >
        <Icon className={`w-5 h-5 shrink-0 ${typeConfig.iconColor}`} />
        <p className={`text-sm font-medium ${typeConfig.text}`}>{toast.message}</p>
        <button
          onClick={onDismiss}
          className="p-1 -mr-1 text-stone-500 hover:text-stone-300 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
