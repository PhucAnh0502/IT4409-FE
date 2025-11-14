export const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

export const createImage = (url) => {
    return new Promise((resolve, reject)  => {
        const img = new Image();
        img.addEventListener("load", () => resolve(img));
        img.addEventListener("error", (error) => reject(error));
        img.setAttribute("crossOrigin", "anonymous"); 
        img.src = url;
    });
};

export const getCroppedImg = async (imageSrc, pixelCrop, options = {}) => {
    // options: { maxDim = 2048, maxSizeBytes = 5 * 1024 * 1024, mime = 'image/jpeg', startQuality = 0.85, minQuality = 0.4 }
    const { maxDim = 2048, maxSizeBytes = 5 * 1024 * 1024, mime = 'image/jpeg', startQuality = 0.85, minQuality = 0.4 } = options;
    const image = await createImage(imageSrc);
    // determine output dimensions while preserving aspect ratio
    let outputWidth = pixelCrop.width;
    let outputHeight = pixelCrop.height;
    const scale = Math.min(1, maxDim / Math.max(outputWidth, outputHeight));
    outputWidth = Math.max(1, Math.round(outputWidth * scale));
    outputHeight = Math.max(1, Math.round(outputHeight * scale));

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = outputWidth;
    canvas.height = outputHeight;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        outputWidth,
        outputHeight
    );

    // helper: convert blob to dataURL
    const blobToDataURL = (blob) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });

    // try compressing to meet maxSizeBytes by lowering quality if needed
    let quality = startQuality;
    const attemptBlob = () => new Promise((resolve) => canvas.toBlob(resolve, mime, quality));

    let blob = await attemptBlob();
    // If PNG was requested or blob is null fallback to dataURL
    if (!blob) {
        // fallback: return dataURL (may be large)
        return canvas.toDataURL();
    }

    // If already under limit, return dataURL
    if (blob.size <= maxSizeBytes) {
        return await blobToDataURL(blob);
    }

    // Reduce quality in steps until under maxSizeBytes or minQuality reached
    while (blob.size > maxSizeBytes && quality > minQuality) {
        quality = Math.max(minQuality, quality - 0.1);
        blob = await attemptBlob();
        if (!blob) break;
        // safety: break if quality unchanged
    }

    // If still too large and MIME is jpeg, try reducing dimensions progressively
    if (blob && blob.size > maxSizeBytes && mime === 'image/jpeg') {
        let shrinkFactor = 0.9;
        let currentWidth = outputWidth;
        let currentHeight = outputHeight;
        while (blob.size > maxSizeBytes && (currentWidth > 320 && currentHeight > 320)) {
            currentWidth = Math.max(320, Math.round(currentWidth * shrinkFactor));
            currentHeight = Math.max(320, Math.round(currentHeight * shrinkFactor));
            // resize canvas
            const tmpCanvas = document.createElement('canvas');
            tmpCanvas.width = currentWidth;
            tmpCanvas.height = currentHeight;
            const tctx = tmpCanvas.getContext('2d');
            tctx.drawImage(canvas, 0, 0, currentWidth, currentHeight);
            // replace canvas contents
            canvas.width = currentWidth;
            canvas.height = currentHeight;
            ctx.drawImage(tmpCanvas, 0, 0);
            blob = await attemptBlob();
            // reduce further
            shrinkFactor -= 0.05;
            if (shrinkFactor < 0.6) shrinkFactor = 0.6;
        }
    }

    // Final fallback: return dataURL of last blob or canvas
    if (blob) {
        return await blobToDataURL(blob);
    }

    return canvas.toDataURL();
}
