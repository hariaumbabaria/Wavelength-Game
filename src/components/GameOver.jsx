export default function GameOver({ state, actions }) {
  const teamA = state.teams.A;
  const teamB = state.teams.B;
  const winner = teamA.score > teamB.score ? 'A' : teamB.score > teamA.score ? 'B' : 'TIE';

  return (
    <div className="phase-container gameover-phase">
      <div className="gameover-header">
        {winner === 'TIE' ? (
          <>
            <div className="trophy">🤝</div>
            <h1>It's a Tie!</h1>
          </>
        ) : (
          <>
            <div className="trophy">🏆</div>
            <h1>{state.teams[winner].name} Wins!</h1>
            <div className="confetti-burst">🎉🎊🥳</div>
          </>
        )}
      </div>

      <div className="final-scores">
        <div className={`final-score-card ${winner === 'A' ? 'winner' : ''}`}>
          <span className="final-team-icon">🔴</span>
          <span className="final-team-name">{teamA.name}</span>
          <span className="final-team-score">{teamA.score}</span>
        </div>
        <div className="vs-text">VS</div>
        <div className={`final-score-card ${winner === 'B' ? 'winner' : ''}`}>
          <span className="final-team-icon">🔵</span>
          <span className="final-team-name">{teamB.name}</span>
          <span className="final-team-score">{teamB.score}</span>
        </div>
      </div>

      {state.history.length > 0 && (
        <div className="history-section">
          <h3>📜 Game History</h3>
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Round</th>
                  <th>Team</th>
                  <th>Spectrum</th>
                  <th>Clue</th>
                  <th>Target</th>
                  <th>Guess</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {state.history.map((h, i) => (
                  <tr key={i}>
                    <td>{h.round}</td>
                    <td>{h.team}</td>
                    <td className="spectrum-cell">{h.card.left} ↔ {h.card.right}</td>
                    <td className="clue-cell">"{h.clue}"</td>
                    <td>{h.target}%</td>
                    <td>{h.guess}%</td>
                    <td className="score-cell">+{h.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="gameover-actions">
        <button className="play-again-btn" onClick={actions.resetGame}>
          🔄 Play Again
        </button>
      </div>
    </div>
  );
}

