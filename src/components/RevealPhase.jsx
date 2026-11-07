import { useState, useEffect } from 'react';
import WavelengthDial from './WavelengthDial';

export default function RevealPhase({ state, actions }) {
  const [revealed, setRevealed] = useState(false);
  const activeTeam = state.teams[state.activeTeam];

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const diff = Math.abs(state.guess - state.target);
  let scoreLabel, scoreEmoji, scoreClass;
  if (diff <= 3) {
    scoreLabel = 'BULLSEYE!';
    scoreEmoji = '🎯';
    scoreClass = 'bullseye';
  } else if (diff <= 8) {
    scoreLabel = 'SO CLOSE!';
    scoreEmoji = '🔥';
    scoreClass = 'close';
  } else if (diff <= 15) {
    scoreLabel = 'NICE TRY!';
    scoreEmoji = '👍';
    scoreClass = 'near';
  } else {
    scoreLabel = 'MISSED!';
    scoreEmoji = '😬';
    scoreClass = 'miss';
  }

  return (
    <div className="phase-container reveal-phase">
      <div className="phase-header">
        <div className="round-badge">Round {state.currentRound}/{state.totalRounds}</div>
        <div className={`team-indicator team-${state.activeTeam}`}>
          {state.activeTeam === 'A' ? '🔴' : '🔵'} {activeTeam.name}
        </div>
      </div>

      <div className={`reveal-result ${scoreClass} ${revealed ? 'revealed' : ''}`}>
        <div className="result-emoji">{scoreEmoji}</div>
        <h2 className="result-label">{scoreLabel}</h2>
        <div className="result-points">+{state.roundScore} points for {activeTeam.name}</div>
      </div>

      <div className="dial-section reveal-dial-section">
        <WavelengthDial
          target={state.target}
          guess={state.guess}
          showTarget={revealed}
          showNeedle={true}
          interactive={false}
          leftLabel={state.currentCard.left}
          rightLabel={state.currentCard.right}
        />

        <div className="reveal-stats">
          <div className="stat-pill">
            <span className="stat-label">Guess</span>
            <span className="stat-val">{state.guess}%</span>
          </div>
          <div className="stat-pill target-pill">
            <span className="stat-label">Target</span>
            <span className="stat-val">{state.target}%</span>
          </div>
          <div className="stat-pill">
            <span className="stat-label">Difference</span>
            <span className="stat-val">{diff}%</span>
          </div>
        </div>

        <div className="clue-recall">
          Clue: <strong>"{state.clue}"</strong>
        </div>
      </div>

      <div className="scoreboard-mini">
        <div className="score-item team-A">
          <span className="score-team">🔴 {state.teams.A.name}</span>
          <span className="score-val">{state.teams.A.score}</span>
        </div>
        <div className="score-item team-B">
          <span className="score-team">🔵 {state.teams.B.name}</span>
          <span className="score-val">{state.teams.B.score}</span>
        </div>
      </div>

      <button className="next-btn" onClick={actions.nextRound}>
        {state.currentRound >= state.totalRounds && state.activeTeam === 'B'
          ? '🏆 See Final Results'
          : '➡️ Next Turn'}
      </button>
    </div>
  );
}
