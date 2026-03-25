import {useEffect, useRef, useState} from 'react';
import type {CardItem, Difficulty} from '../types';
import {CARD_POOLS, getRandomFromPool} from '../services/cardService';
import './TeamCard.css';

interface Props {
    teamNumber: 1 | 2;
    teamName: string;
    card: CardItem;
    revealed: boolean;
    spinning: boolean;
    difficulty: Difficulty;
}

function SlotField({
                       value,
                       spinning,
                       revealed,
                       pool,
                       label,
                       icon,
                   }: {
    value: string;
    spinning: boolean;
    revealed: boolean;
    pool: string[];
    label: string;
    icon: string;
}) {
    const [displayValue, setDisplayValue] = useState(value);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (spinning) {
            setDisplayValue('???');
            let idx = 0;
            intervalRef.current = setInterval(() => {
                idx = (idx + 1) % pool.length;
                setDisplayValue(pool[idx]);
            }, 80);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            setDisplayValue(value);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [spinning, value, pool]);

    return (
        <div
            className={`slot-field ${spinning ? 'slot-field--spinning' : ''} ${revealed ? 'slot-field--revealed' : ''}`}>
            <div className="slot-label">
                <span className="slot-icon">{icon}</span>
                {label}
            </div>
            <div className="slot-value">
                {spinning ? (
                    <span className="slot-ticker">{displayValue}</span>
                ) : revealed ? (
                    <span className="slot-final">{displayValue}</span>
                ) : (
                    <span className="slot-hidden">• • • • •</span>
                )}
            </div>
        </div>
    );
}

export default function TeamCard({teamNumber, teamName, card, revealed, spinning, difficulty}: Props) {
    const pool = CARD_POOLS[difficulty];
    const allCards = pool.characters.concat(pool.places).concat(pool.opinions);
    void allCards;

    return (
        <div className={`team-card team-card--${teamNumber} ${revealed ? 'team-card--revealed' : ''}`}>
            <div className="tc-header">
                <div className="tc-badge">КОМАНДА {teamNumber}</div>
                <h2 className="tc-name">{teamName}</h2>
            </div>

            <div className="tc-slots">
                <SlotField
                    value={card.character}
                    spinning={spinning}
                    revealed={revealed}
                    pool={pool.characters}
                    label="Персонаж"
                    icon="◉"
                />
                <SlotField
                    value={card.place}
                    spinning={spinning}
                    revealed={revealed}
                    pool={pool.places}
                    label="Место"
                    icon="◈"
                />
                <SlotField
                    value={card.opinion}
                    spinning={spinning}
                    revealed={revealed}
                    pool={pool.opinions}
                    label="Мнение"
                    icon="◇"
                />
            </div>

            <div className="tc-shine"/>
        </div>
    );
}

// Need this for generating random cards during spinning animation
export {getRandomFromPool};
