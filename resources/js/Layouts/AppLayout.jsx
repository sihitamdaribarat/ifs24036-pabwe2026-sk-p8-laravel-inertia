import { FlashToast, ProcessingPill } from '@/Components/GlobalFeedback';
import { Avatar } from '@/Components/ui';
import { Head, Link, usePage } from '@inertiajs/react';
import { Globe, LogOut, Menu, Newspaper, PenLine, ShieldCheck, UserCog, Users, X } from 'lucide-react';
import { useState } from 'react';

function SidebarLink({ href, icon: Icon, active, children, onNavigate }) {
    return (
        <Link
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                active ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
        >
            <Icon className={`size-5 ${active ? 'text-primary-300' : ''}`} />
            {children}
        </Link>
    );
}

function Sidebar({ user, path, onNavigate }) {
    return (
        <div className="flex h-full flex-col bg-slate-900 px-4 py-5">
            <Link href="/" className="mb-8 flex items-center gap-2.5 px-2">
                <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 text-white">
                    <PenLine className="size-5" />
                </span>
                <span className="text-lg font-extrabold text-white">
                    BlogVerse<span className="text-primary-400"> Pro</span>
                </span>
            </Link>

            <nav className="flex-1 space-y-6">
                <div className="space-y-1">
                    <p className="px-3 pb-1 text-[11px] font-bold tracking-widest text-slate-500 uppercase">Penulis</p>
                    <SidebarLink href="/dashboard/posts" icon={Newspaper} active={path.startsWith('/dashboard/posts')} onNavigate={onNavigate}>
                        Artikel Saya
                    </SidebarLink>
                    <SidebarLink href="/profile" icon={UserCog} active={path.startsWith('/profile')} onNavigate={onNavigate}>
                        Profil
                    </SidebarLink>
                </div>

                {user.is_admin && (
                    <div className="space-y-1">
                        <p className="px-3 pb-1 text-[11px] font-bold tracking-widest text-slate-500 uppercase">Admin</p>
                        <SidebarLink href="/admin/users" icon={Users} active={path.startsWith('/admin/users')} onNavigate={onNavigate}>
                            Kelola Pengguna
                        </SidebarLink>
                        <SidebarLink href="/admin/posts" icon={ShieldCheck} active={path.startsWith('/admin/posts')} onNavigate={onNavigate}>
                            Semua Artikel
                        </SidebarLink>
                    </div>
                )}

                <div className="space-y-1">
                    <p className="px-3 pb-1 text-[11px] font-bold tracking-widest text-slate-500 uppercase">Publik</p>
                    <SidebarLink href="/" icon={Globe} active={false} onNavigate={onNavigate}>
                        Lihat Blog Publik
                    </SidebarLink>
                </div>
            </nav>

            <div className="mt-6 rounded-xl bg-white/5 p-3">
                <div className="flex items-center gap-3">
                    <Avatar name={user.name} />
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                        <p className="truncate text-xs text-slate-400">{user.is_admin ? 'Administrator' : 'Penulis'}</p>
                    </div>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-rose-300"
                        aria-label="Keluar"
                        title="Keluar"
                    >
                        <LogOut className="size-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function AppLayout({ title, actions, children }) {
    const { auth } = usePage().props;
    const { url } = usePage();
    const [open, setOpen] = useState(false);
    const path = url.split('?')[0];

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title={title} />

            <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
                <Sidebar user={auth.user} path={path} />
            </aside>

            {open && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <button type="button" className="absolute inset-0 cursor-default bg-slate-900/50" onClick={() => setOpen(false)} aria-label="Tutup menu" />
                    <aside className="relative h-full w-72">
                        <Sidebar user={auth.user} path={path} onNavigate={() => setOpen(false)} />
                    </aside>
                </div>
            )}

            <div className="lg:pl-64">
                <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur">
                    <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
                                onClick={() => setOpen(true)}
                                aria-label="Buka menu"
                            >
                                {open ? <X className="size-5" /> : <Menu className="size-5" />}
                            </button>
                            <h1 className="text-lg font-bold text-slate-900 sm:text-xl">{title}</h1>
                        </div>
                        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
                    </div>
                </header>

                <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
            </div>

            <FlashToast />
            <ProcessingPill />
        </div>
    );
}
