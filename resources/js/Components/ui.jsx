import { CATEGORY_GRADIENTS, CATEGORY_STYLES, initials } from '@/lib/helpers';
import { Newspaper } from 'lucide-react';

export function Spinner({ className = 'size-4' }) {
    return (
        <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
        </svg>
    );
}

export function CategoryBadge({ category, className = '' }) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                CATEGORY_STYLES[category] ?? CATEGORY_STYLES.Umum
            } ${className}`}
        >
            {category}
        </span>
    );
}

export function StatusBadge({ published }) {
    return published ? (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 ring-inset">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Published
        </span>
    ) : (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200 ring-inset">
            <span className="size-1.5 rounded-full bg-amber-500" />
            Draf
        </span>
    );
}

export function Avatar({ name, className = 'size-9 text-sm' }) {
    return (
        <span
            className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-violet-600 font-bold text-white ${className}`}
        >
            {initials(name)}
        </span>
    );
}

export function CoverImage({ post, className = '' }) {
    if (post.cover_image_url) {
        return <img src={post.cover_image_url} alt={post.title} className={`object-cover ${className}`} loading="lazy" />;
    }

    return (
        <div
            role="img"
            aria-label={`Sampul artikel: ${post.title}`}
            className={`flex items-center justify-center bg-gradient-to-br ${
                CATEGORY_GRADIENTS[post.category] ?? CATEGORY_GRADIENTS.Umum
            } ${className}`}
        >
            <Newspaper className="size-1/4 max-h-16 max-w-16 text-white/70" strokeWidth={1.5} aria-hidden="true" />
        </div>
    );
}

export function EmptyState({ icon: Icon = Newspaper, title, description, children }) {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 rounded-2xl bg-primary-50 p-4 text-primary-600">
                <Icon className="size-8" />
            </div>
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
            {children && <div className="mt-5">{children}</div>}
        </div>
    );
}

export function FieldError({ message }) {
    if (!message) {
        return null;
    }

    return <p className="mt-1.5 text-xs font-medium text-rose-600">{message}</p>;
}

export function StatCard({ icon: Icon, label, value, tone = 'primary', hint }) {
    const tones = {
        primary: 'bg-primary-50 text-primary-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
        violet: 'bg-violet-50 text-violet-600',
    };

    return (
        <div className="card flex items-center gap-4 p-5">
            <div className={`rounded-xl p-3 ${tones[tone]}`}>
                <Icon className="size-6" />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                {hint && <p className="text-xs text-slate-500">{hint}</p>}
            </div>
        </div>
    );
}
