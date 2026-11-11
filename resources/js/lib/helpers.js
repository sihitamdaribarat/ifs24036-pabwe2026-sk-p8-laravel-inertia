import DOMPurify from 'dompurify';

/**
 * Sanitizer HTML untuk TOAST UI Editor/Viewer.
 * Menggunakan DOMPurify terbaru, bukan salinan lama yang dibundel oleh @toast-ui/editor.
 */
export function sanitizeHtml(html) {
    return DOMPurify.sanitize(html, { ADD_ATTR: ['target', 'rel'] });
}

export function formatDate(value, withTime = false) {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    }).format(new Date(value));
}

export function readingTime(content = '') {
    const words = content.trim().split(/\s+/).filter(Boolean).length;

    return Math.max(1, Math.round(words / 200));
}

export function initials(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join('');
}

export const CATEGORY_STYLES = {
    Teknologi: 'bg-sky-50 text-sky-700 ring-sky-200',
    Pendidikan: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    'Gaya Hidup': 'bg-pink-50 text-pink-700 ring-pink-200',
    Bisnis: 'bg-amber-50 text-amber-700 ring-amber-200',
    Opini: 'bg-violet-50 text-violet-700 ring-violet-200',
    Umum: 'bg-slate-100 text-slate-700 ring-slate-200',
};

export const CATEGORY_GRADIENTS = {
    Teknologi: 'from-sky-500 to-indigo-600',
    Pendidikan: 'from-emerald-500 to-teal-600',
    'Gaya Hidup': 'from-pink-500 to-rose-600',
    Bisnis: 'from-amber-500 to-orange-600',
    Opini: 'from-violet-500 to-purple-600',
    Umum: 'from-slate-500 to-slate-700',
};
