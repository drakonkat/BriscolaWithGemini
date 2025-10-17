/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { observer } from 'mobx-react-lite';
import { translations } from '../core/translations';
import { CachedImage } from './CachedImage';
import { useStores } from '../stores';

export const FullscreenImageModal = observer(({ isOpen, imageUrl, onClose, language }) => {
    const { uiStore } = useStores();
    const [isDownloading, setIsDownloading] = useState(false);
    const T = translations[language];

    if (!isOpen) {
        return null;
    }

    const handleDownload = async () => {
        setIsDownloading(true);
        const filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1) || 'waifu-briscola-background.png';

        try {
            const platform = Capacitor.getPlatform();

            if (platform === 'android') {
                // 1. Check permissions
                let permStatus = await Filesystem.checkPermissions();

                // 2. If not granted, request them
                if (permStatus.publicStorage !== 'granted') {
                    permStatus = await Filesystem.requestPermissions();
                }

                // 3. If granted, proceed with download
                if (permStatus.publicStorage === 'granted') {
                    try {
                        await Filesystem.downloadFile({
                            path: filename,
                            url: imageUrl,
                            // Use the user's public Downloads directory, available in modern Capacitor versions.
                            // FIX: Replaced `Directory.Downloads` with the correct `Directory.ExternalStorage` for saving files to the public downloads directory on Android, as per Capacitor's Filesystem API.
                            directory: Directory.ExternalStorage,
                        });
                        uiStore.showSnackbar(T.gallery.imageSavedToDownloads, 'success');
                    } catch (downloadError) {
                        console.error('Android file download error:', downloadError);
                        uiStore.showSnackbar(T.gallery.imageSaveFailed, 'warning');
                    }
                } else {
                    // 4. If denied, inform the user
                    uiStore.showSnackbar(T.gallery.permissionDenied, 'warning');
                }
            } else if (platform === 'web') {
                // For web, fetch the image as a blob to create a downloadable link
                const response = await fetch(imageUrl);
                if (!response.ok) {
                    throw new Error('Network response was not ok for web download.');
                }
                const blob = await response.blob();
                const objectUrl = URL.createObjectURL(blob);

                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = objectUrl;
                a.download = filename;

                document.body.appendChild(a);
                a.click();

                URL.revokeObjectURL(objectUrl);
                document.body.removeChild(a);
            } else {
                // For other native platforms (like iOS), which don't have the same permission model,
                // open in the system browser for the user to save.
                window.open(imageUrl, '_system');
            }
        } catch (error) {
            // This will catch general errors, like the fetch failing on web
            console.error('General download error:', error);
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