import { MarkdownViewer } from '@/Components/Markdown';
import { ConfirmDialog } from '@/Components/Overlays';
import { PostFormModal } from '@/Components/PostModals';
import { CategoryBadge, CoverImage, FieldError, Spinner, StatusBadge } from '@/Components/ui';
import AppLayout from '@/Layouts/AppLayout';
import { formatDate, readingTime } from '@/lib/helpers';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, ExternalLink, ImageMinus, ImagePlus, Pencil, Send, Trash2, Undo2 } from 'lucide-react';
import { useState } from 'react';

function CoverManager({ post }) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [removing, setRemoving] = useState(false);

    const upload = (file) => {
        if (!file) {
            return;
        }
        router.post(`/dashboard/posts/${post.id}/cover`, { cover: file }, {
            forceFormData: true,
            preserveScroll: true,
            onStart: () => {
                setError(null);
                setUploading(true);
            },
            onError: (errors) => setError(errors.cover ?? 'Gagal mengunggah foto sampul.'),
            onFinish: () => setUploading(false),
        });
    };

    const remove = () =>
        router.delete(`/dashboard/posts/${post.id}/cover`, {
            preserveScroll: true,
            onStart: () => setRemoving(true),
            onFinish: () => setRemoving(false),
        });

    return (
        <div className="card overflow-hidden">
            <div className="relative">
                <CoverImage post={post} className="aspect-[21/9] w-full" />
                {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/50 text-sm font-semibold text-white">
                        <Spinner /> Mengunggah foto...
                    </div>
                )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                    <p className="text-sm font-semibold text-slate-800">Foto Sampul</p>
                    <p className="text-xs text-slate-500">JPG, PNG, atau WEBP · maks. 2 MB</p>
                    <FieldError message={error} />
                </div>
                <div className="flex gap-2">
                    {post.cover_image_url && (
                        <button type="button" className="btn-secondary text-rose-600" onClick={remove} disabled={removing}>
                            {removing ? <Spinner /> : <ImageMinus className="size-4" />} Hapus
                        </button>
                    )}
                    <label htmlFor="cover-upload" className={`btn-primary ${uploading ? "pointer-events-none opacity-60" : ""}`}>
                        <ImagePlus className="size-4" /> {post.cover_image_url ? 'Ganti Sampul' : 'Unggah Sampul'}
                    </label>
                    <input
                        id="cover-upload"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        onChange={(event) => {
                            upload(event.target.files[0]);
                            event.target.value = '';
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default function Show({ post }) {
    const [editing, setEditing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteProcessing, setDeleteProcessing] = useState(false);
    const [toggling, setToggling] = useState(false);

    const togglePublish = () =>
        router.patch(`/dashboard/posts/${post.id}/publish`, {}, {
            preserveScroll: true,
            onStart: () => setToggling(true),
            onFinish: () => setToggling(false),
        });

    const destroy = () =>
        router.delete(`/dashboard/posts/${post.id}`, {
            onStart: () => setDeleteProcessing(true),
            onFinish: () => setDeleteProcessing(false),
        });

    return (
        <AppLayout
            title="Detail Artikel"
            actions={
                <>
                    {post.is_published && (
                        <a href={`/articles/${post.slug}`} target="_blank" rel="noreferrer" className="btn-secondary">
                            <ExternalLink className="size-4" /> <span className="hidden sm:inline">Lihat Publik</span>
                        </a>
                    )}
                    <button type="button" className="btn-secondary" onClick={togglePublish} disabled={toggling}>
                        {toggling ? <Spinner /> : post.is_published ? <Undo2 className="size-4" /> : <Send className="size-4" />}
                        {post.is_published ? 'Jadikan Draf' : 'Publikasikan'}
                    </button>
                    <button type="button" className="btn-secondary text-primary-700" onClick={() => setEditing(true)}>
                        <Pencil className="size-4" /> Ubah
                    </button>
                    <button type="button" className="btn-danger" onClick={() => setDeleting(true)}>
                        <Trash2 className="size-4" /> <span className="hidden sm:inline">Hapus</span>
                    </button>
                </>
            }
        >
            <div className="mx-auto max-w-4xl space-y-6">
                <Link href="/dashboard/posts" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-primary-600">
                    <ArrowLeft className="size-4" /> Kembali ke daftar artikel
                </Link>

                <CoverManager post={post} />

                <article className="card p-6 sm:p-10">
                    <div className="flex flex-wrap items-center gap-2">
                        <CategoryBadge category={post.category} />
                        <StatusBadge published={post.is_published} />
                    </div>
                    <h1 className="mt-4 font-serif text-3xl leading-tight font-bold text-slate-900 sm:text-4xl">{post.title}</h1>
                    {post.excerpt && <p className="mt-4 font-serif text-lg text-slate-600 italic">{post.excerpt}</p>}
                    <dl className="mt-6 grid gap-4 border-y border-slate-200 py-4 text-sm sm:grid-cols-4">
                        <div>
                            <dt className="text-xs text-slate-400">Slug</dt>
                            <dd className="truncate font-medium text-slate-700">{post.slug}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-slate-400">Dipublikasikan</dt>
                            <dd className="font-medium text-slate-700">{formatDate(post.published_at, true)}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-slate-400">Diperbarui</dt>
                            <dd className="font-medium text-slate-700">{formatDate(post.updated_at, true)}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-slate-400">Waktu baca</dt>
                            <dd className="font-medium text-slate-700">{readingTime(post.content)} menit</dd>
                        </div>
                    </dl>
                    <div className="mt-8">
                        <MarkdownViewer content={post.content} />
                    </div>
                </article>
            </div>

            {editing && <PostFormModal key={post.updated_at} open post={post} onClose={() => setEditing(false)} />}

            <ConfirmDialog
                open={deleting}
                title="Hapus artikel?"
                message={`Artikel "${post.title}" akan dihapus permanen beserta foto sampulnya.`}
                processing={deleteProcessing}
                onConfirm={destroy}
                onCancel={() => setDeleting(false)}
            />
        </AppLayout>
    );
}
