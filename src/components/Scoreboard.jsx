import { useState } from 'react';
import { isSoundEnabled, toggleSound } from '../utils/soundEffects';

export default function Scoreboard({ teams }) {
  const [soundOn, setSoundOn] = useState(isSoundEnabled());

  const handleToggle = () => {
    const newState = toggleSound();
    setSoundOn(newState);
  };

  return (
    <div className="scoreboard">
      <div className="scoreboard-item team-A">
        <span className="sb-icon">🔴</span>
        <span className="sb-name">{teams.A.name}</span>
        <span className="sb-score">{teams.A.score}</span>
      </div>
      <div className="scoreboard-divider">|</div>
      <div className="scoreboard-item team-B">
        <span className="sb-icon">🔵</span>
        <span className="sb-name">{teams.B.name}</span>
        <span className="sb-score">{teams.B.score}</span>
      </div>
      <button
        type="button"
        className="sound-toggle-btn"
        onClick={handleToggle}
        title={soundOn ? 'Mute sound effects' : 'Enable sound effects'}
      >
        {soundOn ? '🔊' : '🔇'}
      </button>
    </div>
  );
}
