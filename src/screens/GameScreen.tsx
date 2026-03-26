import {useCallback, useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import type {Difficulty, ExtraMaterial, GamePhase, GameSession, SecretCard, TeamState} from '../types';
import {
    BASE_ANSWER_SECONDS,
    CARD_POOLS,
    computeAnswerSeconds,
    computeEffect,
    DIFFICULTY_LABELS,
    drawMaterial,
    drawRandomCard,
    drawRandomOpinion,
    drawSecret,
    emptyTeamState,
    generateCards,
    isLiftPlace,
    PREP_SECONDS,
} from '../services/cardService';
import './GameScreen.css';

const LEVELS: { id: Difficulty; label: string; sub: string }[] = [
    {id: 'easy', label: 'Лёгкий', sub: 'Друзья, знакомые, простые возражения'},
    {id: 'medium', label: 'Средний', sub: 'Незнакомцы, острые вопросы'},
    {id: 'hard', label: 'Сложный', sub: 'Сложные собеседники, глубокие возражения'},
];

function fmtTime(s: number) {
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, '0')}`;
}

// ── Timer hook ──────────────────────────────────────────────────────────────
function useCountdown(initial: number, active: boolean, onEnd: () => void) {
    const [left, setLeft] = useState(initial);
    const [paused, setPaused] = useState(false);
    const cbRef = useRef(onEnd);
    cbRef.current = onEnd;

    useEffect(() => {
        setLeft(initial);
        setPaused(false);
    }, [initial]);

    useEffect(() => {
        if (!active || paused) return;
        const id = setInterval(() => {
            setLeft(prev => {
                if (prev <= 1) {
                    clearInterval(id);
                    cbRef.current();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [active, paused]);

    const pause = useCallback(() => setPaused(true), []);
    const resume = useCallback(() => setPaused(false), []);
    const reset = useCallback(() => {
        setLeft(initial);
        setPaused(false);
    }, [initial]);
    return {left, paused, pause, resume, reset};
}

// ── BigTimer ────────────────────────────────────────────────────────────────
function BigTimer({seconds, total, paused, color}: {
    seconds: number;
    total: number;
    paused?: boolean;
    color: string
}) {
    const r = 70, circ = 2 * Math.PI * r;
    const pct = total > 0 ? seconds / total : 0;
    const urgent = seconds <= 15 && seconds > 0;
    return (
        <div className={`big-timer ${urgent ? 'bt-urgent' : ''} ${paused ? 'bt-paused' : ''}`}>
            <svg viewBox="0 0 160 160" width="260" height="260">
                <circle cx="80" cy="80" r={r} fill="none" stroke="var(--grey-1)" strokeWidth="8"/>
                <circle cx="80" cy="80" r={r} fill="none"
                        stroke={urgent ? 'var(--raspberry)' : color}
                        strokeWidth="8" strokeLinecap="round"
                        strokeDasharray={circ}
                        strokeDashoffset={circ * (1 - pct)}
                        transform="rotate(-90 80 80)"
                        style={{transition: 'stroke-dashoffset 1s linear'}}
                />
            </svg>
            <div className="bt-text">
            <span className="bt-digits">{fmtTime(seconds)}</span>
                {paused && <span className="bt-paused-label">ПАУЗА</span>}
            </div>
        </div>
    );
}

// ── SmallTimer (10s pause) ──────────────────────────────────────────────────
function SmallTimer({seconds}: { seconds: number }) {
    return (
        <div className="small-timer">
            <div className="small-timer-num">{seconds}</div>
            <div className="small-timer-label">сек пауза</div>
        </div>
    );
}

// ── CardChip ────────────────────────────────────────────────────────────────
function CardChip({label, value, color, canReplace, onReplace}: {
    label: string; value: string; color: string;
    canReplace?: boolean; onReplace?: () => void;
}) {
    return (
        <div className="card-chip" style={{borderColor: color} as React.CSSProperties}>
            <div className="chip-label" style={{color}}>{label}</div>
            <div className="chip-value">{value}</div>
            {canReplace && <button className="chip-replace" onClick={onReplace} style={{color}}>↺ заменить</button>}
        </div>
    );
}

// ── SecretBadge ─────────────────────────────────────────────────────────────
function SecretBadge({card}: { card: SecretCard }) {
    return (
        <div className={`secret-badge ${card.positive ? 'sb-pos' : 'sb-neg'}`}>
            <div className="sb-type">{card.positive ? '✦ ПОМОЩЬ' : '✦ УСЛОЖНЕНИЕ'}</div>
            <div className="sb-name">{card.name}</div>
            <div className="sb-desc">{card.description}</div>
        </div>
    );
}

// ── DrawModal ────────────────────────────────────────────────────────────────
function DrawModal({title, sub, color, onDraw, onSkip, drawn, isSecret, onConfirm}: {
    title: string; sub: string; color: string;
    onDraw: () => void; onSkip: () => void;
    drawn: ExtraMaterial | SecretCard | null;
    isSecret: boolean;
    onConfirm: () => void;
}) {
    return (
        <div className="overlay">
            <div className="modal" style={{'--mc': color} as React.CSSProperties}>
                <div className="modal-top">
                    <div className="modal-title">{title}</div>
                    <div className="modal-sub">{sub}</div>
                </div>
                {!drawn ? (
                    <div className="modal-btns">
                        <button className="mbtn mbtn-primary" onClick={onDraw}>Вытянуть</button>
                        <button className="mbtn mbtn-ghost" onClick={onSkip}>Пропустить</button>
                    </div>
                ) : (
                    <div className="modal-result">
                        {!isSecret ? (
                            <div className="mr-material">
                                <div className="mr-material-label">ДОП. МАТЕРИАЛ</div>
                                <div className="mr-material-text">{(drawn as ExtraMaterial).text}</div>
                            </div>
                        ) : (
                            <div
                                className={`mr-secret ${(drawn as SecretCard).positive ? 'mr-secret-pos' : 'mr-secret-neg'}`}>
                                <div
                                    className="mr-secret-type">{(drawn as SecretCard).positive ? 'ПОМОЩЬ' : 'УСЛОЖНЕНИЕ'}</div>
                                <div className="mr-secret-name">{(drawn as SecretCard).name}</div>
                                <div className="mr-secret-desc">{(drawn as SecretCard).description}</div>
                            </div>
                        )}
                        <button className="mbtn mbtn-primary" onClick={onConfirm}>Принять →</button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── RoundSummary ─────────────────────────────────────────────────────────────
function RoundSummary({t1, t2, onNext, onReset}: {
    t1: TeamState; t2: TeamState;
    onNext: () => void; onReset: () => void;
}) {
    return (
        <div className="summary">
            <div className="summary-title">Раунд завершён</div>
            <div className="summary-teams">
                {[{t: t1, name: 'АЛЬФА', color: 'var(--purple)'}, {
                    t: t2,
                    name: 'БЕТА',
                    color: 'var(--raspberry)'
                }].map(({t, name, color}) => (
                    <div key={name} className="summary-team" style={{borderColor: color} as React.CSSProperties}>
                        <div className="sum-team-name" style={{color}}>{name}</div>
                        <div className="sum-row"><span>Персонаж</span><b>{t.card.character}</b></div>
                        <div className="sum-row"><span>Место</span><b>{t.card.place}</b></div>
                        <div className="sum-row"><span>Мнение</span><b>{t.card.opinion}</b></div>
                        {t.material && <div className="sum-row"><span>Материал</span><b>{t.material.text}</b></div>}
                        {t.secretCard && <div className="sum-row"><span>Карточка</span><b>{t.secretCard.name}</b></div>}
                    </div>
                ))}
            </div>
            <div className="summary-btns">
                <button className="gs-btn gs-btn-black" onClick={onNext}>Следующий раунд →</button>
                <button className="gs-btn gs-btn-ghost" onClick={onReset}>↺ Сброс</button>
            </div>
        </div>
    );
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function GameScreen() {
    const navigate = useNavigate();
    const session = useRef<GameSession>({
        difficulty: null,
        usedCharacters: new Set(), usedPlaces: new Set(), usedOpinions: new Set(),
        usedMaterials: new Set(), usedSecrets: new Set(), roundCount: 0,
    });

    const [phase, setPhase] = useState<GamePhase>('idle');
    const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
    const [roundCount, setRoundCount] = useState(0);
    const [t1, setT1] = useState<TeamState>(emptyTeamState(40));
    const [t2, setT2] = useState<TeamState>(emptyTeamState(40));

    const [drawnMat1, setDrawnMat1] = useState<ExtraMaterial | null>(null);
    const [drawnMat2, setDrawnMat2] = useState<ExtraMaterial | null>(null);
    const [drawnSec1, setDrawnSec1] = useState<SecretCard | null>(null);
    const [drawnSec2, setDrawnSec2] = useState<SecretCard | null>(null);

    // prep
    // prep
    const [prep1Total, setPrep1Total] = useState(PREP_SECONDS);
    const [prep2Total, setPrep2Total] = useState(PREP_SECONDS);
    const [prepActive, setPrepActive] = useState(false);
    const [prep1Done, setPrep1Done] = useState(false);
    const [prep2Done, setPrep2Done] = useState(false);
    const prepDone = prep1Done && prep2Done;
    const prep1 = useCountdown(prep1Total, prepActive && !prep1Done, () => setPrep1Done(true));
    const prep2 = useCountdown(prep2Total, prepActive && !prep2Done, () => setPrep2Done(true));

    // answer timers
    const [ans1Active, setAns1Active] = useState(false);
    const [ans2Active, setAns2Active] = useState(false);
    const onAns1End = useCallback(() => setT1(s => ({...s, answerDone: true, answerStarted: false})), []);
    const onAns2End = useCallback(() => setT2(s => ({...s, answerDone: true, answerStarted: false})), []);
    const ans1 = useCountdown(t1.answerSeconds, ans1Active && !t1.answerPaused, onAns1End);
    const ans2 = useCountdown(t2.answerSeconds, ans2Active && !t2.answerPaused, onAns2End);

    // 10-sec pause
    const [p10Active, setP10Active] = useState(false);
    const [p10Left, setP10Left] = useState(10);
    const p10TeamRef = useRef<1 | 2>(1);

    useEffect(() => {
        if (!p10Active) return;
        if (p10Left <= 0) {
            setP10Active(false);
            setP10Left(10);
            if (p10TeamRef.current === 1) setT1(s => ({...s, answerPaused: false}));
            else setT2(s => ({...s, answerPaused: false}));
            return;
        }
        const t = setTimeout(() => setP10Left(p => p - 1), 1000);
        return () => clearTimeout(t);
    }, [p10Active, p10Left]);

    // ── Pick level ─────────────────────────────────────────────────────────────
    const pickLevel = useCallback((diff: Difficulty) => {
        setDifficulty(diff);
        session.current.difficulty = diff;
        setPhase('spinning');
        const base = BASE_ANSWER_SECONDS[diff];
        setT1(emptyTeamState(base));
        setT2(emptyTeamState(base));
        setDrawnMat1(null);
        setDrawnMat2(null);
        setDrawnSec1(null);
        setDrawnSec2(null);

        setPrep1Done(false);
        setPrep2Done(false);

        setPrepActive(false);
        setAns1Active(false);
        setAns2Active(false);
        setP10Active(false);
        setP10Left(10);

        const {team1: c1, team2: c2} = generateCards(diff,
            session.current.usedCharacters, session.current.usedPlaces, session.current.usedOpinions);

        setTimeout(() => {
            session.current.usedCharacters.add(c1.character);
            session.current.usedCharacters.add(c2.character);
            session.current.usedPlaces.add(c1.place);
            session.current.usedPlaces.add(c2.place);
            session.current.usedOpinions.add(c1.opinion);
            session.current.usedOpinions.add(c2.opinion);
            setT1(s => ({...s, card: c1, answerSeconds: base}));
            setT2(s => ({...s, card: c2, answerSeconds: base}));
            setRoundCount(r => {
                const n = r + 1;
                session.current.roundCount = n;
                return n;
            });
            setPhase('reveal_cards');
        }, 3800);
    }, []);

    // ── Draw helpers ────────────────────────────────────────────────────────────
    const doDrawMat = (team: 1 | 2) => {
        const m = drawMaterial(session.current.usedMaterials);
        session.current.usedMaterials.add(m.id);
        if (team === 1) setDrawnMat1(m); else setDrawnMat2(m);
    };
    const doDrawSec = (team: 1 | 2) => {
        const s = drawSecret(session.current.usedSecrets);
        session.current.usedSecrets.add(s.id);
        if (team === 1) setDrawnSec1(s); else setDrawnSec2(s);
    };

    const confirmMat1 = () => {
        setT1(s => ({...s, material: drawnMat1}));
        setPhase('draw_material_2');
    };
    const skipMat1 = () => {
        setPhase('draw_material_2');
    };
    const confirmMat2 = () => {
        setT2(s => ({...s, material: drawnMat2}));
        setPhase('draw_secret_1');
    };
    const skipMat2 = () => {
        setPhase('draw_secret_1');
    };

    const confirmSec1 = () => {
        const eff = computeEffect(drawnSec1);
        setT1(s => ({...s, secretCard: drawnSec1, effect: eff}));
        setPhase('draw_secret_2');
    };
    const skipSec1 = () => setPhase('draw_secret_2');

    const confirmSec2 = (final?: SecretCard | null) => {
        const sec2 = final !== undefined ? final : drawnSec2;
        const eff2 = computeEffect(sec2);
        const sec1 = t1.secretCard;

        if (difficulty) {
            const base = BASE_ANSWER_SECONDS[difficulty];
            const lift1 = isLiftPlace(t1.card.place);
            const lift2 = isLiftPlace(t2.card.place);
            const a1 = computeAnswerSeconds(base, sec1, sec2, lift1);
            const a2 = computeAnswerSeconds(base, sec2, sec1, lift2);
            const pp1 = PREP_SECONDS + (sec1?.effect.type === 'prep_time_bonus' ? (sec1.effect as any).seconds : 0);
            const pp2 = PREP_SECONDS + (sec2?.effect.type === 'prep_time_bonus' ? (sec2.effect as any).seconds : 0);
            setT1(s => ({...s, answerSeconds: a1}));
            setT2(s => ({...s, secretCard: sec2, effect: eff2, answerSeconds: a2}));
            setPrep1Total(pp1);
            setPrep2Total(pp2);
        } else {
            setT2(s => ({...s, secretCard: sec2, effect: eff2}));
        }

        setPhase('replace_cards');
    };
    const skipSec2 = () => confirmSec2(null);

    // ── Replace cards ───────────────────────────────────────────────────────────

    const replaceCard = (team: 1 | 2, field: 'characters' | 'places' | 'opinions') => {
        if (!difficulty) return;

        const existing = team === 1
            ? [t1.card.character, t1.card.place, t1.card.opinion]
            : [t2.card.character, t2.card.place, t2.card.opinion];
        const newVal = drawRandomCard(difficulty, field, existing);
        if (team === 1) setT1(s => ({
            ...s,
            card: {...s.card, [field === 'characters' ? 'character' : field === 'places' ? 'place' : 'opinion']: newVal}
        }));
        else setT2(s => ({
            ...s,
            card: {...s.card, [field === 'characters' ? 'character' : field === 'places' ? 'place' : 'opinion']: newVal}
        }));
    };

    const replaceMaterial = (team: 1 | 2) => {
        const m = drawMaterial(session.current.usedMaterials);
        session.current.usedMaterials.add(m.id);
        if (team === 1) setT1(s => ({...s, material: m}));
        else setT2(s => ({...s, material: m}));
    };

    const drawNewOpinion = (team: 1 | 2) => {
        if (!difficulty) return;
        const current = team === 1 ? t1.card.opinion : t2.card.opinion;
        const newOp = drawRandomOpinion(difficulty, [current]);
        if (team === 1) setT1(s => ({...s, card: {...s.card, opinion: newOp}}));
        else setT2(s => ({...s, card: {...s.card, opinion: newOp}}));
    };

    const goToPrep = () => {
        prep1.reset();
        prep2.reset();
        setPhase('prep');
    };

    // ── Prep → answer ──────────────────────────────────────────────────────────
    const startPrep = () => {
        setPrepActive(true);
    };

    const startAnswer1 = () => {
        setPhase('answer_1');
        // setAns1Active(true);
        // ans1.reset();
    };

    const startAnswer2 = () => {
        setPhase('answer_2');
        setAns2Active(true);
        ans2.reset();
    };

    const pauseAnswer = (team: 1 | 2) => {
        if (team === 1) {
            setT1(s => ({...s, answerPaused: !s.answerPaused}));
        } else {
            setT2(s => ({...s, answerPaused: !s.answerPaused}));
        }
    };

    const trigger10sPause = (team: 1 | 2) => {
        p10TeamRef.current = team;
        if (team === 1) setT1(s => ({...s, answerPaused: true, pause10sUsed: true}));
        else setT2(s => ({...s, answerPaused: true, pause10sUsed: true}));
        setP10Left(10);
        setP10Active(true);
    };

    const handleTeam1Done = () => {
        setAns1Active(false);
        // setAns2Active(true);    // ← добавить
        // ans2.reset();            // ← добавить
        setPhase('answer_2');
    };
    const handleTeam2Done = () => {
        setAns2Active(false);
        setPhase('round_summary');
    };

    // ── Reset ─────────────────────────────────────────────────────────────────
    const fullReset = () => {
        session.current = {
            difficulty: null,
            usedCharacters: new Set(), usedPlaces: new Set(), usedOpinions: new Set(),
            usedMaterials: new Set(), usedSecrets: new Set(), roundCount: 0,
        };
        setPhase('idle');
        setDifficulty(null);
        setRoundCount(0);
        setT1(emptyTeamState(40));
        setT2(emptyTeamState(40));
        setDrawnMat1(null);
        setDrawnMat2(null);
        setDrawnSec1(null);
        setDrawnSec2(null);

        setPrep1Done(false);
        setPrep2Done(false);

        setPrepActive(false);
        setAns1Active(false);
        setAns2Active(false);
        setP10Active(false);
        setP10Left(10);
    };

    const nextRound = () => {
        setPhase('pick_level');
        setDifficulty(null);
    };

    // ── Spinning animation ─────────────────────────────────────────────────────
    const [spinTick, setSpinTick] = useState(0);
    const [charLocked1, setCharLocked1] = useState(false);
    const [placeLocked1, setPlaceLocked1] = useState(false);
    const [opLocked1, setOpLocked1] = useState(false);
    const [charLocked2, setCharLocked2] = useState(false);
    const [placeLocked2, setPlaceLocked2] = useState(false);
    const [opLocked2, setOpLocked2] = useState(false);

    useEffect(() => {
        if (phase !== 'spinning') return;

        setCharLocked1(false);
        setPlaceLocked1(false);
        setOpLocked1(false);
        setCharLocked2(false);
        setPlaceLocked2(false);
        setOpLocked2(false);

        const id = setInterval(() => setSpinTick(n => n + 1), 110);

        // Альфа останавливается первой
        const t1char = setTimeout(() => setCharLocked1(true), 1000);
        const t1place = setTimeout(() => setPlaceLocked1(true), 1500);
        const t1op = setTimeout(() => setOpLocked1(true), 2000);

        // Бета останавливается второй
        const t2char = setTimeout(() => setCharLocked2(true), 2400);
        const t2place = setTimeout(() => setPlaceLocked2(true), 2900);
        const t2op = setTimeout(() => setOpLocked2(true), 3400);

        return () => {
            clearInterval(id);
            clearTimeout(t1char);
            clearTimeout(t1place);
            clearTimeout(t1op);
            clearTimeout(t2char);
            clearTimeout(t2place);
            clearTimeout(t2op);
        };
    }, [phase]);

    const pool = difficulty ? CARD_POOLS[difficulty] : null;
    const spinChar = pool ? pool.characters[spinTick % pool.characters.length] : '…';
    const spinPlace = pool ? pool.places[spinTick % pool.places.length] : '…';
    const spinOp = pool ? pool.opinions[spinTick % pool.opinions.length] : '…';

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div className="gs">
            {/* Header */}
            <header className="gs-header">
                <button className="gs-back" onClick={() => navigate('/')}>← выход</button>
                <div className="gs-header-mid">
                    <span className="gs-logo">ВЕРАТРЕНАЖЕР</span>
                    {difficulty && <span className="gs-diff-pill">{DIFFICULTY_LABELS[difficulty]}</span>}
                </div>
                <div className="gs-round">
                    <span className="gs-round-lbl">РАУНД</span>
                    <span className="gs-round-num">{String(roundCount).padStart(2, '0')}</span>
                </div>
            </header>

            {/* ── IDLE / PICK LEVEL ── */}
            {(phase === 'idle' || phase === 'pick_level') && (
                <div className="gs-center">
                    <div className="pick-wrap" style={{animation: 'fadeIn .4s ease both'}}>
                        <div
                            className="pick-eyebrow">{phase === 'idle' ? 'НАЧАЛО ИГРЫ' : `РАУНД ${roundCount + 1}`}</div>
                        <h2 className="pick-title">{phase === 'idle' ? 'Выберите уровень' : 'Выберите уровень'}</h2>
                        <div className="pick-cards">
                            {LEVELS.map(l => (
                                <button key={l.id} className={`pick-card pick-card--${l.id}`}
                                        onClick={() => pickLevel(l.id)}>
                                    <span className="pick-card-label">{l.label}</span>
                                    <span className="pick-card-sub">{l.sub}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ── SPINNING ── */}
            {phase === 'spinning' && (
                <div className="gs-center">
                    <div className="spin-wrap">
                        <div className="spin-label">Генерируем карточки…</div>
                        <div className="spin-columns">

                            {/* АЛЬФА */}
                            <div className="spin-column">
                                <div className="spin-column-name" style={{color: 'var(--purple)'}}>АЛЬФА</div>
                                <div className={`spin-slot ${charLocked1 ? 'spin-slot--locked' : ''}`}>
                                    <div className="spin-slot-label">ПЕРСОНАЖ</div>
                                    <div className="spin-slot-track">
                                        {charLocked1
                                            ? <span
                                                className="spin-slot-value spin-slot-value--final">{t1.card.character}</span>
                                            : <span key={spinTick} className="spin-slot-value">{spinChar}</span>
                                        }
                                    </div>
                                </div>
                                <div className={`spin-slot ${placeLocked1 ? 'spin-slot--locked' : ''}`}>
                                    <div className="spin-slot-label">МЕСТО</div>
                                    <div className="spin-slot-track">
                                        {placeLocked1
                                            ? <span
                                                className="spin-slot-value spin-slot-value--final">{t1.card.place}</span>
                                            : <span key={spinTick + 10} className="spin-slot-value">{spinPlace}</span>
                                        }
                                    </div>
                                </div>
                                <div className={`spin-slot ${opLocked1 ? 'spin-slot--locked' : ''}`}>
                                    <div className="spin-slot-label">МНЕНИЕ</div>
                                    <div className="spin-slot-track spin-slot-track--tall">
                                        {opLocked1
                                            ? <span
                                                className="spin-slot-value spin-slot-value--final spin-slot-value--sm">{t1.card.opinion}</span>
                                            : <span key={spinTick + 20}
                                                    className="spin-slot-value spin-slot-value--sm">{spinOp}</span>
                                        }
                                    </div>
                                </div>
                            </div>

                            <div className="spin-divider"/>

                            {/* БЕТА */}
                            <div className="spin-column">
                                <div className="spin-column-name" style={{color: 'var(--raspberry)'}}>БЕТА</div>
                                <div className={`spin-slot ${charLocked2 ? 'spin-slot--locked' : ''}`}>
                                    <div className="spin-slot-label">ПЕРСОНАЖ</div>
                                    <div className="spin-slot-track">
                                        {charLocked2
                                            ? <span
                                                className="spin-slot-value spin-slot-value--final">{t2.card.character}</span>
                                            : <span key={spinTick + 30} className="spin-slot-value">{spinChar}</span>
                                        }
                                    </div>
                                </div>
                                <div className={`spin-slot ${placeLocked2 ? 'spin-slot--locked' : ''}`}>
                                    <div className="spin-slot-label">МЕСТО</div>
                                    <div className="spin-slot-track">
                                        {placeLocked2
                                            ? <span
                                                className="spin-slot-value spin-slot-value--final">{t2.card.place}</span>
                                            : <span key={spinTick + 40} className="spin-slot-value">{spinPlace}</span>
                                        }
                                    </div>
                                </div>
                                <div className={`spin-slot ${opLocked2 ? 'spin-slot--locked' : ''}`}>
                                    <div className="spin-slot-label">МНЕНИЕ</div>
                                    <div className="spin-slot-track spin-slot-track--tall">
                                        {opLocked2
                                            ? <span
                                                className="spin-slot-value spin-slot-value--final spin-slot-value--sm">{t2.card.opinion}</span>
                                            : <span key={spinTick + 50}
                                                    className="spin-slot-value spin-slot-value--sm">{spinOp}</span>
                                        }
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* ── REVEAL CARDS ── */}
            {phase === 'reveal_cards' && (
                <div className="gs-main reveal-main">
                    <div className="reveal-header">
                        <div className="reveal-title">Ваши карточки</div>
                        <div className="reveal-sub">Изучите и решите — нужен ли дополнительный материал</div>
                    </div>
                    <div className="reveal-teams">
                        <div className="reveal-team" style={{animationDelay: '0ms'}}>
                            <div className="reveal-team-name" style={{color: 'var(--purple)'}}>АЛЬФА</div>
                            <div className="reveal-chips">
                                <div style={{animationDelay: '100ms'}} className="reveal-chip-wrap">
                                    <CardChip label="Персонаж" value={t1.card.character} color="var(--purple)"/>
                                </div>
                                <div style={{animationDelay: '250ms'}} className="reveal-chip-wrap">
                                    <CardChip label="Место" value={t1.card.place} color="var(--purple)"/>
                                </div>
                                <div style={{animationDelay: '400ms'}} className="reveal-chip-wrap">
                                    <CardChip label="Мнение" value={t1.card.opinion} color="var(--purple)"/>
                                </div>
                            </div>
                        </div>
                        <div className="reveal-team" style={{animationDelay: '500ms'}}>
                            <div className="reveal-team-name" style={{color: 'var(--raspberry)'}}>БЕТА</div>
                            <div className="reveal-chips">
                                <div style={{animationDelay: '600ms'}} className="reveal-chip-wrap">
                                    <CardChip label="Персонаж" value={t2.card.character} color="var(--raspberry)"/>
                                </div>
                                <div style={{animationDelay: '750ms'}} className="reveal-chip-wrap">
                                    <CardChip label="Место" value={t2.card.place} color="var(--raspberry)"/>
                                </div>
                                <div style={{animationDelay: '900ms'}} className="reveal-chip-wrap">
                                    <CardChip label="Мнение" value={t2.card.opinion} color="var(--raspberry)"/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="reveal-footer"
                         style={{animationDelay: '1000ms', animation: 'fadeIn .4s ease both'}}>
                        <button className="gs-btn gs-btn-black" onClick={() => setPhase('draw_material_1')}>
                            Тянуть дополнительный материал →
                        </button>
                    </div>
                </div>
            )}

            {/* ── DRAW MATERIAL 1 ── */}
            {phase === 'draw_material_1' && (
                <DrawModal title="Команда АЛЬФА" sub="Вытянуть дополнительный материал?"
                           color="var(--purple)" onDraw={() => doDrawMat(1)} onSkip={skipMat1}
                           drawn={drawnMat1} isSecret={false} onConfirm={confirmMat1}/>
            )}

            {/* ── DRAW MATERIAL 2 ── */}
            {phase === 'draw_material_2' && (
                <DrawModal title="Команда БЕТА" sub="Вытянуть дополнительный материал?"
                           color="var(--raspberry)" onDraw={() => doDrawMat(2)} onSkip={skipMat2}
                           drawn={drawnMat2} isSecret={false} onConfirm={confirmMat2}/>
            )}

            {/* ── DRAW SECRET 1 ── */}
            {phase === 'draw_secret_1' && (
                <DrawModal title="Команда АЛЬФА" sub="Вытянуть секретную карточку?"
                           color="var(--purple)" onDraw={() => doDrawSec(1)} onSkip={skipSec1}
                           drawn={drawnSec1} isSecret={true} onConfirm={confirmSec1}/>
            )}

            {/* ── DRAW SECRET 2 ── */}
            {phase === 'draw_secret_2' && (
                <DrawModal title="Команда БЕТА" sub="Вытянуть секретную карточку?"
                           color="var(--raspberry)" onDraw={() => doDrawSec(2)} onSkip={skipSec2}
                           drawn={drawnSec2} isSecret={true} onConfirm={() => confirmSec2(drawnSec2)}/>
            )}

            {/* ── REPLACE CARDS ── */}
            {phase === 'replace_cards' && difficulty && (
                <div className="gs-main">
                    {/*<div className="replace-header">*/}
                    {/*    <div className="replace-title">Замена карточек</div>*/}
                    {/*<div className="replace-sub">Если есть карточка с правом замены — используйте кнопки ниже</div>*/}
                    {/*</div>*/}
                    <div className="replace-teams">
                        {([
                            {t: t1, team: 1 as 1 | 2, name: 'АЛЬФА', color: 'var(--purple)'},
                            {t: t2, team: 2 as 1 | 2, name: 'БЕТА', color: 'var(--raspberry)'},
                        ] as const).map(({t, team, name, color}) => (
                            <div key={name} className="replace-team-col">
                                <div className="replace-team-name" style={{color}}>{name}</div>
                                <div className="replace-chips">
                                    <CardChip label="Персонаж" value={t.card.character} color={color}
                                              canReplace={t.effect.canReplaceAnyCard || t1.effect.canReplaceAnyCard || t2.effect.canReplaceAnyCard}
                                              onReplace={() => replaceCard(team, 'characters')}/>
                                    <CardChip label="Место" value={t.card.place} color={color}
                                              canReplace={t.effect.canReplaceAnyCard || t1.effect.canReplaceAnyCard || t2.effect.canReplaceAnyCard}
                                              onReplace={() => replaceCard(team, 'places')}/>
                                    <CardChip label="Мнение" value={t.card.opinion} color={color}
                                              canReplace={
                                                  t.effect.canReplaceAnyCard ||
                                                  t1.effect.canReplaceAnyCard ||
                                                  t2.effect.canReplaceAnyCard ||
                                                  t.effect.canDrawNewOpinion ||
                                                  (team === 1 && t2.secretCard?.effect.type === 'opponent_draw_opinion') ||
                                                  (team === 2 && t1.secretCard?.effect.type === 'opponent_draw_opinion')
                                              }
                                              onReplace={() => drawNewOpinion(team)}/>
                                    {t.material && (
                                        <CardChip label="Материал" value={t.material.text} color={color}
                                                  canReplace={t.effect.canReplaceMaterial || t.effect.canReplaceAnyCard}
                                                  onReplace={() => replaceMaterial(team)}/>
                                    )}
                                </div>
                                {t.secretCard && <div style={{marginTop: 8}}><SecretBadge card={t.secretCard}/></div>}
                            </div>
                        ))}
                    </div>
                    <div className="replace-footer">
                        <button className="gs-btn gs-btn-black" onClick={goToPrep}>Перейти к подготовке →</button>
                    </div>
                </div>
            )}

            {/* ── PREP ── */}
            {phase === 'prep' && (
                <div className="gs-main">
                    <div className="prep-area">
                        <div className="prep-title">ПОДГОТОВКА</div>
                        <div className="prep-sub">Изучите карточки и подготовьтесь к ответу</div>

                        <div className="prep-teams">
                            {[
                                {t: t1, name: 'АЛЬФА', color: 'var(--purple)', prep: prep1, prepTotal: prep1Total},
                                {t: t2, name: 'БЕТА', color: 'var(--raspberry)', prep: prep2, prepTotal: prep2Total},
                            ].map(({t, name, color, prep, prepTotal}) => (
                                <div key={name} className="prep-team">
                                    <div className="prep-team-name" style={{color}}>{name}</div>
                                    <div className="prep-sub" style={{marginBottom: 8}}>
                                        {fmtTime(prepTotal)} на подготовку
                                    </div>
                                    <BigTimer seconds={prep.left} total={prepTotal} paused={prep.paused} color={color}/>
                                    <div className="prep-chips">
                                        <CardChip label="Персонаж" value={t.card.character} color={color}/>
                                        <CardChip label="Место" value={t.card.place} color={color}/>
                                        <CardChip label="Мнение" value={t.card.opinion} color={color}/>
                                        {t.material &&
                                            <CardChip label="Материал" value={t.material.text} color={color}/>}
                                        {t.secretCard && <SecretBadge card={t.secretCard}/>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="prep-timer-btns">
                            {!prepActive && !prepDone && (
                                <button className="gs-btn gs-btn-black" onClick={startPrep}>Запустить таймер</button>
                            )}
                            {prepActive && !prep1.paused && (
                                <button className="gs-btn gs-btn-outline" onClick={() => {
                                    prep1.pause();
                                    prep2.pause();
                                }}>⏸ Пауза</button>
                            )}
                            {prepActive && prep1.paused && (
                                <button className="gs-btn gs-btn-black" onClick={() => {
                                    prep1.resume();
                                    prep2.resume();
                                }}>▶ Продолжить</button>
                            )}
                            {prepDone && (
                                <div className="prep-done-badge">Время вышло!</div>
                            )}
                        </div>

                        <button className="gs-btn gs-btn-black" onClick={startAnswer1} style={{marginTop: 16}}>
                            Начать ответы →
                        </button>
                    </div>
                    <div className="gs-controls-bar">
                        <button className="gs-btn gs-btn-ghost-sm" onClick={fullReset}>↺ Сброс</button>
                    </div>
                </div>
            )}

            {/* ── ANSWER 1 ── */}
            {phase === 'answer_1' && (
                <div className="gs-main">
                    <div className="answer-area">
                        <div className="answer-team-label" style={{color: 'var(--purple)'}}>КОМАНДА АЛЬФА ОТВЕЧАЕТ</div>

                        {t1.secretCard && <SecretBadge card={t1.secretCard}/>}

                        <div className="answer-cards-row">
                            <CardChip label="Персонаж" value={t1.card.character} color="var(--purple)"/>
                            <CardChip label="Место" value={t1.card.place} color="var(--purple)"/>
                            <CardChip label="Мнение" value={t1.card.opinion} color="var(--purple)"/>
                            {t1.material && <CardChip label="Материал" value={t1.material.text} color="var(--purple)"/>}
                        </div>

                        <div className="answer-timer-row">
                            <BigTimer seconds={ans1.left} total={t1.answerSeconds} paused={t1.answerPaused}
                                      color="var(--purple)"/>
                            <div className="answer-btns">
                                {!ans1Active && !t1.answerDone && (
                                    <button className="gs-btn gs-btn-black" onClick={() => { setAns1Active(true); ans1.reset(); }}>
                                        Запустить таймер
                                    </button>
                                )}
                                {!t1.answerDone && !t1.answerPaused && ans1Active && (
                                    <button className="gs-btn gs-btn-outline" onClick={() => pauseAnswer(1)}>⏸
                                        Пауза</button>
                                )}
                                {!t1.answerDone && t1.answerPaused && !p10Active && (
                                    <button className="gs-btn gs-btn-black" onClick={() => pauseAnswer(1)}>▶
                                        Продолжить</button>
                                )}
                                {t1.effect.canPause10s && !t1.pause10sUsed && !p10Active && (
                                    <button className="gs-btn gs-btn-yellow" onClick={() => trigger10sPause(1)}>⏱ Пауза
                                        10 сек</button>
                                )}
                                {p10Active && p10TeamRef.current === 1 && (
                                    <SmallTimer seconds={p10Left}/>
                                )}
                                {t1.effect.canSwapSpeaker && !t1.swapUsed && (
                                    <button className="gs-btn gs-btn-outline"
                                            onClick={() => setT1(s => ({...s, swapUsed: true}))}>
                                        🔄 Замена игрока
                                    </button>
                                )}
                            </div>
                        </div>

                        {!t1.answerDone ? (
                            <button className="gs-btn gs-btn-black" onClick={handleTeam1Done}>
                                Завершить ответ →
                            </button>
                        ) : (
                            <button className="gs-btn gs-btn-black" onClick={startAnswer2}>
                                Команда БЕТА →
                            </button>
                        )}
                    </div>
                    <div className="gs-controls-bar">
                        <button className="gs-btn gs-btn-ghost-sm" onClick={fullReset}>↺ Сброс</button>
                    </div>
                </div>
            )}

            {/* ── ANSWER 2 ── */}
            {phase === 'answer_2' && (
                <div className="gs-main">
                    <div className="answer-area">
                        <div className="answer-team-label" style={{color: 'var(--raspberry)'}}>КОМАНДА БЕТА ОТВЕЧАЕТ
                        </div>

                        {t2.secretCard && <SecretBadge card={t2.secretCard}/>}

                        <div className="answer-cards-row">
                            <CardChip label="Персонаж" value={t2.card.character} color="var(--raspberry)"/>
                            <CardChip label="Место" value={t2.card.place} color="var(--raspberry)"/>
                            <CardChip label="Мнение" value={t2.card.opinion} color="var(--raspberry)"/>
                            {t2.material &&
                                <CardChip label="Материал" value={t2.material.text} color="var(--raspberry)"/>}
                        </div>

                        <div className="answer-timer-row">
                            <BigTimer seconds={ans2.left} total={t2.answerSeconds} paused={t2.answerPaused}
                                      color="var(--raspberry)"/>
                            <div className="answer-btns">
                                {!ans2Active && !t2.answerDone && (
                                    <button className="gs-btn gs-btn-black" onClick={() => { setAns2Active(true); ans2.reset(); }}>
                                        Запустить таймер
                                    </button>
                                )}
                                {!t2.answerDone && !t2.answerPaused && ans2Active && (
                                    <button className="gs-btn gs-btn-outline" onClick={() => pauseAnswer(2)}>⏸
                                        Пауза</button>
                                )}
                                {!t2.answerDone && t2.answerPaused && !p10Active && (
                                    <button className="gs-btn gs-btn-black" onClick={() => pauseAnswer(2)}>▶
                                        Продолжить</button>
                                )}
                                {t2.effect.canPause10s && !t2.pause10sUsed && !p10Active && (
                                    <button className="gs-btn gs-btn-yellow" onClick={() => trigger10sPause(2)}>⏱ Пауза
                                        10 сек</button>
                                )}
                                {p10Active && p10TeamRef.current === 2 && (
                                    <SmallTimer seconds={p10Left}/>
                                )}
                                {t2.effect.canSwapSpeaker && !t2.swapUsed && (
                                    <button className="gs-btn gs-btn-outline"
                                            onClick={() => setT2(s => ({...s, swapUsed: true}))}>
                                        🔄 Замена игрока
                                    </button>
                                )}
                            </div>
                        </div>

                        {!t2.answerDone ? (
                            <button className="gs-btn gs-btn-black" onClick={handleTeam2Done}>
                                Завершить ответ →
                            </button>
                        ) : (
                            <button className="gs-btn gs-btn-black" onClick={handleTeam2Done}>
                                Итоги раунда →
                            </button>
                        )}
                    </div>
                    <div className="gs-controls-bar">
                        <button className="gs-btn gs-btn-ghost-sm" onClick={fullReset}>↺ Сброс</button>
                    </div>
                </div>
            )}

            {/* ── ROUND SUMMARY ── */}
            {phase === 'round_summary' && difficulty && (
                <div className="gs-main">
                    <RoundSummary t1={t1} t2={t2} onNext={nextRound} onReset={fullReset}/>
                </div>
            )}
        </div>
    );
}
