import { sanitizeHtml } from '@/lib/helpers';
import Editor from '@toast-ui/editor';
import Viewer from '@toast-ui/editor/viewer';
import { useEffect, useRef } from 'react';

const TOOLBAR = [
    ['heading', 'bold', 'italic', 'strike'],
    ['hr', 'quote'],
    ['ul', 'ol', 'task'],
    ['table', 'link', 'image'],
    ['code', 'codeblock'],
];

/**
 * Pembungkus React untuk TOAST UI Editor (Markdown).
 */
export function MarkdownEditor({ value, onChange, height = '100%', placeholder = 'Tulis isi artikel dalam format Markdown...' }) {
    const containerRef = useRef(null);
    const editorRef = useRef(null);
    const onChangeRef = useRef(onChange);

    onChangeRef.current = onChange;

    useEffect(() => {
        const editor = new Editor({
            el: containerRef.current,
            initialValue: value ?? '',
            initialEditType: 'markdown',
            previewStyle: window.innerWidth < 1024 ? 'tab' : 'vertical',
            height,
            placeholder,
            usageStatistics: false,
            hideModeSwitch: false,
            toolbarItems: TOOLBAR,
            customHTMLSanitizer: sanitizeHtml,
            events: {
                change: () => onChangeRef.current?.(editorRef.current?.getMarkdown() ?? ''),
            },
        });

        editorRef.current = editor;

        return () => {
            editor.destroy();
            editorRef.current = null;
        };
        // Editor hanya diinisialisasi sekali; nilai selanjutnya dikelola oleh editor itu sendiri.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div ref={containerRef} className="h-full" />;
}

/**
 * Pembungkus React untuk TOAST UI Viewer (render Markdown ke HTML).
 */
export function MarkdownViewer({ content, className = '' }) {
    const containerRef = useRef(null);

    useEffect(() => {
        const viewer = new Viewer({
            el: containerRef.current,
            initialValue: content ?? '',
            usageStatistics: false,
            customHTMLSanitizer: sanitizeHtml,
        });

        return () => viewer.destroy();
    }, [content]);

    return <div ref={containerRef} className={`article-viewer ${className}`} />;
}
