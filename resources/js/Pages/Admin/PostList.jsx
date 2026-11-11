import { Pagination, PostFilters, ReadOnlyPostList } from '@/Components/Listing';
import AppLayout from '@/Layouts/AppLayout';
import { Download, Eye } from 'lucide-react';

export default function PostList({ posts, filters }) {
    return (
        <AppLayout
            title="Monitoring Seluruh Artikel"
            actions={
                <a href="/admin/posts/export" className="btn-primary">
                    <Download className="size-4" /> Ekspor Semua ke Excel
                </a>
            }
        >
            <div className="space-y-6">
                <div className="flex items-center gap-3 rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-800 ring-1 ring-primary-100">
                    <Eye className="size-4 shrink-0" />
                    Mode pemantauan (read-only): admin dapat melihat seluruh artikel sistem tanpa mengubah konten penulis.
                </div>

                <section className="card">
                    <div className="border-b border-slate-200 p-4 sm:p-5">
                        <PostFilters url="/admin/posts" filters={filters} />
                    </div>
                    <ReadOnlyPostList posts={posts} />
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
