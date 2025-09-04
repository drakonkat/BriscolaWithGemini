/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { observer } from 'mobx-react-lite';
import { translations } from '../core/translations';
import { getCachedImageSrc } from '../core/imageCache';
import type { Language } from '../core/types';
import { CachedImage } from './CachedImage';
import { useStores } from '../stores';

interface FullscreenImageModalProps {
    isOpen: boolean;
    imageUrl: string;
    onClose: () => void;
    language: Language;
}

export const FullscreenImageModal = observer(({ isOpen, imageUrl, onClose, language }: FullscreenImageModalProps) => {
    const { uiStore } = useStores();
    const [isDownloading, setIsDownloading] = useState(false);
    const T = translations[language];

    if (!isOpen) {
        return null;
    }

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1) || 'waifu-briscola-background.png';
            
            const platform = Capacitor.getPlatform();

            if (platform === 'android') {
                // Use Filesystem API for native download on Android
                await Filesystem.downloadFile({
                    path: filename,
                    url: imageUrl,
                    directory: Directory.Documents,
                });
                uiStore.showSnackbar(T.gallery.imageSavedToDownloads, 'success');
            } else if (platform === 'web') {
                // For web, fetch the image as a blob to create a downloadable link
                try {
                    const response = await fetch(imageUrl);
                    if (!response.ok) {
                        throw new Error('Network response was not ok.');
                    }
                    const blob = await response.blob();
                    const objectUrl = URL.createObjectURL(blob);
                    
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = objectUrl;
                    a.download = filename;
                    
                    document.body.appendChild(a);
                    a.click();
                    
                    // Clean up the object URL and the link element
                    URL.revokeObjectURL(objectUrl);
                    document.body.removeChild(a);
                } catch (webError) {
                    console.warn('Web download via blob failed, falling back to new tab:', webError);
                    // Fallback for web if fetch/blob fails is to open in a new tab.
                    window.open(imageUrl, '_blank');
                }
            } else {
                // For other native platforms (like iOS), open in the system browser.
                window.open(imageUrl, '_system');
            }
        } catch (error) {
            // This will catch errors from the Android Filesystem API primarily
            console.warn('Error downloading image:', error);
            uiStore.showSnackbar(T.gallery.imageSaveFailed, 'warning');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="fullscreen-overlay" onClick={onClose}>
            <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
                <CachedImage imageUrl={imageUrl} alt={T.gallery.backgroundAlt} className="fullscreen-image" />
                <div className="fullscreen-actions">
                    <button className="fullscreen-button" onClick={handleDownload} disabled={isDownloading} aria-label={T.gallery.download}>
                        {isDownloading ? <div className="spinner"></div> : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                            </svg>
                        )}
                    </button>
                    <button className="fullscreen-button" onClick={onClose} aria-label={T.close}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
});