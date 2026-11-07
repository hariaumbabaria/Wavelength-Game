import { useState } from 'react';
import WavelengthDial from './WavelengthDial';

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

      <div className="target-reveal-section">
        {!showTarget ? (
          <div className="shutter-closed-panel">
            <div className="closed-spectrum-preview">
              <div className="spectrum-card-display">
                <div className="spectrum-label left">{state.currentCard.left}</div>
                <div className="spectrum-bar">
                  <div className="spectrum-gradient"></div>
                </div>
                <div className="spectrum-label right">{state.currentCard.right}</div>
              </div>
            </div>
            <p className="instruction">
              Only the Psychic should look! Click to open the screen and see the secret target.
            </p>
            <button className="reveal-target-btn" onClick={() => setShowTarget(true)}>
              👁️ Open Screen (Psychic Only!)
            </button>
          </div>
        ) : (
          <div className="target-preview-dial">
            <p className="instruction">
              🎯 The target location is revealed on the dial! Think of a clue to guide your team:
            </p>

            <WavelengthDial
              target={state.target}
              showTarget={true}
              showNeedle={false}
              interactive={false}
              leftLabel={state.currentCard.left}
              rightLabel={state.currentCard.right}
            />

            <form onSubmit={handleSubmit} className="clue-form">
              <div className="clue-input-wrapper">
                <input
                  type="text"
                  value={clue}
                  onChange={e => setClue(e.target.value)}
                  placeholder="Enter your clue..."
                  className="clue-input"
                  autoFocus
                  maxLength={60}
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
