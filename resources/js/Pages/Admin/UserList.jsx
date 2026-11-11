import { Pagination } from '@/Components/Listing';
import { ConfirmDialog } from '@/Components/Overlays';
import { Avatar, EmptyState, Spinner, StatCard } from '@/Components/ui';
import AppLayout from '@/Layouts/AppLayout';
import { formatDate } from '@/lib/helpers';
import { Link, router, usePage } from '@inertiajs/react';
import { CheckCircle2, Download, Eye, FileText, Search, ShieldCheck, ShieldOff, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

export default function UserList({ users, summary, filters }) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [deleting, setDeleting] = useState(null);
    const [processing, setProcessing] = useState(null);

    const toggleRole = (user) =>
        router.patch(`/admin/users/${user.id}/role`, {}, {
            preserveScroll: true,
            onStart: () => setProcessing(`role-${user.id}`),
            onFinish: () => setProcessing(null),
        });

    const destroy = () =>
        router.delete(`/admin/users/${deleting.id}`, {
            preserveScroll: true,
            onStart: () => setProcessing('delete'),
            onFinish: () => {
                setProcessing(null);
                setDeleting(null);
            },
        });

    return (
        <AppLayout
            title="Kelola Pengguna"
            actions={
                <a href="/admin/posts/export" className="btn-secondary">
                    <Download className="size-4" /> Ekspor Semua Artikel
                </a>
            }
        >
            <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard icon={Users} label="Total Pengguna" value={summary.users} />
                    <StatCard icon={ShieldCheck} label="Administrator" value={summary.admins} tone="violet" />
                    <StatCard icon={FileText} label="Total Artikel" value={summary.posts} tone="amber" />
                    <StatCard icon={CheckCircle2} label="Artikel Terbit" value={summary.published} tone="emerald" />
                </div>

                <section className="card">
                    <form
                        className="relative border-b border-slate-200 p-4 sm:p-5"
                        onSubmit={(event) => {
                            event.preventDefault();
                            router.get('/admin/users', search ? { search } : {}, { preserveState: true, replace: true });
                        }}
                    >
                        <Search className="pointer-events-none absolute top-1/2 left-7 size-4 -translate-y-1/2 text-slate-400 sm:left-8" />
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Cari nama, username, atau email lalu tekan Enter..."
                            className="input pl-9"
                            aria-label="Cari pengguna"
                        />
                    </form>

                    {users.data.length === 0 ? (
                        <EmptyState icon={Users} title="Pengguna tidak ditemukan" />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left text-sm">
                                <thead className="bg-slate-50 text-xs font-semibold tracking-wide text-slate-500 uppercase">
                                    <tr>
                                        <th className="px-5 py-3">Pengguna</th>
                                        <th className="px-5 py-3">Peran</th>
                                        <th className="px-5 py-3 text-center">Artikel</th>
                                        <th className="px-5 py-3">Bergabung</th>
                                        <th className="px-5 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {users.data.map((user) => {
                                        const isSelf = user.id === auth.user.id;

                                        return (
                                            <tr key={user.id} className="hover:bg-slate-50/70">
                                                <td className="px-5 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar name={user.name} />
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-slate-900">
                                                                {user.name} {isSelf && <span className="text-xs font-normal text-slate-500">(Anda)</span>}
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                @{user.username} · {user.email}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span
                                                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                            user.role === 'admin' ? 'bg-violet-50 text-violet-700' : 'bg-slate-100 text-slate-600'
                                                        }`}
                                                    >
                                                        {user.role === 'admin' ? 'Admin' : 'Penulis'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3 text-center">
                                                    <span className="font-semibold text-slate-800">{user.posts_count}</span>
                                                    <span className="text-xs text-slate-500"> ({user.published_posts_count} terbit)</span>
                                                </td>
                                                <td className="px-5 py-3 text-slate-500">{formatDate(user.created_at)}</td>
                                                <td className="px-5 py-3">
                                                    <div className="flex justify-end gap-1">
                                                        <Link href={`/admin/users/${user.id}/posts`} className="btn-ghost px-2.5 text-primary-700" title="Lihat artikel" aria-label={`Lihat artikel ${user.name}`}>
                                                            <Eye className="size-4" />
                                                        </Link>
                                                        <a href={`/admin/users/${user.id}/posts/export`} className="btn-ghost px-2.5 text-emerald-700" title="Ekspor artikel ke Excel" aria-label={`Ekspor artikel ${user.name} ke Excel`}>
                                                            <Download className="size-4" />
                                                        </a>
                                                        {!isSelf && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    className="btn-ghost px-2.5 text-violet-700"
                                                                    onClick={() => toggleRole(user)}
                                                                    disabled={processing === `role-${user.id}`}
                                                                    title={user.role === 'admin' ? 'Jadikan penulis' : 'Jadikan admin'}
                                                                    aria-label={`${user.role === "admin" ? "Jadikan penulis" : "Jadikan admin"}: ${user.name}`}
                                                                >
                                                                    {processing === `role-${user.id}` ? (
                                                                        <Spinner />
                                                                    ) : user.role === 'admin' ? (
                                                                        <ShieldOff className="size-4" />
                                                                    ) : (
                                                                        <ShieldCheck className="size-4" />
                                                                    )}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    className="btn-ghost px-2.5 text-rose-600"
                                                                    onClick={() => setDeleting(user)}
                                                                    title="Hapus pengguna"
                                                                    aria-label={`Hapus pengguna ${user.name}`}
                                                                >
                                                                    <Trash2 className="size-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {users.last_page > 1 && (
                        <div className="border-t border-slate-200 p-4 sm:p-5">
                            <Pagination paginator={users} />
                        </div>
                    )}
                </section>
            </div>

            <ConfirmDialog
                open={Boolean(deleting)}
                title="Hapus pengguna?"
                message={`Akun ${deleting?.name ?? ''} beserta seluruh artikelnya akan dihapus permanen.`}
                processing={processing === 'delete'}
                onConfirm={destroy}
                onCancel={() => setDeleting(null)}
            />
        </AppLayout>
    );
}
