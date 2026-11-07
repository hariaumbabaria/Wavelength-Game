import WavelengthDial from './WavelengthDial';
import { playTick, playLock } from '../utils/soundEffects';

export default function GuessingPhase({ state, actions }) {
  const team = state.teams[state.activeTeam];

  const handleNudge = (delta) => {
    playTick();
    actions.setGuess(state.guess + delta);
  };

  const handleLock = () => {
    playLock();
    actions.lockGuess();
  };

  return (
    <div className="phase-container guessing-phase">
      <div className="phase-header">
        <div className="round-badge">Round {state.currentRound}/{state.totalRounds}</div>
        <div className={`team-indicator team-${state.activeTeam}`}>
          {state.activeTeam === 'A' ? '🔴' : '🔵'} {team.name}'s Turn
        </div>
      </div>

      <div className="spoken-clue-banner">
        <div className="speaker-icon">🗣️</div>
        <div className="spoken-clue-text">
          <h3>Listen to the Psychic's Spoken Clue!</h3>
          <p>Discuss with your team and drag the needle to where you think the target is.</p>
        </div>
      </div>

      <div className="dial-section">
        <WavelengthDial
          guess={state.guess}
          showTarget={false}
          showNeedle={true}
          interactive={true}
          onGuessChange={actions.setGuess}
          leftLabel={state.currentCard.left}
          rightLabel={state.currentCard.right}
        />

        {/* Quick fine-tune controls */}
        <div className="dial-controls">
          <button
            type="button"
            className="nudge-btn"
            onClick={() => handleNudge(-5)}
            title="Move 5% left"
          >
            « -5%
          </button>
          <button
            type="button"
            className="nudge-btn"
            onClick={() => handleNudge(-1)}
            title="Move 1% left"
          >
            ‹ -1%
          </button>
          <span className="current-guess-text">{state.guess}%</span>
          <button
            type="button"
            className="nudge-btn"
            onClick={() => handleNudge(1)}
            title="Move 1% right"
          >
            +1% ›
          </button>
          <button
            type="button"
            className="nudge-btn"
            onClick={() => handleNudge(5)}
            title="Move 5% right"
          >
            +5% »
          </button>
        </div>
      </div>

      <p className="instruction">
        🖱️ Click or drag the dial to aim the needle, or use the fine-tune buttons above!
      </p>

      <button className="lock-btn" onClick={handleLock}>
        🔒 Lock In Guess
      </button>
    </div>
  );
}
