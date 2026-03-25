import {useCallback, useEffect, useState} from 'react';
import './Timer.css';

interface Props {
    duration: number; // seconds
    active: boolean;
    onEnd?: () => void;
}

export default function Timer({duration, active, onEnd}: Props) {
    const [timeLeft, setTimeLeft] = useState(duration);
    const [urgent, setUrgent] = useState(false);

    const reset = useCallback(() => {
        setTimeLeft(duration);
        setUrgent(false);
    }, [duration]);

    useEffect(() => {
        reset();
    }, [duration, reset]);

    useEffect(() => {
        if (!active) {
            reset();
            return;
        }
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                const next = prev - 1;
                if (next <= 10) setUrgent(true);
                if (next <= 0) {
                    clearInterval(interval);
                    onEnd?.();
                    return 0;
                }
                return next;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [active, onEnd, reset]);

    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const progress = (timeLeft / duration);
    const dashOffset = circumference * (1 - progress);

    const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const secs = (timeLeft % 60).toString().padStart(2, '0');

    return (
        <div className={`timer ${urgent ? 'timer--urgent' : ''} ${!active ? 'timer--inactive' : ''}`}>
            <svg className="timer-svg" viewBox="0 0 100 100" width="100" height="100">
                {/* Track */}
                <circle
                    cx="50" cy="50" r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="4"
                />
                {/* Progress */}
                <circle
                    cx="50" cy="50" r={radius}
                    fill="none"
                    stroke={urgent ? 'var(--accent-1)' : 'var(--accent-3)'}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    transform="rotate(-90 50 50)"
                    style={{transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease'}}
                />
            </svg>
            <div className="timer-text">
                <span className="timer-digits">{mins}:{secs}</span>
                <span className="timer-label">таймер</span>
            </div>
        </div>
    );
}
