import { useState } from 'react';
import type { Perk } from '../types';
import './DrawModal.css';

interface Props {
  title: string;
  subtitle: string;
  onDraw: () => void;
  onSkip: () => void;
  drawnItem: Perk | null;
  onConfirm: () => void;
  teamColor: string;
}

export default function PerkDrawModal({ title, subtitle, onDraw, onSkip, drawnItem, onConfirm, teamColor }: Props) {
  const [flipped, setFlipped] = useState(false);

  const handleDraw = () => {
    onDraw();
    setTimeout(() => setFlipped(true), 100);
  };

  return (
    <div className="draw-modal-overlay">
      <div className="draw-modal" style={{ '--modal-color': teamColor } as React.CSSProperties}>
        <div className="dm-header">
          <div className="dm-title">{title}</div>
          <div className="dm-subtitle">{subtitle}</div>
        </div>

        {!drawnItem ? (
          <div className="dm-actions">
            <button className="dm-btn dm-btn--draw" onClick={handleDraw}>
              <span className="dm-btn-icon">🎴</span>
              Вытянуть
            </button>
            <button className="dm-btn dm-btn--skip" onClick={onSkip}>
              Пропустить
            </button>
          </div>
        ) : (
          <div className={`dm-card-reveal ${flipped ? 'dm-card-reveal--flipped' : ''}`}>
            <div className="dm-card-back">
              <span className="dm-card-back-icon">?</span>
            </div>
            <div className={`dm-card-front ${drawnItem.positive ? 'dm-card-front--positive' : 'dm-card-front--negative'}`}>
              <div className="dm-card-emoji">{drawnItem.emoji}</div>
              <div className="dm-card-name">{drawnItem.name}</div>
              <div className="dm-card-desc">{drawnItem.description}</div>
              <div className={`dm-card-badge ${drawnItem.positive ? 'positive' : 'negative'}`}>
                {drawnItem.positive ? '✦ БОНУС' : '✦ ШТРАФ'}
              </div>
            </div>
          </div>
        )}

        {drawnItem && flipped && (
          <button className="dm-btn dm-btn--confirm" onClick={onConfirm}>
            Принять и продолжить →
          </button>
        )}
      </div>
    </div>
  );
}
