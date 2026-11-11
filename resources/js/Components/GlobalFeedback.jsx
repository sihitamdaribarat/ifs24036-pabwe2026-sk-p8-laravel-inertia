import { router, usePage } from '@inertiajs/react';
import { CheckCircle2, X, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Spinner } from './ui';

/**
 * Floating Status Pill "Memproses tindakan..." yang tampil selama navigasi / request Inertia.
 */
export function ProcessingPill() {
    const [active, setActive] = useState(false);

    useEffect(() => {
        let timer;

        const offStart = router.on('start', (event) => {
            if (event.detail.visit.prefetch) {
                return;
            }
            clearTimeout(timer);
            timer = setTimeout(() => setActive(true), 120);
        });

        const offFinish = router.on('finish', () => {
            clearTimeout(timer);
            setActive(false);
        });

        return () => {
            clearTimeout(timer);
            offStart();
            offFinish();
        };
    }, []);

    if (!active) {
        return null;
    }

    return (
        <div
            role="status"
            aria-live="polite"
            className="animate-pill-in fixed bottom-6 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2.5 rounded-full bg-slate-900/95 px-5 py-2.5 text-sm font-medium text-white shadow-2xl ring-1 ring-white/10 backdrop-blur"
        >
            <Spinner className="size-4 text-primary-300" />
            Memproses tindakan...
        </div>
    );
}

/**
 * Notifikasi flash (success / error) dari server.
 */
export function FlashToast() {
    const { flash } = usePage().props;
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (flash?.success) {
            setToast({ type: 'success', message: flash.success });
        } else if (flash?.error) {
            setToast({ type: 'error', message: flash.error });
        } else {
            return undefined;
        }

        const timer = setTimeout(() => setToast(null), 4500);

        return () => clearTimeout(timer);
    }, [flash]);

    if (!toast) {
        return null;
    }

    const isSuccess = toast.type === 'success';
    const Icon = isSuccess ? CheckCircle2 : XCircle;

    return (
        <div className="animate-toast-in fixed top-20 right-4 z-[70] w-[calc(100%-2rem)] max-w-sm">
            <div
                role="alert"
                className={`flex items-start gap-3 rounded-xl border bg-white p-4 shadow-xl ${
                    isSuccess ? 'border-emerald-200' : 'border-rose-200'
                }`}
            >
                <Icon className={`mt-0.5 size-5 shrink-0 ${isSuccess ? 'text-emerald-500' : 'text-rose-500'}`} />
                <p className="flex-1 text-sm text-slate-700">{toast.message}</p>
                <button
                    type="button"
                    onClick={() => setToast(null)}
                    className="rounded p-0.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Tutup notifikasi"
                >
                    <X className="size-4" />
                </button>
            </div>
        </div>
    );
}
