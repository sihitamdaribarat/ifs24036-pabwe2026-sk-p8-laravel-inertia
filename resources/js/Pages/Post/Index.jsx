import { Pagination, PostFilters } from '@/Components/Listing';
import { ConfirmDialog, KebabMenu } from '@/Components/Overlays';
import { AiGeneratorModal, ImportModal, PostFormModal } from '@/Components/PostModals';
import { CategoryBadge, CoverImage, EmptyState, Spinner, StatCard, StatusBadge } from '@/Components/ui';
import AppLayout from '@/Layouts/AppLayout';
import { formatDate } from '@/lib/helpers';
import { Link, router } from '@inertiajs/react';
import {
    CheckCircle2,
    Download,
    Eye,
    FilePenLine,
    FileText,
    Pencil,
    Plus,
    Send,
    Sparkles,
    Trash2,
    Undo2,
    Upload,
    Wand2,
} from 'lucide-react';
import { useState } from 'react';

function PublishToggle({ post }) {
    const [processing, setProcessing] = useState(false);

    const toggle = () =>
        router.patch(`/dashboard/posts/${post.id}/publish`, {}, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
        });

    return (
        <button
            type="button"
            onClick={toggle}
            disabled={processing}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ring-1 transition ring-inset ${
                post.is_published
                    ? 'text-amber-700 ring-amber-200 hover:bg-amber-50'
                    : 'text-emerald-700 ring-emerald-200 hover:bg-emerald-50'
            }`}
        >
            {processing ? <Spinner className="size-3.5" /> : post.is_published ? <Undo2 className="size-3.5" /> : <Send className="size-3.5" />}
            {post.is_published ? 'Jadikan Draf' : 'Publikasikan'}
        </button>
    );
}

function AiDraftReview({ drafts }) {
    const [selected, setSelected] = useState(() => drafts.map((_, index) => index));
    const [processing, setProcessing] = useState(null);

    const toggle = (index) =>
        setSelected((current) => (current.includes(index) ? current.filter((value) => value !== index) : [...current, index]));

    const save = (publish) =>
        router.post(
            '/dashboard/posts/ai-save',
            { items: drafts.filter((_, index) => selected.includes(index)), publish },
            {
                preserveScroll: true,
                onStart: () => setProcessing(publish ? 'publish' : 'draft'),
                onFinish: () => setProcessing(null),
            },
        );

    return (
        <section className="card overflow-hidden border-primary-200">
            <div className="flex flex-col gap-3 border-b border-primary-100 bg-gradient-to-r from-primary-50 to-violet-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <Wand2 className="size-5 text-primary-600" />
                    <div>
                        <h2 className="font-bold text-slate-900">Pratinjau Hasil AI</h2>
                        <p className="text-xs text-slate-500">Pilih draf yang ingin disimpan ({selected.length}/{drafts.length} dipilih).</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button type="button" className="btn-secondary" disabled={!selected.length || processing} onClick={() => save(false)}>
                        {processing === 'draft' ? <Spinner /> : <FileText className="size-4" />} Simpan sebagai Draf
                    </button>
                    <button type="button" className="btn-primary" disabled={!selected.length || processing} onClick={() => save(true)}>
                        {processing === 'publish' ? <Spinner /> : <Send className="size-4" />} Simpan &amp; Publikasikan
                    </button>
                </div>
            </div>
            <ul className="divide-y divide-slate-100">
                {drafts.map((draft, index) => (
                    <li key={`${draft.title}-${index}`}>
                        <label htmlFor={`ai-draft-${index}`} className="flex gap-4 px-5 py-4 hover:bg-slate-50">
                            <input
                                id={`ai-draft-${index}`}
                                type="checkbox"
                                className="mt-1 size-4 rounded border-slate-300"
                                checked={selected.includes(index)}
                                onChange={() => toggle(index)}
                            />
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-semibold text-slate-900">{draft.title}</p>
                                    <CategoryBadge category={draft.category} />
                                </div>
                                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{draft.excerpt || draft.content.slice(0, 160)}</p>
                            </div>
                        </label>
                    </li>
                ))}
            </ul>
        </section>
    );
}

export default function Index({ posts, stats, filters, aiDrafts, aiMaxItems }) {
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [aiOpen, setAiOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);

    const destroy = () =>
        router.delete(`/dashboard/posts/${deleting.id}`, {
            preserveScroll: true,
            onStart: () => setDeleteProcessing(true),
            onFinish: () => {
                setDeleteProcessing(false);
                setDeleting(null);
            },
        });

    return (
        <AppLayout
            title="Artikel Saya"
            actions={
                <>
                    <a href="/dashboard/posts/export" className="btn-secondary">
                        <Download className="size-4" /> <span className="hidden sm:inline">Ekspor</span>
                    </a>
                    <button type="button" className="btn-secondary" onClick={() => setImportOpen(true)}>
                        <Upload className="size-4" /> <span className="hidden sm:inline">Impor</span>
                    </button>
                    <button type="button" className="btn-secondary text-primary-700" onClick={() => setAiOpen(true)}>
                        <Sparkles className="size-4" /> <span className="hidden sm:inline">AI Generator</span>
                    </button>
                    <button type="button" className="btn-primary" onClick={() => setCreating(true)}>
                        <Plus className="size-4" /> Tulis Artikel
                    </button>
                </>
            }
        >
            <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                    <StatCard icon={FileText} label="Total Artikel" value={stats.total} tone="primary" hint="Seluruh tulisan Anda" />
                    <StatCard icon={CheckCircle2} label="Total Selesai" value={stats.published} tone="emerald" hint="Sudah dipublikasikan" />
                    <StatCard icon={FilePenLine} label="Belum Selesai" value={stats.draft} tone="amber" hint="Masih berstatus draf" />
                </div>

                {aiDrafts.length > 0 && <AiDraftReview key={aiDrafts.map((draft) => draft.title).join('|')} drafts={aiDrafts} />}

                <section className="card">
                    <div className="border-b border-slate-200 p-4 sm:p-5">
                        <PostFilters url="/dashboard/posts" filters={filters} />
                    </div>

                    {posts.data.length === 0 ? (
                        <EmptyState
                            title="Belum ada artikel"
                            description="Mulai menulis artikel pertama Anda, impor dari Excel, atau gunakan AI Generator."
                        >
                            <button type="button" className="btn-primary" onClick={() => setCreating(true)}>
                                <Plus className="size-4" /> Tulis Artikel
                            </button>
                        </EmptyState>
                    ) : (
                        <ul className="divide-y divide-slate-100">
                            {posts.data.map((post) => (
                                <li key={post.id} className="flex items-center gap-4 px-4 py-3.5 transition hover:bg-slate-50/70 sm:px-5">
                                    <Link href={`/dashboard/posts/${post.id}`} className="hidden shrink-0 sm:block">
                                        <CoverImage post={post} className="h-14 w-20 rounded-lg" />
                                    </Link>
                                    <div className="min-w-0 flex-1">
                                        <Link
                                            href={`/dashboard/posts/${post.id}`}
                                            className="line-clamp-1 font-semibold text-slate-900 hover:text-primary-700"
                                        >
                                            {post.title}
                                        </Link>
                                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                                            <CategoryBadge category={post.category} />
                                            <StatusBadge published={post.is_published} />
                                            <span>Diperbarui {formatDate(post.updated_at, true)}</span>
                                        </div>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                                        <div className="hidden md:block">
                                            <PublishToggle post={post} />
                                        </div>
                                        <KebabMenu
                                            items={[
                                                { label: 'Detail', icon: Eye, href: `/dashboard/posts/${post.id}`, tone: 'primary' },
                                                { label: 'Ubah Edit', icon: Pencil, onClick: () => setEditing(post), tone: 'primary' },
                                                {
                                                    label: post.is_published ? 'Jadikan Draf' : 'Publikasikan',
                                                    icon: post.is_published ? Undo2 : Send,
                                                    onClick: () =>
                                                        router.patch(`/dashboard/posts/${post.id}/publish`, {}, { preserveScroll: true }),
                                                    tone: 'primary',
                                                },
                                                { label: 'Hapus', icon: Trash2, onClick: () => setDeleting(post), tone: 'danger' },
                                            ]}
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}

                    {posts.last_page > 1 && (
                        <div className="border-t border-slate-200 p-4 sm:p-5">
                            <Pagination paginator={posts} />
                        </div>
                    )}
                </section>
            </div>

            {creating && <PostFormModal open onClose={() => setCreating(false)} />}
            {editing && <PostFormModal key={editing.id} open post={editing} onClose={() => setEditing(null)} />}
            {aiOpen && <AiGeneratorModal open maxItems={aiMaxItems} onClose={() => setAiOpen(false)} />}
            {importOpen && <ImportModal open onClose={() => setImportOpen(false)} />}

            <ConfirmDialog
                open={Boolean(deleting)}
                title="Hapus artikel?"
                message={`Artikel "${deleting?.title ?? ''}" akan dihapus permanen beserta foto sampulnya.`}
                processing={deleteProcessing}
                onConfirm={destroy}
                onCancel={() => setDeleting(null)}
            />
        </AppLayout>
    );
}
