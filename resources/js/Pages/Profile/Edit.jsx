import { Avatar, FieldError, Spinner } from '@/Components/ui';
import AppLayout from '@/Layouts/AppLayout';
import { formatDate } from '@/lib/helpers';
import { useForm } from '@inertiajs/react';
import { KeyRound, Save, UserRound } from 'lucide-react';

function Field({ form, name, label, type = 'text', autoComplete, hint }) {
    return (
        <div>
            <label htmlFor={`profile-${name}`} className="label">
                {label}
            </label>
            <input
                id={`profile-${name}`}
                type={type}
                className="input"
                value={form.data[name] ?? ''}
                onChange={(event) => form.setData(name, event.target.value)}
                autoComplete={autoComplete}
            />
            {hint && !form.errors[name] && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
            <FieldError message={form.errors[name]} />
        </div>
    );
}

export default function Edit({ profile, stats }) {
    const form = useForm({
        name: profile.name,
        username: profile.username,
        email: profile.email,
        bio: profile.bio ?? '',
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (event) => {
        event.preventDefault();
        form.put('/profile', {
            preserveScroll: true,
            onSuccess: () => form.reset('current_password', 'password', 'password_confirmation'),
        });
    };

    return (
        <AppLayout title="Profil Penulis">
            <form onSubmit={submit} className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[280px_1fr]">
                <aside className="card h-fit p-6 text-center">
                    <Avatar name={form.data.name || profile.name} className="mx-auto size-20 text-2xl" />
                    <p className="mt-4 text-lg font-bold text-slate-900">{profile.name}</p>
                    <p className="text-sm text-slate-500">@{profile.username}</p>
                    <span className="mt-3 inline-block rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                        {profile.role === 'admin' ? 'Administrator' : 'Penulis'}
                    </span>
                    <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 text-sm">
                        <div>
                            <dt className="text-xs text-slate-400">Artikel</dt>
                            <dd className="text-xl font-bold text-slate-900">{stats.posts}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-slate-400">Terbit</dt>
                            <dd className="text-xl font-bold text-slate-900">{stats.published}</dd>
                        </div>
                    </dl>
                    <p className="mt-5 text-xs text-slate-400">Bergabung {formatDate(profile.created_at)}</p>
                </aside>

                <div className="space-y-6">
                    <section className="card p-6">
                        <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                            <UserRound className="size-5 text-primary-600" /> Informasi Profil
                        </h2>
                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                            <Field form={form} name="name" label="Nama Lengkap" autoComplete="name" />
                            <Field form={form} name="username" label="Username" autoComplete="username" />
                            <div className="sm:col-span-2">
                                <Field form={form} name="email" label="Email" type="email" autoComplete="email" />
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="profile-bio" className="label">
                                    Bio Penulis
                                </label>
                                <textarea
                                    id="profile-bio"
                                    rows={4}
                                    className="input resize-none"
                                    value={form.data.bio}
                                    onChange={(event) => form.setData('bio', event.target.value)}
                                    placeholder="Ceritakan sedikit tentang diri Anda — tampil di akhir setiap artikel."
                                    maxLength={1000}
                                />
                                <FieldError message={form.errors.bio} />
                            </div>
                        </div>
                    </section>

                    <section className="card p-6">
                        <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                            <KeyRound className="size-5 text-primary-600" /> Ganti Kata Sandi
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">Kosongkan jika tidak ingin mengganti kata sandi.</p>
                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <Field form={form} name="current_password" label="Kata Sandi Saat Ini" type="password" autoComplete="current-password" />
                            </div>
                            <Field form={form} name="password" label="Kata Sandi Baru" type="password" autoComplete="new-password" hint="Minimal 8 karakter" />
                            <Field form={form} name="password_confirmation" label="Konfirmasi Kata Sandi" type="password" autoComplete="new-password" />
                        </div>
                    </section>

                    <div className="flex justify-end">
                        <button type="submit" className="btn-primary" disabled={form.processing}>
                            {form.processing ? <Spinner /> : <Save className="size-4" />}
                            {form.processing ? 'Menyimpan...' : 'Simpan Profil'}
                        </button>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
