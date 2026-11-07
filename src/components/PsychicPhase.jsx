import { useState } from 'react';

export default function PsychicPhase({ state, actions }) {
  const [clue, setClue] = useState('');
  const [showTarget, setShowTarget] = useState(false);

  const team = state.teams[state.activeTeam];
  const psychicName = team.players.length > 0
    ? team.players[state.psychicIndex[state.activeTeam]]
    : 'The Psychic';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (clue.trim()) {
      actions.submitClue(clue.trim());
    }
  };

  return (
    <div className="phase-container psychic-phase">
      <div className="phase-header">
        <div className="round-badge">
          Round {state.currentRound}/{state.totalRounds}
        </div>
        <div className={`team-indicator team-${state.activeTeam}`}>
          {state.activeTeam === 'A' ? '🔴' : '🔵'} {team.name}'s Turn
        </div>
      </div>

      <div className="psychic-info">
        <div className="psychic-avatar">🔮</div>
        <h2>{psychicName}</h2>
        <p>You are the Psychic this round!</p>
      </div>

      <div className="spectrum-card-display">
        <div className="spectrum-label left">{state.currentCard.left}</div>
        <div className="spectrum-bar">
          <div className="spectrum-gradient"></div>
        </div>
        <div className="spectrum-label right">{state.currentCard.right}</div>
      </div>

      <div className="target-reveal-section">
        <p className="instruction">
          {showTarget
            ? "See where the target is? Give a clue to help your team guess!"
            : "Only the Psychic should look! Click to reveal the target."}
        </p>
        
        {!showTarget ? (
          <button className="reveal-target-btn" onClick={() => setShowTarget(true)}>
            👁️ Reveal Target (Psychic Only!)
          </button>
        ) : (
          <div className="target-preview">
            <div className="mini-spectrum">
              <div className="mini-gradient"></div>
              <div
                className="mini-target-marker"
                style={{ left: `${state.target}%` }}
              >
                <div className="target-zone zone-4" style={{ width: '6%' }}></div>
                <div className="target-zone zone-3" style={{ width: '16%' }}></div>
                <div className="target-zone zone-2" style={{ width: '30%' }}></div>
                <div className="target-pin">🎯</div>
              </div>
            </div>
            <div className="target-labels">
              <span>{state.currentCard.left}</span>
              <span>{state.currentCard.right}</span>
            </div>

            <form onSubmit={handleSubmit} className="clue-form">
              <div className="clue-input-wrapper">
                <input
                  type="text"
                  value={clue}
                  onChange={e => setClue(e.target.value)}
                  placeholder="Enter your clue..."
                  className="clue-input"
                  autoFocus
                  maxLength={50}
                />
                <button type="submit" className="submit-clue-btn" disabled={!clue.trim()}>
                  Give Clue →
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

