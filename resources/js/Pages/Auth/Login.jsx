import { FieldError, Spinner } from '@/Components/ui';
import PublicLayout from '@/Layouts/PublicLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useState } from 'react';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const form = useForm({ username: '', password: '', remember: false });

    const submit = (event) => {
        event.preventDefault();
        form.post('/login', { onFinish: () => form.reset('password') });
    };

    return (
        <PublicLayout>
            <Head title="Masuk" />
            <section className="mx-auto flex max-w-md flex-col px-4 py-16">
                <div className="mb-8 text-center">
                    <span className="inline-flex rounded-2xl bg-primary-50 p-3 text-primary-600">
                        <LogIn className="size-7" />
                    </span>
                    <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">Masuk ke akun Anda</h1>
                    <p className="mt-2 text-sm text-slate-500">Kelola artikel dan lanjutkan menulis di BlogVerse Pro.</p>
                </div>

                <form onSubmit={submit} className="card space-y-5 p-6 sm:p-8">
                    <div>
                        <label htmlFor="login-username" className="label">
                            Username atau Email
                        </label>
                        <input
                            id="login-username"
                            name="username"
                            className="input"
                            value={form.data.username}
                            onChange={(event) => form.setData('username', event.target.value)}
                            autoComplete="username"
                            autoFocus
                            required
                        />
                        <FieldError message={form.errors.username} />
                    </div>
                    <div>
                        <label htmlFor="login-password" className="label">
                            Kata Sandi
                        </label>
                        <div className="relative">
                            <input
                                id="login-password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                className="input pr-10"
                                value={form.data.password}
                                onChange={(event) => form.setData('password', event.target.value)}
                                autoComplete="current-password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((value) => !value)}
                                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700"
                                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                            >
                                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                        <FieldError message={form.errors.password} />
                    </div>
                    <label htmlFor="login-remember" className="flex items-center gap-2 text-sm text-slate-600">
                        <input
                            id="login-remember"
                            type="checkbox"
                            className="size-4 rounded border-slate-300"
                            checked={form.data.remember}
                            onChange={(event) => form.setData('remember', event.target.checked)}
                        />
                        Ingat saya
                    </label>
                    <button id="login-submit" type="submit" className="btn-primary w-full py-2.5" disabled={form.processing}>
                        {form.processing ? <Spinner /> : <LogIn className="size-4" />}
                        {form.processing ? 'Memproses...' : 'Masuk'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-500">
                    Belum punya akun?{' '}
                    <Link href="/register" className="font-semibold text-primary-600 hover:text-primary-700">
                        Daftar sebagai penulis
                    </Link>
                </p>
            </section>
        </PublicLayout>
    );
}
