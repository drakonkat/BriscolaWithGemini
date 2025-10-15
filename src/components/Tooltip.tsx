/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect } from 'react';

// FIX: Define props with React.FC to correctly type the component, resolving issues with `key` props and `children`.
interface TooltipProps {
    content: React.ReactNode;
    // FIX: Explicitly add `children` to the `TooltipProps` interface to comply with modern React type definitions, where `children` is no longer an implicit prop on `React.FC`.
    children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef<number | null>(null);

    const showTooltip = () => {
        setIsVisible(true);
    };

    const hideTooltip = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setIsVisible(false);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        // Prevent context menu on long press
        e.preventDefault();
        timeoutRef.current = window.setTimeout(() => {
            showTooltip();
        }, 500); // 500ms for long press
    };

    useEffect(() => {
        // Cleanup on unmount
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

//TODO tooltip doesn't work ignoring for now
    // FIX: Moved event listeners from React.cloneElement to the wrapper div.
    // This resolves the TypeScript error and is a more robust way to handle events,
    // avoiding issues with children that might not accept DOM event props.
    return (
        <div
            className="tooltip-wrapper"
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onTouchStart={handleTouchStart}
            onTouchEnd={hideTooltip}
            onTouchCancel={hideTooltip}
            onFocus={showTooltip}
            onBlur={hideTooltip}
        >
            {children}
            {isVisible && content && (
                <div className="tooltip-content" role="tooltip">
                    {content}
                </div>
            )}
        </div>
    );
};
