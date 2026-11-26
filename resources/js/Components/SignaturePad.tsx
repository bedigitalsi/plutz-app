import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';

export interface SignaturePadHandle {
    isEmpty: () => boolean;
    clear: () => void;
    /** Trimmed, transparent PNG of the signature (data URI). */
    toDataURL: () => string;
    scrollIntoView: () => void;
}

interface Props {
    hint: string;
    clearLabel: string;
    invalid?: boolean;
    onBegin?: () => void;
}

// Draw at 2x or more even on ordinary screens, so the signature stays sharp when printed in the PDF.
const pixelRatio = () => Math.max(window.devicePixelRatio || 1, 2);

/**
 * Pen-like signature pad. Sizes its own canvas (the library's resize handler wipes the signature on every
 * window resize, which on phones fires when the address bar hides while scrolling).
 */
const SignaturePad = forwardRef<SignaturePadHandle, Props>(({ hint, clearLabel, invalid = false, onBegin }, ref) => {
    const pad = useRef<SignatureCanvas>(null);
    const wrapper = useRef<HTMLDivElement>(null);
    const fittedWidth = useRef(0);

    useEffect(() => {
        const fit = () => {
            const sig = pad.current;
            if (!sig) return;
            const canvas = sig.getCanvas();
            const width = canvas.offsetWidth;
            if (!width || width === fittedWidth.current) return;

            const strokes = sig.isEmpty() ? [] : sig.toData();
            const ratio = pixelRatio();
            canvas.width = width * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            canvas.getContext('2d')?.scale(ratio, ratio);
            sig.clear();
            if (strokes.length) sig.fromData(strokes);
            fittedWidth.current = width;
        };

        fit();
        window.addEventListener('resize', fit);
        return () => window.removeEventListener('resize', fit);
    }, []);

    useImperativeHandle(ref, () => ({
        isEmpty: () => pad.current?.isEmpty() ?? true,
        clear: () => pad.current?.clear(),
        toDataURL: () => (pad.current ? trimmedPng(pad.current.getCanvas()) : ''),
        scrollIntoView: () => wrapper.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
    }));

    return (
        <div ref={wrapper}>
            <div className={`relative rounded-lg bg-white ring-1 ${invalid ? 'ring-2 ring-red-400' : 'ring-plutz-tan/30'}`}>
                {/* Baseline to sign on (not part of the exported image) */}
                <div className="pointer-events-none absolute inset-x-5 bottom-12 flex items-end gap-2 sm:inset-x-8">
                    <span className="font-serif text-lg leading-none text-stone-400">×</span>
                    <span className="mb-0.5 flex-1 border-b border-stone-300" />
                </div>
                <SignatureCanvas
                    ref={pad}
                    clearOnResize={false}
                    penColor="#16203a"
                    minWidth={0.6}
                    maxWidth={2.2}
                    velocityFilterWeight={0.6}
                    minDistance={3}
                    throttle={0}
                    onBegin={onBegin}
                    canvasProps={{ className: 'relative block h-52 w-full cursor-crosshair touch-none rounded-lg sm:h-56' }}
                />
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-xs text-stone-500">{hint}</span>
                <button
                    type="button"
                    onClick={() => pad.current?.clear()}
                    className="-my-2 shrink-0 py-2 text-sm text-plutz-tan-light underline-offset-4 hover:text-plutz-cream hover:underline"
                >
                    {clearLabel}
                </button>
            </div>
        </div>
    );
});

SignaturePad.displayName = 'SignaturePad';

export default SignaturePad;

/** Crop the canvas to the ink (plus a little margin) and return it as a transparent PNG. */
function trimmedPng(canvas: HTMLCanvasElement): string {
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas.toDataURL('image/png');

    const { width, height } = canvas;
    const alpha = ctx.getImageData(0, 0, width, height).data;
    let top = height, left = width, right = -1, bottom = -1;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (alpha[(y * width + x) * 4 + 3] > 8) {
                if (x < left) left = x;
                if (x > right) right = x;
                if (y < top) top = y;
                if (y > bottom) bottom = y;
            }
        }
    }
    if (right < 0) return canvas.toDataURL('image/png');

    const margin = Math.round(8 * (width / (canvas.offsetWidth || width)));
    left = Math.max(0, left - margin);
    top = Math.max(0, top - margin);
    right = Math.min(width - 1, right + margin);
    bottom = Math.min(height - 1, bottom + margin);

    const out = document.createElement('canvas');
    out.width = right - left + 1;
    out.height = bottom - top + 1;
    out.getContext('2d')?.drawImage(canvas, left, top, out.width, out.height, 0, 0, out.width, out.height);

    return out.toDataURL('image/png');
}
