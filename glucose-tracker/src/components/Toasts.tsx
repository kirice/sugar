import { useToast } from '../hooks/useToast';

const styles: Record<string, string> = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-brand-50 border-brand-200 text-brand-800',
};

const icons: Record<string, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

export function Toasts() {
  const { toasts, dismiss } = useToast();
  if (!toasts.length) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-card ${styles[t.type]}`}
        >
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/70 text-xs font-bold">
            {icons[t.type]}
          </span>
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => dismiss(t.id)}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Закрыть уведомление"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
