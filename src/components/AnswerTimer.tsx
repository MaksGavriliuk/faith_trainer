import {useEffect, useState} from 'react';
import type {Perk} from '../types';
import './AnswerTimer.css';

interface Props {
    teamName: string;
    teamNumber: 1 | 2;
    totalSeconds: number;
    active: boolean;
    perk: Perk | null;
    extraMaterial: { text: string } | null;
    onStart: () => void;
    onEnd: () => void;
    done: boolean;
}

export default function AnswerTimer({
                                        teamName,
                                        teamNumber,
                                        totalSeconds,
                                        active,
                                        perk,
                                        extraMaterial,
                                        onStart,
                                        onEnd,
                                        done
                                    }: Props) {
    const [timeLeft, setTimeLeft] = useState(totalSeconds);

    useEffect(() => {
        setTimeLeft(totalSeconds);
    }, [totalSeconds]);

    useEffect(() => {
        if (!active) return;
        if (timeLeft <= 0) {
            onEnd();
            return;
        }
        const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
        return () => clearTimeout(t);
    }, [active, timeLeft, onEnd]);

    const radius = 54;
    const circ = 2 * Math.PI * radius;
    const progress = timeLeft / totalSeconds;
    const urgent = timeLeft <= 15 && timeLeft > 0;

    const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const secs = (timeLeft % 60).toString().padStart(2, '0');

    const teamClass = `at-panel at-panel--${teamNumber}${active ? ' at-panel--active' : ''}${done ? ' at-panel--done' : ''}`;

    return (
        <div className={teamClass}>
            <div className="at-header">
                <span className="at-badge">КОМАНДА {teamNumber}</span>
                <h3 className="at-name">{teamName}</h3>
            </div>

            <div className={`at-clock ${urgent ? 'at-clock--urgent' : ''}`}>
                <svg viewBox="0 0 120 120" width="120" height="120">
                    <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6"/>
                    <circle
                        cx="60" cy="60" r={radius}
                        fill="none"
                        stroke={urgent ? 'var(--accent-1)' : teamNumber === 1 ? 'var(--accent-3)' : 'var(--accent-2)'}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeDasharray={circ}
                        strokeDashoffset={circ * (1 - progress)}
                        transform="rotate(-90 60 60)"
                        style={{transition: 'stroke-dashoffset 1s linear, stroke 0.4s ease'}}
                    />
                </svg>
                <div className="at-time-text">
                    <span className="at-digits">{mins}:{secs}</span>
                    <span className="at-seconds-label">сек</span>
                </div>
            </div>

            {/* Perk badge */}
            {perk && (
                <div className={`at-perk ${perk.positive ? 'at-perk--positive' : 'at-perk--negative'}`}>
                    <span>{perk.emoji}</span>
                    <span className="at-perk-name">{perk.name}</span>
                    {perk.effect.type === 'silent_round' && <span className="at-perk-hint">без слов-паразитов</span>}
                    {perk.effect.type === 'swap_opinion' &&
                        <span className="at-perk-hint">противоположное мнение!</span>}
                    {perk.effect.type === 'extra_argument' && <span className="at-perk-hint">+ доп. аргумент</span>}
                </div>
            )}

            {/* Extra material snippet */}
            {extraMaterial && (
                <div className="at-material">
                    <span className="at-material-icon">📜</span>
                    <p className="at-material-text">{extraMaterial.text}</p>
                </div>
            )}

            {/* CTA */}
            {!active && !done && (
                <button className="at-start-btn" onClick={onStart}>
                    Начать ответ
                </button>
            )}
            {done && (
                <div className="at-done-badge">✓ ЗАВЕРШЕНО</div>
            )}
        </div>
    );
}
