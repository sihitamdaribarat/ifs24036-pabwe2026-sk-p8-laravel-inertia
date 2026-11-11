import { Link } from '@inertiajs/react';
import { AlertTriangle, EllipsisVertical, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Spinner } from './ui';

function useLockBodyScroll(locked) {
    useEffect(() => {
        if (!locked) {
            return undefined;
        }

        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previous;
        };
    }, [locked]);
}

function useEscape(active, handler) {
    useEffect(() => {
        if (!active) {
            return undefined;
        }

        const onKey = (event) => event.key === 'Escape' && handler();
        window.addEventListener('keydown', onKey);

        return () => window.removeEventListener('keydown', onKey);
    }, [active, handler]);
}

/**
 * Modal layar penuh: header & footer berlatar kontras, tombol aksi di kanan footer.
 */
export function FullScreenModal({ open, title, subtitle, icon: Icon, onClose, footer, children, as = 'div', onSubmit }) {
    useLockBodyScroll(open);
    useEscape(open, onClose);

    if (!open) {
        return null;
    }

    const Wrapper = as;

    return (
        <div className="fixed inset-0 z-[60] bg-slate-900/40" role="dialog" aria-modal="true" aria-label={title}>
            <Wrapper onSubmit={onSubmit} className="flex h-full w-full flex-col bg-white">
                <header className="flex items-center justify-between gap-4 bg-slate-900 px-4 py-4 text-white sm:px-6">
                    <div className="flex min-w-0 items-center gap-3">
                        {Icon && (
                            <div className="rounded-lg bg-white/10 p-2">
                                <Icon className="size-5 text-primary-300" />
                            </div>
                        )}
                        <div className="min-w-0">
                            <h2 className="truncate text-lg font-bold">{title}</h2>
                            {subtitle && <p className="truncate text-xs text-slate-300">{subtitle}</p>}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
                        aria-label="Tutup"
                    >
                        <X className="size-5" />
                    </button>
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto bg-white">{children}</div>

                <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 bg-slate-100 px-4 py-3 sm:px-6">
                    {footer}
                </footer>
            </Wrapper>
        </div>
    );
}

/**
 * Dialog konfirmasi sederhana (mis. sebelum menghapus).
 */
export function ConfirmDialog({ open, title, message, confirmLabel = 'Hapus', processing = false, onConfirm, onCancel }) {
    useLockBodyScroll(open);
    useEscape(open && !processing, onCancel);

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[65] flex items-center justify-center bg-slate-900/50 p-4" role="alertdialog" aria-modal="true">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="flex gap-4 p-6">
                    <div className="h-fit rounded-full bg-rose-100 p-2.5 text-rose-600">
                        <AlertTriangle className="size-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                        <p className="mt-1 text-sm text-slate-500">{message}</p>
                    </div>
                </div>
                <div className="flex justify-end gap-3 bg-slate-50 px-6 py-3">
                    <button type="button" className="btn-secondary" onClick={onCancel} disabled={processing}>
                        Batal
                    </button>
                    <button type="button" className="btn-danger" onClick={onConfirm} disabled={processing}>
                        {processing && <Spinner />}
                        {processing ? 'Menghapus...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

/**
 * Menu tindakan kebab (⋮) berisi daftar aksi.
 * items: [{ label, icon, href?, onClick?, tone: 'primary' | 'danger' }]
 */
export function KebabMenu({ items, label = 'Menu tindakan' }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) {
            return undefined;
        }

        const onClick = (event) => {
            if (ref.current && !ref.current.contains(event.target)) {
                setOpen(false);
            }
        };
        const onKey = (event) => event.key === 'Escape' && setOpen(false);

        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);

        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);

    const toneClass = (tone) =>
        tone === 'danger' ? 'text-rose-600 hover:bg-rose-50' : 'text-primary-700 hover:bg-primary-50';

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={label}
            >
                <EllipsisVertical className="size-5" />
            </button>

            {open && (
                <div
                    role="menu"
                    className="animate-toast-in absolute right-0 z-40 mt-1 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
                >
                    {items.map(({ label: itemLabel, icon: Icon, href, onClick, tone }) => {
                        const className = `flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm font-medium transition ${toneClass(tone)}`;
                        const content = (
                            <>
                                <Icon className="size-4" />
                                {itemLabel}
                            </>
                        );

                        return href ? (
                            <Link key={itemLabel} href={href} role="menuitem" className={className} onClick={() => setOpen(false)}>
                                {content}
                            </Link>
                        ) : (
                            <button
                                key={itemLabel}
                                type="button"
                                role="menuitem"
                                className={className}
                                onClick={() => {
                                    setOpen(false);
                                    onClick();
                                }}
                            >
                                {content}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
