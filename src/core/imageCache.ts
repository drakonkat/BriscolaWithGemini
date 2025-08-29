/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// In-memory cache to avoid multiple localStorage hits in the same session.
const memoryCache: { [url: string]: string } = {};
const CACHE_PREFIX = 'img_cache_';

/**
 * Converts a Blob to a Base64 data URL.
 */
const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

/**
 * Retrieves an image from cache (memory or localStorage) or fetches it from the network
 * and caches it. Returns a data URL or the original URL on failure.
 * @param url The original network URL of the image.
 * @returns A promise that resolves to a data URL or the original URL.
 */
export const getCachedImageSrc = async (url: string): Promise<string> => {
    if (!url) return '';
    if (url.startsWith('data:')) return url;

    // 1. Check in-memory cache
    if (memoryCache[url]) {
        return memoryCache[url];
    }

    const cacheKey = CACHE_PREFIX + url;

    // 2. Check localStorage
    try {
        const cachedDataUrl = localStorage.getItem(cacheKey);
        if (cachedDataUrl) {
            memoryCache[url] = cachedDataUrl; // Populate memory cache
            return cachedDataUrl;
        }
    } catch (e) {
        console.warn('Could not read from localStorage:', e);
    }

    // 3. Fetch from network and cache
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const blob = await response.blob();
        const dataUrl = await blobToBase64(blob);

        // Try to cache in localStorage
        try {
            localStorage.setItem(cacheKey, dataUrl);
        } catch (e) {
            console.warn(`Failed to cache image in localStorage (might be full): ${url}`, e);
        }

        memoryCache[url] = dataUrl; // Populate memory cache
        return dataUrl;

    } catch (error) {
        console.error(`Failed to fetch and cache image: ${url}`, error);
        return url; // Fallback to the original network URL
    }
};
