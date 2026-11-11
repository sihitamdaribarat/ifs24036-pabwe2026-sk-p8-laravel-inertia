import { useForm, usePage } from '@inertiajs/react';
import { FilePlus2, FileSpreadsheet, PencilLine, Sparkles, Upload } from 'lucide-react';
import { useState } from 'react';
import { MarkdownEditor } from './Markdown';
import { FullScreenModal } from './Overlays';
import { FieldError, Spinner } from './ui';

/**
 * Modal Full Screen untuk Tambah / Ubah artikel dengan TOAST UI Editor.
 */
export function PostFormModal({ open, post = null, onClose }) {
    const { categories } = usePage().props;
    const isEdit = Boolean(post);
    const form = useForm({
        title: post?.title ?? '',
        category: post?.category ?? 'Umum',
        excerpt: post?.excerpt ?? '',
        content: post?.content ?? '',
        is_published: post?.is_published ?? false,
    });

    const close = () => {
        if (form.processing) {
            return;
        }
        form.clearErrors();
        onClose();
    };

    const submit = (event) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                if (!isEdit) {
                    form.reset();
                }
                onClose();
            },
        };

        if (isEdit) {
            form.put(`/dashboard/posts/${post.id}`, options);
        } else {
            form.post('/dashboard/posts', options);
        }
    };

    return (
        <FullScreenModal
            open={open}
            as="form"
            onSubmit={submit}
            onClose={close}
            icon={isEdit ? PencilLine : FilePlus2}
            title={isEdit ? 'Ubah Artikel' : 'Tulis Artikel Baru'}
            subtitle={isEdit ? post.title : 'Tulis konten dalam format Markdown'}
            footer={
                <>
                    <button type="button" className="btn-secondary" onClick={close} disabled={form.processing}>
                        Batal
                    </button>
                    <button type="submit" className="btn-primary" disabled={form.processing}>
                        {form.processing && <Spinner />}
                        {form.processing ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan Artikel'}
                    </button>
                </>
            }
        >
            <div className="grid gap-6 p-4 sm:p-6 lg:h-full lg:grid-cols-[340px_1fr]">
                <div className="space-y-5">
                    <div>
                        <label htmlFor="post-title" className="label">
                            Judul Artikel
                        </label>
                        <input
                            id="post-title"
                            className="input"
                            value={form.data.title}
                            onChange={(event) => form.setData('title', event.target.value)}
                            placeholder="Judul yang menarik pembaca"
                            autoFocus
                        />
                        <FieldError message={form.errors.title} />
                    </div>
                    <div>
                        <label htmlFor="post-category" className="label">
                            Kategori
                        </label>
                        <select
                            id="post-category"
                            className="input"
                            value={form.data.category}
                            onChange={(event) => form.setData('category', event.target.value)}
                        >
                            {categories.map((category) => (
                                <option key={category.value} value={category.value}>
                                    {category.label}
                                </option>
                            ))}
                        </select>
                        <FieldError message={form.errors.category} />
                    </div>
                    <div>
                        <label htmlFor="post-excerpt" className="label">
                            Ringkasan <span className="font-normal text-slate-400">(1-2 kalimat)</span>
                        </label>
                        <textarea
                            id="post-excerpt"
                            rows={4}
                            className="input resize-none"
                            value={form.data.excerpt}
                            onChange={(event) => form.setData('excerpt', event.target.value)}
                            placeholder="Ringkasan pemikat pembaca..."
                            maxLength={500}
                        />
                        <FieldError message={form.errors.excerpt} />
                    </div>
                    <label
                        htmlFor="post-published"
                        className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                        <input
                            id="post-published"
                            type="checkbox"
                            className="mt-0.5 size-4 rounded border-slate-300 text-primary-600"
                            checked={form.data.is_published}
                            onChange={(event) => form.setData('is_published', event.target.checked)}
                        />
                        <span>
                            <span className="block text-sm font-semibold text-slate-800">Publikasikan sekarang</span>
                            <span className="block text-xs text-slate-500">
                                Jika tidak dicentang, artikel disimpan sebagai draf.
                            </span>
                        </span>
                    </label>
                </div>
                <div className="flex min-h-[480px] flex-col lg:min-h-0">
                    <span className="label">Konten Artikel</span>
                    <div className="h-[480px] lg:h-auto lg:flex-1">
                        {open && (
                            <MarkdownEditor value={form.data.content} onChange={(value) => form.setData('content', value)} />
                        )}
                    </div>
                    <FieldError message={form.errors.content} />
                </div>
            </div>
        </FullScreenModal>
    );
}

/**
 * Modal generator artikel instan via OpenAI.
 */
