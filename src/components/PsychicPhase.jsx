import { useState } from 'react';
import WavelengthDial from './WavelengthDial';
import { playReveal, playLock } from '../utils/soundEffects';

export default function PsychicPhase({ state, actions }) {
  const [showTarget, setShowTarget] = useState(false);

  const team = state.teams[state.activeTeam];
  const psychicName = team.players.length > 0
    ? team.players[state.psychicIndex[state.activeTeam]]
    : 'The Psychic';

  const handleOpenScreen = () => {
    playReveal();
    setShowTarget(true);
  };

  const handleClueGiven = () => {
    playLock();
    actions.startGuessing();
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
              Only the Psychic should look! Click below to open the screen and view the secret target.
            </p>
            <button className="reveal-target-btn" onClick={handleOpenScreen}>
              👁️ Open Screen (Psychic Only!)
            </button>
          </div>
        ) : (
          <div className="target-preview-dial">

            <WavelengthDial
              target={state.target}
              showTarget={true}
              showNeedle={false}
              interactive={false}
              leftLabel={state.currentCard.left}
              rightLabel={state.currentCard.right}
            />

            <div className="clue-action-box">
              <button
                type="button"
                className="start-guessing-btn"
                onClick={handleClueGiven}
              >
                🗣️ Let Your Team Guess! →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
