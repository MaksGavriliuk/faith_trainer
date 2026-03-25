import { useState } from 'react';
import type { ExtraMaterial } from '../types';
import './DrawModal.css';

const CATEGORY_LABELS = {
  fact:     { label: 'ФАКТ',     icon: '📊' },
  quote:    { label: 'ЦИТАТА',   icon: '💬' },
  scenario: { label: 'СЦЕНАРИЙ', icon: '🎭' },
};

interface Props {
  title: string;
  subtitle: string;
  onDraw: () => void;
  onSkip: () => void;
  drawnItem: ExtraMaterial | null;
  onConfirm: () => void;
  teamColor: string;
}

export default function ExtraMaterialModal({ title, subtitle, onDraw, onSkip, drawnItem, onConfirm, teamColor }: Props) {
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
              <span className="dm-btn-icon">📜</span>
              Вытянуть материал
            </button>
            <button className="dm-btn dm-btn--skip" onClick={onSkip}>
              Не нужно
            </button>
          </div>
        ) : (
          <div className={`dm-card-reveal dm-card-reveal--material ${flipped ? 'dm-card-reveal--flipped' : ''}`}>
            <div className="dm-card-back">
              <span className="dm-card-back-icon">📜</span>
            </div>
            <div className="dm-card-front dm-card-front--material">
              <div className="dm-material-category">
                <span>{CATEGORY_LABELS[drawnItem.category].icon}</span>
                <span>{CATEGORY_LABELS[drawnItem.category].label}</span>
              </div>
              <p className="dm-material-text">{drawnItem.text}</p>
            </div>
          </div>
        )}

        {drawnItem && flipped && (
          <button className="dm-btn dm-btn--confirm" onClick={onConfirm}>
            Запомнили, продолжить →
          </button>
        )}
      </div>
    </div>
  );
}
