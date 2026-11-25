/** Longest side of a compressed image. Text on a certificate stays sharp. */
const MAX_SIDE = 2000;
const QUALITY = 0.8;

const COMPRESSIBLE = ['image/jpeg', 'image/png', 'image/webp'];

export function isCompressibleImage(file: File): boolean {
    return COMPRESSIBLE.includes(file.type);
}

/**
 * Shrink a photo or scan in the browser before it is uploaded: scale it down
 * to at most 2000px and save it as an 80% JPEG. A phone photo of 3–8 MB
 * usually ends up around 200–500 KB.
 *
 * Other files, and images that would not get smaller, come back unchanged.
 */
export async function compressImage(file: File): Promise<File> {
    if (!isCompressibleImage(file)) return file;

    const { image, release } = await loadImage(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(image.width, image.height));
    const width = Math.round(image.width * scale);
    const height = Math.round(image.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');

    if (!context) {
        release();

        return file;
    }

    // JPEG has no transparency: paint transparent PNG areas white, not black.
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    release();

    const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', QUALITY),
    );

    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, '') + '.jpg';

    return new File([blob], name, {
        type: 'image/jpeg',
        lastModified: Date.now(),
    });
}

type Loaded = { image: ImageBitmap | HTMLImageElement; release: () => void };

async function loadImage(file: File): Promise<Loaded> {
    if ('createImageBitmap' in window) {
        try {
            // Respect the phone's EXIF rotation so photos are not sideways.
            const bitmap = await createImageBitmap(file, {
                imageOrientation: 'from-image',
            });

            return { image: bitmap, release: () => bitmap.close() };
        } catch {
            // Fall back to <img> below.
        }
    }

    const url = URL.createObjectURL(file);
    const image = new Image();
    image.src = url;
    await image.decode();

    return { image, release: () => URL.revokeObjectURL(url) };
}

/** 4_200_000 → "4,2 MB", 380_000 → "371 KB". */
export function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;

    return `${(bytes / 1024 / 1024).toLocaleString('id-ID', { maximumFractionDigits: 1 })} MB`;
}
