/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';

interface DiceRollAnimationProps {
    onAnimationComplete: () => void;
}

export const DiceRollAnimation = ({ onAnimationComplete }: DiceRollAnimationProps) => {
    const [number1, setNumber1] = useState(1);
    const [number2, setNumber2] = useState(1);
    const intervalRef1 = useRef<number | null>(null);
    const intervalRef2 = useRef<number | null>(null);

    useEffect(() => {
        // Start cycling numbers for both dice with slightly different intervals for a more dynamic effect
        intervalRef1.current = window.setInterval(() => {
            setNumber1(Math.floor(Math.random() * 100) + 1);
        }, 50);
        intervalRef2.current = window.setInterval(() => {
            setNumber2(Math.floor(Math.random() * 100) + 1);
        }, 55);

        // Stop cycling and call complete after animation duration
        const timer = setTimeout(() => {
            if (intervalRef1.current) clearInterval(intervalRef1.current);
            if (intervalRef2.current) clearInterval(intervalRef2.current);
            onAnimationComplete();
        }, 3000); // 3-second animation

        // Cleanup on unmount
        return () => {
            if (intervalRef1.current) clearInterval(intervalRef1.current);
            if (intervalRef2.current) clearInterval(intervalRef2.current);
            clearTimeout(timer);
        };
    }, [onAnimationComplete]);

    return (
        <div className="dice-animation-wrapper">
            <div className="dice-container">
                <div className="dice-face">
                    {number1}
                </div>
            </div>
            <div className="dice-container">
                <div className="dice-face">
                    {number2}
                </div>
            </div>
        </div>
    );
};