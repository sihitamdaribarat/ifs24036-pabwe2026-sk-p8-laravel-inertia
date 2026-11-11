import { Link, router, usePage } from '@inertiajs/react';
import { formatDate } from '@/lib/helpers';
import { ChevronLeft, ChevronRight, ExternalLink, Search, X } from 'lucide-react';
import { useState } from 'react';
import { CategoryBadge, CoverImage, EmptyState, StatusBadge } from './ui';

function cleanLabel(label) {
    return label.replace(/&laquo;|&raquo;/g, '').replace(/Previous|Next|Sebelumnya|Berikutnya/g, '').trim();
}

/**
 * Pagination untuk paginator Laravel (LengthAwarePaginator).
 */
export function Pagination({ paginator }) {
    if (!paginator || paginator.last_page <= 1) {
        return null;
    }

    const pages = paginator.links.slice(1, -1);
    const navClass = 'inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition';

    return (
        <nav className="flex flex-col items-center justify-between gap-3 sm:flex-row" aria-label="Navigasi halaman">
            <p className="text-sm text-slate-500">
                Menampilkan <span className="font-semibold text-slate-700">{paginator.from}</span>–
                <span className="font-semibold text-slate-700">{paginator.to}</span> dari{' '}
                <span className="font-semibold text-slate-700">{paginator.total}</span> data
            </p>
            <div className="flex flex-wrap items-center gap-1">
                {paginator.prev_page_url ? (
                    <Link href={paginator.prev_page_url} preserveScroll className={`${navClass} text-slate-600 hover:bg-slate-100`}>
                        <ChevronLeft className="size-4" /> Sebelumnya
                    </Link>
                ) : (
                    <span className={`${navClass} text-slate-300`}>
                        <ChevronLeft className="size-4" /> Sebelumnya
                    </span>
                )}
                {pages.map((link, index) =>
                    link.url ? (
                        <Link
                            key={`${link.label}-${index}`}
                            href={link.url}
                            preserveScroll
                            className={`${navClass} min-w-9 justify-center ${
                                link.active ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                            }`}
                        >
                            {cleanLabel(link.label)}
                        </Link>
                    ) : (
                        <span key={`gap-${index}`} className="px-2 text-slate-400">
                            …
                        </span>
                    ),
                )}
                {paginator.next_page_url ? (
                    <Link href={paginator.next_page_url} preserveScroll className={`${navClass} text-slate-600 hover:bg-slate-100`}>
                        Berikutnya <ChevronRight className="size-4" />
                    </Link>
                ) : (
                    <span className={`${navClass} text-slate-300`}>
                        Berikutnya <ChevronRight className="size-4" />
                    </span>
                )}
            </div>
        </nav>
    );
}

/**
 * Filter pencarian + kategori + status (opsional) yang memperbarui query string.
 */
export function PostFilters({ url, filters = {}, withStatus = true }) {
    const { categories } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');

    const apply = (changes) => {
        const params = { search, category: filters.category ?? '', status: filters.status ?? '', ...changes };
        Object.keys(params).forEach((key) => params[key] === '' && delete params[key]);
        router.get(url, params, { preserveState: true, preserveScroll: true, replace: true });
    };

    const hasFilter = Boolean(filters.search || filters.category || filters.status);

    return (
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <form
                className="relative flex-1"
                onSubmit={(event) => {
                    event.preventDefault();
                    apply({ search });
                }}
            >
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Cari judul atau konten artikel..."
                    className="input pl-9"
                    aria-label="Cari artikel"
                />
            </form>
            <div className="flex flex-wrap gap-3">
                <select
                    value={filters.category ?? ''}
                    onChange={(event) => apply({ category: event.target.value })}
                    className="input w-auto"
                    aria-label="Filter kategori"
                >
                    <option value="">Semua Kategori</option>
                    {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                            {category.label}
                        </option>
                    ))}
                </select>
                {withStatus && (
                    <select
                        value={filters.status ?? ''}
                        onChange={(event) => apply({ status: event.target.value })}
                        className="input w-auto"
                        aria-label="Filter status"
                    >
                        <option value="">Semua Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draf</option>
                    </select>
                )}
                {hasFilter && (
                    <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => {
                            setSearch('');
                            router.get(url, {}, { preserveState: true, replace: true });
                        }}
                    >
                        <X className="size-4" /> Reset
                    </button>
                )}
            </div>
        </div>
    );
}

/**
 * Daftar artikel read-only untuk panel admin (List view).
 */
export function ReadOnlyPostList({ posts, showAuthor = true }) {
    if (posts.data.length === 0) {
        return <EmptyState title="Tidak ada artikel" description="Belum ada artikel yang sesuai dengan filter." />;
    }

    return (
        <ul className="divide-y divide-slate-100">
            {posts.data.map((post) => (
                <li key={post.id} className="flex items-center gap-4 px-4 py-3.5 sm:px-5">
                    <CoverImage post={post} className="hidden h-14 w-20 shrink-0 rounded-lg sm:flex" />
                    <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 font-semibold text-slate-900">{post.title}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                            <CategoryBadge category={post.category} />
                            <StatusBadge published={post.is_published} />
                            {showAuthor && post.user && (
                                <Link href={`/admin/users/${post.user.id}/posts`} className="font-medium text-primary-700 hover:underline">
                                    {post.user.name}
                                </Link>
                            )}
                            <span>Dibuat {formatDate(post.created_at)}</span>
                        </div>
                    </div>
                    {post.is_published && (
                        <a
                            href={`/articles/${post.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-ghost shrink-0 px-2.5 text-primary-700"
                            title="Lihat di halaman publik"
                        >
                            <ExternalLink className="size-4" />
                        </a>
                    )}
                </li>
            ))}
        </ul>
    );
}
