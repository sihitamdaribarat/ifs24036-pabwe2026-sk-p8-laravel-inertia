import { MarkdownViewer } from '@/Components/Markdown';
import { Avatar, CategoryBadge, CoverImage } from '@/Components/ui';
import PublicLayout from '@/Layouts/PublicLayout';
import { formatDate, readingTime } from '@/lib/helpers';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, Clock, LayoutDashboard, LogIn, PenLine, UserPlus, Users } from 'lucide-react';

function CommunityCard({ user }) {
    return (
        <section className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-10 text-center text-white sm:px-12">
            <div className="pointer-events-none absolute -top-20 -right-20 size-64 rounded-full bg-primary-500/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 size-64 rounded-full bg-violet-500/30 blur-3xl" />
            <div className="relative">
                <Users className="mx-auto size-10 text-primary-300" />
                <h2 className="mt-4 font-serif text-2xl font-bold sm:text-3xl">Bergabung dengan komunitas penulis</h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
                    Punya cerita, tutorial, atau opini yang ingin dibagikan? Buat akun gratis dan mulai publikasikan
                    artikel Anda — lengkap dengan editor Markdown dan asisten AI.
                </p>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    {user ? (
                        <Link href="/dashboard/posts" className="btn bg-white text-slate-900 hover:bg-slate-100">
                            <LayoutDashboard className="size-4" /> Tulis di Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link href="/login" className="btn border border-white/30 text-white hover:bg-white/10">
                                <LogIn className="size-4" /> Halaman Login
                            </Link>
                            <Link href="/register" className="btn bg-white text-slate-900 hover:bg-slate-100">
                                <UserPlus className="size-4" /> Halaman Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}

export default function PostShow({ post, related }) {
    const { auth } = usePage().props;

    return (
        <PublicLayout>
            <Head title={post.title}>
                <meta name="description" content={post.excerpt ?? post.title} />
            </Head>

            <article>
                <header className="mx-auto max-w-3xl px-4 pt-12 sm:px-6">
                    <Link href="/articles" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary-600">
                        <ArrowLeft className="size-4" /> Kembali ke artikel
                    </Link>
                    <div className="mt-8">
                        <Link href={`/articles?category=${encodeURIComponent(post.category)}`}>
                            <CategoryBadge category={post.category} />
                        </Link>
                    </div>
                    <h1 className="mt-4 font-serif text-4xl leading-tight font-bold tracking-tight text-slate-900 sm:text-5xl">
                        {post.title}
                    </h1>
                    {post.excerpt && <p className="mt-5 font-serif text-xl leading-relaxed text-slate-600 italic">{post.excerpt}</p>}
                    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-slate-200 py-4 text-sm text-slate-500">
                        <span className="flex items-center gap-2.5">
                            <Avatar name={post.user.name} className="size-9 text-sm" />
                            <span>
                                <span className="block font-semibold text-slate-800">{post.user.name}</span>
                                <span className="block text-xs">@{post.user.username}</span>
                            </span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Calendar className="size-4" /> {formatDate(post.published_at)}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Clock className="size-4" /> {readingTime(post.content)} menit baca
                        </span>
                    </div>
                </header>

                <div className="mx-auto mt-10 max-w-5xl px-4 sm:px-6">
                    <CoverImage post={post} className="aspect-[21/9] w-full rounded-3xl shadow-lg" />
                </div>

                <div className="mx-auto mt-12 max-w-3xl px-4 sm:px-6">
                    <MarkdownViewer content={post.content} />

                    <div className="mt-14 flex gap-4 rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200">
                        <Avatar name={post.user.name} className="size-14 text-lg" />
                        <div>
                            <p className="text-xs font-bold tracking-widest text-slate-600 uppercase">Ditulis oleh</p>
                            <p className="mt-1 text-lg font-bold text-slate-900">{post.user.name}</p>
                            <p className="mt-1 text-sm leading-relaxed text-slate-600">
                                {post.user.bio || 'Penulis komunitas BlogVerse Pro.'}
                            </p>
                        </div>
                    </div>
                </div>
            </article>

            <div className="mx-auto mt-16 max-w-5xl space-y-16 px-4 sm:px-6">
                {related.length > 0 && (
                    <section>
                        <h2 className="flex items-center gap-2 text-xl font-extrabold text-slate-900">
                            <PenLine className="size-5 text-primary-600" /> Artikel terkait
                        </h2>
                        <div className="mt-6 grid gap-6 md:grid-cols-3">
                            {related.map((item) => (
                                <Link key={item.id} href={`/articles/${item.slug}`} className="group">
                                    <CoverImage post={item} className="aspect-[16/9] w-full rounded-2xl" />
                                    <h3 className="mt-3 font-serif text-lg leading-snug font-bold text-slate-900 group-hover:text-primary-700">
                                        {item.title}
                                    </h3>
                                    <p className="mt-1 text-xs text-slate-500">
                                        {item.user?.name} · {formatDate(item.published_at)}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                <CommunityCard user={auth.user} />
            </div>
        </PublicLayout>
    );
}
