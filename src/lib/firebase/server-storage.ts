import { adminStorage } from './admin';

export async function uploadBufferToStorage(buffer: Buffer, path: string, contentType: string): Promise<string> {
    const file = adminStorage.file(path);
    await file.save(buffer, {
        metadata: {
            contentType: contentType
        }
    });

    // Make the file publicly readable if needed, or get a signed URL
    // For now, let's use the standard Firebase Storage URL format if we know the bucket name
    // Or just get a signed URL with a long expiration
    const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2500' // Far future
    });

    return url;
}