export function AiGeneratorModal({ open, maxItems = 5, onClose }) {
    const { categories } = usePage().props;
    const [clientError, setClientError] = useState(null);
    const form = useForm({ topic: '', count: 1, category: '' });

    const submit = (event) => {
        event.preventDefault();
        const count = Number(form.data.count);

        if (!Number.isInteger(count) || count < 1 || count > maxItems) {
            setClientError(`Jumlah artikel harus berupa angka bulat antara 1 dan ${maxItems}.`);
            return;
        }

        setClientError(null);
        form.post('/dashboard/posts/ai-generate', {
            preserveScroll: true,
            onSuccess: (page) => {
                if (!page.props.flash?.error) {
                    form.reset();
                    onClose();
                }
            },
        });
    };

    return (
        <FullScreenModal
            open={open}
            as="form"
            onSubmit={submit}
            onClose={() => !form.processing && onClose()}
            icon={Sparkles}
            title="AI Generator Artikel"
            subtitle="Rancang draf artikel instan dengan OpenAI"
            footer={
                <>
                    <button type="button" className="btn-secondary" onClick={onClose} disabled={form.processing}>
                        Batal
                    </button>
                    <button type="submit" className="btn-primary" disabled={form.processing}>
                        {form.processing ? <Spinner /> : <Sparkles className="size-4" />}
                        {form.processing ? 'Menghasilkan artikel...' : 'Hasilkan Artikel'}
                    </button>
                </>
            }
        >
            <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-8">
                <div className="rounded-2xl bg-gradient-to-br from-primary-50 to-violet-50 p-5 text-sm text-slate-600 ring-1 ring-primary-100">
                    Masukkan topik dan jumlah artikel. AI akan menyusun judul, ringkasan, dan konten Markdown. Hasilnya
                    ditampilkan sebagai pratinjau sehingga Anda dapat memilih artikel mana yang disimpan.
                </div>
                <div>
                    <label htmlFor="ai-topic" className="label">
                        Topik Artikel
                    </label>
                    <input
                        id="ai-topic"
                        className="input"
                        value={form.data.topic}
                        onChange={(event) => form.setData('topic', event.target.value)}
                        placeholder="Contoh: Tips produktif bekerja dari rumah"
                        maxLength={200}
                        required
                    />
                    <FieldError message={form.errors.topic} />
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                        <label htmlFor="ai-count" className="label">
                            Jumlah Artikel <span className="font-normal text-slate-400">(1–{maxItems})</span>
                        </label>
                        <input
                            id="ai-count"
                            type="number"
                            min={1}
                            max={maxItems}
                            step={1}
                            className="input"
                            value={form.data.count}
                            onChange={(event) => {
                                form.setData('count', event.target.value);
                                setClientError(null);
                            }}
                            required
                        />
                        <FieldError message={clientError ?? form.errors.count} />
                    </div>
                    <div>
                        <label htmlFor="ai-category" className="label">
                            Kategori <span className="font-normal text-slate-400">(opsional)</span>
                        </label>
                        <select
                            id="ai-category"
                            className="input"
                            value={form.data.category}
                            onChange={(event) => form.setData('category', event.target.value)}
                        >
                            <option value="">Biarkan AI memilih</option>
                            {categories.map((category) => (
                                <option key={category.value} value={category.value}>
                                    {category.label}
                                </option>
                            ))}
                        </select>
                        <FieldError message={form.errors.category} />
                    </div>
                </div>
            </div>
        </FullScreenModal>
    );
}

/**
 * Modal impor artikel dari file Excel / CSV.
 */
export function ImportModal({ open, onClose }) {
    const form = useForm({ file: null });

    const submit = (event) => {
        event.preventDefault();
        form.post('/dashboard/posts/import', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onClose();
            },
        });
    };

    return (
        <FullScreenModal
            open={open}
            as="form"
            onSubmit={submit}
            onClose={() => !form.processing && onClose()}
            icon={FileSpreadsheet}
            title="Impor Artikel dari Excel"
            subtitle="Format yang didukung: .xlsx, .xls, .csv (maks. 5 MB)"
            footer={
                <>
                    <button type="button" className="btn-secondary" onClick={onClose} disabled={form.processing}>
                        Batal
                    </button>
                    <button type="submit" className="btn-primary" disabled={form.processing || !form.data.file}>
                        {form.processing ? <Spinner /> : <Upload className="size-4" />}
                        {form.processing ? 'Mengimpor...' : 'Impor Sekarang'}
                    </button>
                </>
            }
        >
            <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-8">
                <label
                    htmlFor="import-file"
                    className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center transition hover:border-primary-400 hover:bg-primary-50/40"
                >
                    <FileSpreadsheet className="size-10 text-emerald-600" />
                    <span className="text-sm font-semibold text-slate-700">
                        {form.data.file ? form.data.file.name : 'Klik untuk memilih file Excel'}
                    </span>
                    <span className="text-xs text-slate-500">Baris pertama wajib berisi header kolom.</span>
                    <input
                        id="import-file"
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="sr-only"
                        onChange={(event) => form.setData('file', event.target.files[0] ?? null)}
                    />
                </label>
                <FieldError message={form.errors.file} />

                <div className="card overflow-hidden">
                    <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700">
                        Format header kolom
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-xs text-slate-500 uppercase">
                                <tr>
                                    {['Judul*', 'Kategori', 'Ringkasan', 'Konten*', 'Status'].map((header) => (
                                        <th key={header} className="px-4 py-2 font-semibold">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="text-slate-600">
                                <tr className="border-t border-slate-100">
                                    <td className="px-4 py-2">Belajar Laravel</td>
                                    <td className="px-4 py-2">Teknologi</td>
                                    <td className="px-4 py-2">Panduan singkat...</td>
                                    <td className="px-4 py-2">## Pendahuluan ...</td>
                                    <td className="px-4 py-2">Published / Draft</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="border-t border-slate-100 px-4 py-2.5 text-xs text-slate-500">
                        * wajib diisi. Tips: file hasil <strong>Ekspor</strong> dapat langsung diimpor kembali.
                    </p>
                </div>
            </div>
        </FullScreenModal>
    );
}
