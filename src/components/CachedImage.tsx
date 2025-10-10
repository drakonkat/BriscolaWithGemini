/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import { getCachedImageSrc } from '../core/imageCache';

// All props of <img> except 'src' which we manage.
type CachedImageProps = Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  imageUrl: string;
};

export const CachedImage = ({ imageUrl, ...props }: CachedImageProps) => {
  // Start with the original src, so it works immediately while cache is checked.
  const [imageSrc, setImageSrc] = useState(imageUrl);

  useEffect(() => {
    let isMounted = true;
    if (imageUrl && !imageUrl.startsWith('data:')) {
      getCachedImageSrc(imageUrl).then(finalSrc => {
        if (isMounted) {
          setImageSrc(finalSrc);
        }
      });
    } else if (imageUrl) {
        // If src is already a data URL, just use it
        setImageSrc(imageUrl);
    }
    return () => { isMounted = false; };
  }, [imageUrl]);

  if (!imageSrc) return null;

  return <img {...props} src={imageSrc} />;
};
