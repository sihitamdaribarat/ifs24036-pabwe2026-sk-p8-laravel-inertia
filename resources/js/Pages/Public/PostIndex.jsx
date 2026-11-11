import { Pagination } from '@/Components/Listing';
import { Avatar, CategoryBadge, CoverImage, EmptyState } from '@/Components/ui';
import PublicLayout from '@/Layouts/PublicLayout';
import { formatDate, readingTime } from '@/lib/helpers';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowRight, Clock, LayoutDashboard, LogIn, Search, SearchX, Sparkles, UserPlus } from 'lucide-react';
import { useState } from 'react';

function Hero({ user }) {
    return (
        <section className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-b from-primary-50/80 via-white to-white">
            <div className="pointer-events-none absolute -top-24 -right-24 size-96 rounded-full bg-violet-200/40 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -left-16 size-96 rounded-full bg-primary-200/40 blur-3xl" />
            <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:py-28">
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-primary-700 shadow-sm ring-1 ring-primary-100">
                    <Sparkles className="size-3.5" /> Platform publikasi artikel modern
                </span>
                <h1 className="mt-6 font-serif text-4xl leading-tight font-bold tracking-tight text-slate-900 sm:text-6xl">
                    Tempat gagasan bertemu <span className="text-primary-600 italic">pembaca</span>.
                </h1>
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
                    Jelajahi artikel teknologi, pendidikan, gaya hidup, bisnis, hingga opini dari para penulis komunitas
                    BlogVerse Pro. Bergabunglah untuk menulis, mengelola, dan memublikasikan karya Anda sendiri.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    {user ? (
                        <Link href="/dashboard/posts" className="btn-primary px-6 py-3 text-base">
                            <LayoutDashboard className="size-5" /> Buka Dashboard Penulis
                        </Link>
                    ) : (
                        <>
                            <Link href="/login" className="btn-secondary px-6 py-3 text-base">
                                <LogIn className="size-5" /> Masuk
                            </Link>
                            <Link href="/register" className="btn-primary px-6 py-3 text-base">
                                <UserPlus className="size-5" /> Daftar Penulis
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}

function PostCard({ post }) {
    return (
        <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60">
            <Link href={`/articles/${post.slug}`} className="block aspect-[16/9] overflow-hidden" aria-label={`Baca artikel: ${post.title}`}>
                <CoverImage post={post} className="h-full w-full transition duration-500 group-hover:scale-105" />
            </Link>
            <div className="flex flex-1 flex-col p-5">
                <div className="flex items-center justify-between gap-2">
                    <CategoryBadge category={post.category} />
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="size-3.5" /> {readingTime(post.content)} menit baca
                    </span>
                </div>
                <h2 className="mt-3 font-serif text-xl leading-snug font-bold text-slate-900 group-hover:text-primary-700">
                    <Link href={`/articles/${post.slug}`}>{post.title}</Link>
                </h2>
                {post.excerpt && <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">{post.excerpt}</p>}
                <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                    <Avatar name={post.user?.name ?? '?'} className="size-8 text-xs" />
                    <div className="min-w-0 text-xs">
                        <p className="truncate font-semibold text-slate-700">{post.user?.name}</p>
                        <p className="text-slate-500">{formatDate(post.published_at)}</p>
                    </div>
                </div>
            </div>
        </article>
    );
}

export default function PostIndex({ posts, filters, isHome }) {
    const { auth, categories } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');

    const visit = (params) => {
        const query = { search: filters.search ?? '', category: filters.category ?? '', ...params };
        Object.keys(query).forEach((key) => query[key] === '' && delete query[key]);
        router.get('/articles', query, { preserveState: !isHome, preserveScroll: !isHome });
    };

    const activeCategory = filters.category ?? '';

    return (
        <PublicLayout>
            <Head title={isHome ? 'Beranda' : 'Artikel'} />
            {isHome ? (
                <Hero user={auth.user} />
            ) : (
                <section className="border-b border-slate-200 bg-slate-50">
                    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                        <h1 className="font-serif text-4xl font-bold text-slate-900">Semua Artikel</h1>
                        <p className="mt-2 text-slate-600">Cari berdasarkan judul atau konten, lalu saring per kategori.</p>
                    </div>
                </section>
            )}

            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
                                {isHome ? 'Artikel Terbaru' : `${posts.total} artikel ditemukan`}
                            </h2>
                            {filters.search && (
                                <p className="mt-1 text-sm text-slate-500">
                                    Hasil pencarian untuk “<span className="font-semibold">{filters.search}</span>”
                                </p>
                            )}
                        </div>
                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                visit({ search });
                            }}
                            className="relative w-full md:w-96"
                        >
                            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Cari judul atau konten artikel..."
                                className="input rounded-full py-2.5 pr-24 pl-10"
                                aria-label="Cari artikel"
                            />
                            <button type="submit" className="btn-primary absolute top-1 right-1 rounded-full px-4 py-1.5">
                                Cari
                            </button>
                        </form>
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter kategori">
                        {[{ value: '', label: 'Semua' }, ...categories].map((category) => (
                            <button
                                key={category.value || 'all'}
                                type="button"
                                role="tab"
                                aria-selected={activeCategory === category.value}
                                onClick={() => visit({ category: category.value })}
                                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                                    activeCategory === category.value
                                        ? 'bg-slate-900 text-white shadow'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {category.value || category.label}
                            </button>
                        ))}
                    </div>
                </div>

                {posts.data.length === 0 ? (
                    <EmptyState icon={SearchX} title="Belum ada artikel" description="Coba kata kunci atau kategori lain.">
                        <Link href="/articles" className="btn-secondary">
                            Lihat semua artikel
                        </Link>
                    </EmptyState>
                ) : (
                    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {posts.data.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                )}

                <div className="mt-10">
                    {isHome && posts.next_page_url ? (
                        <div className="text-center">
                            <Link href="/articles" className="btn-secondary px-6 py-3">
                                Lihat semua artikel <ArrowRight className="size-4" />
                            </Link>
                        </div>
                    ) : (
                        <Pagination paginator={posts} />
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}
