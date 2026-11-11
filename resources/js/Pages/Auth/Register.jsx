import { FieldError, Spinner } from '@/Components/ui';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { UserPlus } from 'lucide-react';

const FIELDS = [
    { name: 'name', label: 'Nama Lengkap', autoComplete: 'name' },
    { name: 'username', label: 'Username', autoComplete: 'username', hint: 'Huruf, angka, - dan _ (min. 3 karakter)' },
    { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
    { name: 'password', label: 'Kata Sandi', type: 'password', autoComplete: 'new-password', hint: 'Minimal 8 karakter' },
    { name: 'password_confirmation', label: 'Konfirmasi Kata Sandi', type: 'password', autoComplete: 'new-password' },
];

export default function Register() {
    const form = useForm({ name: '', username: '', email: '', password: '', password_confirmation: '' });

    const submit = (event) => {
        event.preventDefault();
        form.post('/register', { onFinish: () => form.reset('password', 'password_confirmation') });
    };

    return (
        <PublicLayout>
            <Head title="Daftar Penulis" />
            <section className="mx-auto flex max-w-md flex-col px-4 py-16">
                <div className="mb-8 text-center">
                    <span className="inline-flex rounded-2xl bg-primary-50 p-3 text-primary-600">
                        <UserPlus className="size-7" />
                    </span>
                    <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">Daftar sebagai Penulis</h1>
                    <p className="mt-2 text-sm text-slate-500">Mulai publikasikan tulisan Anda dalam hitungan menit.</p>
                </div>

                <form onSubmit={submit} className="card space-y-5 p-6 sm:p-8">
                    {FIELDS.map(({ name, label, type = 'text', autoComplete, hint }) => (
                        <div key={name}>
                            <label htmlFor={`register-${name}`} className="label">
                                {label}
                            </label>
                            <input
                                id={`register-${name}`}
                                name={name}
                                type={type}
                                className="input"
                                value={form.data[name]}
                                onChange={(event) => form.setData(name, event.target.value)}
                                autoComplete={autoComplete}
                                required
                            />
                            {hint && !form.errors[name] && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
                            <FieldError message={form.errors[name]} />
                        </div>
                    ))}
                    <button id="register-submit" type="submit" className="btn-primary w-full py-2.5" disabled={form.processing}>
                        {form.processing ? <Spinner /> : <UserPlus className="size-4" />}
                        {form.processing ? 'Mendaftarkan...' : 'Buat Akun'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Sudah punya akun?{' '}
                    <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700">
                        Masuk di sini
                    </Link>
                </p>
            </section>
        </PublicLayout>
    );
}
