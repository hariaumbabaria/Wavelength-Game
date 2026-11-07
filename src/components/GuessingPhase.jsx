import WavelengthDial from './WavelengthDial';

export default function GuessingPhase({ state, actions }) {
  const team = state.teams[state.activeTeam];

  return (
    <div className="phase-container guessing-phase">
      <div className="phase-header">
        <div className="round-badge">Round {state.currentRound}/{state.totalRounds}</div>
        <div className={`team-indicator team-${state.activeTeam}`}>
          {state.activeTeam === 'A' ? '🔴' : '🔵'} {team.name}'s Turn
        </div>
      </div>

      <div className="clue-display">
        <span className="clue-label">The clue is:</span>
        <span className="clue-word">"{state.clue}"</span>
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
            onClick={() => actions.setGuess(state.guess - 5)}
            title="Move 5% left"
          >
            « -5%
          </button>
          <button
            type="button"
            className="nudge-btn"
            onClick={() => actions.setGuess(state.guess - 1)}
            title="Move 1% left"
          >
            ‹ -1%
          </button>
          <span className="current-guess-text">{state.guess}%</span>
          <button
            type="button"
            className="nudge-btn"
            onClick={() => actions.setGuess(state.guess + 1)}
            title="Move 1% right"
          >
            +1% ›
          </button>
          <button
            type="button"
            className="nudge-btn"
            onClick={() => actions.setGuess(state.guess + 5)}
            title="Move 5% right"
          >
            +5% »
          </button>
        </div>
      </div>

      <p className="instruction">
        🖱️ Click or drag the dial to aim the needle, or use buttons above!
      </p>

      <button className="lock-btn" onClick={actions.lockGuess}>
        🔒 Lock In Guess
      </button>
    </div>
  );
}
