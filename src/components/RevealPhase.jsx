import { useState, useEffect } from 'react';

export default function RevealPhase({ state, actions }) {
  const [revealed, setRevealed] = useState(false);
  const activeTeam = state.teams[state.activeTeam];

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const diff = Math.abs(state.guess - state.target);
  let scoreLabel, scoreEmoji, scoreClass;
  if (diff <= 3) { scoreLabel = 'BULLSEYE!'; scoreEmoji = '🎯'; scoreClass = 'bullseye'; }
  else if (diff <= 8) { scoreLabel = 'SO CLOSE!'; scoreEmoji = '🔥'; scoreClass = 'close'; }
  else if (diff <= 15) { scoreLabel = 'NICE TRY!'; scoreEmoji = '👍'; scoreClass = 'near'; }
  else { scoreLabel = 'MISSED!'; scoreEmoji = '😬'; scoreClass = 'miss'; }

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

      <div className="reveal-spectrum">
        <div className="spectrum-card-display">
          <div className="spectrum-label left">{state.currentCard.left}</div>
          <div className="spectrum-bar reveal-bar">
            <div className="spectrum-gradient"></div>
            
            {/* Target zone */}
            <div className="target-zone-overlay" style={{ left: `${state.target}%` }}>
              <div className="zone z4"></div>
              <div className="zone z3"></div>
              <div className="zone z2"></div>
            </div>

            {/* Guess marker */}
            <div className="reveal-guess-marker" style={{ left: `${state.guess}%` }}>
              <div className="marker-line"></div>
              <span className="marker-label guess-label">Guess</span>
            </div>

            {/* Target marker */}
            <div className={`reveal-target-marker ${revealed ? 'show' : ''}`} style={{ left: `${state.target}%` }}>
              <div className="marker-line target-line"></div>
              <span className="marker-label target-label">🎯 Target</span>
            </div>
          </div>
          <div className="spectrum-label right">{state.currentCard.right}</div>
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
