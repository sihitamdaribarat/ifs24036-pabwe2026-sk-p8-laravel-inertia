import { Avatar } from '@/Components/ui';
import { FlashToast, ProcessingPill } from '@/Components/GlobalFeedback';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, LayoutDashboard, LogIn, LogOut, Menu, PenLine, ShieldCheck, UserCog, UserPlus, X } from 'lucide-react';
import { useState } from 'react';

function Brand() {
    return (
        <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 text-white shadow-md shadow-primary-500/30">
                <PenLine className="size-5" />
            </span>
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
                BlogVerse<span className="text-primary-600"> Pro</span>
            </span>
        </Link>
    );
}

function NavLink({ href, active, children }) {
    return (
        <Link
            href={href}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                active ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
        >
            {children}
        </Link>
    );
}

function UserMenu({ user }) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                className="flex items-center gap-2 rounded-full p-0.5 pr-1 ring-1 ring-slate-200 transition hover:ring-primary-300"
                aria-label="Menu akun"
                aria-expanded={open}
            >
                <Avatar name={user.name} className="size-8 text-xs" />
            </button>
            {open && (
                <>
                    <button type="button" className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} aria-hidden="true" tabIndex={-1} />
                    <div className="animate-toast-in absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                        <div className="border-b border-slate-100 px-4 py-3">
                            <p className="truncate text-sm font-semibold text-slate-900">{user.name}</p>
                            <p className="truncate text-xs text-slate-500">@{user.username}</p>
                        </div>
                        <div className="py-1">
                            <Link href="/dashboard/posts" className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                <LayoutDashboard className="size-4" /> Dashboard Penulis
                            </Link>
                            {user.is_admin && (
                                <Link href="/admin/users" className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                    <ShieldCheck className="size-4" /> Panel Admin
                                </Link>
                            )}
                            <Link href="/profile" className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                                <UserCog className="size-4" /> Profil Saya
                            </Link>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                            >
                                <LogOut className="size-4" /> Keluar
                            </Link>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function Navbar() {
    const { auth } = usePage().props;
    const { url } = usePage();
    const [mobileOpen, setMobileOpen] = useState(false);
    const user = auth.user;
    const path = url.split('?')[0];

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-lg">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-6">
                    <Brand />
                    <nav className="hidden items-center gap-1 md:flex">
                        <NavLink href="/" active={path === '/'}>
                            Beranda
                        </NavLink>
                        <NavLink href="/articles" active={path.startsWith('/articles')}>
                            Artikel
                        </NavLink>
                    </nav>
                </div>

                <div className="hidden items-center gap-2 md:flex">
                    {user ? (
                        <>
                            <Link href="/dashboard/posts" className="btn-ghost">
                                <LayoutDashboard className="size-4" /> Dashboard Penulis
                            </Link>
                            {user.is_admin && (
                                <Link href="/admin/users" className="btn-ghost">
                                    <ShieldCheck className="size-4" /> Panel Admin
                                </Link>
                            )}
                            <UserMenu user={user} />
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="btn-ghost group">
                                <LogIn className="size-4 transition group-hover:translate-x-0.5" /> Masuk
                            </Link>
                            <Link href="/register" className="btn-primary group">
                                <UserPlus className="size-4 transition group-hover:scale-110" /> Daftar
                            </Link>
                        </>
                    )}
                </div>

                <button
                    type="button"
                    className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
                    onClick={() => setMobileOpen((value) => !value)}
                    aria-label="Buka menu navigasi"
                    aria-expanded={mobileOpen}
                >
                    {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                </button>
            </div>

            {mobileOpen && (
                <div className="space-y-1 border-t border-slate-200 bg-white px-4 py-3 md:hidden">
                    <NavLink href="/" active={path === '/'}>
                        Beranda
                    </NavLink>
                    <NavLink href="/articles" active={path.startsWith('/articles')}>
                        Artikel
                    </NavLink>
                    <div className="grid gap-2 border-t border-slate-100 pt-3">
                        {user ? (
                            <>
                                <Link href="/dashboard/posts" className="btn-secondary">
                                    <LayoutDashboard className="size-4" /> Dashboard Penulis
                                </Link>
                                {user.is_admin && (
                                    <Link href="/admin/users" className="btn-secondary">
                                        <ShieldCheck className="size-4" /> Panel Admin
                                    </Link>
                                )}
                                <Link href="/logout" method="post" as="button" className="btn-ghost text-rose-600">
                                    <LogOut className="size-4" /> Keluar
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="btn-secondary">
                                    <LogIn className="size-4" /> Masuk
                                </Link>
                                <Link href="/register" className="btn-primary">
                                    <UserPlus className="size-4" /> Daftar
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}

function Footer() {
    return (
        <footer className="mt-20 border-t border-slate-200 bg-slate-900 text-slate-300">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[2fr_1fr] lg:px-8">
                <div>
                    <div className="flex items-center gap-2.5 text-white">
                        <BookOpen className="size-6 text-primary-400" />
                        <span className="font-serif text-xl font-bold">BlogVerse Pro</span>
                    </div>
                    <p className="mt-3 max-w-md font-serif text-sm leading-relaxed text-slate-400">
                        Ruang editorial untuk berbagi gagasan, tutorial, dan cerita. Bacaan berkualitas dari para penulis
                        komunitas — gratis untuk semua pembaca.
                    </p>
                </div>
                <div>
                    <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">Navigasi</h3>
                    <nav className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium md:flex-col" aria-label="Navigasi footer">
                        <Link href="/" className="hover:text-white">
                            Beranda Publik
                        </Link>
                        <Link href="/articles" className="hover:text-white">
                            Semua Artikel
                        </Link>
                        <Link href="/login" className="hover:text-white">
                            Halaman Login
                        </Link>
                        <Link href="/register" className="hover:text-white">
                            Halaman Register
                        </Link>
                    </nav>
                </div>
            </div>
            <div className="border-t border-white/10 py-5 text-center text-xs text-slate-400">
                © {new Date().getFullYear()} BlogVerse Pro · Dibangun dengan Laravel, Inertia.js &amp; React
            </div>
        </footer>
    );
}

export default function PublicLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col bg-white">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <FlashToast />
            <ProcessingPill />
        </div>
    );
}
