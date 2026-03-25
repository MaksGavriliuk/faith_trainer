import {useNavigate} from 'react-router-dom';
import './StartScreen.css';

export default function StartScreen() {
    const navigate = useNavigate();
    return (
        <div className="start">
            <div className="start-accent-bar"/>
            <div className="start-inner">
                <div className="start-label">КОМАНДНАЯ ИГРА</div>
                <h1 className="start-title">
                    ВЕРА<span className="start-title-accent">ТРЕНАЖЕР</span>
                </h1>
                <p className="start-desc">Тренировка навыков евангелизации в игровом формате</p>
                <button className="start-btn" onClick={() => navigate('/game')}>
                    Начать игру
                </button>
                <div className="start-meta">2 команды · 3 уровня · секретные карточки</div>
            </div>
            <div className="start-yellow-block"/>
        </div>
    );
}
