import { Pagination, PostFilters, ReadOnlyPostList } from '@/Components/Listing';
import { Avatar, StatCard } from '@/Components/ui';
import AppLayout from '@/Layouts/AppLayout';
import { formatDate } from '@/lib/helpers';
import { Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Download, FilePenLine, FileText } from 'lucide-react';

export default function UserPostList({ owner, posts, stats, filters }) {
    return (
        <AppLayout
            title={`Artikel ${owner.name}`}
            actions={
                <a href={`/admin/users/${owner.id}/posts/export`} className="btn-primary">
                    <Download className="size-4" /> Ekspor ke Excel
                </a>
            }
        >
            <div className="space-y-6">
                <Link href="/admin/users" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary-600">
                    <ArrowLeft className="size-4" /> Kembali ke daftar pengguna
                </Link>

                <div className="card flex flex-wrap items-center gap-4 p-5">
                    <Avatar name={owner.name} className="size-14 text-lg" />
                    <div className="min-w-0 flex-1">
                        <p className="text-lg font-bold text-slate-900">{owner.name}</p>
                        <p className="text-sm text-slate-500">
                            @{owner.username} · {owner.email} · bergabung {formatDate(owner.created_at)}
                        </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 uppercase">
                        {owner.role} · read-only
                    </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard icon={FileText} label="Total Artikel" value={stats.total} />
                    <StatCard icon={CheckCircle2} label="Total Selesai" value={stats.published} tone="emerald" />
                    <StatCard icon={FilePenLine} label="Belum Selesai" value={stats.draft} tone="amber" />
                </div>

                <section className="card">
                    <div className="border-b border-slate-200 p-4 sm:p-5">
                        <PostFilters url={`/admin/users/${owner.id}/posts`} filters={filters} />
                    </div>
                    <ReadOnlyPostList posts={posts} showAuthor={false} />
                    {posts.last_page > 1 && (
                        <div className="border-t border-slate-200 p-4 sm:p-5">
                            <Pagination paginator={posts} />
                        </div>
                    )}
                </section>
            </div>
        </AppLayout>
    );
}
