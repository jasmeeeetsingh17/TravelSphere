import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type Props = {
    open: boolean;
    title: string;
    onClose: () => void;
    children: ReactNode;
};

/** Simple centred dialog. Closes with the X button, the dark backdrop or the Esc key. */
const Modal = ({ open, title, onClose, children }: Props) => {
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        // stop the page behind the dialog from scrolling
        const overflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = overflow;
        };
    }, [open, onClose]);

    if (!open) return null;

    // Portal to <body> so sticky/transformed parents can't trap the dialog under the navbar
    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/50 cursor-default" />
            <section role="dialog" aria-modal="true" aria-label={title} className="relative w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto bg-surface rounded-3xl shadow-2xl p-6 md:p-8 flex flex-col gap-5">
                <header className="flex items-start justify-between gap-4">
                    <h2 className="text-xl font-semibold text-dark-100">{title}</h2>
                    <button onClick={onClose} aria-label="Close dialog" className="size-9 rounded-full hover:bg-light-300 flex items-center justify-center cursor-pointer shrink-0">
                        <X size={18} />
                    </button>
                </header>
                {children}
            </section>
        </div>,
        document.body
    );
};

export default Modal;
